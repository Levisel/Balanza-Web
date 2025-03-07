import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "@/stores/auth"; // Asegúrate de tener este store implementado

//Layouts
import DefaultLayout from "@/components/layouts/DefaultLayout.vue";
import AuthLayout from "@/components/layouts/AuthLayout.vue";

//Auth views
import Login from "@/views/Auth/Login.vue";
import ForgotPassword from "@/views/Auth/ForgotPassword.vue";

//Sidebar views
//Home
import HomeView from "@/views/SideBar/HomeView.vue";

//-- Admin
import NewUser from "@/views/SideBar/Admin/NewUser.vue";
import CaseAssign from "@/views/SideBar/Admin/CaseAssign.vue";
import Configuration from "@/views/SideBar/Admin/Configuration.vue";

//-- Admin -> (Social Work)
import SocialWorkCases from "@/views/SideBar/Admin/SocialWork/SocialWorkCases.vue";
import SocialWorkDashboard from "@/views/SideBar/Admin/SocialWork/SocialWorkDashboard.vue";
import SocialWorkSchedule from "@/views/SideBar/Admin/SocialWork/SocialWorkSchedule.vue";
import SocialWorkNewCase from "@/views/SideBar/Admin/SocialWork/SocialWorkNewCase.vue";

//Cases
import NewCase from "@/views/SideBar/Cases/NewCase.vue";
import MyCases from "@/views/SideBar/Cases/MyCases.vue";
import CaseNotifications from "@/views/SideBar/Cases/CaseNotifications.vue";

//Reports
import FeasibilityReport from "@/views/SideBar/Reports/FeasibilityReport.vue";
import FileReport from "@/views/SideBar/Reports/FileReport.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      // Home
      {
        path: "",
        name: "home",
        component: HomeView,
      },
      // Cases views
      {
        path: "NuevoCaso",
        name: "NewCase",
        component: NewCase,
      },
      {
        path: "MisCasos",
        name: "MyCases",
        component: MyCases,
      },
      {
        path: "Notificaciones",
        name: "CaseNotifications",
        component: CaseNotifications,
      },
      // Reports views
      {
        path: "InformeDeViabilidad",
        name: "FeasibilityReport",
        component: FeasibilityReport,
      },
      {
        path: "ReporteDeDocumentos",
        name: "FileReport",
        component: FileReport,
      },
      // Admin views
      {
        path: "NuevoUsuario",
        name: "NewUser",
        component: NewUser,
      },
      {
        path: "AsignacionDeCasos",
        name: "CaseAssign",
        component: CaseAssign,
      },
      {
        path: "Configuracion",
        name: "Configuration",
        component: Configuration,
      },
      // Admin -> Social Work views
      {
        path: "TrabajoSocialDashboard",
        name: "SocialWorkDashboard",
        component: SocialWorkDashboard,
      },
      {
        path: "TrabajoSocialHorario",
        name: "SocialWorkSchedule",
        component: SocialWorkSchedule,
      },
      {
        path: "NuevoCasoTrabajoSocial",
        name: "SocialWorkNewCase",
        component: SocialWorkNewCase,
      },
      {
        path: "TrabajoSocialCasos",
        name: "SocialWorkCases",
        component: SocialWorkCases,
      },
    ],
  },
  // Auth views
  {
    path: "/login",
    component: AuthLayout,
    children: [
      {
        path: "",
        name: "Login",
        component: Login,
      },
      {
        path: "forgot-password",
        name: "ForgotPassword",
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
  if (to.path.startsWith("/login")) {
    return next();
  }

  // Para las rutas protegidas, verificamos la sesión
  const authStore = useAuthStore();

  // Verificar o refrescar la sesión. Este método debería hacer una llamada al endpoint
  // /api/me o similar para confirmar que el usuario sigue autenticado.
  await authStore.verifySession();

  // Si no está autenticado, redirigimos al login.
  if (!authStore.isAuthenticated) {
    return next({ name: "Login" });
  }

  // Si está autenticado, se permite la navegación.
  next();
});

export default router;
