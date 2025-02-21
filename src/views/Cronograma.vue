<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { useDarkMode } from "@/components/ThemeSwitcher"; // Importamos el modo oscuro

const router = useRouter(); // Para la redirección

// Estado del Dark Mode
const { isDarkTheme } = useDarkMode();

// Lista de períodos académicos (8 elementos de prueba)
const periodos = ref([
  { id: 1, nombre: "Periodo Académico 2024-01" },
  { id: 2, nombre: "Periodo Académico 2024-02" },
  { id: 3, nombre: "Periodo Académico 2024-03" },
  { id: 4, nombre: "Periodo Académico 2024-04" },
  { id: 5, nombre: "Periodo Académico 2024-05" },
  { id: 6, nombre: "Periodo Académico 2024-06" },
  { id: 7, nombre: "Periodo Académico 2024-07" },
  { id: 8, nombre: "Periodo Académico 2024-08" }
]);

// Periodo seleccionado en el dropdown
const periodoSeleccionado = ref(null);

// Función para redirigir al formulario de ingreso de cronograma
const irAIngresoCronograma = () => {
  router.push("IngresoCronograma");
};

// Clases dinámicas para el dark mode
const cardClass = computed(() =>
  isDarkTheme.value
    ? "bg-gray-800 text-white shadow-lg hover:bg-gray-700"
    : "bg-white text-gray-900 shadow-lg hover:bg-gray-100"
);

const iconClass = computed(() =>
  isDarkTheme.value ? "text-gray-300 text-6xl" : "text-gray-700 text-6xl"
);

const buttonClass = computed(() =>
  isDarkTheme.value ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
);
</script>

<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <!-- Título -->
    <h1 class="text-3xl font-bold text-center mb-10">Calendario Académico</h1>

    <!-- Dropdown de selección de periodo con el botón más cerca -->
    <div class="flex items-center w-full max-w-6xl mb-12 space-x-2">
      <div class="flex-grow">
        <span class="block text-lg font-medium">Período Académico</span>
        <Dropdown v-model="periodoSeleccionado" :options="periodos" optionLabel="nombre" 
          placeholder="Seleccione un periodo" class="w-72" />
      </div>

      <!-- Botón de agregar (más cerca y totalmente redondo) -->
      <Button @click="irAIngresoCronograma"
        :class="['w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg transition duration-300', buttonClass]"
        icon="pi pi-plus" />
    </div>

    <!-- Contenedor de Cards con grid responsivo y sin sobreposición -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl mt-6">
      <Card v-for="(periodo, index) in periodos" :key="index"
        :class="['w-full min-w-[200px] h-72 flex flex-col items-center justify-center rounded-lg transition-transform transform hover:scale-105', cardClass]">
        <template #content>
          <div class="flex flex-col items-center">
            <i class="pi pi-calendar mb-4"  style="font-size: 3rem" :class="iconClass" ></i>
            <p class="text-center text-lg font-semibold">{{ periodo.nombre }}</p>
          </div>
        </template>
      </Card>
    </div>
  </main>
</template>
