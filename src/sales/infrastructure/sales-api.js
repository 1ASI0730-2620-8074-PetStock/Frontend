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
}

export default new SalesApi();