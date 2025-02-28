import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Asegúrate de tener este store implementado
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

// Router guard: Todas las rutas que no comiencen con "/login" son protegidas.
router.beforeEach(async (to, from, next) => {
  // Si la ruta es pública (empieza con "/login"), permitimos el acceso.
  if (to.path.startsWith('/login')) {
    return next();
  }

  // Para las rutas protegidas, verificamos la sesión
  const authStore = useAuthStore();

  // Verificar o refrescar la sesión. Este método debería hacer una llamada al endpoint
  // /api/me o similar para confirmar que el usuario sigue autenticado.
  await authStore.verifySession();

  // Si no está autenticado, redirigimos al login.
  if (!authStore.isAuthenticated) {
    return next({ name: 'Login' });
  }

  // Si está autenticado, se permite la navegación.
  next();
});

export default router;
