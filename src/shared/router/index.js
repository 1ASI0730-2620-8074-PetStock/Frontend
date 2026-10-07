import { createRouter, createWebHistory } from 'vue-router'
import { useIdentityStore } from '@/iam/application/identity.store.js'
import Layout from '@/shared/presentation/components/layout.vue'
import LoginView from '@/iam/presentation/views/login.view.vue'
import RegisterView from '@/iam/presentation/views/register.view.vue'
import DashboardView from '@/shared/presentation/views/dashboard.view.vue'
import ProductCatalogView from '@/catalog/presentation/views/product-catalog.view.vue'
import StockDashboardView from '@/inventory/presentation/views/stock-dashboard.view.vue'
import PosSaleView from '@/sales/presentation/views/pos-sale.view.vue'
import AnalyticsDashboardView from '@/analytics/presentation/views/analytics-dashboard.view.vue'
import profileRoutes from '@/profile/presentation/profile-routes.js'

const routes = [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    {
        // Todas estas vistas se muestran dentro del layout con la barra lateral
        path: '/',
        component: Layout,
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: '/dashboard' },
            { path: 'dashboard', name: 'dashboard', component: DashboardView },
            { path: 'catalog', name: 'catalog', component: ProductCatalogView },
            { path: 'inventory', name: 'inventory', component: StockDashboardView },
            { path: 'sales', name: 'sales', component: PosSaleView },
            { path: 'analytics', name: 'analytics', component: AnalyticsDashboardView },
            { path: 'profile', children: profileRoutes }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Si la ruta necesita sesión y no hay usuario, se envía al login
router.beforeEach((to) => {
    const identityStore = useIdentityStore()
    const needsLogin = to.matched.some(record => record.meta.requiresAuth)
    if (needsLogin && !identityStore.isAuthenticated) return { name: 'login' }
    return true
})

export default router
