<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import Message from "primevue/message";
import { useDarkMode } from "@/components/ThemeSwitcher"; // Importamos el modo oscuro

const router = useRouter(); // Para la redirección

// Estado del Dark Mode
const { isDarkTheme } = useDarkMode();

// Variables del formulario
const nombrePeriodo = ref(""); // Input para el nombre del período
const fechaInicio = ref(null);
const fechaFin = ref(null);
const errorMensaje = ref(""); // Mensaje de error

// Clases dinámicas para el dark mode
const cardClass = computed(() =>
  isDarkTheme.value
    ? "bg-gray-800 text-white shadow-lg"
    : "bg-white text-gray-900 shadow-lg"
);

const inputClass = computed(() =>
  isDarkTheme.value
    ? "bg-gray-900 text-white border-gray-700 focus:border-blue-500"
    : "bg-white text-gray-900 border-gray-300 focus:border-blue-500"
);

const buttonClass = computed(() =>
  isDarkTheme.value ? "bg-orange-500 hover:bg-orange-600" : "bg-orange-400 hover:bg-orange-500"
);

// Función para validar antes de guardar
const validarYGuardar = () => {
  errorMensaje.value = ""; // Resetear errores

  if (!nombrePeriodo.value.trim()) {
    errorMensaje.value = "Debe ingresar el nombre del período.";
    return;
  }

  if (!fechaInicio.value) {
    errorMensaje.value = "Debe seleccionar una fecha de inicio.";
    return;
  }

  if (!fechaFin.value) {
    errorMensaje.value = "Debe seleccionar una fecha de fin.";
    return;
  }

  if (fechaFin.value < fechaInicio.value) {
    errorMensaje.value = "La fecha de fin no puede ser antes de la fecha de inicio.";
    return;
  }

  // Si todo está correcto, guardar y redirigir
  console.log({
    nombrePeriodo: nombrePeriodo.value.trim(),
    fechaInicio: fechaInicio.value,
    fechaFin: fechaFin.value
  });
  router.push("/Cronograma"); // Redirige de vuelta al cronograma
};
</script>

<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <!-- Título -->
    <h1 class="text-3xl font-bold text-center mb-10">Calendario Académico</h1>

    <!-- Contenedor del formulario -->
    <div :class="['w-full max-w-3xl p-8 rounded-lg shadow-lg', cardClass]">
      <h2 class="text-xl font-semibold text-center mb-6">Información del Período</h2>

      <!-- Mensaje de error -->
      <Message v-if="errorMensaje" severity="error" class="mb-4">{{ errorMensaje }}</Message>

      <!-- Formulario -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Nombre del Período (Texto en lugar de Dropdown) -->
        <div class="flex flex-col sm:col-span-2">
          <label for="nombrePeriodo" class="mb-2 text-lg font-medium">Nombre del Período</label>
          <InputText v-model="nombrePeriodo" maxlength="35" placeholder="Ej: Periodo Académico 2024-02"
            class="w-full p-3 rounded-lg" :class="inputClass" />
        </div>

        <!-- Fecha de Inicio -->
        <div class="flex flex-col">
          <label for="fechaInicio" class="mb-2 text-lg font-medium">Fecha de Inicio</label>
          <Calendar v-model="fechaInicio" showIcon class="w-full" :class="inputClass" />
        </div>

        <!-- Fecha de Fin -->
        <div class="flex flex-col">
          <label for="fechaFin" class="mb-2 text-lg font-medium">Fecha de Fin</label>
          <Calendar v-model="fechaFin" showIcon class="w-full" :class="inputClass" />
        </div>
      </div>

      <!-- Botón de Guardar -->
      <div class="flex justify-center mt-8">
        <Button label="Guardar" icon="pi pi-check" iconPos="right" :class="['px-6 py-3 rounded-full text-white text-lg', buttonClass]"
          @click="validarYGuardar" />
      </div>
    </div>
  </main>
</template>
