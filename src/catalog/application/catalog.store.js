import { ref } from 'vue'
import { CatalogApi } from '../infrastructure/catalog-api.js'
import { Product } from '../domain/model/product.entity.js'
import { Category } from '../domain/model/category.entity.js'

const productos = ref([])
const categorias = ref([])
const loading = ref(false)
const error = ref(null)

export function useCatalogStore() {
    async function cargarProductos() {
        loading.value = true
        error.value = null
        try {
            const data = await CatalogApi.getProductos()
            productos.value = data.map(p => new Product(p))
        } catch (e) {
            error.value = 'Error al cargar productos'
        } finally {
            loading.value = false
        }
    }

    async function cargarCategorias() {
        const data = await CatalogApi.getCategorias()
        categorias.value = data.map(c => new Category(c))
    }

    async function agregarProducto(nuevoProducto) {
        const creado = await CatalogApi.createProducto(nuevoProducto)
        productos.value.push(new Product(creado))
    }

    return {
        productos,
        categorias,
        loading,
        error,
        cargarProductos,
        cargarCategorias,
        agregarProducto
    }
}