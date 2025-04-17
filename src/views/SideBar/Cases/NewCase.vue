<script setup lang="ts">
import { nextTick, ref, watch, onMounted, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { API } from "@/ApiRoute";
import { Toast } from "primevue";
import { useConfirm } from "primevue/useconfirm";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/ApiRoute";
import type { Initial_Consultation } from "@/ApiRoute";
import type { Evidence } from "@/ApiRoute";
import type { Activity } from "@/ApiRoute";
import InputNumber from "primevue/inputnumber";
import InputMask from "primevue/inputmask";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import Select from "primevue/select";
import MultiSelect from "primevue/multiselect";
import DatePicker from "primevue/datepicker";
import FloatLabel from "primevue/floatlabel";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import FileUpload from "primevue/fileupload";
import Paginator from "primevue/paginator";
import Dialog from "primevue/dialog";
import Knob from "primevue/knob";
import Editor from "primevue/editor";
import ConfirmDialog from "primevue/confirmdialog";
import ProgressSpinner from "primevue/progressspinner";
import ToggleSwitch from 'primevue/toggleswitch';
import axios from "axios";

const route = useRoute();
const authStore = useAuthStore();

onMounted(async () => {
  if (route.query.userID) {
    searchIDInput.value = route.query.userID as string;
    // Cargar las consultas del usuario
    await fetchConsultations();
    if (route.query.caseID) {
      const caseID = route.query.caseID as string;
      const index = consultations.value.findIndex(
        (c) => c.Init_Code === caseID
      );
      if (index >= 0) {
        first.value = index; // Establecer el índice del paginador
        // Si ya tienes lógica para actualizar la ficha actual, ejecútala aquí
      }
    }
    // Llama a searchIDButton() si es necesario para iniciar la búsqueda
    searchIDButton();
  }
});

const toast = useToast();

const currentDateTime = new Date();
const date = currentDateTime.toDateString();

const searchIDInput = ref<string>("");
const selectedUser = ref<User>({} as User);
const selectedEvidence = ref<Evidence>({} as Evidence);
const selectedActivity = ref<Activity[]>([]);

const referenceDialog = ref(false);
const healthDocumentDialog = ref(false);
const bandera = ref<boolean>(false); //Revisa si la cedula tiene 10 digitos

const userRequestNewDocument = ref(false); //Revisa si el usuario quiere subir un nuevo documento
const userRequestNewEvidenceDocument = ref(false); //Revisa si el usuario quiere subir un nuevo documento de evidencia
const doesUserRequestNewConsultation = ref(false); //Revisa si el usuario quiere subir una nueva consulta
const fileUploadEvidence = ref<any>(null);
const isEvidenceLoading = ref(false);

const watchAlertDialog = ref(false);
const doesConsultationHasAlert = ref(false);

const toastCounter = ref(0);

const confirm = useConfirm();

const deleteDocument = () => {
  confirm.require({
    message: "¿Estás seguro que deseas eliminar este documento?",
    header: "Advertencia",
    icon: "pi pi-info-circle",
    rejectLabel: "Cancelar",
    rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
    acceptProps: { label: "Eliminar", severity: "danger" },
    accept: async () => {
      try {
        await axios.delete(`${API}/user/document/${userID.value}`, {
          headers: {
            "internal-id": internalID,
          },
        });
        toast.add({
          severity: "info",
          summary: "Eliminado",
          detail: "El documento se eliminó exitosamente.",
          life: 3000,
        });
        fetchUser(); // Actualiza la información del usuario después de eliminar el documento
      } catch (error: any) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: error.response.data.message,
          life: 3000,
        });
      }
    },
  });
};

//Metodo para eliminar la evidencia
const deleteEvidenceDocument = () => {
  confirm.require({
    message: "¿Estás seguro que deseas eliminar este documento?",
    header: "Advertencia",
    icon: "pi pi-info-circle",
    rejectLabel: "Cancelar",
    rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
    acceptProps: { label: "Eliminar", severity: "danger" },
    accept: async () => {
      try {
        await axios.delete(`${API}/evidence/document/${evidenceID.value}`, {
          headers: {
            "internal-id": internalID,
          },
        });
        toast.add({
          severity: "info",
          summary: "Eliminado",
          detail: "El documento se eliminó exitosamente.",
          life: 3000,
        });
        fetchConsultations(); // Actualiza la información de la consulta después de eliminar el documento
        fetchEvidence(initCode.value); // Actualiza la información de la evidencia después de eliminar el documento
        userRequestNewEvidenceDocument.value = true;
      } catch (error: any) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: error.response.data.message,
          life: 3000,
        });
      }
    },
  });
};

//Metodo para subir un nuevo documento
// Se utiliza el mismo método que para la evidencia, pero se cambia la URL y el header
// para que se ajuste a la API de documentos de usuario

const uploadNewEvidenceDocument = () => {
  confirm.require({
    message: "¿Estás seguro que deseas subir un nuevo documento?",
    header: "Confirmación",
    icon: "pi pi-cloud-upload",
    rejectLabel: "Cancelar",
    rejectProps: { label: "Cancelar", severity: "secondary", outlined: true },
    acceptProps: { label: "Subir", severity: "success" },
    accept: async () => {
      try {
        // Crear FormData y agregar el archivo y el nombre personalizado
        const formData = new FormData();
        if (evidenceFile.value) {
          formData.append("evidenceFile", evidenceFile.value);

          // Agregar el nombre del archivo recibido en la variable
          if (evidenceFileName.value) {
            formData.append("Evidence_Name", evidenceFileName.value);
          } else {
            console.warn(
              "No se proporcionó nombre para el archivo. Se usará el original."
            );
          }
          userRequestNewEvidenceDocument.value = false; // Reiniciamos el estado del boton de subir nuevo documento
        } else {
          toast.add({
            severity: "warn",
            summary: "Atención",
            detail: "No se ha seleccionado ningún archivo.",
            life: 3000,
          });
          return;
        }
        // Realizar el PUT
        await axios.put(
          `${API}/evidence/new/document/${evidenceID.value}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "internal-id": internalID,
            },
          }
        );
        fetchConsultations();
        restartEvidence(); // Reiniciamos el estado del FileUpload
        fetchEvidence(initCode.value); // Actualizamos la información del usuario después de subir el documento
        toast.add({
          severity: "info",
          summary: "Archivo subido",
          detail: "El documento se actualizó exitosamente.",
          life: 3000,
        });
      } catch (error: any) {
        console.error("Error en la subida del documento:", error);
        toast.add({
          severity: "error",
          summary: "Error",
          detail:
            error.response?.data?.message || "Error al subir el documento",
          life: 3000,
        });
      }
    },
    reject: () => {
      userRequestNewEvidenceDocument.value = false; // Reiniciamos el estado del boton de subir nuevo documento
    },
  });
};

const uploadNewDocument = () => {
  confirm.require({
    message: "¿Estás seguro que deseas subir un nuevo documento?",
    header: "Confirmación",
    icon: "pi pi-cloud-upload",
    rejectLabel: "Cancelar",
    rejectProps: { label: "Cancelar", severity: "secondary", outlined: true },
    acceptProps: { label: "Subir", severity: "success" },
    accept: async () => {
      try {
        // Crear FormData y agregar el archivo y el nombre personalizado
        const formData = new FormData();
        if (userHealthDocuments.value) {
          formData.append("healthDocuments", userHealthDocuments.value);

          // Agregar el nombre del archivo recibido en la variable
          if (userHealthDocumentsName.value) {
            formData.append(
              "User_HealthDocumentsName",
              userHealthDocumentsName.value
            );
          } else {
            console.warn(
              "No se proporcionó nombre para el archivo. Se usará el original."
            );
          }
        } else {
          toast.add({
            severity: "warn",
            summary: "Atención",
            detail: "No se ha seleccionado ningún archivo.",
            life: 3000,
          });
          return;
        }
        // Realizar el PUT
        console.log(
          "NOMBRE DEL DOCUMENTO ANTES DE SUBIR:",
          userHealthDocumentsName.value
        );
        await axios.put(`${API}/user/document/${userID.value}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "internal-id": internalID,
          },
        });
        fetchUser(); // Actualizamos la información del usuario después de subir el documento
        userRequestNewDocument.value = false; //Ocultamos el boton de subir nuevo documento
        healthDocumentDialog.value = false; // Cerrar el diálogo después de subir el documento
        toast.add({
          severity: "info",
          summary: "Archivo subido",
          detail: "El documento se actualizó exitosamente.",
          life: 3000,
        });
      } catch (error: any) {
        console.error("Error en la subida del documento:", error);
        toast.add({
          severity: "error",
          summary: "Error",
          detail:
            error.response?.data?.message || "Error al subir el documento",
          life: 3000,
        });
      }
    },
  });
};

//-------------------------------------------------------------------------------------------------------------//

//MANEJO DE ARCHIVOS

const totalSize = ref(0);
const totalSizePercent = ref(0);
const watchHealthDocumentDialog = ref(false);
const watchEvidenceDocumentDialog = ref(false);
const watchAttentionSheetDialog = ref(false);
const watchActivityDocumentDialog = ref(false);
const urlDocument = ref("");

// Captura el archivo seleccionado en FileUpload y lo guarda en userHealthDocuments
function onSelectedFiles(event: { files: File[] }) {
  //Comprobamos que el archivo no pese mas de 2MB
  if (event.files && event.files.length > 0) {
    const file = event.files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB en bytes
    if (file.size > maxSize) {
      healthDocumentDialog.value = false; // Cerrar el diálogo si el archivo es demasiado grande
      toast.add({
        severity: "warn",
        summary: "Atención",
        detail: "El archivo excede el tamaño máximo de 2MB.",
        life: 5000,
      });
      userHealthDocuments.value = null; // Limpiar el archivo pendiente
      return;
    } else if (file.size <= maxSize) {
      userHealthDocuments.value = event.files[0]; // Guardar el archivo
      userHealthDocumentsName.value = event.files[0].name; // Guardar el nombre del archivo
      console.log("Archivo cargado:", userHealthDocuments.value);
      console.log("Nombre del archivo:", userHealthDocumentsName.value);
      userRequestNewDocument.value = true;
    }
  }
}
// Elimina el archivo pendiente usando el callback del FileUpload
function onRemoveTemplatingFile(
  file: File,
  removeFileCallback: Function,
  index: number
) {
  removeFileCallback(index);
  userHealthDocuments.value = null;
}

// Elimina el archivo ya guardado para poder reemplazarlo
function removeUploadedFile() {
  userHealthDocuments.value = null;
}

// Cierra el diálogo sin guardar (opcionalmente se puede limpiar el archivo pendiente)
function cancelUpload() {
  healthDocumentDialog.value = false;
  if (doesUserExist.value && selectedUser.value.User_HealthDocuments === null) {
    userHealthDocuments.value = null; // Limpiar el archivo pendiente
  }
}

// Guarda el documento (se mantiene en el estado; aquí puedes agregar la llamada al backend)
function onSaveDocument() {
  if (userHealthDocuments.value) {
    healthDocumentDialog.value = false;
    toast.add({
      severity: "success",
      summary: "Documento guardado",
      detail: userHealthDocuments.value.name,
      life: 3000,
    });
    userRequestNewDocument.value = false; //Ocultamos el boton de subir nuevo documento
  } else {
    toast.add({
      severity: "warn",
      summary: "Atención",
      detail: "No se ha seleccionado ningún archivo.",
      life: 3000,
    });
  }
}

// Función para cargar un documento existente desde el backend (si aplica)
const loadUserHealthDocument = async (userID: string) => {
  try {
    const response = await axios.get(`${API}/user/document/${userID}`, {
      responseType: "blob",
    });

    if (response.status === 200) {
      const contentType = response.headers["content-type"] || "application/pdf";
      const blob = new Blob([response.data], { type: contentType });
      urlDocument.value = URL.createObjectURL(blob);
      watchHealthDocumentDialog.value = true;
    } else {
      throw new Error(`Error al obtener el documento: ${response.statusText}`);
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo cargar el documento PDF.",
      life: 3000,
    });
    console.error("Error al cargar el documento PDF:", error);
  }
};

//-------------------------------------------------------------------------------------------------------------//
//MANEJO DE EVIDENCIAS

function onSelectedFilesEvidence(event: { files: File[] }) {
  if (event.files && event.files.length > 0) {
    const file = event.files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.add({
        severity: "warn",
        summary: "Atención",
        detail: "El archivo excede el tamaño máximo de 2MB.",
        life: 5000,
      });
      restartEvidence(); // Reinicia el estado del FileUpload
      return;
    } else {
      if (doesUserExist) {
        userRequestNewEvidenceDocument.value = true; // Reiniciamos el estado del boton de subir nuevo documento
      } else {
        userRequestNewEvidenceDocument.value = false; // Reiniciamos el estado del boton de subir nuevo documento
      }
      evidenceFile.value = file;
      evidenceFileName.value = file.name;
      console.log("Archivo cargado:", evidenceFile.value);
      console.log("Nombre del archivo:", evidenceFileName.value);
      onSaveDocumentEvidence(); // Opcionalmente notifica que se ha guardado
    }
  }
}

function onRemoveTemplatingFileEvidence(
  file: File,
  removeFileCallback: Function,
  index: number
) {
  removeFileCallback(index);
  evidenceFile.value = null;
  if (doesUserExist) {
    userRequestNewEvidenceDocument.value = false; // Reiniciamos el estado del boton de subir nuevo documento
  }
}

function onSaveDocumentEvidence() {
  if (evidenceFile.value && !doesUserExist) {
    toast.add({
      severity: "success",
      summary: "Documento guardado",
      detail: evidenceFile.value.name,
      life: 3000,
    });
  } else if (!evidenceFile.value) {
    toast.add({
      severity: "warn",
      summary: "Atención",
      detail: "No se ha seleccionado ningún archivo.",
      life: 3000,
    });
  }
}

const loadUserEvidenceDocument = async (evidenceID: number) => {
  try {
    const response = await axios.get(`${API}/evidence/document/${evidenceID}`, {
      responseType: "blob", // Asegúrate de que el backend envíe el archivo como un blob
    });

    if (response.status === 200) {
      const contentType = response.headers["content-type"] || "application/pdf"; // Tipo de archivo
      const blob = new Blob([response.data], { type: contentType }); // Crear un blob a partir del buffer
      urlDocument.value = URL.createObjectURL(blob); // Crear una URL para visualizar el archivo
      watchEvidenceDocumentDialog.value = true; // Mostrar el diálogo con el documento
    } else {
      throw new Error(`Error al obtener el documento: ${response.statusText}`);
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo cargar el documento PDF.",
      life: 3000,
    });
    console.error("Error al cargar el documento PDF:", error);
  }
};

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

//--------------------------------------------------------------------------------------------------------------//
const loadActivityDocument = async (activityID: number) => {
  try {
    const response = await axios.get(`${API}/activity/document/${activityID}`, {
      responseType: "blob", // Asegúrate de que el backend envíe el archivo como un blob
    });

    if (response.status === 200) {
      const contentType = response.headers["content-type"] || "application/pdf"; // Tipo de archivo
      const blob = new Blob([response.data], { type: contentType }); // Crear un blob a partir del buffer
      urlDocument.value = URL.createObjectURL(blob); // Crear una URL para visualizar el archivo
      watchAttentionSheetDialog.value = true; // Mostrar el diálogo con el documento
    } else {
      throw new Error(`Error al obtener el documento: ${response.statusText}`);
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo cargar el documento PDF.",
      life: 3000,
    });
    console.error("Error al cargar el documento PDF:", error);
  }
};

//--------------------------------------------------------------------------------------------------------------//

const restartDocument = () => {
  userHealthDocuments.value = null;
  userHealthDocumentsName.value = "";
  totalSize.value = 0;
  totalSizePercent.value = 0;
  userRequestNewDocument.value = false; //Reiniciamos el estado del boton de subir nuevo documento
  userRequestNewEvidenceDocument.value = false; //Reiniciamos el estado del boton de subir nuevo documento
};

const restartEvidence = () => {
  // Limpia la lista interna del FileUpload
  fileUploadEvidence.value?.clear();
  evidenceFile.value = null;
  evidenceFileName.value = "";
  selectedEvidence.value = {} as Evidence;
  selectedEvidence.value.Evidence_Name = "";
  totalSize.value = 0;
  totalSizePercent.value = 0;
};

//-------------------------------------------------------------------------------------------------------------//
//VARIABLES DEL FORMULARIO

//DATOS PERSONALES
const userIDType = ref<{ name: string; value: string } | null>(null);
const userIDOptions = ref([
  { name: "C.I (Cédula)", value: "cedula" },
  { name: "PA (Pasaporte)", value: "pasaporte" },
]);

const userID = ref("");
const userAge = ref("");
const userFirstName = ref("");
const userLastName = ref("");

const userGender = ref<{ name: string; value: string } | null>(null);
const userGenderOptions = ref<{ name: string; value: string }[]>([]);

axios.get(`${API}/sexes`).then((response) => {
  userGenderOptions.value = response.data.map((item: any) => ({
    name: item.Sex_Name,
    value: item.Sex_Name,
  }));
});

const userBirthDate = ref<Date | null>(null);

const userNationality = ref<{ name: string; value: string } | null>(null);
const countriesList = ref<{ name: string; value: string }[]>([]);
const originalCountries = ref([
{ name: "Ecuador", code: "EC" },
    { name: "Afganistán", code: "AF" },
    { name: "Albania", code: "AL" },
    { name: "Alemania", code: "DE" },
    { name: "Andorra", code: "AD" },
    { name: "Angola", code: "AO" },
    { name: "Antigua y Barbuda", code: "AG" },
    { name: "Arabia Saudita", code: "SA" },
    { name: "Argelia", code: "DZ" },
    { name: "Argentina", code: "AR" },
    { name: "Armenia", code: "AM" },
    { name: "Aruba", code: "AW" },
    { name: "Australia", code: "AU" },
    { name: "Austria", code: "AT" },
    { name: "Azerbaiyán", code: "AZ" },
  
    { name: "Bahamas", code: "BS" },
    { name: "Baréin", code: "BH" },
    { name: "Bangladesh", code: "BD" },
    { name: "Birmania", code: "MM" },
    { name: "Barbados", code: "BB" },
    { name: "Bielorrusia", code: "BY" },
    { name: "Bélgica", code: "BE" },
    { name: "Belice", code: "BZ" },
    { name: "Bermudas", code: "BM" },
    { name: "Bután", code: "BT" },
    { name: "Bolivia", code: "BO" },
    { name: "Bosnia y Herzegovina", code: "BA" },
    { name: "Botsuana", code: "BW" },
    { name: "Brasil", code: "BR" },
    { name: "Brunéi", code: "BN" },
    { name: "Bulgaria", code: "BG" },
    { name: "Burkina Faso", code: "BF" },
    { name: "Burundi", code: "BI" },
  
    { name: "Cabo Verde", code: "CV" },
    { name: "Camboya", code: "KH" },
    { name: "Camerún", code: "CM" },
    { name: "Canadá", code: "CA" },
    { name: "Catar", code: "QA" },
    { name: "Chad", code: "TD" },
    { name: "Chile", code: "CL" },
    { name: "China", code: "CN" },
    { name: "Chipre", code: "CY" },
    { name: "Colombia", code: "CO" },
    { name: "Comoras", code: "KM" },
    { name: "Costa de Marfil", code: "CI" },
    { name: "Costa Rica", code: "CR" },
    { name: "Croacia", code: "HR" },
    { name: "Cuba", code: "CU" },
    { name: "Curazao", code: "CW" },
  
    { name: "Dinamarca", code: "DK" },
    { name: "Dominica", code: "DM" },
    { name: "República Dominicana", code: "DO" },
  

    { name: "Egipto", code: "EG" },
    { name: "El Salvador", code: "SV" },
    { name: "Emiratos Árabes Unidos", code: "AE" },
    { name: "Eritrea", code: "ER" },
    { name: "Eslovaquia", code: "SK" },
    { name: "Eslovenia", code: "SI" },
    { name: "España", code: "ES" },
    { name: "Estados Unidos", code: "US" },
    { name: "Estonia", code: "EE" },
    { name: "Esuatini", code: "SZ" },
    { name: "Etiopía", code: "ET" },
  
    { name: "Filipinas", code: "PH" },
    { name: "Finlandia", code: "FI" },
    { name: "Francia", code: "FR" },
  
    { name: "Gabón", code: "GA" },
    { name: "Gambia", code: "GM" },
    { name: "Georgia", code: "GE" },
    { name: "Ghana", code: "GH" },
    { name: "Granada", code: "GD" },
    { name: "Guatemala", code: "GT" },
    { name: "Guayana", code: "GY" },
    { name: "Guinea", code: "GN" },
    { name: "Guinea-Bisáu", code: "GW" },
    { name: "Guinea Ecuatorial", code: "GQ" },
  
    { name: "Haití", code: "HT" },
    { name: "Honduras", code: "HN" },
    { name: "Hungría", code: "HU" },
  
    { name: "India", code: "IN" },
    { name: "Indonesia", code: "ID" },
    { name: "Inglaterra", code: "GB" },
    { name: "Irán", code: "IR" },
    { name: "Irak", code: "IQ" },
    { name: "Irlanda", code: "IE" },
    { name: "Islandia", code: "IS" },
    { name: "Israel", code: "IL" },
    { name: "Italia", code: "IT" },
  
    { name: "Jamaica", code: "JM" },
    { name: "Japón", code: "JP" },
    { name: "Jordania", code: "JO" },
  
    { name: "Kazajistán", code: "KZ" },
    { name: "Kenia", code: "KE" },
    { name: "Kirguistán", code: "KG" },
    { name: "Kiribati", code: "KI" },
    { name: "Corea del Norte", code: "KP" },
    { name: "Corea del Sur", code: "KR" },
    { name: "Kuwait", code: "KW" },
  
    { name: "Laos", code: "LA" },
    { name: "Letonia", code: "LV" },
    { name: "Líbano", code: "LB" },
    { name: "Liberia", code: "LR" },
    { name: "Libia", code: "LY" },
    { name: "Liechtenstein", code: "LI" },
    { name: "Lituania", code: "LT" },
    { name: "Luxemburgo", code: "LU" },
  
    { name: "Macedonia del Norte", code: "MK" },
    { name: "Madagascar", code: "MG" },
    { name: "Malaui", code: "MW" },
    { name: "Malasia", code: "MY" },
    { name: "Maldivas", code: "MV" },
    { name: "Malí", code: "ML" },
    { name: "Malta", code: "MT" },
    { name: "Islas Marshall", code: "MH" },
    { name: "Mauritania", code: "MR" },
    { name: "Mauricio", code: "MU" },
    { name: "México", code: "MX" },
    { name: "Micronesia", code: "FM" },
    { name: "Moldavia", code: "MD" },
    { name: "Mónaco", code: "MC" },
    { name: "Mongolia", code: "MN" },
    { name: "Montenegro", code: "ME" },
    { name: "Marruecos", code: "MA" },
    { name: "Mozambique", code: "MZ" },
  
    { name: "Namibia", code: "NA" },
    { name: "Nauru", code: "NR" },
    { name: "Nepal", code: "NP" },
    { name: "Países Bajos", code: "NL" },
    { name: "Nueva Zelanda", code: "NZ" },
    { name: "Nicaragua", code: "NI" },
    { name: "Níger", code: "NE" },
    { name: "Nigeria", code: "NG" },
  
    { name: "Isla de Man", code: "IM" },
    { name: "Noruega", code: "NO" },
  
    { name: "Omán", code: "OM" },
  
    { name: "Pakistán", code: "PK" },
    { name: "Palaos", code: "PW" },
    { name: "Palestina", code: "PS" },
    { name: "Panamá", code: "PA" },
    { name: "Papúa Nueva Guinea", code: "PG" },
    { name: "Paraguay", code: "PY" },
    { name: "Perú", code: "PE" },
    { name: "Polonia", code: "PL" },
    { name: "Portugal", code: "PT" },
  
    { name: "Ruanda", code: "RW" },
  
    { name: "Rumania", code: "RO" },
    { name: "Rusia", code: "RU" },
  
    { name: "San Cristóbal y Nieves", code: "KN" },
    { name: "Santa Lucía", code: "LC" },
    { name: "San Vicente y las Granadinas", code: "VC" },
    { name: "San Marino", code: "SM" },
    { name: "Santo Tomé y Príncipe", code: "ST" },
    { name: "Senegal", code: "SN" },
    { name: "Serbia", code: "RS" },
    { name: "Seychelles", code: "SC" },
    { name: "Sierra Leona", code: "SL" },
    { name: "Singapur", code: "SG" },
    { name: "Siria", code: "SY" },
    { name: "Somalia", code: "SO" },
    { name: "Sudáfrica", code: "ZA" },
    { name: "Sudán", code: "SD" },
    { name: "Sudán del Sur", code: "SS" },
    { name: "Suecia", code: "SE" },
    { name: "Suiza", code: "CH" },
  
    { name: "Surinam", code: "SR" },
  
    { name: "Tailandia", code: "TH" },
    { name: "Tanzania", code: "TZ" },
    { name: "Timor Oriental", code: "TL" },
    { name: "Togo", code: "TG" },
    { name: "Tonga", code: "TO" },
    { name: "Trinidad y Tobago", code: "TT" },
    { name: "Túnez", code: "TN" },
    { name: "Turkmenistán", code: "TM" },
    { name: "Turquía", code: "TR" },
    { name: "Tuvalu", code: "TV" },
  
    { name: "Uganda", code: "UG" },
    { name: "Ucrania", code: "UA" },
    { name: "Uruguay", code: "UY" },
    { name: "Uzbekistán", code: "UZ" },
  
    { name: "Vanuatu", code: "VU" },
    { name: "Ciudad del Vaticano", code: "VA" },
    { name: "Venezuela", code: "VE" },
    { name: "Vietnam", code: "VN" },
  
    { name: "Islas Vírgenes Británicas", code: "VG" },
    { name: "Islas Vírgenes de los Estados Unidos", code: "VI" },
  
    { name: "Wallis y Futuna", code: "WF" },
  
    { name: "Yemen", code: "YE" },
  
    { name: "Zambia", code: "ZM" },
    { name: "Zimbabue", code: "ZW" },
]);
axios.get(`${API}/countries`).then((response) => {
  countriesList.value = response.data.map((item: any) => {
    // item.Country_Name' contiene el nombre del país devuelto por la API
    const countryName = item.Country_Name;
    // Buscamos en la lista original el país que coincida (ignorando mayúsculas/minúsculas)
    const matchedCountry = originalCountries.value.find(
      (country: { name: string }) =>
        country.name.toLowerCase() === countryName.toLowerCase()
    );
    return {
      name: countryName,
      code: matchedCountry ? matchedCountry.code : "", // Si no se encuentra, asigna un string vacío
    };
  });
});

const userEthnicity = ref<{ name: string; value: string } | null>(null);
const userEthnicityOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/ethnicities`).then((response) => {
  userEthnicityOptions.value = response.data.map((item: any) => ({
    name: item.Ethnicity_Name,
    value: item.Ethnicity_Name,
  }));
});

const userProvince = ref<{ name: string; value: string; id: number } | null>(null);
const userProvinceOptions = ref<{ name: string; value: string; id: number }[]>([]);
axios.get(`${API}/provinces`).then((response) => {
  userProvinceOptions.value = response.data.map((item: any) => ({
    name: item.Province_Name,
    value: item.Province_Name, // Keep value as name for submission
    id: item.Province_ID // Store the ID for filtering
  }));
});

const userCity = ref<{ name: string; value: string } | null>(null);
const userCityOptions = ref<{ name: string; value: string }[]>([]);
// axios.get(`${API}/cities`).then((response) => {
//   userCityOptions.value = response.data.map((item: any) => ({
//     name: item.City_Name,
//     value: item.City_Name,
//   }));
// });
const fetchCitiesByProvince = async (provinceId: number | null) => {
  userCity.value = null; // Reset city selection
  if (provinceId) {
    try {
      const response = await axios.get(`${API}/cities/province/${provinceId}`);
      userCityOptions.value = response.data.map((item: any) => ({
        name: item.City_Name,
        value: item.City_Name, // Keep value as name for submission
        id: item.City_ID // Store the ID if needed elsewhere, though not strictly necessary for filtering here
      }));
    } catch (error) {
      console.error("Error fetching cities:", error);
      userCityOptions.value = []; // Clear options on error
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar las ciudades para la provincia seleccionada.",
        life: 3000,
      });
    }
  } else {
    userCityOptions.value = []; // Clear city options if no province is selected
  }
};
// Watch for changes in the selected province
watch(userProvince, (newProvince) => {
  // Avoid fetching cities during the initial reset or if the watcher triggers unexpectedly
  if (!isResettingConsultation.value) {
     fetchCitiesByProvince(newProvince?.id ?? null);
  }
});


//DATOS DE CONTACTO Y CONTACTO DE REFERENCIA
const userPhone = ref("");
const userEmail = ref("");
const userAddress = ref("");

// Modify userSector ref to store Zone_FK
const userSector = ref<{ name: string; value: string; zoneId: number } | null>(null);
const userSectorOptions = ref<{ name: string; value: string; zoneId: number }[]>([]);

// Modify userZone ref to store Zone_ID
const userZone = ref<{ name: string; value: string; id: number } | null>(null);
const userZoneOptions = ref<{ name: string; value: string; id: number }[]>([]);

// Fetch Zones first and store their IDs
axios.get(`${API}/zone`).then((response) => {
  userZoneOptions.value = response.data.map((item: any) => ({
    name: item.Zone_Name,
    value: item.Zone_Name, // Keep value as name for submission
    id: item.Zone_ID // Store the ID
  }));
  // After zones are loaded, fetch sectors
  fetchSectors();
});

const fetchSectors = async () => {
  try {
    const response = await axios.get(`${API}/sectors`);
    userSectorOptions.value = response.data.map((item: any) => ({
      name: item.Sector_Name,
      value: item.Sector_Name, // Keep value as name for submission
      zoneId: item.Zone_FK // Store the foreign key linking to Zone
    }));
  } catch (error) {
    console.error("Error fetching sectors:", error);
    userSectorOptions.value = [];
     toast.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar los sectores.",
        life: 3000,
      });
  }
};

watch(userSector, (newSector) => {
  if (newSector) {
    // Find the corresponding zone in userZoneOptions based on the sector's zoneId
    const correspondingZone = userZoneOptions.value.find(zone => zone.id === newSector.zoneId);
    userZone.value = correspondingZone || null; // Set the zone automatically
  } else {
    userZone.value = null; // Reset zone if sector is cleared
  }
});

const userReferenceRelationship = ref("");
const userReferenceName = ref("");
const userReferencePhone = ref("");

//DATOS DEMOGRÁFICOS

const userSocialBenefit = ref(false);
const userEconomicDependece = ref(false);
const userAcademicInstruction = ref<{ name: string; value: string } | null>(
  null
);
const userAcademicInstructionOptions = ref<{ name: string; value: string }[]>(
  []
);
axios.get(`${API}/academic-instructions`).then((response) => {
  userAcademicInstructionOptions.value = response.data.map((item: any) => ({
    name: item.Academic_Instruction_Name,
    value: item.Academic_Instruction_Name,
  }));
});

const userProfession = ref<{ name: string; value: string } | null>(null);
const userProfessionOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/occupations`).then((response) => {
  userProfessionOptions.value = response.data.map((item: any) => ({
    name: item.Occupation_Name,
    value: item.Occupation_Name,
  }));
});

const userMaritalStatus = ref<{ name: string; value: string } | null>(null);
const userMaritalStatusOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/civil-statuses`).then((response) => {
  userMaritalStatusOptions.value = response.data.map((item: any) => ({
    name: item.Civil_Status_Name,
    value: item.Civil_Status_Name,
  }));
});

const userDependents = ref<number | null>(null);

const userIncomeLevel = ref<{ name: string; value: string } | null>(null);
const userIncomeLevelOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/income-level`).then((response) => {
  userIncomeLevelOptions.value = response.data.map((item: any) => ({
    name: item.Income_Level_Name,
    value: item.Income_Level_Name,
  }));
});

const userFamilyIncome = ref<{ name: string; value: string } | null>(null);
const userFamilyIncomeOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/family-income`).then((response) => {
  userFamilyIncomeOptions.value = response.data.map((item: any) => ({
    name: item.Family_Income_Name,
    value: item.Family_Income_Name,
  }));
});

const userFamilyGroup = ref<{ name: string; value: string }[]>([]);
const userFamilyGroupOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/family-group`).then((response) => {
  userFamilyGroupOptions.value = response.data.map((item: any) => ({
    name: item.Family_Group_Name,
    value: item.Family_Group_Name,
  }));
});

const userEconomicActivePeople = ref<number | null>(null);

//DATOS SOCIOECONÓMICOS Y DE SALUD

const userOwnAssets = ref<{ name: string; value: string }[]>([]);
const userOwnAssetsOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/own-assets`).then((response) => {
  userOwnAssetsOptions.value = response.data.map((item: any) => ({
    name: item.Own_Assets_Name,
    value: item.Own_Assets_Name,
  }));
});

const userHousingType = ref<{ name: string; value: string } | null>(null);
const userHousingTypeOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/type-of-housing`).then((response) => {
  userHousingTypeOptions.value = response.data.map((item: any) => ({
    name: item.Type_Of_Housing_Name,
    value: item.Type_Of_Housing_Name,
  }));
});

const userPensioner = ref<{ name: string; value: string } | null>(null);
const userPensionerOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/pensioner`).then((response) => {
  userPensionerOptions.value = response.data.map((item: any) => ({
    name: item.Pensioner_Name,
    value: item.Pensioner_Name,
  }));
});

const userHealthInsurance = ref<{ name: string; value: string } | null>(null);
const userHealthInsuranceOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/health-insurance`).then((response) => {
  userHealthInsuranceOptions.value = response.data.map((item: any) => ({
    name: item.Health_Insurance_Name,
    value: item.Health_Insurance_Name,
  }));
});

const userVulnerableSituation = ref<{ name: string; value: string } | null>(
  null
);
const userVulnerableSituationOptions = ref<{ name: string; value: string }[]>(
  []
);
axios.get(`${API}/vulnerable-situation`).then((response) => {
  userVulnerableSituationOptions.value = response.data.map((item: any) => ({
    name: item.Vulnerable_Situation_Name,
    value: item.Vulnerable_Situation_Name,
  }));
});

const userSupportingDocuments = ref<{ name: string; value: string } | null>(
  null
);
const userSupportingDocumentsOptions = ref<{ name: string; value: string }[]>(
  []
);
axios.get(`${API}/documentation-backups`).then((response) => {
  userSupportingDocumentsOptions.value = response.data.map((item: any) => ({
    name: item.Documentation_Backup_Name,
    value: item.Documentation_Backup_Name,
  }));
});

const userDisability = ref<{ name: string; value: string } | null>(null);
const userDisabilityOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/disability`).then((response) => {
  userDisabilityOptions.value = response.data.map((item: any) => ({
    name: item.Disability_Name,
    value: item.Disability_Name,
  }));
});

const userDisabilityPercentage = ref<number>(0);

const userCatastrophicIllness = ref<{ name: string; value: string } | null>(
  null
);
const userCatastrophicIllnessOptions = ref<{ name: string; value: string }[]>(
  []
);
axios.get(`${API}/illness`).then((response) => {
  userCatastrophicIllnessOptions.value = response.data.map((item: any) => ({
    name: item.Catastrophic_Illness_Name,
    value: item.Catastrophic_Illness_Name,
  }));
});

const userHealthDocuments = ref<File | null>(null);
const userHealthDocumentsName = ref("");

//-------------------------------------------------------------------------------------------------------------//
//VARIABLES DE LA FICHA DE ASESORÍA

const initCode = ref("");
const internalID = authStore.user?.id;
//Detectamos si init social work cambia de estado a true o false 


const initSocialWork = ref<boolean>(false);
const initMandatorySW = ref<boolean>(false);

const initCaseStatusOptions = ref<{ name: string; value: string }[]>([]);
const initCaseStatus = ref<{ name: string; value: string } | null>(null);


axios.get(`${API}/case-status`).then((response) => {
  initCaseStatusOptions.value = response.data.map((item: any) => ({
    name: item.Case_Status_Name,
    value: item.Case_Status_Name,
  }));

  // Seleccionar "Activo" si existe en la lista, si no, tomar la primera opción
  initCaseStatus.value =
    initCaseStatusOptions.value.find((option) => option.value === "Sin iniciar") ||
    initCaseStatusOptions.value[0] ||
    null;
});

const initOffice = ref('Consultorio Jurídico "PUCE", Sede Quito');

const initDate = ref(new Date(date));
const initEndDate = ref<Date | null>(null);

const initClientType = ref<{ name: string; value: string } | null>(null);
const initClientTypeOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/client-types`).then((response) => {
  initClientTypeOptions.value = response.data.map((item: any) => ({
    name: item.Client_Type_Name,
    value: item.Client_Type_Name,
  }));
});

// Modify initSubject ref to store ID for filtering
const initSubject = ref<{ name: string; value: string; id: number } | null>(null);
const initSubjectOptions = ref<{ name: string; value: string; id: number }[]>([]);
axios.get(`${API}/subjects`).then((response) => {
  initSubjectOptions.value = response.data.map((item: any) => ({
    name: item.Subject_Name,
    value: item.Subject_Name, // Keep value as name for submission
    id: item.Subject_ID // Store the ID for filtering
  }));
});

// Modify initTopic ref (no ID needed here unless used elsewhere)
const initTopic = ref<{ name: string; value: string } | null>(null);
const initTopicOptions = ref<{ name: string; value: string }[]>([]);

// Function to fetch topics based on subject ID
const fetchTopicsBySubject = async (subjectId: number | null) => {
  initTopic.value = null; // Reset topic selection
  if (subjectId) {
    try {
      const response = await axios.get(`${API}/topics/subject/${subjectId}`);
      initTopicOptions.value = response.data.map((item: any) => ({
        name: item.Topic_Name,
        value: item.Topic_Name, // Keep value as name for submission
      }));
    } catch (error) {
      console.error("Error fetching topics:", error);
      initTopicOptions.value = []; // Clear options on error
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar los temas para la materia seleccionada.",
        life: 3000,
      });
    }
  } else {
    initTopicOptions.value = []; // Clear topic options if no subject is selected
  }
};

// Watch for changes in the selected subject
watch(initSubject, (newSubject) => {
  // Avoid fetching topics during the initial reset or if the watcher triggers unexpectedly
   if (!isResettingConsultation.value) {
      fetchTopicsBySubject(newSubject?.id ?? null);
   }
});

const initService = ref<{ name: string; value: string } | null>(null);
const initServiceOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/type-of-attention`).then((response) => {
  initServiceOptions.value = response.data.map((item: any) => ({
    name: item.Type_Of_Attention_Name,
    value: item.Type_Of_Attention_Name,
  }));
});
//si el usuario es estudiante, se le oculta el campo de Patrocinio
const initServiceOptionsStudent = ref([
  { name: "Asesorias", code: "Asesorias" },
  { name: "Posible Patrocinio", code: "Posible Patrocinio" },
]);

const initComplexity = ref<{ name: string; value: string } | null>(null);
const initComplexityOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/complexities`).then((response) => {
  initComplexityOptions.value = response.data.map((item: any) => ({
    name: item.Complexity_Name,
    value: item.Complexity_Name,
  }));
});

const initLawyer = ref<{ name: string; value: string } | null>(null);
const initLawyerOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/internal-user/lawyers/list`).then((response) => {
  initLawyerOptions.value = response.data.map((item: any) => ({
    name: item.Internal_Name + " " + item.Internal_LastName,
    value: item.Internal_Name + " " + item.Internal_LastName,
  }));
});

const initReferral = ref<{ name: string; value: string } | null>(null);
const initReferralOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/derived-by`).then((response) => {
  initReferralOptions.value = response.data.map((item: any) => ({
    name: item.Derived_By_Name,
    value: item.Derived_By_Name,
  }));
});

const initNotes = ref("");
const initAlertNote = ref<string>("");

//-------------------------------------------------------------------------------------------------------------//
//VARIABLES DE LA EVIDENCIA DE ASESORÍA
const evidenceID = ref<number>(0);
const evidenceFileName = ref<string>("");
const evidenceDocumentType = ref<string>("");
const evidenceDate = ref(new Date(date));
const evidenceFile = ref<File | null>(null);

//-------------------------------------------------------------------------------------------------------------//

//VARIABLES DE LAS ACTIVIDADES DEL CASO SI YA ES PATROCINIO
const activityID = ref<number>(0);
const activityName = ref<string>("");
const activityStartDate = ref<Date | null>(null);
const activityStartTime = ref<string>("");
const activityLocation = ref<string>("");
const activityDuration = ref<string>("");
const activityCounterparty = ref<string>("");
const activityJudged = ref<string>("");
const activityJudgeName = ref<string>("");
const activityReferenceFile = ref<string>("");
const activityStatus = ref<string>("");
const activityOnTime = ref<boolean>(false);
const activityDocument = ref<File | null>(null);

//-------------------------------------------------------------------------------------------------------------//

//MANEJO DE USUARIOS EXTERNOS
const areInputsDisabled = ref(true);
const doesUserExist = ref(false);
const doesEvidenceExist = ref(false);
const isSearchInputDisabled = ref(false);
const isSearchButtonDisabled = ref(false);

const isRestartButtonDisabled = ref(true);

const userHasDisability = ref(false);
const userHasAnyIllness = ref(false);
const isInitStatusDisabled = ref(true);
const isInitEndDateDisabled = ref(true);

const isSaveButtonDisabled = ref(false);
const isEditButtonDisabled = ref(false);
const isDeleteButtonDisabled = ref(false);
const isExportButtonDisabled = ref(false);

const doesUserRequestOp = ref<boolean>(false); //Check if user wants to create a new consultation, so the pagination will be disabled
const newConsultationButtonDisabled = ref(true);
const editConsultationButtonDisabled = ref(true);
const isResettingConsultation = ref(false);

const dialogVisible = ref(false);

watch(userHasDisability, (newHasDisability: boolean) => {
  if (!newHasDisability || userDisability.value?.value === "No") {
    userDisabilityPercentage.value = 0;
    userDisability.value = null;
  }
});

const calcUserAge = () => {
  if (userBirthDate.value) {
    const today = new Date();
    const birthDate = new Date(userBirthDate.value);
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      userAge.value = (age - 1).toString();
    } else {
      userAge.value = age.toString();
    }
  }
};

watch(userBirthDate, () => {
  calcUserAge();
});

const consultations = ref<Initial_Consultation[]>([]);
const currentPage = ref<number>(0); // Página actual (0 = primer elemento)
const rowsPerPage = ref<number>(1); // Mostramos 1 consulta por página

const restartUserForm = () => {
  //Estados de el boton de busqueda
  isResettingConsultation.value = true;
  searchIDInput.value = "";
  toastCounter.value = 0; //Reinicio del contador de toast para el mensaje de usuario no registrado
  isSearchButtonDisabled.value = false;
  isSearchInputDisabled.value = false;
  isRestartButtonDisabled.value = true;
  //FORMULARIO DE USUARIO
  //DATOS PERSONALES
  userIDType.value = null;
  userID.value = "";
  userAge.value = "";
  userDisability.value = null;
  userFirstName.value = "";
  userLastName.value = "";
  userGender.value = null;
  userBirthDate.value = null;
  userNationality.value = null;
  userEthnicity.value = null;
  userProvince.value = null;
  userCity.value = null;
  //CONTACTO Y CONTACTO DE REFERENCIA
  userPhone.value = "";
  userEmail.value = "";
  userAddress.value = "";
  userSector.value = null;
  userZone.value = null;
  userReferenceRelationship.value = "";
  userReferenceName.value = "";
  userReferencePhone.value = "";
  //DATOS DEMOGRÁFICOS
  userSocialBenefit.value = false;
  userEconomicDependece.value = false;
  userAcademicInstruction.value = null;
  userProfession.value = null;
  userMaritalStatus.value = null;
  userDependents.value = null;
  userIncomeLevel.value = null;
  userFamilyIncome.value = null;
  userFamilyGroup.value = [];
  userEconomicActivePeople.value = null;
  //DATOS SOCIOECONÓMICOS Y DE SALUD
  userOwnAssets.value = [];
  userHousingType.value = null;
  userPensioner.value = null;
  userHealthInsurance.value = null;
  userVulnerableSituation.value = null;
  userSupportingDocuments.value = null;
  userDisability.value = null;
  userDisabilityPercentage.value = 0;
  userCatastrophicIllness.value = null;
  userHasDisability.value = false;
  userHasAnyIllness.value = false;
  restartDocument();
  restartEvidence();
  // Deshabilitar los campos
  areInputsDisabled.value = true;
  userHasDisability.value = false;
  userHasAnyIllness.value = false;
  doesUserExist.value = false;
  doesConsultationExist.value = false;
  doesEvidenceExist.value = false;
  doesActivityExist.value = false;
  //reiniciamos la paginación
  isInitialLoad.value = true;
  first.value = 0;
  restartConsultationForm();

  // Luego de reiniciar, puede ser prudente esperar un tick para desactivar el flag
  nextTick(() => {
    isResettingConsultation.value = false;
  });
};

const restartConsultationForm = () => {
  initCode.value = "";
  initCaseStatus.value = initCaseStatusOptions.value[0];
  initOffice.value = 'Consultorio Jurídico "PUCE", Sede Quito';
  initDate.value = new Date(date);
  initEndDate.value = null;
  initClientType.value = null;
  initSubject.value = null;
  initTopic.value = null;
  initService.value = null;
  initComplexity.value = null;
  initLawyer.value = null;
  initReferral.value = null;
  initNotes.value = "";
  initAlertNote.value = "";
  initSocialWork.value = false;
  initMandatorySW.value = false;
};

const searchIDButton = () => {
  if (searchIDInput.value.trim() !== "") {
    areInputsDisabled.value = false;
    fetchUser();
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Ingrese un ID válido",
      life: 3000,
    });
  }
};

const fetchUser = async () => {
  try {
    const response = await axios.get(`${API}/user/${searchIDInput.value}`);
    selectedUser.value = response.data;
    doesUserExist.value = true;
    isSearchButtonDisabled.value = true;
    isSearchInputDisabled.value = true;
    isRestartButtonDisabled.value = false;

    if (toastCounter.value === 0) {
      toast.add({
        severity: "success",
        summary: "Usuario encontrado",
        detail:
          "Ahora puedes editar los datos del usuario o crear una nueva ficha de asesoría.",
        life: 3000,
      });
      toastCounter.value += 1;
      await fetchConsultations();
      doesConsultationExist.value = true;
    }

    //Mapear los datos del usuario en el formulario
    //DATOS PERSONALES
    userIDOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_ID_Type) {
        userIDType.value = option;
      }
    });
    userID.value = selectedUser.value.User_ID;
    userFirstName.value = selectedUser.value.User_FirstName;
    userLastName.value = selectedUser.value.User_LastName;
    userGenderOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_Gender) {
        userGender.value = option;
      }
    });
    userBirthDate.value = new Date(selectedUser.value.User_BirthDate);
    countriesList.value.forEach((country) => {
      if (country.name === selectedUser.value.User_Nationality) {
        userNationality.value = country;
      }
    });
    userEthnicityOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_Ethnicity) {
        userEthnicity.value = option;
      }
    });
    // userProvinceOptions.value.forEach((option) => {
    //   if (option.name === selectedUser.value.User_Province) {
    //     userProvince.value = option;
    //   }
    // });
    // userCityOptions.value.forEach((option) => {
    //   if (option.name === selectedUser.value.User_City) {
    //     userCity.value = option;
    //   }
    // });

    const foundProvince = userProvinceOptions.value.find(
      (option) => option.name === selectedUser.value.User_Province
    );
    userProvince.value = foundProvince || null;

    // Fetch cities for the loaded user's province *before* trying to set the city
    if (userProvince.value) {
      await fetchCitiesByProvince(userProvince.value.id); // Wait for cities to load

      // Now find and set the city
      const foundCity = userCityOptions.value.find(
        (option) => option.name === selectedUser.value.User_City
      );
      userCity.value = foundCity || null;
    } else {
       userCityOptions.value = []; // Ensure city options are empty if province wasn't found
       userCity.value = null;
    }


    userCityOptions.value.forEach((option) => {
      if (option.name === selectedUser.value.User_City) {
        userCity.value = option;
      }
    });

    //CONTACTO Y CONTACTO DE REFERENCIA
    userPhone.value = selectedUser.value.User_Phone;
    userEmail.value = selectedUser.value.User_Email;
    userAddress.value = selectedUser.value.User_Address;
    const foundSector = userSectorOptions.value.find(
      (option) => option.name === selectedUser.value.User_Sector
    );
    userSector.value = foundSector || null;

    // userZoneOptions.value.forEach((option) => {
    //   if (option.value === selectedUser.value.User_Zone) {
    //     userZone.value = option;
    //   }
    // });
    userReferenceRelationship.value =
      selectedUser.value.User_ReferenceRelationship;
    userReferenceName.value = selectedUser.value.User_ReferenceName;
    userReferencePhone.value = selectedUser.value.User_ReferencePhone;

    //DATOS DEMOGRÁFICOS
    userSocialBenefit.value = selectedUser.value.User_SocialBenefit;
    userEconomicDependece.value = selectedUser.value.User_EconomicDependence;

    userAcademicInstructionOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_AcademicInstruction) {
        userAcademicInstruction.value = option;
      }
    });
    userProfessionOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_Profession) {
        userProfession.value = option;
      }
    });
    userMaritalStatusOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_MaritalStatus) {
        userMaritalStatus.value = option;
      }
    });
    userDependents.value = selectedUser.value.User_Dependents;
    userIncomeLevelOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_IncomeLevel) {
        userIncomeLevel.value = option;
      }
    });
    userFamilyIncomeOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_FamilyIncome) {
        userFamilyIncome.value = option;
      }
    });

    userFamilyGroup.value = userFamilyGroupOptions.value.filter((option) =>
      selectedUser.value.User_FamilyGroup.includes(option.value)
    );

    userEconomicActivePeople.value =
      selectedUser.value.User_EconomicActivePeople;

    //DATOS SOCIOECONÓMICOS Y DE SALUD
    userOwnAssets.value = userOwnAssetsOptions.value.filter((option) =>
      selectedUser.value.User_OwnAssets.includes(option.value)
    );
    userHousingTypeOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_HousingType) {
        userHousingType.value = option;
      }
    });
    userPensionerOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_Pensioner) {
        userPensioner.value = option;
      }
    });
    userHealthInsuranceOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_HealthInsurance) {
        userHealthInsurance.value = option;
      }
    });
    userVulnerableSituationOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_VulnerableSituation) {
        userVulnerableSituation.value = option;
      }
    });
    userSupportingDocumentsOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_SupportingDocuments) {
        userSupportingDocuments.value = option;
      }
    });
    userDisabilityOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_Disability) {
        userDisability.value = option;
      }
    });
    userDisabilityPercentage.value =
      selectedUser.value.User_DisabilityPercentage;
    userCatastrophicIllnessOptions.value.forEach((option) => {
      if (option.value === selectedUser.value.User_CatastrophicIllness) {
        userCatastrophicIllness.value = option;
      }
    });

    if (
      selectedUser.value.User_DisabilityPercentage > 0 &&
      selectedUser.value.User_Disability !== "Ninguna"
    ) {
      userHasDisability.value = true;
    }
    if (selectedUser.value.User_CatastrophicIllness !== "Ninguna") {
      userHasAnyIllness.value = true;
    }
    userHealthDocuments.value = selectedUser.value.User_HealthDocuments;
    userHealthDocumentsName.value =
      selectedUser.value.User_HealthDocumentsName ?? "";
  } catch (error) {
    doesUserExist.value = false;
    isRestartButtonDisabled.value = false;
    isSearchButtonDisabled.value = true;
    isSearchInputDisabled.value = true;
    searchIDInput.value = "Buscar por Cédula o Pasaporte";
    toast.add({
      severity: "info",
      summary: "Usuario no registrado",
      detail:
        "Porfavor, completa el formulario para registrar al nuevo usuario y la consulta..",
      life: 6000,
    });
  }
};

const updateFormWithConsultation = async (
  data: Initial_Consultation
): Promise<void> => {
  userRequestNewEvidenceDocument.value = false;
  doesActivityExist.value = false;
  restartEvidence(); // Reiniciar la evidencia antes de cargar una nueva consulta
  if (!data) return;
  initCode.value = data.Init_Code;
  initCaseStatus.value =
    initCaseStatusOptions.value.find(
      (option) => option.value === String(data.Init_CaseStatus)
    ) || null;
  initOffice.value = data.Init_Office;
  initDate.value = new Date(data.Init_Date);
  if (data.Init_EndDate) {
    initEndDate.value = new Date(data.Init_EndDate);
  }
  initClientType.value =
    initClientTypeOptions.value.find(
      (option) => option.value === data.Init_ClientType
    ) || null;
  // Find the subject object including the ID
  const foundSubject = initSubjectOptions.value.find(
    (option) => option.name === data.Init_Subject
  );
  initSubject.value = foundSubject || null;

  // Fetch topics for the loaded consultation's subject *before* trying to set the topic
  if (initSubject.value) {
    await fetchTopicsBySubject(initSubject.value.id); // Wait for topics to load

    // Now find and set the topic
    const foundTopic = initTopicOptions.value.find(
      (option) => option.name === data.Init_Topic
    );
    initTopic.value = foundTopic || null;
  } else {
     initTopicOptions.value = []; // Ensure topic options are empty if subject wasn't found
     initTopic.value = null;
  }






  initService.value =
    initServiceOptions.value.find(
      (option) => option.value === data.Init_Service
    ) || null;

  initComplexity.value =
    initComplexityOptions.value.find(
      (option) => option.value === data.Init_Complexity
    ) || null;

  initLawyer.value =
    initLawyerOptions.value.find(
      (option) => option.value === data.Init_Lawyer
    ) || null;
  initNotes.value = data.Init_Notes;

  initReferral.value =
    initReferralOptions.value.find(
      (option) => option.value === data.Init_Referral
    ) || null;
  initSocialWork.value = data.Init_SocialWork;
  initMandatorySW.value = data.Init_MandatorySW;
  initAlertNote.value = data.Init_AlertNote;
  if (initAlertNote.value === null) {
    doesConsultationHasAlert.value = false;
  } else {
    doesConsultationHasAlert.value = true;
  }
  await fetchEvidence(initCode.value); // Cargar la evidencia de la consulta
  await fetchActivities(initCode.value); // Cargar las actividades de la consulta
};

const isInitialLoad = ref(true);

const fetchConsultations = async (): Promise<void> => {
  try {
    const response = await axios.get(
      `${API}/initial-consultations/user/${searchIDInput.value}`
    );
    consultations.value = response.data as Initial_Consultation[];

    if (isInitialLoad.value) {
      // En la primera carga, forzamos que se muestre la primera ficha
      if (consultations.value.length > 0) {
        first.value = 0;
        updateFormWithConsultation(consultations.value[0]);
      }
      isInitialLoad.value = false;
    } else {
      // En cargas posteriores, si el índice actual está fuera de rango, lo ajustamos
      if (consultations.value.length === 0) {
        first.value = 0;
      } else if (first.value >= consultations.value.length) {
        first.value = consultations.value.length - 1;
      }
      // Si el usuario ya se movió a otra página, no forzamos la actualización
    }
  } catch (error: any) {
    toast.add({
      severity: "info",
      summary: "Ficha de asesoría no encontrada",
      detail:
        "Ha ocurrido un error al cargar las fichas de asesoría. Por favor, inténtalo de nuevo.",
      life: 6000,
    });
  }
};

const fetchEvidence = async (initCode: string): Promise<void> => {
  isEvidenceLoading.value = true;
  try {
    // Si no hay consultas, no hay evidencia
    if (consultations.value.length === 0) {
      evidenceFileName.value = "";
      return;
    }
    const response = await axios.get(
      `${API}/evidence/consultation/${initCode}`
    );
    // Asegúrate de que la respuesta contenga al menos un objeto
    if (response.data) {
      selectedEvidence.value = response.data; // Accede al primer elemento del arreglo
      evidenceID.value = selectedEvidence.value.Evidence_ID;
      evidenceDocumentType.value =
        selectedEvidence.value.Evidence_Document_Type;
      evidenceDate.value = new Date(selectedEvidence.value.Evidence_Date);
      evidenceFile.value = selectedEvidence.value.Evidence_File;
      evidenceFileName.value = selectedEvidence.value.Evidence_Name;
      doesEvidenceExist.value = true; // Si hay evidencia, actualiza el estado
    } else {
      evidenceFileName.value = "";
      console.warn("No se encontró evidencia");
      doesEvidenceExist.value = false; // Si no hay evidencia, actualiza el estado
    }
  } catch (error: any) {
    // Manejo de error (opcional)
  } finally {
    isEvidenceLoading.value = false;
  }
};

const first = ref(0); // Página actual

watch(first, (newFirst) => {
  if (isResettingConsultation.value) return; // Si se está reiniciando, no hacer nada
  if (consultations.value[newFirst]) {
    updateFormWithConsultation(consultations.value[newFirst]);
  } else {
    restartConsultationForm();
    restartEvidence();
  }
});

const doesConsultationExist = ref<boolean>(false);
const doesUserRequestEditConsultation = ref<boolean>(false); // Check if user wants to create a new consultation, so the pagination will be disabled

const doesActivityExist = ref<boolean>(false);

const selectedActivityDetails = ref<Activity | null>(null); // Detalles de la actividad seleccionada
const activityDialogVisible = ref(false); // Controla la visibilidad del diálogo

// Método para mostrar los detalles de una actividad en el diálogo
function showActivityDetails(activity: Activity) {
  selectedActivityDetails.value = activity;
  activityDialogVisible.value = true;
}

// Actualización del método fetchActivities
const fetchActivities = async (initCode: string): Promise<void> => {
  try {
    // Si no hay consultas, no hay actividades
    if (consultations.value.length === 0) {
      doesActivityExist.value = false;
      return;
    }

    const response = await axios.get(`${API}/activity/case/${initCode}`);
    if (response.data.length > 0) {
      selectedActivity.value = response.data; // Asigna todas las actividades
      doesActivityExist.value = true;
    } else {
      doesActivityExist.value = false;
    }
  } catch (error) {
    console.error("Error al cargar actividades:", error);
    doesActivityExist.value = false;
  }
};

//CONSULTATION OPERATIONS
//NEW CONSULTATION

const createInitialConsultation = async () => {
  // Validar que existan campos obligatorios, por ejemplo, User_ID
  if (!userID.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Faltan datos obligatorios para crear la consulta inicial.",
      life: 4000,
    });
    return;
  }

  // Construir un FormData para incluir datos y archivos
  const formData = new FormData();

  // Datos del usuario (User)
  formData.append("User_ID", userID.value);
  formData.append("User_ID_Type", userIDType.value?.value || "");
  formData.append("User_Age", userAge.value || "");
  formData.append("User_FirstName", userFirstName.value || "");
  formData.append("User_LastName", userLastName.value || "");
  formData.append("User_Gender", userGender.value?.value || "");
  formData.append(
    "User_BirthDate",
    userBirthDate.value ? userBirthDate.value.toISOString().split("T")[0] : ""
  );
  formData.append("User_Nationality", userNationality.value?.name || "");
  formData.append("User_Ethnicity", userEthnicity.value?.value || "");
  formData.append("User_Province", userProvince.value?.value || "");
  formData.append("User_City", userCity.value?.value || "");
  formData.append("User_Phone", userPhone.value.replace(/\D/g, "") || "");
  formData.append("User_Email", userEmail.value || "");
  formData.append("User_Address", userAddress.value || "");
  formData.append("User_Sector", userSector.value?.value || "");
  formData.append("User_Zone", userZone.value?.value || "");
  formData.append(
    "User_ReferenceRelationship",
    userReferenceRelationship.value || ""
  );
  formData.append("User_ReferenceName", userReferenceName.value || "");
  formData.append(
    "User_ReferencePhone",
    userReferencePhone.value.replace(/\D/g, "") || ""
  );

  // Datos demográficos
  formData.append("User_SocialBenefit", userSocialBenefit.value.toString());
  formData.append(
    "User_EconomicDependence",
    userEconomicDependece.value.toString()
  );
  formData.append(
    "User_AcademicInstruction",
    userAcademicInstruction.value?.value || ""
  );
  formData.append("User_Profession", userProfession.value?.value || "");
  formData.append("User_MaritalStatus", userMaritalStatus.value?.value || "");
  formData.append(
    "User_Dependents",
    userDependents.value !== null ? userDependents.value.toString() : "0"
  );
  formData.append("User_IncomeLevel", userIncomeLevel.value?.value || "");
  formData.append("User_FamilyIncome", userFamilyIncome.value?.value || "");

  // Se envían los grupos familiares como un string JSON
  formData.append(
    "User_FamilyGroup",
    JSON.stringify(userFamilyGroup.value.map((g) => g.value))
  );
  formData.append(
    "User_EconomicActivePeople",
    userEconomicActivePeople.value !== null
      ? userEconomicActivePeople.value.toString()
      : "0"
  );

  // Datos socioeconómicos y de salud
  formData.append(
    "User_OwnAssets",
    JSON.stringify(userOwnAssets.value.map((a) => a.value))
  );
  formData.append("User_HousingType", userHousingType.value?.value || "");
  formData.append("User_Pensioner", userPensioner.value?.value || "");
  formData.append(
    "User_HealthInsurance",
    userHealthInsurance.value?.value || ""
  );
  formData.append(
    "User_VulnerableSituation",
    userVulnerableSituation.value?.value || ""
  );
  formData.append(
    "User_SupportingDocuments",
    userSupportingDocuments.value?.value || ""
  );
  formData.append("User_Disability", userDisability.value?.value || "Ninguna");
  formData.append(
    "User_DisabilityPercentage",
    userDisabilityPercentage.value.toString()
  );
  formData.append(
    "User_CatastrophicIllness",
    userCatastrophicIllness.value?.value || "Ninguna"
  );

  // Agregar el archivo de documento de salud
  if (userHealthDocuments.value) {
    formData.append("healthDocuments", userHealthDocuments.value); // Archivo
    formData.append(
      "User_HealthDocumentsName",
      userHealthDocumentsName.value || ""
    );
  } else {
    formData.append("healthDocuments", ""); // Si no hay archivo, enviar un string vacío
    formData.append(
      "User_HealthDocumentsName",
      userHealthDocumentsName.value || ""
    );
  }

  // Datos de la consulta inicial (Initial_Consultations)
  formData.append("Internal_ID", internalID || "");
  formData.append("Init_SocialWork", initSocialWork.value.toString());
  formData.append("Init_MandatorySW", initMandatorySW.value.toString());
  formData.append("Init_Status", "Activo"); // Estado inicial
  formData.append("Init_CaseStatus", initCaseStatus.value?.value || "");
  formData.append("Init_Office", initOffice.value);
  formData.append(
    "Init_Date",
    initDate.value ? initDate.value.toISOString().split("T")[0] : ""
  );
  formData.append(
    "Init_FinishDate",
    initEndDate.value ? initEndDate.value.toISOString().split("T")[0] : ""
  );
  formData.append("Init_ClientType", initClientType.value?.value || "");
  formData.append("Init_Subject", initSubject.value?.value || "");
  formData.append("Init_Topic", initTopic.value?.value || "");
  formData.append("Init_Service", initService.value?.value || "");
  formData.append("Init_Complexity", initComplexity.value?.value || "");
  formData.append("Init_Lawyer", initLawyer.value?.value || "");
  formData.append("Init_Referral", initReferral.value?.value || "");
  formData.append("Init_Notes", initNotes.value || "");
  if(initMandatorySW.value !== true){
    formData.append("Init_Type", "Por Revisar");
  }else{
    formData.append("Init_Type", "En espera");
  }

  //Datos de la evidencia de asesoría (Evidence)
  formData.append(
    "Evidence_Date",
    evidenceDate.value ? evidenceDate.value.toISOString().split("T")[0] : ""
  );
  formData.append("Evidence_Document_Type", evidenceDocumentType.value || "");
  if (evidenceFile.value) {
    formData.append("evidenceFile", evidenceFile.value); // Archivo
    formData.append("Evidence_Name", evidenceFileName.value || "");
  } else {
    formData.append("evidenceFile", ""); // Si no hay archivo, enviar un string vacío
  }

  console.log("Datos enviados:", formData);
  //revisamos el json del formData
  for (const pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }
  //creamos un json para verificar que se envían los datos correctos
  const jsonData = Object.fromEntries(formData.entries());
  console.log("JSON de datos enviados:", JSON.stringify(jsonData, null, 2));

  try {
    await axios.post(`${API}/initial-consultations`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "internal-id": authStore.user?.id,
      },
    });

    toast.add({
      severity: "info",
      summary: "Consulta Inicial Creada",
      detail: "La consulta inicial ha sido creada con éxito.",
      life: 4000,
    });
    restartUserForm();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo crear la consulta inicial",
      life: 4000,
    });
  }
};

const requestNewConsultation = async () => {
  doesUserRequestOp.value = true;
  doesUserRequestNewConsultation.value = true;
  userRequestNewEvidenceDocument.value = false;
  restartConsultationForm();
  restartEvidence();
  newConsultationButtonDisabled.value = false;
  isSaveButtonDisabled.value = true;
  isEditButtonDisabled.value = true;
  isDeleteButtonDisabled.value = true;
  isExportButtonDisabled.value = true;
};

const cancelNewConsultation = async () => {
  newConsultationButtonDisabled.value = true;
  doesUserRequestOp.value = false;
  isSaveButtonDisabled.value = false;
  isEditButtonDisabled.value = false;
  isDeleteButtonDisabled.value = false;
  isExportButtonDisabled.value = false;
  restartConsultationForm();

  await fetchConsultations();
  // Forzamos el paginador a la primera ficha
  first.value = 0;
  if (consultations.value.length > 0) {
    updateFormWithConsultation(consultations.value[0]);
  }
};

const newUserConsultation = async () => {
  // ✅ Agregar async aquí
  if (!userID.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Faltan datos obligatorios para crear la consulta inicial.",
      life: 4000,
    });
    return;
  }

  const consultationData = {
    //Init_Code: No se envia nada porque el backend lo genera automáticamente
    //Internal_ID: internalI tampoco se envia porque en el header ya estamos enviando el internalID
    Init_ClientType: initClientType.value?.value,
    Init_Subject: initSubject.value?.value,
    Init_Lawyer: initLawyer.value?.value,
    Init_Date: initDate.value ? initDate.value.toISOString().split("T")[0] : "",
    Init_Office: initOffice.value,
    Init_Topic: initTopic.value?.value,
    Init_Service: initService.value?.value,
    Init_Referral: initReferral.value?.value,
    Init_Status: "Activo",
    Init_CaseStatus: initCaseStatus.value?.value,
    Init_Notes: initNotes.value || "",
    Init_Complexity: initComplexity.value?.value || "",
    Init_SocialWork: initSocialWork.value,
    Init_MandatorySW: initMandatorySW.value,
    Init_Type: "",
    User_ID: userID.value,
  };
  if(initMandatorySW.value !== true){
    consultationData.Init_Type = "Por Revisar";
  }else{
    consultationData.Init_Type = "En espera";
  }

  console.log("Datos enviados:", JSON.stringify(consultationData, null, 2));

  try {
    await axios.post(`${API}/initial-consultations/new`, consultationData, {
      headers: {
        "internal-id": internalID || authStore.user?.id,
      },
    });

    toast.add({
      severity: "info",
      summary: "Ficha Creada",
      detail: "La nueva ficha ha sido creada con éxito.",
      life: 4000,
    });

    //Luego de que se crea la ficha, procedemos a obtener la ultima ficha creada
    const response = await axios.get(
      `${API}/initial-consultations/user/${userID.value}`
    );
    const lastConsultation = response.data[response.data.length - 1];
    initCode.value = lastConsultation.Init_Code; // Guardamos el código de la última consulta creada

    // Procedemos a crear la evidencia si es que existe y lo enviamos como formData
    const formData = new FormData();

    // Agregar datos de la consulta inicial
    formData.append("Internal_ID", internalID || "");
    formData.append("Init_Code", initCode.value || "");
    formData.append("Evidence_Name", evidenceFileName.value || "");

    // Agregar archivo de evidencia
    if (evidenceFile.value) {
      console.log("Archivo de evidencia:", evidenceFile.value);
      formData.append("evidenceFile", evidenceFile.value); // Archivo
    } else {
      console.log("No se adjuntó ningún archivo de evidencia.");
    }

    try {
      const response = await axios.post(`${API}/evidence`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Importante para enviar archivos
        },
      });

      console.log("Respuesta del servidor:", response.data);
    } catch (error) {
      console.error("Error al subir la evidencia:", error);
      if (evidenceFile.value) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo subir la evidencia.",
          life: 4000,
        });
      }
    }

    // Reiniciar los estados y el formulario
    doesUserRequestNewConsultation.value = false;
    newConsultationButtonDisabled.value = true;
    doesUserRequestOp.value = false;
    isSaveButtonDisabled.value = false;
    isEditButtonDisabled.value = false;
    isDeleteButtonDisabled.value = false;
    isExportButtonDisabled.value = false;
    restartEvidence();
    restartConsultationForm();
    await fetchConsultations();
    first.value = consultations.value.length - 1; //Para que muestre la última consulta creada
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo crear la ficha, por favor inténtalo de nuevo.",
      life: 4000,
    });
  }
};

//EDIT CONSULTATION
const requestEditConsultation = async () => {
  doesUserRequestOp.value = true;
  doesUserRequestEditConsultation.value = true;
  editConsultationButtonDisabled.value = false;
  isInitStatusDisabled.value = false;
  isInitEndDateDisabled.value = false;
  newConsultationButtonDisabled.value = true;
  isSaveButtonDisabled.value = true;
  isEditButtonDisabled.value = true;
  isDeleteButtonDisabled.value = true;
  isExportButtonDisabled.value = true;
};

const cancelEditConsultation = async () => {
  // Conservamos el índice actual de la ficha que se estaba editando
  const currentPage = first.value;
  editConsultationButtonDisabled.value = true;
  doesUserRequestOp.value = false;
  isSaveButtonDisabled.value = false;
  isEditButtonDisabled.value = false;
  isDeleteButtonDisabled.value = false;
  isExportButtonDisabled.value = false;
  doesUserRequestEditConsultation.value = false;
  isInitStatusDisabled.value = true;
  isInitEndDateDisabled.value = true;
  restartConsultationForm();

  await fetchConsultations();
  // Verificamos que currentPage siga siendo válido,
  // de lo contrario lo ajustamos al último índice disponible
  first.value =
    currentPage < consultations.value.length
      ? currentPage
      : consultations.value.length - 1;
  if (consultations.value[first.value]) {
    updateFormWithConsultation(consultations.value[first.value]);
  }
};

const editUserConsultation = async () => {
  if (!initCode.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Faltan datos obligatorios para editar la ficha.",
      life: 4000,
    });
    return;
  }

  // El índice actual antes de editar
  const currentPageBeforeEdit = first.value;

  const consultationData = {
    Init_Code: initCode.value,
    Internal_ID: internalID,
    Init_ClientType: initClientType.value?.value,
    Init_Subject: initSubject.value?.value,
    Init_Lawyer: initLawyer.value?.value,
    Init_Date: initDate.value ? initDate.value.toISOString().split("T")[0] : "",
    Init_EndDate: initEndDate.value
      ? initEndDate.value.toISOString().split("T")[0]
      : null,
    Init_Office: initOffice.value,
    Init_Topic: initTopic.value?.value,
    Init_Service: initService.value?.value,
    Init_Referral: initReferral.value?.value,
    Init_CaseStatus: initCaseStatus.value?.value,
    Init_Notes: initNotes.value || "",
    Init_Complexity: initComplexity.value?.value || "",
    Init_Type: "",
    Init_SocialWork: initSocialWork.value,
    Init_MandatorySW: initMandatorySW.value,
    User_ID: userID.value,
  };
  if (initService.value?.value === "Patrocinio") {
    consultationData.Init_Type = "Por Asignar";
  }   else if (initMandatorySW.value === true) {
    consultationData.Init_Type = "En espera";
  } else {
    consultationData.Init_Type = "Por Revisar";
  }

  if(initSocialWork.value === false){
    consultationData.Init_SocialWork = false;
    consultationData.Init_MandatorySW = false;
  }

  
  console.log("Datos enviados:", JSON.stringify(consultationData, null, 2));

  try {
    await axios.put(
      `${API}/initial-consultations/${initCode.value}`,
      consultationData,
      {
        headers: {
          "internal-id": authStore.user?.id,
        },
      }
    );

    toast.add({
      severity: "info",
      summary: "Ficha Actualizada",
      detail: "La ficha ha sido actualizada con éxito.",
      life: 4000,
    });
    editConsultationButtonDisabled.value = true;
    isInitStatusDisabled.value = true;
    isInitEndDateDisabled.value = true;
    doesUserRequestOp.value = false;
    isSaveButtonDisabled.value = false;
    isEditButtonDisabled.value = false;
    isDeleteButtonDisabled.value = false;
    isExportButtonDisabled.value = false;
    doesUserRequestEditConsultation.value = false;
    restartEvidence();
    restartConsultationForm();
    await fetchConsultations();
    const index = consultations.value.findIndex(
      (consulta) => consulta.Init_Code === initCode.value
    );
    if (index !== -1) {
      first.value = index;
      // Forzamos la actualización manual del formulario
      updateFormWithConsultation(consultations.value[index]);
    } else {
      first.value =
        currentPageBeforeEdit < consultations.value.length
          ? currentPageBeforeEdit
          : consultations.value.length - 1;
      updateFormWithConsultation(consultations.value[first.value]);
    }
  } catch (error: any) {
    if ((error as any).response?.status === 404) {
      toast.add({
        severity: "warn",
        summary: "Advertencia",
        detail:
          "Por favor, revisa que has hecho cambios antes de actualizar la ficha.",
        life: 4000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo editar la consulta inicial",
        life: 4000,
      });
    }
  }
};

const checkDisabilityInputs = () => {
  if (userHasDisability.value === true && userDisability.value === null) {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "Por favor, seleccione un tipo de discapacidad.",
      life: 4000,
    });
    return false; // Indica que la validación falló
  } else if (
    userHasDisability.value === true &&
    userDisabilityPercentage.value === 0
  ) {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "Por favor, ingrese un porcentaje de discapacidad.",
      life: 4000,
    });
    return false; // Indica que la validación falló
  }
  return true; // Indica que pasó la validación
};

const checkIllnessInputs = () => {
  if (
    userHasAnyIllness.value === true &&
    userCatastrophicIllness.value === null
  ) {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "Por favor, seleccione un tipo de enfermedad catastrófica.",
      life: 4000,
    });
    return false; // Indica que la validación falló
  }
  return true; // Indica que pasó la validación
};

const editUser = async () => {
  if (!selectedUser.value || !selectedUser.value.User_ID) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No hay usuario seleccionado para actualizar.",
      life: 4000,
    });
    return;
  }

  // Crear un objeto con los datos originales del usuario
  const originalUser = selectedUser.value;

  // Crear objeto actualizado mezclando datos originales y cambios del formulario
  const updatedUser = {
    //DATOS PERSONALES
    User_ID_Type: userIDType.value?.value || originalUser.User_ID_Type,
    User_ID: userID.value || originalUser.User_ID,
    User_Age: userAge.value || originalUser.User_Age,
    User_FirstName: userFirstName.value || originalUser.User_FirstName,
    User_LastName: userLastName.value || originalUser.User_LastName,
    User_Gender: userGender.value?.value || originalUser.User_Gender,
    User_BirthDate: userBirthDate.value
      ? userBirthDate.value.toISOString().split("T")[0]
      : originalUser.User_BirthDate,
    User_Nationality:
      userNationality.value?.name || originalUser.User_Nationality,
    User_Ethnicity: userEthnicity.value?.value || originalUser.User_Ethnicity,
    User_Province: userProvince.value?.value || originalUser.User_Province,
    User_City: userCity.value?.value || originalUser.User_City,

    //DATOS DE CONTACTO Y CONTACTO DE REFERENCIA
    User_Phone: userPhone.value.replace(/\D/g, "") || originalUser.User_Phone,
    User_Email: userEmail.value || originalUser.User_Email,
    User_Address: userAddress.value || originalUser.User_Address,
    User_Sector: userSector.value?.value || originalUser.User_Sector,
    User_Zone: userZone.value?.value || originalUser.User_Zone,
    User_ReferenceRelationship:
      userReferenceRelationship.value ||
      originalUser.User_ReferenceRelationship,
    User_ReferenceName:
      userReferenceName.value || originalUser.User_ReferenceName,
    User_ReferencePhone:
      userReferencePhone.value.replace(/\D/g, "") ||
      originalUser.User_ReferencePhone,

    //DATOS DEMOGRÁFICOS
    User_SocialBenefit:
      userSocialBenefit.value !== undefined
        ? userSocialBenefit.value
        : originalUser.User_SocialBenefit,
    User_EconomicDependece:
      userEconomicDependece.value !== undefined
        ? userEconomicDependece.value
        : originalUser.User_EconomicDependence,
    User_AcademicInstruction:
      userAcademicInstruction.value?.value ||
      originalUser.User_AcademicInstruction,
    User_Profession:
      userProfession.value?.value || originalUser.User_Profession,
    User_MaritalStatus:
      userMaritalStatus.value?.value || originalUser.User_MaritalStatus,
    User_Dependents:
      userDependents.value !== null
        ? userDependents.value
        : originalUser.User_Dependents,
    User_IncomeLevel:
      userIncomeLevel.value?.value || originalUser.User_IncomeLevel,
    User_FamilyIncome:
      userFamilyIncome.value?.value || originalUser.User_FamilyIncome,
    User_FamilyGroup: userFamilyGroup.value.map((option) => option.value),
    User_EconomicActivePeople:
      userEconomicActivePeople.value !== null
        ? userEconomicActivePeople.value
        : originalUser.User_EconomicActivePeople,

    //DATOS SOCIOECONÓMICOS Y DE SALUD
    User_OwnAssets: userOwnAssets.value.map((option) => option.value),
    User_HousingType:
      userHousingType.value?.value || originalUser.User_HousingType,
    User_Pensioner: userPensioner.value?.value || originalUser.User_Pensioner,
    User_HealthInsurance:
      userHealthInsurance.value?.value || originalUser.User_HealthInsurance,
    User_VulnerableSituation:
      userVulnerableSituation.value?.value ||
      originalUser.User_VulnerableSituation,
    User_SupportingDocuments:
      userSupportingDocuments.value?.value ||
      originalUser.User_SupportingDocuments,
    User_Disability:
      userDisability.value?.value || originalUser.User_Disability,
    User_DisabilityPercentage:
      userDisabilityPercentage.value || originalUser.User_DisabilityPercentage,
    User_CatastrophicIllness:
      userCatastrophicIllness.value?.value ||
      originalUser.User_CatastrophicIllness,
  };
  //Si se modifica el check a desactivado en discapacidad y enfermedad, se limpian los campos de discapacidad y enfermedad
  // Validación antes de continuar con la edición
  if (userHasDisability.value === false) {
    updatedUser.User_Disability = "Ninguna";
    updatedUser.User_DisabilityPercentage = 0;
  } else if (!checkDisabilityInputs()) {
    return; // Detiene la ejecución si la validación falla
  }

  if (userHasAnyIllness.value === false) {
    updatedUser.User_CatastrophicIllness = "Ninguna";
  } else if (!checkIllnessInputs()) {
    return; // Detiene la ejecución si la validación falla
  }

  console.log("Datos enviados:", JSON.stringify(updatedUser, null, 2));

  try {
    await axios.put(`${API}/user/${selectedUser.value.User_ID}`, updatedUser, {
      headers: {
        "internal-id": authStore.user?.id,
      },
    });

    toast.add({
      severity: "info",
      summary: "Usuario Actualizado",
      detail: "El usuario ha sido actualizado con éxito.",
      life: 4000,
    });

    await fetchUser(); // Recargar datos después de la actualización
  } catch (error) {
    if ((error as any).response?.status === 404) {
      toast.add({
        severity: "warn",
        summary: "Advertencia",
        detail:
          "Por favor, revisa que has hecho cambios antes de actualizar al usuario.",
        life: 4000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar el usuario",
        life: 4000,
      });
    }
  }
};

//gaurdamos el documento en la variable User_HealthDocuments

//-------------------------------------------------------------------------------------------------------------//
//METODOS DE VALIDACION DE CÉDULA

const validateID = (ID: string): boolean => {
  if (!/^\d{10}$/.test(ID)) return false; // Solo permite 10 dígitos numéricos

  const digits = ID.split("").map(Number);
  const province = parseInt(ID.substring(0, 2), 10);
  if (province < 1 || province > 24) return false; // Verificar que la province sea válida

  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let valor = digits[i] * (i % 2 === 0 ? 2 : 1);
    if (valor > 9) valor -= 9;
    suma += valor;
  }

  const digitoVerificador = (10 - (suma % 10)) % 10;
  return digitoVerificador === digits[9];
};

const checkExternalUserExists = async (): Promise<boolean> => {
  try {
    const response = await axios.get<User>(`${API}/user/${userID.value}`);
    if (response.data) {
      userID.value = "";
      return true;
    }
  } catch (error: any) {
    if (error.response && error.response.status !== 404) {
      toast.add({
        severity: "error",
        summary: "Error del servidor",
        detail:
          "Ha ocurrido un error en el servidor. Por favor intenta más tarde.",
        life: 3000,
      });
    }
  }

  return false;
};

watch(
  () => userID.value,
  (nuevoValor) => {
    if (
      userIDType.value?.value === "cedula" &&
      nuevoValor.length === 10 &&
      !doesUserExist.value
    ) {
      if (validateID(nuevoValor)) {
        checkExternalUserExists().then((existe) => {
          if (existe) {
            toast.add({
              severity: "warn",
              summary: "Usuario ya existe",
              detail: "Ya existe un usuario con la cédula ingresada.",
              life: 3000,
            });
          } else {
            toast.add({
              severity: "success",
              summary: "Cédula válida",
              detail: "La cédula ingresada es correcta.",
              life: 3000,
            });
          }
        });
      } else {
        toast.add({
          severity: "error",
          summary: "Cédula no válida",
          detail: "La cédula ingresada no es válida.",
          life: 3000,
        });
        userID.value = "";
      }
    }
  }
);

const checkIdSize = (shouldShowToast: boolean = true): boolean => {
  if (userIDType.value?.value === "cedula" && userID.value.length !== 10) {
    bandera.value = false;
    toast.add({
      severity: "warn",
      summary: "Cédula incorrecta",
      detail: "La cédula debe tener exactamente 10 caracteres.",
      life: 8000,
    });
    userID.value = "";
  } else {
    bandera.value = true;
  }
  return bandera.value;
};

const incrementInterval = ref<number | null>(null);
const decrementInterval = ref<number | null>(null);

function startIncrement() {
  if (incrementInterval.value) clearInterval(incrementInterval.value);
  incrementInterval.value = window.setInterval(() => {
    if (userDisabilityPercentage.value < 100) {
      userDisabilityPercentage.value++;
    } else {
      stopIncrement();
    }
  }, 50); // Ajusta la velocidad (ms) según lo necesario
}

function stopIncrement() {
  if (incrementInterval.value) {
    clearInterval(incrementInterval.value);
    incrementInterval.value = null;
  }
}

function startDecrement() {
  if (decrementInterval.value) clearInterval(decrementInterval.value);
  decrementInterval.value = window.setInterval(() => {
    if (userDisabilityPercentage.value > 0) {
      userDisabilityPercentage.value--;
    } else {
      stopDecrement();
    }
  }, 50);
}

function stopDecrement() {
  if (decrementInterval.value) {
    clearInterval(decrementInterval.value);
    decrementInterval.value = null;
  }
}

const isRejectLoading = ref(false);

const rejectCase = async () => {
  //Primero hacemos un check para ver si el usuario esta seguro de rechazar la consulta
  confirm.require({
    message:
      "¿Estás seguro de enviar un correo rechazando el patrocinio del caso?",
    header: "Advertencia",
    icon: "pi pi-info-circle",
    rejectLabel: "Cancelar",
    rejectProps: { label: "Cancel", severity: "contrast", icon: "pi pi-times" },
    acceptProps: {
      label: "Aceptar",
      severity: "info",
      icon: "pi pi-check-circle",
    },
    accept: async () => {
      isRejectLoading.value = true; // Inicia la carga
      try {
        const response = await axios.post(
          `${API}/initial-consultations/reject`,
          { id: initCode.value },
          { headers: { "internal-id": authStore.user?.id } }
        );
        console.log(response);
        watchAlertDialog.value = false; // Cerrar el diálogo
        await fetchConsultations(); // Actualizar la lista de consultas
        toast.add({
          severity: "info",
          summary: "Correo electrónico enviado",
          detail:
            "Se ha informado al usuario sobre el rechazo de su consulta inicial.",
          life: 4000,
        });
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo rechazar la consulta inicial.",
          life: 4000,
        });
      } finally {
        isRejectLoading.value = false;
      }
    },
    reject: () => {
      isRejectLoading.value = false; // Detiene la carga si se cancela
    },
  });
};

// Estado para la pestaña activa
const activeTab = ref("0");

// Computed para verificar si la pestaña activa es "Asesorias"
const isAsesoriasTab = computed(() => activeTab.value === "0");

// Crea un contenedor reactivo para cachear los nombres
const internalUserNames = ref(new Map<string, string>());

// Ahora, modifica getInternalUserName para que devuelva inmediato un valor
// y lance la consulta si aún no se tiene el nombre
function getInternalUserName(internalId: string): string {
  if (internalUserNames.value.has(internalId)) {
    return internalUserNames.value.get(internalId)!;
  } else {
    // Lanza la consulta (no se espera, se hace en background)
    axios
      .get(`${API}/internal-user/${internalId}`)
      .then(({ data }) => {
        if (data) {
          internalUserNames.value.set(
            internalId,
            data.Internal_Name + " " + data.Internal_LastName
          );
        } else {
          internalUserNames.value.set(internalId, internalId);
        }
      })
      .catch((error) => {
        console.error("Error al cargar el nombre del usuario interno:", error);
        internalUserNames.value.set(internalId, internalId);
      });
    // Mientras tanto se muestra "Cargando..."
    return "Cargando...";
  }
}
</script>

<template>
  <!--MENU-->
  <Toast />
  <ConfirmDialog></ConfirmDialog>
  <div class="card mr-4">
    <div class="flex items-center gap-2">
      <InputText
        placeholder="Buscar por Cédula o Pasaporte"
        type="text"
        class="w-full sm:w-64"
        :maxlength="15"
        v-model="searchIDInput"
        @keyup.enter="searchIDButton"
        :disabled="isSearchInputDisabled"
      />
      <Button
        icon="pi pi-search"
        @click="searchIDButton"
        :disabled="isSearchButtonDisabled"
        class="p-button-rounded"
      />

      <div class="flex items-center gap-2">
        <Button
          severity="contrast"
          @click="restartUserForm"
          icon="pi pi-refresh"
          label="Reiniciar"
          class="ml-171"
          :disabled="isRestartButtonDisabled"
        />
        <Button
          severity="info"
          @click="editUser"
          icon="pi pi-user-edit"
          label="Editar"
          class="ml-2"
          :disabled="!doesUserExist"
        />
      </div>
    </div>
  </div>

  <!--FORMULARIO-->
  <div class="card p-6 mr-4">
    <!-- Datos Personales -->
    <div class="grid grid-cols-2 gap-4 pb-4">
      <div class="mb-8">
        <h3 class="text-2xl font-semibold mb-8">Datos Personales</h3>
        <div class="input-spacing grid grid-cols-2 gap-4 mt-4">
          <!-- Grupo de Identificación -->
          <div class="w-full max-w-md mx-auto">
            <div class="flex flex-col sm:flex-row gap-4">
              <!-- Select para Tipo ID -->
              <div class="w-full sm:w-1/3">
                <FloatLabel variant="on" class="w-full">
                  <Select
                    v-model="userIDType"
                    inputId="tipoID"
                    :options="userIDOptions"
                    size="large"
                    optionLabel="name"
                    class="w-full"
                    :disabled="areInputsDisabled || doesUserExist"
                    @change="userID = ''"
                  />
                  <label for="tipoID">Tipo ID</label>
                </FloatLabel>
              </div>
              <!-- Input para Número de ID -->
              <div class="w-full sm:w-2/3">
                <FloatLabel variant="on" class="w-full">
                  <InputText
                    id="userID"
                    v-model="userID"
                    :maxlength="userIDType?.value === 'cedula' ? 10 : 15"
                    size="large"
                    class="w-full"
                    :disabled="
                      areInputsDisabled || !userIDType || doesUserExist
                    "
                    @blur="() => checkIdSize()"
                    autocomplete="off"
                  />
                  <label for="userID">Número de ID</label>
                </FloatLabel>
              </div>
            </div>
          </div>

          <!-- Checkbox de Discapacidad -->
          <div class="flex items-center">
            <!-- Input para Edad -->
            <div class="w-full sm:w-21/100">
              <FloatLabel variant="on" class="w-full">
                <InputText
                  id="userAge"
                  v-model="userAge"
                  size="large"
                  class="w-full"
                  :disabled="true"
                />
                <label for="userAge">Edad</label>
              </FloatLabel>
            </div>
          </div>
          <!-- Nombres -->
          <FloatLabel variant="on" class="w-full">
            <InputText
              id="userFirstName"
              v-model="userFirstName"
              size="large"
              class="w-full"
              :disabled="areInputsDisabled"
            />
            <label for="userFirstName">Nombres</label>
          </FloatLabel>
          <!-- Apellidos -->
          <FloatLabel variant="on" class="w-full">
            <InputText
              id="userLastName"
              v-model="userLastName"
              size="large"
              class="w-full"
              :disabled="areInputsDisabled"
            />
            <label for="userLastName">Apellidos</label>
          </FloatLabel>
          <!-- Sexo -->
          <FloatLabel variant="on" class="w-full">
            <Select
              v-model="userGender"
              inputId="userGender"
              :options="userGenderOptions"
              size="large"
              optionLabel="name"
              class="w-full"
              :disabled="areInputsDisabled"
            />
            <label for="userGender">Sexo</label>
          </FloatLabel>
          <!-- Fecha de Nacimiento -->
          <FloatLabel variant="on" class="w-full">
            <DatePicker
              id="userBirthDate"
              v-model="userBirthDate"
              dateFormat="dd/mm/yy"
              showIcon
              class="w-full"
              size="large"
              :disabled="areInputsDisabled"
            />
            <label for="userBirthDate">Fecha de nacimiento</label>
          </FloatLabel>
          <!-- Nacionalidad (sin modificar íconos) -->
          <FloatLabel variant="on" class="w-full">
            <Select
              v-model="userNationality"
              inputId="nacionalidad"
              :options="countriesList"
              filter
              optionLabel="name"
              size="large"
              placeholder="ㅤ"
              class="w-full"
              :disabled="areInputsDisabled"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center">
                  <img
                    :alt="slotProps.value.label || slotProps.value.name"
                    src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png"
                    :class="`mr-2 flag flag-${
                      slotProps.value.code
                        ? slotProps.value.code.toLowerCase()
                        : ''
                    }`"
                    style="width: 18px"
                  />
                  <div>{{ slotProps.value.name }}</div>
                </div>
                <span v-else>
                  {{ slotProps.placeholder }}
                </span>
              </template>
              <template #option="slotProps">
                <div class="flex items-center">
                  <img
                    :alt="slotProps.option.label"
                    src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png"
                    :class="`mr-2 flag flag-${slotProps.option.code.toLowerCase()}`"
                    style="width: 18px"
                  />
                  <div>{{ slotProps.option.name }}</div>
                </div>
              </template>
            </Select>
            <label for="nacionalidad">País de origen</label>
          </FloatLabel>
          <!-- Etnia -->
          <FloatLabel variant="on" class="w-full">
            <Select
              v-model="userEthnicity"
              inputId="userEthnicity"
              :options="userEthnicityOptions"
              size="large"
              optionLabel="name"
              class="w-full"
              filter
              :disabled="areInputsDisabled"
            />
            <label for="userEthnicity">Etnia</label>
          </FloatLabel>

          <!-- Provincia -->
          <FloatLabel variant="on" class="w-full">
            <Select
              v-model="userProvince"
              inputId="userProvince"
              :options="userProvinceOptions"
              size="large"
              filter
              optionLabel="name"
              class="w-full"
              :disabled="areInputsDisabled"
            />
            <label for="userProvince">Provincia</label>
          </FloatLabel>

          <!-- Ciudad -->
          <FloatLabel variant="on" class="w-full">
            <Select
              v-model="userCity"
              inputId="userCity"
              :options="userCityOptions"
              size="large"
              filter
              optionLabel="name"
              class="w-full"
              :disabled="areInputsDisabled"
            />
            <label for="userCity">Ciudad</label>
          </FloatLabel>
        </div>
      </div>
      <!-- Sección de Contacto centrada -->
      <div>
        <h3 class="text-2xl font-semibold ml-18 mb-8">Contacto</h3>
        <div
          class="input-spacing grid grid-cols-1 gap-4 ml-40 mr-18"
          style="max-width: 400px"
        >
          <FloatLabel variant="on" class="w-full">
            <InputMask
              id="userPhone"
              v-model="userPhone"
              size="large"
              class="w-full md:w-100"
              mask="(999)-999-9999"
              :disabled="areInputsDisabled"
            />
            <label for="userPhone">Teléfono</label>
          </FloatLabel>
          <FloatLabel variant="on" class="w-full">
            <InputText
              id="userEmail"
              v-model="userEmail"
              size="large"
              class="w-full md:w-100"
              :disabled="areInputsDisabled"
            />
            <label for="userEmail">Correo Electrónico</label>
          </FloatLabel>
          <FloatLabel variant="on" class="w-full">
            <InputText
              id="userAddress"
              v-model="userAddress"
              size="large"
              class="w-full md:w-100"
              :disabled="areInputsDisabled"
            />
            <label for="userAddress">Dirección de domicilio</label>
          </FloatLabel>
          <!-- Grid para Sector y Zona con ligero margin-right -->
          <div class="grid grid-cols-2" style="max-width: 400px">
            <FloatLabel variant="on" class="w-full">
              <Select
                v-model="userSector"
                inputId="userSector"
                :options="userSectorOptions"
                size="large"
                optionLabel="name"
                class="w-full md:w-48"
                filter
                :disabled="areInputsDisabled"
              />
              <label for="userSector">Sector</label>
            </FloatLabel>
            <FloatLabel variant="on" class="w-full">
              <Select
                v-model="userZone"
                inputId="userZone"
                :options="userZoneOptions"
                size="large"
                optionLabel="name"
                class="w-full md:w-48"
                disabled
              />
              <label for="userZone">Zona</label>
            </FloatLabel>
          </div>

          <Dialog
            v-model:visible="referenceDialog"
            modal
            header="Contacto de Referencia"
            :style="{ width: '30rem' }"
          >
            <div class="p-6">
              <div class="grid grid-cols-1 gap-6">
                <FloatLabel variant="on">
                  <InputText
                    id="referenceRelationship"
                    v-model="userReferenceRelationship"
                    size="large"
                    class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :disabled="areInputsDisabled"
                  />
                  <label for="referenceRelationship">Parentesco</label>
                </FloatLabel>
                <FloatLabel variant="on">
                  <InputText
                    id="referenceName"
                    v-model="userReferenceName"
                    size="large"
                    class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :disabled="areInputsDisabled"
                  />
                  <label for="referenceName">Nombre de Referencia</label>
                </FloatLabel>
                <FloatLabel variant="on">
                  <InputMask
                    id="referencePhone"
                    v-model="userReferencePhone"
                    size="large"
                    class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    mask="(999)-999-9999"
                    :disabled="areInputsDisabled"
                  />
                  <label for="referencePhone">Teléfono de Referencia</label>
                </FloatLabel>
              </div>
            </div>
            <div class="flex justify-end p-4 rounded-b-lg">
              <Button
                type="button"
                icon="pi pi-times"
                label="Cancelar"
                severity="secondary"
                class="mr-3"
                @click="referenceDialog = false"
              />
              <Button
                type="button"
                icon="pi pi-check"
                label="Guardar"
                class="bg-blue-600 hover:bg-blue-700 text-white"
                @click="referenceDialog = false"
              />
            </div>
          </Dialog>
          <Button
            @click="referenceDialog = true"
            label="Contacto de Referencia"
            icon="pi pi-user"
            severity="contrast"
            class="w-full md:w-60 md:h-12 ml-20"
            :disabled="areInputsDisabled"
          />
        </div>
      </div>
    </div>
    <div class="border-b -mt-2 mb-5"></div>
    <!-- Datos Demográficos y Contacto de Referencia -->
    <div class="grid grid-cols-2 gap-4 py-4 mb-3">
      <!-- Datos Demográficos -->
      <div>
        <h3 class="text-2xl font-semibold mb-8">Datos Demográficos</h3>
        <div class="input-spacing grid grid-cols-2 mb-5">
          <div class="flex items-center gap-2">
            <Checkbox
              v-model="userSocialBenefit"
              binary
              :disabled="areInputsDisabled"
            />
            <label>¿Recibe bono?</label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox
              v-model="userEconomicDependece"
              binary
              :disabled="areInputsDisabled"
              class="-ml-40"
            />
            <label>¿Dependiente económico?</label>
          </div>
        </div>
        <div class="input-spacing grid grid-cols-2 gap-4 mt-4">
          <!-- Instrucción -->
          <FloatLabel variant="on" class="w-full">
            <Select
              v-model="userAcademicInstruction"
              inputId="userAcademicInstruction"
              :options="userAcademicInstructionOptions"
              size="large"
              optionLabel="name"
              class="w-full"
              filter
              :disabled="areInputsDisabled"
            />
            <label for="userAcademicInstruction">Instrucción</label>
          </FloatLabel>

          <!-- Ocupación -->
          <FloatLabel variant="on" class="w-full">
            <Select
              v-model="userProfession"
              inputId="userProfession"
              :options="userProfessionOptions"
              size="large"
              optionLabel="name"
              class="w-full"
              filter
              :disabled="areInputsDisabled"
            />
            <label for="userProfession">Ocupación</label>
          </FloatLabel>

          <!-- Estado Civil -->
          <FloatLabel variant="on" class="w-full">
            <Select
              v-model="userMaritalStatus"
              inputId="userMaritalStatus"
              :options="userMaritalStatusOptions"
              size="large"
              optionLabel="name"
              class="w-full"
              :disabled="areInputsDisabled"
            />
            <label for="userMaritalStatus">Estado Civil</label>
          </FloatLabel>

          <!-- Cargas Familiares -->
          <FloatLabel variant="on">
            <InputNumber
              v-model="userDependents"
              inputId="on_label"
              mode="decimal"
              showButtons
              :min="0"
              :max="12"
              fluid
              size="large"
              class="w-full"
              :disabled="areInputsDisabled"
            />
            <label for="on_label">Cargas Familiares</label>
          </FloatLabel>

          <!-- Nivel de Ingresos -->
          <FloatLabel variant="on" class="w-full">
            <Select
              v-model="userIncomeLevel"
              inputId="userIncomeLevel"
              :options="userIncomeLevelOptions"
              size="large"
              optionLabel="name"
              class="w-full"
              filter
              :disabled="areInputsDisabled"
            />
            <label for="userIncomeLevel">Nivel de ingresos</label>
          </FloatLabel>

          <!-- Ingresos Familiares -->
          <FloatLabel variant="on" class="w-full">
            <Select
              v-model="userFamilyIncome"
              inputId="userFamilyIncome"
              :options="userFamilyIncomeOptions"
              size="large"
              optionLabel="name"
              class="w-full"
              filter
              :disabled="areInputsDisabled"
            />
            <label for="userIncomeLevel">Ingresos Familiares</label>
          </FloatLabel>

          <!-- Grupo Familiar -->
          <FloatLabel variant="on">
            <MultiSelect
              v-model="userFamilyGroup"
              :options="userFamilyGroupOptions"
              optionLabel="name"
              filter
              :disabled="areInputsDisabled"
              size="large"
              :maxSelectedLabels="3"
              class="w-full"
            />
            <label for="on_label">Grupo Familiar</label>
          </FloatLabel>

          <!-- Personas economicamente activas -->
          <FloatLabel variant="on">
            <InputNumber
              v-model="userEconomicActivePeople"
              inputId="on_label"
              mode="decimal"
              showButtons
              :min="0"
              :max="12"
              fluid
              size="large"
              class="w-full"
              :disabled="areInputsDisabled"
            />
            <label for="on_label">Personas económicamente activas</label>
          </FloatLabel>
        </div>
      </div>
      <!-- Datos Socioeconómicos y de Salud -->
      <div>
        <h3 class="text-2xl font-semibold ml-18 mb-11">
          Datos Socioeconómicos y de Salud
        </h3>
        <div class="input-spacing grid grid-cols-3 -mt-7 ml-18">
          <div class="flex items-center gap-2">
            <Checkbox
              v-model="userHasDisability"
              binary
              :disabled="areInputsDisabled"
            />
            <label class="whitespace-nowrap">¿Discapacidad?</label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox
              v-model="userHasAnyIllness"
              binary
              :disabled="areInputsDisabled"
            />
            <label class="whitespace-nowrap">¿Enfermedad Catastrófica?</label>
          </div>

          <!-- Contenedor fijo para mantener el espacio -->

          <div class="min-h-[60px] -mt-16 mr-6 flex flex-col items-end gap-2">
            <Knob
              v-model="userDisabilityPercentage"
              :step="5"
              :size="70"
              valueTemplate="{value}%"
              v-tooltip.top="'Ingresa el porcentaje (%) de Discapacidad'"
              :style="{
                visibility: userHasDisability ? 'visible' : 'hidden',
                opacity: userHasDisability ? 1 : 0,
                transform: userHasDisability
                  ? 'translateY(0)'
                  : 'translateY(-8px)',
                transition:
                  'opacity 0.5s ease-out, transform 0.5s ease-out, visibility 0.5s',
              }"
            />
            <div class="flex gap-1 mr-3.5">
              <Button
                class="knobBtn"
                icon="pi pi-plus"
                size="small"
                raised
                :severity="
                  userDisabilityPercentage >= 100 ? 'secondary' : 'contrast'
                "
                @click="userDisabilityPercentage++"
                @mousedown="startIncrement"
                @mouseup="stopIncrement"
                @mouseleave="stopIncrement"
                :disabled="userDisabilityPercentage >= 100"
                :style="{
                  visibility: userHasDisability ? 'visible' : 'hidden',
                  opacity: userHasDisability ? 1 : 0,
                  transform: userHasDisability
                    ? 'translateY(0)'
                    : 'translateY(-8px)',
                  transition:
                    'opacity 0.5s ease-out, transform 0.5s ease-out, visibility 0.5s',
                }"
              />

              <!-- Botón de decremento -->
              <Button
                class="knobBtn"
                icon="pi pi-minus"
                size="small"
                raised
                :severity="
                  userDisabilityPercentage <= 0 ? 'secondary' : 'contrast'
                "
                @click="userDisabilityPercentage--"
                @mousedown="startDecrement"
                @mouseup="stopDecrement"
                @mouseleave="stopDecrement"
                :disabled="userDisabilityPercentage <= 0"
                :style="{
                  visibility: userHasDisability ? 'visible' : 'hidden',
                  opacity: userHasDisability ? 1 : 0,
                  transform: userHasDisability
                    ? 'translateY(0)'
                    : 'translateY(-8px)',
                  transition:
                    'opacity 0.5s ease-out, transform 0.5s ease-out, visibility 0.5s',
                }"
              />
            </div>
          </div>
        </div>

        <div class="input-spacing grid grid-cols-2 gap-4 mt-4 ml-18">
          <!-- Patrimonio propio -->
          <FloatLabel variant="on" class="w-full md:w-70">
            <MultiSelect
              v-model="userOwnAssets"
              :options="userOwnAssetsOptions"
              optionLabel="name"
              filter
              :disabled="areInputsDisabled"
              size="large"
              :maxSelectedLabels="2"
              class="w-full"
            />
            <label for="userOwnAssets">Patrimonio Propio</label>
          </FloatLabel>

          <!-- Tipo de vivienda -->
          <FloatLabel variant="on" class="w-full md:w-70">
            <Select
              v-model="userHousingType"
              inputId="userHousingType"
              :options="userHousingTypeOptions"
              size="large"
              optionLabel="name"
              class="w-full"
              :disabled="areInputsDisabled"
            />
            <label for="userHousingType">Tipo de vivienda</label>
          </FloatLabel>

          <!-- Pensionista -->
          <FloatLabel variant="on" class="w-full md:w-70">
            <Select
              v-model="userPensioner"
              inputId="userPensioner"
              :options="userPensionerOptions"
              size="large"
              optionLabel="name"
              class="w-full"
              :disabled="areInputsDisabled"
            />
            <label for="userPensioner">Pensionista</label>
          </FloatLabel>

          <!-- Seguro de salud -->
          <FloatLabel variant="on" class="w-full md:w-70">
            <Select
              v-model="userHealthInsurance"
              inputId="userHealthInsurance"
              :options="userHealthInsuranceOptions"
              size="large"
              optionLabel="name"
              class="w-full"
              :disabled="areInputsDisabled"
            />
            <label for="userHealthInsurance">Seguro de salud</label>
          </FloatLabel>

          <!-- Situación de vulnerabilidad -->
          <FloatLabel variant="on" class="w-full md:w-70">
            <Select
              v-model="userVulnerableSituation"
              inputId="userVulnerableSituation"
              :options="userVulnerableSituationOptions"
              size="large"
              optionLabel="name"
              class="w-full"
              :disabled="areInputsDisabled"
            />
            <label for="userVulnerableSituation"
              >Situación de vulnerabilidad</label
            >
          </FloatLabel>

          <!-- Documentos de respaldo -->
          <FloatLabel variant="on" class="w-full md:w-70">
            <Select
              v-model="userSupportingDocuments"
              inputId="userSupportingDocuments"
              :options="userSupportingDocumentsOptions"
              size="large"
              optionLabel="name"
              class="w-full text-left"
              :disabled="areInputsDisabled"
            />
            <label for="userSupportingDocuments">Documentos de Respaldo</label>
          </FloatLabel>

          <!-- Discapacidad -->
          <transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 transform -translate-y-2"
            enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition ease-in duration-300"
            leave-from-class="opacity-100 transform translate-y-0"
            leave-to-class="opacity-0 transform -translate-y-2"
          >
            <div v-if="userHasDisability">
              <FloatLabel variant="on" class="w-full md:w-70">
                <Select
                  v-model="userDisability"
                  inputId="userDisability"
                  :options="userDisabilityOptions"
                  size="large"
                  optionLabel="name"
                  class="w-full"
                  :disabled="areInputsDisabled"
                />
                <label for="userDisability">Discapacidad</label>
              </FloatLabel>
            </div>
          </transition>

          <!-- Enfermedad Catastrófica -->
          <transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 transform -translate-y-2"
            enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition ease-in duration-300"
            leave-from-class="opacity-100 transform translate-y-0"
            leave-to-class="opacity-0 transform -translate-y-2"
          >
            <div v-if="userHasAnyIllness">
              <FloatLabel variant="on" class="w-full md:w-70">
                <Select
                  v-model="userCatastrophicIllness"
                  inputId="userCatastrophicIllness"
                  :options="userCatastrophicIllnessOptions"
                  size="large"
                  optionLabel="name"
                  class="w-full"
                  filter
                  :disabled="areInputsDisabled"
                />
                <label for="userCatastrophicIllness"
                  >Enfermedad Catastrófica</label
                >
              </FloatLabel>
            </div>
          </transition>

          <!---------------------------------------------------------------------------------------------->
          <!-- Documentos de respaldo (Discapacidad/Enfermedad) -->
          <Dialog
            v-model:visible="healthDocumentDialog"
            modal
            header="Documento de respaldo"
            :style="{ width: '40rem' }"
            @hide="cancelUpload"
          >
            <div class="p-6">
              <Toast />
              <FileUpload
                name="file"
                accept=".pdf"
                :multiple="false"
                @select="onSelectedFiles"
                :autoClear="false"
                class="w-full md:w-100"
              >
                <!-- Header: solo se muestra el botón para elegir archivo -->
                <template #header="{ chooseCallback, files }">
                  <div
                    class="flex flex-wrap justify-between items-center gap-4"
                  >
                    <Button
                      @click="chooseCallback()"
                      icon="pi pi-images"
                      rounded
                      v-tooltip="'Seleccionar archivo'"
                      outlined
                      severity="secondary"
                      :disabled="!!userHealthDocuments && !!doesUserExist"
                    />
                  </div>
                </template>
                <!-- Content: muestra la vista previa del archivo pendiente o ya guardado -->
                <template #content="{ files, removeFileCallback }">
                  <div class="flex flex-col gap-8 pt-4">
                    <!-- Si hay archivo pendiente en FileUpload -->
                    <div
                      v-if="files.length > 0"
                      class="flex flex-col items-center"
                    >
                      <div
                        class="w-24 h-24 flex items-center justify-center border border-dashed border-gray-300 rounded"
                      >
                        <i class="pi pi-file-pdf text-5xl text-red-600"></i>
                      </div>
                      <span
                        class="mt-2 font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                      >
                        {{ files[0].name }}
                      </span>
                      <Button
                        icon="pi pi-times"
                        label="Eliminar"
                        class="p-button-danger mt-2"
                        @click="
                          onRemoveTemplatingFile(
                            files[0],
                            removeFileCallback,
                            0
                          )
                        "
                        outlined
                        rounded
                      />
                    </div>
                    <!-- Usuario no existe, pero ya se había cargado un archivo -->
                    <div
                      v-else-if="userHealthDocuments && !doesUserExist"
                      class="flex flex-col items-center"
                    >
                      <div
                        class="w-24 h-24 flex items-center justify-center border border-dashed border-gray-300 rounded"
                      >
                        <i class="pi pi-file-pdf text-5xl text-red-600"></i>
                      </div>
                      <span
                        class="mt-2 font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                      >
                        {{ userHealthDocumentsName }}
                      </span>
                      <div class="flex gap-2 mt-2">
                        <Button
                          icon="pi pi-times"
                          label="Reemplazar"
                          class="p-button-danger mt-2"
                          @click="removeUploadedFile"
                          outlined
                          rounded
                        />
                      </div>
                    </div>

                    <!-- Usuario ya existe, se carga el archivo -->
                    <div
                      v-else-if="userHealthDocuments && doesUserExist"
                      class="flex flex-col items-center"
                    >
                      <div
                        class="w-24 h-24 flex items-center justify-center border border-dashed border-gray-300 rounded"
                      >
                        <i class="pi pi-file-pdf text-5xl text-red-600"></i>
                      </div>
                      <span
                        class="mt-2 font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                      >
                        {{ selectedUser.User_HealthDocumentsName }}
                      </span>
                      <div class="flex gap-2 mt-2">
                        <Button
                          icon="pi pi-times"
                          label="Reemplazar"
                          class="p-button-danger mt-2"
                          @click="deleteDocument()"
                          outlined
                          rounded
                        />
                        <div
                          v-if="
                            doesUserExist && userHealthDocumentsName != null
                          "
                        >
                          <Button
                            icon="pi pi-eye"
                            label="Ver"
                            class="p-button-info mt-2"
                            @click="loadUserHealthDocument(userID)"
                            outlined
                            rounded
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <!-- Dos opciones para que salga el templete. El usuario no existe y no tiene archivos. El usuario existe pero no tiene documentos -->
                <template #empty>
                  <div
                    v-if="!userHealthDocuments && !doesUserExist"
                    class="flex items-center justify-center flex-col"
                  >
                    <i
                      class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl !text-muted-color"
                    />
                    <p class="mt-6 mb-0">
                      Arrastra y suelta el archivo PDF aquí.
                    </p>
                  </div>
                  <div
                    v-else-if="!userHealthDocuments && doesUserExist"
                    class="flex items-center justify-center flex-col"
                  >
                    <i
                      class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl !text-muted-color"
                    />
                    <p class="mt-6 mb-0">
                      Arrastra y suelta el archivo PDF aquí.
                    </p>
                  </div>
                </template>
              </FileUpload>
            </div>
            <!-- Pie del diálogo con las acciones de Guardar y Cancelar -->
            <div class="flex justify-end p-4 rounded-b-lg">
              <Button
                type="button"
                icon="pi pi-times"
                label="Salir"
                severity="secondary"
                class="mr-3"
                @click="cancelUpload()"
              />
              <div
                v-if="
                  userHealthDocuments &&
                  !doesUserExist &&
                  userRequestNewDocument
                "
              >
                <Button
                  type="button"
                  icon="pi pi-save"
                  label="Guardar"
                  class="bg-blue-600 hover:bg-blue-700 text-white"
                  @click="onSaveDocument()"
                />
              </div>
              <div
                v-if="
                  userHealthDocuments && doesUserExist && userRequestNewDocument
                "
              >
                <Button
                  type="button"
                  icon="pi pi-save"
                  label="Guardar"
                  class="bg-blue-600 hover:bg-blue-700 text-white"
                  @click="uploadNewDocument()"
                />
              </div>
            </div>
          </Dialog>

          <!---------------------------------------------------------------------------------------------->

          <transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 transform -translate-y-2"
            enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition ease-in duration-300"
            leave-from-class="opacity-100 transform translate-y-0"
            leave-to-class="opacity-0 transform -translate-y-2"
          >
            <div v-if="userHasDisability || userHasAnyIllness">
              <Button
                @click="healthDocumentDialog = true"
                label="Documento de respaldo"
                icon="pi pi-file-pdf"
                severity="contrast"
                class="w-full md:w-70 md:h-12"
                :disabled="areInputsDisabled"
              />                    
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>

  <!--TABS -->
  <div class="card mr-4 h-full md:h-200">
    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="0">Asesorias </Tab>
        <Tab value="1" v-if="authStore.user?.type == 'Administrador'"
          >Patrocinios</Tab
        >
        <div
          v-if="isAsesoriasTab"
          class="flex justify-between items-center w-full"
          :class="authStore.user?.type == 'Estudiante' ? 'ml-266' : 'ml-0'"
        >
<!-- Checkbox -->
<div
  v-if="authStore.user?.type == 'Administrador' || authStore.user?.type == 'Coordinador'"
  class="flex items-center gap-4 ml-120"
>
  <div class="flex items-center gap-2">
    <Checkbox
      v-model="initSocialWork"
      binary
      :disabled="areInputsDisabled"
      :class="
        !doesUserRequestOp && doesUserExist
          ? 'mouse pointer-events-none'
          : ''
      "
    />
    <label class="whitespace-nowrap">¿Trabajo Social?</label>
  </div>
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 transform -translate-y-2"
    enter-to-class="opacity-100 transform translate-y-0"
    leave-active-class="transition ease-in duration-300"
    leave-from-class="opacity-100 transform translate-y-0"
    leave-to-class="opacity-0 transform -translate-y-2"
  >
    <div v-show="initSocialWork" class="flex items-center gap-2">
      <ToggleSwitch v-model="initMandatorySW" v-tooltip.bottom="'Selecciona'"       :disabled="areInputsDisabled"
      :class="
        !doesUserRequestOp && doesUserExist
          ? 'mouse pointer-events-none'
          : ''
      " />
      <label class="whitespace-nowrap">¿Obligatorio?</label>
    </div>
  </transition>
</div>

          <!-- Botones alineados al final -->
          <div class="flex items-center gap-2 mr-10">
            <div
              v-if="
                authStore.user?.type == 'Administrador' &&
                doesUserExist &&
                initAlertNote != ''
              "
            >
              <div v-if="doesConsultationHasAlert">
                <Button
                  severity="warn"
                  class="bg-yellow-400"
                  icon="pi pi-exclamation-triangle"
                  @click="watchAlertDialog = true"
                  v-tooltip.bottom="'Advertencia'"
                  rounded
                />
              </div>
            </div>
            <Button
              icon="pi pi-file-plus"
              @click="requestNewConsultation()"
              v-tooltip.bottom="'Nueva Ficha'"
              rounded
              aria-label="Nueva Ficha"
              :disabled="!doesUserExist || isSaveButtonDisabled"
            />
            <div v-if="authStore.user?.type !== 'Estudiante'">
              <Button
                icon="pi pi-file-edit"
                @click="requestEditConsultation()"
                v-tooltip.bottom="'Editar Ficha'"
                rounded
                aria-label="Editar Ficha"
                severity="info"
                :disabled="!doesUserExist || isEditButtonDisabled"
              />
            </div>
            <Button
              icon="pi pi-file-pdf"
              v-tooltip.bottom="'Exportar PDF'"
              rounded
              aria-label="Exportar PDF"
              @click="loadUserAttentionSheet(initCode)"
              severity="contrast"
              :disabled="!doesUserExist || isExportButtonDisabled"
            />
          </div>
        </div>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <!-- <div v-if="getCurrentConsultation"> -->
          <div class="p-6">
            <div class="grid grid-cols-3 gap-4">
              <div class="flex flex-col sm:flex-row gap-4">
                <!-- Input para Número de Doc. -->
                <div class="w-full sm:w-2/3">
                  <!-- Número de Doc. Asignado -->
                  <FloatLabel variant="on" class="w-full">
                    <InputText
                      id="initCode"
                      v-model="initCode"
                      class="w-full"
                      size="large"
                      :disabled="true"
                    />
                    <label for="initCode">Código de la ficha</label>
                  </FloatLabel>
                </div>
                <!-- Select para Estado -->
                <div class="w-full sm:w-2/3">
                  <FloatLabel variant="on" class="w-full">
                    <Select
                      v-model="initCaseStatus"
                      inputId="initCaseStatus"
                      :options="initCaseStatusOptions"
                      size="large"
                      optionLabel="name"
                      class="w-full"
                      :class="
                      !doesUserRequestOp && doesUserExist
                        ? 'mouse pointer-events-none'
                        : ''
                    "
                      :disabled="areInputsDisabled"
                    />
                    <label for="initCaseStatus">Estado</label>
                  </FloatLabel>
                </div>
              </div>

              <!-- Consultorio -->
              <FloatLabel variant="on" class="w-full">
                <InputText
                  v-model="initOffice"
                  optionLabel="name"
                  :disabled="true"
                  class="w-full"
                  size="large"
                />
                <label for="initOffice">Consultorio</label>
              </FloatLabel>

              <div class="flex flex-col sm:flex-row gap-4">
                <div class="w-full sm:w-2/3">
                  <!-- Fecha Inicio -->
                  <FloatLabel variant="on" class="w-full">
                    <DatePicker
                      id="initDate"
                      v-model="initDate"
                      :disabled="true"
                      dateFormat="dd/mm/yy"
                      showIcon
                      class="w-full"
                      size="large"
                    />
                    <label for="initDate">Fecha</label>
                  </FloatLabel>
                </div>
                <div class="w-full sm:w-2/3">
                  <!-- Fecha Fin -->
                  <FloatLabel variant="on" class="w-full">
                    <DatePicker
                      id="initEndDate"
                      v-model="initEndDate"
                      :disabled="isInitEndDateDisabled"
                      dateFormat="dd/mm/yy"
                      showIcon
                      class="w-full"
                      size="large"
                    />
                    <label for="initEndDate">Fecha Fin</label>
                  </FloatLabel>
                </div>
              </div>

              <!-- Tipo de Cliente -->
              <FloatLabel variant="on" class="w-full">
                <Select
                  v-model="initClientType"
                  :options="initClientTypeOptions"
                  optionLabel="name"
                  class="w-full"
                  :class="
                    !doesUserRequestOp && doesUserExist
                      ? 'mouse pointer-events-none'
                      : ''
                  "
                  size="large"
                  :disabled="areInputsDisabled"
                />
                <label for="initClientType">Tipo de cliente</label>
              </FloatLabel>

              <!-- Área -->
              <FloatLabel variant="on" class="w-full">
                <Select
                  v-model="initSubject"
                  :options="initSubjectOptions"
                  optionLabel="name"
                  class="w-full"
                  :class="
                    !doesUserRequestOp && doesUserExist
                      ? 'mouse pointer-events-none'
                      : ''
                  "
                  size="large"
                  filter
                  :disabled="areInputsDisabled"
                />
                <label for="initSubject">Área/Materia</label>
              </FloatLabel>

              <!-- Tema -->
              <FloatLabel variant="on" class="w-full">
                <Select
                  v-model="initTopic"
                  :options="initTopicOptions"
                  optionLabel="name"
                  class="w-full"
                  :class="
                    !doesUserRequestOp && doesUserExist
                      ? 'mouse pointer-events-none'
                      : ''
                  "
                  size="large"
                  filter
                  :disabled="areInputsDisabled"
                />
                <label for="initTopic">Tema</label>
              </FloatLabel>

              <div class="flex flex-col sm:flex-row gap-4">
                <!-- Tipo de atención -->
                <div
                  :class="
                    authStore.user?.type === 'Estudiante'
                      ? 'w-full'
                      : 'w-full sm:w-2/3'
                  "
                >
                  <FloatLabel variant="on" class="w-full">
                    <Select
                      v-model="initService"
                      :options="
                        authStore.user?.type === 'Estudiante'
                          ? initServiceOptions.filter(
                              (option) => option.name !== 'Patrocinio'
                            )
                          : initServiceOptions
                      "
                      optionLabel="name"
                      class="w-full"
                      :class="
                        !doesUserRequestOp && doesUserExist
                          ? 'mouse pointer-events-none'
                          : ''
                      "
                      size="large"
                      :disabled="areInputsDisabled"
                    />
                    <label for="initService">Tipo de atención</label>
                  </FloatLabel>
                </div>

                <!-- Complejidad: se muestra solo si el usuario no es estudiante -->
                <div
                  v-if="authStore.user?.type !== 'Estudiante'"
                  class="w-full sm:w-2/3"
                >
                  <FloatLabel variant="on" class="w-full">
                    <Select
                      v-model="initComplexity"
                      :options="initComplexityOptions"
                      optionLabel="name"
                      class="w-full"
                      :class="
                        !doesUserRequestOp && doesUserExist
                          ? 'mouse pointer-events-none'
                          : ''
                      "
                      size="large"
                      :disabled="areInputsDisabled"
                    />
                    <label for="initComplexity">Complejidad</label>
                  </FloatLabel>
                </div>
              </div>

              <!-- Abogado -->
              <FloatLabel variant="on" class="w-full">
                <Select
                  v-model="initLawyer"
                  :options="initLawyerOptions"
                  optionLabel="name"
                  class="w-full"
                  :class="
                    !doesUserRequestOp && doesUserExist
                      ? 'mouse pointer-events-none'
                      : ''
                  "
                  size="large"
                  :disabled="areInputsDisabled"
                />
                <label for="initLawyer">Abogado</label>
              </FloatLabel>

              <!-- Derivado por -->
              <FloatLabel variant="on" class="w-full">
                <Select
                  v-model="initReferral"
                  :options="initReferralOptions"
                  optionLabel="name"
                  class="w-full"
                  :class="
                    !doesUserRequestOp && doesUserExist
                      ? 'mouse pointer-events-none'
                      : ''
                  "
                  size="large"
                  :disabled="areInputsDisabled"
                />
                <label for="initReferral">Derivado por</label>
              </FloatLabel>
            </div>

            <!-- Observación y Evidencias -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
              <!-- Observación -->
              <div class="flex flex-col">
                <label for="initNotes" class="mb-2">Observación</label>
                <Editor
                  v-model="initNotes"
                  class="w-full"
                  editorStyle="height: 239px"
                  :class="[
                    doesUserExist && !doesUserRequestOp
                      ? 'mouse pointer-events-none'
                      : '',
                    areInputsDisabled ? 'select-none opacity-50' : '',
                  ]"
                  :readonly="
                    ((!doesUserExist && areInputsDisabled) ||
                    (!doesUserRequestNewConsultation) &&
                      (!doesUserRequestEditConsultation && doesUserExist))
                  "
                >
                  <template v-slot:toolbar>
                    <span class="ql-formats">
                      <button
                        v-tooltip.bottom="'Negrita'"
                        class="ql-bold"
                      ></button>
                      <button
                        v-tooltip.bottom="'Cursiva'"
                        class="ql-italic"
                      ></button>
                      <button
                        v-tooltip.bottom="'Subrayado'"
                        class="ql-underline"
                      ></button>
                    </span>
                  </template>
                </Editor>
              </div>

              <!-- Evidencias -->
              <div class="flex flex-col">
                <label for="archivo" class="mb-2">Evidencias</label>
                <FileUpload
                  ref="fileUploadEvidence"
                  name="file"
                  accept=".pdf"
                  :multiple="false"
                  @select="onSelectedFilesEvidence"
                  :autoClear="false"
                  class="w-full md:w-100"
                  :disabled="areInputsDisabled"
                >
                  <!-- Header: solo se muestra el botón para elegir archivo -->
                  <template #header="{ chooseCallback, files }">
                    <div
                      class="flex flex-wrap justify-between items-center gap-4"
                    >
                      <Button
                        @click="chooseCallback()"
                        icon="pi pi-images"
                        rounded
                        v-tooltip="'Seleccionar archivo'"
                        outlined
                        severity="secondary"
                        :class="
                          areInputsDisabled || evidenceFile
                            ? 'pointer-events-none'
                            : ''
                        "
                      />
                      <div
                        v-if="
                          doesUserExist &&
                          userRequestNewEvidenceDocument &&
                          !doesUserRequestNewConsultation
                        "
                        class="flex gap-2"
                      >
                        <Button
                          @click="uploadNewEvidenceDocument()"
                          icon="pi pi-upload"
                          rounded
                          v-tooltip="'Subir archivo'"
                          outlined
                          severity="success"
                          :disabled="!evidenceFile && !!doesUserExist"
                        />
                      </div>
                    </div>
                  </template>
                  <!-- Content: muestra la vista previa del archivo pendiente o ya guardado -->
                  <template #content="{ files, removeFileCallback }">
                    <div class="flex flex-col gap-8 pt-4">
                      <!-- Si hay archivo pendiente en FileUpload -->
                      <div
                        v-if="files.length > 0"
                        class="flex flex-col items-center"
                      >
                        <div
                          class="w-24 h-24 flex items-center justify-center border border-dashed border-gray-300 rounded"
                        >
                          <i class="pi pi-file-pdf text-5xl text-red-600"></i>
                        </div>
                        <span
                          class="mt-2 font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                        >
                          {{ files[0].name }}
                        </span>
                        <Button
                          icon="pi pi-times"
                          label="Eliminar"
                          class="p-button-danger mt-2"
                          @click="
                            onRemoveTemplatingFileEvidence(
                              files[0],
                              removeFileCallback,
                              0
                            )
                          "
                          outlined
                          rounded
                        />
                      </div>

                      <!-- Usuario ya existe, se carga el archivo -->
                      <div
                        v-else-if="evidenceFile && doesUserExist"
                        class="flex flex-col items-center"
                      >
                        <div
                          class="w-24 h-24 flex items-center justify-center border border-dashed border-gray-300 rounded"
                        >
                          <i class="pi pi-file-pdf text-5xl text-red-600"></i>
                        </div>
                        <span
                          class="mt-2 font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                        >
                          {{ selectedEvidence.Evidence_Name }}
                        </span>
                        <div class="flex gap-2 mt-2">
                          <div
                            v-if="
                              doesUserExist && doesUserRequestEditConsultation
                            "
                          >
                            <Button
                              icon="pi pi-times"
                              label="Reemplazar"
                              class="p-button-danger mt-2"
                              @click="deleteEvidenceDocument()"
                              outlined
                              rounded
                            />
                          </div>
                          <div v-if="doesUserExist && evidenceFile != null">
                            <Button
                              icon="pi pi-eye"
                              label="Ver"
                              class="p-button-info mt-2"
                              @click="loadUserEvidenceDocument(evidenceID)"
                              outlined
                              rounded
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <!-- Dos opciones para que salga el templete. El usuario no existe y no tiene archivos. El usuario existe pero no tiene documentos -->
                  <template #empty>
                    <div v-if="isEvidenceLoading" class="flex justify-center">
                      <ProgressSpinner
                        style="width: 50px; height: 50px"
                        strokeWidth="8"
                        fill="transparent"
                        animationDuration=".5s"
                        aria-label="Custom ProgressSpinner"
                      />
                    </div>

                    <div
                      v-else-if="!evidenceFile && !doesUserExist"
                      class="flex items-center justify-center flex-col"
                    >
                      <i
                        class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl !text-muted-color"
                      />
                      <p class="mt-6 mb-0">
                        Arrastra y suelta el archivo PDF aquí.
                      </p>
                    </div>
                    <div
                      v-else-if="!evidenceFile && doesUserExist"
                      class="flex items-center justify-center flex-col"
                    >
                      <i
                        class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl !text-muted-color"
                      />
                      <p class="mt-6 mb-0">
                        Arrastra y suelta el archivo PDF aquí.
                      </p>
                    </div>
                  </template>
                </FileUpload>
              </div>
            </div>
          </div>
          <div v-if="!doesUserRequestOp && doesConsultationExist">
            <Paginator
              v-model:first="first"
              :rows="1"
              :totalRecords="consultations.length"
            ></Paginator>
          </div>
          <!-- </div> -->
        </TabPanel>

        <TabPanel value="1">
          <div class="p-6">
            <!-- Mostrar actividades si existen -->
            <div class="scroll-container">
              <div
                v-if="doesActivityExist"
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <Card
                  v-for="activity in selectedActivity"
                  :key="activity.Activity_ID"
                  style="
                    width: 100%;
                    overflow: hidden;
                    box-shadow: 0 0 8px #ccc;
                  "
                >
                  <template #title>{{ activity.Activity_Name }}</template>
                  <template #subtitle
                    >Fecha:
                    {{
                      new Date(
                        activity.Activity_Start_Date
                      ).toLocaleDateString()
                    }}</template
                  >
                  <template #content>
                    <p class="m-0">
                      <strong>Estudiante: </strong
                      >{{ getInternalUserName(activity.Internal_ID) }}
                      <br />
                      <strong>Lugar: </strong>{{ activity.Activity_Location }}
                      <br />
                      <strong>Abogado: </strong>
                      {{ activity.Activity_Judge_Name || "No asignado" }}
                      <br />
                      <strong>Estado: </strong> {{ activity.Activity_Status }}
                    </p>
                  </template>
                  <template #footer>
                    <div class="flex gap-4 mt-4 justify-center items-center">
                      <Button
                        label="Ver información"
                        severity="info"
                        icon="pi pi-info-circle"
                        class="w-full md:w-50"
                        @click="showActivityDetails(activity)"
                      />
                    </div>
                  </template>
                </Card>
              </div>

              <!-- Mensaje si no hay actividades -->
              <div
                v-else
                class="flex flex-row justify-center items-center h-40 font-medium text-2xl gap-2 mt-50"
              >
                <p>Este caso aún no tiene actividades registradas 🔎</p>
              </div>
            </div>
          </div>

          <!-- Diálogo para mostrar detalles de la actividad -->
          <Dialog
            v-model:visible="activityDialogVisible"
            modal
            header="📋 Detalles de la Actividad"
            :style="{ width: '60vw', maxWidth: '800px' }"
            class="p-6 rounded-2xl shadow-2xl bg-white"
          >
            <div
              v-if="selectedActivityDetails"
              class="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg"
            >
              <div>
                <p class="mb-2">
                  <strong>📌 Nombre:</strong>
                  {{ selectedActivityDetails.Activity_Name }}
                </p>
                <p class="mb-2">
                  <strong>📅 Fecha:</strong>
                  {{
                    new Date(
                      selectedActivityDetails.Activity_Start_Date
                    ).toLocaleDateString()
                  }}
                </p>
                <p class="mb-2">
                  <strong>🕒 Hora:</strong>
                  {{ selectedActivityDetails.Activity_Start_Time }}
                </p>
                <p class="mb-2">
                  <strong>📍 Lugar:</strong>
                  {{ selectedActivityDetails.Activity_Location }}
                </p>
                <p class="mb-2">
                  <strong>⏳ Duración:</strong>
                  {{ selectedActivityDetails.Activity_Duration }}
                </p>
                <p class="mb-2">
                  <strong>🤝 Contraparte:</strong>
                  {{ selectedActivityDetails.Activity_Counterparty }}
                </p>
              </div>

              <div>
                <p class="mb-2">
                  <strong>🏛️ Juzgado:</strong>
                  {{ selectedActivityDetails.Activity_Judged }}
                </p>
                <p class="mb-2">
                  <strong>⚖️ Juez:</strong>
                  {{ selectedActivityDetails.Activity_Judge_Name }}
                </p>
                <p class="mb-2">
                  <strong>📌 Estado:</strong>
                  {{ selectedActivityDetails.Activity_Status }}
                </p>
                <p class="mb-2">
                  <strong>📁 Referencia:</strong>
                  {{ selectedActivityDetails.Activity_Reference_File }}
                </p>
                <p class="mb-2">
                  <strong>⏱️ ¿A tiempo?:</strong>
                  <span
                    :class="
                      selectedActivityDetails.Activity_OnTime
                        ? 'text-green-600 font-semibold'
                        : 'text-red-600 font-semibold'
                    "
                  >
                    {{ selectedActivityDetails.Activity_OnTime ? "Sí" : "No" }}
                  </span>
                </p>
                <Button
                  label="Ver documento"
                  icon="pi pi-file-pdf"
                  class="mt-4 w-full md:w-50"
                  @click="
                    loadActivityDocument(selectedActivityDetails.Activity_ID)
                  "
                  severity="contrast"
                />
              </div>
            </div>
          </Dialog>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <div
      v-if="!doesUserExist && isAsesoriasTab"
      class="flex justify-center mr-25"
    >
      <Button
        label="Crear Caso"
        icon="pi pi-folder-plus"
        @click="createInitialConsultation"
        :disabled="areInputsDisabled"
      />
    </div>

    <div v-if="!newConsultationButtonDisabled" class="flex gap-8 ml-110">
      <Button
        label="Cancelar"
        severity="contrast"
        icon="pi pi-times"
        @click="cancelNewConsultation()"
      />
      <Button
        label="Crear Nueva Ficha"
        icon="pi pi-file-plus"
        @click="newUserConsultation()"
      />
    </div>

    <div v-if="!editConsultationButtonDisabled" class="flex gap-8 ml-110">
      <Button
        label="Cancelar"
        severity="contrast"
        icon="pi pi-times"
        @click="cancelEditConsultation()"
      />
      <Button
        label="Editar Ficha"
        icon="pi pi-file-edit"
        severity="info"
        @click="editUserConsultation()"
      />
    </div>
  </div>

   <!-- Dialog para visualizar el documento PDF de SALUD -->
<Dialog
            v-model:visible="watchHealthDocumentDialog"
            modal
            header="🏥🩺 Documento de Salud"
            class="p-6 rounded-lg shadow-lg bg-white max-w-7xl w-full"
          >
            <iframe
              :src="urlDocument"
              class="w-full h-250"
              frameborder="0"
            ></iframe>
          </Dialog>
          <!-- Dialog para visualizar el documento PDF de EVIDENCIA -->
          <Dialog
            v-model:visible="watchEvidenceDocumentDialog"
            modal
            header="📋 Documento de Atención"
            class="p-6 rounded-lg shadow-lg bg-white max-w-7xl w-full"
          >
            <iframe
              :src="urlDocument"
              class="w-full h-250"
              frameborder="0"
            ></iframe>
          </Dialog>
            <!-- Dialog para visualizar el documento PDF de Ficha de Atención -->
            <Dialog
            v-model:visible="watchAttentionSheetDialog"
            modal
            header="📂 Ficha de Atención"
            class="p-6 rounded-lg shadow-lg bg-white max-w-7xl w-full"
          >
            <iframe
              :src="urlDocument"
              class="w-full h-250"
              frameborder="0"
            ></iframe>
          </Dialog>
            <!-- Dialog para visualizar el documento PDF de Actividades -->
            <Dialog
            v-model:visible="watchActivityDocumentDialog"
            modal
            header="📄 Actividad del Caso"
            class="p-6 rounded-lg shadow-lg bg-white max-w-7xl w-full"
          >
            <iframe
              :src="urlDocument"
              class="w-full h-250"
              frameborder="0"
            ></iframe>
          </Dialog>      

  <Dialog
    v-model:visible="watchAlertDialog"
    modal
    icon="pi pi-exclamation-triangle"
    header="⚠️ Alerta de Viabilidad"
    :style="{ width: '50vw' }"
    class="p-6 rounded-lg shadow-lg bg-white"
  >
    <div v-if="isRejectLoading" class="flex justify-center items-center h-40">
      <ProgressSpinner
        style="width: 50px; height: 50px"
        strokeWidth="8"
        fill="transparent"
        animationDuration=".5s"
      />
    </div>
    <div v-else class="flex flex-col gap-4">
      <p class="text-gray-700 text-lg">
        El caso tiene una o más alertas de viabilidad. Por favor, revisa la
        información antes de continuar.
      </p>
      <p class="text-gray-700 text-lg">
        <strong>Observación:</strong>
      </p>
      <div class="alertNoteCase text-lg" v-html="initAlertNote"></div>
      <p class="text-gray-700 text-lg">
        <strong>Fecha de la alerta:</strong> {{ initDate.toLocaleDateString() }}
      </p>
      <Button
        label="Rechazar Patrocinio"
        icon="pi pi-envelope"
        class="mt-4 w-full md:w-50"
        @click="rejectCase()"
        severity="danger"
      />
    </div>
  </Dialog>
</template>

<style scoped>
.border-b {
  border-bottom: 1px solid #e5e7eb;
}

.input-spacing > :not(:last-child) {
  margin-bottom: 4px;
}
.p-fileupload-advanced {
  height: 280px !important;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.alertNoteCase {
  white-space: pre-line;
}
.knobBtn {
  width: 22px !important;
  height: 22px;
}
.scroll-container {
  max-height: 550px; /* Altura máxima para habilitar el scroll */
  overflow-y: auto; /* Habilitar scroll vertical */
  overflow-x: hidden; /* Evitar scroll horizontal */
  padding: 1rem; /* Agrega espacio interno alrededor de las tarjetas */
  box-sizing: border-box; /* Asegura que el padding no afecte el tamaño total */
}
</style>
