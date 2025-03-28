<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed, ref } from "vue";
import { useDarkMode } from "@/components/ThemeSwitcher";
import { useAuthStore } from "@/stores/auth";

import Avatar from "primevue/avatar";
import Menu from "primevue/menu";
import Badge from "primevue/badge";

const { isDarkTheme, toggleDarkMode } = useDarkMode();
const route = useRoute();
const authStore = useAuthStore();
const menu = ref();

//User Menu Items
const items = ref([
  {
    label: "Perfil",
    items: [
      {
        label: "Configuración",
        icon: "pi pi-cog",
      },
      {
        label: "Cerrar Sesión",
        icon: "pi pi-sign-out",
        command: () => {
          authStore.logout(); // Logout method from auth.ts
          if (isDarkTheme.value) {
            toggleDarkMode();
          }
        },
      },
    ],
  },
]);

const toggle = (event: any) => {
  menu.value.toggle(event);
};

//VIEWS CLASSES

//Home View
const homeClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

//Case Views
const newCaseClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/NuevoCaso" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);
const myCasesClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/MisCasos" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);
const caseNotificactionsClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/Notificaciones" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);
const activitiesClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/CrearActividades" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

//Cases -> Reports
const feasibilityReportClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/InformeDeViabilidad" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);
const fileReportClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/ReporteDeDocumentos" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

//Admin Views
const caseReviewClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/RevisionDeCasos" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);
const caseAssignClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/AsignacionDeCasos" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);
const parameterClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/Parametros" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);
const configurationClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/Configuration" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

//User Views
const userClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/Usuarios" || route.path === "/NuevoUsuario"
    ? "text-green-400"
    : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

//Social Work Views
const socialWorkCasesClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/TrabajoSocialCasos" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);
const socialWorkDashboardClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/TrabajoSocialDashboard" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);
const socialWorkScheduleClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/TrabajoSocialHorario" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

//----------------------------------------------------------------------------------------------------//
//Entrance Control
const cronogramaClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/Cronograma" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const ingresoEstudiantesExcelClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/IngresoEstudiantesExcel" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const ingresoManualEstudiantesClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/IngresoManualEstudiantes" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const listadoEstudiantesClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/ListadoEstudiantes" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const asignacionPeriodoClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/AsignacionPeriodo" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const removerPeriodoClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/RemoverPeriodo" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const ingresoAreaClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/IngresoArea" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const ingresoHorarioClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/IngresoHorario" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const ingresoHorarioVirtualClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/IngresoHorarioVirtual" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const vistaHorariosClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/VistaHorarios" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const asignacionHuellaClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/AsignacionHuella" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const registroAsistenciaClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/RegistroAsistencia" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);
</script>

<template>
  <!-- Contenedor fijo para el sidebar -->
  <div
    class="select-none fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-10 sidebar"
  >
    <div class="flex flex-col h-full">
      <!-- Encabezado con logo -->
      <header class="flex items-center justify-between px-6 pt-4 shrink-0">
        <span class="inline-flex items-center gap-2">
          <!-- Logo en SVG -->
          <svg
            width="35"
            height="40"
            viewBox="0 0 35 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05ZM25.27 35.49L29.18 31.58V27.67L25.27 30.98V35.49ZM20.16 17.14H20.03H20.17H20.16ZM30.1 5.19L34.89 4.81L33.08 12.33L24.1 15.67L30.08 5.2L30.1 5.19ZM5.72 14.74L2.41 13.54V23.77L9.63 29.79V20.47L11.74 17.46L9.03 18.06L5.72 14.75V14.74ZM9.63 30.98L5.72 27.67V31.58L9.63 35.49V30.98ZM4.8 5.2L10.78 15.67L1.81 12.33L0 4.81L4.79 5.19L4.8 5.2ZM24.37 21.05V34.59L22.56 37.29L20.46 39.4H14.44L12.34 37.29L10.53 34.59V21.05L12.42 18.23L17.45 26.8L22.48 18.23L24.37 21.05ZM22.85 0L22.57 0.69L17.45 13.08L12.33 0.69L12.05 0H22.85Z"
              fill="var(--p-primary-color)"
            />
            <path
              d="M30.69 4.21L24.37 4.81L22.57 0.69L22.86 0H26.48L30.69 4.21ZM23.75 5.67L22.66 3.08L18.05 14.24V17.14H19.7H20.03H20.16H20.2L24.1 15.7L30.11 5.19L23.75 5.67ZM4.21002 4.21L10.53 4.81L12.33 0.69L12.05 0H8.43002L4.22002 4.21H4.21002ZM21.9 17.4L20.6 18.2H14.3L13 17.4L12.4 18.2L12.42 18.23L17.45 26.8L22.48 18.23L22.5 18.2L21.9 17.4ZM4.79002 5.19L10.8 15.7L14.7 17.14H14.74H15.2H16.85V14.24L12.24 3.09L11.15 5.68L4.79002 5.2V5.19Z"
              fill="var(--p-text-color)"
            />
          </svg>
          <span
            class="select-none font-semibold text-2xl text-primary text-center ml-2"
          >
            Consultorios Jurídicos PUCE
          </span>
        </span>
      </header>
      <!-- Contenido de navegación -->
      <main class="flex-1 overflow-y-auto">
        <!-- Sección: INICIO -->
        <ul class="list-none p-4 m-0">
          <li>
            <router-link to="/" draggable="false" v-ripple :class="homeClass">
              <i class="pi pi-home mr-2"></i>
              <span class="font-medium text-lg">Inicio</span>
            </router-link>
          </li>

          <!-- Sección: CASOS -->
          <div
            v-if="
              authStore.user?.type == 'Administrador' ||
              authStore.user?.type == 'Estudiante'
            "
          >
            <li>
              <router-link
                to="/NuevoCaso"
                draggable="false"
                v-ripple
                :class="newCaseClass"
              >
                <i class="pi pi-plus-circle mr-2"></i>
                <span class="font-medium text-lg">Nuevo Caso</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/MisCasos"
                draggable="false"
                v-ripple
                :class="myCasesClass"
              >
                <i class="pi pi-folder-open mr-2"></i>
                <span class="font-medium text-lg">Mis Casos</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/CrearActividades"
                draggable="false"
                v-ripple
                :class="activitiesClass"
              >
                <i class="pi pi-folder-open mr-2"></i>
                <span class="font-medium text-lg">Crear Acividades</span>
              </router-link>
            </li>
            <!-- Sección: REPORTES -->
            <li>
              <a
                v-ripple
                v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors"
              >
                <i class="pi pi-chart-line mr-2"> </i>
                <span class="font-medium text-lg"> Reportes </span>
                <i class="pi pi-chevron-down ml-auto"> </i>
              </a>
              <ul class="submenu closed list-none p-0 m-0">
                <!-- Sección: INFORME DE VIABILIDAD -->
                <li>
                  <router-link
                    to="/InformeDeViabilidad"
                    draggable="false"
                    v-ripple
                    :class="feasibilityReportClass"
                  >
                    <i class="pi pi-file-word mr-2"></i>
                    <span class="font-medium text-lg"
                      >Informe de Viabilidad</span
                    >
                  </router-link>
                </li>
                <!-- Sección: DOCUMENTOS -->
                <li>
                  <router-link
                    to="/ReporteDeDocumentos"
                    draggable="false"
                    v-ripple
                    :class="fileReportClass"
                  >
                    <i class="pi pi-file-pdf mr-2"></i>
                    <span class="font-medium text-lg">Documentos</span>
                  </router-link>
                </li>
              </ul>
            </li>
            <!-- Sección: NOTIFICACIONES -->
            <li>
              <router-link
                to="/Notificaciones"
                draggable="false"
                v-ripple
                :class="caseNotificactionsClass"
              >
                <i class="pi pi-comments mr-2"></i>
                <span class="font-medium text-lg">Notificaciones</span>
                <span
                  class="inline-flex items-center justify-center ml-auto bg-blue-500 text-white rounded-full"
                  style="min-width: 1.5rem; height: 1.5rem"
                  >3</span
                >
              </router-link>
            </li>
          </div>

          <!-- Sección: Entrance Control -->

          <!--Gestión de Periodos-->
          <div v-if="authStore.user?.type == 'Administrador' || authStore.user?.type == 'Secretaria'">
            <li class="mt-4">
              <div class="text-xs font-semibold text-surface-400 uppercase tracking-wider pl-4 mb-2">Gestión Académica</div>
              <ul class="list-none p-0 m-0">
                <!-- PERIODOS ACADÉMICOS -->
                <li>
                  <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
                    <i class="pi pi-calendar-clock mr-2"></i>
                    <span class="font-medium text-lg">Periodos Académicos</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li>
                      <router-link to="/Cronograma" draggable="false" v-ripple :class="cronogramaClass">
                        <i class="pi pi-graduation-cap mr-2"></i>
                        <span class="font-medium text-lg">Cronograma</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/PeriodoSemanal" draggable="false" v-ripple :class="cronogramaClass">
                        <i class="pi pi-graduation-cap mr-2"></i>
                        <span class="font-medium text-lg">Periodo Semanal</span>
                      </router-link>
                    </li>
                  </ul>
                </li>

                <!-- GESTIÓN DE ESTUDIANTES -->
                <li>
                  <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
                    <i class="pi pi-users mr-2"></i>
                    <span class="font-medium text-lg">Gestión de Estudiantes</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li>
                      <router-link to="/IngresoEstudiantesExcel" draggable="false" v-ripple :class="ingresoEstudiantesExcelClass">
                        <i class="pi pi-file-excel mr-2"></i>
                        <span class="font-medium text-lg">Ingreso por Archivo</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/IngresoManualEstudiantes" draggable="false" v-ripple :class="ingresoManualEstudiantesClass">
                        <i class="pi pi-user-edit mr-2"></i>
                        <span class="font-medium text-lg">Ingreso Manual</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/ListadoEstudiantes" draggable="false" v-ripple :class="listadoEstudiantesClass">
                        <i class="pi pi-list mr-2"></i>
                        <span class="font-medium text-lg">Listado</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/AsignacionPeriodo" draggable="false" v-ripple :class="asignacionPeriodoClass">
                        <i class="pi pi-address-book mr-2"></i>
                        <span class="font-medium text-lg">Asignar Periodo</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/RemoverPeriodo" draggable="false" v-ripple :class="removerPeriodoClass">
                        <i class="pi pi-user-minus mr-2"></i>
                        <span class="font-medium text-lg">Quitar de Periodo</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/IngresoArea" draggable="false" v-ripple :class="ingresoAreaClass">
                        <i class="pi pi-building-columns mr-2"></i>
                        <span class="font-medium text-lg">Asignar Área</span>
                      </router-link>
                    </li>
                  </ul>
                </li>

                <!-- HORARIOS -->
                <li>
                  <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
                    <i class="pi pi-clock mr-2"></i>
                    <span class="font-medium text-lg">Administración de Horarios</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li>
                      <router-link to="/IngresoHorario" draggable="false" v-ripple :class="ingresoHorarioClass">
                        <i class="pi pi-calendar-plus mr-2"></i>
                        <span class="font-medium text-lg">Horario Presencial</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/IngresoHorarioVirtual" draggable="false" v-ripple :class="ingresoHorarioVirtualClass">
                        <i class="pi pi-video mr-2"></i>
                        <span class="font-medium text-lg">Horario Virtual</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/VistaHorarios" draggable="false" v-ripple :class="vistaHorariosClass">
                        <i class="pi pi-eye mr-2"></i>
                        <span class="font-medium text-lg">Visualizar Horarios</span>
                      </router-link>
                    </li>
                  </ul>
                </li>

                <!-- BIOMETRÍA -->
                <li>
                  <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
                    <i class="pi pi-fingerprint mr-2"></i>
                    <span class="font-medium text-lg">Control Biométrico</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li>
                      <router-link to="/AsignacionHuella" draggable="false" v-ripple :class="asignacionHuellaClass">
                        <i class="pi pi-plus-circle mr-2"></i>
                        <span class="font-medium text-lg">Registro Biométrico</span>
                      </router-link>
                    </li> 
                    <li>
                      <router-link to="/RegistroPorCedula" draggable="false" v-ripple :class="registroAsistenciaClass">
                        <i class="pi pi-check-circle mr-2"></i>
                        <span class="font-medium text-lg">Registro de Asistencia</span>
                      </router-link>
                    </li>
                  </ul>
                </li>

                <li>
                  <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
                    <i class="pi pi-fingerprint mr-2"></i>
                    <span class="font-medium text-lg">Control Asistencia</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li>
                      <router-link to="/SeguimientoGeneral" draggable="false" v-ripple :class="asignacionHuellaClass">
                        <i class="pi pi-plus-circle mr-2"></i>
                        <span class="font-medium text-lg">Seguimiento de Horas</span>
                      </router-link>
                    </li> 
  
                  </ul>
                </li>
<!--front final-->
              </ul>
            </li>
          </div>
        </ul>

        <!-- Sección: ADMINISTRACION (Solo si el usuario es de tipo Admin) -->
        <ul
          v-if="authStore.user?.type == 'Administrador'"
          class="list-none p-4 m-0"
        >
          <li>
            <div
              v-ripple
              v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
              class="select-none p-4 flex items-center justify-between text-surface-500 cursor-pointer"
            >
              <span class="font-medium"> ADMINSTRACIÓN </span>
              <i class="pi pi-chevron-down" style="font-size: 1.2rem"> </i>
            </div>
            <ul class="submenu list-none p-0 m-0">
              <!-- Sección: Nuevo Usuario -->
              <li>
                <router-link
                  to="/Usuarios"
                  draggable="false"
                  v-ripple
                  :class="userClass"
                >
                  <i class="pi pi-id-card mr-2"></i>
                  <span class="font-medium text-lg">Gestión de Usuarios</span>
                </router-link>
              </li>

              <!-- Sección: Tabla de Parámetros -->
              <li>
                <router-link
                  to="/Parametros"
                  draggable="false"
                  v-ripple
                  :class="parameterClass"
                >
                  <i class="pi pi-box mr-2"></i>
                  <span class="font-medium text-lg">Gestión de Parámetros</span>
                </router-link>
              </li>
              <!-- Sección: Revisar Casos -->
              <li>
                <router-link
                  to="/RevisionDeCasos"
                  draggable="false"
                  v-ripple
                  :class="caseReviewClass"
                >
                  <i class="pi pi-address-book mr-2"></i>
                  <span class="font-medium text-lg">Revisar Casos</span>
                </router-link>
              </li>
              <!-- Sección: Asignar Casos -->
              <li>
                <router-link
                  to="/AsignacionDeCasos"
                  draggable="false"
                  v-ripple
                  :class="caseAssignClass"
                >
                  <i class="pi pi-users mr-2"></i>
                  <span class="font-medium text-lg">Asignar Casos</span>
                </router-link>
              </li>
              <!-- Sección: Trabajo Social -->
              <li>
                <a
                  v-ripple
                  v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                  class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors"
                >
                  <i class="pi pi-briefcase mr-2"> </i>
                  <span class="font-medium text-lg"> Trabajo Social </span>
                  <i class="pi pi-chevron-down ml-auto"> </i>
                </a>
                <ul class="submenu closed list-none p-0 m-0">
                  <li>
                    <router-link
                      to="/TrabajoSocialDashboard"
                      draggable="false"
                      v-ripple
                      :class="socialWorkDashboardClass"
                    >
                      <i class="pi pi-home mr-2"></i>
                      <span class="font-medium text-lg">Dashboard</span>
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      to="/TrabajoSocialCasos"
                      draggable="false"
                      v-ripple
                      :class="socialWorkCasesClass"
                    >
                      <i class="pi pi-folder-open mr-2"></i>
                      <span class="font-medium text-lg">Casos</span>
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      to="/TrabajoSocialHorario"
                      draggable="false"
                      v-ripple
                      :class="socialWorkScheduleClass"
                    >
                      <i class="pi pi-calendar-clock mr-2"></i>
                      <span class="font-medium text-lg">Horario</span>
                    </router-link>
                  </li>
                </ul>
              </li>
              <li>
                <router-link
                  to="/Configuracion"
                  draggable="false"
                  v-ripple
                  :class="configurationClass"
                >
                  <i class="pi pi-cog mr-2"></i>
                  <span class="font-medium text-lg">Configuración</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </main>
      <!-- Pie de página con Avatar -->
      <footer class="mt-auto p-4">
        <hr class="mb-5 border-t border-gray-300" />
        <div class="flex items-center justify-between mb-2">
          <!-- Grupo de avatar y nombre -->
          <div class="flex items-center gap-4">
            <button
              v-ripple
              class="relative overflow-hidden w-full md:w-60 border-0 bg-transparent flex items-start p-2 pl-4 hover:bg-surface-100 dark:hover:bg-surface-100 rounded-none cursor-pointer transition-colors duration-200"
              @click="toggle"
              aria-haspopup="true"
              aria-controls="overlay_menu"
            >
              <Avatar
                image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
                class="mr-3"
                shape="circle"
              />
              <span class="inline-flex flex-col items-start">
                <span class="font-bold">
                  {{ authStore.user?.name }}
                </span>
                <span class="text-sm">
                  {{ authStore.user?.type }}
                </span>
              </span>
            </button>

            <Menu
              ref="menu"
              :model="items"
              class="select-none w-full md:w-30"
              :popup="true"
              style="caret-color: transparent"
            >
              <template #item="{ item, props }">
                <a v-ripple class="flex items-center" v-bind="props.action">
                  <span :class="item.icon" />
                  <span>{{ item.label }}</span>
                  <Badge
                    v-if="item.badge"
                    class="ml-auto"
                    :value="item.badge"
                  />
                  <span
                    v-if="item.shortcut"
                    class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1"
                    >{{ item.shortcut }}</span
                  >
                </a>
              </template>
            </Menu>
          </div>

          <!-- Botón de modo oscuro/claro -->
          <button
            type="button"
            class="flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 text-yellow-500 hover:bg-gray-700"
            @click="toggleDarkMode"
          >
            <i
              :class="[
                'pi',
                { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme },
              ]"
            ></i>
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.submenu {
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px;
  opacity: 1;
}
.submenu.closed {
  max-height: 0;
  opacity: 0;
}
i {
  font-size: 1.4rem;
}
.pi-chevron-down {
  font-size: 1.2rem;
}
</style>
