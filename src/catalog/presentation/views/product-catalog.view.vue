<script setup>
import { onMounted } from 'vue'
import { useCatalogStore } from '../../application/catalog.store.js'
import ProductForm from '../components/product-form.vue'

const { cargarCategorias } = useCatalogStore()

onMounted(() => {
  cargarCategorias()
})
</script>

<template>
  <div style="max-width: 700px; margin: 0 auto; padding: 2rem;">
    <ProductForm />
  </div>
</template>
