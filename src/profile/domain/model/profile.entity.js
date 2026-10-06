/**
 * profile entity of the profile bounded context.
 * represents the personal data that the user sees and edits in "my profile".
 */
export class Profile {
    /**
     * @param {object} params - profile attributes.
     * @param {?number|string} [params.id=null] - profile identifier (same as the user id).
     * @param {string} [params.firstName=''] - first name.
     * @param {string} [params.lastName=''] - last name.
     * @param {string} [params.email=''] - email address.
     * @param {string} [params.role=''] - role inside the store (e.g. admin).
     * @param {string} [params.status=''] - account status (e.g. active).
     * @param {string} [params.photoUrl=''] - profile picture url.
     */
    constructor({id = null, firstName = '', lastName = '', email = '', role = '', status = '', photoUrl = ''}) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.photoUrl = photoUrl;
    }

    /** @returns {string} full name, for example "eduardo salazar". */
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    /** @returns {string} initials, for example "es". */
    get initials() {
        return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
    }
}