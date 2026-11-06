<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  products: { type: Array, default: () => [] },
  suppliers: { type: Array, default: () => [] },
  initialProductId: { type: String, default: '' },
  submitting: { type: Boolean, default: false },
  resetToken: { type: Number, default: 0 }
})

const emit = defineEmits(['submit-purchase'])
const { t } = useI18n()

const supplierId = ref('')
const productId = ref('')
const quantity = ref(1)
const unitCost = ref('')
const purchaseDate = ref(new Date().toISOString().slice(0, 10))
const validationMessage = ref('')

const availableProducts = computed(() => props.products.filter(product =>
  !supplierId.value || !product.supplierId || String(product.supplierId) === String(supplierId.value)
))

const selectedProduct = computed(() =>
  props.products.find(product => String(product.id) === String(productId.value))
)

const total = computed(() => Number(quantity.value || 0) * Number(unitCost.value || 0))

watch(supplierId, (newSupplierId) => {
  const selected = props.products.find(product => String(product.id) === String(productId.value))
  if (selected?.supplierId && String(selected.supplierId) !== String(newSupplierId)) {
    productId.value = ''
  }
})

watch(
  [() => props.initialProductId, () => props.products],
  ([initialProductId, products]) => {
    if (!initialProductId) return
    const product = products.find(item => String(item.id) === String(initialProductId))
    if (!product) return
    supplierId.value = product.supplierId ? String(product.supplierId) : ''
    productId.value = String(product.id)
  },
  { immediate: true }
)

watch(
  () => props.suppliers,
  suppliers => {
    const product = props.products.find(item => String(item.id) === String(props.initialProductId))
    if (product?.supplierId && suppliers.some(item => String(item.id) === String(product.supplierId))) {
      supplierId.value = String(product.supplierId)
      productId.value = String(product.id)
    }
  },
  { immediate: true }
)

watch(
  () => props.resetToken,
  () => {
    if (props.initialProductId) return
    supplierId.value = ''
    productId.value = ''
    quantity.value = 1
    unitCost.value = ''
    purchaseDate.value = new Date().toISOString().slice(0, 10)
    validationMessage.value = ''
  }
)

function submitPurchase() {
  validationMessage.value = ''
  const purchaseQuantity = Number(quantity.value)
  const cost = Number(unitCost.value)

  if (!supplierId.value || !productId.value || !purchaseDate.value) {
    validationMessage.value = t('purchases.required_fields')
    return
  }
  if (!Number.isInteger(purchaseQuantity) || purchaseQuantity <= 0) {
    validationMessage.value = t('purchases.invalid_quantity')
    return
  }
  if (!Number.isFinite(cost) || cost <= 0) {
    validationMessage.value = t('purchases.invalid_cost')
    return
  }

  const supplier = props.suppliers.find(item => String(item.id) === String(supplierId.value))
  if (!supplier || !selectedProduct.value) {
    validationMessage.value = t('purchases.required_fields')
    return
  }

  emit('submit-purchase', {
    supplierId: supplier.id,
    supplierName: supplier.companyName,
    productId: selectedProduct.value.id,
    productName: selectedProduct.value.name,
    quantity: purchaseQuantity,
    unitCost: cost,
    date: purchaseDate.value
  })
}
</script>

<template>
  <form class="purchase-form-card" @submit.prevent="submitPurchase">
    <p v-if="validationMessage" class="purchase-message error" role="alert">
      <i class="pi pi-exclamation-circle"></i>{{ validationMessage }}
    </p>

    <section class="purchase-form-section">
      <h2 class="purchase-section-title"><i class="pi pi-truck"></i>{{ t('purchases.supplier_section') }}</h2>
      <div class="purchase-fields-grid supplier-fields">
        <label class="purchase-field">
          <span>{{ t('purchases.supplier') }} <b>*</b></span>
          <select v-model="supplierId" required>
            <option value="" disabled>{{ t('purchases.choose_supplier') }}</option>
            <option v-for="supplier in suppliers" :key="supplier.id" :value="String(supplier.id)">
              {{ supplier.companyName }}
            </option>
          </select>
        </label>
        <label class="purchase-field">
          <span>{{ t('purchases.date') }} <b>*</b></span>
          <input v-model="purchaseDate" type="date" required />
        </label>
      </div>
    </section>

    <section class="purchase-form-section">
      <h2 class="purchase-section-title"><i class="pi pi-box"></i>{{ t('purchases.product_section') }}</h2>
      <div class="purchase-fields-grid product-fields">
        <label class="purchase-field purchase-field-wide">
          <span>{{ t('purchases.product') }} <b>*</b></span>
          <select v-model="productId" required>
            <option value="" disabled>{{ t('purchases.choose_product') }}</option>
            <option v-for="product in availableProducts" :key="product.id" :value="String(product.id)">
              {{ product.name }}
            </option>
          </select>
        </label>
        <label class="purchase-field">
          <span>{{ t('purchases.quantity') }} <b>*</b></span>
          <input v-model.number="quantity" type="number" min="1" step="1" required />
        </label>
        <label class="purchase-field">
          <span>{{ t('purchases.unit_cost') }} <b>*</b></span>
          <input v-model.number="unitCost" type="number" min="0.01" step="0.01" required :placeholder="t('purchases.cost_placeholder')" />
        </label>
      </div>
    </section>

    <div class="purchase-total-row">
      <div>
        <span>{{ t('purchases.total_label') }}</span>
        <small v-if="selectedProduct">{{ selectedProduct.name }} · {{ quantity }} {{ t('purchases.units') }}</small>
      </div>
      <strong>S/ {{ total.toFixed(2) }}</strong>
    </div>

    <button class="purchase-submit-button" type="submit" :disabled="submitting || suppliers.length === 0 || products.length === 0">
      <i :class="submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'"></i>
      {{ submitting ? t('purchases.saving') : t('purchases.save_button') }}
    </button>
  </form>
</template>
