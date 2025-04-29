<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <h1 class="text-3xl font-bold text-center mb-6">Listado de Estudiantes</h1>
    <Toast />

    <!-- Filtros y búsqueda -->
    <div class="flex flex-wrap gap-4 mb-6 items-center place-content-center">
      <InputText
        v-model="busquedaCedula"
        placeholder="Buscar por Cédula"
        class="w-60 p-inputtext-lg"
      />
      <InputText
        v-model="busquedaNombre"
        placeholder="Buscar por Nombre y Apellido"
        class="w-72 p-inputtext-lg"
      />
      <Dropdown
        v-model="selectedPeriod"
        :options="periods"
        optionLabel="Period_Name"
        placeholder="Filtrar por Período"
        class="w-72"
      />


      <Dropdown
        v-model="areaSeleccionada"
        :options="subjects"
        optionLabel="label"
        optionValue="label" 
        placeholder="Filtrar por Área"
        class="w-72"
      />


      <Button
        label="Restablecer filtros"
        icon="pi pi-filter-slash"
        class="p-button-outlined p-button-secondary"
        @click="limpiarFiltros"
      />
    </div>

    <!-- Mensaje de error -->
    <Message v-if="errorMensaje" severity="error" class="mb-4">
      {{ errorMensaje }}
    </Message>

    <!-- Tabla de Estudiantes -->
    <DataTable
      :value="estudiantesFiltrados"
      paginator
      :rows="10"
      class="w-full max-w-6xl shadow-lg"
      removableSort
    >
      <Column field="Internal_ID" header="Cédula" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Internal_ID ?? "N/A" }}
        </template>
      </Column>
      <Column field="Internal_Name" header="Nombres" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Internal_Name ?? "N/A" }}
        </template>
      </Column>
      <Column field="Internal_LastName" header="Apellidos" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Internal_LastName ?? "N/A" }}
        </template>
      </Column>
      <Column field="Internal_Email" header="Correo Institucional" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Internal_Email?.trim() || "N/A" }}
        </template>
      </Column>
      <Column field="Internal_Area" header="Área" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Internal_Area?.trim() || "N/A" }}
        </template>
      </Column>

      <!-- Botones de acciones -->
      <Column header="Acciones">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-warning"
              @click="editarEstudiante(slotProps.data.Internal_ID)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger"
              @click="openDeleteDialog(slotProps.data.Internal_ID)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Modal de edición -->
    <EditStudentsModal
      v-model:visible="m"
      :user="selectedInternalUser"
      @updated="handleStudentUpdated"
    />


    <Dialog
  v-model:visible="deleteDialogVisible"
  header="Confirmar eliminación"
  modal
  :closable="false"
  class="w-full max-w-md"
  style="min-width: 350px;"
>
  <div class="p-4">
    <p class="text-base">¿Estás seguro de que deseas eliminar este estudiante?</p>
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
import { ref, onMounted, computed } from "vue";
import InputText from "primevue/inputtext";
import {watch} from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import Message from "primevue/message";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import EditStudentsModal from "@/components/EditStudentsModal.vue";
import { API, type UserXPeriodDVM, type Period } from "@/ApiRoute";

import { useSubjects } from "@/useSubjects";

const { subjects, loadingSubjects, errorSubjects } = useSubjects();



// Estados y Toast
const toast = useToast();
const usersXPeriod = ref<UserXPeriodDVM[]>([]);
const periods = ref<Period[]>([]);
const selectedPeriod = ref<Period | null>(null);
const areaSeleccionada = ref<string | null>(null);
const busquedaNombre = ref("");
const busquedaCedula = ref("");
const errorMensaje = ref("");




// Función para obtener períodos
const fetchPeriodos = async () => {
  try {
    const res = await fetch(`${API}/periodos`);
    if (!res.ok) throw new Error("Error al obtener períodos");
    periods.value = await res.json();
  } catch (error) {
    console.error("Error cargando períodos:", error);
    errorMensaje.value = "Error al cargar los períodos.";
  }
};

// Función para cargar todos los datos (fusionados) cuando no se filtra por período
const fetchAllUsersXPeriod = async () => {
  try {
    // Obtener estudiantes base
    const resEst = await fetch(`${API}/usuariointerno/estudiantes`);
    if (!resEst.ok) throw new Error("Error al obtener estudiantes");
    const dataEst = await resEst.json();

    let dataRel = [];
    try {
      // Intentar obtener relaciones usuario-período
      const resRel = await fetch(`${API}/usuarioxPeriodo/all`);
      if (resRel.ok) {
        dataRel = await resRel.json();
      } else {
        console.warn("No se pudieron obtener relaciones usuarioxPeriodo. Continuando solo con estudiantes.");
      }
    } catch (error) {
      console.warn("Error en usuarioxPeriodo/all:", error);
    }

    // Armar mapa de relaciones
    const userPeriodsMap = new Map();
    dataRel.forEach((rel: any) => {
      const userId = rel.user.Internal_ID;
      const periodObj = {
        Period_ID: rel.period.Period_ID,
        Period_Name: rel.period.Period_Name,
      };

      if (userPeriodsMap.has(userId)) {
        userPeriodsMap.get(userId).push(periodObj);
      } else {
        userPeriodsMap.set(userId, [periodObj]);
      }
    });

    // Mezclar estudiantes con relaciones
    const mergedMap = new Map();
    dataEst.forEach((student: any) => {
      mergedMap.set(student.Internal_ID, {
        ...student,
        periodos: userPeriodsMap.get(student.Internal_ID) || [],
      });
    });

    // Agregar los que solo vienen desde relaciones
    dataRel.forEach((rel: any) => {
      const userId = rel.user.Internal_ID;
      if (!mergedMap.has(userId)) {
        mergedMap.set(userId, {
          ...rel.user,
          periodos: [{
            Period_ID: rel.period.Period_ID,
            Period_Name: rel.period.Period_Name,
          }],
        });
      }
    });

    usersXPeriod.value = Array.from(mergedMap.values());

  } catch (error) {
    console.error("Error general al cargar estudiantes:", error);
    errorMensaje.value = "No se pudieron cargar los estudiantes.";
  }
};

// Función para cargar asignaciones para un período específico
const fetchUsersByPeriod = async (periodoId: string) => {
  try {
    const res = await fetch(`${API}/usuarioxPeriodo/periodo/${periodoId}`);
    if (!res.ok) throw new Error("Error al obtener asignaciones del período");
    const data = await res.json();
    // Mapear los datos para que cada registro tenga la información del usuario y un array con el período
    usersXPeriod.value = data.map((rel: any) => ({
      ...rel.user,
      periodos: [{
        Period_ID: rel.periodo.Period_ID,
        Period_Name: rel.periodo.Period_Name,
      }]
    }));
  } catch (error) {
    console.error("Error al cargar asignaciones del período:", error);
    errorMensaje.value = "Error al cargar asignaciones del período.";
  }
};



// Computed para filtrar estudiantes según los filtros aplicados
const estudiantesFiltrados = computed(() => {
  return usersXPeriod.value.filter((est) => {
    const nombreCompleto = `${est.Internal_Name} ${est.Internal_LastName}`.toLowerCase();
    const ced = String(est.Internal_ID).toLowerCase();

    const filtrarPorNombre = busquedaNombre.value.trim()
      ? nombreCompleto.includes(busquedaNombre.value.toLowerCase().trim())
      : true;

    const filtrarPorCedula = busquedaCedula.value.trim()
      ? ced.includes(busquedaCedula.value.toLowerCase().trim())
      : true;

    const filtrarPorArea = areaSeleccionada.value
      ? est.Internal_Area === areaSeleccionada.value
      : true;

    const filtrarPorPeriodo = selectedPeriod.value
      ? est.periodos?.some(p => p.Period_ID === selectedPeriod.value?.Period_ID)
      : true;

    return filtrarPorNombre && filtrarPorCedula && filtrarPorArea && filtrarPorPeriodo;
  });
});


// Variables reactivas para el modal de edición
const m = ref(false); // Controla la visibilidad del modal
const selectedInternalUser = ref<UserXPeriodDVM | null>(null);

// Cargar datos al montar
onMounted(async () => {
  await fetchPeriodos();
  await fetchAllUsersXPeriod();
});




// Función para limpiar filtros
const limpiarFiltros = () => {
  selectedPeriod.value = null;
  areaSeleccionada.value = null;
  busquedaNombre.value = "";
  busquedaCedula.value = "";
};

// Función para eliminar un estudiante
const eliminarEstudiante = async (cedula: string) => {
  try {
    const response = await fetch(`${API}/internal-user/${cedula}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error al eliminar estudiante");

    toast.add({
      severity: "success",
      summary: "Eliminado",
      detail: "Estudiante eliminado correctamente",
      life: 3000,
    });
    await fetchAllUsersXPeriod();
  } catch (error) {
    console.error("Error al eliminar estudiante:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo eliminar el estudiante",
      life: 5000,
    });
  }
};

// Función para abrir el modal de edición
const editarEstudiante = (cedula: string) => {
  const estudiante = usersXPeriod.value.find(e => e.Internal_ID === cedula);
  if (estudiante) {
    selectedInternalUser.value = { ...estudiante };
    m.value = true;
  }
};

// Función que se dispara cuando el modal notifica la actualización
const handleStudentUpdated = async () => {
  await fetchAllUsersXPeriod();
  toast.add({
    severity: "success",
    summary: "Actualizado",
    detail: "Estudiante actualizado correctamente",
    life: 3000,
  });
};

// Variables para el diálogo de confirmación de eliminación
const deleteDialogVisible = ref(false);
const studentIdToDelete = ref<string>("");

// Función para abrir el diálogo de eliminación
const openDeleteDialog = (cedula: string) => {
  studentIdToDelete.value = cedula;
  deleteDialogVisible.value = true;
};

// Función que se llama al confirmar la eliminación
const confirmDelete = async () => {
  deleteDialogVisible.value = false;
  await eliminarEstudiante(studentIdToDelete.value);
};

// Función para cancelar la eliminación
const cancelDelete = () => {
  deleteDialogVisible.value = false;
};




</script>

<style scoped>
/* Ajusta estilos según tus necesidades */
</style>
