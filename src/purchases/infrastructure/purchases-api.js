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

    static async updateInventoryStock(inventory, currentStock) {
        return http.put(`/inventories/${inventory.id}`, {currentStock,
            minimumStock: Number(inventory.minimumStock || 0)
        })
    }

    static async createPurchase(purchase) {
        const quantity = Number(purchase.quantity)
        const unitCost = Number(purchase.unitCost)

        if (!purchase.productId || !purchase.supplierId || !Number.isInteger(quantity) ||
            quantity <= 0 || !Number.isFinite(unitCost) || unitCost <= 0
        ) {
            throw new Error('Los datos de la compra no son validos.')
        }

        const inventoriesResponse = await http.get('/inventories')
        const inventory = inventoriesResponse.data.find(
            item => String(item.productId) === String(purchase.productId)
        )

        let createdInventory = null

        if (inventory) {
            await this.updateInventoryStock(inventory, Number(inventory.currentStock || 0) + quantity
            )
        } else {
            const response = await http.post('/inventories', {
                productId: Number(purchase.productId),
                currentStock: quantity,
                minimumStock: 0
            })
            createdInventory = response.data
        }

        try {
            const response = await http.post('/purchases', {
                supplierId: Number(purchase.supplierId),
                productId: Number(purchase.productId),
                quantity,
                unitCost
            })
            return response.data

        } catch (error) {
            try {
                if (inventory) {
                    await this.updateInventoryStock(inventory, Number(inventory.currentStock || 0))
                } else if (createdInventory) {
                    await this.updateInventoryStock(createdInventory, 0)
                }
            } catch (rollbackError) {
                console.error('No se pudo revertir la actualización del inventario:', rollbackError)
            }
            throw error
        }
    }

    static async deletePurchase(purchase) {
        const quantity = Number(purchase.quantity)

        const inventoriesResponse =
            await http.get('/inventories')

        const inventory =
            inventoriesResponse.data.find(
                item =>
                    String(item.productId) ===
                    String(purchase.productId)
            )

        if (!inventory) {
            throw new Error(
                'No se encontró el inventario del producto para revertir la compra.'
            )
        }

        const previousStock =
            Number(inventory.currentStock || 0)

        if (previousStock < quantity) {
            throw new Error(
                'No hay suficiente stock para eliminar esta compra.'
            )
        }

        await this.updateInventoryStock(
            inventory,
            previousStock - quantity
        )

        try {
            await http.delete(
                `/purchases/${purchase.id}`
            )

        } catch (error) {

            try {
                await this.updateInventoryStock(
                    inventory,
                    previousStock
                )
            } catch (rollbackError) {
                console.error(
                    'No se pudo revertir el stock después del error al eliminar la compra:',
                    rollbackError
                )
            }

            throw error
        }
    }
}
