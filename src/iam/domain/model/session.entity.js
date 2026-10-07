export class Session {
    /**
     * @param {number} id
     * @param {number} userId
     * @param {string} token
     * @param {string} expiresAt
     */
    constructor(id = 0, userId = 0, token = '', expiresAt = '') {
        this.id = id;
        this.userId = userId;
        this.token = token;
        this.expiresAt = expiresAt;
    }

    /**
     * Verifica si la sesión sigue siendo válida según la fecha actual.
     * @returns {boolean}
     */
    isValid() {
        if (!this.expiresAt) return false;
        const expirationDate = new Date(this.expiresAt);
        return expirationDate > new Date();
    }
}