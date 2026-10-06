export class Report {
    constructor({
                    metrics = {},
                    weeklySales = [],
                    topProducts = [],
                    lowMovementProducts = []
                } = {}) {
        this.metrics = {
            totalStock: Number(metrics.totalStock ?? 0),
            salesToday: Number(metrics.salesToday ?? 0),
            monthlyIncome: Number(metrics.monthlyIncome ?? 0),
            availableProducts: Number(metrics.availableProducts ?? 0),
            categories: Number(metrics.categories ?? 0)
        };

        this.weeklySales = Array.isArray(weeklySales) ? weeklySales : [];
        this.topProducts = Array.isArray(topProducts) ? topProducts : [];
        this.lowMovementProducts = Array.isArray(lowMovementProducts)
            ? lowMovementProducts
            : [];
    }
}