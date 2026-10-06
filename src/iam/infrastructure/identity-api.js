import http from '@/shared/infrastructure/http-common.js';
import { UserAssembler } from './user.assembler.js';
import { SessionAssembler } from './session.assembler.js';

export class IdentityApi {
    async login(credentials) {
        // Si json-server sirve el objeto completo en GET /iam
        const response = await http.get('/iam');
        const usuarios = response.data.usuarios || [];
        const sesiones = response.data.sesiones || [];

        // Buscar coincidencia por correo electrónico
        const userMatch = usuarios.find(
            (u) => u.correo_electronico.toLowerCase() === credentials.email.toLowerCase()
        );

        if (userMatch) {
            const userEntity = UserAssembler.toEntityFromResource(userMatch);

            // Buscar la sesión asociada en la Fake API o generar una activa
            const sessionMatch = sesiones.find((s) => s.id_usuario === userMatch.id_usuario);
            const sessionEntity = sessionMatch
                ? SessionAssembler.toEntityFromResource(sessionMatch)
                : { token: `bearer-token-${userEntity.id}` };

            return { user: userEntity, session: sessionEntity };
        } else {
            throw new Error('Credenciales inválidas o usuario no registrado');
        }
    }
}

export const identityApi = new IdentityApi();