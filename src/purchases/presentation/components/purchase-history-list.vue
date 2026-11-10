<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  purchases: { type: Array, default: () => [] },
  submitting: { type: Boolean, default: false }
})

const { t, locale } = useI18n()
const emit = defineEmits(['delete-purchase'])

const newestPurchases = computed(() => [...props.purchases].sort(
  (first, second) => new Date(second.date) - new Date(first.date)
))

function formatDate(date) {
  if (!date) return t('purchases.no_date')
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(new Date(`${date}T00:00:00`))
}

function formatMoney(value) {
  return new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'PEN' }).format(Number(value || 0))
}

function confirmDelete(purchase) {
  if (window.confirm(t('purchases.confirm_delete', { product: purchase.productName }))) {
    emit('delete-purchase', purchase)
  }
}
</script>

<template>
  <section class="purchase-history-card">
    <div class="purchase-history-heading">
      <div>
        <span class="purchase-eyebrow">{{ t('purchases.history_eyebrow') }}</span>
        <h2>{{ t('purchases.history_title') }}</h2>
      </div>
      <span class="purchase-count">{{ purchases.length }} {{ t('purchases.records') }}</span>
    </div>

    <div v-if="newestPurchases.length" class="purchase-history-list">
      <article v-for="purchase in newestPurchases" :key="purchase.id" class="purchase-history-item">
        <div class="purchase-history-header">
          <div class="purchase-history-icon"><i class="pi pi-truck"></i></div>
          <div class="purchase-history-main">
            <strong>{{ purchase.supplierName }}</strong>
            <span class="purchase-date-text"><i class="pi pi-clock"></i> {{ formatDate(purchase.date) }}</span>
          </div>
          <div class="purchase-history-actions">
            <strong class="purchase-history-total">{{ formatMoney(purchase.total) }}</strong>
            <button
              type="button"
              class="purchase-delete-button"
              :aria-label="t('purchases.delete_button')"
              :title="t('purchases.delete_button')"
              :disabled="submitting"
              @click="confirmDelete(purchase)"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
        <div class="purchase-history-body">
          <div class="purchase-history-product">
            <i class="pi pi-box"></i>
            <span>{{ purchase.productName }}</span>
          </div>
          <span class="purchase-quantity-badge">{{ purchase.quantity }} {{ t('purchases.units') }}</span>
          <span class="purchase-unit-cost">{{ formatMoney(purchase.unitCost) }} {{ t('purchases.per_unit') }}</span>
        </div>
      </article>
    </div>

    <div v-else class="purchase-empty-state">
      <i class="pi pi-inbox"></i>
      <strong>{{ t('purchases.empty_title') }}</strong>
      <span>{{ t('purchases.empty_description') }}</span>
    </div>
  </section>
</template>
