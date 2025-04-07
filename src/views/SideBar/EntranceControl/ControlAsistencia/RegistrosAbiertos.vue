<template>
  <main class="p-8">
    <!-- Encabezado -->
    <div class="w-full flex items-center justify-between mb-8">
      <Button 
        icon="pi pi-arrow-left" 
        class="p-button-text text-blue-600 hover:text-blue-800" 
        @click="volver" 
        tooltip="Volver al listado" 
        tooltipOptions="{ position: 'top' }" 
      />
      <h1 class="text-3xl font-bold text-center flex-grow">Registros Abiertos</h1>
      <div class="w-10"></div>
    </div>
    
    <Toast />
    
    <!-- Filtros -->
    <div class="flex flex-wrap gap-4 mb-6 items-center justify-center">
      <!-- Filtro: Cédula -->
      <div class="flex flex-col">
        <label class="mb-1 font-medium">Filtrar por cédula:</label>
        <InputText 
          v-model="filterCedula" 
          placeholder="Ingrese la cédula" 
          class="w-60" 
        />
      </div>
      <!-- Filtro: Nombre -->
      <div class="flex flex-col">
        <label class="mb-1 font-medium">Filtrar por nombre:</label>
        <InputText 
          v-model="filterNombre" 
          placeholder="Ingrese el nombre" 
          class="w-72" 
        />
      </div>
      <!-- Filtro: Fecha -->
      <div class="flex flex-col">
        <label class="mb-1 font-medium">Fecha</label>
        <InputText v-model="filterFecha" type="date" class="w-60" />
      </div>
      <!-- Botón para limpiar filtros -->
      <Button
        label="Limpiar filtros"
        icon="pi pi-filter-slash"
        class="p-button-outlined p-button-secondary mt-5"
        @click="limpiarFiltros"
      />
    </div>

    <!-- DataTable de registros abiertos -->
    <DataTable :value="filteredRecords" paginator rows="10" class="w-full">
      <Column field="usuarioXPeriodo.usuario.Internal_ID" header="Cédula" sortable></Column>
      <Column header="Nombre" sortable>
        <template #body="slotProps">
          {{ slotProps.data.usuarioXPeriodo.usuario.Internal_Name }} 
          {{ slotProps.data.usuarioXPeriodo.usuario.Internal_LastName }}
        </template>
      </Column>
      <Column field="usuarioXPeriodo.usuario.Internal_Email" header="Correo" sortable></Column>
      <Column field="Registro_Entrada" header="Hora de Entrada" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.Registro_Entrada) }}
        </template>
      </Column>
      <Column field="Registro_Tipo" header="Tipo de Registro" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Registro_Tipo }}
        </template>
      </Column>
      <Column header="Acciones">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button 
              icon="pi pi-pencil" 
              class="p-button-rounded p-button-warning" 
              @click="openEditModal(slotProps.data)" 
              tooltip="Registrar Salida" 
            />
            <Button 
              icon="pi pi-trash" 
              class="p-button-rounded p-button-danger" 
              @click="openDeleteConfirm(slotProps.data)" 
              tooltip="Eliminar Registro" 
            />
          </div>
        </template>
      </Column>
    </DataTable>
    
    <!-- Modal para registrar la hora de salida -->
    <Dialog 
      v-model:visible="editModalVisible" 
      header="Registrar Hora de Salida" 
      modal 
      :closable="false" 
      style="width: 30rem"
    >
      <div class="p-4">
        <p class="mb-2">Ingrese la hora de salida para este registro:</p>
        <InputText 
          v-model="editSalida" 
          type="datetime-local" 
          class="w-full" 
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 pt-4">
          <Button label="Cancelar" class="p-button-text" @click="closeEditModal" />
          <Button label="Guardar" class="p-button-success" @click="saveSalida" />
        </div>
      </template>
    </Dialog>
    
    <!-- Modal de confirmación para eliminar registro -->
    <Dialog 
      v-model:visible="deleteDialogVisible" 
      header="Confirmar eliminación" 
      modal 
      :closable="false" 
      style="width: 30rem"
    >
      <div class="p-4">
        <p class="text-center text-lg">¿Está seguro de que desea eliminar este registro?</p>
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
import Toast from "primevue/toast";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useToast } from "primevue/usetoast";
import { API } from "@/ApiRoute";

const router = useRouter();
const toast = useToast();

const records = ref([]);

// Filtros
const filterCedula = ref("");
const filterNombre = ref("");
const filterFecha = ref(null);

const limpiarFiltros = () => {
  filterCedula.value = "";
  filterNombre.value = "";
  filterFecha.value = null;
};

// Método para cargar registros abiertos
const loadRecords = async () => {
  try {
    const response = await fetch(`${API}/registrosAbiertos`);
    // Si se recibe un 404, significa que no hay registros abiertos; se limpia la tabla
    if (response.status === 404) {
      records.value = [];
      return;
    }
    if (!response.ok) throw new Error("Error al cargar registros abiertos");
    records.value = await response.json();
  } catch (error: any) {
    // Si el error es 404, se limpia la lista
    if (error.status === 404) {
      records.value = [];
    } else {
      toast.add({ severity: "error", summary: "Error", detail: error.message, life: 3000 });
    }
  }
};

onMounted(loadRecords);

// Función para formatear fecha
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString();
};

// Computed para filtrar registros
const filteredRecords = computed(() => {
  const filterDateStr = filterFecha.value ? new Date(filterFecha.value).toISOString().split("T")[0] : "";
  return records.value.filter((reg) => {
    const ced = reg.usuarioXPeriodo?.usuario?.Internal_ID?.toLowerCase() || "";
    const nombre = (reg.usuarioXPeriodo?.usuario?.Internal_Name + " " + reg.usuarioXPeriodo?.usuario?.Internal_LastName).toLowerCase();
    const fecha = reg.Registro_Entrada ? new Date(reg.Registro_Entrada).toISOString().split("T")[0] : "";
    return ced.includes(filterCedula.value.toLowerCase()) &&
           nombre.includes(filterNombre.value.toLowerCase()) &&
           fecha.includes(filterDateStr);
  });
});

// Modal de edición para registrar la hora de salida
const editModalVisible = ref(false);
const selectedRegistro = ref<any>(null);
const editSalida = ref("");

// Abrir modal de edición
const openEditModal = (registro: any) => {
  selectedRegistro.value = registro;
  const entrada = new Date(registro.Registro_Entrada);
  // Establecer la hora de salida por defecto: 1 hora después de la hora de entrada
  const defaultSalida = new Date(entrada.getTime() + 60 * 60 * 1000);
  editSalida.value = defaultSalida.toISOString().substring(0, 16);
  editModalVisible.value = true;
};

const closeEditModal = () => {
  editModalVisible.value = false;
};

// Validar que la hora de salida sea posterior a la de entrada y esté en el mismo día
const validarSalida = (): boolean => {
  if (!selectedRegistro.value) return false;
  const entrada = new Date(selectedRegistro.value.Registro_Entrada);
  const salida = new Date(editSalida.value);
  if (salida <= entrada) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "La hora de salida debe ser posterior a la hora de entrada.",
      life: 3000,
    });
    return false;
  }
  if (entrada.toISOString().substring(0,10) !== salida.toISOString().substring(0,10)) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "La hora de salida debe estar en el mismo día que la hora de entrada.",
      life: 3000,
    });
    return false;
  }
  return true;
};

// Guardar la hora de salida (PUT /registros/:id/salida)
const saveSalida = async () => {
  if (!selectedRegistro.value) {
    toast.add({ severity: "error", summary: "Error", detail: "No se seleccionó registro", life: 3000 });
    return;
  }
  if (!validarSalida()) return;
  try {
    const registroId = selectedRegistro.value.Registro_ID;
    const response = await fetch(`${API}/registros/${registroId}/salida`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Registro_Salida: editSalida.value })
    });
    if (!response.ok) throw new Error("No se pudo actualizar la hora de salida");
    toast.add({ severity: "success", summary: "Actualizado", detail: "Registro actualizado correctamente", life: 3000 });
    closeEditModal();
    await loadRecords(); // Recargar registros para refrescar la tabla (si no hay registros, se limpia)
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.message, life: 3000 });
  }
};

// Modal de confirmación para eliminar registro
const deleteDialogVisible = ref(false);
const registroToDelete = ref<any>(null);

const openDeleteConfirm = (registro: any) => {
  registroToDelete.value = registro;
  deleteDialogVisible.value = true;
};

const cancelDelete = () => {
  deleteDialogVisible.value = false;
};

const confirmDelete = async () => {
  if (!registroToDelete.value) return;
  try {
    const response = await fetch(`${API}/registros/${registroToDelete.value.Registro_ID}`, {
      method: "DELETE"
    });
    if (!response.ok) throw new Error("No se pudo eliminar el registro");
    toast.add({ severity: "success", summary: "Eliminado", detail: "Registro eliminado", life: 3000 });
    deleteDialogVisible.value = false;
    await loadRecords();
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.message, life: 3000 });
  }
};

// Función para volver
const volver = () => {
  router.push("/AsignacionHuella");
};
</script>

<style scoped>
/* Puedes agregar estilos adicionales aquí */
</style>
