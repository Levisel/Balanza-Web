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
    <DataTable
      :value="periodosFiltrados"
      paginator
      :rows="10"
      class="w-full max-w-6xl shadow-lg"
      removableSort
    >
      <Column field="Periodo_ID" header="ID" sortable />
      <Column field="PeriodoNombre" header="Nombre del Período" sortable />
      <Column header="Fecha Inicio" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.Periodo_Inicio) }}
        </template>
      </Column>
      <Column header="Fecha Fin" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.Periodo_Fin) }}
        </template>
      </Column>
      <Column field="PeriodoTipo" header="Tipo" sortable />
      <Column header="Acciones">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-warning"
              @click="editarPeriodo(slotProps.data.Periodo_ID)"
              tooltip="Editar"
              tooltipOptions="{ position: 'top' }"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger"
              @click="eliminarPeriodo(slotProps.data.Periodo_ID)"
              tooltip="Eliminar"
              tooltipOptions="{ position: 'top' }"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { API, type Periodo } from "@/views/Interfaces";

// Router y Toast
const router = useRouter();
const toast = useToast();

// Estados reactivos
const periodos = ref<Periodo[]>([]);
const filtroInicio = ref<string>(""); // Formato YYYY-MM-DD
const filtroFin = ref<string>("");
const busqueda = ref<string>("");
const tipoSeleccionado = ref<string | null>(null);

// Opciones para el filtro de tipo
const opcionesTipo = ref([
  { label: "Ordinario", value: "Ordinario" },
  { label: "Extraordinario", value: "Extraordinario" },
]);

// Función para obtener períodos de la API
const fetchPeriodos = async () => {
  try {
    const res = await fetch(`${API}/periodos`);
    if (!res.ok) throw new Error("Error al obtener los períodos");
    periodos.value = await res.json();
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.message });
  }
};

// Función para formatear fecha
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

// Computed para filtrar períodos según fecha de inicio, fecha fin, búsqueda por nombre y tipo
const periodosFiltrados = computed(() => {
  return periodos.value.filter((p) => {
    let cumpleInicio = true;
    let cumpleFin = true;
    let cumpleBusqueda = true;
    let cumpleTipo = true;
    if (filtroInicio.value) {
      cumpleInicio = new Date(p.Periodo_Inicio) >= new Date(filtroInicio.value);
    }
    if (filtroFin.value) {
      cumpleFin = new Date(p.Periodo_Fin) <= new Date(filtroFin.value);
    }
    if (busqueda.value.trim()) {
      const search = busqueda.value.toLowerCase().trim();
      cumpleBusqueda = p.PeriodoNombre.toLowerCase().includes(search);
    }
    if (tipoSeleccionado.value) {
      cumpleTipo = p.PeriodoTipo === tipoSeleccionado.value;
    }
    return cumpleInicio && cumpleFin && cumpleBusqueda && cumpleTipo;
  });
});

// Función para redirigir a la vista de ingreso de cronograma
const irAIngresoCronograma = () => {
  router.push("/IngresoCronograma");
};

// Función para editar un período
const editarPeriodo = (id: number) => {
  router.push(`/IngresoCronograma/${id}`);
};

// Función para eliminar un período con confirmación
const eliminarPeriodo = (id: number) => {
  if (!confirm("¿Estás seguro de que deseas eliminar este período?")) return;
  fetch(`${API}/periodos/${id}`, { method: "DELETE" })
    .then((res) => {
      if (!res.ok) throw new Error("Error al eliminar el período");
      periodos.value = periodos.value.filter((p) => p.Periodo_ID !== id);
      toast.add({
        severity: "success",
        summary: "Eliminado",
        detail: "Período eliminado correctamente",
      });
    })
    .catch((error) => {
      console.error("Error eliminando el período:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo eliminar el período",
      });
    });
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
