import { createRouter, createWebHistory } from 'vue-router'
import ProductCatalogView from '@/catalog/presentation/views/product-catalog.view.vue'
import StockDashboardView from '@/inventory/presentation/views/stock-dashboard.view.vue'

const routes = [
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