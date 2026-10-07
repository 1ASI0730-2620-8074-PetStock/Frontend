<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSalesStore } from '../../application/sales.store.js';
import './sale-history-list.css';

const { t } = useI18n();
const salesStore = useSalesStore();

defineProps({
  sales: { type: Array, default: () => [] }
});

const selectedSale = ref(null);
const showDetailModal = ref(false);
const deleteMessage = ref('');

function openDetail(sale) {
  selectedSale.value = sale;
  showDetailModal.value = true;
}

function closeDetail() {
  showDetailModal.value = false;
  selectedSale.value = null;
}

async function eliminarVenta(id) {
  try {
    await salesStore.deleteSale(id);
    deleteMessage.value = t('sales.delete_success');
    setTimeout(() => {
      deleteMessage.value = '';
    }, 4000);
  } catch (e) {
    alert('No se pudo eliminar la venta del servidor.');
  }
}

function getCustomerName(customerId) {
  const cust = salesStore.customers.find(c => String(c.id) === String(customerId));
  return cust ? cust.name : t('sales.general_customer');
}

function getInitials(name) {
  if (!name) return 'C';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getProductName(productId) {
  const prod = salesStore.products.find(p => String(p.id) === String(productId));
  return prod ? prod.name : `Producto ID: ${productId}`;
}

function formatDateTime(dateString) {
  if (!dateString) return 'Fecha no disponible';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}

function getPaymentMethodLabel(method) {
  if (!method) return 'Efectivo';
  const lower = String(method).toLowerCase().trim();
  if (lower === 'yape') return 'Yape';
  if (lower === 'card' || lower === 'tarjeta') return 'Tarjeta';
  if (lower === 'cash' || lower === 'efectivo') return 'Efectivo';
  return method;
}

function getTotalQuantity(items) {
  if (!items || !Array.isArray(items)) return 1;
  return items.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
}
</script>

<template>
  <div class="history-container">
    <div v-if="deleteMessage" class="success-banner-delete">
      <i class="pi pi-check-circle"></i>
      <span>{{ deleteMessage }}</span>
    </div>

    <div class="history-list-card">
      <div v-if="sales.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <p>{{ $t('sales.no_sales') }}</p>
      </div>

      <div v-for="sale in sales" :key="sale.id" class="history-card-item">
        <div class="history-card-header">
          <div class="client-badge-initial">
            {{ getInitials(getCustomerName(sale.customerId)) }}
          </div>
          <div class="client-info">
            <strong>{{ getCustomerName(sale.customerId) }}</strong>
            <span class="sale-date-text">
              <i class="pi pi-clock"></i> {{ formatDateTime(sale.date) }}
            </span>
          </div>

          <div class="header-right-actions">
            <span class="sale-amount-badge">S/ {{ Number(sale.total || 0).toFixed(2) }}</span>
            <button type="button" class="btn-delete" @click="eliminarVenta(sale.id)" title="Eliminar venta">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>

        <div class="history-card-body">
          <div class="product-bought-row">
            <div class="product-info-left">
              <i class="pi pi-box"></i>
              <span>{{ sale.items && sale.items.length ? getProductName(sale.items[0].productId) : $t('sales.in_store_product') }}</span>
            </div>
            <div class="product-info-right">
              <span class="qty-badge">
                {{ $t('sales.units', { count: getTotalQuantity(sale.items) }) }}
              </span>
              <button type="button" class="detail-link-btn" @click="openDetail(sale)">
                {{ $t('sales.view_detail') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showDetailModal" class="modal-backdrop" @click.self="closeDetail">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ $t('sales.detail_dialog_title') }}</h3>
            <button class="close-btn" @click="closeDetail"><i class="pi pi-times"></i></button>
          </div>
          <div v-if="selectedSale" class="modal-body">

            <div class="detail-row">
              <span class="label">{{ $t('sales.sale_id') }}:</span>
              <span class="value">#{{ selectedSale.id }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t('sales.summary_customer') }}</span>
              <span class="value">{{ getCustomerName(selectedSale.customerId) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t('sales.date_time') }}:</span>
              <span class="value">{{ formatDateTime(selectedSale.date) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t('sales.payment_method') }}:</span>
              <span class="value">{{ getPaymentMethodLabel(selectedSale.paymentMethod) }}</span>
            </div>

            <div class="detail-divider"></div>

            <span class="section-subtitle">{{ $t('sales.products') }}:</span>
            <div v-for="(item, index) in (selectedSale.items || [])" :key="index" class="item-box-db">
              <div class="detail-row">
                <span class="label">{{ $t('sales.summary_product') }}</span>
                <span class="value">{{ getProductName(item.productId) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">{{ $t('sales.summary_quantity') }}</span>
                <span class="value">{{ $t('sales.units', { count: item.quantity }) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">{{ $t('sales.unit_price') }}:</span>
                <span class="value">S/ {{ Number(item.unitPrice || 0).toFixed(2) }}</span>
              </div>
            </div>

            <div class="detail-divider"></div>

            <div class="detail-row total-row">
              <span class="label">{{ $t('sales.total_paid') }}:</span>
              <span class="value total-price">S/ {{ Number(selectedSale.total || 0).toFixed(2) }}</span>
            </div>

          </div>
          <div class="modal-footer">
            <pv-button :label="$t('sales.close')" severity="secondary" @click="closeDetail" class="btn-close-modal" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>