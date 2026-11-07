export class SaleAssembler {
    toEntity(resource) {
        const items = Array.isArray(resource.items)
            ? resource.items
            : resource.productId
                ? [{
                    productId: resource.productId,
                    productName: resource.productName,
                    quantity: resource.quantity,
                    unitPrice: resource.unitPrice ?? resource.price
                }]
                : [];

        return {
            ...resource,
            customerId: resource.customerId == null ? null : String(resource.customerId),
            customerName: resource.customerName || null,
            paymentMethod: resource.paymentMethod || resource.payment || 'cash',
            items: items.map(item => ({
                ...item,
                productId: String(item.productId),
                quantity: Number(item.quantity || 0),
                unitPrice: Number(item.unitPrice ?? item.price ?? 0)
            }))
        };
    }

    toResource(entity) {
        return {
            ...entity,
            customerId: entity.customerId == null ? null : String(entity.customerId),
            items: (entity.items || []).map(item => ({
                ...item,
                productId: String(item.productId),
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice)
            }))
        };
    }
}

export default new SaleAssembler();