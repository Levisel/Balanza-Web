<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useDarkMode } from "@/components/ThemeSwitcher";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import { API } from "@/ApiRoute";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const toast = useToast();
const { isDarkTheme } = useDarkMode();
const authStore = useAuthStore();
const busquedaCedula = ref("");


const user = authStore.user;
const isEstudiante = user?.type === "Estudiante";
const isAdminOrSecretaria = user?.type === "Administrador" || user?.type === "Secretaria";
const internalId = user?.id;

const alertas = ref<any[]>([]);
const fechaInicio = ref<string | null>(null);
const fechaFin = ref<string | null>(null);
const estadoSeleccionado = ref<string | null>(null);
const modalMensajeVisible = ref(false);
const mensajeSeleccionado = ref("");

const estados = [
  { label: "Pendiente", value: "Pendiente" },
  { label: "Revisado", value: "Revisado" },
];

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

const formatAlertType = (type: string) =>
  type.replace(/_/g, " ");

const fetchAlertas = async () => {
  try {
    const endpoint = isEstudiante
      ? `${API}/alerta/usuario/${internalId}`
      : `${API}/alerta`;

    const { data } = await axios.get(endpoint, {
      withCredentials: true,
    });

    alertas.value = data;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudieron cargar las alertas",
      life: 3000,
    });
  }
};

const marcarComoRevisado = async (alertaId: number) => {
  try {
    await axios.put(`${API}/alerta/${alertaId}`, {
      Alert_Approval_Status: "Revisado",
    }, { withCredentials: true });
    await fetchAlertas();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo marcar la alerta como revisada.",
      life: 3000,
    });
  }
};

const verMensajeCompleto = async (mensaje: string, alertaId: number, estadoActual: string) => {
  mensajeSeleccionado.value = mensaje;
  modalMensajeVisible.value = true;

  if (estadoActual === "Pendiente" && isEstudiante) {
    await marcarComoRevisado(alertaId);
  }
};

const alertasFiltradas = computed(() => {
  return alertas.value.filter(alerta => {
    const fecha = new Date(alerta.Alert_Date);
    const cumpleInicio = !fechaInicio.value || fecha >= new Date(fechaInicio.value);
    const cumpleFin = !fechaFin.value || fecha <= new Date(fechaFin.value);
    const cumpleEstado = !estadoSeleccionado.value || alerta.Alert_Approval_Status === estadoSeleccionado.value;
    const cumpleCedula = !busquedaCedula.value || (alerta.Internal_ID ?? "").toString().includes(busquedaCedula.value.trim());
    return cumpleInicio && cumpleFin && cumpleEstado && cumpleCedula;
  });
});


const resetFiltros = () => {
  fechaInicio.value = null;
  fechaFin.value = null;
  estadoSeleccionado.value = null;
};

onMounted(() => {
  fetchAlertas();
});
</script>

<template>
    <main class="p-8 max-w-6xl mx-auto min-h-screen">
      <Toast />
      <h1 class="text-3xl font-bold mb-6">📢 Alertas del Estudiante</h1>
  
      <!-- Filtros -->
      <div class="flex flex-wrap gap-4 mb-8 justify-center items-end">
        
        <div class="flex flex-col">
          <label class="mb-1 text-sm font-medium">Cédula</label>
          <InputText
        v-model="busquedaCedula"
        placeholder="Buscar por Cédula"
        class="w-60 p-inputtext-lg"
      />
        </div>
  
                <div class="flex flex-col">
          <label class="mb-1 text-sm font-medium">Fecha de Inicio Desde</label>
          <InputText v-model="fechaInicio" type="date" class="w-60" />
        </div>

        <div class="flex flex-col">
          <label class="mb-1 text-sm font-medium">Fecha de Fin Hasta</label>
          <InputText v-model="fechaFin" type="date" class="w-60" />
        </div>

  
        <div class="flex flex-col">
          <label class="mb-1 text-sm font-medium">Estado</label>
          <Dropdown
            v-model="estadoSeleccionado"
            :options="estados"
            optionLabel="label"
            optionValue="value"
            placeholder="Filtrar por estado"
            class="w-60 p-inputtext-sm"
            showClear
          />
        </div>
  
        <div class="flex items-center mt-2 md:mt-0">
          <Button label="Restablecer filtros" icon="pi pi-filter-slash" class="p-button-outlined" @click="resetFiltros" />
        </div>
      </div>
  
      <!-- Tabla de alertas -->
      <DataTable
        :value="alertasFiltradas"
        :rows="9"
        paginator
        responsiveLayout="scroll"
        class="w-full"
      >
        <Column header="Tipo de Alerta" sortable>
          <template #body="slotProps">
            <span class="font-bold text-lg">
              🔔 {{ slotProps.data.Alert_Type.replace(/_/g, " ") }}
            </span>
          </template>
        </Column>
  
        <Column header="Fecha" field="Alert_Date" sortable>
          <template #body="slotProps">
            {{ formatDate(slotProps.data.Alert_Date) }}
          </template>
        </Column>
  
        <Column v-if="isAdminOrSecretaria" header="Estudiante" field="Internal_ID" sortable>
          <template #body="slotProps">
            <span class="font-mono text-sm">{{ slotProps.data.Internal_ID }}</span>
          </template>
        </Column>
  
        <Column header="Mensaje">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <span class="truncate max-w-[200px]">{{ slotProps.data.Alert_Message }}</span>
              <Button
                v-if="slotProps.data.Alert_Message?.length > 60"
                icon="pi pi-eye"
                class="p-button-text text-blue-500"
                @click="verMensajeCompleto(slotProps.data.Alert_Message, slotProps.data.Alert_ID, slotProps.data.Alert_Approval_Status)"
                v-tooltip.top="'Ver mensaje completo'"
              />
            </div>
          </template>
        </Column>
  
        <Column header="Estado" field="Alert_Approval_Status" sortable>
          <template #body="slotProps">
            <span
              class="text-xs px-2 py-1 rounded-full"
              :class="slotProps.data.Alert_Approval_Status === 'Pendiente'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'"
            >
              {{ slotProps.data.Alert_Approval_Status }}
            </span>
          </template>
        </Column>
      </DataTable>
  
      <!-- Modal -->
      <Dialog
        v-model:visible="modalMensajeVisible"
        header="Mensaje de Alerta"
        modal
        :style="{ width: '50vw' }"
        :breakpoints="{ '960px': '90vw' }"
      >
        <p class="whitespace-pre-wrap leading-relaxed">
          {{ mensajeSeleccionado }}
        </p>
      </Dialog>
    </main>
  </template>
  
