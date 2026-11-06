import http from '@/shared/infrastructure/http-common.js'

export class InventoryApi {
    static async getInventarios() {
        const response = await http.get('/inventories')
        // productId como texto, igual que el id de los productos
        return response.data.map(i => ({ ...i, productId: String(i.productId) }))
    }

    static async updateStockThreshold(productId, minimumStock) {
        const value = Number(minimumStock)
        if (!Number.isInteger(value) || value < 0) {
            throw new Error('El stock mínimo debe ser un número entero igual o mayor que cero.')
        }

        const inventory = await http.get('/inventories')
        const record = inventory.data.find(item => String(item.productId) === String(productId))
        if (!record) {
            throw new Error('No se encontró el inventario del producto.')
        }

        const response = await http.patch(`/inventories/${record.id}`, {
            minimumStock: value,
            lastUpdated: new Date().toISOString()
        })
        return { ...response.data, productId: String(response.data.productId) }
    }

    // Las alertas se calculan con el stock actual (US16):
    // stock menor o igual al mínimo = critical, hasta 50% por encima del mínimo = low
    static async getAlertasStock() {
        const inventarios = await this.getInventarios()
        return inventarios
            .filter(i => i.currentStock <= i.minimumStock * 1.5)
            .map(i => ({
                id: i.id,
                productId: i.productId,
                level: i.currentStock <= i.minimumStock ? 'critical' : 'low',
                active: true,
                createdAt: i.lastUpdated
            }))
    }

    // El formulario de producto usa id_proveedor y nombre_empresa en su selector
    static async getProveedores() {
        const response = await http.get('/suppliers')
        return response.data.map(s => ({
            id_proveedor: String(s.id),
            nombre_empresa: s.companyName,
            contacto_nombre: s.contactName,
            telefono: s.phone,
            correo: s.email
        }))
    }

    static async createProveedor(nuevoProveedor) {
        const response = await http.post('/suppliers', {
            companyName: nuevoProveedor.nombre_empresa,
            contactName: nuevoProveedor.contacto_nombre,
            phone: nuevoProveedor.telefono,
            email: nuevoProveedor.correo
        })
        const s = response.data
        return {
            id_proveedor: String(s.id),
            nombre_empresa: s.companyName,
            contacto_nombre: s.contactName,
            telefono: s.phone,
            correo: s.email
        }
    }
}
