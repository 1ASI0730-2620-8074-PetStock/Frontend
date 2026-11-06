<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCatalogStore } from '../../application/catalog.store.js'
import { InventoryApi } from '../../../inventory/infrastructure/inventory-api.js'

const { t } = useI18n()
const { categorias, agregarProducto } = useCatalogStore()

const proveedores = ref([])
const nombre = ref('')
const idCategoria = ref(null)
const descripcion = ref('')
const precioVenta = ref(null)
const stockMinimo = ref(null)
const idProveedor = ref(null)
const activo = ref(true)

const mostrarNuevoProveedor = ref(false)
const nuevoProveedorNombre = ref('')
const nuevoProveedorContacto = ref('')
const nuevoProveedorTelefono = ref('')
const nuevoProveedorCorreo = ref('')
const saving = ref(false)
const savingSupplier = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(async () => {
  try {
    proveedores.value = await InventoryApi.getProveedores()
  } catch (error) {
    errorMessage.value = t('catalog.suppliers_error')
    console.error('Error al cargar proveedores del catálogo:', error)
  }
})

async function guardarNuevoProveedor() {
  errorMessage.value = ''
  if (!nuevoProveedorNombre.value.trim()) {
    errorMessage.value = t('catalog.provider_name_required')
    return
  }

  savingSupplier.value = true
  try {
    const creado = await InventoryApi.createProveedor({
      nombre_empresa: nuevoProveedorNombre.value.trim(),
      contacto_nombre: nuevoProveedorContacto.value.trim(),
      telefono: nuevoProveedorTelefono.value.trim(),
      correo: nuevoProveedorCorreo.value.trim()
    })
    proveedores.value.push(creado)
    idProveedor.value = creado.id_proveedor
    nuevoProveedorNombre.value = ''
    nuevoProveedorContacto.value = ''
    nuevoProveedorTelefono.value = ''
    nuevoProveedorCorreo.value = ''
    mostrarNuevoProveedor.value = false
  } catch (error) {
    errorMessage.value = t('catalog.provider_save_error')
    console.error('Error al guardar proveedor:', error)
  } finally {
    savingSupplier.value = false
  }
}

async function guardar() {
  errorMessage.value = ''
  successMessage.value = ''

  const price = Number(precioVenta.value)
  const minimumStock = Number(stockMinimo.value)
  if (!nombre.value.trim() || !idCategoria.value || !Number.isFinite(price) || price <= 0 ||
      stockMinimo.value === null || stockMinimo.value === '' ||
      !Number.isInteger(minimumStock) || minimumStock < 0) {
    errorMessage.value = t('catalog.invalid_fields')
    return
  }

  saving.value = true
  try {
    await agregarProducto({
      nombre: nombre.value.trim(),
      descripcion: descripcion.value.trim(),
      precio_base: price,
      stock_minimo: minimumStock,
      activo: activo.value,
      id_categoria: idCategoria.value,
      id_proveedor: idProveedor.value
    })
    cancelar()
    successMessage.value = t('catalog.save_success')
  } catch (error) {
    errorMessage.value = t('catalog.save_error')
    console.error('Error al registrar producto:', error)
  } finally {
    saving.value = false
  }
}

function cancelar() {
  nombre.value = ''
  idCategoria.value = null
  descripcion.value = ''
  precioVenta.value = null
  stockMinimo.value = null
  idProveedor.value = null
  activo.value = true
  errorMessage.value = ''
}
</script>

<template>
  <form class="product-form-card" @submit.prevent="guardar">
    <section class="product-form-section">
      <h2 class="product-section-title"><i class="pi pi-box"></i>{{ t('catalog.product_info') }}</h2>
      <div class="product-fields-grid">
        <label class="product-field product-field-wide">
          <span>{{ t('catalog.name_label') }} <b>*</b></span>
          <pv-input-text v-model="nombre" :placeholder="t('catalog.name_placeholder')" required maxlength="100" />
        </label>

        <label class="product-field">
          <span>{{ t('catalog.category_label') }} <b>*</b></span>
          <pv-select
            v-model="idCategoria"
            :options="categorias"
            option-label="nombre"
            option-value="id"
            :placeholder="t('catalog.category_placeholder')"
            required
          />
        </label>

        <label class="product-field">
          <span>{{ t('catalog.description_label') }}</span>
          <pv-textarea v-model="descripcion" :placeholder="t('catalog.description_placeholder')" rows="2" maxlength="500" />
        </label>
      </div>
    </section>

    <section class="product-form-section">
      <h2 class="product-section-title"><i class="pi pi-tag"></i>{{ t('catalog.price_inventory_title') }}</h2>
      <div class="product-fields-grid price-fields">
        <label class="product-field">
          <span>{{ t('catalog.price_label') }} <b>*</b></span>
          <pv-input-number
            v-model="precioVenta"
            mode="currency"
            currency="PEN"
            locale="es-PE"
            :min="0.01"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            :placeholder="t('catalog.price_placeholder')"
          />
        </label>

        <label class="product-field">
          <span>{{ t('catalog.min_stock_label') }} <b>*</b></span>
          <pv-input-number v-model="stockMinimo" :min="0" :step="1" :max-fraction-digits="0" :placeholder="t('catalog.min_stock_placeholder')" />
        </label>
      </div>

      <p class="product-info-note">
        <i class="pi pi-info-circle"></i>
        {{ t('catalog.initial_stock_note') }}
      </p>
    </section>

    <section class="product-form-section">
      <div class="product-section-heading">
        <h2 class="product-section-title"><i class="pi pi-truck"></i>{{ t('catalog.provider') }}</h2>
        <button type="button" class="provider-toggle" @click="mostrarNuevoProveedor = !mostrarNuevoProveedor">
          <i :class="mostrarNuevoProveedor ? 'pi pi-times' : 'pi pi-plus'"></i>
          {{ mostrarNuevoProveedor ? t('catalog.cancel_button') : t('catalog.new_provider') }}
        </button>
      </div>

      <pv-select
        v-if="!mostrarNuevoProveedor"
        v-model="idProveedor"
        :options="proveedores"
        option-label="nombre_empresa"
        option-value="id_proveedor"
        :placeholder="t('catalog.provider_placeholder')"
        class="provider-select"
      />

      <div v-else class="new-provider-panel">
        <div class="product-fields-grid">
          <label class="product-field product-field-wide">
            <span>{{ t('catalog.provider_name_label') }} <b>*</b></span>
            <pv-input-text v-model="nuevoProveedorNombre" :placeholder="t('catalog.provider_name_placeholder')" required />
          </label>
          <label class="product-field">
            <span>{{ t('catalog.provider_contact_label') }}</span>
            <pv-input-text v-model="nuevoProveedorContacto" :placeholder="t('catalog.provider_contact_placeholder')" />
          </label>
          <label class="product-field">
            <span>{{ t('catalog.provider_phone_label') }}</span>
            <pv-input-text v-model="nuevoProveedorTelefono" :placeholder="t('catalog.provider_phone_placeholder')" />
          </label>
          <label class="product-field product-field-wide">
            <span>{{ t('catalog.provider_email_label') }}</span>
            <pv-input-text v-model="nuevoProveedorCorreo" type="email" :placeholder="t('catalog.provider_email_placeholder')" />
          </label>
        </div>
        <button type="button" class="product-button secondary" :disabled="savingSupplier" @click="guardarNuevoProveedor">
          <i :class="savingSupplier ? 'pi pi-spin pi-spinner' : 'pi pi-check'"></i>
          {{ savingSupplier ? t('catalog.saving_provider') : t('catalog.save_provider') }}
        </button>
      </div>
    </section>

    <div class="product-availability">
      <ToggleSwitch v-model="activo" />
      <span>{{ t('catalog.active_toggle') }}</span>
    </div>

    <p v-if="errorMessage" class="catalog-form-feedback error" role="alert">
      <i class="pi pi-exclamation-circle"></i>{{ errorMessage }}
    </p>
    <p v-if="successMessage" class="catalog-form-feedback success" role="status">
      <i class="pi pi-check-circle"></i>{{ successMessage }}
    </p>

    <div class="product-form-actions">
      <button type="button" class="product-button secondary" :disabled="saving" @click="cancelar">
        {{ t('catalog.cancel_button') }}
      </button>
      <button type="submit" class="product-button primary" :disabled="saving">
        <i :class="saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'"></i>
        {{ saving ? t('catalog.saving_product') : t('catalog.save_button') }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.product-form-card {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  border: 1px solid #EEDFC8;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: 0 4px 15px rgba(47, 32, 25, 0.03);
  box-sizing: border-box;
}

.product-form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #EEDFC8;
  border-radius: 14px;
  background: #FDF8F2;
}

.product-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid #EEDFC8;
  color: #2F2019;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
}

.product-section-title i {
  color: #ED6B15;
  font-size: 1.1rem;
}

.product-fields-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.1rem 1.25rem;
}

.price-fields {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.product-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.4rem;
  color: #2F2019;
  font-size: 0.85rem;
  font-weight: 600;
}

.product-field b {
  color: #EF4444;
}

.product-field-wide {
  grid-column: 1 / -1;
}

.product-field :deep(.p-inputtext),
.product-field :deep(.p-select),
.product-field :deep(.p-inputnumber),
.product-field :deep(.p-inputnumber-input),
.product-field :deep(.p-textarea) {
  width: 100%;
  box-sizing: border-box;
}

.product-field :deep(.p-inputtext),
.product-field :deep(.p-select),
.product-field :deep(.p-inputnumber-input),
.product-field :deep(.p-textarea) {
  min-height: 44px;
  border-color: #EEDFC8 !important;
  border-radius: 9px !important;
  background: #FFFFFF !important;
}

.product-field :deep(.p-textarea) {
  min-height: 80px;
  resize: vertical;
}

.product-info-note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0;
  color: #825D38;
  font-size: 0.85rem;
  line-height: 1.5;
}

.product-info-note i {
  margin-top: 0.15rem;
  color: #ED6B15;
}

.product-section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.product-section-heading .product-section-title {
  flex: 1;
}

.provider-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 0;
  background: transparent;
  color: #ED6B15;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.provider-toggle:hover {
  color: #D95A0B;
}

.provider-select {
  width: 100%;
}

.new-provider-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #EEDFC8;
  border-radius: 12px;
  background: #FFFFFF;
}

.product-availability {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #2F2019;
  font-weight: 600;
}

.catalog-form-feedback {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
}

.catalog-form-feedback.error {
  border: 1px solid #F5C6CB;
  background: #FDE8E8;
  color: #9B1C1C;
}

.catalog-form-feedback.success {
  border: 1px solid #C3E6CB;
  background: #E6F8ED;
  color: #157335;
}

.product-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.product-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.45rem;
  min-height: 44px;
  padding: 0.7rem 1.2rem;
  border: 1px solid transparent;
  border-radius: 10px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.product-button.primary {
  border-color: #ED6B15;
  background: #ED6B15;
  color: #FFFFFF;
}

.product-button.primary:hover:not(:disabled) {
  border-color: #D95A0B;
  background: #D95A0B;
}

.product-button.secondary {
  border-color: #E5D0B1;
  background: #FFFFFF;
  color: #2F2019;
}

.product-button.secondary:hover:not(:disabled) {
  background: #F8F5EF;
}

.product-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .product-form-card {
    padding: 1.25rem;
  }

  .product-form-section {
    padding: 1rem;
  }

  .product-fields-grid {
    grid-template-columns: 1fr;
  }

  .product-field-wide {
    grid-column: auto;
  }
}

@media (max-width: 560px) {
  .product-fields-grid,
  .price-fields {
    grid-template-columns: 1fr;
  }

  .product-field-wide {
    grid-column: auto;
  }

  .product-form-actions {
    flex-direction: column-reverse;
  }

  .product-form-actions .product-button {
    width: 100%;
  }
}
</style>
