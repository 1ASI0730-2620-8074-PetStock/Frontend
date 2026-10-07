<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import http from '@/shared/infrastructure/http-common.js';
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue';

const { t } = useI18n();

// Estado del usuario autenticado
const currentUser = ref({
  nombre: 'Eduardo',
  apellidos: 'Salazar',
  rol: 'Administrador'
});

const products = ref([]);
const inventories = ref([]);
const sales = ref([]);
const lowStockProducts = ref([]);

// Métricas del Dashboard
const totalStock = computed(() => inventories.value.reduce((acc, curr) => acc + (curr.currentStock || 0), 0));
const salesToday = computed(() => sales.value.reduce((acc, curr) => acc + (curr.total || 0), 0));

onMounted(async () => {
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      currentUser.value = JSON.parse(savedUser);
    }

    const [prodRes, invRes, salesRes] = await Promise.all([
      http.get('/products'),
      http.get('/inventories'),
      http.get('/sales')
    ]);

    products.value = prodRes.data || [];
    inventories.value = invRes.data || [];
    sales.value = salesRes.data || [];

    lowStockProducts.value = inventories.value
        .filter(inv => inv.currentStock <= inv.minimumStock)
        .map(inv => {
          const prod = products.value.find(p => p.id === String(inv.productId));
          return {
            id: inv.id,
            name: prod ? prod.name : 'Producto',
            currentStock: inv.currentStock,
            minimumStock: inv.minimumStock
          };
        });
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
});
</script>

<template>
  <div class="petstock-app">
    <!-- Sidebar Naranja Fija Continua -->
    <aside class="sidebar-naranja">
      <div class="brand">
        <!-- Logo ubicado POR ENCIMA del texto PetStock -->
        <img src="/font/logo2.png" alt="PetStock Logo" class="brand-logo" />
        <h2>PetStock</h2>
      </div>

      <!-- Menú de Navegación con RouterLink -->
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" active-class="active">
          <i class="pi pi-th-large"></i>
          <span>{{ t('dashboard.title', 'Dashboard (Inicio)') }}</span>
        </router-link>
        <router-link to="/catalog" class="nav-item" active-class="active">
          <i class="pi pi-box"></i>
          <span>{{ t('dashboard.register_product', 'Registrar Producto') }}</span>
        </router-link>
        <router-link to="/sales" class="nav-item" active-class="active">
          <i class="pi pi-shopping-bag"></i>
          <span>{{ t('dashboard.register_sale', 'Registrar Venta') }}</span>
        </router-link>
        <router-link to="/analytics" class="nav-item" active-class="active">
          <i class="pi pi-file"></i>
          <span>{{ t('dashboard.reports', 'Reportes') }}</span>
        </router-link>
        <router-link to="/inventory" class="nav-item" active-class="active">
          <i class="pi pi-exclamation-triangle"></i>
          <span>{{ t('dashboard.low_stock', 'Bajo Stock') }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- Contenido Principal -->

    <!-- Contenido Principal -->
    <main class="main-wrapper">
      <!-- Top Header con PrimeVue -->
      <header class="top-bar">
        <div class="location-tag">
          <span class="dot">●</span> Tienda activa: Central
        </div>

        <div class="actions">
          <LanguageSwitcher />
          <div class="user-badge">
            <i class="pi pi-bell"></i>
            <pv-avatar
                :label="currentUser.nombre ? currentUser.nombre[0] : 'U'"
                shape="circle"
                class="custom-avatar"
            />
            <div class="user-text">
              <span class="name">{{ currentUser.nombre }} {{ currentUser.apellidos }}</span>
              <span class="role">{{ currentUser.rol }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Encabezado de Bienvenida -->
      <section class="welcome-header">
        <h1>Hola, {{ currentUser.nombre }} 👋</h1>
        <p>Resumen operativo y métricas comerciales en tiempo real para tu tienda de mascotas.</p>
      </section>

      <!-- Fichas KPI con PrimeVue Card -->
      <section class="kpi-row">
        <pv-card class="kpi-card">
          <template #content>
            <div class="kpi-inner">
              <div class="kpi-data">
                <span class="label">Total stock</span>
                <div class="value-group">
                  <span class="value">{{ totalStock }}</span>
                  <small>unidades</small>
                </div>
                <span class="tag-status">Óptimo general</span>
              </div>
              <div class="icon-circle"><i class="pi pi-box"></i></div>
            </div>
          </template>
        </pv-card>

        <pv-card class="kpi-card">
          <template #content>
            <div class="kpi-inner">
              <div class="kpi-data">
                <span class="label">Ventas hoy</span>
                <div class="value-group">
                  <span class="value">S/ {{ salesToday }}</span>
                </div>
                <span class="tag-status positive">+16% vs ayer</span>
              </div>
              <div class="icon-circle"><i class="pi pi-chart-line"></i></div>
            </div>
          </template>
        </pv-card>

        <pv-card class="kpi-card">
          <template #content>
            <div class="kpi-inner">
              <div class="kpi-data">
                <span class="label">Ingresos mes</span>
                <div class="value-group">
                  <span class="value">S/ 12,450</span>
                </div>
                <span class="tag-status positive">+8.2% vs setiembre</span>
              </div>
              <div class="icon-circle"><i class="pi pi-wallet"></i></div>
            </div>
          </template>
        </pv-card>
      </section>

      <!-- Gráfico Semanal -->
      <pv-card class="chart-section">
        <template #content>
          <div class="box-header">
            <h3>Reportes de la semana</h3>
            <a href="#" class="link-orange">Ver desglose detallado →</a>
          </div>

          <div class="bars-chart">
            <div class="bar-column"><div class="bar-fill" style="height: 50%;"></div><span>Lun</span></div>
            <div class="bar-column"><div class="bar-fill" style="height: 65%;"></div><span>Mar</span></div>
            <div class="bar-column"><div class="bar-fill" style="height: 55%;"></div><span>Mié</span></div>
            <div class="bar-column"><div class="bar-fill" style="height: 70%;"></div><span>Jue</span></div>
            <div class="bar-column"><div class="bar-fill active" style="height: 95%;"></div><span>Vie</span></div>
            <div class="bar-column"><div class="bar-fill" style="height: 80%;"></div><span>Sáb</span></div>
            <div class="bar-column"><div class="bar-fill" style="height: 45%;"></div><span>Dom</span></div>
          </div>
        </template>
      </pv-card>

      <!-- Bloques de Alerta y Actividad con PrimeVue -->
      <section class="split-grid">
        <pv-card>
          <template #content>
            <div class="box-header">
              <h3><i class="pi pi-exclamation-triangle orange-icon"></i> Productos con bajo stock</h3>
              <pv-tag :value="lowStockProducts.length + ' alertas'" severity="warn" />
            </div>

            <div class="items-list">
              <div v-for="item in lowStockProducts" :key="item.id" class="list-row">
                <div>
                  <strong>{{ item.name }}</strong>
                  <span class="danger-text">Stock actual: {{ item.currentStock }} unidades</span>
                </div>
                <pv-button label="Reponer" size="small" />
              </div>
              <div v-if="lowStockProducts.length === 0" class="empty-text">
                Todo el stock se encuentra al día.
              </div>
            </div>
          </template>
        </pv-card>

        <pv-card>
          <template #content>
            <div class="box-header">
              <h3>Actividades recientes</h3>
              <span class="time-tag">Hoy</span>
            </div>
            <ul class="timeline-list">
              <li>
                <div class="circle-icon"><i class="pi pi-plus"></i></div>
                <div>
                  <strong>Producto añadido</strong>
                  <p>Ricocan Adulto 15kg (+12 un.)</p>
                </div>
              </li>
              <li>
                <div class="circle-icon"><i class="pi pi-shopping-bag"></i></div>
                <div>
                  <strong>Venta realizada</strong>
                  <p>Ticket #2041 - S/ 120.00</p>
                </div>
              </li>
            </ul>
          </template>
        </pv-card>
      </section>
    </main>
  </div>
</template>

<style scoped>
.petstock-app {
  display: flex;
  align-items: stretch;
  min-height: 100vh;
  background-color: #F8F5EF;
  color: #2F2019;
}

/* Sidebar Naranja Continua */
.sidebar-naranja {
  width: 260px;
  min-width: 260px;
  background-color: #ED6B15;
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  position: sticky;
  top: 0;
  height: 100vh;
  box-sizing: border-box;

  min-height: 100vh;
  height: auto;
  align-self: stretch;
}

.brand {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 1rem 0 1.5rem 0;
  text-align: center;
}

.brand-logo {
  width: 250px;
  height: auto;
  display: block;
  margin-left: auto !important;
  margin-right: auto !important;
  margin-bottom: -18px !important;
  transform: translateX(-3px);
  object-fit: contain;
}

.brand h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1 !important;
  text-align: center;
  width: 100%;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  color: #FFFFFF;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover, .nav-item.active {
  background-color: rgba(255, 255, 255, 0.25);
  font-weight: 700;
}

/* Área de contenido */
.main-wrapper {
  flex: 1;
  padding: 1.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location-tag {
  background-color: #E5D0B1;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #2F2019;
}

.dot {
  color: #ED6B15;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.custom-avatar {
  background-color: #825D38 !important;
  color: #FFFFFF !important;
}

.user-text {
  display: flex;
  flex-direction: column;
}

.user-text .name {
  font-weight: 700;
  font-size: 0.9rem;
}

.user-text .role {
  font-size: 0.75rem;
  color: #825D38;
}

.welcome-header h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.welcome-header p {
  color: #825D38;
  margin-top: 0.25rem;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.kpi-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-card .label {
  font-size: 0.9rem;
  color: #825D38;
}

.value-group {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  margin: 0.2rem 0;
}

.value-group .value {
  font-family: 'Poppins', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
}

.icon-circle {
  background-color: #F8F5EF;
  color: #ED6B15;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.link-orange {
  color: #ED6B15;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
}

.bars-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 180px;
  padding-top: 1rem;
}

.bar-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  height: 100%;
  justify-content: flex-end;
}

.bar-fill {
  width: 38px;
  background-color: #E5D0B1;
  border-radius: 6px;
}

.bar-fill.active {
  background-color: #ED6B15;
}

.split-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.5rem;
}

.list-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #F8F5EF;
}

.danger-text {
  display: block;
  color: #d9534f;
  font-size: 0.85rem;
}

.timeline-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.timeline-list li {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.circle-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #F8F5EF;
  color: #ED6B15;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>