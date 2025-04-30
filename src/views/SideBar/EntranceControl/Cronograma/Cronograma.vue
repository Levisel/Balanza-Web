<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <!-- Título -->
    <h1 class="text-3xl font-bold text-center mb-10">Calendario Académico</h1>

    <!-- Toast para mensajes -->
    <Toast />

   
        <!-- Botón para crear nuevo cronograma -->
        <div class="flex justify-end w-full max-w-6xl mb-4">
      <Button
        label="Nuevo Cronograma"
        icon="pi pi-plus"
        class="p-button-rounded p-button-outlined shadow-md transition-all duration-300 hover:bg-opacity-30 hover:border hover:border-white/40 hover:shadow-lg mb-2"
        @click="irAIngresoCronograma"
      />
    </div>
  
    <!-- Filtros -->
    <div class="flex flex-wrap gap-4 mb-6 items-center justify-center">
      <!-- Filtro: Fecha de Inicio desde -->
      <div class="flex flex-col">
        <label class="mb-1 font-medium">Fecha Inicio desde:</label>
        <InputText v-model="filtroInicio" type="date" class="w-60" />
      </div>
      <!-- Filtro: Fecha Fin hasta -->
      <div class="flex flex-col">
        <label class="mb-1 font-medium">Fecha Fin hasta:</label>
        <InputText v-model="filtroFin" type="date" class="w-60" />
      </div>
      <!-- Filtro: Buscar por Nombre -->
      <div class="flex flex-col">
        <label class="mb-1 font-medium">Buscar por Nombre:</label>
        <InputText v-model="busqueda" placeholder="Buscar por nombre" class="w-72" />
      </div>
      <!-- Filtro: Por Tipo -->
      <div class="flex flex-col">
        <label class="mb-1 font-medium">Filtrar por Tipo:</label>
        <Dropdown
          v-model="tipoSeleccionado"
          :options="opcionesTipo"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccione un tipo"
          class="w-60"
        />
      </div>

      <Button
        label="Limpiar filtros"
        icon="pi pi-filter-slash"
        class="p-button-outlined p-button-secondary mt-5 "
        @click="limpiarFiltros"
      />
      <!-- Botón de restablecer filtros -->
      
    </div>

  

    <!-- DataTable de Períodos -->
   <DataTable :value="filteredPeriods" paginator :rows="10" class="w-full max-w-6xl shadow-lg" removableSort>
  <Column field="Period_Name" header="Nombre del Período" sortable />
  <Column header="Fecha Inicio" sortable>
    <template #body="slotProps">
      {{ formatDate(slotProps.data.Period_Start) }}
    </template>
  </Column>
  <Column header="Fecha Fin" sortable>
    <template #body="slotProps">
      {{ formatDate(slotProps.data.Period_End) }}
    </template>
  </Column>
  <Column field="Period_Type" header="Tipo" sortable />
  <Column header="Acciones">
    <template #body="slotProps">
      <div class="flex gap-2">
        <Button
          icon="pi pi-pencil"
          class="p-button-rounded p-button-warning"
          @click="editPeriod(slotProps.data.Period_ID)"
          tooltip="Editar"
          tooltipOptions="{ position: 'top' }"
        />
        <Button
          icon="pi pi-trash"
          class="p-button-rounded p-button-danger"
          @click="confirmDelete(slotProps.data)"
          tooltip="Eliminar"
          tooltipOptions="{ position: 'top' }"
        />
      </div>
    </template>
  </Column>
</DataTable>

    <Dialog
  v-model:visible="mostrarDialogoEliminar"
  header="Confirmar Eliminación"
  :modal="true"
  :closable="false"
  :style="{ width: '400px' }"
>
  <div class="p-4 text-center">
    <p class="text-lg">
      ¿Estás seguro de que deseas eliminar el período
      <strong>{{ periodoAEliminar?.Period_Name }}</strong>?
    </p>
  </div>

  <template #footer>
    <div class="flex justify-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        class="p-button-outlined"
        @click="mostrarDialogoEliminar = false"
      />
      <Button
        label="Eliminar"
        icon="pi pi-trash"
        class="p-button-danger"
        @click="eliminarPeriodoConfirmado"
      />
    </div>
  </template>
</Dialog>

  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios"; // Asegúrate de tenerlo importado arriba
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { API, type Period } from  "@/ApiRoute";

// Router y Toast
const router = useRouter();
const toast = useToast();

// Estados reactivos
const periods = ref<Period[]>([]);
const filtroInicio = ref<string>(""); // Formato YYYY-MM-DD
const filtroFin = ref<string>("");
const busqueda = ref<string>("");
const tipoSeleccionado = ref<string | null>(null);

// Opciones para el filtro de tipo
const opcionesTipo = ref([
  { label: "Ordinario", value: "Ordinario" },
  { label: "Extraordinario", value: "Extraordinario" },
]);

const mostrarDialogoEliminar = ref(false);
const periodoAEliminar = ref<Period | null>(null);

// Mostrar el diálogo personalizado
const confirmDelete = (periodo: Period) => {
  periodoAEliminar.value = periodo;
  mostrarDialogoEliminar.value = true;
};

// Eliminar cuando el usuario confirma desde el diálogo
const eliminarPeriodoConfirmado = async () => {
  if (!periodoAEliminar.value) return;
  try {
    await axios.delete(`${API}/periodos/${periodoAEliminar.value.Period_ID}`, {
        withCredentials: true,
      });
      periods.value = periods.value.filter(
        (p) => p.Period_ID !== periodoAEliminar.value?.Period_ID
      );

    toast.add({
      severity: "success",
      summary: "Eliminado",
      detail: "Período eliminado correctamente",
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo eliminar el período",
    });
  } finally {
    mostrarDialogoEliminar.value = false;
    periodoAEliminar.value = null;
  }
};




// Función para obtener períodos de la API
const fetchPeriodos = async () => {
  try {
    const { data } = await axios.get(`${API}/periodos`);
    periods.value = data;
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.message || error.message,
    });
  }
};


// Función para formatear fecha
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

// Computed para filtrar períodos según fecha de inicio, fecha fin, búsqueda por nombre y tipo
const filteredPeriods = computed(() => {
  return periods.value.filter((p) => {
    let startOk = true;
    let endOk = true;
    let searchOk = true;
    let typeOk = true;

    if (filtroInicio.value) {
      startOk = new Date(p.Period_Start) >= new Date(filtroInicio.value);
    }
    if (filtroFin.value) {
      endOk = new Date(p.Period_End) <= new Date(filtroFin.value);
    }
    if (busqueda.value.trim()) {
      const search = busqueda.value.toLowerCase().trim();
      searchOk = p.Period_Name.toLowerCase().includes(search);
    }
    if (tipoSeleccionado.value) {
      typeOk = p.Period_Type === tipoSeleccionado.value;
    }

    return startOk && endOk && searchOk && typeOk;
  });
});


// Función para redirigir a la vista de ingreso de cronograma
const irAIngresoCronograma = () => {
  router.push("/IngresoCronograma");
};

// Función para editar un período
const editPeriod = (id: number) => {
  router.push(`/IngresoCronograma/${id}`);
};



// Función para restablecer filtros
const limpiarFiltros = () => {
  filtroInicio.value = "";
  filtroFin.value = "";
  busqueda.value = "";
  tipoSeleccionado.value = null;
};

onMounted(() => {
  fetchPeriodos();
});
</script>

<style scoped>
/* Puedes agregar estilos personalizados aquí si lo deseas */
</style>
