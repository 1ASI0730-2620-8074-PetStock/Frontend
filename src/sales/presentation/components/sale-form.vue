<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSalesStore } from '../../application/sales.store.js';
import './sale-form.css';

const salesStore = useSalesStore();

onMounted(async () => {
  await salesStore.loadInitialData();
});

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

const calculatedTotal = computed(() => {
  if (!selectedProduct.value) return 0;
  const price = Number(selectedProduct.value.price || 0);
  return price * (Number(quantity.value) || 1);
});

async function handleCreateCustomer() {
  if (!newCustName.value.trim()) {
    alert('Por favor ingresa el nombre del cliente');
    return;
  }

  const newCustomerData = {
    id: Math.random().toString(36).substring(2, 9),
    name: newCustName.value.trim(),
    email: newCustEmail.value.trim() || 'cliente@petstock.com',
    phone: newCustPhone.value.trim() || '+51999999999'
  };

  try {
    await salesStore.addCustomer(newCustomerData);
    selectedCustomer.value = newCustomerData;
    showNewCustomerModal.value = false;
    newCustName.value = '';
    newCustEmail.value = '';
    newCustPhone.value = '';
  } catch (e) {
    alert('No se pudo guardar el cliente.');
  }
}

async function onSubmit() {
  if (!selectedProduct.value) {
    alert('Por favor selecciona un producto');
    return;
  }

  const newSaleData = {
    id: Math.random().toString(36).substring(2, 9),
    userId: 2,
    customerId: selectedCustomer.value ? String(selectedCustomer.value.id) : "1",
    customerName: selectedCustomer.value ? selectedCustomer.value.name : "Cliente General",
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

    successMessage.value = '¡Venta registrada con éxito y guardada en el sistema!';
    setTimeout(() => {
      successMessage.value = '';
    }, 4000);

    selectedProduct.value = null;
    quantity.value = 1;
    selectedCustomer.value = null;
    paymentMethod.value = 'cash';
  } catch (e) {
    console.error('Error al registrar la venta:', e);
    alert('Hubo un error al registrar la venta en la base de datos.');
  }
}
</script>

<template>
  <div class="sale-form-container">
    <div v-if="successMessage" class="success-banner">
      <i class="pi pi-check-circle"></i>
      <span>{{ successMessage }}</span>
    </div>

    <form @submit.prevent="onSubmit" class="form-card-modern">

      <div class="form-section-box">
        <div class="section-title">
          <i class="pi pi-box"></i>
          <span>PRODUCT & INVENTARIO</span>
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
            <pv-input-number v-model="quantity" :min="1" :max="selectedProduct?.stock || 99" showButtons class="qty-input" />
            <span class="stock-badge" v-if="selectedProduct">
              <i class="pi pi-info-circle"></i> Stock disponible: <strong>{{ selectedProduct.stock }} uds</strong>
            </span>
          </div>
        </div>
      </div>

      <div class="form-section-box">
        <div class="section-title">
          <i class="pi pi-users"></i>
          <span>DETALLES DEL CLIENTE Y FECHA</span>
        </div>

        <div class="grid-2-cols">
          <div class="input-group">
            <div class="label-row">
              <label class="field-label">{{ $t('sales.customer_label') }} <span class="req">*</span></label>
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
            <span class="s-val">{{ quantity }} unidades</span>
          </div>
          <div>
            <span class="s-label">{{ $t('sales.summary_customer') }}</span>
            <span class="s-val">{{ selectedCustomer ? selectedCustomer.name : 'Cliente General' }}</span>
          </div>
          <div>
            <span class="s-label">Método de pago:</span>
            <span class="s-val capitalize">{{ paymentMethod === 'yape' ? 'Yape' : paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo' }}</span>
          </div>
        </div>
        <div class="summary-footer">
          <span class="total-text">{{ $t('sales.summary_total') }}</span>
          <span class="total-amount">S/ {{ calculatedTotal.toFixed(2) }}</span>
        </div>
      </div>

      <div class="form-actions">
        <pv-button type="submit" :label="$t('sales.submit_button')" class="btn-submit-sale" />
      </div>

    </form>

    <div v-if="showNewCustomerModal" class="modal-backdrop" @click.self="showNewCustomerModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Registrar Nuevo Cliente</h3>
          <button class="close-btn" @click="showNewCustomerModal = false"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label class="field-label">Nombre completo <span class="req">*</span></label>
            <pv-input-text v-model="newCustName" placeholder="Ej. María Pérez" class="full-w" />
          </div>
          <div class="input-group">
            <label class="field-label">Correo electrónico</label>
            <pv-input-text v-model="newCustEmail" placeholder="correo@ejemplo.com" class="full-w" />
          </div>
          <div class="input-group">
            <label class="field-label">Teléfono</label>
            <pv-input-text v-model="newCustPhone" placeholder="+51999999999" class="full-w" />
          </div>
        </div>
        <div class="modal-footer">
          <pv-button label="Cancelar" severity="secondary" @click="showNewCustomerModal = false" />
          <pv-button label="Guardar Cliente" @click="handleCreateCustomer" class="btn-save-cust" />
        </div>
      </div>
    </div>
  </div>
</template>