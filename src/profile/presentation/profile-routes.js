import {useIdentityStore} from "../../iam/application/identity.store.js";

// lazy-loaded views of the profile bounded context
const profileView = () => import('./views/profile.view.vue');
const editProfileView = () => import('./views/edit-profile.view.vue');

/**
 * route guard: only users with an active session can open the profile.
 * if there is no session, the user is sent to the login view.
 */
function requireAuth() {
    const identityStore = useIdentityStore();
    if (identityStore.isAuthenticated) return true;
    return {name: 'login'};
}

/**
 * child routes of /profile
 *  /profile       -> my profile
 *  /profile/edit  -> edit profile
 */
const profileRoutes = [
    {path: '',     name: 'profile',      component: profileView,     beforeEnter: requireAuth, meta: {title: 'My Profile'}},
    {path: 'edit', name: 'profile-edit', component: editProfileView, beforeEnter: requireAuth, meta: {title: 'Edit Profile'}}
];

export default profileRoutes;