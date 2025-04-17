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
              icon="pi pi-eye"
              class="p-button-rounded p-button-info"
              @click="abrirModalVista(slotProps.data)"
              tooltip="Ver detalles"
              tooltipOptions="{ position: 'top' }"
            />

          
          </div>
        </template>
      </Column>
    </DataTable>

 

    <!-- Modal para editar la semana -->
   <!-- Modal para editar la semana -->
<Dialog v-model:visible="mostrarModalEdicion" header="Editar Semana" modal class="w-[40rem]">
  <div class="p-3">
    <div class="flex flex-col gap-4">
      <div>
        <label class="block mb-2 font-medium">Semana Número:</label>
        <InputText v-model="form.Semana_Numero" disabled class="w-full" />
      </div>
      <div>
        <label class="block mb-2 font-medium">Fecha Inicio:</label>
        <Calendar v-model="form.Semana_Ini" dateFormat="yy-mm-dd" class="w-full" disabled />
      </div>
      <div>
        <label class="block mb-2 font-medium">Fecha Fin:</label>
        <Calendar v-model="form.Semana_Fin" dateFormat="yy-mm-dd" class="w-full" disabled />
      </div>
     <!-- Horas -->
<!-- Horas -->
<!-- Horas -->
<div>
  <label class="block mb-2 font-medium">Horas:</label>
  <InputNumber
    v-model="form.Semana_Horas"
    class="w-full"
    inputId="horas"
    :min="0"
    mode="decimal"
    :step="0.1"
    :useGrouping="false"
    showButtons="false"
  />
</div>

<!-- Feriados -->
<div>
  <label class="block mb-2 font-medium">Feriados:</label>
  <InputNumber
    v-model="form.Semana_Feriado"
    class="w-full"
    inputId="feriados"
    :min="0"
    mode="decimal"
    :step="0.1"
    :useGrouping="false"
    showButtons="false"
  />
</div>



      <div>
  <label class="block mb-2 font-medium">Observación (máx. 200 caracteres):</label>
  <Textarea
    v-model="form.Semana_Observacion"
    autoResize
    rows="3"
    maxlength="200"
    class="w-full"
    placeholder="Escriba una observación (opcional)"
  />
  <div class="text-sm text-gray-500 text-end">
    {{ form.Semana_Observacion?.length || 0 }}/200
  </div>
</div>

    </div>
  </div>
  <template #footer>
    <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="cerrarModalEdicion" />
    <Button label="Guardar" icon="pi pi-check" class="p-button-success" @click="guardarEdicion" />
  </template>
</Dialog>


<Dialog
  v-model:visible="mostrarModalVista"
  header="Detalle de la Semana"
  modal
  class="w-[40rem]"
>




<div :class="[ 'p-4 space-y-4 text-base rounded-b-lg', isDarkTheme ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900' ]">
    <div><strong>Semana Número:</strong> {{ semanaVista?.Semana_Numero }}</div>
    <div><strong>Inicio:</strong> {{ formatDateWithDay(semanaVista?.Semana_Ini) }}</div>
    <div><strong>Fin:</strong> {{ formatDateWithDay(semanaVista?.Semana_Fin) }}</div>
    <div><strong>Horas Totales:</strong> {{ semanaVista?.Semana_Horas }}</div>
    <div><strong>Horas Feriado:</strong> {{ semanaVista?.Semana_Feriado }}</div>
    <div>
      <strong>Observación:</strong>
      <div
  class="border p-3 rounded min-h-[3rem] whitespace-pre-wrap mt-3"
  :class="isDarkTheme ? 'bg-[#2a2a2a] text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'"
>
  {{ semanaVista?.Semana_Observacion || 'Sin observaciones' }}
</div>

    </div>
  </div>

  <template #footer>
    <Button label="Cerrar" icon="pi pi-times" class="p-button-text" @click="cerrarModalVista" />
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
import { useDarkMode } from "@/components/ThemeSwitcher";

const { isDarkTheme } = useDarkMode(); // 🔥 usa el modo oscuro global

const router = useRouter();
const toast = useToast();

// Estados para períodos y seguimientos
const periodos = ref<Periodo[]>([]);
const selectedPeriodoId = ref<number | null>(null);
const selectedPeriodo = ref<any>(null);
const filtroInicio = ref<string>(""); // formato YYYY-MM-DD
const filtroFin = ref<string>("");

const mostrarModalVista = ref(false);
const semanaVista = ref<any>(null);

const abrirModalVista = (semana: any) => {
  semanaVista.value = semana;
  mostrarModalVista.value = true;
};

const cerrarModalVista = () => {
  mostrarModalVista.value = false;
};

// Permite solo números positivos (enteros o decimales) en input
const soloNumerosPositivos = (event: InputEvent) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9.,]/g, "").replace(",", ".");
};

// Validación final al salir del campo para evitar valores negativos
const validarValorPositivo = (modelValue: number, key: keyof typeof form.value) => {
  if (modelValue < 0) {
    form.value[key] = 0;
    toast.add({
      severity: "warn",
      summary: "Valor inválido",
      detail: "Solo se permiten números positivos.",
      life: 3000,
    });
  }
};



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

    if (form.value.Semana_Horas === null || form.value.Semana_Horas === undefined || form.value.Semana_Horas < 0) {
      toast.add({ severity: "warn", summary: "Validación", detail: "Primero ingrese las horas de la semana." });
      return;
    }

    if (form.value.Semana_Feriado > form.value.Semana_Horas) {
      toast.add({ severity: "warn", summary: "Validación", detail: "Las horas de feriado no pueden superar las horas totales.",life: 5000 });
      return;
    }

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
/* Estilo para que el Dialog se adapte al modo oscuro de forma limpia */
:deep(.p-dialog-content) {
  transition: background-color 0.3s ease;
}

:deep(.p-dialog) {
  border-radius: 1rem;
  overflow: hidden;
}

:deep(.p-dialog.dark .p-dialog-content) {
  background-color: #1f1f1f !important;
  color: white !important;
}

:deep(.p-dialog.dark .p-dialog-header) {
  background-color: #111827 !important;
  color: white !important;
}

:deep(.p-dialog.dark .p-dialog-footer) {
  background-color: #1f1f1f !important;
  border-top: 1px solid #374151;
}

/* Puedes agregar estilos personalizados aquí si lo requieres */
</style>
