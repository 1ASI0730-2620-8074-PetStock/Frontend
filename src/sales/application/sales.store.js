
import { defineStore } from 'pinia'
import { ref } from 'vue'
import salesApi from '../infrastructure/sales-api.js'

function getSaleItems(sale) {
    if (Array.isArray(sale.items) && sale.items.length) return sale.items
    if (sale.productId) {
        return [{
            productId: sale.productId,
            quantity: sale.quantity
        }]
    }
    return []
}

export const useSalesStore = defineStore('sales', () => {
    const sales = ref([])
    const products = ref([])
    const customers = ref([])
    const loading = ref(false)
    const submitting = ref(false)
    const error = ref('')

    async function loadInitialData() {
        loading.value = true
        error.value = ''
        try {
            const [productData, inventoryData, salesData, customerData] = await Promise.all([
                salesApi.getProducts(),
                salesApi.getInventories(),
                salesApi.getSales(),
                salesApi.getCustomers()
            ])

            const inventoryByProduct = new Map(
                inventoryData.map(inventory => [String(inventory.productId), Number(inventory.currentStock || 0)])
            )
            products.value = productData
                .filter(product => product.active !== false)
                .map(product => ({
                    ...product,
                    id: String(product.id),
                    stock: inventoryByProduct.get(String(product.id)) ?? 0
                }))
            customers.value = customerData.map(customer => ({
                ...customer,
                id: String(customer.id)
            }))
            sales.value = salesData
        } catch (loadError) {
            error.value = 'No se pudieron cargar los datos de ventas. Verifica que el servidor esté activo.'
            console.error('Error al cargar datos de ventas:', loadError)
            throw loadError
        } finally {
            loading.value = false
        }
    }

    async function registerSale(saleEntity) {
        if (!Array.isArray(saleEntity.items) || saleEntity.items.length === 0) {
            throw new Error('La venta debe incluir al menos un producto.')
        }

        submitting.value = true
        error.value = ''
        const stockChanges = []
        try {
            for (const item of saleEntity.items) {
                const quantity = Number(item.quantity)
                if (!Number.isInteger(quantity) || quantity <= 0) {
                    throw new Error('La cantidad debe ser un número entero mayor que cero.')
                }
                await salesApi.decreaseStock(item.productId, quantity)
                stockChanges.push({ productId: String(item.productId), quantity })
            }

            const created = await salesApi.createSale(saleEntity)
            sales.value.unshift(created)

            // The sale is saved; any secondary registration error is logged.
            try {
                await salesApi.createPayment(created)
                if (created.customerId) {
                    await salesApi.createPurchaseHistoryEntry(created)
                }
            } catch (recordError) {
                console.error('Could not register the payment or purchase history:', recordError)
            }

            for (const change of stockChanges) {
                const product = products.value.find(item => String(item.id) === change.productId)
                if (product) product.stock = Number(product.stock || 0) - change.quantity
            }
            return created
        } catch (saleError) {
            for (const change of stockChanges.reverse()) {
                try {
                    await salesApi.increaseStock(change.productId, change.quantity)
                } catch (rollbackError) {
                    console.error('No se pudo revertir el stock después del error al registrar la venta:', rollbackError)
                }
            }
            error.value = saleError.message || 'No se pudo registrar la venta.'
            console.error('Error al registrar venta:', saleError)
            throw saleError
        } finally {
            submitting.value = false
        }
    }

    async function addCustomer(newCustomer) {
        try {
            const response = await salesApi.createCustomer(newCustomer)
            customers.value.push(response)
            return response
        } catch (customerError) {
            console.error('Error al crear cliente:', customerError)
            throw customerError
        }
    }

    async function deleteSale(id) {
        const sale = sales.value.find(item => String(item.id) === String(id))
        if (!sale) throw new Error('No se encontró la venta que deseas eliminar.')

        submitting.value = true
        error.value = ''
        const restoredItems = []
        try {
            for (const item of getSaleItems(sale)) {
                const quantity = Number(item.quantity)
                if (!Number.isInteger(quantity) || quantity <= 0) continue
                await salesApi.increaseStock(item.productId, quantity)
                restoredItems.push({ productId: String(item.productId), quantity })
            }

            await salesApi.deleteSale(id)
            sales.value = sales.value.filter(item => String(item.id) !== String(id))
            for (const change of restoredItems) {
                const product = products.value.find(item => String(item.id) === change.productId)
                if (product) product.stock = Number(product.stock || 0) + change.quantity
            }
        } catch (deleteError) {
            for (const change of restoredItems.reverse()) {
                try {
                    await salesApi.decreaseStock(change.productId, change.quantity)
                } catch (rollbackError) {
                    console.error('No se pudo revertir el stock después del error al eliminar la venta:', rollbackError)
                }
            }
            error.value = deleteError.message || 'No se pudo eliminar la venta.'
            console.error('Error al eliminar la venta:', deleteError)
            throw deleteError
        } finally {
            submitting.value = false
        }
    }

    return {
        sales,
        products,
        customers,
        loading,
        submitting,
        error,
        loadInitialData,
        registerSale,
        addCustomer,
        deleteSale
    }
})
