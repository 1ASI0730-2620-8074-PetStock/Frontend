import { Session } from '../domain/model/session.entity.js';

export class SessionAssembler {
    static toEntityFromResource(resource) {
        return new Session(
            resource.id,
            resource.userId,
            resource.token,
            resource.expiresAt
        );
    }
}
