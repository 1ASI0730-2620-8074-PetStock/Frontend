import http from '@/shared/infrastructure/http-common.js';
import { UserAssembler } from './user.assembler.js';
import { SessionAssembler } from './session.assembler.js';

// The API returns its error messages as plain text (already translated)
function getApiMessage(error, defaultMessage) {
    const data = error.response?.data;
    return typeof data === 'string' && data ? data : defaultMessage;
}

export class IdentityApi {
    async login(credentials) {
        try {
            // 1. The API checks the credentials and opens a session
            const sessionResponse = await http.post('/sessions', {
                email: credentials.email.trim().toLowerCase(),
                password: credentials.password
            });
            const session = SessionAssembler.toEntityFromResource(sessionResponse.data);

            // 2. The data of the signed in user
            const userResponse = await http.get(`/users/${session.userId}`);
            const user = UserAssembler.toEntityFromResource(userResponse.data);

            return { user, session };
        } catch (error) {
            throw new Error(getApiMessage(error, 'Correo electrónico o contraseña incorrectos'));
        }
    }

    async register(userData) {
        const newUser = {
            firstName: userData.nombre,
            lastName: userData.apellidos,
            email: userData.correo_electronico.trim().toLowerCase(),
            password: userData.password,
            phone: userData.telefono || '',
            role: 'Administrador'
        };

        try {
            const response = await http.post('/users', newUser);
            return response.data;
        } catch (error) {
            throw new Error(getApiMessage(error, 'No se pudo registrar la cuenta. Revisa los datos ingresados.'));
        }
    }
}

export const identityApi = new IdentityApi();

