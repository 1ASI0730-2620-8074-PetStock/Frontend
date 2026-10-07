import { defineStore } from 'pinia';
import { ref } from 'vue';
import salesApi from '../infrastructure/sales-api.js';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
                salesApi.getProducts ? salesApi.getProducts() : fetch(`${API_URL}/products`).then(r => r.json()).catch(() => []),
                salesApi.getInventories ? salesApi.getInventories() : fetch(`${API_URL}/inventories`).then(r => r.json()).catch(() => []),
                salesApi.getSales ? salesApi.getSales() : fetch(`${API_URL}/sales`).then(r => r.json()).catch(() => []),
                fetch(`${API_URL}/customers`).then(r => r.json()).catch(() => [])
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
            const response = await fetch(`${API_URL}/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleEntity)
            });
            const created = await response.json();

            // Descuenta del inventario cada producto vendido
            for (const item of saleEntity.items || []) {
                await salesApi.decreaseStock(item.productId, item.quantity);
            }

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
            const response = await fetch(`${API_URL}/customers`, {
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
            await fetch(`${API_URL}/sales/${id}`, {
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