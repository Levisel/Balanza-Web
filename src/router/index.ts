import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NuevoCaso from '../views/NuevoCaso.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/NuevoCaso',
      name: 'NuevoCaso',
      component: NuevoCaso,
    },
      
  ],
})

export default router
