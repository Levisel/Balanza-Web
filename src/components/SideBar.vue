<script setup lang="ts">
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";
import { useDarkMode } from "@/components/ThemeSwitcher";
import { useAuthStore } from "@/stores/auth";

import Avatar from "primevue/avatar";
import Menu from "primevue/menu";
import Badge from "primevue/badge";
import VistaHorarioPersonal from "@/views/SideBar/EntranceControl/Horario/VistaHorarioPersonal.vue";

const { isDarkTheme, toggleDarkMode } = useDarkMode();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const menu = ref();

const userAvatar = computed(() => {
  const defaultAvatar = '/src/components/icons/default-user.png';
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
          authStore.logout();
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

// Function to get the class for a link based on the current route 
const getLinkClass = (path: string | string[]) => {
  const paths = Array.isArray(path) ? path : [path];
  const baseClass = "select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors text-lg";
  const activeClass = paths.some(p => route.path === p) ? "text-green-400 font-semibold" : "";
  const hoverClass = isDarkTheme.value ? "hover:bg-gray-700" : "hover:bg-gray-100";
  return [baseClass, activeClass, hoverClass];
};

//VIEWS CLASSES
// --- Submenu visibility logic ---

const canViewCasosSection = computed(() => {
  if (authStore.user?.type === 'Administrador') return true;
  const casoViewKeys = ['NewCase', 'MyCases', 'CreateActivities', 'AssignedCases', 'AllCases', 'CaseReview', 'CaseAssign'];
  return casoViewKeys.some(key => authStore.viewPermissions[key]);
});

const canViewReportesCasosSection = computed(() => {
  if (authStore.user?.type === 'Administrador') return true;
  const reporteViewKeys = ['ExcelReport', 'CaseNotifications'];
  return reporteViewKeys.some(key => authStore.viewPermissions[key]);
});

const canViewAdminSection = computed(() => {
  if (authStore.user?.type === 'Administrador') return true;
  const adminViewKeys = ['Parameter', 'RoleView', 'UserView'];
  return adminViewKeys.some(key => authStore.viewPermissions[key]);
});

const canViewTrabajoSocialSection = computed(() => {
  if (authStore.user?.type === 'Administrador') return true;
  const tsViewKeys = ['SocialWorkCases', 'SocialWorkSchedule', 'SocialWorkNewCase'];
  return tsViewKeys.some(key => authStore.viewPermissions[key]);
});

const canViewControlIngresosSection = computed(() => {
  if (authStore.user?.type === 'Administrador') return true;
  const ciViewKeys = [
    'Cronograma', 'IngresoCronograma', 'PeriodoSemanal', 'IngresoEstudiantesExcel', 'IngresoManualEstudiantes',
    'ListadoEstudiantes', 'AsignacionPeriodo', 'RemoverPeriodo', 'IngresoArea', 'IngresoHorario',
    'IngresoHorarioVirtual', 'VistaHorarios', 'AsignacionHuella', 'RegistroHuella', 'RegistroPorCedula',
    'RegistroManual', 'SeguimientoGeneral', 'ModificacionHoras', 'RegistrosAbiertos',
    'RegistrosCerrados',
  ];
  return ciViewKeys.some(key => authStore.viewPermissions[key]);
});

const openSubmenus = ref({
  casos: false,
  reportes: false,
});

const toggleSubmenu = (submenu: keyof typeof openSubmenus.value) => {
  openSubmenus.value[submenu] = !openSubmenus.value[submenu];
};
</script>

<template>
  <!-- Contenedor fijo para el sidebar -->
  <div class="select-none fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-10 sidebar">
    <div class="flex flex-col h-full">
      <!-- Encabezado con logo -->
      <header class="flex items-center justify-between px-6 pt-4 shrink-0">
        <span class="inline-flex items-center gap-3">
          <!-- Imagen cuadrada, tamaño fijo, mantiene proporción y alineación vertical -->
          <img src="./icons/logo.jpg" alt="Logo" class="-mt-3 -mr-8 h-18 w-18 object-contain rounded"
            style="background: #fff" />
          <span class="select-none font-semibold text-2xl text-primary text-center ml-7">
            Consultorios Jurídicos PUCE
          </span>
        </span>
      </header>
      <!-- Contenido de navegación -->
      <main class="flex-1 overflow-y-auto">
        <!-- Sección: INICIO -->
        <ul class="list-none p-4 m-0">

          <li>
            <router-link to="/" draggable="false" v-ripple :class="getLinkClass('/')">
              <i class="pi pi-home mr-3"></i><span class="font-normal">Inicio</span>
            </router-link>
          </li>

          <!-- Sección: CASOS -->
          <div class="mt-4" v-if="canViewCasosSection">
            <div class="text-sm font-bold text-surface-400 text-neutral-400 uppercase tracking-wider pl-4 mb-2">
              Gestión de Casos
            </div>
            <ul class="list-none p-0 m-0">
                <div v-if="authStore.canView('NewCase')">
                  <router-link to="/NuevoCaso" draggable="false" v-ripple :class="getLinkClass('/NuevoCaso')">
                    <i class="pi pi-plus-circle mr-2"></i>
                    <span class="font-normal text-lg">Nuevo Caso</span>
                  </router-link>
                </div>

                <div v-if="authStore.canView('MyCases')">
                  <li>
                    <router-link to="/MisCasos" draggable="false" v-ripple :class="getLinkClass('/MisCasos')">
                      <i class="pi pi-folder-open mr-2"></i>
                      <span class="font-normal text-lg">Mis Casos</span>
                    </router-link>
                  </li>
                </div>

                <div v-if="authStore.canView('CaseReview')">
                  <!-- Sección: Revisar Casos -->
                  <li>
                    <router-link to="/RevisionDeCasos" draggable="false" v-ripple
                      :class="getLinkClass('/RevisionDeCasos')">
                      <i class="pi pi-address-book mr-2"></i>
                      <span class="font-normal text-lg">Revisar Casos</span>
                    </router-link>
                  </li>
                </div>
                <div v-if="authStore.canView('CaseAssign')">
                  <li>
                    <router-link to="/AsignacionDeCasos" draggable="false" v-ripple
                      :class="getLinkClass('/AsignacionDeCasos')">
                      <i class="pi pi-users mr-2"></i>
                      <span class="font-normal text-lg">Asignar Casos</span>
                    </router-link>
                  </li>
                </div>
                <div v-if="authStore.canView('CreateActivities')">
                  <li>
                    <router-link to="/CrearActividades" draggable="false" v-ripple
                      :class="getLinkClass('/CrearActividades')">
                      <i class="pi pi-clipboard mr-2"></i>
                      <span class="font-normal text-lg">Crear Actividades</span>
                    </router-link>
                  </li>
                </div>

                <div v-if="authStore.canView('AssignedCases')">
                  <li>
                    <router-link to="/VerCasosAsignados" draggable="false" v-ripple
                      :class="getLinkClass('/VerCasosAsignados')">
                      <i class="pi pi-th-large mr-2"></i>
                      <span class="font-normal text-lg">Casos Asignados</span>
                    </router-link>
                  </li>
                </div>
                <div v-if="authStore.canView('AllCases')">
                  <li>
                    <router-link to="/VerCasos" draggable="false" v-ripple :class="getLinkClass('/VerCasos')">
                      <i class="pi pi-book mr-2"></i>
                      <span class="font-normal text-lg">Ver Casos</span>
                    </router-link>
                  </li>
                </div>
            </ul>

            <!-- Sección: REPORTES -->
            <div class="mt-4" v-if="canViewReportesCasosSection">
              <div class="text-sm font-bold text-surface-400 text-neutral-400 uppercase tracking-wider pl-4 mb-2">
                Reportes
              </div>
              <ul class="list-none p-0 m-0">
                <div v-if="authStore.canView('ExcelReport')">
                  <li>
                    <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                      class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
                      <i class="pi pi-chart-line mr-2"> </i>
                      <span class="font-medium text-lg">Generar Reportes </span>
                      <i class="pi pi-chevron-down ml-auto"> </i>
                    </a>
                    <ul class="submenu closed list-none p-0 m-0">
                      <!-- Sección: Reportes en Excel -->

                        <li>
                          <router-link to="/ReporteDeExcel" draggable="false" v-ripple
                            :class="getLinkClass('/ReporteDeExcel')">
                            <i class="pi pi-file-excel mr-2"></i>
                            <span class="font-normal text-lg">Informe de Excel</span>
                          </router-link>
                        </li>
                    </ul>
                  </li>
                </div>
                <!-- Sección: NOTIFICACIONES -->
                <div v-if="authStore.canView('CaseNotifications')">
                  <li>
                    <router-link to="/Notificaciones" draggable="false" v-ripple
                      :class="getLinkClass('/Notificaciones')">
                      <i class="pi pi-comments mr-2"></i>
                      <span class="font-normal text-lg">Notificaciones</span>
                    </router-link>
                  </li>
                </div>

              </ul>
            </div>
          </div>

          <div
            v-if="canViewControlIngresosSection">
            <li class="mt-4">
              <div class="text-sm font-bold text-surface-400 text-neutral-400 uppercase tracking-wider pl-4 mb-2">
                Gestión Académica
              </div>
              <ul class="list-none p-0 m-0">
                <!-- PERIODOS ACADÉMICOS -->
                <li
                  v-if="authStore.canView('Cronograma') || authStore.canView('IngresoCronograma') || authStore.canView('PeriodoSemanal')">
                  <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
                    <i class="pi pi-calendar mr-2"></i>
                    <span class="font-medium text-lg">Periodos Académicos</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li v-if="authStore.canView('Cronograma') || authStore.canView('IngresoCronograma')">
                      <router-link to="/Cronograma" draggable="false" v-ripple :class="getLinkClass('/Cronograma')">
                        <i class="pi pi-graduation-cap mr-2"></i>
                        <span class="font-normal text-lg">Cronograma</span>
                      </router-link>
                    </li>
                    <li v-if="authStore.canView('PeriodoSemanal')">
                      <router-link to="/PeriodoSemanal" draggable="false" v-ripple
                        :class="getLinkClass('/PeriodoSemanal')">
                        <i class="pi pi-calendar-times mr-2"></i>
                        <span class="font-normal text-lg">Periodo Semanal</span>
                      </router-link>
                    </li>
                  </ul>
                </li>

                <!-- GESTIÓN DE ESTUDIANTES -->
                <li
                  v-if="authStore.canView('IngresoEstudiantesExcel') || authStore.canView('IngresoManualEstudiantes') || authStore.canView('ListadoEstudiantes') || authStore.canView('AsignacionPeriodo') || authStore.canView('RemoverPeriodo') || authStore.canView('IngresoArea')">
                  <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
                    <i class="pi pi-users mr-2"></i>
                    <span class="font-medium text-lg">Gestión de Estudiantes</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li v-if="authStore.canView('IngresoEstudiantesExcel')">
                      <router-link to="/IngresoEstudiantesExcel" draggable="false" v-ripple
                        :class="getLinkClass('/IngresoEstudiantesExcel')">
                        <i class="pi pi-file-excel mr-2"></i>
                        <span class="font-normal text-lg">Ingreso por Archivo</span>
                      </router-link>
                    </li>
                    <li v-if="authStore.canView('IngresoManualEstudiantes')">
                      <router-link to="/IngresoManualEstudiantes" draggable="false" v-ripple
                        :class="getLinkClass('/IngresoManualEstudiantes')">
                        <i class="pi pi-user-edit mr-2"></i>
                        <span class="font-normal text-lg">Ingreso Manual</span>
                      </router-link>
                    </li>
                    <li v-if="authStore.canView('ListadoEstudiantes')">
                      <router-link to="/ListadoEstudiantes" draggable="false" v-ripple
                        :class="getLinkClass('/ListadoEstudiantes')">
                        <i class="pi pi-list mr-2"></i>
                        <span class="font-normal text-lg">Listado</span>
                      </router-link>
                    </li>
                    <li v-if="authStore.canView('AsignacionPeriodo')">
                      <router-link to="/AsignacionPeriodo" draggable="false" v-ripple
                        :class="getLinkClass('/AsignacionPeriodo')">
                        <i class="pi pi-address-book mr-2"></i>
                        <span class="font-normal text-lg">Asignar Periodo</span>
                      </router-link>
                    </li>
                    <li v-if="authStore.canView('RemoverPeriodo')">
                      <router-link to="/RemoverPeriodo" draggable="false" v-ripple
                        :class="getLinkClass('/RemoverPeriodo')">
                        <i class="pi pi-user-minus mr-2"></i>
                        <span class="font-normal text-lg">Quitar de Periodo</span>
                      </router-link>
                    </li>
                    <li v-if="authStore.canView('IngresoArea')">
                      <router-link to="/IngresoArea" draggable="false" v-ripple :class="getLinkClass('/IngresoArea')">
                        <i class="pi pi-building-columns mr-2"></i>
                        <span class="font-normal text-lg">Asignar Área</span>
                      </router-link>
                    </li>
                  </ul>
                </li>

                <!-- HORARIOS -->
                <li
                  v-if="authStore.canView('IngresoHorario') || authStore.canView('IngresoHorarioVirtual') || authStore.canView('VistaHorarios')">
                  <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
                    <i class="pi pi-clock mr-2"></i>
                    <span class="font-medium text-lg">Gestión de Horarios</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li v-if="authStore.canView('IngresoHorario')">
                      <router-link to="/IngresoHorario" draggable="false" v-ripple
                        :class="getLinkClass('/IngresoHorario')">
                        <i class="pi pi-calendar-plus mr-2"></i>
                        <span class="font-normal text-lg">Horario Presencial</span>
                      </router-link>
                    </li>
                    <li v-if="authStore.canView('IngresoHorarioVirtual')">
                      <router-link to="/IngresoHorarioVirtual" draggable="false" v-ripple
                        :class="getLinkClass('/IngresoHorarioVirtual')">
                        <i class="pi pi-video mr-2"></i>
                        <span class="font-normal text-lg">Horario Virtual</span>
                      </router-link>
                    </li>
                    <li v-if="authStore.canView('VistaHorarios')">
                      <router-link to="/VistaHorarios" draggable="false" v-ripple
                        :class="getLinkClass('/VistaHorarios')">
                        <i class="pi pi-eye mr-2"></i>
                        <span class="font-normal text-lg">Visualizar Horarios</span>
                      </router-link>
                    </li>
                  </ul>
                </li>

                <!-- BIOMETRÍA -->
                <li
                  v-if="authStore.canView('AsignacionHuella') || authStore.canView('RegistroHuella') || authStore.canView('RegistroPorCedula')">
                  <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
                    <i class="pi pi-qrcode mr-2"></i>
                    <span class="font-medium text-lg">Control Biométrico</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li v-if="authStore.canView('AsignacionHuella')">
                      <router-link to="/AsignacionHuella" draggable="false" v-ripple
                        :class="getLinkClass('/AsignacionHuella')">
                        <i class="pi pi-plus-circle mr-2"></i>
                        <span class="font-normal text-lg">Registro Biométrico</span>
                      </router-link>
                    </li>
                    <li v-if="authStore.canView('RegistroPorCedula')">
                      <router-link to="/RegistroPorCedula" draggable="false" v-ripple
                        :class="getLinkClass('/RegistroPorCedula')">
                        <i class="pi pi-clipboard mr-2"></i>
                        <span class="font-normal text-lg">Registro Por Huella</span>
                      </router-link>
                    </li>
                  </ul>
                </li>

                <li
                  v-if="authStore.canView('RegistroManual') || authStore.canView('ModificacionHoras') || authStore.canView('RegistrosAbiertos') || authStore.canView('RegistrosCerrados')">
                  <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
                    <i class="pi pi-calendar-clock mr-2"></i>
                    <span class="font-medium text-lg">Control Asistencia</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li v-if="authStore.canView('RegistroManual')">
                      <router-link to="/RegistroManual" draggable="false" v-ripple
                        :class="getLinkClass('/RegistroManual')">
                        <i class="pi pi-pencil mr-2"></i>
                        <span class="font-normal text-lg">Registro Manual</span>
                      </router-link>
                    </li>

                    <li v-if="authStore.canView('ModificacionHoras')">
                      <router-link to="/ModificacionHoras" draggable="false" v-ripple
                        :class="getLinkClass('/ModificacionHoras')">
                        <i class="pi pi-plus-circle mr-2"></i>
                        <span class="font-normal text-lg">Horas Extraordinarias</span>
                      </router-link>
                    </li>
                    <li v-if="authStore.canView('RegistrosAbiertos')">
                      <router-link to="/RegistrosAbiertos" draggable="false" v-ripple
                        :class="getLinkClass('/RegistrosAbiertos')">
                        <i class="pi pi-folder-open mr-2"></i>
                        <span class="font-normal text-lg">Registros Abiertos</span>
                      </router-link>
                    </li>
                    <li v-if="authStore.canView('RegistrosCerrados')">
                      <router-link to="/RegistrosCerrados" draggable="false" v-ripple
                        :class="getLinkClass('/RegistrosCerrados')">
                        <i class="pi pi-folder mr-2"></i>
                        <span class="font-normal text-lg">Registros Cerrados</span>
                      </router-link>
                    </li>
                  </ul>
                </li>

                <!-- Sección: Seguimiento -->
                <li v-if="authStore.canView('SeguimientoGeneral')">
                  <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                    class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
                    <i class="pi pi-book mr-2"></i>
                    <span class="font-medium text-lg">Seguimiento</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="submenu closed list-none p-0 m-0">
                    <li v-if="authStore.canView('SeguimientoGeneral')">
                      <router-link to="/SeguimientoGeneral" draggable="false" v-ripple
                        :class="getLinkClass('/SeguimientoGeneral')">
                        <i class="pi pi-compass mr-2"></i>
                        <span class="font-normal text-lg">Seguimiento de Horas</span>
                      </router-link>
                    </li>
                  </ul>
                </li>

              </ul>
            </li>
          </div>

          <!-- Gestión de Prácticas-->
          <div v-if="authStore.canView('VistaHorarioPersonal') || authStore.canView('ResumenSemanalEstudiante') || authStore.canView('AlertasView')" class="mt-4">
            <div class="text-sm font-bold text-surface-400 text-neutral-400 uppercase tracking-wider pl-4 mb-2">
              Gestión de Prácticas
            </div>
            <ul class="list-none p-0 m-0">
              <li v-if="authStore.canView('VistaHorariosPersonal')">
                <router-link to="/VistaHorariosPersonal" draggable="false" v-ripple
                  :class="getLinkClass('/VistaHorariosPersonal')">
                  <i class="pi pi-calendar-plus mr-2"></i>
                  <span class="font-normal text-lg"> Horario</span>
                </router-link>
              </li>

              <li v-if="authStore.canView('RegistroVirtual')">
                <router-link to="/RegistroVirtual" draggable="false" v-ripple :class="getLinkClass('/RegistroVirtual')">
                  <i class="pi pi-video mr-2"></i>
                  <span class="font-normal text-lg">Registro Virtual</span>
                </router-link>
              </li>
              <li v-if="authStore.canView('ResumenSemanalEstudiante')">
                <router-link to="/ResumenSemanalEstudiante" draggable="false" v-ripple
                  :class="getLinkClass('/ResumenSemanalEstudiante')">
                  <i class="pi pi-book mr-2"></i>
                  <span class="font-normal text-lg">Seguimiento de Horas</span>
                </router-link>
              </li>

              <!-- Sección: Alertas independiente un solo icono-->
              <li v-if="authStore.canView('AlertasView')">
                <router-link to="/AlertasView" draggable="false" v-ripple :class="getLinkClass('/AlertasView')">
                  <i class="pi pi-bell mr-2"></i>
                  <span class="font-normal text-lg">Alertas</span>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Sección: TRABAJO SOCIAL -->
          <div class="mt-4"
            v-if="canViewTrabajoSocialSection">
            <div class="text-sm font-bold text-surface-400 text-neutral-400 uppercase tracking-wider pl-4 mb-2">
              Trabajo Social
            </div>
            <ul class="list-none p-0 m-0">
              <!-- Sección: Trabajo Social -->
              <li>
                <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                  class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
                  <i class="pi pi-briefcase mr-2"> </i>
                  <span class="font-medium text-lg"> Trabajo Social </span>
                  <i class="pi pi-chevron-down ml-auto"> </i>
                </a>
                <ul class="submenu closed list-none p-0 m-0">
                  <li v-if="authStore.canView('SocialWorkCases')">
                    <router-link to="/TrabajoSocialCasos" draggable="false" v-ripple
                      :class="getLinkClass('/TrabajoSocialCasos')">
                      <i class="pi pi-folder-open mr-2"></i>
                      <span class="font-normal text-lg">Casos</span>
                    </router-link>
                  </li>
                  <li v-if="authStore.canView('SocialWorkSchedule')">
                    <router-link to="/TrabajoSocialHorario" draggable="false" v-ripple
                      :class="getLinkClass('/TrabajoSocialHorario')">
                      <i class="pi pi-calendar-clock mr-2"></i>
                      <span class="font-normal text-lg">Horario</span>
                    </router-link>
                  </li>
                  <li v-if="authStore.canView('SocialWorkNewCase')">
                    <router-link to="/NuevoCasoTrabajoSocial" draggable="false" v-ripple
                      :class="getLinkClass('/NuevoCasoTrabajoSocial')">
                      <i class="pi pi-folder-plus mr-2"></i>
                      <span class="font-normal text-lg">Nuevo Caso</span>
                    </router-link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </ul>

        <!-- Sección: ADMINISTRACION-->
        <ul v-if="canViewAdminSection" class="list-none p-4 m-0">
          <li>
            <div class="mt-4">
              <div class="text-sm font-bold text-surface-400 text-neutral-400 uppercase tracking-wider pl-4 mb-2">
                Administración del sistema
              </div>

              <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
                class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
                <i class="pi pi-cog mr-2"> </i>
                <span class="font-medium text-lg"> Configuración </span>
                <i class="pi pi-chevron-down ml-auto"> </i>
              </a>
              <ul class="submenu list-none p-0 m-0">
                <!-- Sección: Nuevo Usuario -->
                <li v-if="authStore.canView('UserView')">
                  <router-link to="/Usuarios" draggable="false" v-ripple :class="getLinkClass('/Usuarios')">
                    <i class="pi pi-id-card mr-2"></i>
                    <span class="font-normal text-lg">Gestión de Usuarios</span>
                  </router-link>
                </li>

                <!-- Sección: Gestión de Roles -->
                <li v-if="authStore.canView('RoleView')">
                  <router-link to="/Roles" draggable="false" v-ripple :class="getLinkClass('/Roles')">
                    <i class="pi pi-wrench mr-2"></i>
                    <span class="font-normal text-lg">Gestión de Roles</span>
                  </router-link>
                </li>

                <!-- Sección: Tabla de Parámetros -->
                <li v-if="authStore.canView('Parameter')">
                  <router-link to="/Parametros" draggable="false" v-ripple :class="getLinkClass('/Parametros')">
                    <i class="pi pi-box mr-2"></i>
                    <span class="font-normal text-lg">Gestión de Parámetros</span>
                  </router-link>
                </li>

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
            <button v-ripple
              class="relative overflow-hidden w-full md:w-60 border-0 bg-transparent flex items-start p-2 pl-4 hover:bg-surface-100 dark:hover:bg-surface-100 rounded-none cursor-pointer transition-colors duration-200"
              @click="toggle" aria-haspopup="true" aria-controls="overlay_menu">
              <Avatar :image="userAvatar" class="mr-3" shape="circle" size="large" />
              <span class="inline-flex flex-col items-start mt-1">
                <span class="font-semibold">
                  {{ authStore.user?.name }}
                </span>
                <span class="text-sm">
                  {{ authStore.user?.type }}
                </span>
              </span>
            </button>

            <Menu ref="menu" :model="items" class="select-none w-full md:w-30" :popup="true"
              style="caret-color: transparent">
              <template #item="{ item, props }">
                <a v-ripple class="flex items-center" v-bind="props.action">
                  <span :class="item.icon" />
                  <span>{{ item.label }}</span>
                  <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
                  <span v-if="item.shortcut"
                    class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{
                    item.shortcut }}</span>
                </a>
              </template>
            </Menu>
          </div>

          <!-- Botón de modo oscuro/claro -->
          <button type="button"
            class="flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 text-yellow-500 hover:bg-gray-700"
            @click="toggleDarkMode">
            <i :class="[
              'pi',
              { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme },
            ]"></i>
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

.p-avatar img {
  /* Asegura que la imagen dentro del avatar se muestre correctamente */
  object-fit: cover;
}
</style>