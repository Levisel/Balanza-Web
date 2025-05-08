<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <h1 class="text-3xl font-bold text-center mb-6">Remover Estudiantes de Período</h1>

    <Toast />

    <!-- Filtros y búsqueda -->
    <div class="flex flex-wrap gap-4 mb-6 items-center">
      <Dropdown
        v-model="periodoSeleccionado"
        :options="periodos"
        optionLabel="Period_Name"
        placeholder="Seleccionar Período"
        class="w-72"
      />
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


      <Button
        label="Limpiar Filtros"
        icon="pi pi-filter-slash"
        class="p-button-outlined p-button-secondary"
        @click="limpiarFiltros"
      />

      <div v-if="estudiantesSeleccionados.length > 0" class="text-lg font-semibold">
        {{ estudiantesSeleccionados.length }} estudiantes seleccionados
      </div>

      <Button
        v-if="estudiantesSeleccionados.length > 0"
        label="Remover del Período"
        icon="pi pi-trash"
        class="p-button-danger"
        @click="mostrarConfirmacion"
      />
    </div>

    <Message v-if="errorMensaje" severity="error" class="mb-4">
      {{ errorMensaje }}
    </Message>

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

    <!-- Diálogo de confirmación -->
    <Dialog v-model:visible="dialogoVisible" header="Confirmar Remoción" :modal="true">
      <p class="mb-5">
        ¿Está seguro de remover a los estudiantes seleccionados del período
        <strong>{{ periodoSeleccionado?.Period_Name }}</strong>?
      </p>
      <div class="flex justify-end gap-3">
        <Button label="Cancelar" class="p-button-text p-button-danger" @click="dialogoVisible = false" />
        <Button label="Remover" class="p-button-danger" @click="removerEstudiantes" />
      </div>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { API, type UserXPeriodDVM, type Period } from "@/ApiRoute";
import Toast from 'primevue/toast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { useSubjects } from '@/useSubjects';
import axios from 'axios'; // Asegúrate de importar axios

const toast = useToast();

const usuariosXPeriodoDVM = ref<UserXPeriodDVM[]>([]);
const estudiantesSeleccionados = ref<UserXPeriodDVM[]>([]);
const periodos = ref<Period[]>([]);
const periodoSeleccionado = ref<Period | null>(null);
const busquedaNombre = ref('');
const busquedaCedula = ref('');
const errorMensaje = ref('');
const dialogoVisible = ref(false);
const { subjects: opcionesAreas } = useSubjects();
const areaSeleccionada = ref<string | null>(null);




// 🔹 Cargar períodos
const fetchPeriodos = async () => {
  try {
    const res = await axios.get(`${API}/periodos`);
    periodos.value = res.data;
    console.log('periodos.value', periodos.value);
  } catch (error) {
    errorMensaje.value = 'Error al cargar períodos.';
  }
};

// 🔹 Cargar estudiantes del período seleccionado (usando campos Internal)
const fetchEstudiantesDelPeriodo = async (periodId: number) => {
  console.log('periodId', periodId);
  try {
    const res = await axios.get(`${API}/usuarioxPeriodo/periodo/${periodId}`);
    const data = res.data;

    usuariosXPeriodoDVM.value = data.map((rel: any) => ({
      Internal_ID: rel.user.Internal_ID,
      Internal_Name: rel.user.Internal_Name,
      Internal_LastName: rel.user.Internal_LastName,
      Internal_Email: rel.user.Internal_Email,
      Internal_Area: rel.user.Internal_Area || 'N/A',
      Period_ID: rel.period.Period_ID,
      Period_Name: rel.period.Period_Name,
    }));

  } catch (error) {
    errorMensaje.value = 'Error al cargar estudiantes.';
  }
};

// 🔹 Filtrar estudiantes (usando campos Internal)
const estudiantesFiltrados = computed(() => {
  return usuariosXPeriodoDVM.value.filter(est => {
    const coincideNombre = (est.Internal_Name + ' ' + est.Internal_LastName)
      .toLowerCase()
      .includes(busquedaNombre.value.toLowerCase());

    const coincideCedula = est.Internal_ID.includes(busquedaCedula.value);

    const coincideArea = areaSeleccionada.value
      ? est.Internal_Area === areaSeleccionada.value
      : true;

    return coincideNombre && coincideCedula && coincideArea;
  });
});


// 🔹 Limpiar filtros
const limpiarFiltros = () => {
  periodoSeleccionado.value = null;
  busquedaNombre.value = '';
  busquedaCedula.value = '';
  areaSeleccionada.value = null;
  estudiantesSeleccionados.value = [];
};


// 🔹 Mostrar confirmación
const mostrarConfirmacion = () => {
  dialogoVisible.value = true;
};

// 🔹 Remover estudiantes del período
const removerEstudiantes = async () => {
  dialogoVisible.value = false;

  try {
    for (const estudiante of estudiantesSeleccionados.value) {
      await axios.delete(`${API}/usuarioxPeriodo/${periodoSeleccionado.value?.Period_ID}/${estudiante.Internal_ID}`);
    }

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Estudiantes removidos correctamente',
      life: 3000,
    });

    estudiantesSeleccionados.value = [];
    if (periodoSeleccionado.value) {
      console.log('periodoSeleccionado.value.Period_ID', periodoSeleccionado.value.Period_ID);
      await fetchEstudiantesDelPeriodo(periodoSeleccionado.value.Period_ID);
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo remover a los estudiantes',
      life: 4000,
    });
  }
};

// Observa cambios de período
watch(periodoSeleccionado, (nuevoPeriodo) => {
  if (nuevoPeriodo) {
    console.log('nuevoPeriodo.Period_ID', nuevoPeriodo.Period_ID);
    fetchEstudiantesDelPeriodo(nuevoPeriodo.Period_ID);
  } else {
    usuariosXPeriodoDVM.value = [];
  }
});

// Cargar inicial
onMounted(fetchPeriodos);
</script>
