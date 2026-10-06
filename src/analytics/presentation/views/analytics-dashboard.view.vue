<script setup>
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import LanguageSwitcher from "@/shared/presentation/components/language-switcher.vue";
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
  <main class="analytics-page">
    <header class="page-header">
      <div>
                <span class="eyebrow">
                    {{ t("analytics.eyebrow") }}
                </span>

        <h1>
          {{ t("analytics.title") }}
        </h1>

        <p>
          {{ t("analytics.subtitle") }}
        </p>
      </div>

      <div class="header-actions">
        <LanguageSwitcher />

        <img
            src="/font/logo-petstock.png"
            alt="PetStock"
            class="petstock-logo"
        />
      </div>
    </header>

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
</template>

<style scoped>
.analytics-page {
  width: min(100% - 2rem, 1180px);
  margin: 0 auto;
  padding: 2rem 0 3rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.page-header p {
  margin: 0.35rem 0 0;
  color: #766b62;
  font-size: 0.85rem;
}

.eyebrow {
  color: var(--primary-color);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.page-header h1 {
  margin: 0.2rem 0 0;
  color: #243b53;
  font-size: clamp(1.7rem, 3vw, 2.3rem);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  display: grid;
  width: 50px;
  height: 50px;
  place-items: center;
  border: 1px solid #eadbc9;
  border-radius: 50%;
  color: var(--primary-color);
  background: #fff;
}

.reports-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.movement-section {
  margin-bottom: 1rem;
}

.inventory-section h2 {
  margin: 0 0 0.8rem;
  color: #243b53;
  font-size: 1rem;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.inventory-card {
  border: 1px solid #eadbc9;
  border-radius: 16px;
  box-shadow: none;
}

.inventory-icon {
  display: grid;
  width: 34px;
  height: 34px;
  margin-bottom: 0.7rem;
  place-items: center;
  border-radius: 9px;
  color: var(--primary-color);
  background: #fff1e7;
}

.inventory-card span {
  display: block;
  color: #766b62;
  font-size: 0.72rem;
}

.inventory-card strong {
  display: block;
  margin-top: 0.15rem;
  color: #243b53;
  font-size: 1.35rem;
}

.inventory-card small {
  color: var(--primary-color);
  font-size: 0.65rem;
}

.download-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  margin-top: 1.5rem;
}

.petstock-logo {
  width: 110px;
  height: auto;
  object-fit: contain;
}

.download-button {
  width: min(100%, 420px);
  border-color: var(--primary-color);
  background: var(--primary-color);
}

.download-section small {
  color: #766b62;
  font-size: 0.65rem;
  text-align: center;
}

.state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  min-height: 300px;
  color: #766b62;
}

.state i {
  color: var(--primary-color);
}

.state.error {
  color: #b42318;
}

@media (max-width: 850px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .analytics-page {
    width: min(100% - 1.25rem, 600px);
    padding: 1.25rem 0 2rem;
  }

  .petstock-logo {
    width: 85px;
  }

  .page-header {
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .header-actions {
    gap: 0.4rem;
  }

  .header-icon {
    width: 44px;
    height: 44px;
  }

  .inventory-grid {
    gap: 0.65rem;
  }
}

@media print {
  .header-actions,
  .download-section {
    display: none;
  }

  .analytics-page {
    width: 100%;
    padding: 0;
  }
}
</style>