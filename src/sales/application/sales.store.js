import { defineStore } from 'pinia';
import { ref } from 'vue';
import salesApi from '../infrastructure/sales-api.js';

export const useSalesStore = defineStore('sales', () => {
    const sales = ref([]);
    const products = ref([]);
    const loading = ref(false);
    const submitting = ref(false);

    async function loadInitialData() {
        loading.value = true;
        try {
            const [prodRes, invRes, salesRes] = await Promise.all([
                salesApi.getProducts(),
                salesApi.getInventories(),
                salesApi.getSales()
            ]);

            const invMap = {};
            (invRes || []).forEach(inv => {
                invMap[inv.productId] = inv.currentStock || 0;
            });

            products.value = (prodRes || []).map(p => ({
                ...p,
                stock: invMap[p.id] ?? p.stock ?? 10
            }));
            sales.value = salesRes || [];
        } catch (error) {
            console.error('Error al cargar datos de ventas:', error);
        } finally {
            loading.value = false;
        }
    }

    async function registerSale(saleEntity) {
        submitting.value = true;
        try {
            const created = await salesApi.createSale(saleEntity);
            sales.value.unshift(created);
            return created;
        } catch (error) {
            console.error('Error al registrar venta:', error);
            throw error;
        } finally {
            submitting.value = false;
        }
    }

    return {
        sales,
        products,
        loading,
        submitting,
        loadInitialData,
        registerSale
    };
});