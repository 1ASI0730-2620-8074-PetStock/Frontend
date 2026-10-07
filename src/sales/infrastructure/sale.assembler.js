import { Sale } from '../domain/model/sale.entity.js';

export class SaleAssembler {
    toEntity(resource) {
        return new Sale(
            resource.id,
            resource.productId,
            resource.productName,
            resource.quantity,
            resource.customerId,
            resource.customerName,
            resource.date,
            resource.total,
            resource.userId
        );
    }

    toResource(entity) {
        return {
            id: entity.id,
            productId: entity.productId,
            productName: entity.productName,
            quantity: entity.quantity,
            customerId: entity.customerId,
            customerName: entity.customerName,
            date: entity.date,
            total: entity.total,
            userId: entity.userId
        };
    }
}

export default new SaleAssembler();