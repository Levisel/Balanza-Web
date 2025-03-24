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
import Cronograma from '@/views/CRUD/Cronograma/Cronograma.vue';
import IngresoCronograma from '@/views/CRUD/Cronograma/IngresoCronograma.vue';
import IngresoEstudiantesExcel from '@/views/CRUD/Estudiantes/IngresoEstudiantesExcel.vue';
import IngresoManualEstudiantes from '@/views/CRUD/Estudiantes/IngresoManualEstudiantes.vue';
import ListadoEstudiantes from '@/views/CRUD/Estudiantes/ListadoEstudiantes.vue';
import AsignacionPeriodo from '@/views/CRUD/Estudiantes/AsignacionPeriodo.vue';
import RemoverPeriodo from '@/views/CRUD/Estudiantes/RemoverPeriodo.vue';
import IngresoArea from '@/views/CRUD/Horario/IngresoArea.vue';
import IngresoHorario from '@/views/CRUD/Horario/IngresoHorario.vue';
import VistaHorarios from '@/views/CRUD/Horario/VistaHorarios.vue';
import IngresoHorarioVirtual from '@/views/CRUD/Horario/IngresoHorarioVirtual.vue';
import AsignacionHuella from '@/views/CRUD/RegistroBiometrico/AsignacionHuella.vue';
import RegistroHuella from '@/views/CRUD/RegistroBiometrico/RegistroHuella.vue';
import RegistroAsistencia from '@/views/CRUD/RegistroBiometrico/RegistroAsistencia.vue';

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
        path: 'Cronograma',
        name: 'Cronograma',
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
        path: 'IngresoManualEstudiantes/:id?',
        name: 'IngresoManualEstudiantes',
        component: IngresoManualEstudiantes,
      },
      {
        path: 'ListadoEstudiantes',
        name: 'ListadoEstudiantes',
        component: ListadoEstudiantes,
      },
      {
        path: 'AsignacionPeriodo',
        name: 'AsignacionPeriodo',
        component: AsignacionPeriodo,
      },
      {
        path: 'RemoverPeriodo',
        name: 'RemoverPeriodo',
        component: RemoverPeriodo,
      },
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
        path: 'AsignacionHuella',
        name: 'AsignacionHuella',
        component: AsignacionHuella,
      },
      {
        path: 'RegistroAsistencia/:id/periodo/:periodo',
        name: 'RegistroAsistencia',
        component: RegistroAsistencia,
      },
      {
        path: 'RegistroHuella/:id?',
        name: 'RegistroHuella',
        component: RegistroHuella,
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

export default router;
