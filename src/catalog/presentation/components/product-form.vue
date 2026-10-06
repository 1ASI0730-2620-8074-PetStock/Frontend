<script setup>
import { ref } from 'vue'
import { useCatalogStore } from '../../application/catalog.store.js'

const { categorias, agregarProducto } = useCatalogStore()

const nombre = ref('')
const idCategoria = ref(null)
const descripcion = ref('')
const precioVenta = ref(0)
const stockDisponible = ref(0)
const stockMinimo = ref(0)
const activo = ref(true)

async function guardar() {
  await agregarProducto({
    nombre: nombre.value,
    descripcion: descripcion.value,
    precio_base: precioVenta.value,
    stock_actual: stockDisponible.value,
    stock_minimo: stockMinimo.value,
    activo: activo.value,
    id_categoria: idCategoria.value,
    id_proveedor: 1
  })
  cancelar()
}

function cancelar() {
  nombre.value = ''
  idCategoria.value = null
  descripcion.value = ''
  precioVenta.value = 0
  stockDisponible.value = 0
  stockMinimo.value = 0
  activo.value = true
}
</script>

<template>
  <pv-card style="margin-bottom: 2rem; max-width: 500px;">
    <template #title>Registrar producto</template>
    <template #subtitle>Ingresa la información para dar de alta un producto en tu inventario</template>
    <template #content>
      <form @submit.prevent="guardar" style="display: flex; flex-direction: column; gap: 1.5rem;">

        <div>
          <strong>Información del producto</strong>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem;">
            <pv-input-text v-model="nombre" placeholder="Nombre del producto *" required />
            <pv-select v-model="idCategoria" :options="categorias" optionLabel="nombre" optionValue="id" placeholder="Selecciona una categoría *" />
            <pv-textarea v-model="descripcion" placeholder="Describe brevemente el producto (opcional)" rows="2" />
          </div>
        </div>

        <div>
          <strong>Información de inventario</strong>
          <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
            <pv-input-number v-model="precioVenta" mode="currency" currency="PEN" locale="es-PE" placeholder="Precio venta *" />
            <pv-input-number v-model="stockDisponible" placeholder="Stock disp. *" />
            <pv-input-number v-model="stockMinimo" placeholder="Stock mín. *" />
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <ToggleSwitch v-model="activo" />
          <span>Disponible para venta en caja</span>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
          <pv-button type="button" label="Cancelar" severity="secondary" @click="cancelar" />
          <pv-button type="submit" label="Guardar producto" />
        </div>
      </form>
    </template>
  </pv-card>
</template>