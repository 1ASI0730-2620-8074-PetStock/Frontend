<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useIdentityStore } from '@/iam/application/identity.store.js';
import LanguageSwitcher from './language-switcher.vue';

const { t } = useI18n();
const identityStore = useIdentityStore();

// Controla si el menú lateral está abierto en celular
const isMenuOpen = ref(false);

// Opciones del menú lateral
const menuItems = [
  { to: '/dashboard', icon: 'pi pi-th-large', label: 'layout.menu_dashboard' },
  { to: '/catalog', icon: 'pi pi-box', label: 'layout.menu_product' },
  { to: '/sales', icon: 'pi pi-shopping-bag', label: 'layout.menu_sale' },
  { to: '/analytics', icon: 'pi pi-file', label: 'layout.menu_reports' },
  { to: '/inventory', icon: 'pi pi-exclamation-triangle', label: 'layout.menu_low_stock' }
];

// Datos del usuario que inició sesión (IAM)
const userName = computed(() => {
  const user = identityStore.currentUser;
  return user ? `${user.name} ${user.lastName}` : '';
});
const userInitial = computed(() => userName.value.charAt(0) || 'U');
const userRole = computed(() => identityStore.currentUser?.role || '');
</script>

<template>
  <div class="app-layout">
    <!-- Fondo oscuro cuando el menú está abierto en celular -->
    <div v-if="isMenuOpen" class="overlay" @click="isMenuOpen = false"></div>

    <!-- Barra lateral naranja -->
    <aside class="sidebar" :class="{ open: isMenuOpen }">
      <div class="brand">
        <img src="/font/logo2.png" alt="PetStock" class="brand-logo" />
        <h2>PetStock</h2>
      </div>

      <nav class="sidebar-nav" @click="isMenuOpen = false">
        <router-link v-for="item in menuItems" :key="item.to" :to="item.to" class="nav-item" active-class="active">
          <i :class="item.icon" aria-hidden="true"></i>
          <span>{{ t(item.label) }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- Contenido -->
    <main class="main-content">
      <header class="top-bar">
        <div class="top-left">
          <button type="button" class="menu-button" :aria-label="t('layout.open_menu')" @click="isMenuOpen = !isMenuOpen">
            <i class="pi pi-bars" aria-hidden="true"></i>
          </button>
          <div class="location-tag">
            <span class="dot">●</span> {{ t('layout.active_store') }}: <strong>Central</strong>
          </div>
        </div>

        <div class="top-right">
          <LanguageSwitcher />
          <i class="pi pi-bell bell" :aria-label="t('layout.notifications')"></i>
          <!-- Al hacer clic en el usuario se abre su perfil -->
          <router-link :to="{ name: 'profile' }" class="user-badge" :aria-label="t('layout.go_to_profile')">
            <pv-avatar :label="userInitial" shape="circle" class="user-avatar" />
            <span class="user-text">
              <span class="user-name">{{ userName }}</span>
              <span class="user-role">{{ userRole }}</span>
            </span>
          </router-link>
        </div>
      </header>

      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-cream);
}

/* Barra lateral fija */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  padding: 1.5rem 1rem;
  background-color: var(--primary-color);
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 100;
  transition: transform 0.3s ease;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0 1.5rem;
}

.brand-logo {
  width: 200px;
  margin-bottom: -20px;
}

.brand h2 {
  font-size: 1.8rem;
  color: #FFFFFF;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  color: #FFFFFF;
  text-decoration: none;
  font-weight: 500;
}

.nav-item:hover,
.nav-item.active {
  background-color: rgba(255, 255, 255, 0.25);
  font-weight: 700;
}

/* Contenido a la derecha de la barra */
.main-content {
  flex: 1;
  min-width: 0;
  margin-left: 260px;
  padding: 1.5rem 2.5rem;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.top-left,
.top-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-button {
  display: none;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: #FFFFFF;
  cursor: pointer;
}

.location-tag {
  background-color: var(--beige-color);
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-size: 0.85rem;
}

.dot {
  color: var(--primary-color);
}

.bell {
  color: var(--text-dark);
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  color: var(--text-dark);
  text-decoration: none;
}

.user-badge:hover {
  background-color: #FFF3EB;
}

.user-avatar {
  background-color: var(--secondary-color);
  color: #FFFFFF;
}

.user-text {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 700;
  font-size: 0.9rem;
}

.user-role {
  font-size: 0.75rem;
  color: var(--secondary-color);
}

.overlay {
  display: none;
}

/* Celular y tablet: la barra se esconde y se abre con el botón ☰ */
@media (max-width: 900px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 99;
  }

  .menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .main-content {
    margin-left: 0;
    padding: 1rem;
  }

  .location-tag,
  .bell,
  .user-text {
    display: none;
  }
}
</style>
