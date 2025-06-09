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

//-- Admin -> (Case Management)
import CaseAssign from "@/views/SideBar/Admin/CaseManagement/CaseAssign.vue";
import CaseReview from "@/views/SideBar/Admin/CaseManagement/CaseReview.vue";
import Configuration from "@/views/SideBar/Admin/Configuration.vue";
import AssignedCases from "@/views/SideBar/Admin/CaseManagement/AssignedCases.vue";
import AllCases from "@/views/SideBar/Admin/CaseManagement/AllCases.vue";

//-- Admin -> (Parameter Management)
import ParameterView from "@/views/SideBar/Admin/ParameterManagement/ParameterView.vue";

//-- Admin -> (Role Management)
import RoleView from "@/views/SideBar/Admin/RoleManagement/RoleView.vue";

//-- Admin -> (Users)
import UserView from "@/views/SideBar/Admin/Users/UserView.vue";
import NewUser from "@/views/SideBar/Admin/Users/NewUser.vue";

//-- Admin -> (Social Work)
import SocialWorkCases from "@/views/SideBar/Admin/SocialWork/SocialWorkCases.vue";
import SocialWorkSchedule from "@/views/SideBar/Admin/SocialWork/SocialWorkSchedule.vue";
import SocialWorkNewCase from "@/views/SideBar/Admin/SocialWork/SocialWorkNewCase.vue";

//Cases
import NewCase from "@/views/SideBar/Cases/NewCase.vue";
import MyCases from "@/views/SideBar/Cases/MyCases.vue";
import CaseNotifications from "@/views/SideBar/Cases/CaseNotifications.vue";
import CreateActivities from "@/views/SideBar/Cases/CreateActivities.vue";


//Cases -> Reports
import ExcelReport from "@/views/SideBar/Cases/Reports/ExcelReport.vue";

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
import RegistroPorCedula from "@/views/SideBar/EntranceControl/RegistroBiometrico/RegistroPorCedula.vue";
import SeguimientoGeneral from "@/views/SideBar/EntranceControl/ControlAsistencia/SeguimientoGeneral.vue";
import SeguimientoSemanal from "@/views/SideBar/EntranceControl/Cronograma/SeguimientoSemanal.vue";
import RegistroManual from "@/views/SideBar/EntranceControl/RegistroBiometrico/RegistroManual.vue";
import ModificacionHoras from "@/views/SideBar/EntranceControl/Horas_Extraordinarias/ModificacionHoras.vue";
import RegistrosAbiertos from "@/views/SideBar/EntranceControl/ControlAsistencia/RegistrosAbiertos.vue";
import RegistrosCerrados from "@/views/SideBar/EntranceControl/ControlAsistencia/RegistrosCerrados.vue";
import ResumenSemanal from "@/views/SideBar/EntranceControl/Seguimiento/ResumenSemanal.vue";
import RegistroVirtual from "@/views/SideBar/EntranceControl/RegistroBiometrico/RegistroVirtual.vue";
import VistaHorarioPersonal from "@/views/SideBar/EntranceControl/Horario/VistaHorarioPersonal.vue";
import AlertasView from "../views/SideBar/EntranceControl/Alertas/AlertasView.vue";

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
      // Admin -> Case Management views
      {
        path: "RevisionDeCasos",
        name: "CaseReview",
        component: CaseReview,
        meta: { requiresAuth: true, requiredPermission: "CaseReview" }
      },
      {
        path: "AsignacionDeCasos",
        name: "CaseAssign",
        component: CaseAssign,
        meta: { requiresAuth: true, requiredPermission: "CaseAssign" }
      },
      {
        path: "VerCasosAsignados",
        name: "AssignedCases",
        component: AssignedCases,
        meta: { requiresAuth: true, requiredPermission: "AssignedCases" }
      },
      {
        path: "VerCasos",
        name: "AllCases",
        component: AllCases,
        meta: { requiresAuth: true, requiredPermission: "AllCases" }
      },
      // Admin -> Parameter Management
      {
        path: "Parametros",
        name: "Parameter",
        component: ParameterView,
        meta: { requiresAuth: true, requiredPermission: "Parameter" }
      },
      //Admin -> Role Management
      {
        path: "Roles",
        name: "RoleView",
        component: RoleView,
        meta: { requiresAuth: true, requiredPermission: "RoleView" }
      },
      // Admin -> Users views
      {
        path: "Usuarios/:id?",
        name: "UserView",
        component: UserView,
        meta: { requiresAuth: true, requiredPermission: "UserView" }
      },
      {
        path: "NuevoUsuario",
        name: "NewUser",
        component: NewUser,
        meta: { requiresAuth: true, requiredPermission: "NewUser" }
      },
      // Admin -> Social Work views
      {
        path: "TrabajoSocialHorario",
        name: "SocialWorkSchedule",
        component: SocialWorkSchedule,
        meta: { requiresAuth: true, requiredPermission: "SocialWorkSchedule" }
      },
      {
        path: "NuevoCasoTrabajoSocial",
        name: "SocialWorkNewCase",
        component: SocialWorkNewCase,
        meta: { requiresAuth: true, requiredPermission: "SocialWorkNewCase" }
      },
      {
        path: "TrabajoSocialCasos",
        name: "SocialWorkCases",
        component: SocialWorkCases,
        meta: { requiresAuth: true, requiredPermission: "SocialWorkCases" }
      },
      {
        path: "Configuracion",
        name: "Configuration",
        component: Configuration,
      },
      // Cases views
      {
        path: "NuevoCaso",
        name: "NewCase",
        component: NewCase,
        meta: { requiresAuth: true, requiredPermission: "NewCase" }
      },
      {
        path: "MisCasos",
        name: "MyCases",
        component: MyCases,
        meta: { requiresAuth: true, requiredPermission: "MyCases" }
      },
      {
        path: "CrearActividades",
        name: "CreateActivities",
        component: CreateActivities,
        meta: { requiresAuth: true, requiredPermission: "CreateActivities" }
      },
      {
        path: "Notificaciones",
        name: "CaseNotifications",
        component: CaseNotifications,
        meta: { requiresAuth: true, requiredPermission: "CaseNotifications" }
      },
      // Cases -> Reports
      {
        path: "ReporteDeExcel",
        name: "ExcelReport",
        component: ExcelReport,
        meta: { requiresAuth: true, requiredPermission: "ExcelReport" }
      },
      // ENTRANCE CONTROL
      // Cronogram 
      {
        path: "Cronograma",
        name: "Cronograma",
        component: Cronograma,
        meta: { requiresAuth: true, requiredPermission: "Cronograma" }
      },
      {
        path: "IngresoCronograma",
        name: "IngresoCronograma",
        component: IngresoCronograma,
        meta: { requiresAuth: true, requiredPermission: "IngresoCronograma" }
      },
      {
        path: "PeriodoSemanal",
        name: "PeriodoSemanal",
        component: SeguimientoSemanal,
        meta: { requiresAuth: true, requiredPermission: "PeriodoSemanal" }
      },
      // Students
      {
        path: "AsignacionPeriodo",
        name: "AsignacionPeriodo",
        component: AsignacionPeriodo,
        meta: { requiresAuth: true, requiredPermission: "AsignacionPeriodo" }
      },
      {
        path: "IngresoEstudiantesExcel",
        name: "IngresoEstudiantesExcel",
        component: IngresoEstudiantesExcel,
        meta: { requiresAuth: true, requiredPermission: "IngresoEstudiantesExcel" }
      },
      {
        path: "IngresoManualEstudiantes",
        name: "IngresoManualEstudiantes",
        component: IngresoManualEstudiantes,
        meta: { requiresAuth: true, requiredPermission: "IngresoManualEstudiantes" }
      },
      {
        path: "ListadoEstudiantes",
        name: "ListadoEstudiantes",
        component: ListadoEstudiantes,
        meta: { requiresAuth: true, requiredPermission: "ListadoEstudiantes" }
      },
      {
        path: "RemoverPeriodo",
        name: "RemoverPeriodo",
        component: RemoverPeriodo,
        meta: { requiresAuth: true, requiredPermission: "RemoverPeriodo" }
      },
      // Schedule
      {
        path: "IngresoArea",
        name: "IngresoArea",
        component: IngresoArea,
        meta: { requiresAuth: true, requiredPermission: "IngresoArea" }
      },
      {
        path: "IngresoHorario",
        name: "IngresoHorario",
        component: IngresoHorario,
        meta: { requiresAuth: true, requiredPermission: "IngresoHorario" }
      },
      {
        path: "IngresoHorarioVirtual",
        name: "IngresoHorarioVirtual",
        component: IngresoHorarioVirtual,
        meta: { requiresAuth: true, requiredPermission: "IngresoHorarioVirtual" }
      },
      {
        path: "VistaHorarios",
        name: "VistaHorarios",
        component: VistaHorarios,
        meta: { requiresAuth: true, requiredPermission: "VistaHorarios" }
      },
      {
        path: "VistaHorariosPersonal",
        name: "VistaHorariosPersonal",
        component: VistaHorarioPersonal,
        meta: { requiresAuth: true, requiredPermission: "VistaHorariosPersonal" }
      },
      // FingerPrint
      {
        path: "AsignacionHuella",
        name: "AsignacionHuella",
        component: AsignacionHuella,
        meta: { requiresAuth: true, requiredPermission: "AsignacionHuella" }
      },
      {
        path: "RegistroHuella/:cedula?/:id?",
        name: "RegistroHuella",
        component: RegistroHuella,
        meta: { requiresAuth: true, requiredPermission: "RegistroHuella" }
      },
      {
        path: "RegistroPorCedula",
        name: "RegistroPorCedula",
        component: RegistroPorCedula,
        meta: { requiresAuth: true, requiredPermission: "RegistroPorCedula" }
      },
      {
        path: "RegistroManual",
        name: "RegistroManual",
        component: RegistroManual,
        meta: { requiresAuth: true, requiredPermission: "RegistroManual" }
      },
      {
        path: "RegistrosAbiertos",
        name: "RegistrosAbiertos",
        component: RegistrosAbiertos,
        meta: { requiresAuth: true, requiredPermission: "RegistrosAbiertos" }
      },
      {
        path: "RegistrosCerrados",
        name: "RegistrosCerrados",
        component: RegistrosCerrados,
        meta: { requiresAuth: true, requiredPermission: "RegistrosCerrados" }
      },
      {
        path: "ModificacionHoras",
        name: "ModificacionHoras",
        component: ModificacionHoras,
        meta: { requiresAuth: true, requiredPermission: "ModificacionHoras" }
      },
      {
        path: "SeguimientoGeneral",
        name: "SeguimientoGeneral",
        component: SeguimientoGeneral,
        meta: { requiresAuth: true, requiredPermission: "SeguimientoGeneral" }
      },
      {
        path: 'SeguimientoSemanal',
        name: 'SeguimientoSemanal',
        component: SeguimientoSemanal,
        meta: { requiresAuth: true, requiredPermission: "SeguimientoSemanal" }
      },
      {
        path: 'ResumenSemanal/:resumenId?/:internalId?',
        name: 'ResumenSemanal',
        component: ResumenSemanal,
        meta: { requiresAuth: true, requiredPermission: "ResumenSemanal" }
      },
      {
        path: 'ResumenSemanalEstudiante',
        name: 'ResumenSemanalEstudiante',
        component: ResumenSemanal,
        meta: { requiresAuth: true, requiredPermission: "ResumenSemanalEstudiante" }
      },
      {
        path: 'RegistroVirtual',
        name: 'RegistroVirtual',
        component: RegistroVirtual,
        meta: { requiresAuth: true, requiredPermission: "RegistroVirtual" }
      },
      {
        path: 'AlertasView',
        name: 'AlertasView',
        component: AlertasView,
        meta: { requiresAuth: true, requiredPermission: "AlertasView" }
      }
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

// Router guard: Protección de rutas con autenticación y permisos
router.beforeEach(async (to, from, next) => {
  // Si la ruta es pública (empieza con "/login"), permitimos el acceso.
  if (to.path.startsWith("/login")) {
    return next();
  }

  // Para las rutas protegidas, verificamos la sesión
  const authStore = useAuthStore();

  // Verificar o refrescar la sesión
  await authStore.verifySession();

  // Si no está autenticado, redirigimos al login.
  if (!authStore.isAuthenticated) {
    return next({ name: "Login" });
  }

  // Verificar permisos si la ruta requiere un permiso específico
  if (to.meta.requiredPermission) {
    const hasPermission = authStore.canView(to.meta.requiredPermission as string);
    
    if (!hasPermission) {
      // El usuario no tiene permisos para acceder a esta ruta
      console.warn(`Acceso denegado a ${to.path}. Permiso requerido: ${to.meta.requiredPermission}`);
      
      // Redirigir a una página de acceso denegado o a home
      return next({ 
        name: "home", 
        query: { 
          error: "access_denied", 
          message: "No tienes permisos para acceder a esta página" 
        } 
      });
    }
  }

  // Si está autenticado y tiene permisos, se permite la navegación.
  next();
});

export default router;