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
        v-model="periodoSeleccionado"
        :options="periodos"
        optionLabel="PeriodoNombre"
        placeholder="Filtrar por Período"
        class="w-72"
      />
      <Dropdown
        v-model="areaSeleccionada"
        :options="opcionesAreas"
        optionLabel="label"
        optionValue="value"
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
      <Column field="Usuario_Cedula" header="Cédula" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Usuario_Cedula ?? "N/A" }}
        </template>
      </Column>
      <Column field="Usuario_Nombres" header="Nombres" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Usuario_Nombres ?? "N/A" }}
        </template>
      </Column>
      <Column field="Usuario_Apellidos" header="Apellidos" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Usuario_Apellidos ?? "N/A" }}
        </template>
      </Column>
      <Column field="Usuario_Correo" header="Correo Institucional" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Usuario_Correo?.trim() || "N/A" }}
        </template>
      </Column>
      <Column field="Usuario_Area" header="Área" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Usuario_Area?.trim() || "N/A" }}
        </template>
      </Column>

      <!-- 📌 Botones de acciones -->
      <Column header="Acciones">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-warning"
              @click="editarEstudiante(slotProps.data.Usuario_Cedula)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger"
              @click="eliminarEstudiante(slotProps.data.Usuario_Cedula)"
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
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import Message from "primevue/message";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { API, type UsuarioXPeriodoDVM, type Periodo } from  "@/ApiRoute";

const router = useRouter();
const toast = useToast();

// Estados
const usuariosXPeriodoDVM = ref<UsuarioXPeriodoDVM[]>([]);
const periodos = ref<Periodo[]>([]);
const periodoSeleccionado = ref<Periodo | null>(null);
const areaSeleccionada = ref<string | null>(null);
const busquedaNombre = ref("");
const busquedaCedula = ref("");
const errorMensaje = ref("");

// Opciones de áreas
const opcionesAreas = ref([
  { label: "Derecho Penal", value: "Derecho Penal" },
  { label: "Derecho Civil", value: "Derecho Civil" },
  { label: "Derecho Laboral", value: "Derecho Laboral" },
  { label: "Derecho Constitucional", value: "Derecho Constitucional" },
]);

// Función para obtener períodos
const fetchPeriodos = async () => {
  try {
    const res = await fetch(`${API}/periodos`);
    if (!res.ok) throw new Error("Error al obtener períodos");
    periodos.value = await res.json();
  } catch (error) {
    console.error("Error cargando períodos:", error);
    errorMensaje.value = "Error al cargar los períodos.";
  }
};

// Función para obtener la relación usuario-período
const fetchUsuariosXPeriodo = async () => {
  try {
    const res = await fetch(`${API}/usuarioxPeriodo/all`);
    if (!res.ok) throw new Error("Error al obtener usuarios con períodos");
    const data = await res.json();
    // Si no hay registros, hacemos un fallback a obtener usuarios directamente
    if (!data || data.length === 0) {
      const res2 = await fetch(`${API}/usuarios`);
      if (!res2.ok) throw new Error("Error al obtener usuarios");
      // Suponemos que la estructura de /usuarios ya coincide con la interfaz UsuarioXPeriodoDVM
      usuariosXPeriodoDVM.value = await res2.json();
    } else {
      // Convertir la estructura del backend a la nueva interfaz UsuarioXPeriodoDVM
      usuariosXPeriodoDVM.value = data.map((rel: any) => ({
        Usuario_Cedula: rel.usuario.Usuario_Cedula,
        Usuario_Nombres: rel.usuario.Usuario_Nombres,
        Usuario_Apellidos: rel.usuario.Usuario_Apellidos,
        Usuario_Correo: rel.usuario.Usuario_Correo,
        Usuario_Area: rel.usuario.Usuario_Area || "N/A",
        Periodo_ID: rel.periodo.Periodo_ID,
        PeriodoNombre: rel.periodo.PeriodoNombre,
      }));
    }
  } catch (error) {
    console.error("Error cargando UsuarioXPeriodo:", error);
    errorMensaje.value = "Error al cargar la relación usuario-período.";
  }
};

// Computed para filtrar estudiantes según los filtros
const estudiantesFiltrados = computed(() => {
  return usuariosXPeriodoDVM.value.filter((est) => {
    const nombreCompleto = `${est.Usuario_Nombres} ${est.Usuario_Apellidos}`.toLowerCase();
    const ced = est.Usuario_Cedula.toLowerCase();
    const filtrarPorNombre = busquedaNombre.value.trim()
      ? nombreCompleto.includes(busquedaNombre.value.toLowerCase().trim())
      : true;
    const filtrarPorCedula = busquedaCedula.value.trim()
      ? ced.includes(busquedaCedula.value.toLowerCase().trim())
      : true;
    const filtrarPorPeriodo = periodoSeleccionado.value
      ? est.Periodo_ID === periodoSeleccionado.value.Periodo_ID
      : true;
    const filtrarPorArea = areaSeleccionada.value
      ? est.Usuario_Area === areaSeleccionada.value
      : true;
    return filtrarPorNombre && filtrarPorCedula && filtrarPorPeriodo && filtrarPorArea;
  });
});

// Estados para selección de estudiantes (tabla de múltiples)
const estudiantesSeleccionados = ref<UsuarioXPeriodoDVM[]>([]);

// Cargar datos al montar
onMounted(async () => {
  await fetchPeriodos();
  await fetchUsuariosXPeriodo();
});

// Función para limpiar filtros
const limpiarFiltros = () => {
  periodoSeleccionado.value = null;
  areaSeleccionada.value = null;
  busquedaNombre.value = "";
  busquedaCedula.value = "";
};

// 📌 Eliminar un estudiante
const eliminarEstudiante = async (cedula: string) => {
  if (!confirm("¿Seguro que deseas eliminar este estudiante?")) return;

  try {
    const response = await fetch(`${API}/usuarios/${cedula}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Error al eliminar estudiante");

    toast.add({
      severity: "success",
      summary: "Eliminado",
      detail: "Estudiante eliminado correctamente",
      life: 3000,
    });

    await fetchUsuariosXPeriodo(); // Recargar lista
  } catch (error) {
    console.error("❌ Error al eliminar estudiante:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo eliminar el estudiante",
      life: 5000,
    });
  }
};

// 📌 Navegar a edición
const editarEstudiante = (cedula: string) => {
  router.push(`/IngresoManualEstudiantes/${cedula}`);
};



</script>

<style scoped>
/* Puedes ajustar los estilos según tus necesidades */
</style>
