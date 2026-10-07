<script setup>
defineProps({
  sales: { type: Array, default: () => [] }
});
</script>

<template>
  <div class="history-list-card">
    <div v-if="sales.length === 0" class="empty-state">
      <i class="pi pi-inbox"></i>
      <p>{{ $t('sales.no_sales') }}</p>
    </div>

    <div v-for="sale in sales" :key="sale.id" class="history-card-item">
      <div class="history-card-header">
        <div class="client-badge-initial">
          {{ sale.customerName ? sale.customerName[0].toUpperCase() : 'C' }}
        </div>
        <div class="client-info">
          <strong>{{ sale.customerName || 'Cliente General' }}</strong>
          <span class="sale-date-text"><i class="pi pi-clock"></i> {{ sale.date }}</span>
        </div>
        <span class="sale-amount-badge">S/ {{ Number(sale.total || 0).toFixed(2) }}</span>
      </div>
      <div class="history-card-body">
        <div class="product-bought-row">
          <i class="pi pi-box"></i>
          <span>{{ sale.productName || 'Producto' }}</span>
          <span class="qty-badge">{{ $t('sales.quantity_badge', { count: sale.quantity }) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-list-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #E5D0B1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.empty-state { text-align: center; padding: 2rem; color: #825D38; }
.empty-state i { font-size: 2.5rem; margin-bottom: 0.5rem; color: #ED6B15; }
.history-card-item {
  background: #F8F5EF; border: 1px solid #E5D0B1; border-radius: 14px; padding: 1rem;
  display: flex; flex-direction: column; gap: 0.75rem;
}
.history-card-header { display: flex; align-items: center; gap: 0.75rem; }
.client-badge-initial {
  width: 40px; height: 40px; border-radius: 50%; background: #ED6B15; color: #FFF;
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0;
}
.client-info { flex: 1; display: flex; flex-direction: column; }
.client-info strong { font-size: 0.95rem; color: #2F2019; }
.sale-date-text { font-size: 0.78rem; color: #825D38; }
.sale-amount-badge { font-weight: 800; color: #ED6B15; font-size: 1.1rem; }
.history-card-body { border-top: 1px dashed #E5D0B1; padding-top: 0.75rem; }
.product-bought-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #2F2019; }
.product-bought-row i { color: #ED6B15; }
.qty-badge { margin-left: auto; background: #E5D0B1; color: #2F2019; padding: 0.15rem 0.5rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600; }
</style>