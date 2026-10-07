import { defineStore } from 'pinia';
import { ref } from 'vue';
import customerApi from '../infrastructure/customer-api.js';

export const useCustomerStore = defineStore('customer', () => {
    const customers = ref([]);
    const loading = ref(false);

    async function loadCustomers() {
        loading.value = true;
        try {
            const data = await customerApi.getCustomers();
            customers.value = data || [];
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        } finally {
            loading.value = false;
        }
    }

    async function addCustomer(customerEntity) {
        try {
            const created = await customerApi.createCustomer(customerEntity);
            customers.value.push(created);
            return created;
        } catch (error) {
            console.error('Error al registrar cliente:', error);
            throw error;
        }
    }

    return {
        customers,
        loading,
        loadCustomers,
        addCustomer
    };
});