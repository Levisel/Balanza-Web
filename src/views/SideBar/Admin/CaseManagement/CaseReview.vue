<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { FilterMatchMode, FilterOperator } from "@primevue/core/api";
import router from "@/router";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import Tag from "primevue/tag";
import { useToast } from "primevue/usetoast";
import type { Initial_Consultation, Internal_User } from "@/ApiRoute";
import { API } from "@/ApiRoute";
import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";
// PrimeVue Toast para notificaciones
const toast = useToast();
const confirm = useConfirm();

// Consultas cargadas desde la API
const initialConsultation = ref<Initial_Consultation[]>([]);

// Consulta seleccionada (usada en el modal)
const selectedConsultation = ref<Initial_Consultation>(
  {} as Initial_Consultation
);
// Cachés separadas para nombres de usuarios y usuarios internos
const userNames = ref<Record<string, string>>({});
const internalNames = ref<Record<string, string>>({});

const viewDialogVisible = ref(false);
const editDialogVisible = ref(false);



// Estados disponibles para filtro
const statuses = ref([
  { label: "Alerta", value: 'Alerta' },
  { label: "Sin Alerta", value: 'Sin Alerta' },
]);


const fetchAllInternalUsers = async (): Promise<Record<string, string>> => {
  try {
    const { data } = await axios.get(`${API}/internal-user`);
    // Suponiendo que data es un array de usuarios internos
    return data.reduce((acc: Record<string, string>, user: any) => {
      acc[user.Internal_ID] = user.Internal_Name + " " + user.Internal_LastName;
      return acc;
    }, {});
  } catch (error) {
    console.error("Error al cargar usuarios internos:", error);
    return {};
  }
};

// Función para obtener las consultas de la API
const fetchReviewCases = async (initType: string, initStatus: string) => {
  try {
    const [consultations, internalUsers] = await Promise.all([
      axios.get(`${API}/initial-consultations`, { params: { initType, initStatus } }),
      fetchAllInternalUsers()
    ]);
    initialConsultation.value = consultations.data
      .filter(
        (record: Initial_Consultation) =>
          record.Init_Service !== "Patrocinio" && record.Init_Type !== "En espera" && record.Init_Type !== "Asesoría"
      )
      .map((record: Initial_Consultation) => ({
        ...record,
        Computed_AlertStatus: (record.Init_AlertNote && String(record.Init_AlertNote).trim() !== '') ? 'Alerta' : 'Sin Alerta',
        Internal_FullName: internalUsers[record.Internal_ID] || record.Internal_ID
      }));
  } catch (error) {
    console.error("Error al cargar las consultas:", error);
  }
};

const getUserName = async (userId: string) => {
  try {
    const { data } = await axios.get(`${API}/user/${userId}`);
    return data.User_FirstName + " " + data.User_LastName;
  } catch (error) {
    console.error("Error al cargar el nombre del usuario:", error);
    return userId;
  }
};

const resolveUserName = (userId: string): string => {
  if (userNames.value[userId]) {
    return userNames.value[userId];
  } else {
    getUserName(userId).then((name) => {
      userNames.value = { ...userNames.value, [userId]: name };
    });
    return "Cargando...";
  }
};

const getInternalUserName = async (internalId: string): Promise<string> => {
  try {
    const { data } = await axios.get(`${API}/internal-user/${internalId}`);
    if (!data) throw new Error("No se encontró el usuario interno");
    return data.Internal_Name + " " + data.Internal_LastName;
  } catch (error) {
    console.error("Error al cargar el nombre del usuario interno:", error);
    return internalId;
  }
};

const resolveInternalUserName = (internalId: string): string => {
  if (internalNames.value[internalId]) {
    return internalNames.value[internalId];
  } else {
    getInternalUserName(internalId).then((name) => {
      internalNames.value = { ...internalNames.value, [internalId]: name };
    });
    return "Cargando...";
  }
};

const markAsAdvisory = async (data: Initial_Consultation) => {
  try {
    const response = await axios.put(`${API}/initial-consultations/${data.Init_Code}`, {
      Init_Type: "Asesoría",
      Init_Service: "Asesoría",
      Init_Status: "Activo",
    });
    if (response.status === 200) {
      toast.add({
        severity: "info",
        summary: "Operación Exitosa",
        detail: "La consulta ha sido marcada como Asesoría.",
        life: 3000,
      });
      fetchReviewCases("Por Asignar", "Activo");
    } else {
      throw new Error("Error al marcar la consulta como Asesoría.");
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo marcar la consulta como Asesoría.",
      life: 3000,
    });
    console.error("Error al marcar la consulta como Asesoría:", error);
  }
};

const confirmMarkAsAdvisory = (data: Initial_Consultation) => {
  confirm.require({
    header: "Advertencia",
    icon: "pi pi-info-circle",
    message: "¿Estás seguro de que deseas marcar esta consulta como Asesoría?",
    rejectLabel: "Cancelar",
    rejectProps: { label: "Cancel", severity: "secondary", outlined: true, icon: "pi pi-times" },
    acceptProps: { label: "Aceptar", severity: "info", icon: "pi pi-check-circle" },
    accept: () => markAsAdvisory(data),
  });
};


const defaultFilters = {
  global:   { value: null, matchMode: FilterMatchMode.CONTAINS },
  Init_Code: { value: null, matchMode: FilterMatchMode.CONTAINS },
  Internal_FullName: { value: null, matchMode: FilterMatchMode.CONTAINS }, 
  Init_Subject: { value: null, matchMode: FilterMatchMode.CONTAINS },
  Init_Service: { value: null, matchMode: FilterMatchMode.CONTAINS },
  Init_Status: { value: null, matchMode: FilterMatchMode.CONTAINS },
  Computed_AlertStatus: { value: null, matchMode: FilterMatchMode.EQUALS }, 
};

// Clear filters function
const filters = ref({ ...defaultFilters });

const clearFilter = () => {
  filters.value = { ...defaultFilters };
};

const redirectToConsultation = (data: Initial_Consultation) => {
  router.push({
    name: "NewCase",
    query: { userID: data.User_ID, caseID: data.Init_Code },
  });
};
const urlDocument = ref("");
const watchAttentionSheetDialog = ref(false);

const loadUserAttentionSheet = async (initCode: string) => {
  try {
    const response = await axios.get(
      `${API}/initial-consultations/attention/${initCode}`,
      {
        responseType: "blob",
      }
    );

    if (response.status === 200) {
      const contentType = response.headers["content-type"] || "application/pdf";
      const blob = new Blob([response.data], { type: contentType });
      urlDocument.value = URL.createObjectURL(blob);
      watchAttentionSheetDialog.value = true;
    } else {
      throw new Error(
        `Error al obtener la hoja de atención: ${response.statusText}`
      );
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo cargar la hoja de atención.",
      life: 3000,
    });
    console.error("Error al cargar la hoja de atención:", error);
  }
};

onMounted(() => {
  fetchReviewCases("Por Asignar", "Activo");
});
</script>

<template>
  <Toast />
  <ConfirmDialog />
  <div class="card">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold mb-4">Revisar Casos</h1>
    </div>

    <DataTable
      v-model:filters="filters"
      v-model="selectedConsultation"
      :value="initialConsultation"
      paginator
      :rows="10"
      dataKey="Init_Code"
      filterDisplay="menu"
      size="large"
      removableSort
      :globalFilterFields="[
        'Init_Code',
        'Internal_FullName',
        'User_ID',
        'Init_Subject',
        'Init_Service',
        'Init_Status',
        'Computed_AlertStatus',
      ]"
    >
      <template #header>
        <div class="flex justify-between">
          <Button
            type="button"
            icon="pi pi-filter-slash"
            label="Limpiar"
            outlined
            @click="clearFilter()"
          />
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Buscar Globalmente" />
          </IconField>
        </div>
      </template>
      <template #empty>
        <div class="p-3 text-center">No hay registros disponibles 🔎</div>
      </template>

      <Column
        field="Init_Code"
        header="Código"
        sortable
        style="min-width: 14rem"
        filter-field="Init_Code"
      >
        <template #body="{ data }">
          {{ data.Init_Code }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            @input="filterCallback()"
            type="text"
            placeholder="Buscar por código"
          />
        </template>
      </Column>

      <Column
        field="Internal_FullName"
        header="Creado Por"
        sortable
        style="min-width: 14rem"
        filter-field="Internal_FullName"
      >
        <template #body="{ data }">
          {{ data.Internal_FullName }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            @input="filterCallback()"
            type="text"
            placeholder="Buscar por nombre"
          />
        </template>
      </Column>
      <Column
        field="Init_Subject"
        header="Área/Materia"
        sortable
        style="min-width: 14rem"
        filter-field="Init_Subject"
      >
        <template #body="{ data }">
          {{ data.Init_Subject }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            @input="filterCallback()"
            type="text"
            placeholder="Buscar por tema"
          />
        </template>
      </Column>

      <Column
        field="Init_Service"
        header="Servicio"
        sortable
        style="min-width: 14rem"
        filter-field="Init_Service"
      >
        <template #body="{ data }">
          {{ data.Init_Service }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            @input="filterCallback()"
            type="text"
            placeholder="Buscar por servicio"
          />
        </template>
      </Column>
      <Column
        field="Computed_AlertStatus" 
        header="Nota de Alerta"
        sortable
        filterField="Computed_AlertStatus" 
        :showFilterMatchModes="false" 
        dataType="string"
        style="min-width: 14rem"
      >
        <template #body="{ data }">
          <!-- La visualización sigue basándose en el Init_AlertNote original -->
          <Tag
            v-if="data.Init_AlertNote && String(data.Init_AlertNote).trim() !== ''"
            severity="danger"
            value="Alerta"
            class="w-full md:w-20 text-center"
          ></Tag>
          <Tag
            v-else
            severity="success"
            value="Sin Alerta"
            class="w-full md:w-20 text-center"
          ></Tag>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            :options="statuses" 
            optionLabel="label"
            optionValue="value"
            @change="filterCallback()"
            placeholder="Seleccionar estado"
            showClear
            class="p-column-filter"
          >
            <template #option="slotProps">
              <Tag
                :severity="slotProps.option.value === 'Alerta' ? 'danger' : 'success'"
                :value="slotProps.option.label"
                class="w-full text-center"
              ></Tag>
            </template>
            <template #value="slotProps">
              <template v-if="slotProps.value !== null && slotProps.value !== undefined">
                <Tag
                  :severity="slotProps.value === 'Alerta' ? 'danger' : 'success'"
                  :value="statuses.find(s => s.value === slotProps.value)?.label"
                  class="w-full text-center"
                ></Tag>
              </template>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
          </Select>
        </template>
      </Column>

      <Column
        header="Acciones"
        headerStyle="width: 5rem; text-align: center"
        bodyStyle="text-align: center; overflow: visible"
      >
        <template #body="{ data }">
          <div class="flex justify-center items-center gap-2">
            <Button
              @click="loadUserAttentionSheet(data.Init_Code)"
              v-tooltip.bottom="'Ver Ficha Técnica'"
              icon="pi pi-file-pdf"
              severity="secondary"
              rounded
              variant="outlined"
            />
            <Button
              @click="confirmMarkAsAdvisory(data)"
              v-tooltip.bottom="'Marcar como Asesoría'"
              icon="pi pi-verified"
              severity="help"
              rounded
              variant="outlined"
            />
            <Button
              @click="redirectToConsultation(data)"
              v-tooltip.bottom="'Ir a la Consulta'"
              icon="pi pi-external-link"
              severity="info"
              rounded
              variant="outlined"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Dialog para visualizar el documento PDF de Ficha de Atención -->
    <Dialog
      v-model:visible="watchAttentionSheetDialog"
      modal
      header="📂 Ficha de Atención"
      class="p-6 rounded-lg shadow-lg bg-white max-w-7xl w-full"
    >
      <iframe :src="urlDocument" class="w-full h-250" frameborder="0"></iframe>
    </Dialog>
  </div>
</template>

<style scoped>
/* ...existing code... */
</style>
