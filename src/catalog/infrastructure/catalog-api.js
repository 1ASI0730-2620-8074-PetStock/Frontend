import http from '@/shared/infrastructure/http-common.js'

// Los ids se convierten a texto para que las comparaciones (===) siempre funcionen
function toProductResource(product) {
    return {
        ...product,
        id: String(product.id),
        categoryId: String(product.categoryId),
        supplierId: product.supplierId == null ? null : String(product.supplierId)
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
        const price = Number(nuevoProducto.precio_base)
        const minimumStock = Number(nuevoProducto.stock_minimo)
        if (!nuevoProducto.nombre?.trim() || !nuevoProducto.id_categoria ||
            !Number.isFinite(price) || price <= 0 ||
            !Number.isInteger(minimumStock) || minimumStock < 0) {
            throw new Error('Los datos del producto no son válidos.')
        }

        // 1. Se registra el producto en el catálogo
        const productResponse = await http.post('/products', {
            name: nuevoProducto.nombre.trim(),
            description: nuevoProducto.descripcion,
            price,
            categoryId: nuevoProducto.id_categoria,
            supplierId: nuevoProducto.id_proveedor || null,
            active: nuevoProducto.activo
        })

        try {
            await http.post('/inventories', {
                productId: productResponse.data.id,
                currentStock: 0,
                minimumStock,
                lastUpdated: new Date().toISOString()
            })
        } catch (error) {
            try {
                await http.delete(`/products/${productResponse.data.id}`)
            } catch (rollbackError) {
                console.error('No se pudo eliminar el producto después de fallar la creación del inventario:', rollbackError)
            }
            throw error
        }

        return toProductResource(productResponse.data)
    }
}
