<script setup>
import { onMounted, computed } from 'vue'
import { useInventoryStore } from '../../application/inventory.store.js'
import { useCatalogStore } from '../../../catalog/application/catalog.store.js'

const { inventarios, alertasStock, loading, error, cargarInventarios, cargarAlertasStock } = useInventoryStore()
const { productos, cargarProductos } = useCatalogStore()

onMounted(() => {
  cargarInventarios()
  cargarAlertasStock()
  cargarProductos()
})

function nombreProducto(idProducto) {
  const producto = productos.value.find(p => p.id === idProducto)
  return producto ? producto.nombre : `Producto #${idProducto}`
}

function inventarioDe(idProducto) {
  return inventarios.value.find(i => i.idProducto === idProducto)
}

const alertasCriticas = computed(() =>
    alertasStock.value.filter(a => a.nivelAlerta === 'Crítico' && a.estaActiva)
)
const alertasBajas = computed(() =>
    alertasStock.value.filter(a => a.nivelAlerta !== 'Crítico' && a.estaActiva)
)
</script>

<template>
  <div style="max-width: 500px;">
    <h1>Productos con bajo stock</h1>

    <p v-if="loading">Cargando...</p>
    <p v-if="error">{{ error }}</p>

    <div v-if="alertasCriticas.length">
      <strong>🔴 Alerta crítica</strong>
      <pv-card v-for="alerta in alertasCriticas" :key="alerta.id" style="margin: 0.75rem 0;">
        <template #content>
          <pv-tag severity="danger" :value="alerta.nivelAlerta" />
          <h3>{{ nombreProducto(alerta.idProducto) }}</h3>
          <div style="display: flex; justify-content: space-between;">
            <span>Stock actual: <strong>{{ inventarioDe(alerta.idProducto)?.stockActual }}</strong></span>
            <span>Mínimo requerido: <strong>{{ inventarioDe(alerta.idProducto)?.umbralMinimo }}</strong></span>
          </div>
          <pv-button label="+ Reponer" style="margin-top: 0.5rem;" />
        </template>
      </pv-card>
    </div>

    <div v-if="alertasBajas.length" style="margin-top: 1.5rem;">
      <strong>Stock bajo</strong>
      <pv-card v-for="alerta in alertasBajas" :key="alerta.id" style="margin: 0.75rem 0;">
        <template #content>
          <pv-tag severity="warn" :value="alerta.nivelAlerta" />
          <h3>{{ nombreProducto(alerta.idProducto) }}</h3>
          <div style="display: flex; justify-content: space-between;">
            <span>Stock actual: <strong>{{ inventarioDe(alerta.idProducto)?.stockActual }}</strong></span>
            <span>Mínimo requerido: <strong>{{ inventarioDe(alerta.idProducto)?.umbralMinimo }}</strong></span>
          </div>
          <pv-button label="+ Reponer" style="margin-top: 0.5rem;" />
        </template>
      </pv-card>
    </div>
  </div>
</template>