// Lazy-loaded views of the Profile bounded context
const profileView = () => import('./views/profile.view.vue');
const editProfileView = () => import('./views/edit-profile.view.vue');

/**
 * Child routes of /profile
 *  /profile       -> My profile
 *  /profile/edit  -> Edit profile
 * The session check is done by the global guard of the router.
 */
const profileRoutes = [
    {path: '',     name: 'profile',      component: profileView,     meta: {title: 'My Profile'}},
    {path: 'edit', name: 'profile-edit', component: editProfileView, meta: {title: 'Edit Profile'}}
];

export default profileRoutes;
