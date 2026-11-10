<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useInventoryStore } from '../../application/inventory.store.js'
import { useCatalogStore } from '../../../catalog/application/catalog.store.js'

const { inventarios, alertasStock, loading, error, cargarInventarios, cargarAlertasStock } = useInventoryStore()
const inventoryStore = useInventoryStore()
const { productos, categorias, cargarProductos, cargarCategorias } = useCatalogStore()
const router = useRouter()
const { t } = useI18n()
const editingProductId = ref(null)
const minimumStockInput = ref(0)
const savingThreshold = ref(false)
const actionMessage = ref('')
const actionError = ref('')

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

function irACompra(productId) {
  router.push({ name: 'purchases', query: { productId: String(productId) } })
}

function iniciarEdicion(inventory) {
  actionMessage.value = ''
  actionError.value = ''
  if (!inventory) {
    actionError.value = t('inventory.threshold_update_error')
    return
  }
  editingProductId.value = String(inventory.idProducto)
  minimumStockInput.value = Number(inventory.umbralMinimo || 0)
}

function cancelarEdicion() {
  editingProductId.value = null
  actionError.value = ''
}

async function guardarStockMinimo(productId) {
  actionError.value = ''
  actionMessage.value = ''
  const value = Number(minimumStockInput.value)
  if (!Number.isInteger(value) || value < 0) {
    actionError.value = t('inventory.invalid_minimum')
    return
  }

  savingThreshold.value = true
  try {
    await inventoryStore.actualizarStockMinimo(productId, value)
    actionMessage.value = t('inventory.threshold_updated')
    editingProductId.value = null
  } catch (saveError) {
    actionError.value = t('inventory.threshold_update_error')
    console.error('Error al guardar el stock mínimo:', saveError)
  } finally {
    savingThreshold.value = false
  }
}

const alertasCriticas = computed(() =>
    alertasStock.value.filter(a => a.nivelAlerta === 'critical' && a.estaActiva && coincideBusqueda(a.idProducto))
)
const alertasBajas = computed(() =>
    alertasStock.value.filter(a => a.nivelAlerta !== 'critical' && a.estaActiva && coincideBusqueda(a.idProducto))
)
const totalAlertas = computed(() => alertasCriticas.value.length + alertasBajas.value.length)
</script>

<template>
  <main class="stock-page">
    <header class="stock-page-header">
      <div class="stock-page-heading">
        <span class="stock-eyebrow">{{ $t('inventory.eyebrow') }}</span>
        <h1>{{ $t('inventory.title') }}</h1>
        <p>{{ $t('inventory.subtitle') }}</p>
      </div>
      <div class="stock-header-icon"><i class="pi pi-exclamation-triangle"></i></div>
    </header>

    <section class="stock-overview" :aria-label="$t('inventory.summary')">
      <article class="stock-summary-card critical-summary">
        <span class="summary-icon"><i class="pi pi-bell"></i></span>
        <div>
          <span class="summary-label">{{ $t('inventory.critical_alert') }}</span>
          <strong>{{ alertasCriticas.length }}</strong>
        </div>
      </article>
      <article class="stock-summary-card low-summary">
        <span class="summary-icon"><i class="pi pi-exclamation-circle"></i></span>
        <div>
          <span class="summary-label">{{ $t('inventory.low_stock') }}</span>
          <strong>{{ alertasBajas.length }}</strong>
        </div>
      </article>
      <article class="stock-summary-card total-summary">
        <span class="summary-icon"><i class="pi pi-box"></i></span>
        <div>
          <span class="summary-label">{{ $t('inventory.total_alerts') }}</span>
          <strong>{{ totalAlertas }}</strong>
        </div>
      </article>
    </section>

    <section class="stock-search-card">
      <div class="stock-search-copy">
        <strong>{{ $t('inventory.search_title') }}</strong>
        <span>{{ $t('inventory.search_hint') }}</span>
      </div>
      <div class="stock-search-input">
        <i class="pi pi-search" aria-hidden="true"></i>
        <pv-input-text v-model="busqueda" :placeholder="$t('inventory.search_placeholder')" />
        <button v-if="busqueda" type="button" class="clear-search" :aria-label="$t('inventory.clear_search')" @click="busqueda = ''">
          <i class="pi pi-times"></i>
        </button>
      </div>
    </section>

    <p v-if="loading" class="stock-feedback">
      <i class="pi pi-spin pi-spinner"></i>{{ $t('inventory.loading') }}
    </p>
    <p v-if="error" class="stock-feedback error" role="alert">{{ error }}</p>
    <p v-if="actionMessage" class="stock-feedback success" role="status">
      <i class="pi pi-check-circle"></i>{{ actionMessage }}
    </p>
    <p v-if="actionError" class="stock-feedback error" role="alert">
      <i class="pi pi-exclamation-circle"></i>{{ actionError }}
    </p>

    <section v-if="alertasCriticas.length" class="stock-alert-section">
      <header class="stock-section-heading">
        <div class="stock-section-title critical-title">
          <span class="section-title-icon"><i class="pi pi-bell"></i></span>
          <div>
            <h2>{{ $t('inventory.critical_alert') }}</h2>
            <p>{{ $t('inventory.critical_description') }}</p>
          </div>
        </div>
        <span class="section-count critical-count">{{ alertasCriticas.length }}</span>
      </header>

      <div class="stock-alert-grid">
        <article v-for="alerta in alertasCriticas" :key="alerta.id" class="stock-alert-card critical">
          <div class="alert-card-top">
            <span class="alert-status critical-status"><i class="pi pi-exclamation-circle"></i>{{ $t('inventory.critical_tag') }}</span>
            <span v-if="nombreCategoria(alerta.idProducto)" class="category-chip">{{ nombreCategoria(alerta.idProducto) }}</span>
          </div>

          <div class="stock-card-content">
            <div class="alert-product-heading">
              <span class="product-icon critical-product-icon"><i class="pi pi-box"></i></span>
              <div>
                <h3>{{ nombreProducto(alerta.idProducto) }}</h3>
                <span class="product-card-caption">{{ $t('inventory.product_stock_caption') }}</span>
              </div>
            </div>

            <div class="stock-values">
              <div class="stock-value current-critical">
                <span>{{ $t('inventory.current_stock') }}</span>
                <strong>{{ inventarioDe(alerta.idProducto)?.stockActual ?? 0 }} <small>{{ $t('inventory.units') }}</small></strong>
              </div>
              <div class="stock-value stock-minimum">
                <span>{{ $t('inventory.min_required') }}</span>
                <strong>{{ inventarioDe(alerta.idProducto)?.umbralMinimo ?? 0 }} <small>{{ $t('inventory.units') }}</small></strong>
              </div>
            </div>

            <div class="stock-card-replenishment">
              <div class="stock-progress" role="progressbar" :aria-valuenow="Math.min(porcentajeStock(alerta.idProducto), 100)" aria-valuemin="0" aria-valuemax="100">
                <div class="stock-progress-fill critical-fill" :style="{ width: Math.min(porcentajeStock(alerta.idProducto), 100) + '%' }"></div>
              </div>
              <div class="stock-progress-caption">
                <span>{{ $t('inventory.units_remaining', { count: unidadesFaltantes(alerta.idProducto) }) }}</span>
                <strong>{{ porcentajeStock(alerta.idProducto) }}% {{ $t('inventory.covered') }}</strong>
              </div>

              <div class="alert-card-actions">
                <pv-button :label="$t('inventory.replenish_button')" icon="pi pi-plus" class="replenish-button" @click="irACompra(alerta.idProducto)" />
                <pv-button :label="$t('inventory.edit_button')" icon="pi pi-pencil" severity="secondary" outlined class="edit-stock-button" @click="iniciarEdicion(inventarioDe(alerta.idProducto))" />
              </div>
            </div>
          </div>
          <form v-if="editingProductId === String(alerta.idProducto)" class="stock-edit-panel" @submit.prevent="guardarStockMinimo(alerta.idProducto)">
            <label>
              <span>{{ $t('inventory.edit_minimum_label') }}</span>
              <input v-model.number="minimumStockInput" type="number" min="0" step="1" required />
            </label>
            <div class="stock-edit-actions">
              <pv-button type="button" :label="$t('inventory.cancel_edit')" severity="secondary" text @click="cancelarEdicion" />
              <pv-button type="submit" :label="savingThreshold ? $t('inventory.saving') : $t('inventory.save_minimum')" icon="pi pi-check" :loading="savingThreshold" />
            </div>
          </form>
        </article>
      </div>
    </section>

    <section v-if="alertasBajas.length" class="stock-alert-section">
      <header class="stock-section-heading">
        <div class="stock-section-title low-title">
          <span class="section-title-icon"><i class="pi pi-exclamation-triangle"></i></span>
          <div>
            <h2>{{ $t('inventory.low_stock') }}</h2>
            <p>{{ $t('inventory.low_description') }}</p>
          </div>
        </div>
        <span class="section-count low-count">{{ alertasBajas.length }}</span>
      </header>

      <div class="stock-alert-grid">
        <article v-for="alerta in alertasBajas" :key="alerta.id" class="stock-alert-card low">
          <div class="alert-card-top">
            <span class="alert-status low-status"><i class="pi pi-exclamation-triangle"></i>{{ $t('inventory.attention') }}</span>
            <span v-if="nombreCategoria(alerta.idProducto)" class="category-chip">{{ nombreCategoria(alerta.idProducto) }}</span>
          </div>

          <div class="stock-card-content">
            <div class="alert-product-heading">
              <span class="product-icon low-product-icon"><i class="pi pi-box"></i></span>
              <div>
                <h3>{{ nombreProducto(alerta.idProducto) }}</h3>
                <span class="product-card-caption">{{ $t('inventory.product_stock_caption') }}</span>
              </div>
            </div>

            <div class="stock-values">
              <div class="stock-value">
                <span>{{ $t('inventory.current_stock') }}</span>
                <strong>{{ inventarioDe(alerta.idProducto)?.stockActual ?? 0 }} <small>{{ $t('inventory.units') }}</small></strong>
              </div>
              <div class="stock-value stock-minimum">
                <span>{{ $t('inventory.min_required') }}</span>
                <strong>{{ inventarioDe(alerta.idProducto)?.umbralMinimo ?? 0 }} <small>{{ $t('inventory.units') }}</small></strong>
              </div>
            </div>

            <div class="stock-card-replenishment">
              <div class="stock-progress" role="progressbar" :aria-valuenow="Math.min(porcentajeStock(alerta.idProducto), 100)" aria-valuemin="0" aria-valuemax="100">
                <div class="stock-progress-fill low-fill" :style="{ width: Math.min(porcentajeStock(alerta.idProducto), 100) + '%' }"></div>
              </div>
              <div class="stock-progress-caption">
                <span>{{ $t('inventory.units_remaining', { count: unidadesFaltantes(alerta.idProducto) }) }}</span>
                <strong>{{ porcentajeStock(alerta.idProducto) }}% {{ $t('inventory.covered') }}</strong>
              </div>

              <div class="alert-card-actions">
                <pv-button :label="$t('inventory.replenish_button')" icon="pi pi-plus" class="replenish-button" @click="irACompra(alerta.idProducto)" />
                <pv-button :label="$t('inventory.edit_button')" icon="pi pi-pencil" severity="secondary" outlined class="edit-stock-button" @click="iniciarEdicion(inventarioDe(alerta.idProducto))" />
              </div>
            </div>
          </div>
          <form v-if="editingProductId === String(alerta.idProducto)" class="stock-edit-panel" @submit.prevent="guardarStockMinimo(alerta.idProducto)">
            <label>
              <span>{{ $t('inventory.edit_minimum_label') }}</span>
              <input v-model.number="minimumStockInput" type="number" min="0" step="1" required />
            </label>
            <div class="stock-edit-actions">
              <pv-button type="button" :label="$t('inventory.cancel_edit')" severity="secondary" text @click="cancelarEdicion" />
              <pv-button type="submit" :label="savingThreshold ? $t('inventory.saving') : $t('inventory.save_minimum')" icon="pi pi-check" :loading="savingThreshold" />
            </div>
          </form>
        </article>
      </div>
    </section>

    <section v-if="!loading && !error && totalAlertas === 0" class="stock-empty-state">
      <span class="empty-state-icon"><i :class="busqueda ? 'pi pi-search' : 'pi pi-check-circle'"></i></span>
      <h2>{{ busqueda ? $t('inventory.no_search_results') : $t('inventory.no_alerts') }}</h2>
      <p>{{ busqueda ? $t('inventory.no_search_description') : $t('inventory.no_alerts_description') }}</p>
      <pv-button v-if="busqueda" :label="$t('inventory.clear_search')" severity="secondary" outlined @click="busqueda = ''" />
    </section>
  </main>
</template>

<style scoped>
.stock-page {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1.25rem;
  box-sizing: border-box;
}

.stock-page-header,
.stock-search-card,
.stock-alert-section,
.stock-empty-state {
  border: 1px solid #EEDFC8;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: 0 4px 15px rgba(47, 32, 25, 0.03);
}

.stock-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
}

.stock-page-heading h1 {
  margin: 0 0 0.2rem;
  color: #2F2019;
  font-size: 1.65rem;
  font-weight: 700;
}

.stock-page-heading p {
  margin: 0;
  color: #7A5C45;
  font-size: 0.92rem;
}

.stock-eyebrow {
  display: block;
  margin-bottom: 0.35rem;
  color: #ED6B15;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stock-header-icon,
.section-title-icon,
.summary-icon,
.product-icon,
.empty-state-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
}

.stock-header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #FFF1E6;
  color: #ED6B15;
  font-size: 1.25rem;
}

.stock-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.stock-summary-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-height: 94px;
  padding: 1rem 1.25rem;
  border: 1px solid #EEDFC8;
  border-radius: 14px;
  background: #FFFFFF;
  box-shadow: 0 4px 15px rgba(47, 32, 25, 0.03);
  box-sizing: border-box;
}

.summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: #FFF1E6;
  color: #ED6B15;
  font-size: 1.1rem;
}

.critical-summary .summary-icon {
  background: #FDECEC;
  color: #DC2626;
}

.stock-summary-card > div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.summary-label {
  color: #825D38;
  font-size: 0.82rem;
}

.stock-summary-card strong {
  color: #2F2019;
  font-size: 1.45rem;
  line-height: 1.2;
}

.critical-summary strong {
  color: #C62828;
}

.stock-search-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.25rem;
  padding: 1.1rem 1.25rem;
}

.stock-search-copy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stock-search-copy strong {
  color: #2F2019;
}

.stock-search-copy span {
  color: #825D38;
  font-size: 0.82rem;
}

.stock-search-input {
  position: relative;
  width: min(100%, 420px);
}

.stock-search-input > i {
  position: absolute;
  top: 50%;
  left: 0.9rem;
  z-index: 1;
  color: #825D38;
  transform: translateY(-50%);
}

.stock-search-input :deep(.p-inputtext) {
  width: 100%;
  min-height: 44px;
  padding-left: 2.5rem !important;
  padding-right: 2.5rem !important;
  border-color: #EEDFC8 !important;
  border-radius: 10px !important;
  background: #FFFDFC !important;
  box-sizing: border-box;
}

.clear-search {
  position: absolute;
  top: 50%;
  right: 0.65rem;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #825D38;
  cursor: pointer;
  transform: translateY(-50%);
}

.clear-search:hover {
  background: #F8F5EF;
}

.stock-feedback {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0;
  color: #825D38;
}

.stock-feedback.error {
  padding: 0.9rem 1rem;
  border: 1px solid #F5C6CB;
  border-radius: 10px;
  background: #FDE8E8;
  color: #9B1C1C;
}

.stock-feedback.success {
  padding: 0.9rem 1rem;
  border: 1px solid #C3E6CB;
  border-radius: 10px;
  background: #E6F8ED;
  color: #157335;
}

.stock-alert-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
}

.stock-section-heading,
.stock-section-title {
  display: flex;
  align-items: center;
}

.stock-section-heading {
  justify-content: space-between;
  gap: 1rem;
}

.stock-section-title {
  gap: 0.75rem;
}

.section-title-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #FFF1E6;
  color: #ED6B15;
  font-size: 1.05rem;
}

.critical-title .section-title-icon {
  background: #FDECEC;
  color: #DC2626;
}

.stock-section-title h2 {
  margin: 0;
  color: #2F2019;
  font-size: 1.08rem;
}

.stock-section-title p {
  margin: 0.2rem 0 0;
  color: #825D38;
  font-size: 0.82rem;
}

.section-count {
  display: inline-grid;
  min-width: 34px;
  height: 34px;
  place-items: center;
  padding: 0 0.45rem;
  border-radius: 10px;
  font-weight: 800;
  box-sizing: border-box;
}

.critical-count {
  background: #FDECEC;
  color: #C62828;
}

.low-count {
  background: #FFF1E6;
  color: #9B4A11;
}

.stock-alert-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.85rem;
}

.stock-alert-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.95rem;
  padding: 1.15rem 1.25rem;
  border: 1px solid #E5D0B1;
  border-left: 4px solid #ED6B15;
  border-radius: 14px;
  background: linear-gradient(110deg, #FFFFFF 0%, #FDFBF8 100%);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.stock-alert-card:hover {
  border-color: #ED6B15;
  box-shadow: 0 4px 14px rgba(237, 107, 21, 0.08);
}

.stock-alert-card.critical {
  border-left-color: #DC2626;
}

.stock-alert-card.critical:hover {
  border-color: #E7A2A2;
}

.alert-card-top,
.alert-product-heading,
.stock-values,
.stock-progress-caption,
.alert-card-actions {
  display: flex;
  align-items: center;
}

.alert-card-top {
  justify-content: space-between;
  gap: 0.65rem;
}

.alert-status,
.category-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
}

.critical-status {
  background: #FDECEC;
  color: #B42323;
}

.low-status {
  background: #FFF1E6;
  color: #9B4A11;
}

.category-chip {
  overflow: hidden;
  max-width: 60%;
  background: #F4EBE1;
  color: #825D38;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alert-product-heading {
  gap: 0.7rem;
}

.stock-card-content {
  display: grid;
  grid-template-columns: minmax(190px, 1fr) minmax(260px, 1.15fr) minmax(300px, 1.35fr);
  align-items: center;
  gap: 1.25rem;
}

.product-card-caption {
  display: block;
  margin-top: 0.25rem;
  color: #825D38;
  font-size: 0.78rem;
}

.product-icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: #FFF1E6;
  color: #ED6B15;
}

.critical-product-icon {
  background: #FDECEC;
  color: #DC2626;
}

.alert-product-heading h3 {
  overflow: hidden;
  margin: 0;
  color: #2F2019;
  font-size: 1rem;
  text-overflow: ellipsis;
}

.stock-values {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  padding: 0 1.1rem;
  border-right: 1px solid #F0E4D4;
  border-left: 1px solid #F0E4D4;
}

.stock-value {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.25rem;
}

.stock-value span {
  color: #825D38;
  font-size: 0.78rem;
}

.stock-value strong {
  color: #2F2019;
  font-size: 1.05rem;
}

.stock-value small {
  color: #825D38;
  font-size: 0.75rem;
  font-weight: 500;
}

.current-critical strong {
  color: #C62828;
}

.stock-minimum {
  text-align: right;
}

.stock-card-replenishment {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.55rem;
}

.stock-progress {
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 10px;
  background: #EEE8E0;
}

.stock-progress-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.3s ease;
}

.critical-fill {
  background: #DC2626;
}

.low-fill {
  background: #ED6B15;
}

.stock-progress-caption {
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0;
  color: #825D38;
  font-size: 0.75rem;
}

.stock-progress-caption strong {
  color: #2F2019;
  white-space: nowrap;
}

.alert-card-actions {
  gap: 0.65rem;
  margin-top: 0.25rem;
}

.alert-card-actions :deep(.p-button) {
  justify-content: center;
  min-height: 42px;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  font-size: 0.86rem;
  font-weight: 700;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.alert-card-actions :deep(.p-button:hover) {
  transform: translateY(-1px);
}

.alert-card-actions :deep(.replenish-button) {
  flex: 1;
  border-color: #ED6B15;
  background: #ED6B15;
  box-shadow: 0 3px 8px rgba(237, 107, 21, 0.18);
}

.alert-card-actions :deep(.replenish-button:hover) {
  border-color: #D95A0B;
  background: #D95A0B;
  box-shadow: 0 5px 12px rgba(217, 90, 11, 0.24);
}

.alert-card-actions :deep(.edit-stock-button) {
  border-color: #E5D0B1;
  background: #FFFFFF;
  color: #825D38;
}

.alert-card-actions :deep(.edit-stock-button:hover) {
  border-color: #ED6B15;
  background: #FFF9F4;
  color: #B44A0A;
}

.stock-edit-panel {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto;
  align-items: end;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid #FADCC9;
  border-radius: 12px;
  background: #FFF9F4;
  animation: edit-panel-in 0.18s ease-out;
}

.stock-edit-panel label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  color: #2F2019;
  font-size: 0.82rem;
  font-weight: 700;
}

.stock-edit-panel input {
  width: 100%;
  min-height: 42px;
  padding: 0.6rem 0.75rem;
  border: 1px solid #E5D0B1;
  border-radius: 9px;
  background: #FFFFFF;
  color: #2F2019;
  font: inherit;
  box-sizing: border-box;
}

.stock-edit-panel input:focus {
  outline: 0;
  border-color: #ED6B15;
  box-shadow: 0 0 0 2px rgba(237, 107, 21, 0.15);
}

.stock-edit-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stock-edit-actions :deep(.p-button) {
  min-height: 40px;
  border-radius: 9px;
  font-size: 0.82rem;
}

.stock-edit-actions :deep(.p-button:last-child) {
  border-color: #ED6B15;
  background: #ED6B15;
}

.stock-edit-actions :deep(.p-button:last-child:hover) {
  border-color: #D95A0B;
  background: #D95A0B;
}

@keyframes edit-panel-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stock-empty-state {
  display: flex;
  min-height: 250px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
}

.empty-state-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 0.75rem;
  border-radius: 18px;
  background: #E6F8ED;
  color: #188044;
  font-size: 1.5rem;
}

.stock-empty-state h2 {
  margin: 0;
  color: #2F2019;
  font-size: 1.15rem;
}

.stock-empty-state p {
  margin: 0.4rem 0 1rem;
  color: #825D38;
}

@media (max-width: 900px) {
  .stock-card-content {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .stock-card-replenishment {
    grid-column: 1 / -1;
  }

  .stock-edit-panel {
    grid-template-columns: 1fr;
  }

  .stock-edit-actions {
    justify-content: flex-end;
  }

  .stock-values {
    padding: 0 0 0 1rem;
    border-right: 0;
    border-left: 1px solid #F0E4D4;
  }
}

@media (max-width: 700px) {
  .stock-overview {
    grid-template-columns: 1fr;
  }

  .stock-summary-card {
    min-height: 78px;
  }

  .stock-search-card {
    align-items: stretch;
    flex-direction: column;
  }

  .stock-search-input {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .stock-page-header,
  .stock-alert-section {
    padding: 1.1rem;
  }

  .stock-page-header {
    align-items: flex-start;
  }

  .stock-page-heading h1 {
    font-size: 1.35rem;
  }

  .stock-section-title p {
    max-width: 230px;
  }

  .stock-card-content {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.9rem;
  }

  .stock-alert-card {
    gap: 0.8rem;
    padding: 1rem;
  }

  .stock-values {
    padding: 0.75rem 0;
    border-top: 1px solid #F0E4D4;
    border-right: 0;
    border-bottom: 1px solid #F0E4D4;
    border-left: 0;
  }

  .stock-card-replenishment {
    grid-column: auto;
  }

  .stock-progress-caption {
    align-items: center;
    flex-direction: row;
  }
}
</style>