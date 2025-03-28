<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <h1 class="text-3xl font-bold text-center mb-10">Calendario Académico - Semanas</h1>
    <Toast />

    <!-- Filtros -->
    <div class="flex flex-wrap gap-4 mb-6 items-center justify-center">
      <!-- Dropdown: Seleccionar Período -->
      <div class="flex flex-col">
        <label class="mb-1 font-medium">Seleccionar Período:</label>
        <Dropdown
          v-model="selectedPeriodoId"
          :options="periodos"
          optionLabel="PeriodoNombre"
          optionValue="Periodo_ID"
          placeholder="Seleccione un período"
          class="w-60"
          @change="cargarPeriodoConSemanas"
        />
      </div>
      <!-- Filtro: Fecha Inicio desde (opcional) -->
      <div class="flex flex-col">
        <label class="mb-1 font-medium">Fecha Inicio desde:</label>
        <InputText v-model="filtroInicio" type="date" class="w-60" />
      </div>
      <!-- Filtro: Fecha Fin hasta (opcional) -->
      <div class="flex flex-col">
        <label class="mb-1 font-medium">Fecha Fin hasta:</label>
        <InputText v-model="filtroFin" type="date" class="w-60" />
      </div>
      <Button
        label="Limpiar filtros"
        icon="pi pi-filter-slash"
        class="p-button-outlined p-button-secondary mt-5"
        @click="limpiarFiltros"
      />
    </div>

       <!-- Label informativo del total de horas del período -->
    <div class="mt-2 mb-4 text-lg font-semibold">
      Total de Horas del Período: {{ totalHorasPeriodo }}
    </div>

    <!-- DataTable de Semanas -->
    <DataTable
      :value="semanasFiltradas"
      paginator
      :rows="10"
      class="w-full max-w-6xl shadow-lg"
      removableSort
    >
      <Column field="Semana_Numero" header="Semana" sortable />
      <Column header="Inicio" sortable>
        <template #body="slotProps">
          {{ formatDateWithDay(slotProps.data.Semana_Ini) }}
        </template>
      </Column>
      <Column header="Fin" sortable>
        <template #body="slotProps">
          {{ formatDateWithDay(slotProps.data.Semana_Fin) }}
        </template>
      </Column>
      <Column field="Semana_Horas" header="Horas" sortable />
      <Column field="Semana_Feriado" header="Feriados" sortable />
      <Column header="Acciones">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-warning"
              @click="abrirModalEdicion(slotProps.data)"
              tooltip="Editar"
              tooltipOptions="{ position: 'top' }"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger"
              @click="eliminarSemana(slotProps.data.Semana_ID)"
              tooltip="Eliminar"
              tooltipOptions="{ position: 'top' }"
            />
          </div>
        </template>
      </Column>
    </DataTable>

 

    <!-- Modal para editar la semana -->
    <Dialog v-model:visible="mostrarModalEdicion" header="Editar Semana" modal>
      <div class="p-3">
        <div class="flex flex-col gap-4">
          <!-- Semana Número (solo visual) -->
          <div>
            <label class="block mb-2 font-medium">Semana Número:</label>
            <InputText v-model="form.Semana_Numero" disabled class="w-full" />
          </div>
          <!-- Fecha Inicio -->
          <div>
            <label class="block mb-2 font-medium">Fecha Inicio:</label>
            <Calendar v-model="form.Semana_Ini" dateFormat="yy-mm-dd" class="w-full" />
          </div>
          <!-- Fecha Fin -->
          <div>
            <label class="block mb-2 font-medium">Fecha Fin:</label>
            <Calendar v-model="form.Semana_Fin" dateFormat="yy-mm-dd" class="w-full" />
          </div>
          <!-- Horas -->
          <div>
            <label class="block mb-2 font-medium">Horas:</label>
            <InputText v-model.number="form.Semana_Horas" type="number" class="w-full" />
          </div>
          <!-- Feriados -->
          <div>
            <label class="block mb-2 font-medium">Feriados:</label>
            <InputText v-model.number="form.Semana_Feriado" type="number" class="w-full" />
          </div>
          <!-- Observación -->
          <div>
            <label class="block mb-2 font-medium">Observación:</label>
            <InputText v-model="form.Semana_Observacion" class="w-full" />
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="cerrarModalEdicion" />
        <Button label="Guardar" icon="pi pi-check" class="p-button-success" @click="guardarEdicion" />
      </template>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { API, type Periodo } from '@/ApiRoute';

const router = useRouter();
const toast = useToast();

// Estados para períodos y seguimientos
const periodos = ref<Periodo[]>([]);
const selectedPeriodoId = ref<number | null>(null);
const selectedPeriodo = ref<any>(null);
const filtroInicio = ref<string>(""); // formato YYYY-MM-DD
const filtroFin = ref<string>("");

// Función para cargar períodos
const fetchPeriodos = async () => {
  try {
    const res = await fetch(`${API}/periodos`);
    if (!res.ok) throw new Error("Error al obtener los períodos");
    periodos.value = await res.json();
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.message });
  }
};

// Función para cargar el período con sus seguimientos
const cargarPeriodoConSemanas = async () => {
  if (!selectedPeriodoId.value) return;
  try {
    const res = await fetch(`${API}/periodos/${selectedPeriodoId.value}/seguimientos`);
    if (!res.ok) throw new Error("Error al obtener el período con seguimientos");
    selectedPeriodo.value = await res.json();
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.message });
  }
};

// Computed: filtrar las semanas según los filtros opcionales
const semanasFiltradas = computed(() => {
  if (!selectedPeriodo.value || !selectedPeriodo.value.seguimientos) return [];
  return selectedPeriodo.value.seguimientos.filter((s: any) => {
    let cumpleInicio = true;
    let cumpleFin = true;
    if (filtroInicio.value) {
      cumpleInicio = new Date(s.Semana_Ini) >= new Date(filtroInicio.value);
    }
    if (filtroFin.value) {
      cumpleFin = new Date(s.Semana_Fin) <= new Date(filtroFin.value);
    }
    return cumpleInicio && cumpleFin;
  });
});

// Computed: calcular el total de horas del período
const totalHorasPeriodo = computed(() => {
  // Si el objeto del período trae el campo Periodo_Total_Horas, lo usamos directamente
  if (selectedPeriodo.value && selectedPeriodo.value.Periodo_Total_Horas !== undefined) {
    return selectedPeriodo.value.Periodo_Total_Horas;
  }
  // Si no, calculamos la suma de las horas de cada seguimiento
  if (selectedPeriodo.value && selectedPeriodo.value.seguimientos) {
    return selectedPeriodo.value.seguimientos.reduce((total: number, s: any) => {
      return total + Number(s.Semana_Horas || 0);
    }, 0);
  }
  return 0;
});

// Función para formatear fecha con día
const formatDateWithDay = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

// Función para limpiar filtros
const limpiarFiltros = () => {
  filtroInicio.value = "";
  filtroFin.value = "";
};

// Lógica del modal de edición
const mostrarModalEdicion = ref(false);
const form = ref({
  Semana_ID: 0,
  Semana_Numero: 0,
  Semana_Ini: new Date(),
  Semana_Fin: new Date(),
  Semana_Horas: 0,
  Semana_Feriado: 0,
  Semana_Observacion: ""
});

const abrirModalEdicion = (semana: any) => {
  form.value.Semana_ID = semana.Semana_ID;
  form.value.Semana_Numero = semana.Semana_Numero;
  form.value.Semana_Ini = new Date(semana.Semana_Ini);
  form.value.Semana_Fin = new Date(semana.Semana_Fin);
  form.value.Semana_Horas = parseFloat(semana.Semana_Horas);
  form.value.Semana_Feriado = parseFloat(semana.Semana_Feriado);
  form.value.Semana_Observacion = semana.Semana_Observacion;
  mostrarModalEdicion.value = true;
};

const cerrarModalEdicion = () => {
  mostrarModalEdicion.value = false;
};

const guardarEdicion = async () => {
  try {
    const payload = {
      Semana_Ini: form.value.Semana_Ini.toISOString(),
      Semana_Fin: form.value.Semana_Fin.toISOString(),
      Semana_Horas: form.value.Semana_Horas,
      Semana_Feriado: form.value.Semana_Feriado,
      Semana_Observacion: form.value.Semana_Observacion
    };
    const res = await fetch(`${API}/seguimientos/${form.value.Semana_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Error al actualizar la semana");
    toast.add({
      severity: "success",
      summary: "Actualizado",
      detail: "Semana actualizada correctamente",
      life: 3000
    });
    await cargarPeriodoConSemanas();
    cerrarModalEdicion();
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.message });
  }
};

const eliminarSemana = async (semanaId: number) => {
  if (!confirm("¿Estás seguro de eliminar esta semana?")) return;
  try {
    const res = await fetch(`${API}/seguimientos/${semanaId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar la semana");
    if (selectedPeriodo.value) {
      selectedPeriodo.value.seguimientos = selectedPeriodo.value.seguimientos.filter(
        (s: any) => s.Semana_ID !== semanaId
      );
    }
    toast.add({
      severity: "success",
      summary: "Eliminado",
      detail: "Semana eliminada correctamente"
    });
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.message });
  }
};

onMounted(() => {
  fetchPeriodos();
});
</script>

<style scoped>
/* Puedes agregar estilos personalizados aquí si lo requieres */
</style>
