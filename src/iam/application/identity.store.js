import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { identityApi } from '../infrastructure/identity-api.js';

export const useIdentityStore = defineStore('identity', () => {
    // --- ESTADO (State) ---
    const currentUser = ref(JSON.parse(sessionStorage.getItem('currentUser')) || null);
    const token = ref(sessionStorage.getItem('token') || '');
    const errors = ref([]);

    // --- GETTERS (Computed) ---
    const isAuthenticated = computed(() => !!token.value);

    // --- ACCIONES (Actions) ---

    async function login(credentials) {
        errors.value = [];
        try {
            const { user, session } = await identityApi.login(credentials);

            currentUser.value = user;
            token.value = session.token;

            sessionStorage.setItem('token', session.token);
            sessionStorage.setItem('currentUser', JSON.stringify(user));

            return true;
        } catch (error) {
            errors.value.push(error.response?.data?.message || error.message || 'Error al iniciar sesión');
            return false;
        }
    }

    async function register(userData) {
        errors.value = [];
        try {
            await identityApi.register(userData);
            return true;
        } catch (error) {
            errors.value.push(error.response?.data?.message || error.message || 'Error al registrar el usuario');
            return false;
        }
    }

    // Actualiza los datos del usuario en sesión (por ejemplo, después de editar el perfil)
    function updateCurrentUser(changes) {
        currentUser.value = { ...currentUser.value, ...changes };
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser.value));
    }

    function logout() {
        currentUser.value = null;
        token.value = '';
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('currentUser');
    }

    return {
        currentUser,
        token,
        errors,
        isAuthenticated,
        login,
        logout,
        register,
        updateCurrentUser
    };
});