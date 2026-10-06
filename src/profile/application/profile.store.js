import {defineStore} from "pinia";
import {ref} from "vue";
import {ProfileApi} from "../infrastructure/profile-api.js";
import {ProfileAssembler} from "../infrastructure/profile.assembler.js";

const profileApi = new ProfileApi();

/**
 * application service store for the profile bounded context.
 * it coordinates the "view profile" and "edit profile" use cases.
 */
const useProfileStore = defineStore('profile', () => {
    /** @type {import('vue').ref<import('../domain/model/profile.entity.js').profile|null>} current profile. */
    const profile = ref(null);
    /** @type {import('vue').ref<error[]>} errors returned by the api. */
    const errors = ref([]);

    /**
     * loads the profile of the user from the api.
     * @param {number|string} userid - user identifier.
     */
    function fetchProfile(userId) {
        profileApi.getProfile(userId)
            .then(response => {
                profile.value = ProfileAssembler.toEntityFromResource(response.data);
            })
            .catch(error => {
                errors.value.push(error);
            });
    }

    /**
     * saves the changes of the profile.
     * @param {import('../domain/model/profile.entity.js').profile} updatedprofile - profile with the new data.
     * @param {string} newpassword - new password, or empty text to keep the current one.
     * @returns {promise<boolean>} true if the profile was saved.
     */
    function updateProfile(updatedProfile, newPassword) {
        const resource = ProfileAssembler.toResourceFromEntity(updatedProfile);
        if (newPassword) resource.password = newPassword;

        return profileApi.updateProfile(updatedProfile.id, resource)
            .then(response => {
                profile.value = ProfileAssembler.toEntityFromResource(response.data);
                return true;
            })
            .catch(error => {
                errors.value.push(error);
                return false;
            });
    }

    return {profile, errors, fetchProfile, updateProfile};
});

export default useProfileStore;