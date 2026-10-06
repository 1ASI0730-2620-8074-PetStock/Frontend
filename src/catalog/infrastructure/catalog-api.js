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
}