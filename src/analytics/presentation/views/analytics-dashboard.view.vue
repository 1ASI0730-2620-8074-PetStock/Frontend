<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAnalyticsStore } from "../../application/analytics.store.js";
import LanguageSwitcher from "@/shared/presentation/components/language-switcher.vue";
import SalesByDayChart from "../components/sales-by-day-chart.vue";
import TopProductsList from "../components/top-products-list.vue";
import LowMovementList from "../components/low-movement-list.vue";

const { t } = useI18n();

const {
  report,
  loading,
  error,
  loadDashboard
} = useAnalyticsStore();

const isMobileMenuOpen = ref(false);

onMounted(() => {
  loadDashboard();
});

function printReport() {
  window.print();
}
</script>

<template>
  <div class="petstock-app">
    <div
        v-if="isMobileMenuOpen"
        class="sidebar-overlay"
        @click="isMobileMenuOpen = false"
    ></div>

    <aside
        class="sidebar-naranja"
        :class="{ 'mobile-open': isMobileMenuOpen }"
    >
      <div class="brand">
        <img
            src="/font/logo2.png"
            alt="PetStock Logo"
            class="brand-logo"
        />
        <h2>PetStock</h2>
      </div>

      <nav
          class="sidebar-nav"
          @click="isMobileMenuOpen = false"
      >
        <router-link
            to="/dashboard"
            class="nav-item"
        >
          <i class="pi pi-th-large"></i>
          <span>Dashboard (Inicio)</span>
        </router-link>

        <router-link
            to="/catalog"
            class="nav-item"
        >
          <i class="pi pi-box"></i>
          <span>Registrar Producto</span>
        </router-link>

        <router-link
            to="/sales"
            class="nav-item"
        >
          <i class="pi pi-shopping-bag"></i>
          <span>Registrar Venta</span>
        </router-link>

        <router-link
            to="/analytics"
            class="nav-item active"
        >
          <i class="pi pi-file"></i>
          <span>Reportes</span>
        </router-link>

        <router-link
            to="/inventory"
            class="nav-item"
        >
          <i class="pi pi-exclamation-triangle"></i>
          <span>Bajo Stock</span>
        </router-link>
      </nav>
    </aside>

    <main class="main-wrapper">
      <header class="top-header">
        <div class="header-left-group">
          <button
              type="button"
              class="mobile-menu-toggle"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <i class="pi pi-bars"></i>
          </button>

          <div class="location-tag">
            <span class="pulse-dot"></span>
            <span>
                            Sucursal Activa:
                            <strong>Central</strong>
                        </span>
          </div>
        </div>

        <div class="actions">
          <LanguageSwitcher />
        </div>
      </header>

      <section class="module-header-card">
        <div class="module-info">
          <h1 class="page-title">
            {{ t("analytics.title") }}
          </h1>

          <p class="page-subtitle">
            {{ t("analytics.subtitle") }}
          </p>
        </div>
      </section>

      <div v-if="loading" class="state">
        <i class="pi pi-spin pi-spinner"></i>
        <span>{{ t("analytics.loading") }}</span>
      </div>

      <div v-else-if="error" class="state error">
        <i class="pi pi-exclamation-circle"></i>
        <span>{{ error }}</span>
      </div>

      <template v-else-if="report">
        <section class="reports-grid">
          <SalesByDayChart
              :sales="report.weeklySales"
          />

          <TopProductsList
              :products="report.topProducts"
          />
        </section>

        <section class="movement-section">
          <LowMovementList
              :products="report.lowMovementProducts"
          />
        </section>

        <section class="inventory-section">
          <h2>
            {{ t("analytics.inventory.title") }}
          </h2>

          <div class="inventory-grid">
            <pv-card class="inventory-card">
              <template #content>
                <div class="inventory-icon">
                  <i class="pi pi-box"></i>
                </div>

                <span>
                                    {{ t("analytics.inventory.products") }}
                                </span>

                <strong>
                  {{ report.metrics?.availableProducts ?? 0 }}
                </strong>

                <small>
                  {{ t("analytics.inventory.inCatalog") }}
                </small>
              </template>
            </pv-card>

            <pv-card class="inventory-card">
              <template #content>
                <div class="inventory-icon">
                  <i class="pi pi-th-large"></i>
                </div>

                <span>
                                    {{ t("analytics.inventory.categories") }}
                                </span>

                <strong>
                  {{ report.metrics?.categories ?? 0 }}
                </strong>

                <small>
                  {{ t("analytics.inventory.active") }}
                </small>
              </template>
            </pv-card>
          </div>
        </section>

        <div class="download-section">
          <pv-button
              :label="t('analytics.downloadPdf')"
              icon="pi pi-download"
              class="download-button"
              @click="printReport"
          />

          <small>
            {{ t("analytics.pdfHint") }}
          </small>
        </div>
      </template>

      <div v-else class="state">
        <i class="pi pi-info-circle"></i>
        <span>
                    {{ t("analytics.noInformation") }}
                </span>
      </div>
    </main>
  </div>
</template>

<style scoped>
.petstock-app {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-color: #FAF7F2;
  color: #2F2019;
  font-family: "Poppins", sans-serif;
  position: relative;
}

.mobile-menu-toggle {
  display: none;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: #ED6B15;
  color: #FFFFFF;
  font-size: 1.1rem;
  cursor: pointer;
}

.header-left-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sidebar-overlay {
  display: none;
}

.sidebar-naranja {
  width: 260px;
  min-width: 260px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  box-sizing: border-box;
  padding: 1.5rem 1rem;
  background-color: #ED6B15;
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: transform 0.3s ease;
}

.brand {
  width: 100%;
  margin: 0.5rem 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  margin: 0 !important;
  color: #FFFFFF;
  font-size: 1.5rem;
  font-weight: 700;
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
  border-radius: 8px;
  color: #FFFFFF;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover,
.nav-item.active {
  background-color: rgba(255, 255, 255, 0.25);
  font-weight: 700;
}

.main-wrapper {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.top-header {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border: 1px solid #EEDFC8;
  border-radius: 14px;
  background: #FFFFFF;
  box-shadow: 0 2px 10px rgba(47, 32, 25, 0.03);
}

.location-tag {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid #EEDFC8;
  border-radius: 20px;
  background: #FDF8F2;
  color: #5A3E2B;
  font-size: 0.8rem;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: #ED6B15;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.module-header-card {
  width: 100%;
  box-sizing: border-box;
  padding: 1.75rem 2rem;
  border: 1px solid #EEDFC8;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: 0 4px 15px rgba(47, 32, 25, 0.03);
}

.page-title {
  margin: 0 0 0.2rem;
  color: #2F2019;
  font-size: 1.65rem;
  font-weight: 700;
}

.page-subtitle {
  margin: 0;
  color: #7A5C45;
  font-size: 0.92rem;
}

.reports-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1rem;
}

.movement-section {
  margin-top: 0;
}

.inventory-section h2 {
  margin: 0 0 0.8rem;
  color: #2F2019;
  font-size: 1rem;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.inventory-card {
  border: 1px solid #EEDFC8;
  border-radius: 16px;
  box-shadow: none;
}

.inventory-icon {
  width: 34px;
  height: 34px;
  margin-bottom: 0.7rem;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: #FFF1E7;
  color: #ED6B15;
}

.inventory-card span {
  display: block;
  color: #7A5C45;
  font-size: 0.72rem;
}

.inventory-card strong {
  display: block;
  margin-top: 0.15rem;
  color: #2F2019;
  font-size: 1.35rem;
}

.inventory-card small {
  color: #ED6B15;
  font-size: 0.65rem;
}

.download-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.5rem;
}

.download-button {
  width: min(100%, 420px);
  border-color: #ED6B15;
  background: #ED6B15;
}

.download-section small {
  color: #7A5C45;
  font-size: 0.65rem;
  text-align: center;
}

.state {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: #7A5C45;
}

.state i {
  color: #ED6B15;
}

.state.error {
  color: #B42318;
}

@media (max-width: 850px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 99;
    background: rgba(0, 0, 0, 0.4);
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

  .module-header-card {
    padding: 1.25rem;
  }
}

@media (max-width: 600px) {
  .inventory-grid {
    gap: 0.65rem;
  }

  .page-title {
    font-size: 1.45rem;
  }
}

@media print {
  .sidebar-naranja,
  .top-header,
  .download-section {
    display: none;
  }

  .main-wrapper {
    margin-left: 0;
    padding: 0;
  }

  .petstock-app {
    background: #FFFFFF;
  }
}
</style>