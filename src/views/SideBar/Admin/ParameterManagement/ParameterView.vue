<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import ConfirmDialog from "primevue/confirmdialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import Checkbox from "primevue/checkbox";
import Tag from "primevue/tag";

import { useToast } from "primevue/usetoast";
import { API } from "@/ApiRoute";
import { useConfirm } from "primevue/useconfirm";

// PrimeVue Toast para notificaciones
const toast = useToast();

const isValueSelected = computed(() => !!selectedTableLabel.value);

const viewDialogVisible = ref(false);
const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const selectedRecord = ref<any>({});

const selectedTableLabel = ref("");
// Aquí, para el DataTable, usaremos dataKey dinámico basado en el ID esperado.
const dataKey = ref("id");
const tableData = ref<any[]>([]);

// Configuración de columnas por tabla (excluyendo campos de ID para edición)
const tableConfig = {
  Vulnerable_Situation: [
    { field: "Vulnerable_Situation_Name", header: "Nombre", type: "string" },
    { field: "Vulnerable_Situation_Status", header: "Estado", type: "boolean" },
  ],
  Catastrophic_Illness: [
    { field: "Catastrophic_Illness_Name", header: "Nombre", type: "string" },
    { field: "Catastrophic_Illness_Status", header: "Estado", type: "boolean" },
  ],
  Disability: [
    { field: "Disability_Name", header: "Nombre", type: "string" },
    { field: "Disability_Status", header: "Estado", type: "boolean" },
  ],
  Protocols: [
    { field: "Protocol_Name", header: "Nombre", type: "string" },
    { field: "Protocol_Status", header: "Estado", type: "boolean" },
  ],
  Case_Status: [
    { field: "Case_Status_Name", header: "Nombre", type: "string" },
    { field: "Case_Status_Status", header: "Estado", type: "boolean" },
  ],
  Type_Of_Attention: [
    { field: "Type_Of_Attention_Name", header: "Nombre", type: "string" },
    { field: "Type_Of_Attention_Status", header: "Estado", type: "boolean" },
  ],
  Schedule: [
    { field: "Schedule_Limit", header: "Límite", type: "number" },
    { field: "Schedule_Status", header: "Estado", type: "boolean" },
  ],
  Profiles: [
    { field: "Profile_Name", header: "Nombre", type: "string" },
    { field: "Profile_Status", header: "Estado", type: "boolean" },
  ],
  Occupations: [
    { field: "Occupation_Name", header: "Nombre", type: "string" },
    { field: "Occupation_Status", header: "Estado", type: "boolean" },
  ],
  Income_Level: [
    { field: "Income_Level_Name", header: "Nombre", type: "string" },
    { field: "Income_Level_Status", header: "Estado", type: "boolean" },
  ],
  Family_Group: [
    { field: "Family_Group_Name", header: "Nombre", type: "string" },
    { field: "Family_Group_Status", header: "Estado", type: "boolean" },
  ],
  Family_Income: [
    { field: "Family_Income_Name", header: "Nombre", type: "string" },
    { field: "Family_Income_Status", header: "Estado", type: "boolean" },
  ],
  Type_Of_Housing: [
    { field: "Type_Of_Housing_Name", header: "Nombre", type: "string" },
    { field: "Type_Of_Housing_Status", header: "Estado", type: "boolean" },
  ],
  Own_Assets: [
    { field: "Own_Assets_Name", header: "Nombre", type: "string" },
    { field: "Own_Assets_Status", header: "Estado", type: "boolean" },
  ],
  Pensioner: [
    { field: "Pensioner_Name", header: "Nombre", type: "string" },
    { field: "Pensioner_Status", header: "Estado", type: "boolean" },
  ],
  Health_Insurance: [
    { field: "Health_Insurance_Name", header: "Nombre", type: "string" },
    { field: "Health_Insurance_Status", header: "Estado", type: "boolean" },
  ],
};

// Función para resetear el registro seleccionado
const resetSelectedRecord = () => {
  selectedRecord.value = {};
};

// Mapeo de nombres amigables para el select
const tableNames: { [key in keyof typeof tableConfig]: string } = {
  Vulnerable_Situation: "Situación Vulnerable",
  Catastrophic_Illness: "Enfermedad Catastrófica",
  Disability: "Discapacidad",
  Protocols: "Protocolos",
  Case_Status: "Estado del Caso",
  Type_Of_Attention: "Tipo de Atención",
  Schedule: "Horario",
  Profiles: "Perfiles",
  Occupations: "Ocupaciones",
  Income_Level: "Nivel de Ingresos",
  Family_Group: "Grupo Familiar",
  Family_Income: "Ingresos Familiares",
  Type_Of_Housing: "Tipo de Vivienda",
  Own_Assets: "Bienes Propios",
  Pensioner: "Pensionado",
  Health_Insurance: "Seguro de Salud",
};

// Mapeo de campos de ID según la tabla
const idFieldMap: { [key in keyof typeof tableConfig]: string } = {
  Vulnerable_Situation: "Vulnerable_Situation_Id",
  Catastrophic_Illness: "Catastrophic_Illness_Id",
  Disability: "Disability_Id",
  Protocols: "Protocol_Id",
  Case_Status: "Case_Status_Id",
  Type_Of_Attention: "Type_Of_Attention_Id",
  Schedule: "Schedule_Id",
  Profiles: "Profile_Id",
  Occupations: "Occupation_Id",
  Income_Level: "Income_Level_Id",
  Family_Group: "Family_Group_Id",
  Family_Income: "Family_Income_Id",
  Type_Of_Housing: "Type_Of_Housing_Id",
  Own_Assets: "Own_Assets_Id",
  Pensioner: "Pensioner_Id",
  Health_Insurance: "Health_Insurance_Id",
};

// Computamos la clave (key) a partir del label seleccionado
const selectedTableKey = computed(() => {
  return (
    (Object.keys(tableNames) as Array<keyof typeof tableNames>).find(
      (key) => tableNames[key] === selectedTableLabel.value
    ) || ""
  );
});

// Computamos las columnas a partir de la clave obtenida
const columns = computed(() => {
  return selectedTableKey.value ? tableConfig[selectedTableKey.value] : [];
});

// Obtenemos los campos editables (excluyendo los que contengan "id" o "status")
const editableColumns = computed(() => {
  return columns.value.filter((col) => {
    return (
      !col.field.toLowerCase().endsWith("_status") &&
      !col.field.toLowerCase().includes("id")
    );
  });
});

// Actualizamos dataKey dinámicamente según la tabla seleccionada
if (selectedTableKey.value && idFieldMap[selectedTableKey.value]) {
  dataKey.value = idFieldMap[selectedTableKey.value];
}

// Función de validación de datos en el formulario
const validateRecord = (): boolean => {
  for (const col of editableColumns.value) {
    const value = selectedRecord.value[col.field];
    if (value === null || value === undefined || value === "") {
      console.error(`El campo ${col.header} es obligatorio.`);
      toast.add({
        severity: "error",
        summary: "Validación",
        detail: `El campo ${col.header} es obligatorio.`,
        life: 3000,
      });
      return false;
    }
  }
  return true;
};

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
        Profiles: `${API}/profile`,
        Occupations: `${API}/occupations`,
        Income_Level: `${API}/income-level`,
        Family_Group: `${API}/family-group`,
        Family_Income: `${API}/family-income`,
        Type_Of_Housing: `${API}/type-of-housing`,
        Own_Assets: `${API}/own-assets`,
        Pensioner: `${API}/pensioner`,
        Health_Insurance: `${API}/health-insurance`,
      };
      console.log("Cargando datos desde:", urlMap[selectedTableKey.value]);
      const { data } = await axios.get(urlMap[selectedTableKey.value]);
      if (Array.isArray(data)) {
        tableData.value = data;
      } else {
        console.warn(
          "La respuesta no es un arreglo, se asigna un arreglo vacío"
        );
        tableData.value = [];
      }
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar los datos",
        life: 3000,
      });
    }
  }
};

const createData = async () => {
  if (!validateRecord()) return;
  if (selectedTableKey.value) {
    console.log("Crear dato en tabla:", selectedTableKey.value);
    try {
      const urlMap = {
        Vulnerable_Situation: `${API}/vulnerable-situation`,
        Catastrophic_Illness: `${API}/illness`,
        Disability: `${API}/disability`,
        Protocols: `${API}/protocols`,
        Case_Status: `${API}/case-status`,
        Type_Of_Attention: `${API}/type-of-attention`,
        Schedule: `${API}/schedule`,
        Profiles: `${API}/profile`,
        Occupations: `${API}/occupations`,
        Income_Level: `${API}/income-level`,
        Family_Group: `${API}/family-group`,
        Family_Income: `${API}/family-income`,
        Type_Of_Housing: `${API}/type-of-housing`,
        Own_Assets: `${API}/own-assets`,
        Pensioner: `${API}/pensioner`,
        Health_Insurance: `${API}/health-insurance`,
      };
      console.log("Enviando datos para creación:", selectedRecord.value);
      await axios.post(urlMap[selectedTableKey.value], selectedRecord.value);
      toast.add({
        severity: "success",
        summary: "Creado",
        detail: "El registro se creó exitosamente.",
        life: 3000,
      });
      selectedRecord.value = {};
    } catch (error) {
      console.error("Error al crear el dato:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo crear el registro",
        life: 3000,
      });
    }
  }
};

const updateData = async () => {
  if (!validateRecord()) return;
  if (selectedTableKey.value) {
    console.log("Actualizar dato en tabla:", selectedTableKey.value);
    try {
      const urlMap = {
        Vulnerable_Situation: `${API}/vulnerable-situation`,
        Catastrophic_Illness: `${API}/illness`,
        Disability: `${API}/disability`,
        Protocols: `${API}/protocols`,
        Case_Status: `${API}/case-status`,
        Type_Of_Attention: `${API}/type-of-attention`,
        Schedule: `${API}/schedule`,
        Profiles: `${API}/profile`,
        Occupations: `${API}/occupations`,
        Income_Level: `${API}/income-level`,
        Family_Group: `${API}/family-group`,
        Family_Income: `${API}/family-income`,
        Type_Of_Housing: `${API}/type-of-housing`,
        Own_Assets: `${API}/own-assets`,
        Pensioner: `${API}/pensioner`,
        Health_Insurance: `${API}/health-insurance`,
      };
      const idField = idFieldMap[selectedTableKey.value];
      const recordId = selectedRecord.value[idField] || selectedRecord.value.id;
      if (!recordId) {
        console.error("No se encontró el ID del registro.");
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "No se encontró el ID del registro",
          life: 3000,
        });
        return;
      }
      console.log("Enviando datos para actualización:", selectedRecord.value);
      await axios.put(
        `${urlMap[selectedTableKey.value]}/${recordId}`,
        selectedRecord.value
      );
      toast.add({
        severity: "info",
        summary: "Actualizado",
        detail: "El registro se actualizó exitosamente.",
        life: 3000,
      });
    } catch (error) {
      if ((error as any).response?.status === 404) {
        toast.add({
          severity: "warn",
          summary: "Advertencia",
          detail:
            "Por favor, revisa que has hecho cambios antes de actualizar el registro.",
          life: 4000,
        });
      } else {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo actualizar el registros",
          life: 4000,
        });
      }
    }
  }
};

const deleteData = async () => {
  if (selectedTableKey.value) {
    console.log("Eliminar dato en tabla:", selectedTableKey.value);
    try {
      const urlMap = {
        Vulnerable_Situation: `${API}/vulnerable-situation`,
        Catastrophic_Illness: `${API}/illness`,
        Disability: `${API}/disability`,
        Protocols: `${API}/protocols`,
        Case_Status: `${API}/case-status`,
        Type_Of_Attention: `${API}/type-of-attention`,
        Schedule: `${API}/schedule`,
        Profiles: `${API}/profile`,
        Occupations: `${API}/occupations`,
        Income_Level: `${API}/income-level`,
        Family_Group: `${API}/family-group`,
        Family_Income: `${API}/family-income`,
        Type_Of_Housing: `${API}/type-of-housing`,
        Own_Assets: `${API}/own-assets`,
        Pensioner: `${API}/pensioner`,
        Health_Insurance: `${API}/health-insurance`,
      };
      const idField = idFieldMap[selectedTableKey.value];
      const recordId = selectedRecord.value[idField] || selectedRecord.value.id;
      if (!recordId) {
        console.error("No se encontró el ID del registro a eliminar.");
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "No se encontró el ID del registro",
          life: 3000,
        });
        return;
      }
      console.log("Eliminando registro con ID:", recordId);
      await axios.delete(`${urlMap[selectedTableKey.value]}/${recordId}`);
      await loadData();
    } catch (error) {
      console.error("Error al eliminar el dato:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo eliminar el registro",
        life: 3000,
      });
    }
  }
};

const openViewDialog = (data: any) => {
  selectedRecord.value = { ...data };
  viewDialogVisible.value = true;
  console.log("Visualizando registro:", data);
};

const openEditDialog = (data: any) => {
  selectedRecord.value = { ...data };
  editDialogVisible.value = true;
  console.log("Editando registro:", data);
};

const createRecord = async () => {
  await createData();
  await loadData();
  selectedRecord.value = {};
  createDialogVisible.value = false;
};

const editRecord = async () => {
  await updateData();
  await loadData();
  selectedRecord.value = {};
  editDialogVisible.value = false;
};

const confirm = useConfirm();

const deleteConfirm = (data: any) => {
  // Asignamos el registro a eliminar a selectedRecord
  selectedRecord.value = { ...data };
  confirm.require({
    message: "¿Estás seguro que deseas eliminar este registro?",
    header: "Advertencia",
    icon: "pi pi-info-circle",
    rejectLabel: "Cancelar",
    rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
    acceptProps: { label: "Eliminar", severity: "danger" },
    accept: async () => {
      await deleteData();
      toast.add({
        severity: "info",
        summary: "Eliminado",
        detail: "El registro se eliminó exitosamente.",
        life: 3000,
      });
    },
  });
};
</script>

<template>
  <Toast />
  <ConfirmDialog />
  <div class="card">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold mb-4">Gestión de Parámetros</h1>
    </div>

    <div class="flex justify-between items-center mb-4">
      <Select
        v-model="selectedTableLabel"
        v-tooltip="'Selecciona'"
        :options="Object.values(tableNames)"
        placeholder="Seleccione una tabla"
        @change="loadData"
      />
      <Button
        @click="createDialogVisible = true"
        label="Crear"
        icon="pi pi-plus-circle"
        class="mb-4"
        :disabled="!isValueSelected"
      />
    </div>

    <div v-if="isValueSelected">
      <DataTable
        :value="tableData"
        paginator
        removableSort
        :rows="10"
        :dataKey="dataKey"
      >
        <template #header>
          <h1 class="text-xl font-semibold mb-4">{{ selectedTableLabel }}</h1>
        </template>

        <template #empty>
          <div class="p-3 text-center">No hay registros disponibles 🔎</div>
        </template>

        <!-- Resto de columnas y templates -->
        <template v-for="col in columns" :key="col.field">
          <Column :field="col.field" :header="col.header" sortable>
            <template #body="slotProps">
              <span v-if="col.type === 'boolean'">
                <Tag
                  :value="slotProps.data[col.field] ? 'Activo' : 'Inactivo'"
                  :severity="slotProps.data[col.field] ? 'success' : 'danger'"
                />
              </span>
              <span v-else>
                {{ slotProps.data[col.field] }}
              </span>
            </template>
          </Column>
        </template>

        <!-- Columna de acciones -->
        <Column
          header="Acciones"
          headerStyle="width: 5rem; text-align: center"
          bodyStyle="text-align: center"
        >
          <template #body="slotProps">
            <div class="flex justify-center items-center gap-2">
              <Button
                @click="openViewDialog(slotProps.data)"
                v-tooltip.bottom="'Ver Información'"
                icon="pi pi-eye"
                severity="secondary"
                rounded
                variant="outlined"
              />
              <Button
                @click="openEditDialog(slotProps.data)"
                v-tooltip.bottom="'Editar'"
                icon="pi pi-pencil"
                severity="info"
                rounded
                variant="outlined"
              />
              <Button
                @click="deleteConfirm(slotProps.data)"
                v-tooltip.bottom="'Eliminar'"
                icon="pi pi-trash"
                severity="danger"
                rounded
                variant="outlined"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Modal de Creación -->
    <Dialog
      v-model:visible="createDialogVisible"
      :header="`Crear ${selectedTableLabel}`"
      :style="{ width: '35rem' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      modal
      class="p-fluid"
      appendTo="body"
      :blockScroll="true"
      @show="resetSelectedRecord"
    >
      <template #header>
        <div class="flex align-items-center gap-2">
          <span class="font-bold text-xl">{{
            `Crear ${selectedTableLabel}`
          }}</span>
        </div>
      </template>

      <form @submit.prevent="createRecord" class="grid gap-3">
        <div v-for="col in editableColumns" :key="col.field" class="field">
          <FloatLabel variant="in">
            <InputText
              v-if="col.type === 'string'"
              :id="col.field"
              v-model="selectedRecord[col.field]"
              autocomplete="off"
              size="large"
              class="w-full"
              :pt="{
                root: { class: 'border-round' },
              }"
            />

            <InputNumber
              v-if="col.type === 'number'"
              v-model="selectedRecord[col.field]"
              mode="decimal"
              showButtons
              :min="1"
              :max="col.field === 'Schedule_Limit' ? 60 : 100"
              size="large"
              class="w-full"
              inputClass="w-full"
              :pt="{
                root: { class: 'border-round' },
              }"
            />
            <label :for="col.field" class="font-medium">{{ col.header }}</label>
          </FloatLabel>
          <div
            v-if="col.type === 'boolean'"
            class="flex align-items-center gap-2 pt-2"
          >
            <Checkbox
              v-model="selectedRecord[col.field]"
              :binary="true"
              :pt="{
                root: { class: 'w-2rem h-2rem' },
                box: { class: 'border-2 w-2rem h-2rem' },
              }"
            />
            <label class="text-color-secondary">Activo</label>
          </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-5 ml-65">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            severity="contrast"
            @click="createDialogVisible = false"
          />
          <Button
            label="Guardar"
            icon="pi pi-check"
            severity="primary"
            type="submit"
          />
        </div>
      </form>
    </Dialog>

    <!-- Modal de Edición -->
    <Dialog
      v-model:visible="editDialogVisible"
      :style="{ width: '35rem' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      modal
      class="p-fluid"
      appendTo="body"
      :blockScroll="true"
    >
      <template #header>
        <div class="flex align-items-center gap-2">
          <span class="font-bold text-xl">{{
            `Editar ${selectedTableLabel}`
          }}</span>
        </div>
      </template>

      <form @submit.prevent="editRecord" class="grid gap-3">
        <div v-for="col in editableColumns" :key="col.field" class="field">
          <FloatLabel variant="in">
            <InputText
              v-if="col.type === 'string'"
              :id="col.field"
              v-model="selectedRecord[col.field]"
              autocomplete="off"
              size="large"
              class="w-full"
              :pt="{
                root: { class: 'border-round' },
              }"
            />

            <InputNumber
              v-if="col.type === 'number'"
              v-model="selectedRecord[col.field]"
              mode="decimal"
              showButtons
              :min="1"
              :max="col.field === 'Schedule_Limit' ? 60 : 100"
              size="large"
              class="w-full"
              inputClass="w-full"
              :pt="{
                root: { class: 'border-round' },
              }"
            />
            <label :for="col.field" class="font-medium">{{ col.header }}</label>
          </FloatLabel>
          <div
            v-if="col.type === 'boolean'"
            class="flex align-items-center gap-2 pt-2"
          >
            <Checkbox
              v-model="selectedRecord[col.field]"
              :binary="true"
              :pt="{
                root: { class: 'w-2rem h-2rem' },
                box: { class: 'border-2 w-2rem h-2rem' },
              }"
            />
            <label class="text-color-secondary">Activo</label>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-5">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            severity="contrast"
            @click="editDialogVisible = false"
          />
          <Button
            label="Actualizar"
            icon="pi pi-save"
            severity="info"
            type="submit"
          />
        </div>
      </form>
    </Dialog>

    <!-- Modal de Visualización -->
    <Dialog
      v-model:visible="viewDialogVisible"
      :header="`Detalle de ${selectedTableLabel}`"
      :style="{ width: '35rem' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      modal
      class="p-fluid"
      appendTo="body"
      :blockScroll="true"
    >
      <div class="grid gap-3">
        <div v-for="col in columns" :key="col.field" class="field">
          <label class="font-bold">{{ col.header }}</label>
          <div class="p-3 border-round surface-card">
            <Tag
              v-if="col.type === 'boolean'"
              :value="selectedRecord[col.field] ? 'Activo' : 'Inactivo'"
              :severity="selectedRecord[col.field] ? 'success' : 'danger'"
            />
            <span v-else class="text-color-secondary">
              {{ selectedRecord[col.field] || "-" }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex justify-content-end mt-4 ml-100">
        <Button
          label="Cerrar"
          icon="pi pi-times"
          severity="contrast"
          @click="viewDialogVisible = false"
        />
      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
