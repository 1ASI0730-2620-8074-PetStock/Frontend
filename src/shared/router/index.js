import { createRouter, createWebHistory } from 'vue-router'
import profileRoutes from "../../profile/presentation/profile-routes.js";

const routes = [
    { path: '/profile', children: profileRoutes },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router