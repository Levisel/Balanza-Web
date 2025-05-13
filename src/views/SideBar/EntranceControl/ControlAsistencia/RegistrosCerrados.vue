<template>
    <main class="min-h-screen p-8">
      <!-- Encabezado -->
      <div class="w-full flex items-center justify-between mb-8">
        <Button 
          icon="pi pi-arrow-left" 
          class="p-button-text text-blue-600 hover:text-blue-800" 
          @click="volver" 
          tooltip="Volver al listado" 
          tooltipOptions="{ position: 'top' }" 
        />
        <h1 class="text-3xl font-bold text-center flex-grow">
          Registros Cerrados
        </h1>
        <div class="w-10"></div>
      </div>
      
      <Toast />
  
      <!-- Filtros -->
      <div class="flex flex-wrap gap-4 mb-6 items-center justify-center">
        <!-- Filtro: Cédula -->
        <div class="flex flex-col">
          <label class="mb-1 font-medium">Cédula:</label>
          <InputText v-model="filterCedula" placeholder="Ingrese cédula" class="w-60" />
        </div>
        <!-- Filtro: Nombre (Nombre + Apellido) -->
        <div class="flex flex-col">
          <label class="mb-1 font-medium">Nombre:</label>
          <InputText v-model="filterNombre" placeholder="Ingrese nombre" class="w-60" />
        </div>
        <!-- Filtro: Fecha (Registro_Entrada) -->
        <div class="flex flex-col">
        <label class="mb-1 font-medium">Fecha</label>
        <InputText v-model="filterFecha" type="date" class="w-60" />
      </div>
        <!-- Filtro: Período -->
        <div class="flex flex-col">
          <label class="mb-1 font-medium">Período:</label>
          <Dropdown 
            v-model="filterPeriodo" 
            :options="periodos" 
            optionLabel="Period_Name" 
            optionValue="Period_ID" 
            placeholder="Seleccione período" 
            class="w-60" 
          />
        </div>
        <Button 
          label="Limpiar filtros" 
          icon="pi pi-filter-slash" 
          class="p-button-outlined p-button-secondary mt-5" 
          @click="limpiarFiltros" 
        />
      </div>
  
      <!-- DataTable de Registros Cerrados -->
      <DataTable :value="filteredRecords" paginator :rows="10" class="w-full shadow-lg mt-2">
        <Column field="userXPeriod.user.Internal_ID" header="Cédula" sortable />
        <Column header="Nombre" sortable>
          <template #body="slotProps">
            {{ slotProps.data.userXPeriod.user.Internal_Name }} {{ slotProps.data.userXPeriod.user.Internal_LastName }}
          </template>
        </Column>
        <Column header="Fecha Entrada" sortable>
          <template #body="slotProps">
            {{ formatDate(slotProps.data.Attendance_Entry) }}
          </template>
        </Column>
        <Column header="Fecha Salida" sortable>
          <template #body="slotProps">
            {{ formatDate(slotProps.data.Attendance_Exit) }}
          </template>
        </Column>
        <Column header="Período" sortable>
          <template #body="slotProps">
            {{ slotProps.data.userXPeriod?.period?.Period_Name || "N/A"  }}
          </template>
        </Column>
        <Column field="Attendance_Type" header="Tipo de Registro" sortable>
          <template #body="slotProps">
            {{ slotProps.data.Attendance_Type }}
          </template>
        </Column>
        <Column header="Acciones">
          <template #body="slotProps">
            <div class="flex gap-2">
              <!-- Botón para editar -->
              <Button 
                icon="pi pi-pencil" 
                class="p-button-rounded p-button-warning" 
                @click="openEditModal(slotProps.data)" 
                tooltip="Editar Registro" 
                tooltipOptions="{ position: 'top' }" 
              />
              <!-- Botón para eliminar -->
              <Button 
                icon="pi pi-trash" 
                class="p-button-rounded p-button-danger" 
                @click="openDeleteConfirm(slotProps.data)" 
                tooltip="Eliminar Registro" 
                tooltipOptions="{ position: 'top' }" 
              />
            </div>
          </template>
        </Column>
      </DataTable>
  
      <!-- Modal para editar registro cerrado -->
      <Dialog 
        v-model:visible="editModalVisible" 
        header="Editar Registro de Asistencia" 
        modal 
        :closable="false" 
        style="width: 30rem"
      >
        <div class="p-4">
          <p class="mb-2 text-sm text-gray-600">
            Cualquier cambio en la hora de salida afectará el total de horas acumuladas del estudiante.
          </p>
          <p class="mb-2 font-medium">
            Hora de Entrada: {{ formatDate(selectedRegistro?.Attendance_Entry || '') }}
          </p>
          <label class="block font-medium mb-1">Nueva Hora de Salida</label>
          <InputText 
            v-model="editSalida" 
            type="datetime-local" 
            class="w-full" 
          />
        </div>
        <template #footer>
          <div class="flex justify-end gap-3 pt-4">
            <Button label="Cancelar" class="p-button-text" @click="closeEditModal" />
            <Button label="Guardar" class="p-button-success" @click="saveEdit" />
          </div>
        </template>
      </Dialog>
  
      <!-- Modal de confirmación para eliminación -->
      <Dialog 
        v-model:visible="deleteDialogVisible" 
        header="Confirmar Eliminación" 
        modal 
        :closable="false" 
        style="width: 30rem"
        :class="isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'"
      >
        <div class="p-4">
          <p class="text-center text-lg">
            ¿Está seguro de que desea eliminar este registro?
          </p>
        </div>
        <template #footer>
          <div class="flex justify-end gap-3 p-2">
            <Button label="Cancelar" class="p-button-text" @click="cancelDelete" />
            <Button label="Eliminar" class="p-button-danger" @click="confirmDelete" />
          </div>
        </template>
      </Dialog>
    </main>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import Button from "primevue/button";
  import InputText from "primevue/inputtext";
  import Dialog from "primevue/dialog";
  import Calendar from "primevue/calendar";
  import Dropdown from "primevue/dropdown";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import Toast from "primevue/toast";
  import { useToast } from "primevue/usetoast";
  import { API } from "@/ApiRoute";
  import axios from "axios";
  const isDarkTheme = ref(false); // Cambia esto según tu lógica de tema
  
  const router = useRouter();
  const toast = useToast();
  
  // Arreglo de registros cerrados
  interface Registro {
    userXPeriod?: {
      user?: {
        Internal_ID?: string;
        Internal_Name?: string;
        Internal_LastName?: string;
      };
      Period_ID?: number;
      period?: {
        Period_Name?: string;
      };
    };
    Attendance_Entry?: string;
    Attendance_Exit?: string;
    Attendance_ID?: number;
    Attendance_Type?: string;
  }
  
  const registros = ref<Registro[]>([]);
  
  // Filtros
  const filterCedula = ref("");
  const filterNombre = ref("");
  const filterFecha = ref(null);
  const filterPeriodo = ref(null);
  
  // Cargar registros cerrados (GET /registrosCerrados)
  const loadRegistros = async () => {
  try {
    const { data } = await axios.get(`${API}/registrosCerrados`, { withCredentials: true });
    registros.value = data;
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.message, life: 3000 });
  }
};

  
  // Cargar períodos (GET /periodos)
  const periodos = ref([]);
  const loadPeriodos = async () => {
  try {
    const { data } = await axios.get(`${API}/periodos`, { withCredentials: true });
    periodos.value = data;
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.message, life: 3000 });
  }
};

  
  onMounted(() => {
    loadRegistros();
    loadPeriodos();
  });
  
  // Computed para filtrar registros cerrados
  const filteredRecords = computed(() => {
    const filterFechaStr = filterFecha.value ? new Date(filterFecha.value).toISOString().split("T")[0] : "";
    return registros.value.filter(reg => {
      const ced = reg.userXPeriod?.user?.Internal_ID?.toLowerCase() || "";
      const matchCedula = ced.includes(filterCedula.value.toLowerCase());
      
      const nombreCompleto = (
        reg.userXPeriod?.user?.Internal_Name +
        " " +
        reg.userXPeriod?.user?.Internal_LastName
      ).toLowerCase();
      const matchNombre = nombreCompleto.includes(filterNombre.value.toLowerCase());
      
      let matchFecha = true;
      if (filterFechaStr) {
        const regFecha = reg.Attendance_Entry
          ? new Date(reg.Attendance_Entry).toISOString().split("T")[0]
          : "";
        matchFecha = filterFechaStr === regFecha;
      }
      
      let matchPeriodo = true;
      if (filterPeriodo.value) {
        matchPeriodo = reg.userXPeriod?.Period_ID == filterPeriodo.value;
      }
      
      return matchCedula && matchNombre && matchFecha && matchPeriodo;
    });
  });
  
  // Función para formatear fechas
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString();
  };
  
  // Modal de edición
  const editModalVisible = ref(false);
  const selectedRegistro = ref<Registro | null>(null);
  const editSalida = ref("");
  
  // Modal de confirmación para eliminación
  const deleteDialogVisible = ref(false);
  const registroToDelete = ref<Registro | null>(null);
  
  // Abrir modal para editar
  const openEditModal = (registro: any) => {
    selectedRegistro.value = registro;
    // Pre-cargar editSalida con la hora de entrada del registro (en formato datetime-local)
    editSalida.value = new Date(registro.Attendance_Entry).toISOString().substring(0, 16);
    editModalVisible.value = true;
  };
  
  const closeEditModal = () => {
    editModalVisible.value = false;
  };
  
  // Guardar edición (PUT /registrosCerrados/:id)
  const saveEdit = async () => {
  if (!selectedRegistro.value) {
    toast.add({ severity: "error", summary: "Error", detail: "No se seleccionó registro", life: 3000 });
    return;
  }

  const entrada = selectedRegistro.value.Attendance_Entry ? new Date(selectedRegistro.value.Attendance_Entry) : new Date();
  const nuevaSalida = new Date(editSalida.value);

  if (nuevaSalida <= entrada) {
    toast.add({ severity: "error", summary: "Error", detail: "La hora de salida debe ser posterior a la entrada.", life: 3000 });
    return;
  }

  const mismoDia =
    entrada.getFullYear() === nuevaSalida.getFullYear() &&
    entrada.getMonth() === nuevaSalida.getMonth() &&
    entrada.getDate() === nuevaSalida.getDate();

  if (!mismoDia) {
    toast.add({ severity: "error", summary: "Error", detail: "La hora de salida debe ser del mismo día que la entrada.", life: 3000 });
    return;
  }

  try {
    const registroId = selectedRegistro.value.Attendance_ID;
    await axios.put(
      `${API}/registrosCerrados/${registroId}`,
      { Attendance_Exit: editSalida.value },
      { withCredentials: true }
    );
    toast.add({ severity: "success", summary: "Actualizado", detail: "Registro actualizado correctamente", life: 3000 });
    closeEditModal();
    await loadRegistros();
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.message, life: 3000 });
  }
};

  
  // Abrir modal de confirmación para eliminar
  const openDeleteConfirm = (registro: any) => {
    registroToDelete.value = registro;
    deleteDialogVisible.value = true;
  };
  
  const cancelDelete = () => {
    deleteDialogVisible.value = false;
  };
  
  // Confirmar eliminación (DELETE /registrosCerrados/:id/ajuste)
  const confirmDelete = async () => {
  if (!registroToDelete.value) return;

  try {
    const registroId = registroToDelete.value.Attendance_ID;
    await axios.delete(`${API}/registrosCerrados/${registroId}/ajuste`, { withCredentials: true });
    toast.add({ severity: "success", summary: "Eliminado", detail: "Registro eliminado y resumen ajustado", life: 3000 });
    deleteDialogVisible.value = false;
    await loadRegistros();
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.message, life: 3000 });
  }
};

  
  // Función para limpiar filtros
  const limpiarFiltros = () => {
    filterCedula.value = "";
    filterNombre.value = "";
    filterFecha.value = null;
    filterPeriodo.value = null;
  };
  
  // Función para volver
  const volver = () => {
    router.push("/AsignacionHuella");
  };
  </script>
  
  <style scoped>
  </style>
  