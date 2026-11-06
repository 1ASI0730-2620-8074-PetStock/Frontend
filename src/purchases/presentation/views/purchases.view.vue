<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePurchasesStore } from '../../application/purchases.store.js'
import PurchaseForm from '../components/purchase-form.vue'
import PurchaseHistoryList from '../components/purchase-history-list.vue'
import '../components/purchases.css'

const { t } = useI18n()
const route = useRoute()
const purchasesStore = usePurchasesStore()
const activeTab = ref('register')
const formResetToken = ref(0)
const successMessage = ref('')

onMounted(() => {
  purchasesStore.loadInitialData()
})

async function handleRegisterPurchase(purchaseData) {
  successMessage.value = ''
  try {
    await purchasesStore.registerPurchase(purchaseData)
    formResetToken.value += 1
    successMessage.value = t('purchases.success_message')
  } catch (error) {
    console.error('No se pudo completar el registro de compra:', error)
  }
}

async function handleDeletePurchase(purchase) {
  successMessage.value = ''
  try {
    await purchasesStore.deletePurchase(purchase)
    successMessage.value = t('purchases.delete_success')
  } catch (error) {
    console.error('No se pudo completar la eliminación de compra:', error)
  }
}
</script>

<template>
  <main class="purchases-page">
    <header class="purchases-page-header">
      <div class="purchases-page-heading">
        <span class="purchase-eyebrow">{{ t('purchases.eyebrow') }}</span>
        <h1>{{ t('purchases.title') }}</h1>
        <p>{{ t('purchases.subtitle') }}</p>
      </div>
      <div class="purchases-tabs" role="tablist" :aria-label="t('purchases.title')">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'register'"
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          <i class="pi pi-shopping-cart"></i>{{ t('purchases.new_purchase') }}
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'history'"
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          <i class="pi pi-history"></i>{{ t('purchases.history_tab') }}
        </button>
      </div>
    </header>

    <p v-if="successMessage" class="purchase-message success" role="status">
      <i class="pi pi-check-circle"></i>{{ successMessage }}
    </p>
    <p v-if="purchasesStore.error" class="purchase-page-error" role="alert">
      {{ purchasesStore.error }}
    </p>
    <p v-if="purchasesStore.loading" class="purchase-loading">
      <i class="pi pi-spin pi-spinner"></i> {{ t('purchases.loading') }}
    </p>

    <section v-if="activeTab === 'register'" class="purchase-content">
      <PurchaseForm
        :key="formResetToken"
        :products="purchasesStore.products"
        :suppliers="purchasesStore.suppliers"
        :initial-product-id="String(route.query.productId || '')"
        :submitting="purchasesStore.submitting"
        :reset-token="formResetToken"
        @submit-purchase="handleRegisterPurchase"
      />
    </section>

    <section v-else class="purchase-content">
      <PurchaseHistoryList
        :purchases="purchasesStore.purchases"
        :submitting="purchasesStore.submitting"
        @delete-purchase="handleDeletePurchase"
      />
    </section>
  </main>
</template>
