export class StockAlert {
    constructor({ id_alerta, id_producto, nivel_alerta, estado_activacion, fecha_creacion }) {
        this.id = id_alerta
        this.idProducto = id_producto
        this.nivelAlerta = nivel_alerta
        this.estaActiva = estado_activacion
        this.fechaCreacion = fecha_creacion
    }
}