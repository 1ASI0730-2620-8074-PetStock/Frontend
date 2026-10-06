import http from '@/shared/infrastructure/http-common.js'

export class InventoryApi {
    static async getInventarios() {
        const response = await http.get('/inventory')
        return response.data.inventarios
    }

    static async getAlertasStock() {
        const response = await http.get('/inventory')
        return response.data.alertas_stock
    }
}