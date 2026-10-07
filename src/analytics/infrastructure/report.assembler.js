import { Report } from "../domain/model/report.entity.js";

const WEEK_DAYS = [
    { key: 1, label: "Lun" },
    { key: 2, label: "Mar" },
    { key: 3, label: "Mié" },
    { key: 4, label: "Jue" },
    { key: 5, label: "Vie" },
    { key: 6, label: "Sáb" },
    { key: 0, label: "Dom" }
];

function parseSaleDate(value) {
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

function getSaleItems(sale) {
    if (Array.isArray(sale.items) && sale.items.length) {
        return sale.items.map(item => ({
            productId: String(item.productId),
            quantity: Number(item.quantity || 0)
        }));
    }

    if (sale.productId != null) {
        return [{
            productId: String(sale.productId),
            quantity: Number(sale.quantity || 0)
        }];
    }

    return [];
}

function isSameDate(date, referenceDate) {
    return date.getFullYear() === referenceDate.getFullYear()
        && date.getMonth() === referenceDate.getMonth()
        && date.getDate() === referenceDate.getDate();
}

function isSameMonth(date, referenceDate) {
    return date.getFullYear() === referenceDate.getFullYear()
        && date.getMonth() === referenceDate.getMonth();
}

function getStartOfWeek(date) {
    const start = new Date(date);
    const day = start.getDay();
    const difference = day === 0 ? -6 : 1 - day;

    start.setDate(start.getDate() + difference);
    start.setHours(0, 0, 0, 0);

    return start;
}

function getEndOfWeek(date) {
    const end = new Date(getStartOfWeek(date));
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return end;
}

function isInsideCurrentWeek(date, referenceDate) {
    const start = getStartOfWeek(referenceDate);
    const end = getEndOfWeek(referenceDate);

    return date >= start && date <= end;
}

export class ReportAssembler {
    static toEntityFromResource(resource = {}) {
        const sales = Array.isArray(resource.sales)
            ? resource.sales
            : [];

        const products = Array.isArray(resource.products)
            ? resource.products
            : [];

        const categories = Array.isArray(resource.categories)
            ? resource.categories
            : [];

        const inventories = Array.isArray(resource.inventories)
            ? resource.inventories
            : [];

        const now = new Date();

        const normalizedSales = sales
            .map(sale => ({
                ...sale,
                parsedDate: parseSaleDate(sale.date)
            }))
            .filter(sale => sale.parsedDate);

        const todaySales = normalizedSales.filter(sale =>
            isSameDate(sale.parsedDate, now)
        );

        const monthlySales = normalizedSales.filter(sale =>
            isSameMonth(sale.parsedDate, now)
        );

        const weeklySalesRecords = normalizedSales.filter(sale =>
            isInsideCurrentWeek(sale.parsedDate, now)
        );

        const productSales = new Map();

        normalizedSales.forEach(sale => {
            const items = getSaleItems(sale);

            items.forEach(item => {
                if (!item.productId) return;

                const currentQuantity =
                    productSales.get(item.productId) || 0;

                productSales.set(
                    item.productId,
                    currentQuantity + item.quantity
                );
            });
        });

        const inventoryByProduct = new Map(
            inventories.map(inventory => [
                String(inventory.productId),
                inventory
            ])
        );

        const weeklySales = WEEK_DAYS.map(day => {
            const amount = weeklySalesRecords
                .filter(sale => sale.parsedDate.getDay() === day.key)
                .reduce(
                    (total, sale) =>
                        total + Number(sale.total || 0),
                    0
                );

            return {
                day: day.label,
                amount,
                isPeak: false
            };
        });

        const peakIndex = weeklySales.reduce(
            (highestIndex, current, index, array) => {
                if (current.amount > array[highestIndex].amount) {
                    return index;
                }

                return highestIndex;
            },
            0
        );

        if (
            weeklySales.length > 0 &&
            weeklySales[peakIndex].amount > 0
        ) {
            weeklySales[peakIndex].isPeak = true;
        }

        const topProducts = products
            .filter(product => product.active !== false)
            .map(product => ({
                id: product.id,
                name: product.name,
                subtitle: product.description || "",
                quantity:
                    productSales.get(String(product.id)) || 0
            }))
            .sort((a, b) => {
                if (b.quantity !== a.quantity) {
                    return b.quantity - a.quantity;
                }

                return a.name.localeCompare(b.name);
            })
            .slice(0, 3);

        const lowMovementProducts = products
            .filter(product => product.active !== false)
            .map(product => {
                const inventory = inventoryByProduct.get(
                    String(product.id)
                );

                return {
                    id: product.id,
                    name: product.name,
                    stock: Number(
                        inventory?.currentStock || 0
                    ),
                    quantity:
                        productSales.get(String(product.id)) || 0
                };
            })
            .sort((a, b) => {
                if (a.quantity !== b.quantity) {
                    return a.quantity - b.quantity;
                }

                return a.stock - b.stock;
            })
            .slice(0, 3);

        const totalStock = inventories.reduce(
            (total, inventory) =>
                total + Number(inventory.currentStock || 0),
            0
        );

        const salesToday = todaySales.reduce(
            (total, sale) =>
                total + Number(sale.total || 0),
            0
        );

        const monthlyIncome = monthlySales.reduce(
            (total, sale) =>
                total + Number(sale.total || 0),
            0
        );

        const availableProducts = products.filter(
            product => product.active !== false
        ).length;

        return new Report({
            metrics: {
                totalStock,
                salesToday,
                monthlyIncome,
                availableProducts,
                categories: categories.length
            },
            weeklySales,
            topProducts,
            lowMovementProducts
        });
    }
}