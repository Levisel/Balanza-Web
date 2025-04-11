<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <h1 class="text-3xl font-bold text-center mb-6">Asignar Área a Estudiantes</h1>

    <Toast />

    <!-- Contenedor principal de filtros y acciones -->
    <div class="w-full max-w-6xl mb-4">
      <!-- Botón "Limpiar Filtros" en la parte superior derecha -->
      <div class="flex justify-end">
        <Button label="Limpiar Filtros"
                icon="pi pi-filter-slash"
                class="p-button-outlined p-button-secondary"
                @click="limpiarFiltros" />
      </div>

      <!-- Label aclarativo para filtros -->
      <div class="mt-4">
        <p class="text-lg font-bold">Filtros</p>
      </div>

      <!-- Filtros e inputs -->
      <div class="flex flex-wrap gap-4 items-center mt-2">
        <Dropdown v-model="periodoSeleccionado"
                  :options="periodos"
                  optionLabel="PeriodoNombre"
                  placeholder="Filtrar por Período"
                  class="w-72" />

        <InputText v-model="busquedaCedula"
                   placeholder="Buscar por Cédula"
                   class="w-60 p-inputtext-lg" />

        <InputText v-model="busquedaNombre"
                   placeholder="Buscar por Nombre y Apellido"
                   class="w-72 p-inputtext-lg" />

                   <Dropdown
  v-model="filtroArea"
  :options="filtroAreasOpciones"
  optionLabel="label"
  optionValue="value"
  placeholder="Filtrar por Área"
  class="w-60"
/>


        <!-- Label aclarativo para la sección de selección -->
        <div class="w-full max-w-6xl mb-1">
          <p class="text-lg font-bold">Selección:</p>
        </div>

        <Dropdown
  v-model="areaSeleccionada"
  :options="opcionesAreas"
  optionLabel="label"
  optionValue="value"
  placeholder="Seleccionar Área para Asignar"
  class="w-72"
/>


        <Button label="Asignar Área"
                icon="pi pi-check"
                class="p-button-success"
                :disabled="estudiantesSeleccionados.length === 0 || !areaSeleccionada"
                @click="confirmarAsignacion" />
      </div>
    </div>

    <Message v-if="errorMensaje" severity="error" class="mb-4">{{ errorMensaje }}</Message>

    <DataTable :value="estudiantesFiltrados"
               v-model:selection="estudiantesSeleccionados"
               paginator :rows="10"
               class="w-full max-w-6xl shadow-lg"
               removableSort>
      <Column selectionMode="multiple" headerStyle="width: 3rem" />
      <Column field="Internal_ID" header="Cédula" sortable />
      <Column field="Internal_Name" header="Nombres" sortable />
      <Column field="Internal_LastName" header="Apellidos" sortable />
      <Column field="Internal_Email" header="Correo" sortable />
      <Column field="Internal_Area" header="Área Actual" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Internal_Area || 'Sin Asignar' }}
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="dialogoVisible"
            header="Confirmar Asignación"
            :modal="true">
      <p>¿Está seguro de asignar el área <strong>{{ areaSeleccionada }}</strong> a los {{ estudiantesSeleccionados.length }} estudiantes seleccionados?</p>
      <div class="flex justify-end gap-3">
        <Button label="Cancelar" class="p-button-danger" @click="dialogoVisible = false" />
        <Button label="Confirmar" class="p-button-success" @click="asignarArea" />
      </div>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { API, type Usuario, type Periodo } from "@/ApiRoute";
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Dialog from 'primevue/dialog';
import { useSubjects } from "@/useSubjects";

const { subjects: opcionesAreas } = useSubjects(); // ← Esto reemplaza tu arreglo hardcoded


const toast = useToast();

// 📌 Estados
const estudiantes = ref<Usuario[]>([]);
const estudiantesSeleccionados = ref<Usuario[]>([]);
const areaSeleccionada = ref<string | null>(null);
const filtroArea = ref<string | null>("Todos");
const busquedaNombre = ref('');
const busquedaCedula = ref('');
const dialogoVisible = ref(false);
const errorMensaje = ref('');
const periodos = ref<Periodo[]>([]);
const periodoSeleccionado = ref<Periodo | null>(null);



// 📌 Fetch de períodos
const fetchPeriodos = async () => {
  try {
    const res = await fetch(`${API}/periodos`);
    if (!res.ok) throw new Error('Error al obtener períodos');
    periodos.value = await res.json();
  } catch (err) {
    errorMensaje.value = 'Error al cargar períodos.';
  }
};

// 📌 Fetch de estudiantes (usando Internal)
const fetchEstudiantes = async () => {
  try {
    const res = await fetch(`${API}/usuarioInterno/estudiantes`);
    if (!res.ok) throw new Error('Error al obtener estudiantes');
    estudiantes.value = await res.json();
  } catch (err) {
    errorMensaje.value = 'Error al cargar estudiantes.';
  }
};

// 📌 Fetch estudiantes por período (mapeando campos Internal)
const fetchEstudiantesPorPeriodo = async (periodoId: number) => {
  try {
    const res = await fetch(`${API}/usuarioxPeriodo/periodo/${periodoId}`);
    if (!res.ok) throw new Error('Error al obtener estudiantes del período');
    const data = await res.json();

    estudiantes.value = data.map((rel: any) => ({
      Internal_ID: rel.usuario.Internal_ID,
      Internal_Name: rel.usuario.Internal_Name,
      Internal_LastName: rel.usuario.Internal_LastName,
      Internal_Email: rel.usuario.Internal_Email,
      Internal_Area: rel.usuario.Internal_Area || 'Sin Asignar',
    }));
  } catch (err) {
    errorMensaje.value = 'Error al cargar estudiantes por período.';
  }
};

const filtroAreasOpciones = computed(() => [
  { label: "Todos", value: "Todos" },
  { label: "Sin Asignar", value: "Sin Asignar" },
  ...opcionesAreas.value,
]);


// 📌 Filtro dinámico (usando campos Internal)
const estudiantesFiltrados = computed(() => {
  return estudiantes.value.filter(est => {
    const coincideNombre = (est.Internal_Name + ' ' + est.Internal_LastName)
      .toLowerCase().includes(busquedaNombre.value.toLowerCase());
    const coincideCedula = est.Internal_ID.includes(busquedaCedula.value);

    const coincideArea = filtroArea.value === "Todos"
      ? true
      : filtroArea.value === "Sin Asignar"
        ? !est.Internal_Area || est.Internal_Area === "Sin Asignar"
        : est.Internal_Area === filtroArea.value;

    return coincideNombre && coincideCedula && coincideArea;
  });
});

// 📌 Watch: Cargar estudiantes cada vez que cambia el período
watch(periodoSeleccionado, async (nuevo) => {
  if (nuevo) {
    await fetchEstudiantesPorPeriodo(nuevo.Periodo_ID);
  } else {
    await fetchEstudiantes();
  }
});

// 📌 Limpiar filtros
const limpiarFiltros = () => {
  periodoSeleccionado.value = null;
  busquedaNombre.value = '';
  busquedaCedula.value = '';
  filtroArea.value = 'Todos';
  estudiantesSeleccionados.value = [];
  areaSeleccionada.value = null;
  fetchEstudiantes();
};

// 📌 Mostrar confirmación
const confirmarAsignacion = () => {
  dialogoVisible.value = true;
};

// 📌 Asignar área (actualizando campo Internal_Area)
const asignarArea = async () => {
  dialogoVisible.value = false;

  try {
    for (const estudiante of estudiantesSeleccionados.value) {
      const payload = { Internal_Area: areaSeleccionada.value };

      const res = await fetch(`${API}/internal-user/${estudiante.Internal_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Error al actualizar área de ${estudiante.Internal_ID}`);
    }

    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Área asignada correctamente', life: 3000 });

    if (periodoSeleccionado.value) {
      await fetchEstudiantesPorPeriodo(periodoSeleccionado.value.Periodo_ID);
    } else {
      await fetchEstudiantes();
    }

    limpiarFiltros();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: (err as Error).message, life: 4000 });
  }
};

onMounted(() => {
  fetchPeriodos();
  fetchEstudiantes();
});
</script>

<style scoped>
/* Estilos personalizados */
</style>
