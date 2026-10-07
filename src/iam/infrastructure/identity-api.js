import http from '@/shared/infrastructure/http-common.js';
import { UserAssembler } from './user.assembler.js';

export class IdentityApi {
    async login(credentials) {
        const response = await http.get('/users');
        const users = response.data || [];

        // Validar correo Y contraseña
        const userMatch = users.find(
            (u) =>
                u.email.toLowerCase() === credentials.email.toLowerCase() &&
                u.password === credentials.password
        );

        if (userMatch) {
            const userEntity = UserAssembler.toEntityFromResource(userMatch);
            return {
                user: userEntity,
                session: { token: `bearer-token-${userEntity.id}` }
            };
        } else {
            throw new Error('Correo electrónico o contraseña incorrectos');
        }
    }

    async register(userData) {
        const response = await http.get('/users');
        const users = response.data || [];

        const exists = users.some(
            (u) => u.email.toLowerCase() === userData.correo_electronico.toLowerCase()
        );

        if (exists) {
            throw new Error('El correo electrónico ya se encuentra registrado');
        }

        // Crear el nuevo usuario INCLUYENDO la contraseña
        const newUser = {
            firstName: userData.nombre,
            lastName: userData.apellidos,
            email: userData.correo_electronico.toLowerCase(),
            password: userData.password,
            phone: userData.telefono || '',
            role: 'Administrador',
            status: 'Active',
            photoUrl: ''
        };

        const created = await http.post('/users', newUser);
        return created.data;
    }
}

export const identityApi = new IdentityApi();
