import http from '@/shared/infrastructure/http-common.js'

export class CatalogApi {
    static async getProductos() {
        const response = await http.get('/products')
        return response.data
    }

    static async getCategorias() {
        const response = await http.get('/categories')
        return response.data
    }

    static async createProducto(nuevoProducto) {
        const response = await http.post('/products', nuevoProducto)
        return response.data
    }
}