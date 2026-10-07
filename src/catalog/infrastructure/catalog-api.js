import http from '@/shared/infrastructure/http-common.js'

// El API guarda los datos en inglés (/products, /categories, /inventories).
// Aquí se traducen al formato que usan las entidades del catálogo.

function toProductoResource(product, inventory) {
    return {
        id_producto: String(product.id),
        nombre: product.name,
        descripcion: product.description,
        precio_base: product.price,
        stock_actual: inventory ? inventory.currentStock : 0,
        id_categoria: String(product.categoryId),
        id_proveedor: String(product.supplierId)
    }
}

export class CatalogApi {
    static async getProductos() {
        const [productsResponse, inventoriesResponse] = await Promise.all([
            http.get('/products'),
            http.get('/inventories')
        ])
        return productsResponse.data.map(product => {
            const inventory = inventoriesResponse.data.find(i => String(i.productId) === String(product.id))
            return toProductoResource(product, inventory)
        })
    }

    static async getCategorias() {
        const response = await http.get('/categories')
        return response.data.map(c => ({
            id_categoria: String(c.id),
            nombre: c.name,
            descripcion: c.description
        }))
    }

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
        const inventoryResponse = await http.post('/inventories', {
            productId: productResponse.data.id,
            currentStock: Number(nuevoProducto.stock_actual),
            minimumStock: Number(nuevoProducto.stock_minimo),
            lastUpdated: new Date().toISOString()
        })

        return toProductoResource(productResponse.data, inventoryResponse.data)
    }
}
