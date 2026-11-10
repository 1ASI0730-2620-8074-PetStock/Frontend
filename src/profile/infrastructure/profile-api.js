import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const usersEndpoint = new BaseEndpoint('users');

/**
 * infrastructure gateway for the profile bounded context.
 * the profile data is stored in the "users" resource of the api.
 */
export class ProfileApi {
    /**
     * gets the profile of a user.
     * @param {number|string} userId - user identifier.
     * @returns {promise<import('axios').axiosresponse>} response with the user resource.
     */
    getProfile(userId) {
        return usersEndpoint.getById(userId);
    }

    /**
     * updates the user data of the profile (put /users/{id}).
     * @param {number|string} userId - user identifier.
     * @param {object} resource - first name, last name, email and phone.
     * @returns {promise<import('axios').axiosresponse>} response with the updated user resource.
     */
    updateProfile(userId, resource) {
        return usersEndpoint.update(userId, resource);
    }
}
