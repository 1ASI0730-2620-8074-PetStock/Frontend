<script setup>
import { onMounted } from 'vue'
import { useCatalogStore } from '../../application/catalog.store.js'
import ProductForm from '../components/product-form.vue'

const { productos, categorias, loading, error, cargarProductos, cargarCategorias } = useCatalogStore()

onMounted(() => {
  cargarProductos()
  cargarCategorias()
})
</script>

<template>
  <div>
    <h1>Catálogo de Productos</h1>

    <ProductForm />

    <p v-if="loading">Cargando...</p>
    <p v-if="error">{{ error }}</p>

    <ul>
      <li v-for="producto in productos" :key="producto.id">
        {{ producto.nombre }} - S/ {{ producto.precioBase }} (Stock: {{ producto.stockActual }})
      </li>
    </ul>

    <h2>Categorías</h2>
    <ul>
      <li v-for="categoria in categorias" :key="categoria.id">
        {{ categoria.nombre }}
      </li>
    </ul>
  </div>
</template>