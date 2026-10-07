<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSalesStore } from '@/sales/application/sales.store.js';
import { useCustomerStore } from '@/sales/application/customer.store.js';
import { Customer } from '@/sales/domain/model/customer.entity.js';
import SaleForm from '../components/sale-form.vue';
import SaleHistoryList from '../components/sale-history-list.vue';
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue';

const route = useRoute();
const salesStore = useSalesStore();
const customerStore = useCustomerStore();

const activeTab = ref(route?.query?.tab === 'history' ? 'history' : 'register');
const showNewCustomerModal = ref(false);
const newCustomerName = ref('');
const newCustomerPhone = ref('');
const isMobileMenuOpen = ref(false);

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
  <div class="petstock-app">
    <!-- Overlay oscuro cuando se abre el menú en móvil -->
    <div v-if="isMobileMenuOpen" class="sidebar-overlay" @click="isMobileMenuOpen = false"></div>

    <!-- Sidebar Naranja (Fija en PC, deslizable en móvil) -->
    <aside class="sidebar-naranja" :class="{ 'mobile-open': isMobileMenuOpen }">
      <div class="brand">
        <img src="/font/logo2.png" alt="PetStock Logo" class="brand-logo" />
        <h2>PetStock</h2>
      </div>

      <nav class="sidebar-nav" @click="isMobileMenuOpen = false">
        <router-link to="/dashboard" class="nav-item">
          <i class="pi pi-th-large"></i>
          <span>Dashboard (Inicio)</span>
        </router-link>
        <router-link to="/catalog" class="nav-item">
          <i class="pi pi-box"></i>
          <span>Registrar Producto</span>
        </router-link>
        <router-link to="/sales" class="nav-item active">
          <i class="pi pi-shopping-bag"></i>
          <span>Registrar Venta</span>
        </router-link>
        <router-link to="/analytics" class="nav-item">
          <i class="pi pi-file"></i>
          <span>Reportes</span>
        </router-link>
        <router-link to="/inventory" class="nav-item">
          <i class="pi pi-exclamation-triangle"></i>
          <span>Bajo Stock</span>
        </router-link>
      </nav>
    </aside>

    <!-- Contenido Principal -->
    <main class="main-wrapper">
      <header class="top-header">
        <div class="header-left-group">
          <!-- Botón de las 3 rayillas integrado limpiamente a la izquierda -->
          <button type="button" class="mobile-menu-toggle" @click="isMobileMenuOpen = !isMobileMenuOpen">
            <i class="pi pi-bars"></i>
          </button>
          <div class="location-tag">
            <span class="pulse-dot"></span>
            <span>Sucursal Activa: <strong>Central</strong></span>
          </div>
        </div>
        <div class="actions">
          <LanguageSwitcher />
        </div>
      </header>

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
    </main>

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
.petstock-app {
  display: flex;
  min-height: 100vh;
  background-color: #FAF7F2;
  color: #2F2019;
  width: 100%;
  font-family: 'Poppins', sans-serif;
  position: relative;
}

/* Botón hamburguesa oculto en escritorio por defecto */
.mobile-menu-toggle {
  display: none;
  background: #ED6B15;
  color: #FFFFFF;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 1.1rem;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(237, 107, 21, 0.2);
  flex-shrink: 0;
}

.header-left-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sidebar-overlay {
  display: none;
}

/* Sidebar Naranja Original Fija en Escritorio */
.sidebar-naranja {
  width: 260px;
  min-width: 260px;
  background-color: #ED6B15;
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  box-sizing: border-box;
  z-index: 100;
  overflow-y: auto;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.brand {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0.5rem 0 1rem 0;
  text-align: center;
}
.brand-logo {
  width: 100%;
  max-width: 180px;
  height: auto;
  display: block;
  object-fit: contain;
}
.brand h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 !important;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  color: #FFFFFF;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}
.nav-item:hover, .nav-item.active {
  background-color: rgba(255, 255, 255, 0.25);
  font-weight: 700;
}

/* Contenedor Principal Ancho en Escritorio */
.main-wrapper {
  flex: 1;
  margin-left: 260px;
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  min-height: 100vh;
  box-sizing: border-box;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  padding: 0.75rem 1.25rem;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(47, 32, 25, 0.03);
  border: 1px solid #EEDFC8;
  width: 100%;
  box-sizing: border-box;
  gap: 0.5rem;
}

.location-tag {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #FDF8F2;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #5A3E2B;
  border: 1px solid #EEDFC8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  background-color: #ED6B15;
  border-radius: 50%;
  animation: pulse 2s infinite;
  flex-shrink: 0;
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
.modern-toast.success { background: #E6F8ED; color: #157335; border: 1px solid #C3E6CB; }
.modern-toast.error { background: #FDE8E8; color: #9B1C1C; border: 1px solid #F5C6CB; }

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

.req { color: #E03131; }

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
.styled-input:focus { border-color: #ED6B15; background: #FFF; }

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

/* Comportamiento Responsivo Perfecto */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 99;
  }
  .sidebar-naranja {
    transform: translateX(-100%);
  }
  .sidebar-naranja.mobile-open {
    transform: translateX(0);
  }
  .main-wrapper {
    margin-left: 0;
    padding: 1rem;
  }
  .top-header {
    padding: 0.6rem 0.8rem;
  }
  .location-tag {
    font-size: 0.72rem;
    padding: 0.3rem 0.5rem;
  }
}
</style>