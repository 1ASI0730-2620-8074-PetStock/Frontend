import http from '@/shared/infrastructure/http-common.js';
import saleAssembler from './sale.assembler.js';

export class SalesApi {
    async getSales() {
        const response = await http.get('/sales');
        return (response.data || []).map(item => saleAssembler.toEntity(item));
    }

    async createSale(saleEntity) {
        const resource = saleAssembler.toResource(saleEntity);
        const response = await http.post('/sales', resource);
        return saleAssembler.toEntity(response.data);
    }

    async getProducts() {
        const response = await http.get('/products');
        return response.data;
    }

    async getInventories() {
        const response = await http.get('/inventories');
        return response.data;
    }

    // Descuenta del inventario las unidades vendidas (US18)
    async decreaseStock(productId, quantity) {
        const response = await http.get('/inventories');
        const inventory = response.data.find(i => String(i.productId) === String(productId));
        if (!inventory) return;
        await http.patch(`/inventories/${inventory.id}`, {
            currentStock: inventory.currentStock - Number(quantity)
        });
    }
}

export default new SalesApi();