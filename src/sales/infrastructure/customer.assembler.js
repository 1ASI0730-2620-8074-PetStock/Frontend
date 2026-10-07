import { Customer } from '../domain/model/customer.entity.js';

export class CustomerAssembler {
    toEntity(resource) {
        return new Customer(
            resource.id,
            resource.name,
            resource.phone,
            resource.email
        );
    }

    toResource(entity) {
        return {
            id: entity.id,
            name: entity.name,
            phone: entity.phone,
            email: entity.email
        };
    }
}

export default new CustomerAssembler();