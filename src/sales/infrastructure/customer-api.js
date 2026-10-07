import http from '@/shared/infrastructure/http-common.js';
import customerAssembler from './customer.assembler.js';

export class CustomerApi {
    async getCustomers() {
        const response = await http.get('/customers');
        return (response.data || []).map(item => customerAssembler.toEntity(item));
    }

    async createCustomer(customerEntity) {
        const resource = customerAssembler.toResource(customerEntity);
        const response = await http.post('/customers', resource);
        return customerAssembler.toEntity(response.data);
    }
}

export default new CustomerApi();