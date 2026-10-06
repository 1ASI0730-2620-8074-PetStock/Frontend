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

    static async getProveedores() {
        const response = await http.get('/inventory')
        return response.data.proveedores
    }
    static async createProveedor(nuevoProveedor) {
        const response = await http.get('/inventory')
        const inventory = response.data

        const nuevoId = Math.max(...inventory.proveedores.map(p => p.id_proveedor), 0) + 1
        const proveedorConId = { ...nuevoProveedor, id_proveedor: nuevoId }

        inventory.proveedores.push(proveedorConId)

        await http.patch('/inventory', { proveedores: inventory.proveedores })
        return proveedorConId
    }
}