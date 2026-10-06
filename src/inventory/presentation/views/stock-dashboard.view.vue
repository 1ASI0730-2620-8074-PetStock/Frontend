<script setup>
import { onMounted } from 'vue'
import { useInventoryStore } from '../../application/inventory.store.js'

const { inventarios, alertasStock, loading, error, cargarInventarios, cargarAlertasStock } = useInventoryStore()

onMounted(() => {
  cargarInventarios()
  cargarAlertasStock()
})
</script>

<template>
  <div>
    <h1>Inventario</h1>

    <p v-if="loading">Cargando...</p>
    <p v-if="error">{{ error }}</p>

    <ul>
      <li v-for="item in inventarios" :key="item.id">
        Producto #{{ item.idProducto }} — Stock: {{ item.stockActual }} (Mínimo: {{ item.umbralMinimo }})
      </li>
    </ul>

    <h2>Alertas de Stock</h2>
    <ul>
      <li v-for="alerta in alertasStock" :key="alerta.id">
        Producto #{{ alerta.idProducto }} — Nivel: {{ alerta.nivelAlerta }}
        <span v-if="alerta.estaActiva"> ⚠️ Activa</span>
      </li>
    </ul>
  </div>
</template>