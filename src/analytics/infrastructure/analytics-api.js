import http from '@/shared/infrastructure/http-common.js';

export class AnalyticsApi {
    static async getDashboardData() {
        const [
            salesResponse,
            productsResponse,
            categoriesResponse,
            inventoriesResponse
        ] = await Promise.all([
            http.get('/sales'),
            http.get('/products'),
            http.get('/categories'),
            http.get('/inventories')
        ]);

        return {
            sales: salesResponse.data,
            products: productsResponse.data,
            categories: categoriesResponse.data,
            inventories: inventoriesResponse.data
        };
    }
}