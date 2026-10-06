import http from '@/shared/infrastructure/http-common.js';
import { UserAssembler } from './user.assembler.js';
import { SessionAssembler } from './session.assembler.js';

export class IdentityApi {
    async login(credentials) {
        const response = await http.get('/iam');
        const usuarios = response.data.usuarios || [];

        // Validar correo Y contraseña
        const userMatch = usuarios.find(
            (u) =>
                u.correo_electronico.toLowerCase() === credentials.email.toLowerCase() &&
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
        const response = await http.get('/iam');
        const iamData = response.data || {};
        const usuarios = iamData.usuarios || [];

        const exists = usuarios.some(
            (u) => u.correo_electronico.toLowerCase() === userData.correo_electronico.toLowerCase()
        );

        if (exists) {
            throw new Error('El correo electrónico ya se encuentra registrado');
        }

        // Crear el nuevo usuario INCLUYENDO la contraseña
        const newUser = {
            id_usuario: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id_usuario)) + 1 : 1,
            nombre: userData.nombre,
            apellidos: userData.apellidos,
            correo_electronico: userData.correo_electronico,
            telefono: userData.telefono || '',
            rol: 'Cliente',
            password: userData.password // <-- Guardar contraseña enviada en el formulario
        };

        const updatedUsuarios = [...usuarios, newUser];

        await http.patch('/iam', {
            usuarios: updatedUsuarios
        });

        return newUser;
    }
}

export const identityApi = new IdentityApi();