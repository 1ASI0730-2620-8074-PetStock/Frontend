import { createRouter, createWebHistory } from 'vue-router'
import ProductCatalogView from '@/catalog/presentation/views/product-catalog.view.vue'

const routes = [
    {
        path: '/catalog',
        name: 'catalog',
        component: ProductCatalogView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router