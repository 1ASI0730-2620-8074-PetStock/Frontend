<script setup>
import { onMounted, computed, ref } from 'vue'
import { useInventoryStore } from '../../application/inventory.store.js'
import { useCatalogStore } from '../../../catalog/application/catalog.store.js'

const { inventarios, alertasStock, loading, error, cargarInventarios, cargarAlertasStock } = useInventoryStore()
const { productos, categorias, cargarProductos, cargarCategorias } = useCatalogStore()

onMounted(() => {
  cargarInventarios()
  cargarAlertasStock()
  cargarProductos()
  cargarCategorias()
})

const busqueda = ref('')

function nombreProducto(idProducto) {
  const producto = productos.value.find(p => p.id === idProducto)
  return producto ? producto.nombre : `Producto #${idProducto}`
}

function nombreCategoria(idProducto) {
  const producto = productos.value.find(p => p.id === idProducto)
  if (!producto) return ''
  const categoria = categorias.value.find(c => c.id === producto.idCategoria)
  return categoria ? categoria.nombre : ''
}

function inventarioDe(idProducto) {
  return inventarios.value.find(i => i.idProducto === idProducto)
}

function porcentajeStock(idProducto) {
  const inv = inventarioDe(idProducto)
  if (!inv || !inv.umbralMinimo) return 0
  return Math.round((inv.stockActual / inv.umbralMinimo) * 100)
}

function unidadesFaltantes(idProducto) {
  const inv = inventarioDe(idProducto)
  if (!inv) return 0
  return Math.max(inv.umbralMinimo - inv.stockActual, 0)
}

function coincideBusqueda(idProducto) {
  if (!busqueda.value) return true
  return nombreProducto(idProducto).toLowerCase().includes(busqueda.value.toLowerCase())
}

const alertasCriticas = computed(() =>
    alertasStock.value.filter(a => a.nivelAlerta === 'Crítico' && a.estaActiva && coincideBusqueda(a.idProducto))
)
const alertasBajas = computed(() =>
    alertasStock.value.filter(a => a.nivelAlerta !== 'Crítico' && a.estaActiva && coincideBusqueda(a.idProducto))
)
</script>

<template>
  <div style="max-width: 700px; margin: 0 auto; padding: 2rem;">
    <div style="display: flex; justify-content: flex-end;">
      <img src="/font/logo-petstock.png" alt="PetStock" style="height: clamp(60px, 8vw, 120px); margin-bottom: 1rem;" />
    </div>

    <h1>Productos con bajo stock</h1>

    <pv-input-text v-model="busqueda" placeholder="Buscar producto..." style="width: 100%; box-sizing: border-box; margin-bottom: 1.5rem;" />

    <p v-if="loading">Cargando...</p>
    <p v-if="error">{{ error }}</p>

    <div v-if="alertasCriticas.length" style="margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="color: #e53935;">● Alerta crítica</strong>
        <pv-tag severity="danger" :value="`${alertasCriticas.length} producto${alertasCriticas.length > 1 ? 's' : ''} urgente${alertasCriticas.length > 1 ? 's' : ''}`" />
      </div>

      <pv-card v-for="alerta in alertasCriticas" :key="alerta.id" class="alert-card critical">
        <template #content>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <pv-tag severity="danger" :value="`CRÍTICO -${100 - porcentajeStock(alerta.idProducto)}%`" />
              <span style="font-size: 0.85rem; color: #6b6375;">{{ nombreCategoria(alerta.idProducto) }}</span>
            </div>
          </div>

          <h3 style="margin: 0.5rem 0;">{{ nombreProducto(alerta.idProducto) }}</h3>

          <div style="display: flex; justify-content: space-between;">
            <span>Stock actual<br /><strong style="color: #e53935;">{{ inventarioDe(alerta.idProducto)?.stockActual }} unidades</strong></span>
            <span style="text-align: right;">Mínimo requerido<br /><strong>{{ inventarioDe(alerta.idProducto)?.umbralMinimo }} unidades</strong></span>
          </div>

          <div class="progress-bar">
            <div class="progress-fill critical" :style="{ width: Math.min(porcentajeStock(alerta.idProducto), 100) + '%' }"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #6b6375;">
            <span>Faltan {{ unidadesFaltantes(alerta.idProducto) }} unidades para el umbral seguro</span>
            <span>{{ porcentajeStock(alerta.idProducto) }}% cubierto</span>
          </div>

          <div style="display: flex; gap: 0.75rem; margin-top: 0.75rem;">
            <pv-button label="+ Reponer" style="background: #ED6B15; border-color: #ED6B15; flex: 1;" />
            <pv-button label="Editar" severity="secondary" outlined />
          </div>
        </template>
      </pv-card>
    </div>

    <div v-if="alertasBajas.length">
      <strong style="color: #ED6B15;">● Stock bajo</strong>

      <pv-card v-for="alerta in alertasBajas" :key="alerta.id" class="alert-card">
        <template #content>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.85rem; color: #6b6375;">{{ nombreCategoria(alerta.idProducto) }}</span>
            <pv-tag severity="warn" value="Atención" />
          </div>

          <h3 style="margin: 0.5rem 0;">{{ nombreProducto(alerta.idProducto) }}</h3>

          <div style="display: flex; justify-content: space-between;">
            <span>Stock actual: <strong>{{ inventarioDe(alerta.idProducto)?.stockActual }}</strong></span>
            <span>Mínimo requerido: <strong>{{ inventarioDe(alerta.idProducto)?.umbralMinimo }}</strong></span>
            <pv-button label="+ Reponer" style="background: #ED6B15; border-color: #ED6B15;" />
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
.alert-card {
  margin: 0.75rem 0;
  box-sizing: border-box;
}

.alert-card.critical {
  border-left: 4px solid #e53935;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e5e4e7;
  border-radius: 3px;
  margin: 0.5rem 0 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
}

.progress-fill.critical {
  background: #e53935;
}
</style>