import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Purchase } from '../domain/model/purchase.entity.js'
import { PurchasesApi } from '../infrastructure/purchases-api.js'

export const usePurchasesStore = defineStore('purchases', () => {
    const purchases = ref([])
    const products = ref([])
    const suppliers = ref([])
    const loading = ref(false)
    const submitting = ref(false)
    const error = ref('')

    async function loadInitialData() {
        loading.value = true
        error.value = ''
        try {
            const [purchaseData, productData, supplierData] = await Promise.all([
                PurchasesApi.getPurchases(),
                PurchasesApi.getProducts(),
                PurchasesApi.getSuppliers()
            ])

            purchases.value = purchaseData.map(item => new Purchase(item))
            products.value = productData.filter(product => product.active !== false)
            suppliers.value = supplierData
        } catch (loadError) {
            error.value = 'No se pudieron cargar las compras, productos y proveedores.'
            console.error('Error al cargar el módulo de compras:', loadError)
        } finally {
            loading.value = false
        }
    }

    async function registerPurchase(purchaseData) {
        submitting.value = true
        error.value = ''
        try {
            const created = await PurchasesApi.createPurchase(purchaseData)
            const purchase = new Purchase(created)
            purchases.value.unshift(purchase)
            return purchase
        } catch (purchaseError) {
            error.value = 'No se pudo registrar la compra. Verifica la conexión e inténtalo nuevamente.'
            console.error('Error al registrar la compra:', purchaseError)
            throw purchaseError
        } finally {
            submitting.value = false
        }
    }

    async function deletePurchase(purchase) {
        submitting.value = true
        error.value = ''
        try {
            await PurchasesApi.deletePurchase(purchase)
            purchases.value = purchases.value.filter(item => String(item.id) !== String(purchase.id))
        } catch (deleteError) {
            error.value = 'No se pudo eliminar la compra ni revertir el inventario.'
            console.error('Error al eliminar la compra:', deleteError)
            throw deleteError
        } finally {
            submitting.value = false
        }
    }

    return {
        purchases,
        products,
        suppliers,
        loading,
        submitting,
        error,
        loadInitialData,
        registerPurchase,
        deletePurchase
    }
})
