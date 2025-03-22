<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from 'vue';
import Avatar from "primevue/avatar";
import { useDarkMode } from '@/components/ThemeSwitcher';

const { isDarkTheme, toggleDarkMode } = useDarkMode();
const route = useRoute();

const inicioClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  route.path === '/' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);

const cronogramaClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  // Actualizado para coincidir con la ruta del router-link
  route.path === '/Cronograma' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);

const ingresoEstudiantesExcelClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  route.path === '/IngresoEstudiantesExcel' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);

const ingresoManualEstudiantesClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  route.path === '/IngresoManualEstudiantes' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);

const listadoEstudiantesClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  route.path === '/ListadoEstudiantes' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);

const asignacionPeriodoClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  route.path === '/AsignacionPeriodo' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);

const removerPeriodoClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  route.path === '/RemoverPeriodo' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);

const ingresoAreaClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  route.path === '/IngresoArea' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);

const ingresoHorarioClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  route.path === '/IngresoHorario' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);

const ingresoHorarioVirtualClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  route.path === '/IngresoHorarioVirtual' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);

const vistaHorariosClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  route.path === '/VistaHorarios' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);

const asignacionHuellaClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  route.path === '/AsignacionHuella' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);

const registroAsistenciaClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  route.path === '/RegistroAsistencia' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);

const notificacionesClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  route.path === '/Notificaciones' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);

const reportesClass = computed(() => [
  'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
  route.path === '/ReportesCaso' ? 'text-green-400' : '',
  isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
]);
</script>

<template>
  <div class="select-none fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-10 sidebar">
    <div class="flex flex-col h-full">
      <header class="flex items-center justify-between px-6 pt-4 shrink-0">
        <span class="inline-flex items-center gap-2">
          <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05Z"
              fill="var(--p-primary-color)" />
          </svg>
          <span class="select-none font-semibold text-2xl text-primary text-center ml-2">
            Consultorios Jurídicos PUCE
          </span>
        </span>
      </header>

      <main class="flex-1 overflow-y-auto">
        <ul class="list-none p-4 m-0">
          <li>
            <router-link to="/" draggable="false" v-ripple :class="inicioClass">
              <i class="pi pi-home mr-2"></i>
              <span class="font-medium text-lg">Inicio</span>
            </router-link>
          </li>

          <li>
            <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
              class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
              <i class="pi pi-users mr-2"></i>
              <span class="font-medium text-lg">Administración de Periodos</span>
              <i class="pi pi-chevron-down ml-auto"></i>
            </a>
            <ul class="submenu list-none p-0 m-0">
              <li>
                <router-link to="/Cronograma" draggable="false" v-ripple :class="cronogramaClass">
                  <i class="pi pi-graduation-cap mr-2"></i>
                  <span class="font-medium text-lg">Cronograma Académico</span>
                </router-link>
              </li>
            </ul>
          </li>

          <!-- 🔹 Sección Estudiantes con Submenú -->
          <li>
            <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
              class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
              <i class="pi pi-users mr-2"></i>
              <span class="font-medium text-lg">Administración Estudiantes</span>
              <i class="pi pi-chevron-down ml-auto"></i>
            </a>
            <ul class="submenu list-none p-0 m-0">
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
                  <i class="pi pi-list-check mr-2"></i>
                  <span class="font-medium text-lg">Asignar Periodo</span>
                </router-link>
              </li>
              <li>
                <router-link to="/RemoverPeriodo" draggable="false" v-ripple :class="removerPeriodoClass">
                  <i class="pi pi-list-check mr-2"></i>
                  <span class="font-medium text-lg">Quitar de Periodo</span>
                </router-link>
              </li>
              <li>
                <router-link to="/IngresoArea" draggable="false" v-ripple :class="ingresoAreaClass">
                  <i class="pi pi-flag mr-2"></i>
                  <span class="font-medium text-lg">Asignar Area</span>
                </router-link>
              </li>
            </ul>
          </li>

          <!-- 🔹 Sección Horarios con Submenú -->
          <li>
            <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
              class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
              <i class="pi pi-users mr-2"></i>
              <span class="font-medium text-lg">Administración de Horarios</span>
              <i class="pi pi-chevron-down ml-auto"></i>
            </a>
            <ul class="submenu list-none p-0 m-0">
              <li>
                <router-link to="/IngresoHorario" draggable="false" v-ripple :class="ingresoHorarioClass">
                  <i class="pi pi-user-edit mr-2"></i>
                  <span class="font-medium text-lg">Ingresar Horario Presencial</span>
                </router-link>
              </li>
              <li>
                <router-link to="/IngresoHorarioVirtual" draggable="false" v-ripple :class="ingresoHorarioVirtualClass">
                  <i class="pi pi-user-edit mr-2"></i>
                  <span class="font-medium text-lg">Ingresar Horario Virtual</span>
                </router-link>
              </li>
              <li>
                <router-link to="/VistaHorarios" draggable="false" v-ripple :class="vistaHorariosClass">
                  <i class="pi pi-flag mr-2"></i>
                  <span class="font-medium text-lg">Ver Horarios</span>
                </router-link>
              </li>
            </ul>
          </li>

          <!-- 🔹 Sección Biométrica con Submenú -->
          <li>
            <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
              class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
              <i class="pi pi-bullseye mr-2"></i>
              <span class="font-medium text-lg">Administración Biométrica</span>
              <i class="pi pi-chevron-down ml-auto"></i>
            </a>
            <ul class="submenu list-none p-0 m-0">
              <li>
                <router-link to="/AsignacionHuella" draggable="false" v-ripple :class="asignacionHuellaClass">
                  <i class="pi pi-flag mr-2"></i>
                  <span class="font-medium text-lg">Registro Biométrico</span>
                </router-link>
              </li>
              <li>
                <router-link to="/RegistroAsistencia" draggable="false" v-ripple :class="registroAsistenciaClass">
                  <i class="pi pi-flag mr-2"></i>
                  <span class="font-medium text-lg">RegistroAsistencia</span>
                </router-link>
              </li>
            </ul>
          </li>

          <li>
            <router-link to="/Notificaciones" draggable="false" v-ripple :class="notificacionesClass">
              <i class="pi pi-bell mr-2"></i>
              <span class="font-medium text-lg">Notificaciones</span>
            </router-link>
          </li>

          <!-- 🔹 Sección Reportes (Como Estaba Antes) -->
          <li>
            <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
              class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
              <i class="pi pi-chart-line mr-2"></i>
              <span class="font-medium text-lg">Reportes</span>
              <i class="pi pi-chevron-down ml-auto"></i>
            </a>
            <ul class="submenu list-none p-0 m-0">
              <li>
                <router-link to="/ReportesCaso" draggable="false" v-ripple :class="reportesClass">
                  <i class="pi pi-chart-bar mr-2"></i>
                  <span class="font-medium text-lg">Reportes SubMenu</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </main>

      <footer class="mt-auto">
        <hr class="mb-4 mx-4 border-t border-surface-200" />
        <a v-ripple class="m-4 flex items-center cursor-pointer p-3 gap-2 rounded text-surface-700 hover:bg-surface-100 transition-colors">
          <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle" />
          <span class="select-none font-bold text-lg ml-2">Cristobal Soria</span>
          <button type="button" class="ml-10 flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 text-yellow-500 hover:yellow-500 hover:bg-gray-700"
            @click="toggleDarkMode">
            <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
          </button>
        </a>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.submenu {
  overflow: hidden;
  transition: max-height 0.5s ease, opacity 0.5s ease;
  max-height: 500px;
  opacity: 1;
}
.submenu.closed {
  max-height: 0;
  opacity: 0;
}
</style>
