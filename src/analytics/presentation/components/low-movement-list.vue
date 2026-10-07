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
  <pv-card class="movement-card">
    <template #content>
      <div class="section-header">
        <h2>{{ t("analytics.lowMovement") }}</h2>

        <pv-tag
            :value="t('analytics.attention')"
            severity="warn"
        />
      </div>

      <div v-if="products.length" class="movement-list">
        <div
            v-for="product in products"
            :key="product.id"
            class="movement-item"
        >
          <div class="movement-icon">
            <i class="pi pi-box"></i>
          </div>

          <div class="movement-info">
            <strong>{{ product.name }}</strong>

            <span>
                            {{
                t("analytics.stock", {
                  count: product.stock
                })
              }}
                        </span>
          </div>

          <pv-tag
              :value="`${product.quantity} ${t('analytics.sales')}`"
              severity="warn"
          />
        </div>
      </div>

      <p v-else class="empty">
        {{ t("analytics.noInformation") }}
      </p>
    </template>
  </pv-card>
</template>

<style scoped>
.movement-card {
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

.movement-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.movement-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem;
  border: 1px solid #eadbc9;
  border-radius: 12px;
}

.movement-icon {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 50%;
  color: #825d38;
  background: #f7f0e8;
}

.movement-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.movement-info strong {
  overflow: hidden;
  color: #243b53;
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.movement-info span {
  color: #766b62;
  font-size: 0.58rem;
}

.empty {
  margin: 1.5rem 0;
  color: #766b62;
  font-size: 0.75rem;
  text-align: center;
}
</style>