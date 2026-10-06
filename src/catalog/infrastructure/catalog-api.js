import http from '@/shared/infrastructure/http-common.js'

export class CatalogApi {
    static async getProductos() {
        const response = await http.get('/catalog')
        return response.data.productos
    }

    static async getCategorias() {
        const response = await http.get('/catalog')
        return response.data.categorias
    }

    static async createProducto(nuevoProducto) {
        const response = await http.get('/catalog')
        const catalog = response.data

        const nuevoId = Math.max(...catalog.productos.map(p => p.id_producto), 100) + 1
        const productoConId = { ...nuevoProducto, id_producto: nuevoId }

        catalog.productos.push(productoConId)

        await http.patch('/catalog', { productos: catalog.productos })
        return productoConId
    }
}