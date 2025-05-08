<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <h1 class="text-3xl font-bold text-center mb-6">Asignar Huella Biometrica</h1>
    <Toast />

    <!-- Filtros y búsqueda -->
    <div class="flex flex-wrap gap-4 mb-6 items-center justify-center">
      <!-- Dropdown para filtrar por Período -->
      <Dropdown
        v-model="periodoSeleccionado"
        :options="periodos"
        optionLabel="Period_Name"
        placeholder="Filtrar por Período"
        class="w-60"
      />

      <!-- Input para buscar por Cédula -->
      <InputText
        v-model="busquedaCedula"
        placeholder="Buscar por Cédula"
        class="w-60 p-inputtext-lg"
        
      />

      <!-- Input para buscar por Nombre y Apellido -->
      <InputText
        v-model="busquedaNombre"
        placeholder="Buscar por Nombre y Apellido"
        class="w-72 p-inputtext-lg"
      />

      <!-- Dropdown para filtrar por Área -->
<Dropdown
  v-model="areaSeleccionada"
  :options="opcionesAreas"
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

    <!-- Tabla de Estudiantes -->
    <DataTable
      :value="usuariosFiltrados"
      paginator
      :rows="10"
      class="w-full max-w-6xl shadow-lg"
      removableSort
    >
      <Column field="Internal_ID" header="Cédula" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Internal_ID || "N/A" }}
        </template>
      </Column>
      <Column field="Internal_Name" header="Nombres" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Internal_Name || "N/A" }}
        </template>
      </Column>
      <Column field="Internal_LastName" header="Apellidos" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Internal_LastName || "N/A" }}
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
      <!-- Columna para mostrar si tiene huella -->
      <Column field="TieneHuellaValor" header="Tiene Huella?" sortable>
  <template #body="slotProps">
    <span v-if="slotProps.data.Internal_Huella" class="text-green-600 font-bold">✔️</span>
    <span v-else class="text-red-600 font-bold">❌</span>
  </template>
</Column>


      <!-- Columna de acciones -->
      <Column header="Acciones">
        <template #body="slotProps">
          <div class="flex gap-2">
            <!-- Botón para asignar huella -->
            <Button
              icon="pi pi-arrow-right"
              class="p-button-rounded p-button-info"
              @click="irRegistroHuella(slotProps.data.Internal_ID)"
              v-tooltip.bottom="{
                value: 'Asignar Huella Digital',
                pt: {
                  arrow: {
                    style: {
                      borderBottomColor: 'var(--p-primary-color)'
                    }
                  },
                  text: '!bg-primary !text-primary-contrast !font-medium'
                }
              }"
              :disabled="!!slotProps.data.Internal_Huella"
              :tooltipOptions="{ position: 'top', showDelay: 300 }"
            />


            <!-- Botón para borrar huella -->
            <Button
              v-if="slotProps.data.Internal_Huella"
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger"
              @click="confirmarBorrarHuella(slotProps.data)"
              v-tooltip.bottom="{
                value: 'Eliminar Huella Digital',
                pt: {
                  arrow: {
                    style: {
                      borderBottomColor: 'var(--p-danger-color)'
                    }
                  },
                  text: '!bg-red-600 !text-white !font-medium'
                }
              }"
              :tooltipOptions="{ position: 'top', showDelay: 300 }"
            />
          </div>
        </template>
      </Column>

    </DataTable>

    <!-- Modal de Confirmación para borrar huella -->
    <Dialog v-model:visible="modalBorrarHuella" header="Confirmar Eliminación" :modal="true" style="width: 25rem">
      <div class="flex flex-col items-center">
        <p class="mb-4 text-center text-lg font-semibold">
          ¿Estás seguro de que deseas borrar la huella digital?
        </p>
        <div class="flex gap-4 mt-4">
          <Button label="Cancelar" icon="pi pi-times" class="p-button-danger" @click="modalBorrarHuella = false" />
          <Button label="Aceptar" icon="pi pi-check" class="p-button-success" @click="borrarHuella" />
        </div>
      </div>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import axios from "axios";

// Componentes PrimeVue
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Message from "primevue/message";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import {useSubjects} from '@/useSubjects' // ajusta la ruta si está en otra carpeta


// Importa las interfaces (ajusta según tu proyecto)
import { API, type UserXPeriodDVM, type Period } from "@/ApiRoute";

const router = useRouter();
const toast = useToast();

// Estados
const usuariosXPeriodoDVM = ref<UserXPeriodDVM[]>([]);
const periodos = ref<Period[]>([]);
const periodoSeleccionado = ref<Period | null>(null);
const busquedaCedula = ref("");
const busquedaNombre = ref("");
const errorMensaje = ref("");
const modalBorrarHuella = ref(false);
const estudianteSeleccionado = ref<UserXPeriodDVM
 | null>(null);
  const { subjects: opcionesAreas, fetchSubjects } = useSubjects()
const areaSeleccionada = ref<string | null>(null)


// Computed: Filtrar la relación usuario-período según los filtros
const usuariosFiltrados = computed(() => {
  const filtrados = usuariosXPeriodoDVM.value.filter((est) => {
    const nombreCompleto = `${est.Internal_Name} ${est.Internal_LastName}`.toLowerCase();
    const cedula = est.Internal_ID.toLowerCase();
    const filtroNombre = busquedaNombre.value.trim()
      ? nombreCompleto.includes(busquedaNombre.value.toLowerCase().trim())
      : true;
    const filtroCedula = busquedaCedula.value.trim()
      ? cedula.includes(busquedaCedula.value.toLowerCase().trim())
      : true;
    const filtroPeriodo = periodoSeleccionado.value
      ? est.Period_ID === periodoSeleccionado.value.Period_ID
      : true;
    const filtroArea = areaSeleccionada.value
      ? est.Internal_Area?.toLowerCase().includes(areaSeleccionada.value.toLowerCase())
      : true;

    return filtroNombre && filtroCedula && filtroPeriodo && filtroArea;
  });

  const mapa = new Map();
  filtrados.forEach((est) => {
    if (!mapa.has(est.Internal_ID)) {
      mapa.set(est.Internal_ID, {
        ...est,
        TieneHuellaValor: est.Internal_Huella ? 1 : 0, // Agregamos aquí
      });
    }
  });

  return Array.from(mapa.values());
});

// Función para redirigir a RegistroHuella.vue pasando la cédula
const irRegistroHuella = (cedula: string) => {
  router.push(`/RegistroHuella/${cedula}`);
  console.log("Redirigiendo a RegistroHuella con cédula:", cedula);
};

// Función para limpiar filtros
const limpiarFiltros = () => {
  periodoSeleccionado.value = null;
  busquedaCedula.value = "";
  busquedaNombre.value = "";
  areaSeleccionada.value = null
};

// Función para obtener períodos desde la API
const fetchPeriodos = async () => {
  try {
    const { data } = await axios.get(`${API}/periodos`);
    periodos.value = data;
  } catch (error) {
    console.error("Error cargando períodos:", error);
    errorMensaje.value = "Error al cargar los períodos.";
  }
};



// Función para obtener la relación usuario-período
const fetchUsuariosXPeriodo = async () => {
  try {
    const { data: dataEst } = await axios.get(`${API}/usuariointerno/estudiantes`);
    const { data: dataRel } = await axios.get(`${API}/usuarioxPeriodo/all`);

    const periodMap = new Map();
    dataRel.forEach((rel: any) => {
      periodMap.set(rel.user.Internal_ID, {
        Period_ID: rel.period.Period_ID,
        Period_Name: rel.period.Period_Name
      });
    });

    const merged = dataEst.map((student: any) => {
      const periodData = periodMap.get(student.Internal_ID) || {
        Period_ID: null,
        Period_Name: null
      };
      return {
        ...student,
        ...periodData
      };
    });

    dataRel.forEach((rel: any) => {
      if (!merged.find((s: any) => s.Internal_ID === rel.user.Internal_ID)) {
        merged.push({
          ...rel.user,
          Period_ID: rel.period.Period_ID,
          Period_Name: rel.period.Period_Name
        });
      }
    });

    usuariosXPeriodoDVM.value = merged;
  } catch (error) {
    console.error("Error cargando Estudiantes:", error);
    errorMensaje.value = "Error al cargar la relación usuario-período.";
  }
};



// Cargar datos al montar
onMounted(() => {
  fetchPeriodos();
  fetchUsuariosXPeriodo();
  fetchSubjects();
});

// Función para confirmar borrar huella
const confirmarBorrarHuella = (usuario: UserXPeriodDVM) => {
  estudianteSeleccionado.value = usuario;
  modalBorrarHuella.value = true;
};

// Función para borrar la huella: se manda la cédula en query y en el body solo Internal_Huella null
const borrarHuella = async () => {
  if (!estudianteSeleccionado.value) return;
  try {
    const cedula = estudianteSeleccionado.value.Internal_ID;
    await axios.put(`${API}/internal-user/${cedula}`, {
      Internal_Huella: null,
      Internal_Email: estudianteSeleccionado.value.Internal_Email,
    });

    const index = usuariosXPeriodoDVM.value.findIndex(
      (u) => u.Internal_ID === estudianteSeleccionado.value?.Internal_ID
    );
    if (index !== -1) {
      usuariosXPeriodoDVM.value[index].Internal_Huella = null;
    }

    toast.add({
      severity: "success",
      summary: "Huella Eliminada",
      detail: "La huella fue eliminada correctamente.",
      life: 3000,
    });
    modalBorrarHuella.value = false;
  } catch (error) {
    console.error("Error al borrar la huella:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo borrar la huella.",
      life: 5000,
    });
  }
};


// Función para redirigir a RegistroAsistencia.vue pasando la cédula y el id del período seleccionado
const irRegistroAsistencia = (cedula: string) => {
  if (!periodoSeleccionado.value) return; // Por seguridad, aunque el botón esté deshabilitado
  const periodoId = periodoSeleccionado.value.Period_ID;
  router.push(`/RegistroAsistencia/${cedula}/periodo/${periodoId}`);
  console.log("Redirigiendo a RegistroAsistencia con cédula:", cedula, "y periodo:", periodoId);
};
</script>

<style scoped>
</style>
