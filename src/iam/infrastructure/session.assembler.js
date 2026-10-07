import { Session } from '../domain/model/session.entity.js';

export class SessionAssembler {
    static toEntityFromResource(resource) {
        return new Session(
            resource.id_sesion,
            resource.id_usuario,
            resource.token,
            new Date().toISOString(),
            resource.expira_en
        );
    }
}