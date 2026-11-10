import http from '@/shared/infrastructure/http-common.js'

export class PurchasesApi {
    static async getPurchases() {
        const response = await http.get('/purchases')
        return response.data
    }

    static async getProducts() {
        const response = await http.get('/products')
        return response.data
    }

    static async getSuppliers() {
        const response = await http.get('/suppliers')
        return response.data
    }

    static async createPurchase(purchase) {
        const quantity = Number(purchase.quantity)
        const unitCost = Number(purchase.unitCost)
        const total = quantity * unitCost

        if (!purchase.productId || !purchase.supplierId || !Number.isInteger(quantity) || quantity <= 0 ||
            !Number.isFinite(unitCost) || unitCost <= 0) {
            throw new Error('Los datos de la compra no son válidos.')
        }

        const inventoriesResponse = await http.get('/inventories')
        const inventory = inventoriesResponse.data.find(
            item => String(item.productId) === String(purchase.productId)
        )

        let createdInventory = null
        if (inventory) {
            await http.patch(`/inventories/${inventory.id}`, {
                currentStock: Number(inventory.currentStock || 0) + quantity,
                lastUpdated: new Date().toISOString()
            })
        } else {
            const response = await http.post('/inventories', {
                productId: purchase.productId,
                currentStock: quantity,
                minimumStock: 0,
                lastUpdated: new Date().toISOString()
            })
            createdInventory = response.data
        }

        try {
            const response = await http.post('/purchases', {
                supplierId: String(purchase.supplierId),
                supplierName: purchase.supplierName,
                productId: String(purchase.productId),
                productName: purchase.productName,
                quantity,
                unitCost,
                total,
                date: purchase.date
            })
            return response.data
        } catch (error) {
            try {
                if (inventory) {
                    await http.patch(`/inventories/${inventory.id}`, {
                        currentStock: Number(inventory.currentStock || 0),
                        lastUpdated: inventory.lastUpdated
                    })
                } else if (createdInventory) {
                    await http.delete(`/inventories/${createdInventory.id}`)
                }
            } catch (rollbackError) {
                console.error('No se pudo revertir la actualización del inventario:', rollbackError)
            }
            throw error
        }
    }

    static async deletePurchase(purchase) {
        const quantity = Number(purchase.quantity)
        const inventoriesResponse = await http.get('/inventories')
        const inventory = inventoriesResponse.data.find(
            item => String(item.productId) === String(purchase.productId)
        )

        if (!inventory) {
            throw new Error('No se encontró el inventario del producto para revertir la compra.')
        }

        const previousStock = Number(inventory.currentStock || 0)
        if (previousStock < quantity) {
            throw new Error('No hay suficiente stock para eliminar esta compra; revisa primero el inventario.')
        }

        const updatedInventory = {
            currentStock: previousStock - quantity,
            lastUpdated: new Date().toISOString()
        }
        await http.patch(`/inventories/${inventory.id}`, updatedInventory)

        try {
            await http.delete(`/purchases/${purchase.id}`)
        } catch (error) {
            try {
                await http.patch(`/inventories/${inventory.id}`, {
                    currentStock: previousStock,
                    ...(inventory.lastUpdated ? { lastUpdated: inventory.lastUpdated } : {})
                })
            } catch (rollbackError) {
                console.error('No se pudo revertir el stock después del error al eliminar la compra:', rollbackError)
            }
            throw error
        }
    }
}
