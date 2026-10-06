import { Report } from '../domain/model/report.entity.js';

const WEEK_DAYS = [
    { key: 1, label: 'Lun' },
    { key: 2, label: 'Mar' },
    { key: 3, label: 'Mié' },
    { key: 4, label: 'Jue' },
    { key: 5, label: 'Vie' },
    { key: 6, label: 'Sáb' },
    { key: 0, label: 'Dom' }
];

export class ReportAssembler {
    static toEntityFromResource(resource = {}) {
        const sales = Array.isArray(resource.sales) ? resource.sales : [];
        const products = Array.isArray(resource.products) ? resource.products : [];
        const categories = Array.isArray(resource.categories) ? resource.categories : [];
        const inventories = Array.isArray(resource.inventories) ? resource.inventories : [];

        const now = new Date();

        const todaySales = sales.filter(sale => {
            const date = new Date(sale.date);

            return date.getFullYear() === now.getFullYear()
                && date.getMonth() === now.getMonth()
                && date.getDate() === now.getDate();
        });

        const monthlySales = sales.filter(sale => {
            const date = new Date(sale.date);

            return date.getFullYear() === now.getFullYear()
                && date.getMonth() === now.getMonth();
        });

        const productSales = new Map();

        sales.forEach(sale => {
            const items = Array.isArray(sale.items) ? sale.items : [];

            items.forEach(item => {
                const productId = Number(item.productId);
                const quantity = Number(item.quantity || 0);

                productSales.set(
                    productId,
                    (productSales.get(productId) || 0) + quantity
                );
            });
        });

        const inventoryByProduct = new Map(
            inventories.map(inventory => [
                Number(inventory.productId),
                inventory
            ])
        );

        const weeklySales = WEEK_DAYS.map(day => ({
            day: day.label,
            amount: sales
                .filter(sale => new Date(sale.date).getDay() === day.key)
                .reduce((total, sale) => total + Number(sale.total || 0), 0),
            isPeak: false
        }));

        const peakAmount = Math.max(
            ...weeklySales.map(item => item.amount),
            0
        );

        weeklySales.forEach(item => {
            item.isPeak = item.amount === peakAmount && peakAmount > 0;
        });

        const topProducts = products
            .map(product => ({
                id: product.id,
                name: product.name,
                subtitle: product.description,
                quantity: productSales.get(Number(product.id)) || 0
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 3);


        const lowMovementProducts = products
            .map(product => {
                const inventory = inventoryByProduct.get(Number(product.id));

                return {
                    id: product.id,
                    name: product.name,
                    stock: Number(inventory?.currentStock || 0),
                    quantity: productSales.get(Number(product.id)) || 0
                };
            })
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 3);

        return new Report({
            metrics: {
                totalStock: inventories.reduce(
                    (total, inventory) =>
                        total + Number(inventory.currentStock || 0),
                    0
                ),
                salesToday: todaySales.reduce(
                    (total, sale) => total + Number(sale.total || 0),
                    0
                ),
                monthlyIncome: monthlySales.reduce(
                    (total, sale) => total + Number(sale.total || 0),
                    0
                ),
                availableProducts: products.filter(product => product.active).length,
                categories: categories.length
            },
            weeklySales,
            topProducts,
            lowMovementProducts
        });
    }
}