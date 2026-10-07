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

    return {
        inventarios,
        alertasStock,
        loading,
        error,
        cargarInventarios,
        cargarAlertasStock
    }
}