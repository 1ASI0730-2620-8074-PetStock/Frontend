import { User } from '../domain/model/user.entity.js';

export class UserAssembler {
    static toEntityFromResource(resource) {
        return new User(
            resource.id_usuario,
            resource.correo_electronico,
            resource.passwordHash || '', // Si json-server no tiene password Hash, asigna string vacío o dummy
            resource.rol,
            'active'
        );
    }
}