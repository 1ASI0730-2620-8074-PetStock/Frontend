export class StockAlert {
    constructor({ id, productId, level, active, createdAt }) {
        this.id = id
        this.idProducto = productId
        this.nivelAlerta = level
        this.estaActiva = active
        this.fechaCreacion = createdAt
    }
}