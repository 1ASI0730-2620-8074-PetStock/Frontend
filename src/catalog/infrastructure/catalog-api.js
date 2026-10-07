import http from '@/shared/infrastructure/http-common.js'

// Los ids se convierten a texto para que las comparaciones (===) siempre funcionen
function toProductResource(product) {
    return {
        ...product,
        id: String(product.id),
        categoryId: String(product.categoryId),
        supplierId: String(product.supplierId)
    }
}

export class CatalogApi {
    static async getProductos() {
        const response = await http.get('/products')
        return response.data.map(toProductResource)
    }

    static async getCategorias() {
        const response = await http.get('/categories')
        return response.data.map(c => ({ ...c, id: String(c.id) }))
    }

    // El formulario envía los campos en español; aquí se guardan en inglés
    static async createProducto(nuevoProducto) {
        // 1. Se registra el producto en el catálogo
        const productResponse = await http.post('/products', {
            name: nuevoProducto.nombre,
            description: nuevoProducto.descripcion,
            price: Number(nuevoProducto.precio_base),
            categoryId: nuevoProducto.id_categoria,
            supplierId: nuevoProducto.id_proveedor,
            active: nuevoProducto.activo
        })

        // 2. Se registra su stock en el inventario (con el id que generó el API)
        await http.post('/inventories', {
            productId: productResponse.data.id,
            currentStock: Number(nuevoProducto.stock_actual),
            minimumStock: Number(nuevoProducto.stock_minimo),
            lastUpdated: new Date().toISOString()
        })

        return toProductResource(productResponse.data)
    }
}
