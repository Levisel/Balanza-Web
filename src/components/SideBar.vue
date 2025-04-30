<script setup lang="ts">
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";
import { useDarkMode } from "@/components/ThemeSwitcher";
import { useAuthStore } from "@/stores/auth";

import Avatar from "primevue/avatar";
import Menu from "primevue/menu";
import Badge from "primevue/badge";

const { isDarkTheme, toggleDarkMode } = useDarkMode();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const menu = ref();


const userAvatar = computed(() => {
   const defaultAvatar = '/src/components/icons/default-user.png'; 
   console.log("User Avatar:", authStore.user?.picture);
   return authStore.user?.picture || defaultAvatar;
   
});

//User Menu Items
const items = ref([
  {
    label: "Perfil",
    items: [
      {
        label: "Configuración",
        icon: "pi pi-cog",
        command: () => {
          router.push("/Configuracion");
        },
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

const excelReportClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/ReporteDeExcel" ? "text-green-400" : "",
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

const periodoSemanalClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/PeriodoSemanal" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const registroPorCedulaClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/RegistroPorCedula" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const registroManualClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/RegistroManual" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const seguimientoGeneralClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/SeguimientoGeneral" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const modificacionHorasClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/ModificacionHoras" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const registrosAbiertosClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/RegistrosAbiertos" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const registrosCerradosClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/RegistrosCerrados" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);
const seguimientoSemanalClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/PeriodoSemanal" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);
const vistaHorariosPersonalClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/VistaHorariosPersonal" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const registroVirtualClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/RegistroVirtual" ? "text-green-400" : "",
  isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100",
]);

const seguimientoHorasClass = computed(() => [
  "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors",
  route.path === "/ResumenSemanalEstudiante" ? "text-green-400" : "",
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
        <span class="inline-flex items-center gap-3">
          <!-- Imagen cuadrada, tamaño fijo, mantiene proporción y alineación vertical -->
          <img
            src="./icons/logo.jpg"
            alt="Logo"
            class="-mt-3 -mr-8 h-18 w-18 object-contain rounded"
            style="background: #fff"
          />
          <span
            class="select-none font-semibold text-2xl text-primary text-center ml-7"
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
            class="mt-4"
            v-if="
              authStore.user?.type == 'Administrador' ||
              authStore.user?.type == 'Estudiante' ||
              authStore.user?.type == 'Abogado' ||
              authStore.user?.type == 'Coordinador'
            "
          >
            <div
              class="text-sm font-bold text-surface-400 text-neutral-400 uppercase tracking-wider pl-4 mb-2"
            >
              Gestión de Casos
            </div>
            <ul class="list-none p-0 m-0">
              <div
                v-if="
                  authStore.user?.type == 'Administrador' ||
                  authStore.user?.type == 'Estudiante' ||
                  authStore.user?.type == 'Abogado' ||
                  authStore.user?.type == 'Coordinador'
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
              </div>
              <div
                v-if="
                  authStore.user?.type == 'Administrador' ||
                  authStore.user?.type == 'Estudiante'
                "
              >
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
              </div>

              <div
                v-if="
                  authStore.user?.type == 'Administrador' ||
                  authStore.user?.type == 'Coordinador'
                "
              >
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
              </div>
              <div
                v-if="
                  authStore.user?.type == 'Administrador' ||
                  authStore.user?.type == 'Abogado'
                "
              >
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
                <li>
                  <router-link
                    to="/CrearActividades"
                    draggable="false"
                    v-ripple
                    :class="activitiesClass"
                  >
                    <i class="pi pi-clipboard mr-2"></i>
                    <span class="font-medium text-lg">Crear Actividades</span>
                  </router-link>
                </li>
              </div>
            </ul>

            <!-- Sección: REPORTES -->
            <div class="mt-4">
              <div
                class="text-sm font-bold text-surface-400 text-neutral-400 uppercase tracking-wider pl-4 mb-2"
              >
                Reportes
              </div>
              <ul class="list-none p-0 m-0">
                <li>
                  <a
                    v-ripple
                    v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors"
                  >
                    <i class="pi pi-chart-line mr-2"> </i>
                    <span class="font-medium text-lg">Generar Reportes </span>
                    <i class="pi pi-chevron-down ml-auto"> </i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <!-- Sección: Reportes en Excel -->
                    <div
                      v-if="
                        authStore.user?.type == 'Administrador' ||
                        authStore.user?.type == 'Abogado' ||
                        authStore.user?.type == 'Estudiante'
                      "
                    >
                      <li>
                        <router-link
                          to="/ReporteDeExcel"
                          draggable="false"
                          v-ripple
                          :class="excelReportClass"
                        >
                          <i class="pi pi-file-excel mr-2"></i>
                          <span class="font-medium text-lg"
                            >Informe de Excel</span
                          >
                        </router-link>
                      </li>
                    </div>
                    <!-- Sección: INFORME DE VIABILIDAD -->
                    <div
                      v-if="
                        authStore.user?.type == 'Administrador' ||
                        authStore.user?.type == 'Abogado' ||
                        authStore.user?.type == 'Estudiante'
                      "
                    >
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
                    </div>
                    <!-- Sección: DOCUMENTOS -->
                    <div
                      v-if="
                        authStore.user?.type == 'Administrador' ||
                        authStore.user?.type == 'Abogado' ||
                        authStore.user?.type == 'Estudiante'
                      "
                    >
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
                    </div>
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
                    <!-- <span
                  class="inline-flex items-center justify-center ml-auto bg-blue-500 text-white rounded-full"
                  style="min-width: 1.5rem; height: 1.5rem"
                  >3</span
                > -->
                  </router-link>
                </li>
              </ul>
            </div>
          </div>

          <div
            v-if="
              authStore.user?.type == 'Administrador' ||
              authStore.user?.type == 'Secretaria'
            "
          >
            <li class="mt-4">
              <div
                class="text-sm font-bold text-surface-400 text-neutral-400 uppercase tracking-wider pl-4 mb-2"
              >
                Gestión Académica
              </div>
              <ul class="list-none p-0 m-0">
                <!-- PERIODOS ACADÉMICOS -->
                <li>
                  <a
                    v-ripple
                    v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors"
                  >
                    <i class="pi pi-calendar mr-2"></i>
                    <span class="font-medium text-lg">Periodos Académicos</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li>
                      <router-link
                        to="/Cronograma"
                        draggable="false"
                        v-ripple
                        :class="cronogramaClass"
                      >
                        <i class="pi pi-graduation-cap mr-2"></i>
                        <span class="font-medium text-lg">Cronograma</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        to="/PeriodoSemanal"
                        draggable="false"
                        v-ripple
                        :class="seguimientoSemanalClass"
                      >
                        <i class="pi pi-calendar-times mr-2"></i>
                        <span class="font-medium text-lg">Periodo Semanal</span>
                      </router-link>
                    </li>
                  </ul>
                </li>

                <!-- GESTIÓN DE ESTUDIANTES -->
                <li>
                  <a
                    v-ripple
                    v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors"
                  >
                    <i class="pi pi-users mr-2"></i>
                    <span class="font-medium text-lg"
                      >Gestión de Estudiantes</span
                    >
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li>
                      <router-link
                        to="/IngresoEstudiantesExcel"
                        draggable="false"
                        v-ripple
                        :class="ingresoEstudiantesExcelClass"
                      >
                        <i class="pi pi-file-excel mr-2"></i>
                        <span class="font-medium text-lg"
                          >Ingreso por Archivo</span
                        >
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        to="/IngresoManualEstudiantes"
                        draggable="false"
                        v-ripple
                        :class="ingresoManualEstudiantesClass"
                      >
                        <i class="pi pi-user-edit mr-2"></i>
                        <span class="font-medium text-lg">Ingreso Manual</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        to="/ListadoEstudiantes"
                        draggable="false"
                        v-ripple
                        :class="listadoEstudiantesClass"
                      >
                        <i class="pi pi-list mr-2"></i>
                        <span class="font-medium text-lg">Listado</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        to="/AsignacionPeriodo"
                        draggable="false"
                        v-ripple
                        :class="asignacionPeriodoClass"
                      >
                        <i class="pi pi-address-book mr-2"></i>
                        <span class="font-medium text-lg">Asignar Periodo</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        to="/RemoverPeriodo"
                        draggable="false"
                        v-ripple
                        :class="removerPeriodoClass"
                      >
                        <i class="pi pi-user-minus mr-2"></i>
                        <span class="font-medium text-lg"
                          >Quitar de Periodo</span
                        >
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        to="/IngresoArea"
                        draggable="false"
                        v-ripple
                        :class="ingresoAreaClass"
                      >
                        <i class="pi pi-building-columns mr-2"></i>
                        <span class="font-medium text-lg">Asignar Área</span>
                      </router-link>
                    </li>
                  </ul>
                </li>

                <!-- HORARIOS -->
                <li>
                  <a
                    v-ripple
                    v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors"
                  >
                    <i class="pi pi-clock mr-2"></i>
                    <span class="font-medium text-lg">Gestión de Horarios</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li>
                      <router-link
                        to="/IngresoHorario"
                        draggable="false"
                        v-ripple
                        :class="ingresoHorarioClass"
                      >
                        <i class="pi pi-calendar-plus mr-2"></i>
                        <span class="font-medium text-lg"
                          >Horario Presencial</span
                        >
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        to="/IngresoHorarioVirtual"
                        draggable="false"
                        v-ripple
                        :class="ingresoHorarioVirtualClass"
                      >
                        <i class="pi pi-video mr-2"></i>
                        <span class="font-medium text-lg">Horario Virtual</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        to="/VistaHorarios"
                        draggable="false"
                        v-ripple
                        :class="vistaHorariosClass"
                      >
                        <i class="pi pi-eye mr-2"></i>
                        <span class="font-medium text-lg"
                          >Visualizar Horarios</span
                        >
                      </router-link>
                    </li>
                  </ul>
                </li>

                <!-- BIOMETRÍA -->
                <li>
                  <a
                    v-ripple
                    v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors"
                  >
                    <i class="pi pi-bullseye mr-2"></i>
                    <span class="font-medium text-lg">Control Biométrico</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li>
                      <router-link
                        to="/AsignacionHuella"
                        draggable="false"
                        v-ripple
                        :class="asignacionHuellaClass"
                      >
                        <i class="pi pi-plus-circle mr-2"></i>
                        <span class="font-medium text-lg"
                          >Registro Biométrico</span
                        >
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        to="/RegistroPorCedula"
                        draggable="false"
                        v-ripple
                        :class="registroPorCedulaClass"
                      >
                        <i class="pi pi-clipboard mr-2"></i>
                        <span class="font-medium text-lg"
                          >Registro Por Huella</span
                        >
                      </router-link>
                    </li>
                  </ul>
                </li>

                <li>
                  <a
                    v-ripple
                    v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors"
                  >
                    <i class="pi pi-calendar-clock mr-2"></i>
                    <span class="font-medium text-lg">Control Asistencia</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li>
                      <router-link
                        to="/RegistroManual"
                        draggable="false"
                        v-ripple
                        :class="registroManualClass"
                      >
                        <i class="pi pi-pencil mr-2"></i>
                        <span class="font-medium text-lg">Registro Manual</span>
                      </router-link>
                    </li>

                    <li>
                      <router-link
                        to="/ModificacionHoras"
                        draggable="false"
                        v-ripple
                        :class="modificacionHorasClass"
                      >
                        <i class="pi pi-plus-circle mr-2"></i>
                        <span class="font-medium text-lg"
                          >Horas Extraordinarias</span
                        >
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        to="/RegistrosAbiertos"
                        draggable="false"
                        v-ripple
                        :class="registrosAbiertosClass"
                      >
                        <i class="pi pi-folder-open mr-2"></i>
                        <span class="font-medium text-lg"
                          >Registros Abiertos</span
                        >
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        to="/RegistrosCerrados"
                        draggable="false"
                        v-ripple
                        :class="registrosCerradosClass"
                      >
                        <i class="pi pi-folder mr-2"></i>
                        <span class="font-medium text-lg"
                          >Registros Cerrados</span
                        >
                      </router-link>
                    </li>
                  </ul>
                </li>

                <!-- Sección: Seguimiento -->
                <li>
                  <a
                    v-ripple
                    v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors"
                  >
                    <i class="pi pi-book mr-2"></i>
                    <span class="font-medium text-lg">Seguimiento</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li>
                      <router-link
                        to="/SeguimientoGeneral"
                        draggable="false"
                        v-ripple
                        :class="seguimientoGeneralClass"
                      >
                        <i class="pi pi-compass mr-2"></i>
                        <span class="font-medium text-lg"
                          >Seguimiento de Horas</span
                        >
                      </router-link>
                    </li>
                  </ul>
                </li>
                <!--front final-->
              </ul>
            </li>
          </div>

          <!-- Gestión de Prácticas (solo para estudiantes) -->
          <div v-if="authStore.user?.type === 'Estudiante'" class="mt-4">
            <div
              class="text-sm font-bold text-surface-400 text-neutral-400 uppercase tracking-wider pl-4 mb-2"
            >
              Gestión de Prácticas
            </div>
            <ul class="list-none p-0 m-0">
              <li>
                <router-link
                  to="/VistaHorariosPersonal"
                  draggable="false"
                  v-ripple
                  :class="vistaHorariosPersonalClass"
                >
                  <i class="pi pi-calendar-plus mr-2"></i>
                  <span class="font-medium text-lg"> Horario</span>
                </router-link>
              </li>

    <li>
      <router-link to="/RegistroVirtual" draggable="false" v-ripple :class="registroVirtualClass">
        <i class="pi pi-video mr-2"></i>
        <span class="font-medium text-lg">Registro Virtual</span>
      </router-link>
    </li>
    <li>
      <router-link to="/ResumenSemanalEstudiante" draggable="false" v-ripple :class="seguimientoHorasClass">
        <i class="pi pi-book mr-2"></i>
        <span class="font-medium text-lg">Seguimiento de Horas</span>
      </router-link>
    </li>
  </ul>
</div>


          




          <!-- Sección: TRABAJO SOCIAL -->
          <div
            class="mt-4"
            v-if="
              authStore.user?.type == 'Trabajo Social' ||
              authStore.user?.type == 'Administrador'
            "
          >
            <div
              class="text-sm font-bold text-surface-400 text-neutral-400 uppercase tracking-wider pl-4 mb-2"
            >
              Trabajo Social
            </div>
            <ul class="list-none p-0 m-0">
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
            </ul>
          </div>
        </ul>

        <!-- Sección: ADMINISTRACION (Solo si el usuario es de tipo Admin) -->

        <ul
          v-if="
            authStore.user?.type == 'Administrador' ||
            authStore.user?.type == 'Secretaria'
          "
          class="list-none p-4 m-0"
        >
          <li>
            <div class="mt-4">
              <div
                class="text-sm font-bold text-surface-400 text-neutral-400 uppercase tracking-wider pl-4 mb-2"
              >
                Administración del sistema
              </div>

              <a
                v-ripple
                v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors"
              >
                <i class="pi pi-cog mr-2"> </i>
                <span class="font-medium text-lg"> Configuración </span>
                <i class="pi pi-chevron-down ml-auto"> </i>
              </a>
              <ul class="submenu closed list-none p-0 m-0">
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
                    <span class="font-medium text-lg"
                      >Gestión de Parámetros</span
                    >
                  </router-link>
                </li>

                <!-- <li>
                <router-link
                  to="/Configuracion"
                  draggable="false"
                  v-ripple
                  :class="configurationClass"
                >
                  <i class="pi pi-cog mr-2"></i>
                  <span class="font-medium text-lg">Configuración</span>
                </router-link>
              </li> -->
              </ul>
            </div>
          </li>
        </ul>
      </main>
      <!-- Pie de página con Avatar -->
      <footer class="mt-auto p-4">
        <hr class="mb-3 border-t border-gray-300" />
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
                :image="userAvatar"
                class="mr-3"
                shape="circle"
                size="large"
              />
              <span class="inline-flex flex-col items-start mt-1">
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
.p-avatar img { /* Asegura que la imagen dentro del avatar se muestre correctamente */
    object-fit: cover;
}
</style>
