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

const getSeverity = (status: string) => {
  switch (status) {
    case "Activo": return "success";
    case "Inactivo": return "danger";
    default: return "secondary";
  }
};

const openViewDialog = (data: Initial_Consultation) => {
  selectedConsultation.value = data;
  viewDialogVisible.value = true;
};

const openEditDialog = (data: Initial_Consultation) => {
  selectedConsultation.value = data;
  editDialogVisible.value = true;
};

const redirectToConsultation = (data: Initial_Consultation) => {
    router.push({ name: "NewCase", query: { userID: data.User_ID, caseID: data.Init_Code } });
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
      :globalFilterFields="['Init_Code','Internal_ID','User_ID','Init_Subject','Init_Service','Init_Status']"
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
      
      <Column field="User_ID" header="Usuario" sortable style="min-width: 14rem">
        <template #body="{ data }">
          {{ resolveUserName(data.User_ID) }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Buscar por usuario" />
        </template>
      </Column>
      
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
      
      <Column header="Acciones" headerStyle="width: 5rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
        <template #body="{ data }">
          <div class="flex justify-center items-center gap-2">
            <Button 
              @click="openViewDialog(data)" 
              v-tooltip.bottom="'Ver Consulta'" 
              icon="pi pi-search"
              severity="secondary" 
              rounded 
              variant="outlined" 
              aria-label="Ver Consulta" 
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
  v-model:visible="viewDialogVisible" 
  header="Información de Consulta" 
  modal 
  class="p-6 w-3/4" 
  appendTo="body" 
  :blockScroll="true"
>
  <div class="grid grid-cols-2 gap-6">
    <!-- Columna Izquierda -->

    <div class="space-y-4">
      <div>
        <label for="user" class="block text-sm font-semibold">Usuario</label>
        <InputText
          id="user"
          :value="resolveUserName(selectedConsultation.User_ID)"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="code" class="block text-sm font-semibold">Código de Consulta</label>
        <InputText
          id="code"
          v-model="selectedConsultation.Init_Code"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="internal" class="block text-sm font-semibold">Creado Por</label>
        <InputText
          id="internal"
          :value="resolveInternalUserName(selectedConsultation.Internal_ID)"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="clientType" class="block text-sm font-semibold">Tipo de Cliente</label>
        <InputText
          id="clientType"
          v-model="selectedConsultation.Init_ClientType"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="subject" class="block text-sm font-semibold">Tema</label>
        <InputText
          id="subject"
          v-model="selectedConsultation.Init_Subject"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="lawyer" class="block text-sm font-semibold">Abogado</label>
        <InputText
          id="lawyer"
          v-model="selectedConsultation.Init_Lawyer"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="date" class="block text-sm font-semibold">Fecha</label>
        <InputText
          id="date"
          :value="selectedConsultation.Init_Date ? new Date(selectedConsultation.Init_Date).toISOString().split('T')[0] : ''"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="endDate" class="block text-sm font-semibold">Fecha de Finalización</label>
        <InputText
          id="endDate"
          :value="selectedConsultation.Init_EndDate ? new Date(selectedConsultation.Init_EndDate).toISOString().split('T')[0] : ''"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
    </div>
    <!-- Columna Derecha -->
    <div class="space-y-4">
      <div>
        <label for="office" class="block text-sm font-semibold">Oficina</label>
        <InputText
          id="office"
          v-model="selectedConsultation.Init_Office"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="topic" class="block text-sm font-semibold">Tópico</label>
        <InputText
          id="topic"
          v-model="selectedConsultation.Init_Topic"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="service" class="block text-sm font-semibold">Servicio</label>
        <InputText
          id="service"
          v-model="selectedConsultation.Init_Service"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="referral" class="block text-sm font-semibold">Referido Por</label>
        <InputText
          id="referral"
          v-model="selectedConsultation.Init_Referral"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="status" class="block text-sm font-semibold">Estado</label>
        <Dropdown
          id="status"
          v-model="selectedConsultation.Init_Status"
          :options="statuses"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="notes" class="block text-sm font-semibold">Notas</label>
        <InputText
          id="notes"
          v-model="selectedConsultation.Init_Notes"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="complexity" class="block text-sm font-semibold">Complejidad</label>
        <InputText
          id="complexity"
          v-model="selectedConsultation.Init_Complexity"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="type" class="block text-sm font-semibold">Tipo de Consulta</label>
        <InputText
          id="type"
          v-model="selectedConsultation.Init_Type"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="socialWork" class="block text-sm font-semibold">Trabajo Social</label>
        <InputText
          id="socialWork"
          :value="selectedConsultation.Init_SocialWork ? 'Sí' : 'No'"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>

    </div>
  </div>
</Dialog>
  </div>
</template>



<style scoped>
/* ...existing code... */
</style>