<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useIdentityStore } from '../../application/identity.store.js';

const router = useRouter();
const identityStore = useIdentityStore();
const { t } = useI18n();

const form = reactive({
  nombre: '',
  apellidos: '',
  email: '',
  password: '',
  acceptTerms: false
});

const isLoading = ref(false);
const errorMessage = ref('');

const submitRegister = async () => {
  if (!form.nombre || !form.apellidos || !form.email || !form.password) {
    errorMessage.value = 'Por favor complete todos los campos obligatorios';
    return;
  }

  if (!form.acceptTerms) {
    errorMessage.value = 'Debe aceptar los términos y condiciones';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const success = await identityStore.register({
      nombre: form.nombre,
      apellidos: form.apellidos,
      correo_electronico: form.email,
      password: form.password
    });

    if (success) {
      // Redirige al formulario de inicio de sesión tras crear la cuenta
      router.push('/login');
    } else {
      errorMessage.value = identityStore.errors[0] || 'Error al crear la cuenta';
    }
  } catch (err) {
    errorMessage.value = 'Ocurrió un error inesperado durante el registro';
  } finally {
    isLoading.value = false;
  }
};
</script>
<template>
  <div class="register-form-container">
    <!-- Encabezado -->
    <div class="form-header">
      <h2 class="title">{{ $t('register.title') }}</h2>
      <p class="subtitle">{{ $t('register.subtitle') }}</p>
    </div>

    <!-- Caja del Formulario -->
    <div class="form-card">
      <form @submit.prevent="submitRegister" class="auth-form">
        <div v-if="errorMessage" class="error-banner">
          <span>⚠️ {{ errorMessage }}</span>
        </div>

        <!-- Campo Nombres -->
        <div class="field-group">
          <label for="nombre" class="field-label">{{ $t('register.first_name') }}</label>
          <pv-icon-field iconPosition="left" class="w-full">
            <pv-input-icon class="pi pi-user input-icon" />
            <pv-input-text
                id="nombre"
                v-model="form.nombre"
                type="text"
                :placeholder="$t('register.first_name_placeholder')"
                class="w-full"
                required
            />
          </pv-icon-field>
        </div>

        <!-- Campo Apellidos -->
        <div class="field-group">
          <label for="apellidos" class="field-label">{{ $t('register.last_name') }}</label>
          <pv-icon-field iconPosition="left" class="w-full">
            <pv-input-icon class="pi pi-user input-icon" />
            <pv-input-text
                id="apellidos"
                v-model="form.apellidos"
                type="text"
                :placeholder="$t('register.last_name_placeholder')"
                class="w-full"
                required
            />
          </pv-icon-field>
        </div>

        <!-- Campo Correo -->
        <div class="field-group">
          <label for="email" class="field-label">{{ $t('register.email') }}</label>
          <pv-icon-field iconPosition="left" class="w-full">
            <pv-input-icon class="pi pi-envelope input-icon" />
            <pv-input-text
                id="email"
                v-model="form.email"
                type="email"
                :placeholder="$t('register.email_placeholder')"
                class="w-full"
                required
            />
          </pv-icon-field>
        </div>

        <!-- Campo Contraseña -->
        <div class="field-group">
          <label for="password" class="field-label">{{ $t('register.password') }}</label>
          <pv-icon-field iconPosition="left" class="w-full">
            <pv-input-icon class="pi pi-lock input-icon" />
            <pv-password
                id="password"
                v-model="form.password"
                placeholder="••••••••••••"
                :feedback="false"
                toggleMask
                class="w-full"
                inputClass="w-full"
                required
            />
          </pv-icon-field>
        </div>

        <!-- Acepto términos -->
        <div class="terms-group">
          <pv-checkbox id="acceptTerms" v-model="form.acceptTerms" :binary="true" />
          <label for="acceptTerms" class="terms-label">
            {{ $t('register.terms_prefix') }}
            <a href="#" class="highlight-link">{{ $t('register.terms_link') }}</a>
          </label>
        </div>

        <!-- Botón Registrarse -->
        <pv-button
            type="submit"
            :loading="isLoading"
            class="submit-btn"
            :label="$t('register.submit_button')"
        />
      </form>
    </div>

    <!-- Enlace a Iniciar Sesión -->
    <div class="login-footer">
      <span>{{ $t('register.already_have_account') }} </span>
      <router-link to="/login" class="login-link">{{ $t('register.login_link') }}</router-link>
    </div>
  </div>
</template>

<style scoped>
.register-form-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin: 0 auto;
}

.form-header {
  text-align: center;
}

.title {
  font-family: var(--font-heading, sans-serif);
  font-size: 1.8rem;
  font-weight: 800;
  color: #2F2019;
  margin-bottom: 0.2rem;
}

.subtitle {
  font-size: 0.85rem;
  color: #786D65;
}

.form-card {
  background-color: #FAF6F0;
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid #E5D0B1;
}

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

.field-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #2F2019;
}

.terms-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.2rem;
}

.terms-label {
  font-size: 0.8rem;
  color: #2F2019;
  font-weight: 600;
}

.highlight-link {
  color: #ED6B15;
  text-decoration: none;
}

.submit-btn {
  background-color: #ED6B15 !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 0.85rem !important;
  font-weight: 700 !important;
  color: #ffffff !important;
  margin-top: 0.5rem;
}

.error-banner {
  background-color: #FEE2E2;
  color: #991B1B;
  padding: 0.6rem;
  border-radius: 8px;
  font-size: 0.8rem;
  text-align: center;
}

.login-footer {
  text-align: center;
  font-size: 0.8rem;
  color: #786D65;
}

.login-link {
  color: #ED6B15;
  font-weight: 700;
  text-decoration: none;
}
</style>