<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
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
const router = useRouter();
const route = useRoute();

onMounted(() => {
  if (route.query.tabla === "Profiles") {
    selectedTableLabel.value = tableNames.Profiles;
    loadData();
  }
});

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
  /**************************************************************************** */
  Ethnicity: [
    { field: "Ethnicity_Name", header: "Nombre", type: "string" },
    { field: "Ethnicity_Status", header: "Estado", type: "boolean" },
  ],
  Civil_Status: [
    { field: "Civil_Status_Name", header: "Nombre", type: "string" },
    { field: "Civil_Status_Status", header: "Estado", type: "boolean" },
  ],
  Sex: [
    { field: "Sex_Name", header: "Nombre", type: "string" },
    { field: "Sex_Status", header: "Estado", type: "boolean" },
  ],
  Derived_By: [
    { field: "Derived_By_Name", header: "Nombre", type: "string" },
    { field: "Derived_By_Status", header: "Estado", type: "boolean" },
  ],
  Academic_Instruction: [
    { field: "Academic_Instruction_Name", header: "Nombre", type: "string" },
    { field: "Academic_Instruction_Status", header: "Estado", type: "boolean" },
  ],
  Number_Of_Attempts: [
    { field: "Number_Of_Attempts", header: "Número de Intentos", type: "number" },
    { field: "Number_Of_Attempts_Status", header: "Estado", type: "boolean" },
  ],
  Complexity: [
    { field: "Complexity_Name", header: "Nombre", type: "string" },
    { field: "Complexity_Status", header: "Estado", type: "boolean" },
  ],
  Documentation_Backup: [
    { field: "Documentation_Backup_Name", header: "Nombre", type: "string" },
    { field: "Documentation_Backup_Status", header: "Estado", type: "boolean" },
  ],
  Period_Type: [
    { field: "Period_Type_Name", header: "Nombre", type: "string" },
    { field: "Period_Type_Status", header: "Estado", type: "boolean" },
  ],
  Practical_Hours: [
    { field: "Practical_Hours", header: "Horas", type: "number" },
    { field: "Practical_Hours_Status", header: "Estado", type: "boolean" },
  ],
  Country: [
    { field: "Country_Name", header: "Nombre", type: "string" },
    { field: "Country_Status", header: "Estado", type: "boolean" },
  ],
  Province: [
    { field: "Country_FK", header: "País", type: "string" },
    { field: "Province_Name", header: "Nombre", type: "string" },
    { field: "Province_Status", header: "Estado", type: "boolean" },
  ],
  City: [
    { field: "Province_FK", header: "Provincia", type: "string" },
    { field: "City_Name", header: "Nombre", type: "string" },
    { field: "City_Status", header: "Estado", type: "boolean" },
  ],
  Zone: [
    { field: "Zone_Name", header: "Nombre", type: "string" },
    { field: "Zone_Status", header: "Estado", type: "boolean" },
  ],
  Sector: [
    { field: "Zone_FK", header: "Zona", type: "string" },
    { field: "Sector_Name", header: "Nombre", type: "string" },
    { field: "Sector_Status", header: "Estado", type: "boolean" },
  ],
  Subject: [
    { field: "Subject_Name", header: "Nombre", type: "string" },
    { field: "Subject_NRC", header: "NRC", type: "string" },
    { field: "Subject_Status", header: "Estado", type: "boolean" },
  ],
  Topic: [
    { field: "Subject_FK", header: "Área/Materia", type: "string" },
    { field: "Topic_Name", header: "Tema", type: "string" },
    { field: "Topic_Status", header: "Estado", type: "boolean" },
  ],
  Client_Type: [
    { field: "Client_Type_Name", header: "Nombre", type: "string" },
    { field: "Client_Type_Status", header: "Estado", type: "boolean" },
  ],
  Type_Of_Activity: [
    { field: "Type_Of_Activity_Name", header: "Nombre", type: "string" },
    { field: "Type_Of_Activity_Status", header: "Estado", type: "boolean" },
  ],
  Field_Of_Activity: [
    { field: "Type_Of_Activity_FK", header: "Tipo de Actividad", type: "string" },
    { field: "Field_Of_Activity_Name", header: "Nombre", type: "string" },
    { field: "Field_Of_Activity_Type", header: "Tipo", type: "string" },
    { field: "Field_Of_Activity_Status", header: "Estado", type: "boolean" },
  ],

};

// Función para resetear el registro seleccionado
const resetSelectedRecord = () => {
  selectedRecord.value = {};
};

function goToProfilePermissions() {
  router.push({ name: "RoleView" }); // Cambia el nombre por el de tu ruta destino
}

// Mapeo de nombres amigables para el select
const tableNames: { [key in keyof typeof tableConfig]: string } = {
  //USUARIO
  Sex: "Sexo",
  Country: "País de origen",
  Ethnicity: "Etnia",
  Province: "Provincia",
  City: "Ciudad",
  Zone: "Zona",
  Sector: "Sector",
  Academic_Instruction: "Instrucción",
  Occupations: "Ocupación",
  Civil_Status: "Estado Civil",
  Income_Level: "Nivel de Ingresos",
  Family_Income: "Ingresos Familiares",
  Family_Group: "Grupo Familiar",
  Own_Assets: "Patrimonio Propio",
  Type_Of_Housing: "Tipo de vivienda",
  Pensioner: "Pensionista",
  Health_Insurance: "Seguro de Salud",
  Vulnerable_Situation: "Situación de vulnerabilidad",
  Documentation_Backup: "Documentos de respaldo",
  Disability: "Discapacidad",
  Catastrophic_Illness: "Enfermedad Catastrófica",
  //FICHA TÉCNICA
  Case_Status: "Estado del Caso",
  Client_Type: "Tipo de Cliente",
  Subject: "Área/Materia",
  Topic: "Tema",
  Type_Of_Attention: "Tipo de Atención",
  Complexity: "Complejidad",
  Derived_By: "Derivado por",
  //CONTROL DE INGRESOS
  Schedule: "Horario",
  Profiles: "Perfiles/Roles",
  Period_Type: "Tipo de Período",
  Practical_Hours: "Horas Prácticas",
  //EXTRA
  Number_Of_Attempts: "Número de Intentos",
  Protocols: "Protocolos",
  Type_Of_Activity: "Tipo de Actividad",
  Field_Of_Activity: "Campo de Actividad",
};

// Mapeo de campos de ID según la tabla
const idFieldMap: { [key in keyof typeof tableConfig]: string } = {
  Vulnerable_Situation: "Vulnerable_Situation_ID",
  Catastrophic_Illness: "Catastrophic_Illness_ID",
  Disability: "Disability_ID",
  Protocols: "Protocol_ID",
  Case_Status: "Case_Status_ID",
  Type_Of_Attention: "Type_Of_Attention_ID",
  Schedule: "Schedule_ID",
  Profiles: "Profile_ID",
  Occupations: "Occupation_ID",
  Income_Level: "Income_Level_ID",
  Family_Group: "Family_Group_ID",
  Family_Income: "Family_Income_ID",
  Type_Of_Housing: "Type_Of_Housing_ID",
  Own_Assets: "Own_Assets_ID",
  Pensioner: "Pensioner_ID",
  Health_Insurance: "Health_Insurance_ID",
  Ethnicity: "Ethnicity_ID",
  Academic_Instruction: "Academic_Instruction_ID",
  Number_Of_Attempts: "Number_Of_Attempts_ID",
  Complexity: "Complexity_ID",
  Documentation_Backup: "Documentation_Backup_ID",
  Period_Type: "Period_Type_ID",
  Practical_Hours: "Practical_Hours_ID",
  Sex: "Sex_ID",
  Civil_Status: "Civil_Status_ID",
  Derived_By: "Derived_By_ID",
  Country: "Country_ID",
  Province: "Province_ID",
  City: "City_ID",
  Zone: "Zone_ID",
  Sector: "Sector_ID",
  Subject: "Subject_ID",
  Topic: "Topic_ID",
  Client_Type: "Client_Type_ID",
  Type_Of_Activity: "Type_Of_Activity_ID",
  Field_Of_Activity: "Field_Of_Activity_ID",
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

const foreignOptions = ref<{ [key: string]: any[] }>({});

const loadForeignOptions = async () => {
  // Recorremos las columnas que tengan FK (campo que termine en "_FK")
  for (const col of columns.value) {
    if (col.field.endsWith("_FK")) {
      const fkTable = col.field.replace("_FK", "");
      if (!foreignOptions.value[fkTable]) {
        try {
          // Se asume que el endpoint es: API/{nombre en minúscula}s (excepto "city" que se convierte a "cities")
          let endpoint = "";
          if (fkTable.toLowerCase() === "country") {
            endpoint = `${API}/countries`;
          } else if (fkTable.toLowerCase() === "province") {
            endpoint = `${API}/provinces`;
          } else if (fkTable.toLowerCase() === "zone") {
            endpoint = `${API}/zone`;
          } else if (fkTable.toLowerCase() === "subject") {
            endpoint = `${API}/subjects`;
          } else if (fkTable.toLowerCase() === "type_of_activity") {
            endpoint = `${API}/type-of-activity`;
          } else {
            endpoint = `${API}/${fkTable.toLowerCase()}s`;
          }
          const { data } = await axios.get(endpoint);
          foreignOptions.value[fkTable] = Array.isArray(data) ? data : [];
        } catch (error) {
          console.error("Error al cargar opciones para " + fkTable, error);
          foreignOptions.value[fkTable] = [];
        }
      }
    }
  }
};

const getForeignName = (fkField: string, id: any) => {
  const fkTable = fkField.replace("_FK", "");
  const options = foreignOptions.value[fkTable] || [];
  return (
    options.find((item: any) => item[`${fkTable}_ID`] === id)?.[
      `${fkTable}_Name`
    ] || id
  );
};

const loadData = async () => {
  if (selectedTableKey.value) {
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
        Ethnicity: `${API}/ethnicities`,
        Academic_Instruction: `${API}/academic-instructions`,
        Number_Of_Attempts: `${API}/number-of-attempts`,
        Complexity: `${API}/complexities`,
        Documentation_Backup: `${API}/documentation-backups`,
        Period_Type: `${API}/period-types`,
        Practical_Hours: `${API}/practical-hours`,
        Sex: `${API}/sexes`,
        Civil_Status: `${API}/civil-statuses`,
        Derived_By: `${API}/derived-by`,
        Country: `${API}/countries`,
        Province: `${API}/provinces`,
        City: `${API}/cities`,
        Zone: `${API}/zone`,
        Sector: `${API}/sectors`,
        Subject: `${API}/subjects`,
        Topic: `${API}/topics`,
        Client_Type: `${API}/client-types`,
        Type_Of_Activity: `${API}/type-of-activity`,
        Field_Of_Activity: `${API}/field-of-activity`,
      };
      const { data } = await axios.get(urlMap[selectedTableKey.value]);
      if (Array.isArray(data)) {
        tableData.value = data;
      } else {
        console.warn(
          "La respuesta no es un arreglo, se asigna un arreglo vacío"
        );
        tableData.value = [];
      }
      await loadForeignOptions();
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
        Ethnicity: `${API}/ethnicities`,
        Academic_Instruction: `${API}/academic-instructions`,
        Number_Of_Attempts: `${API}/number-of-attempts`,
        Complexity: `${API}/complexities`,
        Documentation_Backup: `${API}/documentation-backups`,
        Period_Type: `${API}/period-types`,
        Practical_Hours: `${API}/practical-hours`,
        Sex: `${API}/sexes`,
        Civil_Status: `${API}/civil-statuses`,
        Derived_By: `${API}/derived-by`,
        Country: `${API}/countries`,
        Province: `${API}/provinces`,
        City: `${API}/cities`,
        Zone: `${API}/zone`,
        Sector: `${API}/sectors`,
        Subject: `${API}/subjects`,
        Topic: `${API}/topics`,
        Client_Type: `${API}/client-types`,
        Type_Of_Activity: `${API}/type-of-activity`,
        Field_Of_Activity: `${API}/field-of-activity`,
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
      await loadData();
    } catch (error) {
      console.error("Error al crear el dato:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo crear el registro, verifica que ese nombre no exista o que los datos sean correctos.",
        life: 5000,
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
        Ethnicity: `${API}/ethnicities`,
        Academic_Instruction: `${API}/academic-instructions`,
        Number_Of_Attempts: `${API}/number-of-attempts`,
        Complexity: `${API}/complexities`,
        Documentation_Backup: `${API}/documentation-backups`,
        Period_Type: `${API}/period-types`,
        Practical_Hours: `${API}/practical-hours`,
        Sex: `${API}/sexes`,
        Civil_Status: `${API}/civil-statuses`,
        Derived_By: `${API}/derived-by`,
        Country: `${API}/countries`,
        Province: `${API}/provinces`,
        City: `${API}/cities`,
        Zone: `${API}/zone`,
        Sector: `${API}/sectors`,
        Subject: `${API}/subjects`,
        Topic: `${API}/topics`,
        Client_Type: `${API}/client-types`,
        Type_Of_Activity: `${API}/type-of-activity`,
        Field_Of_Activity: `${API}/field-of-activity`,
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
      await loadData();
    } catch (error) {
      if ((error as any).response?.status === 404) {
        toast.add({
          severity: "warn",
          summary: "Advertencia",
          detail:
            "Por favor, revisa que has hecho cambios antes de actualizar el registro.",
          life: 4000,
        });
      } 
      else {
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
        Ethnicity: `${API}/ethnicities`,
        Academic_Instruction: `${API}/academic-instructions`,
        Number_Of_Attempts: `${API}/number-of-attempts`,
        Complexity: `${API}/complexities`,
        Documentation_Backup: `${API}/documentation-backups`,
        Period_Type: `${API}/period-types`,
        Practical_Hours: `${API}/practical-hours`,
        Sex: `${API}/sexes`,
        Civil_Status: `${API}/civil-statuses`,
        Derived_By: `${API}/derived-by`,
        Country: `${API}/countries`,
        Province: `${API}/provinces`,
        City: `${API}/cities`,
        Zone: `${API}/zone`,
        Sector: `${API}/sectors`,
        Subject: `${API}/subjects`,
        Topic: `${API}/topics`,
        Client_Type: `${API}/client-types`,
        Type_Of_Activity: `${API}/type-of-activity`,
        Field_Of_Activity: `${API}/field-of-activity`,
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
      await axios.delete(`${urlMap[selectedTableKey.value]}/${recordId}`);
      await loadData();
      toast.add({
        severity: "info",
        summary: "Eliminado",
        detail: "El registro se eliminó exitosamente.",
        life: 3000,
      });
    } catch (error) {
      if ((error as any).response?.status === 400) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail:
            "Existen usuarios asociados a este registro, no se puede eliminar.",
          life: 5000,
        });
      }
      else{
        console.error("Error al eliminar el dato:", error);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo eliminar el registro, verifica que no existan usuarios asociados de ser el caso.",
          life: 3000,
        });
        }

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
    },
  });
};

onMounted(() => {
  loadData();
});
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
        filter
        resetFilterOnHide
        :options="Object.values(tableNames)"
        placeholder="Seleccione una tabla"
        @change="loadData"
      />
      <div class="flex gap-2">
        <Button
          @click="createDialogVisible = true"
          label="Crear"
          icon="pi pi-plus-circle"
          class="mb-4"
          :disabled="!isValueSelected"
        />
        <Button
          v-if="selectedTableLabel === tableNames.Profiles"
          label="Gestionar Permisos"
          icon="pi pi-wrench"
          class="mb-4"
          severity="help"
          @click="goToProfilePermissions"
        />
      </div>
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
              <span v-else-if="col.field.endsWith('_FK')">
                {{ getForeignName(col.field, slotProps.data[col.field]) }}
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

  <div class="grid gap-3">
    <div v-for="col in editableColumns" :key="col.field" class="field">
      <FloatLabel variant="in">
        <!-- Combobox para Field_Of_Activity_Name -->
<Select
  v-if="col.field === 'Field_Of_Activity_Name'"
  :id="col.field"
  v-model="selectedRecord[col.field]"
  :options="[
    { label: 'Descripción de Actividad', value: 'Descripción de Actividad' },
    { label: 'Fecha de Actividad', value: 'Fecha de Actividad' },
    { label: 'Lugar', value: 'Lugar' },
    { label: 'Tiempo de Ejecución', value: 'Tiempo de Ejecución' }
  ]"
  optionLabel="label"
  optionValue="value"
  class="w-full"
  :pt="{ root: { class: 'border-round' } }"
/>

<!-- Combobox para Field_Of_Activity_Type -->
<Select
  v-else-if="col.field === 'Field_Of_Activity_Type'"
  :id="col.field"
  v-model="selectedRecord[col.field]"
  :options="[
    { label: 'Fecha', value: 'Fecha' },
    { label: 'Texto', value: 'Texto' },
    { label: 'Lugar', value: 'Lugar' },
    { label: 'Tiempo', value: 'Tiempo' }
  ]"
  optionLabel="label"
  optionValue="value"
  class="w-full"
  :pt="{ root: { class: 'border-round' } }"
/>

        <!-- Otros campos -->
        <InputText
          v-else-if="col.type === 'string' && !col.field.endsWith('_FK')"
          :id="col.field"
          v-model="selectedRecord[col.field]"
          autocomplete="off"
          size="large"
          class="w-full"
          :pt="{ root: { class: 'border-round' } }"
        />
        <div v-else-if="col.field.endsWith('_FK')">
          <Select
            :id="col.field"
            v-model="selectedRecord[col.field]"
            :options="foreignOptions[col.field.replace('_FK', '')]"
            :optionLabel="col.field.replace('_FK', '') + '_Name'"
            :optionValue="col.field.replace('_FK', '') + '_ID'"
            class="w-full"
            :pt="{ root: { class: 'border-round' } }"
          />
        </div>

        <InputNumber
          v-else-if="col.type === 'number'"
          v-model="selectedRecord[col.field]"
          mode="decimal"
          showButtons
          :min="1"
          size="large"
          class="w-full"
          inputClass="w-full"
          :pt="{ root: { class: 'border-round' } }"
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
          :pt="{ root: { class: 'w-2rem h-2rem' }, box: { class: 'border-2 w-2rem h-2rem' } }"
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
        @click="createRecord"
      />
    </div>
  </div>
</Dialog>

    <!-- Modal de Edición -->
    <Dialog
  v-model:visible="editDialogVisible"
  :header="`Editar ${selectedTableLabel}`"
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

  <div class="grid gap-3">
    <div v-for="col in editableColumns" :key="col.field" class="field">
      <FloatLabel variant="in">
        <!-- Combobox para Field_Of_Activity_Name -->
<Select
  v-if="col.field === 'Field_Of_Activity_Name'"
  :id="col.field"
  v-model="selectedRecord[col.field]"
  :options="[
    { label: 'Descripción de Actividad', value: 'Descripción de Actividad' },
    { label: 'Fecha de Actividad', value: 'Fecha de Actividad' },
    { label: 'Lugar', value: 'Lugar' },
    { label: 'Tiempo de Ejecución', value: 'Tiempo de Ejecución' }
  ]"
  optionLabel="label"
  optionValue="value"
  class="w-full"
  :pt="{ root: { class: 'border-round' } }"
/>

<!-- Combobox para Field_Of_Activity_Type -->
<Select
  v-else-if="col.field === 'Field_Of_Activity_Type'"
  :id="col.field"
  v-model="selectedRecord[col.field]"
  :options="[
    { label: 'Fecha', value: 'Fecha' },
    { label: 'Texto', value: 'Texto' },
    { label: 'Lugar', value: 'Lugar' },
    { label: 'Tiempo de Ejecución', value: 'Tiempo de Ejecución' }
  ]"
  optionLabel="label"
  optionValue="value"
  class="w-full"
  :pt="{ root: { class: 'border-round' } }"
/>

        <!-- Otros campos -->
        <InputText
          v-else-if="col.type === 'string' && !col.field.endsWith('_FK')"
          :id="col.field"
          v-model="selectedRecord[col.field]"
          autocomplete="off"
          size="large"
          class="w-full"
          :pt="{ root: { class: 'border-round' } }"
        />
        <div v-else-if="col.field.endsWith('_FK')">
          <Select
            :id="col.field"
            v-model="selectedRecord[col.field]"
            :options="foreignOptions[col.field.replace('_FK', '')]"
            :optionLabel="col.field.replace('_FK', '') + '_Name'"
            :optionValue="col.field.replace('_FK', '') + '_ID'"
            class="w-full"
            :pt="{ root: { class: 'border-round' } }"
          />
        </div>

        <InputNumber
          v-else-if="col.type === 'number'"
          v-model="selectedRecord[col.field]"
          mode="decimal"
          showButtons
          :min="1"
          :max="col.field === 'Schedule_Limit' ? 60 : 100"
          size="large"
          class="w-full"
          inputClass="w-full"
          :pt="{ root: { class: 'border-round' } }"
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
          :pt="{ root: { class: 'w-2rem h-2rem' }, box: { class: 'border-2 w-2rem h-2rem' } }"
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
        @click="editRecord"
      />
    </div>
  </div>
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
            <span v-else-if="col.field.endsWith('_FK')">
              {{ getForeignName(col.field, selectedRecord[col.field]) }}
            </span>
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
