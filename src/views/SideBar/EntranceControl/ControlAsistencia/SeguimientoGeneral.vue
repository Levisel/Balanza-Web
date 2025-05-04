<template>
    <main class="flex flex-col items-center p-8 min-h-screen">
      <h1 class="text-3xl font-bold text-center mb-6">Resumen de Horas Estudiantes</h1>
      <Toast />
  
      <!-- Filtros -->
      <div class="flex flex-wrap gap-4 mb-6 items-center justify-center">
        <!-- Buscar por Cédula -->
        <InputText
          v-model="busquedaCedula"
          placeholder="Buscar por Cédula"
          class="w-60 p-inputtext-lg"
        />
  
        <!-- Buscar por Nombre y Apellido -->
        <InputText
          v-model="busquedaNombre"
          placeholder="Buscar por Nombre y Apellido"
          class="w-72 p-inputtext-lg"
        />
  
        <!-- Dropdown para filtrar por Área -->
        <Dropdown
          v-model="areaSeleccionada"
          :options="areas"
          optionLabel="label"
          optionValue="label"
          placeholder="Filtrar por Área"
          class="w-60"
        />


  
        <!-- Botón para restablecer filtros -->
        <Button
          label="Restablecer filtros"
          icon="pi pi-filter-slash"
          class="p-button-outlined p-button-secondary"
          @click="limpiarFiltros"
        />
      </div>
  
      <!-- Mensaje de error, si lo hay -->
      <Message v-if="errorMensaje" severity="error" class="mb-4">
        {{ errorMensaje }}
      </Message>
  
      <!-- Tabla de Resumen de Horas Estudiantes -->
      <DataTable
        :value="resumenesFiltrados"
        paginator
        :rows="10"
        class="w-full max-w-6xl shadow-lg"
        removableSort
      >
        <!-- Columna: Cédula -->
        <Column field="Internal_ID" header="Cédula" sortable>
          <template #body="slotProps">
            {{ slotProps.data.userSummary?.Internal_ID || "N/A" }}
          </template>
        </Column>
  
        <!-- Columna: Nombres -->
        <Column field="Internal_Name" header="Nombres" sortable>
          <template #body="slotProps">
            {{ slotProps.data.userSummary?.Internal_Name || "N/A" }}
          </template>
        </Column>
  
        <!-- Columna: Apellidos -->
        <Column field="Internal_LastName" header="Apellidos" sortable>
          <template #body="slotProps">
            {{ slotProps.data.userSummary?.Internal_LastName || "N/A" }}
          </template>
        </Column>
  
        <!-- Columna: Correo Institucional
        <Column field="Internal_Email" header="Correo Institucional" sortable>
          <template #body="slotProps">
            {{ slotProps.data.userSummary?.Internal_Email?.trim() || "N/A" }}
          </template>
        </Column> -->
  
        <!-- Columna: Área -->
        <Column field="Internal_Area" header="Área" sortable>
          <template #body="slotProps">
            {{ slotProps.data.userSummary?.Internal_Area?.trim() || "N/A" }}
          </template>
        </Column>
  
        <!-- Columna: Inicio (Fecha de Inicio) -->
        <Column field="Summary_Start" header="Inicio" sortable>
          <template #body="slotProps">
            {{ formatDate(slotProps.data.Summary_Start) }}
          </template>
        </Column>

        <Column field="Summary_End" header="Fin" sortable>
          <template #body="slotProps">
            {{ formatDate(slotProps.data.Summary_End) }}
          </template>
        </Column>
  
        <!-- Columna: Horas Totales -->
        <Column field="Summary_Total_Hours" header="Horas Totales" sortable>
          <template #body="slotProps">
            {{ slotProps.data.Summary_Total_Hours || "N/A" }}
          </template>
        </Column>

        <!-- Columna: ¿Finalizó el proceso? -->
        <Column field="Summary_IsComplete" header="¿Finalizó el proceso?" sortable>
          <template #body="slotProps">
            <span
              v-if="slotProps.data.Summary_IsComplete"
              class="text-green-600 font-bold flex items-center gap-2"
            >
              <i class="pi pi-check-circle" /> Sí
            </span>
            <span
              v-else
              class="text-red-600 font-bold flex items-center gap-2"
            >
              <i class="pi pi-times-circle" /> No
            </span>
          </template>
        </Column>

  
        <!-- Columna de Acciones -->
        <Column header="Acciones">
          <template #body="slotProps">
            <div class="flex gap-2">
      <!-- Botón para ver detalle (ya existente) -->
      <Button 
        icon="pi pi-info-circle" 
        class="p-button-rounded p-button-info" 
        @click="verDetalle(slotProps.data)"
        v-tooltip.bottom="{ value: 'Ver Detalle', tooltipOptions: { position: 'top', showDelay: 300 } }"
      />
      <!-- Nuevo botón para ir a Seguimiento Semanal -->
      <Button 
        icon="pi pi-arrow-right" 
        class="p-button-rounded p-button-success" 
         @click="irSeguimientoSemanal(slotProps.data.Summary_ID, slotProps.data.userSummary.Internal_ID)"
        v-tooltip.bottom="{ value: 'Ver Seguimiento Semanal', tooltipOptions: { position: 'top', showDelay: 300 } }"
      />
    </div>
          </template>
        </Column>
      </DataTable>
  
      <!-- Modal para mostrar detalle completo -->
      <Dialog v-model:visible="modalInfoVisible" header="Detalle del Resumen" :modal="true" style="width: 30rem">
        <div class="flex flex-col gap-2">
          <p><strong>Cédula:</strong> {{ detalleSeleccionado?.userSummary?.Internal_ID }}</p>
          <p>
            <strong>Nombre Completo:</strong>
            {{ detalleSeleccionado?.userSummary?.Internal_Name }} {{ detalleSeleccionado?.userSummary?.Internal_LastName }}
          </p>
          <p><strong>Correo:</strong> {{ detalleSeleccionado?.userSummary?.Internal_Email }}</p>
          <p><strong>Área:</strong> {{ detalleSeleccionado?.userSummary?.Internal_Area || "N/A" }}</p>
          <p><strong>Inicio:</strong> {{ formatDate(detalleSeleccionado?.Summary_Start) }}</p>
          <p>
            <strong>Fin:</strong>
            {{ detalleSeleccionado?.Summary_End ? formatDate(detalleSeleccionado?.Summary_End) : "N/A" }}
          </p>
          <p><strong>Horas Totales:</strong> {{ detalleSeleccionado?.Summary_Total_Hours }}</p>
          <p><strong>Horas Adicionales:</strong> {{ detalleSeleccionado?.Summary_Extra_Hours }}</p>
          <p><strong>Horas Reducidas:</strong> {{ detalleSeleccionado?.Summary_Reduced_Hours }}</p>

        </div>
        <template #footer>
          <Button label="Cerrar" icon="pi pi-times" class="p-button-secondary" @click="modalInfoVisible = false" />
        </template>
      </Dialog>
    </main>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { useToast } from "primevue/usetoast";
  
  // Componentes PrimeVue
  import InputText from "primevue/inputtext";
  import Button from "primevue/button";
  import Dropdown from "primevue/dropdown";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import Message from "primevue/message";
  import Toast from "primevue/toast";
  import Dialog from "primevue/dialog";
  import {useSubjects} from '@/useSubjects' // ajusta la ruta si está en otra carpeta
  import axios from "axios";

  
  // Importa la constante de API según tu proyecto
  import { API } from "@/ApiRoute";
  
  // Función para formatear la fecha a la hora local
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };
  
  // Estados
  const resumenes = ref([]);
  const busquedaCedula = ref("");
  const busquedaNombre = ref("");
  const areaSeleccionada = ref(""); // Dropdown: valor inicial vacío
  const errorMensaje = ref("");
  
  const { subjects: areas, fetchSubjects } = useSubjects();

  
  const toast = useToast();
  const router = useRouter();
  
  // Variables para el modal de detalle
  const modalInfoVisible = ref(false);
  const detalleSeleccionado = ref<any>(null);
  
  // Computed: Filtrar el JSON según cédula, nombre/apellido y área
  const resumenesFiltrados = computed(() => {
    return resumenes.value.filter((item) => {
      const cedula = item.userSummary?.Internal_ID?.toLowerCase() || "";
      const nombres = item.userSummary?.Internal_Name?.toLowerCase() || "";
      const apellidos = item.userSummary?.Internal_LastName?.toLowerCase() || "";
      const area = item.userSummary?.Internal_Area?.trim() || "";
      const fullName = `${nombres} ${apellidos}`;
  
      const filtroCedula = busquedaCedula.value.trim()
        ? cedula.includes(busquedaCedula.value.toLowerCase().trim())
        : true;
      const filtroNombre = busquedaNombre.value.trim()
        ? fullName.includes(busquedaNombre.value.toLowerCase().trim())
        : true;
        const filtroArea = areaSeleccionada.value
  ? area.includes(areaSeleccionada.value.trim())
  : true;




  
      return filtroCedula && filtroNombre && filtroArea;
    });
  });
  
  // Función para limpiar filtros
  const limpiarFiltros = () => {
    busquedaCedula.value = "";
    busquedaNombre.value = "";
    areaSeleccionada.value = "";
  };
  
  // Función para ver detalle: asigna el dato seleccionado y muestra el modal
  const verDetalle = (data: any) => {
    detalleSeleccionado.value = data;
    modalInfoVisible.value = true;
  };
  
  // Función para cargar datos desde la API
  const fetchResumenes = async () => {
  try {
    const { data } = await axios.get(`${API}/resumenHoras/completo`, {
      withCredentials: true,
    });
    resumenes.value = data;
  } catch (error: any) {
    console.error("Error cargando resumenes:", error);
    errorMensaje.value = "Error al cargar el resumen de horas.";
  }
};


const irSeguimientoSemanal = (resumenId: number, internalId: number) => {
  router.push({
    name: 'ResumenSemanal',
    params: { resumenId, internalId }
  });
};


  
  onMounted(() => {
    fetchResumenes();
    fetchSubjects();

  });
  </script>
  
  <style scoped>

  </style>
  