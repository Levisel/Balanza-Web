<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import router from '@/router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import type { Initial_Consultation, Internal_User } from "@/ApiRoute";
import { API } from "@/ApiRoute";

// PrimeVue Toast para notificaciones
const toast = useToast();

// Consultas cargadas desde la API
const initialConsultation = ref<Initial_Consultation[]>([]);

// Consulta seleccionada (usada en el modal)
const selectedConsultation = ref<Initial_Consultation>({} as Initial_Consultation);
// Cachés separadas para nombres de usuarios y usuarios internos
const userNames = ref<Record<string, string>>({});
const internalNames = ref<Record<string, string>>({});

const viewDialogVisible = ref(false);
const editDialogVisible = ref(false);

// Inicializamos filtros
const filters = ref<any>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  Init_Code: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  User_Name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  Init_Subject: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  Init_Service: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  Init_Status: { value: null, matchMode: FilterMatchMode.EQUALS }
});

// Estados disponibles para filtro
const statuses = ref(["Activo", "Inactivo"]);

// Función para obtener las consultas de la API
const fetchReviewCases = async (initType: string, initStatus: string) => {
  try {
    const { data } = await axios.get(`${API}/initial-consultations`, {
      params: { initType, initStatus }
    });
    // Filtra los registros que no tienen 'Patrocinio' en Init_Service
    initialConsultation.value = data.filter(
      (record: Initial_Consultation) => record.Init_Service !== "Patrocinio"
    );
    console.log("Datos de la API (filtrados):", initialConsultation.value);
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

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    Init_Code: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    Internal_ID: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    User_Name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    User_ID: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    Init_Subject: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    Init_Service: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    Init_Status: { value: null, matchMode: FilterMatchMode.EQUALS }
  };
};

const clearFilter = () => {
  initFilters();
  filters.value = { ...filters.value };
};


const redirectToConsultation = (data: Initial_Consultation) => {
    router.push({ name: "NewCase", query: { userID: data.User_ID, caseID: data.Init_Code } });
};
const urlDocument = ref("");
const watchDocumentDialog = ref(false);

const loadUserAttentionSheet = async (initCode: string) => {
  try {
    const response = await axios.get(`${API}/initial-consultations/attention/${initCode}`, {
      responseType: "blob",
    });

    if (response.status === 200) {
      const contentType = response.headers["content-type"] || "application/pdf";
      const blob = new Blob([response.data], { type: contentType });
      urlDocument.value = URL.createObjectURL(blob);
      watchDocumentDialog.value = true;
    } else {
      throw new Error(`Error al obtener la hoja de atención: ${response.statusText}`);
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
  initFilters();
});
</script>


<template>
  <Toast />
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
      :globalFilterFields="['Init_Code','Internal_ID','User_ID','Init_Subject','Init_Service','Init_Status','Init_AlertNote']"
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
            <InputText v-model="filters['global'].value" placeholder="Buscar" />
        </IconField>
        </div>
      </template>
      <template #empty>
        <div class="p-3 text-center">No hay registros disponibles 🔎</div>
      </template>
      
      <Column field="Init_Code" header="Código" sortable style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.Init_Code }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Buscar por código" />
        </template>
      </Column>
      
      <Column field="Internal_ID" header="Creado Por" sortable style="min-width: 14rem">
        <template #body="{ data }">
          {{ resolveInternalUserName(data.Internal_ID) }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Buscar por ID interno" />
        </template>
      </Column>
      
      <!-- <Column field="User_ID" header="Usuario" sortable style="min-width: 14rem">
        <template #body="{ data }">
          {{ resolveUserName(data.User_ID) }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Buscar por usuario" />
        </template>
      </Column> -->
      
      <Column field="Init_Subject" header="Tema" sortable style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.Init_Subject }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Buscar por tema" />
        </template>
      </Column>
      
      <Column field="Init_Service" header="Servicio" sortable style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.Init_Service }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Buscar por servicio" />
        </template>
      </Column>


      <Column field = "Init_AlertNote" header = "Nota de Alerta" sortable style = "min-width: 14rem">
        <template #body="{ data }">
          <Tag v-if="data.Init_AlertNote" severity="danger" value="Alerta" class="w-full md:w-20 text-center"></Tag>
          <Tag v-else severity="success" value="Sin Alerta" class="w-full md:w-20  text-center"></Tag>
        </template>
        <template #filter="{ filterModel }">
          <Dropdown v-model="filterModel.value" :options="statuses" placeholder="Seleccionar estado" />
        </template>
      </Column>

      
      
      <Column header="Acciones" headerStyle="width: 5rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
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

    <!-- Dialog de Información completa de la consulta -->
    <Dialog
                v-model:visible="watchDocumentDialog"
                modal
                header="Evidencia"
                class="p-6 rounded-lg shadow-lg bg-white max-w-7xl w-full"
              >
                <iframe
                  :src="urlDocument"
                  class="w-full h-250"
                  frameborder="0"
                ></iframe>
              </Dialog>
  </div>
</template>



<style scoped>
/* ...existing code... */
</style>