// lazy-loaded views of the profile bounded context
const profileView = () => import('./views/profile.view.vue');
const editProfileView = () => import('./views/edit-profile.view.vue');

/**
 * child routes of /profile
 *  /profile       -> my profile
 *  /profile/edit  -> edit profile
 */
const profileRoutes = [
    {path: '',     name: 'profile',      component: profileView,     meta: {title: 'My Profile'}},
    {path: 'edit', name: 'profile-edit', component: editProfileView, meta: {title: 'Edit Profile'}}
];

export default profileRoutes;