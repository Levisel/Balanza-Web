<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <h1 class="text-3xl font-bold text-center mb-6">Asignar Estudiantes a Período</h1>
    <Toast />

    <!-- Filtros y búsqueda (fila superior) -->
    <div class="flex flex-wrap gap-4 mb-4 items-center justify-center">
      <!-- Dropdown: Período Origen (filtro) -->
      <Dropdown
        v-model="periodoOrigen"
        :options="periodos"
        optionLabel="Period_Name"
        placeholder="Filtrar por Período Origen (para extender)"
        class="w-72"
      />
      <!-- Inputs de búsqueda -->
      <InputText
        v-model="busquedaNombre"
        placeholder="Buscar por Nombre y Apellido"
        class="w-72 p-inputtext-lg"
      />
      <InputText
        v-model="busquedaCedula"
        placeholder="Buscar por Cédula"
        class="w-60 p-inputtext-lg"
      />
      <Dropdown
  v-model="areaSeleccionada"
  :options="opcionesAreas"
  optionLabel="label"
  optionValue="label" 
  placeholder="Filtrar por Área"
  class="w-60"
/>


      <!-- Botón para limpiar filtros -->
      <Button
        label="Limpiar Filtros"
        icon="pi pi-filter-slash"
        class="p-button-outlined p-button-secondary"
        @click="limpiarFiltros"
      />
    </div>

    <!-- Sección para seleccionar el Período Destino -->
    <div class="w-full max-w-6xl mb-6 flex flex-col items-center">
      <p class="text-lg font-semibold mb-2">
        Seleccione el Período a asignar/extender
      </p>

<Dropdown
  v-model="periodoDestino"
  :options="periodos"
  optionLabel="Period_Name" 
  placeholder="Seleccionar Período Destino"
  class="w-72"
/>

    </div>

    <!-- Si hay estudiantes seleccionados, muestra la cantidad -->
    <div v-if="estudiantesSeleccionados.length > 0" class="mb-4 text-lg font-semibold">
      {{ estudiantesSeleccionados.length }} estudiantes seleccionados
    </div>

    <!-- Botón para asignar/extender -->
    <div class="mb-6">
      <Button
        v-if="estudiantesSeleccionados.length > 0 && periodoDestino"
        :label="periodoOrigen ? 'Extender al Período' : 'Asignar al Período'"
        :class="periodoOrigen ? 'p-button-info' : 'p-button-success'"
        icon="pi pi-check"
        @click="mostrarConfirmacionAsignar"
      />
    </div>

    <!-- Tabla de estudiantes -->
    <DataTable
      :value="estudiantesFiltrados"
      v-model:selection="estudiantesSeleccionados"
      paginator
      :rows="10"
      class="w-full max-w-6xl shadow-lg"
      removableSort
    >
      <Column selectionMode="multiple" headerStyle="width: 3rem" />
      <Column field="Internal_ID" header="Cédula" sortable />
      <Column field="Internal_Name" header="Nombres" sortable />
      <Column field="Internal_LastName" header="Apellidos" sortable />
      <Column field="Internal_Email" header="Correo Institucional" sortable />
      <Column field="Internal_Area" header="Área" sortable />
    </DataTable>

    <!-- Diálogo Confirmar Asignación -->
    <Dialog
      v-model:visible="dialogoAsignarVisible"
      header="Confirmar Asignación"
      :modal="true"
    >
      <p>
        ¿Está seguro de
        {{ periodoOrigen ? 'extender' : 'asignar' }}
        los estudiantes al período
        <strong>{{ periodoDestino?.Period_Name }}</strong>

      </p>
      <template #footer>
        <Button
          label="Cancelar"
          icon="pi pi-times"
          class="p-button-danger"
          @click="dialogoAsignarVisible = false"
        />
        <Button
          label="Confirmar"
          icon="pi pi-check"
          class="p-button-success"
          @click="asignarEstudiantes"
        />
      </template>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { API, type Usuario, type Period } from "@/ApiRoute";
import { useSubjects } from "@/useSubjects";
import axios from "axios";

// Importamos componentes PrimeVue
import Toast from "primevue/toast";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "@/stores/auth";

const toast = useToast();
const authStore = useAuthStore();

// Estados
const estudiantes = ref<Usuario[]>([]);
const asignacionesOrigen = ref<string[]>([]);  // Internal_IDs asignados en el período de origen
const asignacionesDestino = ref<string[]>([]); // Internal_IDs asignados en el período destino
const estudiantesSeleccionados = ref<Usuario[]>([]);
const periodos = ref<Period[]>([]);
const periodoOrigen = ref<Period | null>(null);
const periodoDestino = ref<Period | null>(null);
const busquedaNombre = ref("");
const busquedaCedula = ref("");
const dialogoAsignarVisible = ref(false);

const { subjects: opcionesAreas } = useSubjects();
const areaSeleccionada = ref<string | null>(null);


// Función para cargar períodos (GET /periodos)
async function fetchPeriodos() {
  try {
    const { data } = await axios.get(`${API}/periodos`);
    periodos.value = data;
  } catch (error: any) {
    console.error("Error al cargar períodos:", error);
  }
}


// Función para cargar todos los usuarios internos (GET /usuarioInterno/estudiantes)
async function fetchEstudiantes() {
  try {
    const { data } = await axios.get(`${API}/usuarioInterno/estudiantes`);
    estudiantes.value = data;
  } catch (error: any) {
    console.error("Error al cargar estudiantes:", error);
  }
}


// Función para cargar asignaciones de un período (GET /usuarioxPeriodo/periodo/:periodoId)
async function fetchAsignaciones(periodId: number, destino = false) {
  try {
    const { data } = await axios.get(`${API}/usuarioxPeriodo/periodo/${periodId}`);
    const ids = data.map((rel: any) => rel.user.Internal_ID);
    if (destino) {
      asignacionesDestino.value = ids;
    } else {
      asignacionesOrigen.value = ids;
    }
  } catch (error) {
    console.error("Error al cargar asignaciones:", error);
    if (destino) {
      asignacionesDestino.value = [];
    } else {
      asignacionesOrigen.value = [];
    }
  }
}


// Watch: Cuando cambia el período origen, se cargan sus asignaciones
watch(periodoOrigen, async (nuevo) => {
  if (nuevo) {
    await fetchAsignaciones(nuevo.Period_ID
, false);
  } else {
    asignacionesOrigen.value = [];
  }
});

// Watch: Cuando cambia el período destino, se cargan sus asignaciones
watch(periodoDestino, async (nuevo) => {
  if (nuevo) {
    await fetchAsignaciones(nuevo.Period_ID
, true);
  } else {
    asignacionesDestino.value = [];
  }
});

const estudiantesFiltrados = computed(() => {
  return estudiantes.value.filter((est) => {
    const nombreCompleto = `${est.Internal_Name} ${est.Internal_LastName}`.toLowerCase();
    const coincideNombre = nombreCompleto.includes(busquedaNombre.value.toLowerCase());
    const coincideCedula = est.Internal_ID.includes(busquedaCedula.value);
    const coincideArea = areaSeleccionada.value
      ? est.Internal_Area === areaSeleccionada.value
      : true;

    if (!coincideNombre || !coincideCedula || !coincideArea) return false;

    if (periodoOrigen.value) {
      return asignacionesOrigen.value.includes(est.Internal_ID);
    }
    return true;
  });
});




// Función para limpiar filtros
function limpiarFiltros() {
  periodoOrigen.value = null;
  periodoDestino.value = null;
  busquedaNombre.value = "";
  busquedaCedula.value = "";
  areaSeleccionada.value = null;
  estudiantesSeleccionados.value = [];
}


// Función para mostrar confirmación de asignación
function mostrarConfirmacionAsignar() {
  if (!periodoDestino.value) {
    toast.add({
      severity: "warn",
      summary: "Atención",
      detail: "Debe seleccionar un período destino",
      life: 3000,
    });
    return;
  }
  dialogoAsignarVisible.value = true;
}

// Función para asignar los estudiantes seleccionados al período destino
async function asignarEstudiantes() {
  dialogoAsignarVisible.value = false;

  const nuevos = estudiantesSeleccionados.value.filter(
    (est) => !asignacionesDestino.value.includes(est.Internal_ID)
  );

  if (nuevos.length === 0) {
    toast.add({
      severity: "warn",
      summary: "Atención",
      detail: "Todos los estudiantes seleccionados ya están en el período destino",
      life: 4000,
    });
    return;
  }

  const payload = nuevos.map((est) => ({
    Internal_ID: est.Internal_ID,
    Period_ID: periodoDestino.value?.Period_ID,
  }));

  try {
    await axios.post(`${API}/usuarioxPeriodo`, payload, 
      {
        headers: {
          "internal-id": authStore.user?.id,
        },
      }
    );
    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: "Estudiantes asignados correctamente",
      life: 3000,
    });
    estudiantesSeleccionados.value = [];
    if (periodoDestino.value) {
      await fetchAsignaciones(periodoDestino.value.Period_ID, true);
    }
  } catch (error) {
    console.error("Error al asignar estudiantes:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo asignar estudiantes al período",
      life: 3000,
    });
  }
}


// Cargar períodos y estudiantes al montar
onMounted(() => {
  fetchPeriodos();
  fetchEstudiantes();
});
</script>

<style scoped>
/* Estilos personalizados sin fondos agresivos */
</style>
