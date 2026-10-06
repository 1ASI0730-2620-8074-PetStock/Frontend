import { createRouter, createWebHistory } from 'vue-router'
import ProductCatalogView from '@/catalog/presentation/views/product-catalog.view.vue'
import StockDashboardView from '@/inventory/presentation/views/stock-dashboard.view.vue'
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
    },
    {
        path: '/catalog',
        name: 'catalog',
        component: ProductCatalogView
    },
    {
        path: '/inventory',
        name: 'inventory',
        component: StockDashboardView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router