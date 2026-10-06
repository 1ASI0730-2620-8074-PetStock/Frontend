export class Inventory {
    constructor({ id_inventario, id_producto, stock_actual, umbral_minimo, ultima_actualizacion }) {
        this.id = id_inventario
        this.idProducto = id_producto
        this.stockActual = stock_actual
        this.umbralMinimo = umbral_minimo
        this.ultimaActualizacion = ultima_actualizacion
    }
}