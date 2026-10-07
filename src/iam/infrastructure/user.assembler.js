import { User } from '../domain/model/user.entity.js';

export class UserAssembler {
    static toEntityFromResource(resource) {
        return new User(
            resource.id,
            resource.firstName,
            resource.lastName,
            resource.email,
            resource.phone,
            resource.role
        );
    }
}
