import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { identityApi } from '../infrastructure/identity-api.js';

export const useIdentityStore = defineStore('identity', () => {
    // --- ESTADO (State) ---
    const currentUser = ref(JSON.parse(localStorage.getItem('currentUser')) || null);
    const token = ref(localStorage.getItem('token') || '');
    const errors = ref([]);

    // --- GETTERS (Computed) ---
    const isAuthenticated = computed(() => !!token.value);

    // --- ACCIONES (Actions) ---

    /**
     * Procesa el inicio de sesión.
     * @param {Object} credentials - { email, password }
     * @returns {Promise<boolean>}
     */
    async function login(credentials) {
        errors.value = [];
        try {
            const { user, session } = await identityApi.login(credentials);

            // Actualizar estado en Pinia
            currentUser.value = user;
            token.value = session.token;

            // Persistir sesión en el navegador
            localStorage.setItem('token', session.token);
            localStorage.setItem('currentUser', JSON.stringify(user));

            return true;
        } catch (error) {
            errors.value.push(error.message || 'Error al iniciar sesión');
            return false;
        }
    }

    /**
     * Cierra la sesión activa y limpia la memoria.
     */
    function logout() {
        currentUser.value = null;
        token.value = '';
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
    }

    return {
        currentUser,
        token,
        errors,
        isAuthenticated,
        login,
        logout
    };
});