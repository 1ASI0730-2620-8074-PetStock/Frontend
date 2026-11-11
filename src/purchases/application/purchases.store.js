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

    function withNames(purchase) {

        const supplier =
            suppliers.value.find(
                item =>
                    String(item.id) ===
                    String(purchase.supplierId)
            )

        const product =
            products.value.find(
                item =>
                    String(item.id) ===
                    String(purchase.productId)
            )

        return new Purchase({
            ...purchase,

            supplierName:
                supplier
                    ? supplier.companyName
                    : '',

            productName:
                product
                    ? product.name
                    : '',

            date:
                purchase.date
                    ? String(purchase.date).slice(0, 10)
                    : ''
        })
    }

    async function loadInitialData() {

        loading.value = true
        error.value = ''

        try {

            const [
                productData,
                supplierData,
                purchaseData
            ] = await Promise.all([
                PurchasesApi.getProducts(),
                PurchasesApi.getSuppliers(),
                PurchasesApi.getPurchases()
            ])

            products.value =
                productData.filter(
                    product =>
                        product.active !== false
                )

            suppliers.value =
                supplierData

            purchases.value =
                purchaseData.map(withNames)

        } catch (loadError) {

            error.value =
                'No se pudieron cargar las compras, productos y proveedores.'

            console.error(
                'Error al cargar el modulo de compras:',
                loadError
            )

        } finally {

            loading.value = false

        }
    }

    async function registerPurchase(purchaseData) {

        submitting.value = true
        error.value = ''

        try {

            const created =
                await PurchasesApi.createPurchase(
                    purchaseData
                )

            const purchase =
                withNames(created)

            purchases.value.unshift(
                purchase
            )

            return purchase

        } catch (purchaseError) {

            error.value =
                'No se pudo registrar la compra. Verifica la conexión e inténtalo nuevamente.'

            console.error(
                'Error al registrar la compra:',
                purchaseError
            )

            throw purchaseError

        } finally {

            submitting.value = false

        }
    }

    async function deletePurchase(purchase) {

        submitting.value = true
        error.value = ''

        try {

            await PurchasesApi.deletePurchase(
                purchase
            )

            purchases.value =
                purchases.value.filter(
                    item =>
                        String(item.id) !==
                        String(purchase.id)
                )

        } catch (deleteError) {

            error.value = 'No se pudo eliminar la compra ni revertir el inventario.'
            console.error('Error al eliminar la compra:', deleteError
            )

            throw deleteError

        } finally {
            submitting.value = false
        }
    }

    return {purchases, products, suppliers,
        loading, submitting, error, loadInitialData,
        registerPurchase, deletePurchase
    }
})