import { createRouter, createWebHistory } from 'vue-router'
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
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router