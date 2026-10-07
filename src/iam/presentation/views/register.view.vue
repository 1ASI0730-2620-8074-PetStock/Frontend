<script setup>
import RegisterForm from '../components/register-form.vue';
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue';
</script>

<template>
  <div class="auth-page-container">
    <!-- Idioma flotante en la esquina superior derecha -->
    <div class="language-header">
      <LanguageSwitcher />
    </div>

    <!-- Contenedor Principal (2 Columnas) -->
    <div class="auth-wrapper">
      <!-- Columna Izquierda: Imagen petstock-inicio.jpg -->
      <div class="banner-section">
        <img
            src="/font/petstock-inicio.jpg"
            alt="PetStock Banner"
            class="banner-image"
        />
      </div>

      <!-- Columna Derecha: Formulario de Registro -->
      <div class="form-section">
        <RegisterForm />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page-container {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
}

.language-header {
  position: absolute;
  top: 1.5rem;
  right: 2rem;
  z-index: 20;
}

.auth-wrapper {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

/* Columna Izquierda con la imagen */
.banner-section {
  flex: 1;
  display: none; /* Se oculta en celulares y pantallas pequeñas */
  background-color: #f4f4f4;
  position: relative;
}

@media (min-width: 960px) {
  .banner-section {
    display: block;
  }
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Columna Derecha con el formulario */
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  background-color: #FFFFFF;
}
</style>