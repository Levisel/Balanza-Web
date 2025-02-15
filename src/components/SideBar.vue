<script setup lang="ts">
  import {
    useRoute
  }
  from "vue-router";
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
  
  const nuevoCasoClass = computed(() => [
    'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
    route.path === '/NuevoCaso' ? 'text-green-400' : '',
    isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  ]);

  const misCasosClass = computed(() => [
    'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
    route.path === '/MisCasos' ? 'text-green-400' : '',
    isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  ]);

  const reportesClass = computed(() => [
    'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
    route.path === '/ReportesCaso' ? 'text-green-400' : '',
    isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  ]);

  const notificacionesClass = computed(() => [
    'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
    route.path === '/Notificaciones' ? 'text-green-400' : '',
    isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  ]);

  const asignarCasosClass = computed(() => [
    'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
    route.path === '/AsignarCaso' ? 'text-green-400' : '',
    isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  ]);

  const configuracionClass = computed(() => [
    'select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors',
    route.path === '/Configuracion' ? 'text-green-400' : '',
    isDarkTheme.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  ]);
  
</script>

<template>
  <!-- Contenedor fijo para el sidebar -->
  <div class="select-none fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-10 sidebar">
    <div class="flex flex-col h-full">
      <!-- Encabezado con logo -->
      <header class="flex items-center justify-between px-6 pt-4 shrink-0">
        <span class="inline-flex items-center gap-2">
          <!-- Logo en SVG -->
          <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05ZM25.27 35.49L29.18 31.58V27.67L25.27 30.98V35.49ZM20.16 17.14H20.03H20.17H20.16ZM30.1 5.19L34.89 4.81L33.08 12.33L24.1 15.67L30.08 5.2L30.1 5.19ZM5.72 14.74L2.41 13.54V23.77L9.63 29.79V20.47L11.74 17.46L9.03 18.06L5.72 14.75V14.74ZM9.63 30.98L5.72 27.67V31.58L9.63 35.49V30.98ZM4.8 5.2L10.78 15.67L1.81 12.33L0 4.81L4.79 5.19L4.8 5.2ZM24.37 21.05V34.59L22.56 37.29L20.46 39.4H14.44L12.34 37.29L10.53 34.59V21.05L12.42 18.23L17.45 26.8L22.48 18.23L24.37 21.05ZM22.85 0L22.57 0.69L17.45 13.08L12.33 0.69L12.05 0H22.85Z"
            fill="var(--p-primary-color)" />
            <path d="M30.69 4.21L24.37 4.81L22.57 0.69L22.86 0H26.48L30.69 4.21ZM23.75 5.67L22.66 3.08L18.05 14.24V17.14H19.7H20.03H20.16H20.2L24.1 15.7L30.11 5.19L23.75 5.67ZM4.21002 4.21L10.53 4.81L12.33 0.69L12.05 0H8.43002L4.22002 4.21H4.21002ZM21.9 17.4L20.6 18.2H14.3L13 17.4L12.4 18.2L12.42 18.23L17.45 26.8L22.48 18.23L22.5 18.2L21.9 17.4ZM4.79002 5.19L10.8 15.7L14.7 17.14H14.74H15.2H16.85V14.24L12.24 3.09L11.15 5.68L4.79002 5.2V5.19Z"
            fill="var(--p-text-color)" />
          </svg>
          <span class="select-none font-semibold text-2xl text-primary text-center ml-2">
            Consultorios Jurídicos PUCE
          </span>
        </span>
      </header>
      <!-- Contenido de navegación -->
      <main class="flex-1 overflow-y-auto">
        <!-- Sección: FAVORITES -->
        <ul class="list-none p-4 m-0">
          <li>
            <router-link to="/" draggable="false" v-ripple :class="inicioClass">
              <i class="pi pi-home mr-2"></i>
              <span class="font-medium text-lg">Inicio</span>
            </router-link>
          </li>
          <li>
            <router-link to="/NuevoCaso" draggable="false" v-ripple :class="nuevoCasoClass">
              <i class="pi pi-plus-circle mr-2"></i>
              <span class="font-medium text-lg">Nuevo Caso</span>
            </router-link>
          </li>
          <li>
            <router-link to="/MisCasos" draggable="false" v-ripple :class="misCasosClass">
              <i class="pi pi-folder-open mr-2"></i>
              <span class="font-medium text-lg">Mis Casos</span>
            </router-link>
          </li>
          <li>
            <a v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
            class="select-none flex items-center cursor-pointer p-4 rounded text-surface-700 transition-colors">
              <i class="pi pi-chart-line mr-2">
              </i>
              <span class="font-medium text-lg">
                Reportes
              </span>
              <i class="pi pi-chevron-down ml-auto">
              </i>
            </a>
            <ul class="submenu list-none p-0 m-0">
              <li>
                <router-link to="/ReportesCaso" draggable="false" v-ripple :class="reportesClass">
                  <i class="pi pi-chart-bar mr-2"></i>
                  <span class="font-medium text-lg">Reportes</span>
                </router-link>
              </li>
            </ul>


          </li>
          <li>
            <router-link to="/Notificaciones" draggable="false" v-ripple :class="notificacionesClass">
              <i class="pi pi-comments mr-2"></i>
              <span class="font-medium text-lg">Notificaciones</span>
              <span class="inline-flex items-center justify-center ml-auto bg-blue-500 text-white rounded-full"
              style="min-width: 1.5rem; height: 1.5rem">3</span>
            </router-link>
          </li>
        </ul>
        <!-- Sección: APPLICATION -->
        <ul class="list-none p-4 m-0">
          <li>
            <div v-ripple v-styleclass="{ selector: '@next', toggleClass: 'closed' }"
            class="select-none p-4 flex items-center justify-between text-surface-500 cursor-pointer">
              <span class="font-medium">
                ADMINSTRACIÓN
              </span>
              <i class="pi pi-chevron-down" style="font-size: 1.2rem">
              </i>
            </div>
            <ul class="submenu list-none p-0 m-0">
              <li>
                <router-link to="/AsignarCaso" draggable="false" v-ripple :class="asignarCasosClass">
                  <i class="pi pi-users mr-2"></i>
                  <span class="font-medium text-lg">Asignar Casos</span>
                </router-link>
              </li>
              <li>
                <router-link to="/Configuracion" draggable="false" v-ripple :class="configuracionClass">
                <i class="pi pi-cog mr-2"></i>
                <span class="font-medium text-lg">Configuración</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </main>
      <!-- Pie de página con Avatar -->
      <footer class="mt-auto">
        <hr class="mb-4 mx-4 border-t border-surface-200" />
        <a v-ripple class="m-4 flex items-center cursor-pointer p-3 gap-2 rounded text-surface-700 hover:bg-surface-100 transition-colors">
          <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
          shape="circle" />
          <span class="select-none font-bold text-lg ml-2">
            Barbara Diaz
          </span>
          <!-- Icono de modo oscuro/claro -->
          <button
            type="button"
            class="ml-10 flex items-center justify-center w-10 h-10 
                  rounded-full transition-colors duration-300 
                  text-yellow-500 hover:yellow-500 hover:bg-gray-700"
            @click="toggleDarkMode"
          >
            <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
          </button>



        </a>
      </footer>
    </div>
  </div>
</template>

    
  <style scoped>
  /* Usamos transición para una animación suave similar a PrimeVue */
  .submenu {
    overflow: hidden;
    transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 500px; /* Valor máximo cuando está abierto; ajusta según el contenido */
    opacity: 1;
  }
  .submenu.closed {
    max-height: 0;
    opacity: 0;
  }
  i{
    font-size: 1.4rem;
  }
  .pi-chevron-down{
    font-size: 1.2rem;
  }
  
 
  </style>
  