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
        optionLabel="PeriodoNombre"
        placeholder="Filtrar por Período"
        class="w-72"
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
      <Column field="Usuario_Cedula" header="Cédula" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Usuario_Cedula || "N/A" }}
        </template>
      </Column>
      <Column field="Usuario_Nombres" header="Nombres" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Usuario_Nombres || "N/A" }}
        </template>
      </Column>
      <Column field="Usuario_Apellidos" header="Apellidos" sortable>
        <template #body="slotProps">
          {{ slotProps.data.Usuario_Apellidos || "N/A" }}
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
      <!-- Columna para mostrar si tiene huella -->
      <Column field="TieneHuella" header="Tiene Huella?" sortable>
        <template #body="slotProps">
          <span v-if="slotProps.data.Usuario_Huella" class="text-green-600 font-bold">✔️</span>
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
              @click="irRegistroHuella(slotProps.data.Usuario_Cedula)"
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
              :disabled="!!slotProps.data.Usuario_Huella"
              :tooltipOptions="{ position: 'top', showDelay: 300 }"
            />

            <!-- Botón para registrar asistencia -->
            <Button
              v-if="slotProps.data.Usuario_Huella"
              icon="pi pi-address-book"
              class="p-button-rounded p-button-success"
              @click="irRegistroAsistencia(slotProps.data.Usuario_Cedula)"
              v-tooltip.bottom="{
                value: 'Registrar Asistencia',
                pt: {
                  arrow: {
                    style: {
                      borderBottomColor: 'var(--p-success-color)'
                    }
                  },
                  text: '!bg-green-600 !text-white !font-medium'
                }
              }"
              :tooltipOptions="{ position: 'top', showDelay: 300 }"
              :disabled="!periodoSeleccionado"
            />

            <!-- Botón para borrar huella -->
            <Button
              v-if="slotProps.data.Usuario_Huella"
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

// Componentes PrimeVue
import Tooltip from 'primevue/tooltip';
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Message from "primevue/message";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";

// Importa las interfaces (ajusta según tu proyecto)
import { API, type UsuarioXPeriodoDVM, type Periodo } from "@/views/Interfaces";

const router = useRouter();
const toast = useToast();

// Estados
const usuariosXPeriodoDVM = ref<UsuarioXPeriodoDVM[]>([]);
const periodos = ref<Periodo[]>([]);
const periodoSeleccionado = ref<Periodo | null>(null);
const busquedaCedula = ref("");
const busquedaNombre = ref("");
const errorMensaje = ref("");
const modalBorrarHuella = ref(false);
const estudianteSeleccionado = ref<UsuarioXPeriodoDVM | null>(null);

// Computed: Filtrar la relación usuario-período según los filtros
const usuariosFiltrados = computed(() => {
  return usuariosXPeriodoDVM.value.filter((est) => {
    const nombreCompleto = `${est.Usuario_Nombres} ${est.Usuario_Apellidos}`.toLowerCase();
    const cedula = est.Usuario_Cedula.toLowerCase();
    const filtroNombre = busquedaNombre.value.trim()
      ? nombreCompleto.includes(busquedaNombre.value.toLowerCase().trim())
      : true;
    const filtroCedula = busquedaCedula.value.trim()
      ? cedula.includes(busquedaCedula.value.toLowerCase().trim())
      : true;
    const filtroPeriodo = periodoSeleccionado.value
      ? est.Periodo_ID === periodoSeleccionado.value.Periodo_ID
      : true;
    return filtroNombre && filtroCedula && filtroPeriodo;
  });
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
};

// Función para obtener períodos desde la API
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

// Función para obtener la relación usuario-período (todos los estudiantes)
// Se usa el endpoint: GET /usuarioxPeriodo/all
const fetchUsuariosXPeriodo = async () => {
  try {
    const res = await fetch(`${API}/usuarioxPeriodo/all`);
    if (!res.ok) throw new Error("Error al obtener usuarios con períodos");
    const data = await res.json();
    // Convertir la estructura a la interfaz UsuarioXPeriodoDVM
    usuariosXPeriodoDVM.value = data.map((rel: any) => ({
      Usuario_Cedula: rel.usuario.Usuario_Cedula,
      Usuario_Nombres: rel.usuario.Usuario_Nombres,
      Usuario_Apellidos: rel.usuario.Usuario_Apellidos,
      Usuario_Correo: rel.usuario.Usuario_Correo,
      Usuario_Area: rel.usuario.Usuario_Area || "N/A",
      Usuario_Huella: rel.usuario.Usuario_Huella || null, // Verificamos si tiene huella
      Periodo_ID: rel.periodo.Periodo_ID,
      PeriodoNombre: rel.periodo.PeriodoNombre,
    }));
  } catch (error) {
    console.error("Error cargando la relación usuario-período:", error);
    errorMensaje.value = "Error al cargar la relación usuario-período.";
  }
};

// Cargar datos al montar
onMounted(() => {
  fetchPeriodos();
  fetchUsuariosXPeriodo();
});

// Función para confirmar borrar huella
const confirmarBorrarHuella = (usuario: UsuarioXPeriodoDVM) => {
  estudianteSeleccionado.value = usuario;
  modalBorrarHuella.value = true;
};

// Función para borrar la huella: se manda la cédula en query y en el body solo Usuario_Huella null
const borrarHuella = async () => {
  if (!estudianteSeleccionado.value) return;
  try {
    const cedula = estudianteSeleccionado.value.Usuario_Cedula;
    const response = await fetch(`${API}/usuarios/${cedula}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Usuario_Huella: null,
      }),
    });
    if (!response.ok) throw new Error("No se pudo borrar la huella.");

    // Actualizar localmente: quitar la huella del usuario en la lista
    const index = usuariosXPeriodoDVM.value.findIndex(
      (u) => u.Usuario_Cedula === estudianteSeleccionado.value?.Usuario_Cedula
    );
    if (index !== -1) {
      usuariosXPeriodoDVM.value[index].Usuario_Huella = null;
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
  const periodoId = periodoSeleccionado.value.Periodo_ID;
  router.push(`/RegistroAsistencia/${cedula}/periodo/${periodoId}`);
  console.log("Redirigiendo a RegistroAsistencia con cédula:", cedula, "y periodo:", periodoId);
};
</script>

<style scoped>
/* Ajusta los estilos según tus necesidades */
</style>
