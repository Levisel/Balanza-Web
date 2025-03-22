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
        optionLabel="PeriodoNombre"
        placeholder="Filtrar por Período Origen"
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
        Seleccione el Período a asignar
      </p>
      <Dropdown
        v-model="periodoDestino"
        :options="periodos"
        optionLabel="PeriodoNombre"
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
      <Column field="Usuario_Cedula" header="Cédula" sortable />
      <Column field="Usuario_Nombres" header="Nombres" sortable />
      <Column field="Usuario_Apellidos" header="Apellidos" sortable />
      <Column field="Usuario_Correo" header="Correo Institucional" sortable />
      <Column field="Usuario_Area" header="Área" sortable />
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
        <strong>{{ periodoDestino?.PeriodoNombre }}</strong>?
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
import { API, type Usuario, type Periodo } from "@/views/Interfaces";

// Importamos componentes PrimeVue
import Toast from "primevue/toast";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Message from "primevue/message";
import Dialog from "primevue/dialog";
import { useToast } from "primevue/usetoast";

const toast = useToast();

// Estados
const estudiantes = ref<Usuario[]>([]);
const asignaciones = ref<string[]>([]); // Cédulas ya asignadas al período de origen
const estudiantesSeleccionados = ref<Usuario[]>([]);
const periodos = ref<Periodo[]>([]);
const periodoOrigen = ref<Periodo | null>(null);
const periodoDestino = ref<Periodo | null>(null);
const busquedaNombre = ref("");
const busquedaCedula = ref("");
const errorMensaje = ref("");
const dialogoAsignarVisible = ref(false);

// Función para cargar períodos (GET /periodos)
async function fetchPeriodos() {
  try {
    const res = await fetch(`${API}/periodos`);
    periodos.value = await res.json();
  } catch (error) {
    console.error("Error al cargar períodos:", error);
  }
}

// Función para cargar todos los usuarios (GET /usuarios)
async function fetchEstudiantes() {
  try {
    const res = await fetch(`${API}/usuarios`);
    estudiantes.value = await res.json();
  } catch (error) {
    console.error("Error al cargar estudiantes:", error);
  }
}

// Función para cargar asignaciones del período origen (GET /usuarioxPeriodo/periodo/:periodoId)
async function fetchAsignaciones(periodoId: number) {
  try {
    const res = await fetch(`${API}/usuarioxPeriodo/periodo/${periodoId}`);
    const data = await res.json();
    // Extraemos sólo las cédulas de los usuarios asignados
    asignaciones.value = data.map((rel: any) => rel.usuario.Usuario_Cedula);
  } catch (error) {
    console.error("Error al cargar asignaciones:", error);
    asignaciones.value = [];
  }
}

// Computed para filtrar estudiantes según búsqueda y (si hay) asignación al período origen
const estudiantesFiltrados = computed(() => {
  return estudiantes.value.filter((est) => {
    const pertenecePeriodo =
      !periodoOrigen.value || asignaciones.value.includes(est.Usuario_Cedula);
    const nombreCompleto = `${est.Usuario_Nombres} ${est.Usuario_Apellidos}`.toLowerCase();
    const coincideNombre = nombreCompleto.includes(busquedaNombre.value.toLowerCase());
    const coincideCedula = est.Usuario_Cedula.includes(busquedaCedula.value);
    return pertenecePeriodo && coincideNombre && coincideCedula;
  });
});

// Watch: Cuando cambia el período origen, se cargan las asignaciones
watch(periodoOrigen, async (nuevo) => {
  if (nuevo) {
    await fetchAsignaciones(nuevo.Periodo_ID);
  } else {
    asignaciones.value = [];
  }
});

// Función para limpiar filtros
function limpiarFiltros() {
  periodoOrigen.value = null;
  periodoDestino.value = null;
  busquedaNombre.value = "";
  busquedaCedula.value = "";
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
  // Filtrar los estudiantes que aún no están asignados en el período origen
  const nuevos = estudiantesSeleccionados.value.filter(
    (est) => !asignaciones.value.includes(est.Usuario_Cedula)
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
  // Construir el payload
  const payload = nuevos.map((est) => ({
    Usuario_Cedula: est.Usuario_Cedula,
    Periodo_ID: periodoDestino.value?.Periodo_ID,
  }));
  try {
    const res = await fetch(`${API}/usuarioxPeriodo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.add({
        severity: "success",
        summary: "Éxito",
        detail: "Estudiantes asignados correctamente",
        life: 3000,
      });
      estudiantesSeleccionados.value = [];
      if (periodoOrigen.value) {
        await fetchAsignaciones(periodoOrigen.value.Periodo_ID);
      }
    } else {
      console.error("Error al asignar estudiantes:", await res.text());
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo asignar estudiantes al período",
        life: 3000,
      });
    }
  } catch (error) {
    console.error("Error al asignar estudiantes:", error);
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
