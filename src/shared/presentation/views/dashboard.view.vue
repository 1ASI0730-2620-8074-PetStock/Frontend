<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import http from '@/shared/infrastructure/http-common.js';
import { useIdentityStore } from '@/iam/application/identity.store.js';
import { useAnalyticsStore } from '@/analytics/application/analytics.store.js';

const { t } = useI18n();
const identityStore = useIdentityStore();
const analyticsStore = useAnalyticsStore();

// Nombre del usuario que inició sesión
const firstName = computed(() => identityStore.currentUser?.name || '');

const products = ref([]);
const inventories = ref([]);
const sales = ref([]);
const lowStockProducts = ref([]);
const report = analyticsStore.report;

// Métricas del Dashboard
const totalStock = computed(() => inventories.value.reduce((acc, curr) => acc + (curr.currentStock || 0), 0));
const salesToday = computed(() => sales.value.reduce((acc, curr) => acc + (curr.total || 0), 0));


const weekBars = computed(() => {
  const sales = report.value?.weeklySales || [];
  const maxAmount = Math.max(...sales.map(item => Number(item.amount || 0)), 1);

  const days = [
    'dashboard.days.mon',
    'dashboard.days.tue',
    'dashboard.days.wed',
    'dashboard.days.thu',
    'dashboard.days.fri',
    'dashboard.days.sat',
    'dashboard.days.sun'
  ];

  return days.map((day, index) => {
    const item = sales[index];

    return {
      day,
      amount: Number(item?.amount || 0),
      height: item ? Math.max(
              (Number(item.amount || 0) / maxAmount) * 100, item.amount > 0 ? 8 : 2) : 2,
      active: Boolean(item?.isPeak)
    };
  });
});

onMounted(async () => {
  try {
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
          const prod = products.value.find(p => String(p.id) === String(inv.productId));
          return {
            id: inv.id,
            name: prod ? prod.name : t('dashboard.product'),
            currentStock: inv.currentStock
          };
        });
      await analyticsStore.loadDashboard();
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
});
</script>

<template>
  <div class="dashboard">
    <!-- Encabezado de Bienvenida -->
    <section class="welcome-header">
      <h1>{{ t('dashboard.greeting', { name: firstName }) }} 👋</h1>
      <p>{{ t('dashboard.subtitle') }}</p>
    </section>

    <!-- Fichas KPI con PrimeVue Card -->
    <section class="kpi-row">
      <pv-card class="kpi-card">
        <template #content>
          <div class="kpi-inner">
            <div class="kpi-data">
              <span class="label">{{ t('dashboard.total_stock') }}</span>
              <div class="value-group">
                <span class="value">{{ totalStock }}</span>
                <small>{{ t('dashboard.units') }}</small>
              </div>
              <span class="tag-status">{{ t('dashboard.stock_status') }}</span>
            </div>
            <div class="icon-circle"><i class="pi pi-box"></i></div>
          </div>
        </template>
      </pv-card>

      <pv-card class="kpi-card">
        <template #content>
          <div class="kpi-inner">
            <div class="kpi-data">
              <span class="label">{{ t('dashboard.sales_today') }}</span>
              <div class="value-group">
                <span class="value">S/ {{ salesToday }}</span>
              </div>
              <span class="tag-status positive">{{ t('dashboard.sales_trend') }}</span>
            </div>
            <div class="icon-circle"><i class="pi pi-chart-line"></i></div>
          </div>
        </template>
      </pv-card>

      <pv-card class="kpi-card">
        <template #content>
          <div class="kpi-inner">
            <div class="kpi-data">
              <span class="label">{{ t('dashboard.month_income') }}</span>
              <div class="value-group">
                <span class="value">S/ 12,450</span>
              </div>
              <span class="tag-status positive">{{ t('dashboard.income_trend') }}</span>
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
          <h3>{{ t('dashboard.week_reports') }}</h3>
          <router-link to="/analytics" class="link-orange">{{ t('dashboard.see_details') }} →</router-link>
        </div>

        <div class="bars-chart">
          <div v-for="bar in weekBars" :key="bar.day" class="bar-column">
        <span class="bar-value">
            S/ {{ bar.amount }}
        </span>
            <div class="bar-area">
              <div class="bar-fill" :class="{ active: bar.active }" :style="{ height: bar.height + '%' }"
              ></div>
            </div>

            <span>{{ t(bar.day) }}</span>
          </div>
        </div>
      </template>
    </pv-card>

    <!-- Bloques de Alerta y Actividad con PrimeVue -->
    <section class="split-grid">
      <pv-card>
        <template #content>
          <div class="box-header">
            <h3><i class="pi pi-exclamation-triangle orange-icon"></i> {{ t('dashboard.low_stock_title') }}</h3>
            <pv-tag :value="t('dashboard.alerts', { count: lowStockProducts.length })" severity="warn" />
          </div>

          <div class="items-list">
            <div v-for="item in lowStockProducts" :key="item.id" class="list-row">
              <div>
                <strong>{{ item.name }}</strong>
                <span class="danger-text">{{ t('dashboard.current_stock', { count: item.currentStock }) }}</span>
              </div>
              <router-link to="/inventory">
                <pv-button :label="t('dashboard.replenish')" size="small" />
              </router-link>
            </div>
            <div v-if="lowStockProducts.length === 0" class="empty-text">
              {{ t('dashboard.stock_ok') }}
            </div>
          </div>
        </template>
      </pv-card>

      <pv-card>
        <template #content>
          <div class="box-header">
            <h3>{{ t('dashboard.recent_activity') }}</h3>
            <span class="time-tag">{{ t('dashboard.today') }}</span>
          </div>
          <ul class="timeline-list">
            <li>
              <div class="circle-icon"><i class="pi pi-plus"></i></div>
              <div>
                <strong>{{ t('dashboard.product_added') }}</strong>
                <p>Ricocan Adulto 15kg (+12)</p>
              </div>
            </li>
            <li>
              <div class="circle-icon"><i class="pi pi-shopping-bag"></i></div>
              <div>
                <strong>{{ t('dashboard.sale_done') }}</strong>
                <p>Ticket #2041 - S/ 120.00</p>
              </div>
            </li>
          </ul>
        </template>
      </pv-card>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  gap: 0.75rem;
  height: 180px;
  padding-top: 1rem;
}
.bar-column {
  display: flex;
  flex:1;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  height: 100%;
  justify-content: flex-end;
}

.bar-value {
  margin-bottom: 0.35rem;
  color: #766b62;
  font-size: 0.62rem;
  white-space: nowrap;
}

.bar-area {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  height: 75%;
}

.bar-fill {
  width: min(38px, 65%);
  min-height: 3px;
  border-radius: 6px 6px 0 0;
  background-color: #E5D0B1;
  transition: height 0.3s ease;
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

/* Celular y tablet: una sola columna */
@media (max-width: 900px) {
  .kpi-row,
  .split-grid {
    grid-template-columns: 1fr;
  }

  .bar-fill {
    width: 22px;
  }
}
</style>
