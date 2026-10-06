export class Product {
    constructor({ id_producto, nombre, descripcion, precio_base, stock_actual, id_categoria, id_proveedor }) {
        this.id = id_producto
        this.nombre = nombre
        this.descripcion = descripcion
        this.precioBase = precio_base
        this.stockActual = stock_actual
        this.idCategoria = id_categoria
        this.idProveedor = id_proveedor
    }
}