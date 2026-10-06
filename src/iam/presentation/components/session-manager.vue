<script setup>
import { useRouter } from 'vue-router';
import { useIdentityStore } from '../../application/identity.store.js';

const router = useRouter();
const identityStore = useIdentityStore();

/**
 * Cierra la sesión activa actual y redirige a la vista de login.
 */
const logoutCurrent = () => {
  identityStore.logout();
  router.push('/login');
};

/**
 * Simula el cierre de todas las sesiones activas en otros dispositivos.
 */
const logoutAllSessions = () => {
  identityStore.logout();
  router.push('/login');
};
</script>

<template>
  <div v-if="identityStore.isAuthenticated" class="session-manager">
    <!-- Información del usuario logueado -->
    <div class="user-profile">
      <div class="avatar">
        {{ identityStore.currentUser?.name?.charAt(0) || 'U' }}
      </div>
      <div class="user-info">
        <span class="user-name">{{ identityStore.currentUser?.fullName || 'Usuario' }}</span>
        <span class="user-role">{{ identityStore.currentUser?.role || 'Invitado' }}</span>
      </div>
    </div>

    <!-- Menú de opciones de sesión -->
    <div class="session-actions">
      <button
          type="button"
          class="logout-btn"
          @click="logoutCurrent"
          title="Cerrar sesión actual"
      >
        <span>🚪</span> Cerrar sesión
      </button>

      <button
          type="button"
          class="logout-all-btn"
          @click="logoutAllSessions"
          title="Cerrar todas las sesiones activas"
      >
        <span>🔒</span> Salir de todo
      </button>
    </div>
  </div>
</template>

<style scoped>
.session-manager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  gap: 1.5rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #ff7a29, #ff5500);
  color: #ffffff;
  font-weight: 800;
  font-size: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.user-role {
  font-size: 0.725rem;
  color: #64748b;
  font-weight: 500;
}

.session-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-btn, .logout-all-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.775rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.logout-all-btn:hover {
  background-color: #fff7ed;
  border-color: #ffedd5;
  color: #ea580c;
}
</style>