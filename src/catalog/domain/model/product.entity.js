export class Product {
    constructor({ id, name, description, price, categoryId, supplierId, active }) {
        this.id = id
        this.nombre = name
        this.descripcion = description
        this.precioBase = price
        this.idCategoria = categoryId
        this.idProveedor = supplierId
        this.activo = active
    }
}