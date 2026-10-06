<script setup>
import LoginForm from '../components/login-form.vue';
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue';
</script>

<template>
  <div class="login-layout">
    <!-- Panel Izquierdo: Solo la imagen grande de fondo -->
    <div class="brand-panel"></div>

    <!-- Panel Derecho: Formulario y Selector de Idioma -->
    <div class="form-panel">
      <div class="top-nav">
        <LanguageSwitcher />
      </div>

      <div class="form-content">
        <LoginForm />
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-layout {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  background-color: #F8F5EF;
}

.brand-panel {
  flex: 1.1;
  background: url('/font/petstock-inicio.jpg') no-repeat center center / cover;
}

.form-panel {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2.5rem;
  background-color: #FFFFFF;
}

.top-nav {
  position: absolute;
  top: 1.75rem;
  right: 2rem;
}

.form-content {
  width: 100%;
  display: flex;
  justify-content: center;
}

@media (max-width: 960px) {
  .brand-panel {
    display: none;
  }
}
</style>