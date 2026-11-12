
import http from '@/shared/infrastructure/http-common.js'
import saleAssembler from './sale.assembler.js'

export class SalesApi {
    async getSales() {
        const response = await http.get('/sales')
        return (response.data || []).map(item => saleAssembler.toEntity(item))
    }

    async createSale(saleEntity) {
        const response = await http.post('/sales', saleAssembler.toResource(saleEntity))
        return saleAssembler.toEntity(response.data)
    }

    async deleteSale(id) {
        await http.delete(`/sales/${id}`)
    }

    async createPayment(sale) {
        const response = await http.post('/payments', {
            saleId: Number(sale.id),
            amount: Number(sale.total),
            paymentMethod: sale.paymentMethod
        })
        return response.data
    }

    async createPurchaseHistoryEntry(sale) {
        const response = await http.post('/purchase-history-entries', {
            customerId: Number(sale.customerId),
            saleId: Number(sale.id),
            total: Number(sale.total)
        })
        return response.data
    }

    async getProducts() {
        const response = await http.get('/products')
        return response.data || []
    }

    async getInventories() {
        const response = await http.get('/inventories')
        return response.data || []
    }

    async getCustomers() {
        const response = await http.get('/customers')
        return response.data || []
    }

    async createCustomer(customer) {
        const response = await http.post('/customers', customer)
        return { ...response.data, id: String(response.data.id) }
    }

    async decreaseStock(productId, quantity) {
        const amount = Number(quantity)
        if (!Number.isInteger(amount) || amount <= 0) {
            throw new Error('La cantidad vendida debe ser un entero positivo.')
        }

        const inventory = await this.getInventoryRecord(productId)
        if (!inventory) {
            throw new Error('El producto no tiene un registro de inventario.')
        }

        const currentStock = Number(inventory.currentStock || 0)
        if (currentStock < amount) {
            throw new Error(`Stock insuficiente. Disponible: ${currentStock}.`)
        }

        const response = await http.put(`/inventories/${inventory.id}`, {
            currentStock: currentStock - amount,
            minimumStock: Number(inventory.minimumStock || 0)
        })
        return response.data
    }

    async increaseStock(productId, quantity) {
        const amount = Number(quantity)
        if (!Number.isInteger(amount) || amount <= 0) {
            throw new Error('La cantidad devuelta debe ser un entero positivo.')
        }

        const inventory = await this.getInventoryRecord(productId)
        if (!inventory) {
            throw new Error('El producto no tiene un registro de inventario.')
        }

        const response = await http.put(`/inventories/${inventory.id}`, {
            currentStock: Number(inventory.currentStock || 0) + amount,
            minimumStock: Number(inventory.minimumStock || 0)
        })
        return response.data
    }

    async getInventoryRecord(productId) {
        const inventories = await this.getInventories()
        return inventories.find(item => String(item.productId) === String(productId)) || null
    }
}

export default new SalesApi()
