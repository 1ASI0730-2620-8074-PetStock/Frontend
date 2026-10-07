import { createRouter, createWebHistory } from 'vue-router'
import ProductCatalogView from '@/catalog/presentation/views/product-catalog.view.vue'
import StockDashboardView from '@/inventory/presentation/views/stock-dashboard.view.vue'
import LoginView from '@/iam/presentation/views/login.view.vue'
import RegisterView from '@/iam/presentation/views/register.view.vue';
import DashboardView from '@/shared/presentation/views/dashboard.view.vue';
import profileRoutes from "../../profile/presentation/profile-routes.js";
import AnalyticsDashboardView from '@/analytics/presentation/views/analytics-dashboard.view.vue';
import PosSaleView from '@/sales/presentation/views/pos-sale.view.vue';

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
        path: '/register',
        name: 'register',
        component: RegisterView
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
    },
    {
        path: '/sales',
        name: 'sales',
        component: PosSaleView,
        meta: { requiresAuth: true }
    },
    {
        path: '/analytics',
        name: 'analytics',
        component: AnalyticsDashboardView
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: { requiresAuth: true }
    },
    { path: '/profile', children: profileRoutes }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router