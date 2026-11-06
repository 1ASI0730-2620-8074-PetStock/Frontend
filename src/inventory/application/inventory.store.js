import { ref } from 'vue'
import { InventoryApi } from '../infrastructure/inventory-api.js'
import { Inventory } from '../domain/model/inventory.entity.js'
import { StockAlert } from '../domain/model/stock-alert.entity.js'

const inventarios = ref([])
const alertasStock = ref([])
const loading = ref(false)
const error = ref(null)

export function useInventoryStore() {
    async function cargarInventarios() {
        loading.value = true
        error.value = null
        try {
            const data = await InventoryApi.getInventarios()
            inventarios.value = data.map(i => new Inventory(i))
        } catch (e) {
            error.value = 'Error al cargar inventario'
        } finally {
            loading.value = false
        }
    }

    async function cargarAlertasStock() {
        const data = await InventoryApi.getAlertasStock()
        alertasStock.value = data.map(a => new StockAlert(a))
    }

    async function actualizarStockMinimo(productId, minimumStock) {
        error.value = null
        try {
            const updated = await InventoryApi.updateStockThreshold(productId, minimumStock)
            const index = inventarios.value.findIndex(item => String(item.idProducto) === String(productId))
            if (index !== -1) {
                inventarios.value[index] = new Inventory(updated)
            }
            await cargarAlertasStock()
        } catch (updateError) {
            error.value = 'No se pudo actualizar el stock mínimo.'
            throw updateError
        }
    }

    return {
        inventarios,
        alertasStock,
        loading,
        error,
        cargarInventarios,
        cargarAlertasStock,
        actualizarStockMinimo
    }
}