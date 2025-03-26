<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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
import type { Vulnerable_Situation, Catastrophic_Illness, Disability, Protocols, Case_Status, Type_Of_Attention, Schedule, Profiles } from "@/ApiRoute";
import { API } from "@/ApiRoute";
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';

// PrimeVue Toast para notificaciones
const toast = useToast();

// Variables de las tablas de parámetros
const vulnerableSituation = ref<Vulnerable_Situation[]>([]);
const catastrophicIllness = ref<Catastrophic_Illness[]>([]);
const disability = ref<Disability[]>([]);
const protocols = ref<Protocols[]>([]);
const caseStatus = ref<Case_Status[]>([]);
const typeOfAttention = ref<Type_Of_Attention[]>([]);
const schedule = ref<Schedule[]>([]);
const profiles = ref<Profiles[]>([]);

const viewDialogVisible = ref(false);
const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const selectedRecord = ref<any>({});

const selectedTableLabel = ref("");
const tableData = ref([]);

// Configuración de nombres y columnas por tabla
const tableNames: { [key in keyof typeof tableConfig]: string } = {
  Vulnerable_Situation: "Situación Vulnerable",
  Catastrophic_Illness: "Enfermedad Catastrófica",
  Disability: "Discapacidad",
  Protocols: "Protocolos",
  Case_Status: "Estado del Caso",
  Type_Of_Attention: "Tipo de Atención",
  Schedule: "Horario",
  Profiles: "Perfiles"
};

const tableConfig = {
  Vulnerable_Situation: [
    { field: 'Vulnerable_Situation_Name', header: 'Nombre', type: 'string' },
    { field: 'Vulnerable_Situation_Status', header: 'Estado', type: 'boolean' }
  ],
  Catastrophic_Illness: [
    { field: 'Catastrophic_Illness_Name', header: 'Nombre', type: 'string' },
    { field: 'Catastrophic_Illness_Status', header: 'Estado', type: 'boolean' }
  ],
  Disability: [
    { field: 'Disability_Name', header: 'Nombre', type: 'string' },
    { field: 'Disability_Status', header: 'Estado', type: 'boolean' }
  ],
  Protocols: [
    { field: 'Protocols_Name', header: 'Nombre', type: 'string' },
    { field: 'Protocols_Status', header: 'Estado', type: 'boolean' }
  ],
  Case_Status: [
    { field: 'Case_Status_Name', header: 'Nombre', type: 'string' },
    { field: 'Case_Status_Status', header: 'Estado', type: 'boolean' }
  ],
  Type_Of_Attention: [
    { field: 'Type_Of_Attention_Name', header: 'Nombre', type: 'string' },
    { field: 'Type_Of_Attention_Status', header: 'Estado', type: 'boolean' }
  ],
  Schedule: [
    { field: 'Schedule_Name', header: 'Nombre', type: 'string' },
    { field: 'Schedule_Status', header: 'Estado', type: 'boolean' }
  ],
  Profiles: [
    { field: 'Profiles_Name', header: 'Nombre', type: 'string' },
    { field: 'Profiles_Status', header: 'Estado', type: 'boolean' }
  ]
};

// Computamos la clave (key) a partir del label seleccionado
const selectedTableKey = computed(() => {
  return (Object.keys(tableNames) as Array<keyof typeof tableNames>).find(key => tableNames[key] === selectedTableLabel.value) || "";
});

// Computamos las columnas a partir de la clave obtenida
const columns = computed(() => {
  return selectedTableKey.value ? tableConfig[selectedTableKey.value] : [];
});

// Propiedad computada para obtener solo los campos editables (excluyendo ID y Status)
const editableColumns = computed(() => {
  return columns.value.filter(col => {
    const lowerField = col.field.toLowerCase();
    return !lowerField.includes('id') && !lowerField.includes('status');
  });
});

const loadData = async () => {
  if (selectedTableKey.value) {
    console.log("Clave de tabla seleccionada:", selectedTableKey.value);
    try {
      const urlMap = {
        Vulnerable_Situation: `${API}/vulnerable-situation`,
        Catastrophic_Illness: `${API}/illness`,
        Disability: `${API}/disability`,
        Protocols: `${API}/protocols`,
        Case_Status: `${API}/case-status`,
        Type_Of_Attention: `${API}/type-of-attention`,
        Schedule: `${API}/schedule`,
        Profiles: `${API}/profiles`
      };
      const { data } = await axios.get(urlMap[selectedTableKey.value]);
      tableData.value = data;
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  }
};

const createData = async () => {
  if (selectedTableKey.value) {
    console.log("Clave de tabla seleccionada:", selectedTableKey.value);
    try {
      const urlMap = {
        Vulnerable_Situation: `${API}/vulnerable-situation/`,
        Catastrophic_Illness: `${API}/illness`,
        Disability: `${API}/disability`,
        Protocols: `${API}/protocols`,
        Case_Status: `${API}/case-status`,
        Type_Of_Attention: `${API}/type-of-attention`,
        Schedule: `${API}/schedule`,
        Profiles: `${API}/profiles`
      };
      const { data } = await axios.post(urlMap[selectedTableKey.value], selectedRecord.value);
      tableData.value = data;
    } catch (error) {
      console.error("Error al crear el dato:", error);
    }
  }
};

const updateData = async () => {
  if (selectedTableKey.value) {
    console.log("Clave de tabla seleccionada:", selectedTableKey.value);
    try {
      const urlMap = {
        Vulnerable_Situation: `${API}/vulnerable-situation`,
        Catastrophic_Illness: `${API}/illness`,
        Disability: `${API}/disability`,
        Protocols: `${API}/protocols`,
        Case_Status: `${API}/case-status`,
        Type_Of_Attention: `${API}/type-of-attention`,
        Schedule: `${API}/schedule`,
        Profiles: `${API}/profiles`
      };
      const { data } = await axios.put(`${urlMap[selectedTableKey.value]}/${selectedRecord.value.id}`, selectedRecord.value);
      tableData.value = data;
    } catch (error) {
      console.error("Error al actualizar el dato:", error);
    }
  }
};

const deleteData = async () => {
  if (selectedTableKey.value) {
    console.log("Clave de tabla seleccionada:", selectedTableKey.value);
    try {
      const urlMap = {
        Vulnerable_Situation: `${API}/vulnerable-situation`,
        Catastrophic_Illness: `${API}/illness`,
        Disability: `${API}/disability`,
        Protocols: `${API}/protocols`,
        Case_Status: `${API}/case-status`,
        Type_Of_Attention: `${API}/type-of-attention`,
        Schedule: `${API}/schedule`,
        Profiles: `${API}/profiles`
      };
      const { data } = await axios.delete(`${urlMap[selectedTableKey.value]}/${selectedRecord.value.id}`);
      tableData.value = data;
    } catch (error) {
      console.error("Error al eliminar el dato:", error);
    }
  }
};

const openViewDialog = (data: any) => {
  selectedRecord.value = { ...data };
  viewDialogVisible.value = true;
};

const openEditDialog = (data: any) => {
  selectedRecord.value = { ...data };
  editDialogVisible.value = true;
};

// Este método se encargará de llamar a updateData o createData según exista o no el id
const saveRecord = async () => {
  if (selectedRecord.value.id) {
    await updateData();
  } else {
    await createData();
  }
  // Se ocultan ambos diálogos luego de guardar
  editDialogVisible.value = false;
  createDialogVisible.value = false;
};
</script>

<template>
  <Toast />
  <div class="card">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold mb-4">Gestión de Parámetros</h1>
    </div>

    <Select
      v-model="selectedTableLabel"
      :options="Object.values(tableNames)"
      placeholder="Seleccione una tabla"
      @change="loadData"
    />

    <DataTable :value="tableData" paginator :rows="10" dataKey="id">
      <template #header>
        <h1 class="text-2xl font-bold mb-4">Gestión de {{ selectedTableLabel }}</h1>
      </template>

      <template v-for="col in columns" :key="col.field">
        <Column :field="col.field" :header="col.header" sortable>
          <template #body="slotProps">
            <span v-if="col.type === 'boolean'">
              <Tag :value="slotProps.data[col.field]" :severity="slotProps.data[col.field] ? 'success' : 'danger'" />
            </span>
            <span v-else>
              {{ slotProps.data[col.field] }}
            </span>
          </template>
        </Column>
      </template>

      <!-- Columna de acciones -->
      <Column header="Acciones" headerStyle="width: 5rem; text-align: center" bodyStyle="text-align: center">
        <template #body="slotProps">
          <div class="flex justify-center items-center gap-2">
            <Button @click="openViewDialog(slotProps.data)" v-tooltip.bottom="'Ver Información'" icon="pi pi-eye" severity="secondary" rounded variant="outlined" />
            <Button @click="openEditDialog(slotProps.data)" v-tooltip.bottom="'Editar'" icon="pi pi-pencil" severity="info" rounded variant="outlined" />
            <Button @click="deleteData()" v-tooltip.bottom="'Eliminar'" icon="pi pi-trash" severity="danger" rounded variant="outlined" />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Modal de Creación -->
    <Dialog v-model:visible="createDialogVisible" :header="`Crear ${selectedTableLabel}`" modal class="p-6" appendTo="body" :blockScroll="true">
      <form @submit.prevent="saveRecord">
        <div v-for="col in editableColumns" :key="col.field" class="mb-4">
          <label :for="col.field" class="block font-semibold">{{ col.header }}</label>
          <InputText 
            v-if="col.type === 'string' || col.type === 'number'" 
            :id="col.field" 
            v-model="selectedRecord[col.field]" 
          />
          <Checkbox 
            v-else-if="col.type === 'boolean'" 
            :input-id="col.field" 
            v-model="selectedRecord[col.field]" 
          />
          <!-- Otros tipos se pueden agregar según necesidad -->
        </div>
        <div class="flex justify-end gap-3">
          <Button label="Cancelar" @click="createDialogVisible = false" />
          <Button label="Guardar" type="submit" />
        </div>
      </form>
    </Dialog>

    <!-- Modal de Edición -->
    <Dialog v-model:visible="editDialogVisible" :header="`Editar ${selectedTableLabel}`" modal class="p-6" appendTo="body" :blockScroll="true">
      <form @submit.prevent="saveRecord">
        <div v-for="col in editableColumns" :key="col.field" class="mb-4">
          <label :for="col.field" class="block font-semibold">{{ col.header }}</label>
          <InputText 
            v-if="col.type === 'string' || col.type === 'number'" 
            :id="col.field" 
            v-model="selectedRecord[col.field]" 
          />
          <Checkbox 
            v-else-if="col.type === 'boolean'" 
            :input-id="col.field" 
            v-model="selectedRecord[col.field]" 
          />
        </div>
        <div class="flex justify-end gap-3">
          <Button label="Cancelar" @click="editDialogVisible = false" />
          <Button label="Guardar" type="submit" />
        </div>
      </form>
    </Dialog>

    <!-- Modal de Visualización (opcional) -->
    <Dialog v-model:visible="viewDialogVisible" :header="`Detalle de ${selectedTableLabel}`" modal class="p-6" appendTo="body" :blockScroll="true">
      <div v-for="col in columns" :key="col.field" class="mb-4">
        <label class="block font-semibold">{{ col.header }}</label>
        <p>{{ selectedRecord[col.field] }}</p>
      </div>
      <div class="flex justify-end">
        <Button label="Cerrar" @click="viewDialogVisible = false" />
      </div>
    </Dialog>

  </div>
</template>

<style scoped>
/* Puedes agregar estilos personalizados aquí */
</style>
