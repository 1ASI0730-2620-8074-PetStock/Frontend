import {Profile} from "../domain/model/profile.entity.js";

/**
 * maps api resources into profile entities and vice versa.
 */
export class ProfileAssembler {
    /**
     * @param {object} resource - user resource that comes from the api.
     * @returns {profile} profile entity.
     */
    static toEntityFromResource(resource) {
        return new Profile({...resource});
    }

    /**
     * @param {profile} profile - profile entity edited in the form.
     * @returns {object} resource with the fields that the api will update.
     */
    static toResourceFromEntity(profile) {
        return {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email
        };
    }
}