<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSalesStore } from '@/sales/application/sales.store.js';
import { useCustomerStore } from '@/sales/application/customer.store.js';
import { Customer } from '@/sales/domain/model/customer.entity.js';
import SaleForm from '../components/sale-form.vue';
import SaleHistoryList from '../components/sale-history-list.vue';

const route = useRoute();
const salesStore = useSalesStore();
const customerStore = useCustomerStore();

const activeTab = ref(route?.query?.tab === 'history' ? 'history' : 'register');
const showNewCustomerModal = ref(false);
const newCustomerName = ref('');
const newCustomerPhone = ref('');

const notification = ref({ show: false, message: '', severity: 'success' });

function showToast(message, severity = 'success') {
  notification.value = { show: true, message, severity };
  setTimeout(() => { notification.value.show = false; }, 4000);
}

onMounted(async () => {
  try {
    await Promise.all([
      salesStore.loadInitialData(),
      customerStore.loadCustomers()
    ]);
  } catch (e) {
    console.error('Error al inicializar datos:', e);
  }
});

async function handleRegisterSale(saleEntity) {
  try {
    await salesStore.registerSale(saleEntity);
    showToast('¡Venta registrada con éxito!', 'success');
    const prod = salesStore.products.find(p => String(p.id) === String(saleEntity.productId));
    if (prod) prod.stock -= saleEntity.quantity;
  } catch (err) {
    showToast('Error al registrar venta', 'error');
  }
}

async function handleAddCustomer() {
  if (!newCustomerName.value.trim()) return;
  try {
    const newCust = new Customer(null, newCustomerName.value.trim(), newCustomerPhone.value.trim(), '');
    const created = await customerStore.addCustomer(newCust);
    newCustomerName.value = '';
    newCustomerPhone.value = '';
    showNewCustomerModal.value = false;
    showToast(`Cliente ${created.name} registrado con éxito`, 'success');
  } catch (err) {
    showToast('Error al registrar nuevo cliente', 'error');
  }
}
</script>

<template>
  <div class="page">
    <div class="main-wrapper">

      <!-- Encabezado y Pestañas con Traducción i18n -->
      <div class="module-header-card">
        <div class="module-info">
          <h1 class="page-title">{{ $t('sales.title') }}</h1>
          <p class="page-subtitle">{{ $t('sales.subtitle') }}</p>
        </div>

        <div class="segmented-tabs">
          <button
              type="button"
              class="segment-btn"
              :class="{ active: activeTab === 'register' }"
              @click="activeTab = 'register'"
          >
            <i class="pi pi-shopping-cart"></i>
            <span>{{ $t('sales.newSale') }}</span>
          </button>
          <button
              type="button"
              class="segment-btn"
              :class="{ active: activeTab === 'history' }"
              @click="activeTab = 'history'"
          >
            <i class="pi pi-history"></i>
            <span>{{ $t('sales.history') }}</span>
          </button>
        </div>
      </div>

      <!-- Alerta Toast -->
      <div v-if="notification.show" class="modern-toast" :class="notification.severity">
        <i class="pi" :class="notification.severity === 'success' ? 'pi-check-circle' : 'pi-exclamation-circle'"></i>
        <span>{{ notification.message }}</span>
      </div>

      <!-- Contenedor Dinámico -->
      <div class="view-content-wrapper">
        <div v-if="activeTab === 'register'" class="form-pane animate-fade">
          <SaleForm
              :products="salesStore.products"
              :customers="customerStore.customers"
              :submitting="salesStore.submitting"
              @submit-sale="handleRegisterSale"
              @open-customer-modal="showNewCustomerModal = true"
              @switch-history="activeTab = 'history'"
          />
        </div>

        <div v-else class="history-pane animate-fade">
          <SaleHistoryList :sales="salesStore.sales" />
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showNewCustomerModal" class="custom-modal-backdrop">
      <div class="custom-modal-card animate-scale">
        <div class="modal-header-row">
          <h3>Nuevo Cliente</h3>
          <button class="close-modal-x" @click="showNewCustomerModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <p class="modal-subtext">Ingresa los datos del cliente para asociarlo a la venta.</p>

        <div class="modal-form-group">
          <label>Nombre completo <span class="req">*</span></label>
          <input type="text" v-model="newCustomerName" placeholder="Ej. Camila Vargas" class="styled-input" />
        </div>

        <div class="modal-form-group">
          <label>Teléfono móvil</label>
          <input type="text" v-model="newCustomerPhone" placeholder="Ej. 987 654 321" class="styled-input" />
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn-cancel" @click="showNewCustomerModal = false">Cancelar</button>
          <button type="button" class="btn-confirm" @click="handleAddCustomer">Registrar Cliente</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor Principal Ancho en Escritorio */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-sizing: border-box;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(237, 107, 21, 0.5); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(237, 107, 21, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(237, 107, 21, 0); }
}

.module-header-card {
  background: #FFFFFF;
  padding: 1.75rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(47, 32, 25, 0.03);
  border: 1px solid #EEDFC8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.page-title {
  font-size: 1.65rem;
  font-weight: 700;
  color: #2F2019;
  margin: 0 0 0.2rem 0;
}

.page-subtitle {
  font-size: 0.92rem;
  color: #7A5C45;
  margin: 0;
}

.segmented-tabs {
  display: flex;
  background: #F4EBE1;
  padding: 0.35rem;
  border-radius: 12px;
  gap: 0.3rem;
}

.segment-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.25rem;
  border: none;
  background: transparent;
  border-radius: 9px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #7A5C45;
  cursor: pointer;
  transition: all 0.2s ease;
}

.segment-btn.active {
  background: #FFFFFF;
  color: #ED6B15;
  box-shadow: 0 2px 8px rgba(47, 32, 25, 0.08);
}

.modern-toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.92rem;
  width: 100%;
  box-sizing: border-box;
}

.modern-toast.success {
  background: #E6F8ED; color: #157335; border: 1px solid #C3E6CB;
}

.modern-toast.error {
  background: #FDE8E8; color: #9B1C1C; border: 1px solid #F5C6CB;
}

.view-content-wrapper {
  width: 100%;
}

/* Modal */
.custom-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(47, 32, 25, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.custom-modal-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 40px rgba(47, 32, 25, 0.15);
  border: 1px solid #EEDFC8;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-sizing: border-box;
}

.modal-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header-row h3 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #2F2019;
}

.close-modal-x {
  background: #F4EBE1;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7A5C45;
  cursor: pointer;
}

.modal-subtext {
  font-size: 0.88rem;
  color: #7A5C45;
  margin: 0;
}

.modal-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.modal-form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2F2019;
}

.req {
  color: #E03131;
}

.styled-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #EEDFC8;
  border-radius: 12px;
  background-color: #FDF8F2;
  font-size: 0.95rem;
  color: #2F2019;
  outline: none;
  box-sizing: border-box;
}

.styled-input:focus {
  border-color: #ED6B15; background: #FFF;
}

.modal-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel {
  background: transparent;
  color: #7A5C45;
  border: 1px solid #EEDFC8;
  padding: 0.7rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-confirm {
  background: #ED6B15;
  color: #FFFFFF;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 768px) {
  .main-wrapper {
  
}
}
</style>