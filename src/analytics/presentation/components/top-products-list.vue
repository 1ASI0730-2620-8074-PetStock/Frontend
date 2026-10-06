<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps({
  products: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <pv-card class="products-card">
    <template #content>
      <div class="section-header">
        <h2>{{ t("analytics.topProducts") }}</h2>
        <span>{{ t("analytics.topThree") }}</span>
      </div>

      <div v-if="products.length" class="products-list">
        <div
            v-for="product in products"
            :key="product.id"
            class="product-item"
        >
          <div class="product-icon">
            <i class="pi pi-box"></i>
          </div>

          <div class="product-info">
            <strong>{{ product.name }}</strong>

            <span>
                            {{ product.subtitle }}
                        </span>
          </div>

          <div class="product-sales">
            <strong>
              {{ product.quantity }}
            </strong>

            <span>
                            {{ t("analytics.sales") }}
                        </span>
          </div>
        </div>
      </div>

      <p v-else class="empty">
        {{ t("analytics.noProducts") }}
      </p>
    </template>
  </pv-card>
</template>

<style scoped>
.products-card {
  border: 1px solid #eadbc9;
  border-radius: 16px;
  box-shadow: none;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.section-header h2 {
  margin: 0;
  color: #243b53;
  font-size: 1rem;
}

.section-header > span {
  color: var(--primary-color);
  font-size: 0.65rem;
  font-weight: 600;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem;
  border: 1px solid #eadbc9;
  border-radius: 12px;
}

.product-icon {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 50%;
  color: var(--primary-color);
  background: #fff5ed;
}

.product-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.product-info strong {
  overflow: hidden;
  color: #243b53;
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-info span {
  overflow: hidden;
  color: #766b62;
  font-size: 0.58rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-sales {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.product-sales strong {
  color: #243b53;
  font-size: 0.75rem;
}

.product-sales span {
  color: var(--primary-color);
  font-size: 0.55rem;
}

.empty {
  margin: 1.5rem 0;
  color: #766b62;
  font-size: 0.75rem;
  text-align: center;
}
</style>