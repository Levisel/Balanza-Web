import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import DefaultLayout from '@/components/DefaultLayout.vue';
import AuthLayout from '@/components/AuthLayout.vue';
import HomeView from '@/views/HomeView.vue';
import NuevoCaso from '@/views/NuevoCaso.vue';
import AsignacionCaso from '@/views/AsignacionCaso.vue';
import MisCasos from '@/views/MisCasos.vue';
import NotificacionesCaso from '@/views/NotificacionesCaso.vue';
import ReportesCaso from '@/views/ReportesCaso.vue';
import Configuracion from '@/views/Configuracion.vue';
import Login from '@/views/Login.vue';
import ForgotPassword from '@/views/ForgotPassword.vue';
import TrabajoSocialDashboard from '@/views/TrabajoSocialDashboard.vue';
import TrabajoSocialHorario from '@/views/TrabajoSocialHorario.vue';
import TrabajoSocialCasos from '@/views/TrabajoSocialCasos.vue';
import nuevoCasoTrabajoSocial from '@/views/nuevoCasoTrabajoSocial.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
      },
      {
        path: 'NuevoCaso',
        name: 'NuevoCaso',
        component: NuevoCaso,
      },
      {
        path: 'AsignarCaso',
        name: 'AsignacionCaso',
        component: AsignacionCaso,
      },
      {
        path: 'MisCasos',
        name: 'SeguimientoCaso',
        component: MisCasos,
      },
      {
        path: 'Notificaciones',
        name: 'NotificacionesCaso',
        component: NotificacionesCaso,
      },
      {
        path: 'ReportesCaso',
        name: 'ReportesCaso',
        component: ReportesCaso,
      },
      {
        path: 'Configuracion',
        name: 'Configuracion',
        component: Configuracion,
      },
      {
        path: 'TrabajoSocialDashboard',
        name: 'TrabajoSocialDashboard',
        component: TrabajoSocialDashboard,
      },
      {
        path: 'TrabajoSocialHorario',
        name: 'TrabajoSocialHorario',
        component: TrabajoSocialHorario,
      },
      {
        path: 'TrabajoSocialCasos',
        name: 'TrabajoSocialCasos',
        component: TrabajoSocialCasos,
      },
      {
        path: 'nuevoCasoTrabajoSocial',
        name: 'nuevoCasoTrabajoSocial',
        component: nuevoCasoTrabajoSocial,
      },
    ],
  },
  {
    path: '/login',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: Login,
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: ForgotPassword,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
