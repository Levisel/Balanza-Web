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
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { API } from "@/ApiRoute";
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import DatePicker from 'primevue/datepicker'; // <-- Import DatePicker

// Define the structure for the User data
interface User {
  User_ID: string;
  User_FirstName: string;
  User_LastName: string;
}

// Define the structure for the Internal User data
interface InternalUser {
  Internal_ID: string;
  Internal_Name: string;
  Internal_LastName: string;
}

// Define the structure for the Initial Consultation data based on the API response
interface InitialConsultationCase {
  Init_Code: string;
  Internal_ID: string;
  Init_ClientType: string;
  Init_Subject: string;
  Init_Lawyer: string;
  Init_Date: string; // Keep as string if API returns string
  Init_EndDate: string;
  Init_Office: string;
  Init_Topic: string;
  Init_Service: string;
  Init_Referral: string;
  Init_Status: string;
  Init_CaseStatus: string;
  Init_Notes: string;
  Init_Complexity: string;
  Init_Type: string;
  Init_SocialWork: boolean;
  Init_MandatorySW: boolean;
  Init_AlertNote: string | null;
  User_ID: string;
  User: User;
  Internal_User: InternalUser;
}

// PrimeVue Toast for notifications
const toast = useToast();

// Cases loaded from the API
const cases = ref<InitialConsultationCase[]>([]);

// Selected case (if needed for row selection, etc.)
const selectedCase = ref<InitialConsultationCase | null>(null);

// Dialog visibility state
const watchAttentionSheetDialog = ref(false);
const urlDocument = ref("");


// Function to fetch all cases from the API
const fetchAllCases = async () => {
  try {
    const { data } = await axios.get<InitialConsultationCase[]>(`${API}/initial-consultations/cases/all`);
    // Convert date strings to Date objects if necessary for filtering/sorting
    cases.value = data.map(caseItem => ({
        ...caseItem,
        Init_Date_Obj: new Date(caseItem.Init_Date), // Create a Date object version
        Internal_User: {
            ...caseItem.Internal_User,
            FullName: `${caseItem.Internal_User.Internal_Name} ${caseItem.Internal_User.Internal_LastName}`.trim()
        },
        User: {
            ...caseItem.User,
            FullName: `${caseItem.User.User_FirstName} ${caseItem.User.User_LastName}`.trim()
        }
    }));
  } catch (error) {
    console.error("Error al cargar todos los casos:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudieron cargar los casos.",
      life: 3000,
    });
  }
};

// Initialize filters function
const defaultFilters = {
  global:   { value: null, matchMode: FilterMatchMode.CONTAINS },
  Init_Code: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  Init_Date_Obj: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
  Init_Subject: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  'Internal_User.FullName': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  User_ID: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  'User.FullName': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  Init_Service: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
};

// Clear filters function
const filters = ref({ ...defaultFilters });

const clearFilter = () => {
  filters.value = { ...defaultFilters };
};

// Redirect to the specific case view
const redirectToConsultation = (data: InitialConsultationCase) => {
  router.push({ name: "NewCase", query: { userID: data.User_ID, caseID: data.Init_Code } });
};

// Load the attention sheet PDF
const loadUserAttentionSheet = async (initCode: string) => {
  try {
    const response = await axios.get(`${API}/initial-consultations/attention/${initCode}`, {
      responseType: "blob",
    });

    if (response.status === 200) {
      const contentType = response.headers["content-type"] || "application/pdf";
      const blob = new Blob([response.data], { type: contentType });
      urlDocument.value = URL.createObjectURL(blob);
      watchAttentionSheetDialog.value = true;
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

// Helper function to format date
const formatDate = (value: string | Date) => {
    const date = typeof value === 'string' ? new Date(value) : value;
    if (date instanceof Date && !isNaN(date.valueOf())) {
        return date.toLocaleDateString('es-ES', { // Use Spanish locale
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    return ''; // Return empty string for invalid dates
};


// Helper function to determine Tag severity based on service (optional customization)
const getSeverityForService = (service: string) => {
  switch (service?.toLowerCase()) {
    case 'patrocinio':
      return 'info';
    case 'asesoría':
      return 'success';
    case 'mediación':
      return 'warning';
    default:
      return 'secondary';
  }
};

// Fetch data when the component is mounted
onMounted(() => {
  fetchAllCases(); // Then fetch data
});
</script>

<template>
  <Toast />
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Vista General de Casos</h1>
    </div>

    <DataTable
      v-model:filters="filters"
      v-model:selection="selectedCase"
      :value="cases"
      paginator
      :rows="10"
      dataKey="Init_Code"
      filterDisplay="menu"
      size="large"
      removableSort
      :globalFilterFields="[
        'Init_Code',
        'Init_Subject',
        'Internal_User.Internal_Name',
        'Internal_User.Internal_LastName',
        'User_ID',
        'User.User_FirstName',
        'User.User_LastName',
        'Init_Service',
        'Init_Date' // Add original date string if needed for global search
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
        <div class="p-3 text-center">No hay casos disponibles 🔎</div>
      </template>

      <!-- Fecha inicial del Caso -->
      <Column
        field="Init_Date_Obj"  
        header="Fecha Inicial"
        sortable
        dataType="date"       
        style="min-width: 12rem"
        filterField="Init_Date_Obj" 
      >
        <template #body="{ data }">
          {{ formatDate(data.Init_Date_Obj) }} 
        </template>
        <template #filter="{ filterModel }">
          <DatePicker
            v-model="filterModel.value"
            dateFormat="dd/mm/yy" 
            placeholder="dd/mm/yyyy"
            showIcon
            class="w-full"
          />
        </template>
      </Column>

      <!-- Materia -->
      <Column
        field="Init_Subject"
        header="Área/Materia"
        sortable
        style="min-width: 14rem"
        filterField="Init_Subject"
      >
        <template #body="{ data }">
          {{ data.Init_Subject }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" type="text" placeholder="Buscar por materia" />
        </template>
      </Column>

      <!-- Creado Por -->
      <Column
        field="Internal_User.FullName"
        header="Creado Por"
        sortable
        filterField="Internal_User.FullName"
        style="min-width: 14rem"
      >
        <template #body="{ data }">
          {{ data.Internal_User.FullName }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" type="text" placeholder="Buscar por nombre completo" />
        </template>
      </Column>

      <!-- Cedula del Usuario -->
      <Column
        field="User_ID"
        header="Cédula Usuario"
        sortable
        style="min-width: 12rem"
        filterField="User_ID"
      >
        <template #body="{ data }">
          {{ data.User_ID }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" type="text" placeholder="Buscar por cédula" />
        </template>
      </Column>

       <!-- Nombre y Apellido del Usuario -->
      <Column
        field="User.FullName"
        header="Nombre Usuario"
        sortable
        filterField="User.FullName"
        style="min-width: 14rem"
      >
        <template #body="{ data }">
          {{ data.User.FullName }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" type="text" placeholder="Buscar por nombre completo" />
        </template>
      </Column>

      <!-- Servicio -->
      <Column
        field="Init_Service"
        header="Servicio"
        sortable
        style="min-width: 10rem"
        filterField="Init_Service"
      >
        <template #body="{ data }">
          <Tag :value="data.Init_Service || 'N/A'" :severity="getSeverityForService(data.Init_Service)" class="w-full text-center"></Tag>
        </template>
         <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" type="text" placeholder="Buscar por servicio" />
        </template>
      </Column>

      <!-- Acciones -->
      <Column header="Acciones" headerStyle="width: 8rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
        <template #body="{ data }">
          <div class="flex justify-center items-center gap-2">
            <Button
              @click="loadUserAttentionSheet(data.Init_Code)"
              v-tooltip.bottom="'Ver Ficha Técnica'"
              icon="pi pi-file-pdf"
              severity="secondary"
              rounded
              outlined
            />
            <Button
                @click="redirectToConsultation(data)"
                v-tooltip.bottom="'Ir al Caso'"
                icon="pi pi-external-link"
                severity="info"
                rounded
                outlined
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
/* Add any specific styles if needed */
.p-datatable .p-datatable-thead > tr > th {
    background-color: #f8f9fa; /* Light grey background for header */
    color: #495057; /* Darker text color */
    font-weight: bold;
}

.p-datatable .p-datatable-tbody > tr:nth-child(even) {
    background-color: #f8f9fa; /* Zebra striping */
}

.p-button.p-button-outlined {
    border-color: #ced4da; /* Lighter border for outlined buttons */
}

.p-dialog .p-dialog-header {
    border-bottom: 1px solid #dee2e6;
    padding: 1rem 1.5rem;
}

.p-dialog .p-dialog-content {
    padding: 1.5rem;
}

.p-dialog .p-dialog-footer {
    border-top: 1px solid #dee2e6;
    padding: 1rem 1.5rem;
}

/* Ensure iframe takes up space */
iframe {
    display: block;
    border: none; /* Remove default iframe border */
    min-height: 70vh; /* Ensure iframe has a decent height */
}

/* Ensure Tags are visible */
.p-tag {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* Style DatePicker input */
.p-datepicker input {
    width: 100%; /* Make datepicker input take full width */
}
</style>