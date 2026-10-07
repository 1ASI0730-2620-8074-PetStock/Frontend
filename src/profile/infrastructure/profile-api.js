import http from "../../shared/infrastructure/http-common.js";
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
     * updates only the fields sent (patch), so the other user fields are kept.
     * @param {number|string} userId - user identifier.
     * @param {object} resource - fields to update.
     * @returns {promise<import('axios').axiosresponse>} response with the updated user resource.
     */
    updateProfile(userId, resource) {
        return http.patch(`/users/${userId}`, resource);
    }
}