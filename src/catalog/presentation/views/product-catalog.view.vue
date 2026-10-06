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
    <div style="display: flex; justify-content: flex-end;">
      <img src="/font/logo-petstock.png" alt="PetStock" style="height: clamp(60px, 8vw, 120px); margin-bottom: 1rem;" />
    </div>
    <ProductForm />
  </div>
</template>