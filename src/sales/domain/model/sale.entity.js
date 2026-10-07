export class Sale {
    constructor(id, productId, productName, quantity, customerId, customerName, date, total, userId) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.customerId = customerId;
        this.customerName = customerName;
        this.date = date;
        this.total = total;
        this.userId = userId;
    }
}