import http from './http-common.js';

export class BaseEndpoint {
    constructor(resource) {
        this.resource = resource; // Ejemplo: 'products', 'categories', 'users'
    }

    getAll(params) {
        return http.get(`/${this.resource}`, { params });
    }

    getById(id) {
        return http.get(`/${this.resource}/${id}`);
    }

    create(data) {
        return http.post(`/${this.resource}`, data);
    }

    update(id, data) {
        return http.put(`/${this.resource}/${id}`, data);
    }

    delete(id) {
        return http.delete(`/${this.resource}/${id}`);
    }
}