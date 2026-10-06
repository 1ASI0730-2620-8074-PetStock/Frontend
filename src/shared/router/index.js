import { createRouter, createWebHistory } from 'vue-router'
<<<<<<< HEAD
import profileRoutes from "../../profile/presentation/profile-routes.js";

const routes = [
    { path: '/profile', children: profileRoutes },
=======
import LoginView from '@/iam/presentation/views/login.view.vue'
const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView
    }
>>>>>>> origin/develop
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router