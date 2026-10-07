export class Inventory {
    constructor({ id, productId, currentStock, minimumStock, lastUpdated }) {
        this.id = id
        this.idProducto = productId
        this.stockActual = currentStock
        this.umbralMinimo = minimumStock
        this.ultimaActualizacion = lastUpdated
    }
}