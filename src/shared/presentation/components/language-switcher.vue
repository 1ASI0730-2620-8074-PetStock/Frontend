<script setup>
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const setLanguage = (lang) => {
  locale.value = lang;
};
</script>

<template>
  <div class="language-switcher">
    <button
        type="button"
        class="lang-btn"
        :class="{ active: locale === 'es' }"
        @click="setLanguage('es')"
    >
      ES
    </button>
    <span class="divider">/</span>
    <button
        type="button"
        class="lang-btn"
        :class="{ active: locale === 'en' }"
        @click="setLanguage('en')"
    >
      EN
    </button>
  </div>
</template>

<style scoped>
.language-switcher {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background-color: #FFF3EB;
  border: 1px solid #FADCC9;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
}

.lang-btn {
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 700;
  color: #825D38;
  cursor: pointer;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.lang-btn.active {
  background-color: #ED6B15;
  color: #FFFFFF;
}

.divider {
  color: #E5D0B1;
  font-size: 0.75rem;
}
</style>