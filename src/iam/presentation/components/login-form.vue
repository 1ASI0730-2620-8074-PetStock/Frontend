<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useIdentityStore } from '../../application/identity.store.js';

const router = useRouter();
const identityStore = useIdentityStore();
const { t } = useI18n();

const form = reactive({
  email: '',
  password: '',
  remember: false
});

const isLoading = ref(false);
const errorMessage = ref('');

const submitLogin = async () => {
  if (!form.email || !form.password) {
    errorMessage.value = 'Por favor complete todos los campos';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const success = await identityStore.login({
      email: form.email,
      password: form.password
    });

    if (success) {
      router.push('/dashboard');
    } else {
      errorMessage.value = identityStore.errors[0] || 'Credenciales incorrectas';
    }
  } catch (err) {
    errorMessage.value = 'Ocurrió un error al intentar iniciar sesión';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-form-container">
    <!-- Encabezado Centrado del Formulario -->
    <div class="form-header">
      <div class="brand-logo-wrapper">
        <img src="/font/logo-petstock.png" alt="PetStock Logo" class="brand-logo-img" />
      </div>

      <h2 class="welcome-title">{{ $t('login.welcome') }}</h2>
    </div>

    <!-- Formulario de Login -->
    <form @submit.prevent="submitLogin" class="auth-form">
      <div v-if="errorMessage" class="error-banner">
        <span>⚠️ {{ errorMessage }}</span>
      </div>

      <!-- Campo Correo -->
      <div class="field-group">
        <label for="email" class="field-label">{{ $t('login.email_label') }}</label>
        <pv-icon-field iconPosition="left" class="w-full">
          <pv-input-icon class="pi pi-envelope input-icon" />
          <pv-input-text
              id="email"
              v-model="form.email"
              type="email"
              :placeholder="$t('login.email_placeholder')"
              class="w-full"
              required
          />
        </pv-icon-field>
      </div>

      <!-- Campo Contraseña -->
      <div class="field-group">
        <div class="label-row">
          <label for="password" class="field-label">{{ $t('login.password_label') }}</label>
          <a href="#" class="forgot-link">{{ $t('login.forgot_password') }}</a>
        </div>
        <pv-icon-field iconPosition="left" class="w-full">
          <pv-input-icon class="pi pi-lock input-icon" />
          <pv-password
              id="password"
              v-model="form.password"
              :placeholder="$t('login.password_placeholder')"
              :feedback="false"
              toggleMask
              class="w-full"
              inputClass="w-full"
              required
          />
        </pv-icon-field>
      </div>

      <!-- Mantener sesión -->
      <div class="remember-group">
        <pv-checkbox id="remember" v-model="form.remember" :binary="true" />
        <label for="remember" class="remember-label">{{ $t('login.remember_me') }}</label>
      </div>

      <!-- Botón Iniciar Sesión -->
      <pv-button
          type="submit"
          :loading="isLoading"
          class="submit-btn"
          :label="$t('login.submit_button')"
      />
    </form>

    <!-- Separador y Botones Sociales -->
    <div class="divider-container">
      <span class="divider-line"></span>
      <span class="divider-text">{{ $t('login.divider_text') }}</span>
      <span class="divider-line"></span>
    </div>

    <div class="social-buttons">
      <pv-button type="button" class="social-btn" icon="pi pi-google" :label="$t('login.social_google')" />
      <pv-button type="button" class="social-btn" icon="pi pi-facebook" :label="$t('login.social_facebook')" />
    </div>

    <div class="register-footer">
      <span>{{ t('login.register_prompt') }} </span>
      <router-link to="/register" class="register-link">{{ t('login.register_link') }}</router-link>
    </div>

    <div class="legal-footer">
      <span>🔒 {{ $t('login.encrypted_connection') }}</span>
      <span>•</span>
      <a href="#">{{ $t('login.help_center') }}</a>
      <span>•</span>
      <a href="#">{{ $t('login.terms') }}</a>
    </div>
  </div>
</template>

<style scoped>
.login-form-container {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-header {
  text-align: center;
  margin-bottom: 0.5rem;
}

.brand-logo-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.brand-logo-img {
  height: 150px;
  width: auto;
  object-fit: contain;
}

.welcome-title {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  font-weight: 700;
  color: #2F2019;
}

/* Estilos de botones y campos */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.label-row {
  display: flex;
  justify-content: space-between;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #2F2019;
}

.forgot-link {
  font-size: 0.75rem;
  color: #ED6B15;
  text-decoration: none;
}

.remember-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remember-label {
  font-size: 0.8rem;
  color: #2F2019;
}

.submit-btn {
  background-color: #ED6B15 !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 0.8rem !important;
  font-weight: 700 !important;
  color: #ffffff !important;
}

.divider-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #E5D0B1;
}

.divider-text {
  font-size: 0.68rem;
  font-weight: 700;
  color: #786D65;
}

.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.social-btn {
  background-color: #F8F5EF !important;
  border: 1px solid #E5D0B1 !important;
  color: #2F2019 !important;
  border-radius: 10px !important;
}

.register-footer, .legal-footer {
  text-align: center;
  font-size: 0.75rem;
  color: #786D65;
}

.register-link {
  color: #ED6B15;
  font-weight: 700;
  text-decoration: none;
}

.legal-footer {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
}
</style>