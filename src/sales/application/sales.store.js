import { defineStore } from 'pinia';
import { ref } from 'vue';
import salesApi from '../infrastructure/sales-api.js';

export const useSalesStore = defineStore('sales', () => {
    const sales = ref([]);
    const products = ref([]);
    const customers = ref([]);
    const loading = ref(false);
    const submitting = ref(false);

    async function loadInitialData() {
        loading.value = true;
        try {
            const [prodRes, invRes, salesRes, custRes] = await Promise.all([
                salesApi.getProducts ? salesApi.getProducts() : fetch('http://localhost:3000/products').then(r => r.json()).catch(() => []),
                salesApi.getInventories ? salesApi.getInventories() : fetch('http://localhost:3000/inventories').then(r => r.json()).catch(() => []),
                salesApi.getSales ? salesApi.getSales() : fetch('http://localhost:3000/sales').then(r => r.json()).catch(() => []),
                fetch('http://localhost:3000/customers').then(r => r.json()).catch(() => [])
            ]);

            const invMap = {};
            (invRes || []).forEach(inv => {
                invMap[inv.productId] = inv.currentStock || 0;
            });

            products.value = (prodRes || []).map(p => ({
                ...p,
                stock: invMap[String(p.id)] ?? invMap[Number(p.id)] ?? p.stock ?? 10
            }));

            // Si la base de datos devuelve clientes, los cargamos; si no, usamos los por defecto
            customers.value = (custRes && custRes.length > 0) ? custRes : [
                { id: '1', name: 'Ana Torres' },
                { id: '2', name: 'Pedro Castillo' },
                { id: '3', name: 'Lucía Méndez' }
            ];

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
            const response = await fetch('http://localhost:3000/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleEntity)
            });
            const created = await response.json();
            sales.value.unshift(created);
            return created;
        } catch (error) {
            console.error('Error al registrar venta:', error);
            throw error;
        } finally {
            submitting.value = false;
        }
    }

    async function addCustomer(newCustomer) {
        try {
            const response = await fetch('http://localhost:3000/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCustomer)
            });
            const created = await response.json();
            customers.value.push(created);
            return created;
        } catch (error) {
            console.error('Error al crear cliente:', error);
            // Si falla el servidor JSON, lo agregamos localmente para no bloquear al usuario
            customers.value.push(newCustomer);
            return newCustomer;
        }
    }

    async function deleteSale(id) {
        submitting.value = true;
        try {
            await fetch(`http://localhost:3000/sales/${id}`, {
                method: 'DELETE'
            });
            sales.value = sales.value.filter(s => String(s.id) !== String(id));
        } catch (error) {
            console.error('Error al eliminar la venta:', error);
            throw error;
        } finally {
            submitting.value = false;
        }
    }

    return {
        sales,
        products,
        customers,
        loading,
        submitting,
        loadInitialData,
        registerSale,
        addCustomer,
        deleteSale
    };
});