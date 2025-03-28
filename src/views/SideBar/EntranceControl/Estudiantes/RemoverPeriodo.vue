<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <h1 class="text-3xl font-bold text-center mb-6">Remover Estudiantes de Período</h1>

    <Toast />

    <!-- Filtros y búsqueda -->
    <div class="flex flex-wrap gap-4 mb-6 items-center">
      <Dropdown
        v-model="periodoSeleccionado"
        :options="periodos"
        optionLabel="PeriodoNombre"
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
        <strong>{{ periodoSeleccionado?.PeriodoNombre }}</strong>?
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
import { API, type UsuarioXPeriodoDVM, type Periodo } from "@/ApiRoute";
import Toast from 'primevue/toast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const usuariosXPeriodoDVM = ref<UsuarioXPeriodoDVM[]>([]);
const estudiantesSeleccionados = ref<UsuarioXPeriodoDVM[]>([]);
const periodos = ref<Periodo[]>([]);
const periodoSeleccionado = ref<Periodo | null>(null);
const busquedaNombre = ref('');
const busquedaCedula = ref('');
const errorMensaje = ref('');
const dialogoVisible = ref(false);

// 🔹 Cargar períodos
const fetchPeriodos = async () => {
  try {
    const res = await fetch(`${API}/periodos`);
    periodos.value = await res.json();
  } catch (error) {
    errorMensaje.value = 'Error al cargar períodos.';
  }
};

// 🔹 Cargar estudiantes del período seleccionado (usando campos Internal)
const fetchEstudiantesDelPeriodo = async (periodoId: number) => {
  try {
    const res = await fetch(`${API}/usuarioxPeriodo/periodo/${periodoId}`);
    const data = await res.json();

    usuariosXPeriodoDVM.value = data.map((rel: any) => ({
      Internal_ID: rel.usuario.Internal_ID,
      Internal_Name: rel.usuario.Internal_Name,
      Internal_LastName: rel.usuario.Internal_LastName,
      Internal_Email: rel.usuario.Internal_Email,
      Internal_Area: rel.usuario.Internal_Area || 'N/A',
      Periodo_ID: rel.periodo.Periodo_ID,
      PeriodoNombre: rel.periodo.PeriodoNombre,
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
    return coincideNombre && coincideCedula;
  });
});

// 🔹 Limpiar filtros
const limpiarFiltros = () => {
  busquedaNombre.value = '';
  busquedaCedula.value = '';
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
      await fetch(`${API}/usuarioxPeriodo/${periodoSeleccionado.value?.Periodo_ID}/${estudiante.Internal_ID}`, {
        method: 'DELETE',
      });
    }

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Estudiantes removidos correctamente',
      life: 3000,
    });

    estudiantesSeleccionados.value = [];
    if (periodoSeleccionado.value) {
      await fetchEstudiantesDelPeriodo(periodoSeleccionado.value.Periodo_ID);
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

// 🔹 Observa cambios de período
watch(periodoSeleccionado, (nuevoPeriodo) => {
  if (nuevoPeriodo) {
    fetchEstudiantesDelPeriodo(nuevoPeriodo.Periodo_ID);
  } else {
    usuariosXPeriodoDVM.value = [];
  }
});

// 🔹 Cargar inicial
onMounted(fetchPeriodos);
</script>
