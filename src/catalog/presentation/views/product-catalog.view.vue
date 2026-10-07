<script setup>
import { onMounted, ref } from 'vue'
import { useCatalogStore } from '../../application/catalog.store.js'
import ProductForm from '../components/product-form.vue'
import LanguageSwitcher from '@/shared/presentation/components/language-switcher.vue'

const { cargarCategorias } = useCatalogStore()

const isMobileMenuOpen = ref(false)

onMounted(() => {
  cargarCategorias()
})
</script>

<template>
  <div class="petstock-app">
    <div v-if="isMobileMenuOpen" class="sidebar-overlay" @click="isMobileMenuOpen = false"></div>

    <aside class="sidebar-naranja" :class="{ 'mobile-open': isMobileMenuOpen }">
      <div class="brand">
        <img src="/font/logo2.png" alt="PetStock Logo" class="brand-logo" />
        <h2>PetStock</h2>
      </div>

      <nav class="sidebar-nav" @click="isMobileMenuOpen = false">
        <router-link to="/dashboard" class="nav-item">
          <i class="pi pi-th-large"></i>
          <span>Dashboard (Inicio)</span>
        </router-link>
        <router-link to="/catalog" class="nav-item active">
          <i class="pi pi-box"></i>
          <span>Registrar Producto</span>
        </router-link>
        <router-link to="/sales" class="nav-item">
          <i class="pi pi-shopping-bag"></i>
          <span>Registrar Venta</span>
        </router-link>
        <router-link to="/analytics" class="nav-item">
          <i class="pi pi-file"></i>
          <span>Reportes</span>
        </router-link>
        <router-link to="/inventory" class="nav-item">
          <i class="pi pi-exclamation-triangle"></i>
          <span>Bajo Stock</span>
        </router-link>
      </nav>
    </aside>

    <main class="main-wrapper">
      <header class="top-header">
        <div class="header-left-group">
          <button type="button" class="mobile-menu-toggle" @click="isMobileMenuOpen = !isMobileMenuOpen">
            <i class="pi pi-bars"></i>
          </button>
          <div class="location-tag">
            <span class="pulse-dot"></span>
            <span>Sucursal Activa: <strong>Central</strong></span>
          </div>
        </div>
        <div class="actions">
          <LanguageSwitcher />
        </div>
      </header>

      <div class="module-header-card">
        <div class="module-info">
          <h1 class="page-title">{{ $t('catalog.title') }}</h1>
          <p class="page-subtitle">{{ $t('catalog.subtitle') }}</p>
        </div>
      </div>

      <div class="view-content-wrapper">
        <ProductForm />
      </div>
    </main>
  </div>
</template>

<style scoped>
.petstock-app {
  display: flex;
  min-height: 100vh;
  background-color: #FAF7F2;
  color: #2F2019;
  width: 100%;
  font-family: 'Poppins', sans-serif;
  position: relative;
}

.mobile-menu-toggle {
  display: none;
  background: #ED6B15;
  color: #FFFFFF;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 1.1rem;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(237, 107, 21, 0.2);
  flex-shrink: 0;
}

.header-left-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sidebar-overlay {
  display: none;
}

.sidebar-naranja {
  width: 260px;
  min-width: 260px;
  background-color: #ED6B15;
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  box-sizing: border-box;
  z-index: 100;
  overflow-y: auto;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.brand {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0.5rem 0 1rem 0;
  text-align: center;
}
.brand-logo {
  width: 100%;
  max-width: 180px;
  height: auto;
  display: block;
  object-fit: contain;
}
.brand h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 !important;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  color: #FFFFFF;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}
.nav-item:hover, .nav-item.active {
  background-color: rgba(255, 255, 255, 0.25);
  font-weight: 700;
}

.main-wrapper {
  flex: 1;
  margin-left: 260px;
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  min-height: 100vh;
  box-sizing: border-box;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  padding: 0.75rem 1.25rem;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(47, 32, 25, 0.03);
  border: 1px solid #EEDFC8;
  width: 100%;
  box-sizing: border-box;
  gap: 0.5rem;
}

.location-tag {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #FDF8F2;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #5A3E2B;
  border: 1px solid #EEDFC8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  background-color: #ED6B15;
  border-radius: 50%;
  animation: pulse 2s infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(237, 107, 21, 0.5); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(237, 107, 21, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(237, 107, 21, 0); }
}

.module-header-card {
  background: #FFFFFF;
  padding: 1.75rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(47, 32, 25, 0.03);
  border: 1px solid #EEDFC8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.page-title {
  font-size: 1.65rem;
  font-weight: 700;
  color: #2F2019;
  margin: 0 0 0.2rem 0;
}

.page-subtitle {
  font-size: 0.92rem;
  color: #7A5C45;
  margin: 0;
}

.view-content-wrapper {
  width: 100%;
}

@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 99;
  }
  .sidebar-naranja {
    transform: translateX(-100%);
  }
  .sidebar-naranja.mobile-open {
    transform: translateX(0);
  }
  .main-wrapper {
    margin-left: 0;
    padding: 1rem;
  }
  .top-header {
    padding: 0.6rem 0.8rem;
  }
  .location-tag {
    font-size: 0.72rem;
    padding: 0.3rem 0.5rem;
  }
}
</style>