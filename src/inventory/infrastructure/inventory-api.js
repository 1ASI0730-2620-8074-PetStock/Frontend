import http from '@/shared/infrastructure/http-common.js'

export class InventoryApi {
    static async getInventarios() {
        const response = await http.get('/inventories')
        return response.data
    }

    static async getAlertasStock() {
        const response = await http.get('/stock-alerts')
        return response.data
    }

    static async getProveedores() {
        const response = await http.get('/suppliers')
        return response.data
    }

    static async createProveedor(nuevoProveedor) {
        const response = await http.post('/suppliers', nuevoProveedor)
        return response.data
    }
}