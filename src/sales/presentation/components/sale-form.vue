<script setup>
import { ref, computed } from 'vue';
import { Sale } from '../../domain/model/sale.entity.js';

const props = defineProps({
  products: { type: Array, default: () => [] },
  customers: { type: Array, default: () => [] },
  submitting: { type: Boolean, default: false }
});

const emit = defineEmits(['submit-sale', 'open-customer-modal', 'switch-history']);

const selectedProductId = ref(null);
const quantity = ref(1);
const selectedCustomerId = ref(null);
const saleDate = ref(new Date().toISOString().slice(0, 10));

const selectedProduct = computed(() => {
  return props.products.find(p => String(p.id) === String(selectedProductId.value)) || null;
});

const availableStock = computed(() => {
  return selectedProduct.value ? Number(selectedProduct.value.stock) || 0 : 0;
});

function incrementQuantity() {
  if (quantity.value < availableStock.value) quantity.value++;
}

function decrementQuantity() {
  if (quantity.value > 1) quantity.value--;
}

const resolvedCustomerName = computed(() => {
  const cust = props.customers.find(c => String(c.id) === String(selectedCustomerId.value));
  return cust ? cust.name : 'Cliente General';
});

const calculatedTotal = computed(() => {
  const price = selectedProduct.value ? Number(selectedProduct.value.price) || 0 : 0;
  return (price * quantity.value).toFixed(2);
});

const productOptions = computed(() => {
  return props.products.map(p => ({
    label: `${p.name} - S/ ${Number(p.price).toFixed(2)} (${p.stock} uds)`,
    value: p.id
  }));
});

const customerOptions = computed(() => {
  return props.customers.map(c => ({
    label: `${c.name} ${c.phone ? `(${c.phone})` : ''}`,
    value: c.id
  }));
});

function onSubmit() {
  if (!selectedProductId.value) return;
  const newSale = new Sale(
      null,
      selectedProductId.value,
      selectedProduct.value.name,
      quantity.value,
      selectedCustomerId.value,
      resolvedCustomerName.value,
      saleDate.value,
      Number(calculatedTotal.value),
      1
  );
  emit('submit-sale', newSale);
  quantity.value = 1;
}
</script>

<template>
  <div class="sale-form-card">
    <div class="form-field">
      <label class="field-label">{{ $t('sales.product_label') }} <span class="required">*</span></label>
      <select v-model="selectedProductId" class="native-select">
        <option disabled value="null">{{ $t('sales.product_placeholder') }}</option>
        <option v-for="p in productOptions" :key="p.value" :value="p.value">
          {{ p.label }}
        </option>
      </select>
    </div>

    <div class="form-field">
      <label class="field-label">{{ $t('sales.quantity_label') }} <span class="required">*</span></label>
      <div class="quantity-stepper-container">
        <div class="stepper-controls">
          <button type="button" class="stepper-btn" :disabled="quantity <= 1" @click="decrementQuantity">
            <i class="pi pi-minus"></i>
          </button>
          <span class="stepper-value">{{ quantity }}</span>
          <button type="button" class="stepper-btn plus" :disabled="quantity >= availableStock" @click="incrementQuantity">
            <i class="pi pi-plus"></i>
          </button>
        </div>
      </div>
      <div class="stock-helper" :class="{ 'no-stock': availableStock <= 0 }">
        <i class="pi pi-box"></i>
        <span>{{ $t('sales.stock_available', { count: availableStock }) }}</span>
      </div>
    </div>

    <div class="form-field">
      <div class="field-label-row">
        <label class="field-label">{{ $t('sales.customer_label') }} <span class="required">*</span></label>
        <button type="button" class="text-link-btn" @click="$emit('open-customer-modal')">
          {{ $t('sales.customer_new') }}
        </button>
      </div>
      <select v-model="selectedCustomerId" class="native-select">
        <option disabled value="null">{{ $t('sales.customer_placeholder') }}</option>
        <option v-for="c in customerOptions" :key="c.value" :value="c.value">
          {{ c.label }}
        </option>
      </select>
    </div>

    <div class="form-field">
      <label class="field-label">{{ $t('sales.date_label') }} <span class="required">*</span></label>
      <div class="date-input-wrapper">
        <input type="date" v-model="saleDate" class="native-date-input" />
        <i class="pi pi-calendar date-icon"></i>
      </div>
    </div>

    <!-- Resumen -->
    <div class="resumen-card">
      <div class="resumen-header">
        <div class="resumen-badge-left">
          <i class="pi pi-file-edit"></i>
          <span class="resumen-title">{{ $t('sales.summary_title') }}</span>
        </div>
        <span class="resumen-tag">{{ $t('sales.summary_tag') }}</span>
      </div>
      <div class="resumen-grid">
        <div class="resumen-item">
          <span class="item-label">{{ $t('sales.summary_product') }}</span>
          <span class="item-value font-semibold">{{ selectedProduct ? selectedProduct.name : '—' }}</span>
        </div>
        <div class="resumen-item">
          <span class="item-label">{{ $t('sales.summary_quantity') }}</span>
          <span class="item-value font-semibold">{{ $t('sales.units', { count: quantity }) }}</span>
        </div>
        <div class="resumen-item">
          <span class="item-label">{{ $t('sales.summary_customer') }}</span>
          <span class="item-value font-semibold">{{ resolvedCustomerName }}</span>
        </div>
        <div class="resumen-item">
          <span class="item-label">{{ $t('sales.summary_date') }}</span>
          <span class="item-value font-semibold">{{ saleDate }}</span>
        </div>
      </div>
      <div class="resumen-total-divider"></div>
      <div class="resumen-total-row">
        <span class="total-label">{{ $t('sales.summary_total') }}</span>
        <span class="total-amount">S/ {{ calculatedTotal }}</span>
      </div>
    </div>

    <div class="actions-wrapper">
      <button
          type="button"
          class="btn-register-sale"
          :disabled="submitting || availableStock <= 0"
          @click="onSubmit"
      >
        <i class="pi pi-check mr-2"></i>
        <span>{{ $t('sales.submit_button') }}</span>
      </button>

      <button type="button" class="btn-view-history" @click="$emit('switch-history')">
        <i class="pi pi-history mr-2"></i>
        <span>{{ $t('sales.history_link') }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.sale-form-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #E5D0B1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.form-field { display: flex; flex-direction: column; gap: 0.4rem; }
.field-label { font-size: 0.88rem; font-weight: 600; color: #2F2019; }
.field-label-row { display: flex; justify-content: space-between; align-items: center; }
.required { color: #EF4444; }
.text-link-btn { background: none; border: none; color: #ED6B15; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
.native-select, .native-date-input {
  width: 100%; padding: 0.75rem 1rem; border: 1px solid #E5E7EB; border-radius: 12px;
  background-color: #FFFDFB; font-size: 0.95rem; color: #2F2019; box-sizing: border-box; outline: none;
}
.native-select:focus, .native-date-input:focus { border-color: #ED6B15; }
.quantity-stepper-container { display: flex; align-items: center; justify-content: flex-end; }
.stepper-controls {
  display: inline-flex; align-items: center; background: #F9FAFB; border: 1px solid #E5E7EB;
  border-radius: 12px; padding: 0.25rem; gap: 0.75rem;
}
.stepper-btn {
  width: 36px; height: 36px; border-radius: 8px; border: 1px solid #E5E7EB; background: #ffffff;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.stepper-btn.plus { background: #0F172A; color: #ffffff; border-color: #0F172A; }
.stock-helper { display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: #825D38; }
.stock-helper.no-stock { color: #EF4444; font-weight: 600; }
.date-input-wrapper { position: relative; display: flex; align-items: center; }
.date-icon { position: absolute; right: 1rem; color: #9CA3AF; pointer-events: none; }
.resumen-card {
  background: #F8F5EF; border: 1px solid #E5D0B1; border-radius: 16px; padding: 1.25rem; margin-top: 0.5rem;
}
.resumen-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.resumen-badge-left { display: flex; align-items: center; gap: 0.4rem; color: #2F2019; }
.resumen-title { font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; color: #2F2019; }
.resumen-tag {
  background: #E5D0B1; color: #2F2019; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.65rem; border-radius: 999px;
}
.resumen-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem 1.25rem; }
.resumen-item { display: flex; flex-direction: column; gap: 0.2rem; }
.item-label { font-size: 0.78rem; color: #825D38; }
.item-value { font-size: 0.92rem; color: #2F2019; }
.font-semibold { font-weight: 600; }
.resumen-total-divider { height: 1px; background: #E5D0B1; margin: 1rem 0; }
.resumen-total-row { display: flex; justify-content: space-between; align-items: center; }
.total-label { font-size: 0.95rem; font-weight: 600; color: #2F2019; }
.total-amount { font-size: 1.35rem; font-weight: 800; color: #ED6B15; }
.actions-wrapper { display: flex; flex-direction: column; gap: 0.85rem; margin-top: 0.5rem; }
.btn-register-sale {
  width: 100%; padding: 0.9rem; border-radius: 12px; background: #0F172A; color: #ffffff; border: none;
  font-size: 1rem; font-weight: 600; display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.btn-register-sale:hover:not(:disabled) { background: #1E293B; }
.btn-register-sale:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-view-history {
  width: 100%; padding: 0.65rem; background: transparent; border: none; color: #825D38; font-size: 0.9rem;
  font-weight: 500; display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.btn-view-history:hover { color: #ED6B15; }
.mr-2 { margin-right: 0.5rem; }
</style>