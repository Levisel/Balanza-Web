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
import Tag from 'primevue/tag'; // Keep Tag if needed for other columns, remove if not
import { useToast } from 'primevue/usetoast';
import { API } from "@/ApiRoute";
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

// Define the structure for the assignment data based on the API response
interface User {
  User_ID: string;
  User_FirstName: string;
  User_LastName: string;
}

interface InitialConsultationInfo {
  Init_Code: string;
  Init_Subject: string;
  User_ID: string;
  User: User;
}

interface InternalUser {
  Internal_ID: string;
  Internal_Name: string;
  Internal_LastName: string;
}

interface Assignment {
  Assignment_ID: number;
  Init_Code: string; // This seems redundant if Initial_Consultation.Init_Code is present, but follow the provided structure
  Assignment_Date: string;
  Internal_User_ID_Student: string;
  Internal_User_ID: string; // Assigner ID
  Reassignment_Reason: string | null;
  Initial_Consultation: InitialConsultationInfo;
  Assigner: InternalUser;
  Student: InternalUser;
}

// PrimeVue Toast for notifications
const toast = useToast();

// Assignments loaded from the API
const assignments = ref<Assignment[]>([]);

// Selected assignment (if needed for row selection, etc.)
const selectedAssignment = ref<Assignment | null>(null);

const viewDialogVisible = ref(false); // Keep if used elsewhere, otherwise remove
const watchAttentionSheetDialog = ref(false);
const urlDocument = ref("");

// Initialize filters for the new columns
const filters = ref<any>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  'Initial_Consultation.Init_Code': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  'Initial_Consultation.Init_Subject': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  'Assigner.Name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }, // Custom filter key for combined name
  'Student.Name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }, // Custom filter key for combined name
  'Initial_Consultation.User_ID': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  'Initial_Consultation.User.Name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }, // Custom filter key for combined name
  'Initial_Consultation.User.User_FirstName': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }, // Custom filter key for combined name
  'Student.Internal_Name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }, // Custom filter key for combined name
});

// Function to fetch assigned cases from the API
const fetchAssignedCases = async () => {
  try {
    const { data } = await axios.get<Assignment[]>(`${API}/assignment/cases/all`);
    // Agrega los campos de nombre completo
    assignments.value = data.map(a => ({
      ...a,
      Assigner: {
        ...a.Assigner,
        FullName: `${a.Assigner.Internal_Name} ${a.Assigner.Internal_LastName}`.trim()
      },
      Student: {
        ...a.Student,
        FullName: `${a.Student.Internal_Name} ${a.Student.Internal_LastName}`.trim()
      },
      Initial_Consultation: {
        ...a.Initial_Consultation,
        User: {
          ...a.Initial_Consultation.User,
          FullName: `${a.Initial_Consultation.User.User_FirstName} ${a.Initial_Consultation.User.User_LastName}`.trim()
        }
      }
    }));
    console.log("Datos de la API (Casos Asignados):", assignments.value);
  } catch (error) {
    console.error("Error al cargar los casos asignados:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudieron cargar los casos asignados.",
      life: 3000,
    });
  }
};

// Initialize filters function
const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'Initial_Consultation.Init_Code': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    'Initial_Consultation.Init_Subject': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    'Assigner.Name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'Student.Name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'Initial_Consultation.User_ID': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    'Initial_Consultation.User.Name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'Assigner.Internal_Name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'Initial_Consultation.User.User_FirstName': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'Assigner.FullName': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'Student.FullName': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'Initial_Consultation.User.FullName': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  };
};

// Clear filters function
const clearFilter = () => {
  initFilters();
};

// Redirect to the specific case view
const redirectToConsultation = (data: Assignment) => {
  // Use the User_ID and Init_Code from the nested Initial_Consultation object
  router.push({ name: "NewCase", query: { userID: data.Initial_Consultation.User_ID, caseID: data.Initial_Consultation.Init_Code } });
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

// Fetch data when the component is mounted
onMounted(() => {
  fetchAssignedCases();
  initFilters(); // Initialize filters on mount
});
</script>

<template>
  <Toast />
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Casos Asignados</h1>
    </div>

    <DataTable
      v-model:filters="filters"
      v-model:selection="selectedAssignment"
      :value="assignments"
      paginator
      :rows="10"
      dataKey="Assignment_ID"
      filterDisplay="menu"
      size="large"
      
      removableSort
      :globalFilterFields="[
        'Initial_Consultation.Init_Code',
        'Initial_Consultation.Init_Subject',
        'Assigner.Internal_Name', // Add individual fields for global search
        'Assigner.Internal_LastName',
        'Student.Internal_Name',
        'Student.Internal_LastName',
        'Initial_Consultation.User_ID',
        'Initial_Consultation.User.User_FirstName',
        'Initial_Consultation.User.User_LastName'
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
        <div class="p-3 text-center">No hay casos asignados disponibles 🔎</div>
      </template>

      <!-- Codigo del Caso -->
      <Column
        field="Initial_Consultation.Init_Code"
        header="Código del Caso"
        sortable
        style="min-width: 12rem"
        filterField="Initial_Consultation.Init_Code"
      >
        <template #body="{ data }">
          {{ data.Initial_Consultation.Init_Code }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" type="text" placeholder="Buscar por código" />
        </template>
      </Column>

      <!-- Materia -->
      <Column
        field="Initial_Consultation.Init_Subject"
        header="Área/Materia"
        sortable
        style="min-width: 14rem"
        filterField="Initial_Consultation.Init_Subject"
      >
        <template #body="{ data }">
          {{ data.Initial_Consultation.Init_Subject }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" type="text" placeholder="Buscar por materia" />
        </template>
      </Column>

      <!-- Abogado (Assigner) -->
      <Column
        field="Assigner.FullName"
        header="Abogado"
        sortable
        filterField="Assigner.FullName"
      >
        <template #body="{ data }">
          {{ data.Assigner.FullName }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" type="text" placeholder="Buscar por nombre completo" />
        </template>
      </Column>

      <!-- Estudiante -->
      <Column
        field="Student.FullName"
        header="Estudiante"
        sortable
        filterField="Student.FullName"
      >
        <template #body="{ data }">
          {{ data.Student.FullName }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" type="text" placeholder="Buscar por nombre completo" />
        </template>
      </Column>

      <!-- Cedula del Usuario -->
      <Column
        field="Initial_Consultation.User_ID"
        header="Cédula Usuario"
        sortable
        style="min-width: 12rem"
        filterField="Initial_Consultation.User_ID"
      >
        <template #body="{ data }">
          {{ data.Initial_Consultation.User_ID }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" type="text" placeholder="Buscar por cédula" />
        </template>
      </Column>

      <!-- Nombre y Apellido del Usuario -->
      <Column
        field="Initial_Consultation.User.FullName"
        header="Nombre Usuario"
        sortable
        filterField="Initial_Consultation.User.FullName"
      >
        <template #body="{ data }">
          {{ data.Initial_Consultation.User.FullName }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" type="text" placeholder="Buscar por nombre completo" />
        </template>
      </Column>

      <!-- Acciones -->
      <Column header="Acciones" headerStyle="width: 8rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
        <template #body="{ data }">
          <div class="flex justify-center items-center gap-2">
            <Button
              @click="loadUserAttentionSheet(data.Initial_Consultation.Init_Code)"
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
}
</style>