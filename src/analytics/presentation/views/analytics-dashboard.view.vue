<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAnalyticsStore } from "../../application/analytics.store.js";
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


onMounted(() => {
  loadDashboard();
});

function printReport() {
  window.print();
}
</script>

<template>
  <div class="page">
    <div class="main-wrapper">

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
    </div>
  </div>
</template>

<style scoped>
.main-wrapper {
  flex: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
  .main-wrapper {
  
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
  
}
}
</style>