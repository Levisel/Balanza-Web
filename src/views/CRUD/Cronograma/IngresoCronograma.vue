<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <!-- Cabecera con flecha de regreso y título -->
    <div class="flex items-center w-full max-w-3xl mb-10">
      <!-- Flecha de regreso con hover -->
      <span
        class="cursor-pointer mr-4 transition-colors duration-300"
        @click="volverListado"
        title="Volver al listado"
        :class="{
          'text-blue-500 hover:text-blue-700': !isDarkTheme,
          'text-blue-300 hover:text-blue-500': isDarkTheme
        }"
      >
        <i class="pi pi-arrow-left text-3xl"></i>
      </span>
      <h1 class="text-3xl font-bold text-center flex-1">
        {{ periodoId ? "Editar Período Académico" : "Agregar Período Académico" }}
      </h1>
    </div>

    <!-- Contenedor del formulario -->
    <div :class="['w-full max-w-3xl p-8 rounded-lg shadow-lg', cardClass]">
      <h2 class="text-xl font-semibold text-center mb-6">Información del Período</h2>

      <!-- Mensaje de error -->
      <Message v-if="errorMensaje" severity="error" class="mb-4">
        {{ errorMensaje }}
      </Message>

      <!-- Formulario -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Nombre del Período -->
        <div class="flex flex-col sm:col-span-2">
          <label for="nombrePeriodo" class="mb-2 text-lg font-medium">
            Nombre del Período
          </label>
          <InputText
            v-model="nombrePeriodo"
            maxlength="35"
            placeholder="Ej: Período Académico 2024-02"
            class="w-full p-3 rounded-lg"
            :class="inputClass"
          />
        </div>
        <!-- Fecha de Inicio -->
        <div class="flex flex-col">
          <label for="fechaInicio" class="mb-2 text-lg font-medium">
            Fecha de Inicio
          </label>
          <Calendar
            v-model="fechaInicio"
            showIcon
            class="w-full"
            :class="inputClass"
          />
        </div>
        <!-- Fecha de Fin -->
        <div class="flex flex-col">
          <label for="fechaFin" class="mb-2 text-lg font-medium">
            Fecha de Fin
          </label>
          <Calendar
            v-model="fechaFin"
            showIcon
            class="w-full"
            :class="inputClass"
          />
        </div>
        <!-- Tipo de Período -->
        <div class="flex flex-col sm:col-span-2">
          <label for="periodoTipo" class="mb-2 text-lg font-medium">
            Tipo de Período
          </label>
          <Dropdown
            v-model="periodoTipo"
            :options="opcionesPeriodoTipo"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione el tipo de período"
            class="w-80 p-3 rounded-lg"
            :class="inputClass"
          />
        </div>
      </div>

      <!-- Botones -->
      <div class="flex justify-center mt-8 gap-4">
        <Button
          :label="periodoId ? 'Guardar Cambios' : 'Crear Período'"
          icon="pi pi-check"
          iconPos="right"
          :class="['px-6 py-3 rounded-full text-white text-lg', buttonClass]"
          :disabled="cargando"
          @click="validarYGuardar"
        />
        <Button
          label="Cancelar"
          icon="pi pi-times"
          severity="danger"
          class="px-6 py-3 rounded-full"
          @click="volverListado"
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import InputText from "primevue/inputtext";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import Message from "primevue/message";
import Dropdown from "primevue/dropdown";
import { useDarkMode } from "@/components/ThemeSwitcher";
import { API, type Periodo } from "@/views/Interfaces";
import { useToast } from "primevue/usetoast";

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { isDarkTheme } = useDarkMode();

// Obtener el ID del período (si se edita)
const periodoId = route.params.id ? Number(route.params.id) : null;

// Estados del formulario
const nombrePeriodo = ref("");
const fechaInicio = ref<Date | null>(null);
const fechaFin = ref<Date | null>(null);
const periodoTipo = ref<string>(""); // Nuevo campo para el tipo de período
const errorMensaje = ref("");
const cargando = ref(false);

// Opciones para el Dropdown de tipo de período
const opcionesPeriodoTipo = ref([
  { label: "Ordinario", value: "Ordinario" },
  { label: "Extraordinario", value: "Extraordinario" },
]);

// Clases dinámicas para Dark Mode
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
  isDarkTheme.value
    ? "bg-orange-500 hover:bg-orange-600"
    : "bg-orange-400 hover:bg-orange-500"
);

// Función para cargar datos del período (en edición)
const cargarPeriodo = async () => {
  if (!periodoId) return;
  cargando.value = true;
  try {
    const response = await fetch(`${API}/periodos/${periodoId}`);
    if (!response.ok) throw new Error("Error al obtener el período");
    const data: Periodo = await response.json();
    nombrePeriodo.value = data.PeriodoNombre;
    fechaInicio.value = new Date(data.Periodo_Inicio);
    fechaFin.value = new Date(data.Periodo_Fin);
    periodoTipo.value = data.PeriodoTipo;
  } catch (error) {
    console.error("Error al cargar el período:", error);
    errorMensaje.value = "Error al cargar los datos del período.";
  } finally {
    cargando.value = false;
  }
};

// Función para validar y guardar (crear o editar)
const validarYGuardar = async () => {
  errorMensaje.value = "";
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
  if (!periodoTipo.value) {
    errorMensaje.value = "Debe seleccionar el tipo de período.";
    return;
  }
  cargando.value = true;
  const periodoData = {
    PeriodoNombre: nombrePeriodo.value.trim(),
    Periodo_Inicio: fechaInicio.value.toISOString(),
    Periodo_Fin: fechaFin.value.toISOString(),
    PeriodoTipo: periodoTipo.value,
  };
  try {
    const method = periodoId ? "PUT" : "POST";
    const endpoint = periodoId ? `${API}/periodos/${periodoId}` : `${API}/periodos`;
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(periodoData),
    });
    if (!response.ok) throw new Error("Error al guardar los datos");
    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: "Período guardado correctamente.",
      life: 3000,
    });
    router.push("/Cronograma");
  } catch (error) {
    console.error("Error guardando el período:", error);
    errorMensaje.value = "Ocurrió un error al guardar.";
  } finally {
    cargando.value = false;
  }
};

// Función para volver al listado de períodos
const volverListado = () => {
  router.push("/Cronograma");
};

onMounted(() => {
  if (periodoId) {
    cargarPeriodo();
  }
});
</script>

<style scoped>
/* Ejemplo de estilos para la flecha con hover y dark mode */
.cursor-pointer {
  transition: color 0.3s ease;
}
</style>
