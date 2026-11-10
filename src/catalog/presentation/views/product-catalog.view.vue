<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCatalogStore } from '../../application/catalog.store.js'
import ProductForm from '../components/product-form.vue'

const { cargarCategorias } = useCatalogStore()
const { t } = useI18n()
const categoriesError = ref('')

onMounted(async () => {
  try {
    await cargarCategorias()
  } catch (error) {
    categoriesError.value = t('catalog.categories_error')
    console.error('Error al cargar categorías del catálogo:', error)
  }
})
</script>

<template>
  <main class="catalog-page">
    <header class="catalog-page-header">
      <div>
        <span class="catalog-eyebrow">{{ t('catalog.eyebrow') }}</span>
        <h1>{{ t('catalog.title') }}</h1>
        <p>{{ t('catalog.subtitle') }}</p>
      </div>
      <div class="catalog-stock-badge">
        <i class="pi pi-box"></i>
        <span>{{ t('catalog.initial_stock_badge') }}</span>
      </div>
    </header>

    <p v-if="categoriesError" class="catalog-feedback error" role="alert">{{ categoriesError }}</p>
    <ProductForm />
  </main>
</template>

<style scoped>
.catalog-page {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1.5rem;
  margin: 0 auto;
  box-sizing: border-box;
}

.catalog-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding: 1.75rem 2rem;
  border: 1px solid #EEDFC8;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: 0 4px 15px rgba(47, 32, 25, 0.03);
}

.catalog-page-header h1 {
  margin: 0 0 0.2rem;
  color: #2F2019;
  font-size: 1.65rem;
  font-weight: 700;
}

.catalog-page-header p {
  margin: 0;
  color: #7A5C45;
}

.catalog-eyebrow {
  display: block;
  margin-bottom: 0.35rem;
  color: #ED6B15;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.catalog-stock-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #FADCC9;
  border-radius: 12px;
  background: #FFF1E6;
  color: #9B4A11;
  font-size: 0.85rem;
  font-weight: 700;
}

.catalog-stock-badge i {
  color: #ED6B15;
}

.catalog-feedback {
  padding: 0.9rem 1rem;
  border-radius: 10px;
}

.catalog-feedback.error {
  border: 1px solid #F5C6CB;
  background: #FDE8E8;
  color: #9B1C1C;
}

@media (max-width: 560px) {
  .catalog-page-header {
    padding: 1.25rem;
  }

  .catalog-stock-badge {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
