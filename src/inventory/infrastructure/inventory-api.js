import http from '@/shared/infrastructure/http-common.js'

// El API guarda los datos en inglés (/inventories, /suppliers).
// Aquí se traducen al formato que usan las entidades del inventario.

export class InventoryApi {
    static async getInventarios() {
        const response = await http.get('/inventories')
        return response.data.map(i => ({
            id_inventario: String(i.id),
            id_producto: String(i.productId),
            stock_actual: i.currentStock,
            umbral_minimo: i.minimumStock,
            ultima_actualizacion: i.lastUpdated
        }))
    }

    // Las alertas se calculan con el stock actual (US16):
    // stock menor o igual al mínimo = Crítico, hasta 50% por encima del mínimo = Bajo
    static async getAlertasStock() {
        const inventarios = await this.getInventarios()
        return inventarios
            .filter(i => i.stock_actual <= i.umbral_minimo * 1.5)
            .map(i => ({
                id_alerta: i.id_inventario,
                id_producto: i.id_producto,
                nivel_alerta: i.stock_actual <= i.umbral_minimo ? 'Crítico' : 'Bajo',
                estado_activacion: true,
                fecha_creacion: i.ultima_actualizacion
            }))
    }

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
