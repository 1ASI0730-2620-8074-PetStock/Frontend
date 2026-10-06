<script setup>
import { ref, onMounted } from 'vue'
import { useCatalogStore } from '../../application/catalog.store.js'
import { InventoryApi } from '../../../inventory/infrastructure/inventory-api.js'

const { categorias, agregarProducto } = useCatalogStore()

const proveedores = ref([])
onMounted(async () => {
  proveedores.value = await InventoryApi.getProveedores()
})

const nombre = ref('')
const idCategoria = ref(null)
const descripcion = ref('')
const precioVenta = ref(0)
const stockDisponible = ref(0)
const stockMinimo = ref(0)
const idProveedor = ref(null)
const activo = ref(true)

const mostrarNuevoProveedor = ref(false)
const nuevoProveedorNombre = ref('')
const nuevoProveedorContacto = ref('')
const nuevoProveedorTelefono = ref('')
const nuevoProveedorCorreo = ref('')

async function guardarNuevoProveedor() {
  const creado = await InventoryApi.createProveedor({
    nombre_empresa: nuevoProveedorNombre.value,
    contacto_nombre: nuevoProveedorContacto.value,
    telefono: nuevoProveedorTelefono.value,
    correo: nuevoProveedorCorreo.value
  })
  proveedores.value.push(creado)
  idProveedor.value = creado.id_proveedor

  nuevoProveedorNombre.value = ''
  nuevoProveedorContacto.value = ''
  nuevoProveedorTelefono.value = ''
  nuevoProveedorCorreo.value = ''
  mostrarNuevoProveedor.value = false
}

async function guardar() {
  await agregarProducto({
    nombre: nombre.value,
    descripcion: descripcion.value,
    precio_base: precioVenta.value,
    stock_actual: stockDisponible.value,
    stock_minimo: stockMinimo.value,
    activo: activo.value,
    id_categoria: idCategoria.value,
    id_proveedor: idProveedor.value
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
  idProveedor.value = null
  activo.value = true
}
</script>

<template>
  <pv-card class="product-form-card">
    <template #title>Registrar producto</template>
    <template #subtitle>Ingresa la información para dar de alta un producto en tu inventario</template>
    <template #content>
      <form @submit.prevent="guardar" style="display: flex; flex-direction: column; gap: 1.5rem;">

        <div>
          <strong>Información del producto</strong>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem;">
            <pv-input-text v-model="nombre" placeholder="Nombre del producto *" required style="width: 100%; box-sizing: border-box;" />
            <pv-select v-model="idCategoria" :options="categorias" optionLabel="nombre" optionValue="id" placeholder="Selecciona una categoría *" style="width: 100%;" />
            <pv-textarea v-model="descripcion" placeholder="Describe brevemente el producto (opcional)" rows="2" style="width: 100%; box-sizing: border-box;" />
          </div>
        </div>

        <div>
          <strong>Información de inventario</strong>
          <div class="inventory-grid">
            <div>
              <label class="field-label">Precio venta *</label>
              <pv-input-number v-model="precioVenta" mode="currency" currency="PEN" locale="es-PE" placeholder="S/ 0.00" />
            </div>
            <div>
              <label class="field-label">Stock disp. *</label>
              <pv-input-number v-model="stockDisponible" placeholder="Ej. 25" />
            </div>
            <div>
              <label class="field-label">Stock mín. *</label>
              <pv-input-number v-model="stockMinimo" placeholder="Ej. 5" />
            </div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>Proveedor asignado</strong>
            <pv-button
                type="button"
                label="+ Nuevo"
                severity="secondary"
                text
                @click="mostrarNuevoProveedor = !mostrarNuevoProveedor"
            />
          </div>

          <pv-select
              v-if="!mostrarNuevoProveedor"
              v-model="idProveedor"
              :options="proveedores"
              optionLabel="nombre_empresa"
              optionValue="id_proveedor"
              placeholder="Selecciona un proveedor"
              style="width: 100%; margin-top: 0.5rem;"
          />

          <div v-else style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; padding: 1rem; background: #F8F5EF; border-radius: 8px;">
            <pv-input-text v-model="nuevoProveedorNombre" placeholder="Nombre de la empresa *" style="width: 100%; box-sizing: border-box;" />
            <pv-input-text v-model="nuevoProveedorContacto" placeholder="Nombre de contacto" style="width: 100%; box-sizing: border-box;" />
            <pv-input-text v-model="nuevoProveedorTelefono" placeholder="Teléfono" style="width: 100%; box-sizing: border-box;" />
            <pv-input-text v-model="nuevoProveedorCorreo" placeholder="Correo" style="width: 100%; box-sizing: border-box;" />
            <pv-button type="button" label="Guardar proveedor" style="background: #ED6B15; border-color: #ED6B15;" @click="guardarNuevoProveedor" />
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <ToggleSwitch v-model="activo" />
          <span>Disponible para venta en caja</span>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
          <pv-button type="button" label="Cancelar" severity="secondary" @click="cancelar" />
          <pv-button type="submit" label="Guardar producto" style="background: #ED6B15; border-color: #ED6B15;" />
        </div>
      </form>
    </template>
  </pv-card>
</template>

<style scoped>
.product-form-card {
  margin-bottom: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.inventory-grid :deep(.p-inputnumber) {
  width: 100%;
}

.inventory-grid :deep(.p-inputnumber-input) {
  width: 100%;
  box-sizing: border-box;
}
</style>