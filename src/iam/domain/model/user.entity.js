export class User {
    /**
     * @param {number} id
     * @param {string} name
     * @param {string} lastName
     * @param {string} email
     * @param {string} phone
     * @param {string} role
     */
    constructor(id = 0, name = '', lastName = '', email = '', phone = '', role = '') {
        this.id = id;
        this.name = name;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.role = role;
    }

    /**
     * Obtiene el nombre completo del usuario.
     * @returns {string}
     */
    get fullName() {
        return `${this.name} ${this.lastName}`.trim();
    }

    /**
     * Verifica si el usuario tiene rol de Administrador.
     * @returns {boolean}
     */
    isAdmin() {
        return this.role.toLowerCase() === 'admin';
    }
}