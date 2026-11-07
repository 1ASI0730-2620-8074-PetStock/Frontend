<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSalesStore } from '../../application/sales.store.js';
import { useIdentityStore } from '@/iam/application/identity.store.js';
import './sale-form.css';

const { t } = useI18n();
const salesStore = useSalesStore();
const identityStore = useIdentityStore();

const selectedProduct = ref(null);
const quantity = ref(1);
const selectedCustomer = ref(null);
const saleDate = ref(new Date().toISOString().split('T')[0]);
const paymentMethod = ref('cash');
const successMessage = ref('');

const showNewCustomerModal = ref(false);
const newCustName = ref('');
const newCustEmail = ref('');
const newCustPhone = ref('');
const formError = ref('');
const customerError = ref('');
const customerSaving = ref(false);

const maximumQuantity = computed(() => Number(selectedProduct.value?.stock || 0));
const canSubmit = computed(() =>
  Boolean(selectedProduct.value) &&
  maximumQuantity.value > 0 &&
  Number.isInteger(Number(quantity.value)) &&
  Number(quantity.value) > 0 &&
  Number(quantity.value) <= maximumQuantity.value &&
  Boolean(saleDate.value) &&
  !salesStore.submitting
);

watch(selectedProduct, product => {
  formError.value = '';
  quantity.value = 1;
});

watch(quantity, value => {
  if (selectedProduct.value && Number(value) > maximumQuantity.value && maximumQuantity.value > 0) {
    quantity.value = maximumQuantity.value;
  }
});

const calculatedTotal = computed(() => {
  if (!selectedProduct.value) return 0;
  const price = Number(selectedProduct.value.price || 0);
  return price * (Number(quantity.value) || 1);
});

async function handleCreateCustomer() {
  if (!newCustName.value.trim()) {
    customerError.value = t('sales.customer_name_required');
    return;
  }

  customerError.value = '';
  customerSaving.value = true;
  const newCustomerData = {
    name: newCustName.value.trim(),
    email: newCustEmail.value.trim(),
    phone: newCustPhone.value.trim()
  };

  try {
    selectedCustomer.value = await salesStore.addCustomer(newCustomerData);
    showNewCustomerModal.value = false;
    newCustName.value = '';
    newCustEmail.value = '';
    newCustPhone.value = '';
  } catch (error) {
    customerError.value = t('sales.customer_save_error');
    console.error('Error al registrar cliente desde ventas:', error);
  } finally {
    customerSaving.value = false;
  }
}

async function onSubmit() {
  formError.value = '';
  if (!selectedProduct.value) {
    formError.value = t('sales.product_required');
    return;
  }
  if (maximumQuantity.value <= 0) {
    formError.value = t('sales.out_of_stock');
    return;
  }
  if (!Number.isInteger(Number(quantity.value)) || Number(quantity.value) < 1 ||
      Number(quantity.value) > maximumQuantity.value) {
    formError.value = t('sales.invalid_quantity', { count: maximumQuantity.value });
    return;
  }
  if (!saleDate.value) {
    formError.value = t('sales.date_required');
    return;
  }

  const newSaleData = {
    id: Math.random().toString(36).substring(2, 9),
    userId: identityStore.currentUser?.id ?? null,
    customerId: selectedCustomer.value ? String(selectedCustomer.value.id) : null,
    customerName: selectedCustomer.value ? selectedCustomer.value.name : t('sales.general_customer'),
    items: [
      {
        productId: String(selectedProduct.value.id),
        quantity: Number(quantity.value),
        unitPrice: Number(selectedProduct.value.price)
      }
    ],
    total: calculatedTotal.value,
    paymentMethod: paymentMethod.value,
    date: saleDate.value
  };

  try {
    await salesStore.registerSale(newSaleData);

    successMessage.value = t('sales.sale_success');
    setTimeout(() => {
      successMessage.value = '';
    }, 4000);

    selectedProduct.value = null;
    quantity.value = 1;
    selectedCustomer.value = null;
    paymentMethod.value = 'cash';
  } catch (e) {
    console.error('Error al registrar la venta:', e);
    formError.value = salesStore.error || t('sales.sale_error');
  }
}
</script>

<template>
  <div class="sale-form-container">
    <div v-if="successMessage" class="success-banner">
      <i class="pi pi-check-circle"></i>
      <span>{{ successMessage }}</span>
    </div>
    <div v-if="formError || salesStore.error" class="sale-error-banner" role="alert">
      <i class="pi pi-exclamation-circle"></i>
      <span>{{ formError || salesStore.error }}</span>
    </div>

    <form @submit.prevent="onSubmit" class="form-card-modern">
      <div v-if="salesStore.loading" class="sale-loading-message">
        <i class="pi pi-spin pi-spinner"></i>{{ $t('sales.loading') }}
      </div>

      <div class="form-section-box">
        <div class="section-title">
          <i class="pi pi-box"></i>
          <span>{{ $t('sales.section_product') }}</span>
        </div>

        <div class="input-group">
          <label class="field-label">{{ $t('sales.product_label') }} <span class="req">*</span></label>
          <pv-select
              v-model="selectedProduct"
              :options="salesStore.products"
              optionLabel="name"
              :placeholder="$t('sales.product_placeholder')"
              class="full-w"
          />
        </div>

        <div class="input-group" style="margin-top: 1rem;">
          <label class="field-label">{{ $t('sales.quantity_label') }} <span class="req">*</span></label>
          <div class="quantity-row">
            <pv-input-number v-model="quantity" :min="1" :max="maximumQuantity" :disabled="!selectedProduct || maximumQuantity <= 0" showButtons class="qty-input" />
            <span class="stock-badge" v-if="selectedProduct">
              <i :class="maximumQuantity > 0 ? 'pi pi-info-circle' : 'pi pi-exclamation-circle'"></i>
              <strong>{{ maximumQuantity > 0 ? $t('sales.stock_available', { count: maximumQuantity }) : $t('sales.out_of_stock') }}</strong>
            </span>
          </div>
        </div>
      </div>

      <div class="form-section-box">
        <div class="section-title">
          <i class="pi pi-users"></i>
          <span>{{ $t('sales.section_customer') }}</span>
        </div>

        <div class="grid-2-cols">
          <div class="input-group">
            <div class="label-row">
              <label class="field-label">{{ $t('sales.customer_label') }}</label>
              <a href="#" class="new-customer-link" @click.prevent="showNewCustomerModal = true">{{ $t('sales.customer_new') }}</a>
            </div>
            <pv-select
                v-model="selectedCustomer"
                :options="salesStore.customers"
                optionLabel="name"
                :placeholder="$t('sales.customer_placeholder')"
                class="full-w"
            />
          </div>

          <div class="input-group">
            <label class="field-label">{{ $t('sales.date_label') }} <span class="req">*</span></label>
            <pv-input-text type="date" v-model="saleDate" class="full-w" />
          </div>
        </div>
      </div>

      <div class="form-section-box">
        <div class="section-title">
          <i class="pi pi-wallet"></i>
          <span>{{ $t('sales.payment_method') }} <span class="req">*</span></span>
        </div>
        <div class="payment-methods-grid">
          <button
              type="button"
              class="pay-btn"
              :class="{ active: paymentMethod === 'cash' }"
              @click="paymentMethod = 'cash'"
          >
            <i class="pi pi-money-bill"></i> {{ $t('sales.cash') }}
          </button>
          <button
              type="button"
              class="pay-btn"
              :class="{ active: paymentMethod === 'card' }"
              @click="paymentMethod = 'card'"
          >
            <i class="pi pi-credit-card"></i> {{ $t('sales.card') }}
          </button>
          <button
              type="button"
              class="pay-btn"
              :class="{ active: paymentMethod === 'yape' }"
              @click="paymentMethod = 'yape'"
          >
            <i class="pi pi-mobile"></i> Yape
          </button>
        </div>
      </div>

      <div class="summary-box">
        <div class="summary-header">
          <span>{{ $t('sales.summary_title') }}</span>
          <span class="summary-tag">{{ $t('sales.summary_tag') }}</span>
        </div>
        <div class="summary-grid">
          <div>
            <span class="s-label">{{ $t('sales.summary_product') }}</span>
            <span class="s-val">{{ selectedProduct ? selectedProduct.name : '—' }}</span>
          </div>
          <div>
            <span class="s-label">{{ $t('sales.summary_quantity') }}</span>
            <span class="s-val">{{ $t('sales.units', { count: quantity }) }}</span>
          </div>
          <div>
            <span class="s-label">{{ $t('sales.summary_customer') }}</span>
            <span class="s-val">{{ selectedCustomer ? selectedCustomer.name : $t('sales.general_customer') }}</span>
          </div>
          <div>
            <span class="s-label">{{ $t('sales.payment_method') }}:</span>
            <span class="s-val capitalize">{{ $t('sales.' + paymentMethod) }}</span>
          </div>
        </div>
        <div class="summary-footer">
          <span class="total-text">{{ $t('sales.summary_total') }}</span>
          <span class="total-amount">S/ {{ calculatedTotal.toFixed(2) }}</span>
        </div>
      </div>

      <div class="form-actions">
        <pv-button type="submit" :label="salesStore.submitting ? $t('sales.saving_sale') : $t('sales.submit_button')" :disabled="!canSubmit || salesStore.loading" :loading="salesStore.submitting" class="btn-submit-sale" />
      </div>

    </form>

    <div v-if="showNewCustomerModal" class="modal-backdrop" @click.self="showNewCustomerModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ $t('sales.new_customer_title') }}</h3>
          <button class="close-btn" @click="showNewCustomerModal = false"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body">
          <p v-if="customerError" class="sale-error-banner" role="alert">{{ customerError }}</p>
          <div class="input-group">
            <label class="field-label">{{ $t('sales.full_name') }} <span class="req">*</span></label>
            <pv-input-text v-model="newCustName" placeholder="Ej. María Pérez" class="full-w" />
          </div>
          <div class="input-group">
            <label class="field-label">{{ $t('sales.email') }}</label>
            <pv-input-text v-model="newCustEmail" placeholder="correo@ejemplo.com" class="full-w" />
          </div>
          <div class="input-group">
            <label class="field-label">{{ $t('sales.phone') }}</label>
            <pv-input-text v-model="newCustPhone" placeholder="+51999999999" class="full-w" />
          </div>
        </div>
        <div class="modal-footer">
          <pv-button :label="$t('sales.cancel')" severity="secondary" :disabled="customerSaving" @click="showNewCustomerModal = false" />
          <pv-button :label="customerSaving ? $t('sales.saving_customer') : $t('sales.save_customer')" :loading="customerSaving" @click="handleCreateCustomer" class="btn-save-cust" />
        </div>
      </div>
    </div>
  </div>
</template>