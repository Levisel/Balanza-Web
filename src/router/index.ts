import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import NuevoCaso from '@/views/NuevoCaso.vue'
import AsignacionCaso from '@/views/AsignacionCaso.vue'
import MisCasos from '@/views/MisCasos.vue'
import NotificacionesCaso from '@/views/NotificacionesCaso.vue'
import ReportesCaso from '@/views/ReportesCaso.vue'
import Configuracion from '@/views/Configuracion.vue'

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
    {
      path: '/AsignarCaso',
      name: 'AsignacionCaso',
      component: AsignacionCaso,
    },
    {
      path: '/MisCasos',
      name: 'SeguimientoCaso',
      component: MisCasos,
    },
    {
      path: '/Notificaciones',
      name: 'NotificacionesCaso',
      component: NotificacionesCaso,
    },
    {
      path: '/ReportesCaso',
      name: 'ReportesCaso',
      component: ReportesCaso,
    },
    {
      path: '/Configuracion',
      name: 'Configuracion',
      component: Configuracion,
    },
  ],
})

export default router
