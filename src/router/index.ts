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
import CaseAssign from "@/views/SideBar/Admin/CaseAssign.vue";
import CaseReview from "@/views/SideBar/Admin/CaseReview.vue";
import Configuration from "@/views/SideBar/Admin/Configuration.vue";

//-- Admin -> (Users)
import UserView from "@/views/SideBar/Admin/Users/UserView.vue";
import NewUser from "@/views/SideBar/Admin/Users/NewUser.vue";

//-- Admin -> (Social Work)
import SocialWorkCases from "@/views/SideBar/Admin/SocialWork/SocialWorkCases.vue";
import SocialWorkDashboard from "@/views/SideBar/Admin/SocialWork/SocialWorkDashboard.vue";
import SocialWorkSchedule from "@/views/SideBar/Admin/SocialWork/SocialWorkSchedule.vue";
import SocialWorkNewCase from "@/views/SideBar/Admin/SocialWork/SocialWorkNewCase.vue";

//Cases
import NewCase from "@/views/SideBar/Cases/NewCase.vue";
import MyCases from "@/views/SideBar/Cases/MyCases.vue";
import CaseNotifications from "@/views/SideBar/Cases/CaseNotifications.vue";

//Cases -> Reports
import FeasibilityReport from "@/views/SideBar/Cases/Reports/FeasibilityReport.vue";
import FileReport from "@/views/SideBar/Cases/Reports/FileReport.vue";

//----------------------------------------------------------------------------------------------------------------//
//ENTRANCE CONTROL
//Cronogram 
import Cronograma from '@/views/SideBar/EntranceControl/Cronograma/Cronograma.vue';
import IngresoCronograma from '@/views/SideBar/EntranceControl/Cronograma/IngresoCronograma.vue';

//Students
import AsignacionPeriodo from '@/views/SideBar/EntranceControl/Estudiantes/AsignacionPeriodo.vue';
import IngresoEstudiantesExcel from '@/views/SideBar/EntranceControl/Estudiantes/IngresoEstudiantesExcel.vue';
import IngresoManualEstudiantes from "@/views/SideBar/EntranceControl/Estudiantes/IngresoManualEstudiantes.vue";
import RemoverPeriodo from '@/views/SideBar/EntranceControl/Estudiantes/RemoverPeriodo.vue';
import ListadoEstudiantes from '@/views/SideBar/EntranceControl/Estudiantes/ListadoEstudiantes.vue';

//Schedule
import IngresoArea from '@/views/SideBar/EntranceControl/Horario/IngresoArea.vue';
import IngresoHorario from '@/views/SideBar/EntranceControl/Horario/IngresoHorario.vue';
import IngresoHorarioVirtual from '@/views/SideBar/EntranceControl/Horario/IngresoHorarioVirtual.vue';
import VistaHorarios from '@/views/SideBar/EntranceControl/Horario/VistaHorarios.vue';

// FingerPrint
import AsignacionHuella from '@/views/SideBar/EntranceControl/RegistroBiometrico/AsignacionHuella.vue';
import RegistroHuella from '@/views/SideBar/EntranceControl/RegistroBiometrico/RegistroHuella.vue';
import RegistroAsistencia from '@/views/SideBar/EntranceControl/RegistroBiometrico/RegistroAsistencia.vue';

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
      // Cases -> Reports views
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
        path: "RevisionDeCasos",
        name: "CaseReview",
        component: CaseReview,
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
      // Admin -> Users views
      {
        path: "Usuarios/:id?",
        name: "UserView",
        component: UserView,
      },
      {
        path: "NuevoUsuario",
        name: "NewUser",
        component: NewUser,
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
      // Entrance Control
      // Cronogram
      {
        path: "Cronograma",
        name: "Cronograma",
        component: Cronograma,
      },
      {
        path: 'IngresoCronograma',
        name: 'IngresoCronograma',
        component: IngresoCronograma,
      },
      {
        path: 'IngresoCronograma/:id?',
        name: 'IngresoCronograma',
        component: IngresoCronograma,
      },
      //Students
      {
        path: 'AsignacionPeriodo',
        name: 'AsignacionPeriodo',
        component: AsignacionPeriodo,
      },
      {
        path: 'IngresoEstudiantesExcel',
        name: 'IngresoEstudiantesExcel',
        component: IngresoEstudiantesExcel,
      },
      {
        path: 'IngresoManualEstudiantes',
        name: 'IngresoManualEstudiantes',
        component: IngresoManualEstudiantes,
      },
      {
        path: 'ListadoEstudiantes',
        name: 'ListadoEstudiantes',
        component: ListadoEstudiantes,
      },
      {
        path: 'RemoverPeriodo',
        name: 'RemoverPeriodo',
        component: RemoverPeriodo,
      },
      //Schedule
      {
        path: 'IngresoArea',
        name: 'IngresoArea',
        component: IngresoArea,
      },
      {
        path: 'IngresoHorario',
        name: 'IngresoHorario',
        component: IngresoHorario,
      },
      {
        path: 'IngresoHorarioVirtual',
        name: 'IngresoHorarioVirtual',
        component: IngresoHorarioVirtual,
      },
      {
        path: 'VistaHorarios',
        name: 'VistaHorarios',
        component: VistaHorarios,
      },
      //FingerPrint
      {
        path: 'AsignacionHuella',
        name: 'AsignacionHuella',
        component: AsignacionHuella,
      },
      {
        path: 'RegistroHuella/:id?',
        name: 'RegistroHuella',
        component: RegistroHuella,
      },
      //Attendance
      {
        path: 'RegistroAsistencia/:id/periodo/:periodo',
        name: 'RegistroAsistencia',
        component: RegistroAsistencia,
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
