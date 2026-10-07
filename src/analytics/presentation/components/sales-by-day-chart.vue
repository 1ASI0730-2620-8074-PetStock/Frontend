<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const props = defineProps({
  sales: {
    type: Array,
    default: () => []
  }
});

const dayNames = computed(() => {
  return locale.value === "en"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
});

function getAmount(item) {
  if (!item) return 0;

  return Number(
      item.amount ??
      item.total ??
      item.sales ??
      item.value ??
      item.ventas ??
      item.ingresos ??
      0
  );
}

const chartData = computed(() => {
  return dayNames.value.map((day, index) => {
    const item = props.sales[index];

    return {
      day,
      amount: getAmount(item),
      isPeak: Boolean(item?.isPeak)
    };
  });
});

const total = computed(() => {
  return chartData.value.reduce(
      (sum, item) => sum + item.amount,
      0
  );
});

const highestDay = computed(() => {
  if (!chartData.value.length) {
    return null;
  }

  return chartData.value.reduce((highest, current) => {
    return current.amount > highest.amount
        ? current
        : highest;
  });
});

const maxAmount = computed(() => {
  return Math.max(
      ...chartData.value.map(item => item.amount),
      1
  );
});

function formatAmount(amount) {
  return new Intl.NumberFormat(
      locale.value === "en" ? "en-US" : "es-PE",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }
  ).format(amount);
}
</script>

<template>
  <pv-card class="chart-card">
    <template #content>
      <div class="chart-header">
        <div>
                    <span class="eyebrow">
                        {{ t("analytics.weeklyMetrics") }}
                    </span>

          <h2>
            {{ t("analytics.salesByDay") }}
          </h2>
        </div>

        <span class="weekly-total">
                    {{ t("analytics.weeklyTotal") }}
                    <strong>
                        S/ {{ formatAmount(total) }}
                    </strong>
                </span>
      </div>

      <div class="bar-chart">
        <div
            v-for="item in chartData"
            :key="item.day"
            class="bar-column"
        >
                    <span class="bar-value">
                        S/ {{ formatAmount(item.amount) }}
                    </span>

          <div class="bar-area">
            <div
                class="bar"
                :class="{ peak: item.isPeak }"
                :style="{
                                height: `${Math.max(
                                    (item.amount / maxAmount) * 100,
                                    item.amount > 0 ? 8 : 2
                                )}%`
                            }"
            ></div>
          </div>

          <span class="bar-day">
                        {{ item.day }}
                    </span>
        </div>
      </div>

      <div class="chart-footer">
                <span>
                    <i class="pi pi-circle-fill"></i>
                    {{ t("analytics.highestRevenueDay") }}
                </span>

        <strong v-if="highestDay">
          {{ highestDay.day }}
          (S/ {{ formatAmount(highestDay.amount) }})
        </strong>

        <strong v-else>
          {{ t("analytics.noInformation") }}
        </strong>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.chart-card {
  border: 1px solid #eadbc9;
  border-radius: 16px;
  box-shadow: none;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.eyebrow {
  color: var(--primary-color);
  font-size: 0.62rem;
  font-weight: 700;
}

.chart-header h2 {
  margin: 0.25rem 0 0;
  color: #243b53;
  font-size: 1rem;
}

.weekly-total {
  color: #766b62;
  font-size: 0.7rem;
  white-space: nowrap;
}

.weekly-total strong {
  color: var(--primary-color);
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.6rem;
  height: 220px;
  margin-top: 1.2rem;
  padding: 0 0.4rem;
  border-bottom: 1px solid #eadbc9;
}

.bar-column {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  height: 100%;
}

.bar-value {
  margin-bottom: 0.35rem;
  color: #766b62;
  font-size: 0.58rem;
  white-space: nowrap;
}

.bar-area {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  height: 75%;
}

.bar {
  width: min(42px, 65%);
  min-height: 3px;
  border: 1px solid #d6b98f;
  border-radius: 6px 6px 0 0;
  background: #e5d0b1;
  transition: height 0.3s ease;
}

.bar.peak {
  border-color: #ed6b15;
  background: #ed6b15;
}

.bar-day {
  margin-top: 0.4rem;
  color: #766b62;
  font-size: 0.62rem;
}

.chart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.7rem;
  color: #766b62;
  font-size: 0.65rem;
}

.chart-footer span {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.chart-footer i {
  color: var(--primary-color);
  font-size: 0.4rem;
}

.chart-footer strong {
  color: #243b53;
}

@media (max-width: 600px) {
  .chart-header {
    flex-direction: column;
    gap: 0.4rem;
  }

  .bar-chart {
    height: 180px;
    gap: 0.3rem;
  }

  .bar-value {
    font-size: 0.5rem;
  }

  .chart-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.25rem;
  }
}

@media print {
  .chart-card {
    break-inside: avoid;
    page-break-inside: avoid;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .bar-chart {
    height: 220px;
    min-height: 220px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .bar-area {
    height: 75%;
    min-height: 150px;
  }

  .bar {
    min-height: 4px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .bar.peak {
    background: #ed6b15 !important;
  }

  .bar:not(.peak) {
    background: #e5d0b1 !important;
  }
}
</style>