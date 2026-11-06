export class Purchase {
    constructor({
        id,
        supplierId,
        supplierName,
        productId,
        productName,
        quantity,
        unitCost,
        total,
        date
    }) {
        this.id = id
        this.supplierId = supplierId
        this.supplierName = supplierName
        this.productId = productId
        this.productName = productName
        this.quantity = Number(quantity)
        this.unitCost = Number(unitCost)
        this.total = Number(total)
        this.date = date
    }
}
