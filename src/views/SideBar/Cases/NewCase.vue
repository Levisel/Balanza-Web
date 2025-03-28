<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
const authStore = useAuthStore();
import type { User } from "@/ApiRoute";
import type { Initial_Consultation } from "@/ApiRoute";
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

import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();

import Tag from "primevue/tag";
import axios from "axios";
import { useToast } from "primevue/usetoast";
import { API } from "@/ApiRoute";
import { Toast } from "primevue";

const toast = useToast();

const currentDateTime = new Date();
const date = currentDateTime.toDateString();

const searchIDInput = ref<string>("");
const selectedUser = ref<User>({} as User);

const referenceDialog = ref(false);
const evidenceDialog = ref(false);
const bandera = ref<boolean>(false);

const toastCounter = ref(0);

//-------------------------------------------------------------------------------------------------------------//

//MANEJO DE ARCHIVOS

const totalSize = ref(0);
const totalSizePercent = ref(0);
const visibleDocumentoDialog = ref(false);
const documentoUrl = ref("");

// // Método para cancelar y cerrar el modal (si se desea reiniciar la carga en cancelar)
// function cancelUpload() {
//   evidenceDialog.value = false;
//   // Si quieres limpiar el archivo en cancelar, descomenta la siguiente línea:
//   // userHealthDocuments.value = null;
// }

// // Método para capturar el archivo al seleccionar en FileUpload
// function onUploadDocument(event: { files: (File | { readonly lastModified: number; readonly name: string; readonly webkitRelativePath: string; readonly size: number; readonly type: string; arrayBuffer: () => Promise<ArrayBuffer>; bytes: () => Promise<Uint8Array>; slice: (start?: number, end?: number, contentType?: string) => Blob; stream: () => ReadableStream<Uint8Array>; text: () => Promise<string>; } | null)[]; }) {
//   // Se espera que event.files contenga el archivo seleccionado
//   userHealthDocuments.value = event.files[0];
//   console.log("Archivo cargado:", userHealthDocuments.value);
// }

// // Método para guardar el documento
// function onSaveDocument() {
//   if (userHealthDocuments.value) {
//     // Aquí puedes agregar validaciones o enviar el archivo a la API si es necesario.
//     console.log("Guardando documento:", userHealthDocuments.value);
//     evidenceDialog.value = false; // Cierra el modal
//   } else {
//     console.log("No se ha cargado ningún archivo.");
//     // Puedes mostrar una notificación o alerta para indicar que debe cargar un archivo.
//   }
// }
// Método para cancelar y cerrar el diálogo (opcionalmente limpiar el archivo)
function cancelUpload() {
  evidenceDialog.value = false;
  // Si deseas limpiar el archivo pendiente al cancelar, descomenta la siguiente línea:
  // userHealthDocuments.value = null;
}

// Método para capturar el archivo seleccionado en FileUpload
function onUploadDocument(event: { files: File[] }) {
  if (event.files && event.files.length > 0) {
    userHealthDocuments.value = event.files[0];
    console.log("Archivo cargado:", userHealthDocuments.value);
  }
}

// Función para quitar el archivo pendiente usando el callback de FileUpload
function removeFile(removeFileCallback: Function) {
  removeFileCallback(0);
  userHealthDocuments.value = null;
}

// Función para quitar el archivo ya guardado (permitiendo su reemplazo)
function removeUploadedFile() {
  userHealthDocuments.value = null;
}

// Método para guardar el documento (lo "persiste" en el estado; aquí podrías enviar el archivo al backend)
function onSaveDocument() {
  if (userHealthDocuments.value) {
    console.log("Guardando documento:", userHealthDocuments.value);
    toast.add({
      severity: "success",
      summary: "Documento guardado",
      detail: userHealthDocuments.value.name,
      life: 3000,
    });
    evidenceDialog.value = false;
    // Aquí podrías agregar la lógica para enviar el archivo al backend,
    // o simplemente mantenerlo en el estado para que se muestre al volver a abrir el diálogo.
  } else {
    console.log("No se ha cargado ningún archivo.");
    toast.add({
      severity: "warn",
      summary: "Atención",
      detail: "No se ha seleccionado ningún archivo.",
      life: 3000,
    });
  }
}

const loadUserHealthDocument = async (userID: string) => {
  try {
    const response = await axios.get(`${API}/user/document/${userID}`, {
      responseType: "blob",
    });

    if (response.status === 200) {
      const contentType = response.headers["content-type"] || "application/pdf";
      const blob = new Blob([response.data], { type: contentType });
      documentoUrl.value = URL.createObjectURL(blob);
      visibleDocumentoDialog.value = true;
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

    if (axios.isAxiosError(error)) {
      console.error("Error response data:", error.response?.data); // Log the response data
      console.error("Error response status:", error.response?.status); // Log the response status
      console.error("Error response headers:", error.response?.headers); // Log the response headers
    } else {
      console.error("Unexpected error:", error);
    }
  }
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
const userGenderOptions = ref([
  { name: "Masculino", value: "Masculino" },
  { name: "Femenino", value: "Femenino" },
  { name: "Otro", value: "Otro" },
]);

const userBirthDate = ref<Date | null>(null);

const userNationality = ref<{ name: string; code: string } | null>(null);
const countriesList = ref([
  // América del Sur
  { name: "Ecuador", code: "EC" },
  { name: "Colombia", code: "CO" },
  { name: "Venezuela", code: "VE" },
  { name: "Perú", code: "PE" },
  { name: "Argentina", code: "AR" },
  { name: "Bolivia", code: "BO" },
  { name: "Brasil", code: "BR" },
  { name: "Chile", code: "CL" },
  { name: "Guyana", code: "GY" },
  { name: "Paraguay", code: "PY" },
  { name: "Surinam", code: "SR" },
  { name: "Uruguay", code: "UY" },
  // América del Norte
  { name: "Estados Unidos", code: "US" },
  { name: "Canadá", code: "CA" },
  { name: "México", code: "MX" },
  // América Central
  { name: "Belice", code: "BZ" },
  { name: "Costa Rica", code: "CR" },
  { name: "El Salvador", code: "SV" },
  { name: "GuainitTopicla", code: "GT" },
  { name: "Honduras", code: "HN" },
  { name: "Nicaragua", code: "NI" },
  { name: "Panamá", code: "PA" },
  // Caribe
  { name: "Antigua y Barbuda", code: "AG" },
  { name: "Bahamas", code: "BS" },
  { name: "Barbados", code: "BB" },
  { name: "Cuba", code: "CU" },
  { name: "Dominica", code: "DM" },
  { name: "República Dominicana", code: "DO" },
  { name: "Granada", code: "GD" },
  { name: "Haití", code: "HT" },
  { name: "Jamaica", code: "JM" },
  { name: "San Kitts y Nevis", code: "KN" },
  { name: "Santa Lucía", code: "LC" },
  { name: "San Vicente y las Granadinas", code: "VC" },
  { name: "Trinidad y Tobago", code: "TT" },
  // Europa (países clave)
  { name: "Reino Unido", code: "GB" },
  { name: "Alemania", code: "DE" },
  { name: "Francia", code: "FR" },
  { name: "Italia", code: "IT" },
  { name: "España", code: "ES" },
  { name: "Países Bajos", code: "NL" },
  // Asia (países clave)
  { name: "China", code: "CN" },
  { name: "India", code: "IN" },
  { name: "Japón", code: "JP" },
  { name: "Corea del Sur", code: "KR" },
  { name: "Indonesia", code: "ID" },
  { name: "Arabia Saudita", code: "SA" },
  // África (países clave)
  { name: "Egipto", code: "EG" },
  { name: "Nigeria", code: "NG" },
  { name: "Sudáfrica", code: "ZA" },
  // Oceanía
  { name: "Australia", code: "AU" },
  { name: "Nueva Zelanda", code: "NZ" },
]);

const userEthnicity = ref<{ name: string; value: string } | null>(null);
const userEthnicityOptions = ref([
  { name: "Mestizo", value: "Mestizo" },
  { name: "Afroecuatoriano", value: "Afroecuatoriano" },
  { name: "Indígena", value: "Indígena" },
  { name: "Blanco", value: "Blanco" },
  { name: "Montubio", value: "Montubio" },
  { name: "Mulato", value: "Mulato" },
  { name: "Otro", value: "Otro" },
]);

const userProvince = ref<{ name: string; code: string } | null>(null);
const userProvinceOptions = ref([
  { name: "Azuay", code: "Azuay" },
  { name: "Bolívar", code: "Bolívar" },
  { name: "Cañar", code: "Cañar" },
  { name: "Carchi", code: "Carchi" },
  { name: "Chimborazo", code: "Chimborazo" },
  { name: "Cotopaxi", code: "Cotopaxi" },
  { name: "El Oro", code: "El Oro" },
  { name: "Esmeraldas", code: "Esmeraldas" },
  { name: "Galápagos", code: "Galápagos" },
  { name: "Guayas", code: "Guayas" },
  { name: "Imbabura", code: "Imbabura" },
  { name: "Loja", code: "Loja" },
  { name: "Los Ríos", code: "Los Ríos" },
  { name: "Manabí", code: "Manabí" },
  { name: "Morona Santiago", code: "Morona Santiago" },
  { name: "Napo", code: "Napo" },
  { name: "Orellana", code: "Orellana" },
  { name: "Pastaza", code: "Pastaza" },
  { name: "Pichincha", code: "Pichincha" },
  { name: "Santa Elena", code: "Santa Elena" },
  {
    name: "Santo Domingo de los Tsáchilas",
    code: "Santo Domingo de los Tsáchilas",
  },
  { name: "Sucumbíos", code: "Sucumbíos" },
  { name: "Tungurahua", code: "Tungurahua" },
  { name: "Zamora Chinchipe", code: "Zamora Chinchipe" },
]);

const userCity = ref<{ name: string; code: string } | null>(null);
const userCityOptions = ref([
  { name: "Quito", code: "Quito" },
  { name: "Guayaquil", code: "Guayaquil" },
  { name: "Cuenca", code: "Cuenca" },
  { name: "Machala", code: "Machala" },
  { name: "Loja", code: "Loja" },
  { name: "Ambato", code: "Ambato" },
  { name: "Esmeraldas", code: "Esmeraldas" },
  { name: "Manta", code: "Manta" },
  { name: "Portoviejo", code: "Portoviejo" },
  { name: "Ibarra", code: "Ibarra" },
  { name: "Santo Domingo", code: "Santo Domingo" },
  { name: "Latacunga", code: "Latacunga" },
  { name: "Tulcán", code: "Tulcán" },
  { name: "Riobamba", code: "Riobamba" },
  { name: "Babahoyo", code: "Babahoyo" },
  { name: "Milagro", code: "Milagro" },
  { name: "Quevedo", code: "Quevedo" },
  { name: "Salinas", code: "Salinas" },
  { name: "Santa Elena", code: "Santa Elena" },
  { name: "Zamora", code: "Zamora" },
  { name: "Macas", code: "Macas" },
  { name: "Puyo", code: "Puyo" },
  { name: "Tena", code: "Tena" },
  { name: "Guaranda", code: "Guaranda" },
  { name: "Azogues", code: "Azogues" },
  { name: "Cayambe", code: "Cayambe" },
  { name: "La Concordia", code: "La Concordia" },
  { name: "La Libertad", code: "La Libertad" },
  { name: "Lago Agrio", code: "Lago Agrio" },
  { name: "Nueva Loja", code: "Nueva Loja" },
  { name: "Puerto Baquerizo Moreno", code: "Puerto Baquerizo Moreno" },
  {
    name: "Puerto Francisco de Orellana",
    code: "Puerto Francisco de Orellana",
  },
  { name: "Puerto Villamil", code: "Puerto Villamil" },
  { name: "San Cristóbal", code: "San Cristóbal" },
  { name: "Santa Cruz", code: "Santa Cruz" },
  { name: "Tulcán", code: "Tulcán" },
]);

//DATOS DE CONTACTO Y CONTACTO DE REFERENCIA
const userPhone = ref("");
const userEmail = ref("");
const userAddress = ref("");
const userSector = ref("");

const userZone = ref<{ name: string; code: string } | null>(null);
const userZoneOptions = ref([
  { name: "Urbana", code: "Urbana" },
  { name: "Rural", code: "Rural" },
]);

const userReferenceRelationship = ref("");
const userReferenceName = ref("");
const userReferencePhone = ref("");

//DATOS DEMOGRÁFICOS

const userSocialBenefit = ref(false);
const userEconomicDependece = ref(false);

const userAcademicInstruction = ref<{ name: string; code: string } | null>(
  null
);
const userAcademicInstructionOptions = ref([
  { name: "Primaria", code: "Primaria" },
  { name: "Secundaria", code: "Secundaria" },
  { name: "Superior", code: "Superior" },
]);

const userProfession = ref<{ name: string; code: string } | null>(null);
const userProfessionOptions = ref([
  { name: "Empleado", code: "Empleado" },
  { name: "Desempleado", code: "Desempleado" },
  { name: "Estudiante", code: "Estudiante" },
  { name: "Otro", code: "Otro" },
]);

const userMaritalStatus = ref<{ name: string; code: string } | null>(null);
const userMaritalStatusOptions = ref([
  { name: "Soltero/a", code: "Soltero/a" },
  { name: "Casado/a", code: "Casado/a" },
  { name: "Divorciado/a", code: "Divorciado/a" },
  { name: "Viudo/a", code: "Viudo/a" },
]);

const userDependents = ref<number | null>(null);

const userIncomeLevel = ref<{ name: string; code: string } | null>(null);
const userIncomeLevelOptions = ref([
  { name: "1 SBU", code: "1 SBU" },
  { name: "2 SBU", code: "2 SBU" },
  { name: "3 SBU", code: "3 SBU" },
]);

const userFamilyIncome = ref<{ name: string; code: string } | null>(null);
const userFamilyIncomeOptions = ref([
  { name: "1 SBU", code: "1 SBU" },
  { name: "2 SBU", code: "2 SBU" },
  { name: "3 SBU", code: "3 SBU" },
]);

const userFamilyGroup = ref<{ name: string; code: string }[]>([]);
const userFamilyGroupOptions = ref([
  { name: "Grupo 1", code: "Grupo1" },
  { name: "Grupo 2", code: "Grupo2" },
  { name: "Grupo 3", code: "Grupo3" },
]);

const userEconomicActivePeople = ref<number | null>(null);

//DATOS SOCIOECONÓMICOS Y DE SALUD

const userOwnAssets = ref<{ name: string; code: string }[]>([]);
const userOwnAssetsOptions = ref([
  { name: "Vivienda", code: "Vivienda" },
  { name: "Vehículo", code: "Vehículo" },
  { name: "Negocio", code: "Negocio" },
  { name: "Otro", code: "Otro" },
]);

const userHousingType = ref<{ name: string; code: string } | null>(null);
const userHousingTypeOptions = ref([
  { name: "Propia", code: "Propia" },
  { name: "Alquilada", code: "Alquilada" },
  { name: "Prestada", code: "Prestada" },
  { name: "Otra", code: "Otra" },
]);

const userPensioner = ref<{ name: string; code: string } | null>(null);
const userPensionerOptions = ref([
  { name: "IESS", code: "IESS" },
  { name: "No", code: "No" },
]);

const userHealthInsurance = ref<{ name: string; code: string } | null>(null);
const userHealthInsuranceOptions = ref([
  { name: "IESS", code: "IESS" },
  { name: "ISSFA", code: "ISSFA" },
  { name: "ISSPOL", code: "ISSPOL" },
  { name: "Seguro Privado", code: "Seguro Privado" },
  { name: "Ninguno", code: "Ninguno" },
]);

const userVulnerableSituation = ref<{ name: string; code: string } | null>(
  null
);
const userVulnerableSituationOptions = ref([
  { name: "Desempleo", code: "Desempleo" },
  { name: "Discapacidad", code: "Discapacidad" },
  { name: "Enfermedad", code: "Enfermedad" },
  { name: "Violencia", code: "Violencia" },
  { name: "Otro", code: "Otro" },
]);

const userSupportingDocuments = ref<{ name: string; code: string } | null>(
  null
);
const userSupportingDocumentsOptions = ref([
  { name: "Cédula", code: "Cédula" },
  { name: "Pasaporte", code: "Pasaporte" },
  { name: "Visa", code: "Visa" },
  { name: "Carné de Refugiado", code: "Carné de Refugiado" },
  { name: "Carné de Discapacidad", code: "Carné de Discapacidad" },
  { name: "Carné de Conadis", code: "Carné de Conadis" },
  { name: "Carné de Salud", code: "Carné de Salud" },
  { name: "Carné de Vacunación", code: "Carné de Vacunación" },
  { name: "Carné de Seguro Social", code: "Carné de Seguro Social" },
  { name: "Carné de Seguro Privado", code: "Carné de Seguro Privado" },
  { name: "Carné de Seguro de Vida", code: "Carné de Seguro de Vida" },
  { name: "Carné de Seguro de Salud", code: "Carné de Seguro de Salud" },
  {
    name: "Carné de Seguro de Accidentes",
    code: "Carné de Seguro de Accidentes",
  },
  {
    name: "Carné de Seguro de Desempleo",
    code: "Carné de Seguro de Desempleo",
  },
  {
    name: "Carné de Seguro de Enfermedad",
    code: "Carné de Seguro de Enfermedad",
  },
  {
    name: "Carné de Seguro de Violencia",
    code: "Carné de Seguro de Violencia",
  },
  { name: "Carné de Seguro de Otro", code: "Carné de Seguro de Otro" },
]);

const userDisability = ref<{ name: string; code: string } | null>(null);
const userDisabilityOptions = ref([
  { name: "Física", code: "Física" },
  { name: "Visual", code: "Visual" },
  { name: "Auditiva", code: "Auditiva" },
  { name: "Intelectual", code: "Intelectual" },
  { name: "Mental", code: "Mental" },
  { name: "No", code: "No" },
]);
const userDisabilityPercentage = ref<number>(0);

const userCatastrophicIllness = ref<{ name: string; code: string } | null>(
  null
);
const userCatastrophicIllnessOptions = ref([
  { name: "Cáncer", code: "Cáncer" },
  { name: "Diabetes", code: "Diabetes" },
  { name: "Hipertensión", code: "Hipertensión" },
  { name: "VIH/SIDA", code: "VIH/SIDA" },
  { name: "Otro", code: "Otro" },
  { name: "No", code: "No" },
]);

const userHealthDocuments = ref<File | null>(null);

//-------------------------------------------------------------------------------------------------------------//
//VARIABLES DE LA FICHA DE ASESORÍA

const initCode = ref("");
const internalID = authStore.user?.id;

const initStatusOptions = ref([
  { name: "Activo", code: "Activo" },
  { name: "Archivado", code: "Archivado" },
  { name: "Finalizado", code: "Finalizado" },
]);
const initStatus = ref<{ name: string; code: string } | null>(
  initStatusOptions.value[0]
); // "Activo" por defecto

const initOffice = ref('Consultorio Jurídico "PUCE", Sede Quito');

const initDate = ref(new Date(date));
const initEndDate = ref<Date | null>(null);

const initClientType = ref<{ name: string; code: string } | null>(null);
const initClientTypeOptions = ref([
  { name: "Interno", code: "Interno" },
  { name: "Externo", code: "Externo" },
]);

const initSubject = ref<{ name: string; code: string } | null>(null);
const initSubjectOptions = ref([
  { name: "Civil", code: "Civil" },
  { name: "Penal", code: "Penal" },
  {
    name: "Familia, Niñez y Adolescencia",
    code: "Familia, Niñez y Adolescencia",
  },
  { name: "Movilidad Humana", code: "Movilidad Humana" },
  { name: "Trabajo Social", code: "Trabajo Social" },
]);

const initTopic = ref<{ name: string; code: string } | null>(null);
const initTopicOptions = ref([
  { name: "Tema 1", code: "Tema 1" },
  { name: "Tema 2", code: "Tema 2" },
]);

const initService = ref<{ name: string; code: string } | null>(null);
const initServiceOptions = ref([
  { name: "Asesorias", code: "Asesorias" },
  { name: "Patrocinio", code: "Patrocinio" },
]);

const initLawyer = ref<{ name: string; code: string } | null>(null);
const initLawyerOptions = ref([
  { name: "Abogado 1", code: "Abogado 1" },
  { name: "Abogado 2", code: "Abogado 2" },
]);

const initReferral = ref<{ name: string; code: string } | null>(null);
const initReferralOptions = ref([
  { name: "Camila Cedeño", code: "Camila Cedeño" },
  { name: "Daniela Oña", code: "Daniela Oña" },
]);

const initNotes = ref("");

const initComplexity = ref<{ name: string; code: string } | null>(null);
const initComplexityOptions = ref([
  { name: "Bajo", code: "Bajo" },
  { name: "Medio", code: "Medio" },
  { name: "Alto", code: "Alto" },
]);

const initType = ref("Nuevo");

const initSocialWork = ref<boolean>(false);

//-------------------------------------------------------------------------------------------------------------//

//MANEJO DE USUARIOS EXTERNOS
const areInputsDisabled = ref(true);
const doesUserExist = ref(false);
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
  if (!newHasDisability || userDisability.value?.code === "No") {
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
  userSector.value = "";
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

  // Deshabilitar los campos
  areInputsDisabled.value = true;
  userHasDisability.value = false;
  userHasAnyIllness.value = false;
  doesUserExist.value = false;
  doesConsultationExist.value = false;
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
  initStatus.value = initStatusOptions.value[0];
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
    userProvinceOptions.value.forEach((option) => {
      if (option.name === selectedUser.value.User_Province) {
        userProvince.value = option;
      }
    });
    userCityOptions.value.forEach((option) => {
      if (option.name === selectedUser.value.User_City) {
        userCity.value = option;
      }
    });

    //CONTACTO Y CONTACTO DE REFERENCIA
    userPhone.value = selectedUser.value.User_Phone;
    userEmail.value = selectedUser.value.User_Email;
    userAddress.value = selectedUser.value.User_Address;
    userSector.value = selectedUser.value.User_Sector;
    userZoneOptions.value.forEach((option) => {
      if (option.code === selectedUser.value.User_Zone) {
        userZone.value = option;
      }
    });
    userReferenceRelationship.value =
      selectedUser.value.User_ReferenceRelationship;
    userReferenceName.value = selectedUser.value.User_ReferenceName;
    userReferencePhone.value = selectedUser.value.User_ReferencePhone;

    //DATOS DEMOGRÁFICOS
    userSocialBenefit.value = selectedUser.value.User_SocialBenefit;
    userEconomicDependece.value = selectedUser.value.User_EconomicDependence;

    userAcademicInstructionOptions.value.forEach((option) => {
      if (option.code === selectedUser.value.User_Academic_Instruction) {
        userAcademicInstruction.value = option;
      }
    });
    userProfessionOptions.value.forEach((option) => {
      if (option.code === selectedUser.value.User_Profession) {
        userProfession.value = option;
      }
    });
    userMaritalStatusOptions.value.forEach((option) => {
      if (option.code === selectedUser.value.User_MaritalStatus) {
        userMaritalStatus.value = option;
      }
    });
    userDependents.value = selectedUser.value.User_Dependents;
    userIncomeLevelOptions.value.forEach((option) => {
      if (option.code === selectedUser.value.User_IncomeLevel) {
        userIncomeLevel.value = option;
      }
    });
    userFamilyIncomeOptions.value.forEach((option) => {
      if (option.code === selectedUser.value.User_FamilyIncome) {
        userFamilyIncome.value = option;
      }
    });

    userFamilyGroup.value = userFamilyGroupOptions.value.filter((option) =>
      selectedUser.value.User_FamilyGroup.includes(option.code)
    );

    userEconomicActivePeople.value =
      selectedUser.value.User_EconomicActivePeople;

    //DATOS SOCIOECONÓMICOS Y DE SALUD
    userOwnAssets.value = userOwnAssetsOptions.value.filter((option) =>
      selectedUser.value.User_OwnAssets.includes(option.code)
    );
    userHousingTypeOptions.value.forEach((option) => {
      if (option.code === selectedUser.value.User_HousingType) {
        userHousingType.value = option;
      }
    });
    userPensionerOptions.value.forEach((option) => {
      if (option.code === selectedUser.value.User_Pensioner) {
        userPensioner.value = option;
      }
    });
    userHealthInsuranceOptions.value.forEach((option) => {
      if (option.code === selectedUser.value.User_HealthInsurance) {
        userHealthInsurance.value = option;
      }
    });
    userVulnerableSituationOptions.value.forEach((option) => {
      if (option.code === selectedUser.value.User_VulnerableSituation) {
        userVulnerableSituation.value = option;
      }
    });
    userSupportingDocumentsOptions.value.forEach((option) => {
      if (option.code === selectedUser.value.User_SupportingDocuments) {
        userSupportingDocuments.value = option;
      }
    });
    userDisabilityOptions.value.forEach((option) => {
      if (option.code === selectedUser.value.User_Disability) {
        userDisability.value = option;
      }
    });
    userDisabilityPercentage.value =
      selectedUser.value.User_DisabilityPercentage;
    userCatastrophicIllnessOptions.value.forEach((option) => {
      if (option.code === selectedUser.value.User_CatastrophicIllness) {
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

const updateFormWithConsultation = (data: Initial_Consultation): void => {
  if (!data) return;
  initCode.value = data.Init_Code;
  initStatus.value =
    initStatusOptions.value.find(
      (option) => option.code === String(data.Init_Status)
    ) || null;
  initOffice.value = data.Init_Office;
  initDate.value = new Date(data.Init_Date);
  if (data.Init_EndDate) {
    initEndDate.value = new Date(data.Init_EndDate);
  }
  initClientType.value =
    initClientTypeOptions.value.find(
      (option) => option.code === data.Init_ClientType
    ) || null;
  initSubject.value =
    initSubjectOptions.value.find(
      (option) => option.code === data.Init_Subject
    ) || null;
  initTopic.value =
    initTopicOptions.value.find((option) => option.code === data.Init_Topic) ||
    null;
  initService.value =
    initServiceOptions.value.find(
      (option) => option.code === data.Init_Service
    ) || null;

  initComplexity.value =
    initComplexityOptions.value.find(
      (option) => option.code === data.Init_Complexity
    ) || null;

  initLawyer.value =
    initLawyerOptions.value.find(
      (option) => option.code === data.Init_Lawyer
    ) || null;
  initNotes.value = data.Init_Notes;

  initReferral.value =
    initReferralOptions.value.find(
      (option) => option.code === data.Init_Referral
    ) || null;
  initSocialWork.value = data.Init_SocialWork;
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

const first = ref(0); // Página actual

watch(first, (newFirst) => {
  if (isResettingConsultation.value) return; // Si se está reiniciando, no hacer nada
  if (consultations.value[newFirst]) {
    updateFormWithConsultation(consultations.value[newFirst]);
  } else {
    restartConsultationForm();
  }
});

const doesConsultationExist = ref<boolean>(false);

// const createInitialConsultation = async () => {
//   // Validar que existan algunos campos obligatorios (por ejemplo, código de consulta y User_ID)
//   if (!userID.value) {
//     toast.add({
//       severity: "error",
//       summary: "Error",
//       detail: "Faltan datos obligatorios para crear la consulta inicial.",
//       life: 4000,
//     });
//     return;
//   }

//   const formData = new FormData();

//   // Construir el objeto que agrupa los datos de ambas tablas
//   const consultationData = {

//     User_ID: userID.value,
//     User_ID_Type: userIDType.value?.value || "",
//     User_Age: userAge.value || "",
//     User_Academic_Instruction: userAcademicInstruction.value?.code || "",
//     User_FirstName: userFirstName.value || "",
//     User_LastName: userLastName.value || "",
//     User_Gender: userGender.value?.value || "",
//     User_BirthDate: userBirthDate.value
//       ? userBirthDate.value.toISOString().split("T")[0]
//       : "",
//     User_Nationality: userNationality.value?.name || "",
//     User_Ethnicity: userEthnicity.value?.value || "",
//     User_Province: userProvince.value?.name || "",
//     User_City: userCity.value?.name || "",
//     //DATOS DE CONTACTO Y CONTACTO DE REFERENCIA
//     User_Phone: userPhone.value.replace(/\D/g, "") || "",
//     User_Email: userEmail.value || "",
//     User_Address: userAddress.value || "",
//     User_Sector: userSector.value || "",
//     User_Zone: userZone.value?.code || "",
//     User_ReferenceRelationship: userReferenceRelationship.value || "",
//     User_ReferenceName: userReferenceName.value || "",
//     User_ReferencePhone: userReferencePhone.value.replace(/\D/g, "") || "",
//     //DATOS DEMOGRÁFICOS
//     User_SocialBenefit: userSocialBenefit.value,
//     User_EconomicDependence: userEconomicDependece.value,
//     User_AcademicInstruction: userAcademicInstruction.value?.code || "",
//     User_Profession: userProfession.value?.code || "",
//     User_MaritalStatus: userMaritalStatus.value?.code || "",
//     User_Dependents: userDependents.value !== null ? userDependents.value : 0,
//     User_IncomeLevel: userIncomeLevel.value?.code || "",
//     User_FamilyIncome: userFamilyIncome.value?.code || "",
//     User_FamilyGroup: userFamilyGroup.value.map((group) => group.code),
//     User_EconomicActivePeople:
//       userEconomicActivePeople.value !== null
//         ? userEconomicActivePeople.value
//         : 0,
//     //DATOS SOCIOECONÓMICOS Y DE SALUD
//     User_OwnAssets: userOwnAssets.value.map((asset) => asset.code),
//     User_HousingType: userHousingType.value?.code || "",
//     User_Pensioner: userPensioner.value?.code || "",
//     User_HealthInsurance: userHealthInsurance.value?.code || "",
//     User_VulnerableSituation: userVulnerableSituation.value?.code || "",
//     User_SupportingDocuments: userSupportingDocuments.value?.code || "",
//     User_Disability: userDisability.value?.code || "Ninguna",
//     User_DisabilityPercentage: userDisabilityPercentage.value || 0,
//     User_CatastrophicIllness: userCatastrophicIllness.value?.code || "Ninguna",

//     // Datos de la consulta inicial (Initial_Consultations)
//     //Init_Code: No se envia nada porque el backend lo genera automáticamente
//     Internal_ID: internalID,
//     Init_SocialWork: initSocialWork.value,
//     Init_Status: initStatus.value?.code,
//     Init_Office: initOffice.value,
//     Init_Date: initDate.value
//       ? initDate.value.toISOString().split("T")[0]
//       : null,
//     Init_FinishDate: initEndDate.value
//       ? initEndDate.value.toISOString().split("T")[0]
//       : null,
//     Init_ClientType: initClientType.value?.code,
//     Init_Subject: initSubject.value?.code,
//     Init_Topic: initTopic.value?.code,
//     Init_Service: initService.value?.code,
//     Init_Complexity: initComplexity.value?.code || null,
//     Init_Lawyer: initLawyer.value?.code,
//     Init_Referral: initReferral.value?.code,
//     Init_Notes: initNotes.value || "",
//     Init_Type: "Por Revisar",
//   };

//   console.log("Datos enviados:", JSON.stringify(consultationData, null, 2));

//   try {
//     await axios.post(`${API}/initial-consultations`, consultationData, {
//       headers: {
//         "internal-id": authStore.user?.id,
//       },
//     });

//     toast.add({
//       severity: "info",
//       summary: "Consulta Inicial Creada",
//       detail: "La consulta inicial ha sido creada con éxito.",
//       life: 4000,
//     });

//     restartUserForm();
//   } catch (error: any) {
//     toast.add({
//       severity: "error",
//       summary: "Error",
//       detail: "No se pudo crear la consulta inicial",
//       life: 4000,
//     });
//   }
// };

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
  formData.append(
    "User_Academic_Instruction",
    userAcademicInstruction.value?.code || ""
  );
  formData.append("User_FirstName", userFirstName.value || "");
  formData.append("User_LastName", userLastName.value || "");
  formData.append("User_Gender", userGender.value?.value || "");
  formData.append(
    "User_BirthDate",
    userBirthDate.value ? userBirthDate.value.toISOString().split("T")[0] : ""
  );
  formData.append("User_Nationality", userNationality.value?.name || "");
  formData.append("User_Ethnicity", userEthnicity.value?.value || "");
  formData.append("User_Province", userProvince.value?.name || "");
  formData.append("User_City", userCity.value?.name || "");
  formData.append("User_Phone", userPhone.value.replace(/\D/g, "") || "");
  formData.append("User_Email", userEmail.value || "");
  formData.append("User_Address", userAddress.value || "");
  formData.append("User_Sector", userSector.value || "");
  formData.append("User_Zone", userZone.value?.code || "");
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
    userAcademicInstruction.value?.code || ""
  );
  formData.append("User_Profession", userProfession.value?.code || "");
  formData.append("User_MaritalStatus", userMaritalStatus.value?.code || "");
  formData.append(
    "User_Dependents",
    userDependents.value !== null ? userDependents.value.toString() : "0"
  );
  formData.append("User_IncomeLevel", userIncomeLevel.value?.code || "");
  formData.append("User_FamilyIncome", userFamilyIncome.value?.code || "");
  // Se envían los grupos familiares como un string JSON
  formData.append(
    "User_FamilyGroup",
    JSON.stringify(userFamilyGroup.value.map((g) => g.code))
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
    JSON.stringify(userOwnAssets.value.map((a) => a.code))
  );
  formData.append("User_HousingType", userHousingType.value?.code || "");
  formData.append("User_Pensioner", userPensioner.value?.code || "");
  formData.append(
    "User_HealthInsurance",
    userHealthInsurance.value?.code || ""
  );
  formData.append(
    "User_VulnerableSituation",
    userVulnerableSituation.value?.code || ""
  );
  formData.append(
    "User_SupportingDocuments",
    userSupportingDocuments.value?.code || ""
  );
  formData.append("User_Disability", userDisability.value?.code || "Ninguna");
  formData.append(
    "User_DisabilityPercentage",
    userDisabilityPercentage.value.toString()
  );
  formData.append(
    "User_CatastrophicIllness",
    userCatastrophicIllness.value?.code || "Ninguna"
  );

  // Agregar el archivo (documento de salud)
  // Agregar el archivo de documento de salud
  if (userHealthDocuments.value) {
    formData.append("healthDocuments", userHealthDocuments.value);
  } else {
    formData.append("healthDocuments", "");
  }

  // Datos de la consulta inicial (Initial_Consultations)
  formData.append("Internal_ID", internalID || "");
  formData.append("Init_SocialWork", initSocialWork.value.toString());
  formData.append("Init_Status", initStatus.value?.code || "");
  formData.append("Init_Office", initOffice.value);
  formData.append(
    "Init_Date",
    initDate.value ? initDate.value.toISOString().split("T")[0] : ""
  );
  formData.append(
    "Init_FinishDate",
    initEndDate.value ? initEndDate.value.toISOString().split("T")[0] : ""
  );
  formData.append("Init_ClientType", initClientType.value?.code || "");
  formData.append("Init_Subject", initSubject.value?.code || "");
  formData.append("Init_Topic", initTopic.value?.code || "");
  formData.append("Init_Service", initService.value?.code || "");
  formData.append("Init_Complexity", initComplexity.value?.code || "");
  formData.append("Init_Lawyer", initLawyer.value?.code || "");
  formData.append("Init_Referral", initReferral.value?.code || "");
  formData.append("Init_Notes", initNotes.value || "");
  formData.append("Init_Type", "Por Revisar");

  console.log("Datos enviados:", formData);

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
  restartConsultationForm();
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
    Internal_ID: internalID,
    Init_ClientType: initClientType.value?.code,
    Init_Subject: initSubject.value?.code,
    Init_Lawyer: initLawyer.value?.code,
    Init_Date: initDate.value ? initDate.value.toISOString().split("T")[0] : "",
    Init_Office: initOffice.value,
    Init_Topic: initTopic.value?.code,
    Init_Service: initService.value?.code,
    Init_Referral: initReferral.value?.code,
    Init_Status: initStatus.value?.code,
    Init_Notes: initNotes.value || "",
    Init_Complexity: initComplexity.value?.code || "",
    Init_Type: "Nuevo",
    Init_SocialWork: initSocialWork.value,
    User_ID: userID.value,
  };

  console.log("Datos enviados:", JSON.stringify(consultationData, null, 2));

  try {
    await axios.post(`${API}/initial-consultations`, consultationData, {
      headers: {
        "internal-id": authStore.user?.id,
      },
    });

    toast.add({
      severity: "info",
      summary: "Ficha Creada",
      detail: "La nueva ficha ha sido creada con éxito.",
      life: 4000,
    });
    newConsultationButtonDisabled.value = true;
    doesUserRequestOp.value = false;
    isSaveButtonDisabled.value = false;
    isEditButtonDisabled.value = false;
    isDeleteButtonDisabled.value = false;
    isExportButtonDisabled.value = false;
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
    Init_ClientType: initClientType.value?.code,
    Init_Subject: initSubject.value?.code,
    Init_Lawyer: initLawyer.value?.code,
    Init_Date: initDate.value ? initDate.value.toISOString().split("T")[0] : "",
    Init_EndDate: initEndDate.value
      ? initEndDate.value.toISOString().split("T")[0]
      : null,
    Init_Office: initOffice.value,
    Init_Topic: initTopic.value?.code,
    Init_Service: initService.value?.code,
    Init_Referral: initReferral.value?.code,
    Init_Status: initStatus.value?.code,
    Init_Notes: initNotes.value || "",
    Init_Complexity: initComplexity.value?.code || "",
    Init_Type: "Nuevo",
    Init_SocialWork: initSocialWork.value,
    User_ID: userID.value,
  };

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
    restartConsultationForm();
    await fetchConsultations();
    // Buscar el índice de la ficha editada y mantener el paginador en esa posición
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
    User_Province: userProvince.value?.name || originalUser.User_Province,
    User_City: userCity.value?.name || originalUser.User_City,

    //DATOS DE CONTACTO Y CONTACTO DE REFERENCIA
    User_Phone: userPhone.value.replace(/\D/g, "") || originalUser.User_Phone,
    User_Email: userEmail.value || originalUser.User_Email,
    User_Address: userAddress.value || originalUser.User_Address,
    User_Sector: userSector.value || originalUser.User_Sector,
    User_Zone: userZone.value?.code || originalUser.User_Zone,
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
    User_Academic_Instruction:
      userAcademicInstruction.value?.code ||
      originalUser.User_Academic_Instruction,
    User_Profession: userProfession.value?.code || originalUser.User_Profession,
    User_MaritalStatus:
      userMaritalStatus.value?.code || originalUser.User_MaritalStatus,
    User_Dependents:
      userDependents.value !== null
        ? userDependents.value
        : originalUser.User_Dependents,
    User_IncomeLevel:
      userIncomeLevel.value?.code || originalUser.User_IncomeLevel,
    User_FamilyIncome:
      userFamilyIncome.value?.code || originalUser.User_FamilyIncome,
    User_FamilyGroup: userFamilyGroup.value.map((option) => option.code),
    User_EconomicActivePeople:
      userEconomicActivePeople.value !== null
        ? userEconomicActivePeople.value
        : originalUser.User_EconomicActivePeople,

    //DATOS SOCIOECONÓMICOS Y DE SALUD
    User_OwnAssets: userOwnAssets.value.map((option) => option.code),
    User_HousingType:
      userHousingType.value?.code || originalUser.User_HousingType,
    User_Pensioner: userPensioner.value?.code || originalUser.User_Pensioner,
    User_HealthInsurance:
      userHealthInsurance.value?.code || originalUser.User_HealthInsurance,
    User_VulnerableSituation:
      userVulnerableSituation.value?.code ||
      originalUser.User_VulnerableSituation,
    User_SupportingDocuments:
      userSupportingDocuments.value?.code ||
      originalUser.User_SupportingDocuments,
    User_Disability: userDisability.value?.code || originalUser.User_Disability,
    User_DisabilityPercentage:
      userDisabilityPercentage.value || originalUser.User_DisabilityPercentage,
    User_CatastrophicIllness:
      userCatastrophicIllness.value?.code ||
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
</script>

<template>
  <!--MENU-->
  <Toast />
  <ConfirmPopup></ConfirmPopup>
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
                    :alt="slotProps.value.label"
                    src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png"
                    :class="`mr-2 flag flag-${slotProps.value.code.toLowerCase()}`"
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
              <InputText
                id="userSector"
                v-model="userSector"
                size="large"
                class="w-full md:w-48"
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
                :disabled="areInputsDisabled"
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
              :disabled="areInputsDisabled"
            />
            <label for="userIncomeLevel">Nivel de ingresos</label>
          </FloatLabel>

          <!-- Ingresos Familiares -->
          <FloatLabel variant="on" class="w-full">
            <Select
              v-model="userFamilyIncome"
              inputId="userIncomeLevel"
              :options="userIncomeLevelOptions"
              size="large"
              optionLabel="name"
              class="w-full"
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

          <div
            class="flex items-center gap-2 justify-end min-h-[60px] -mt-8 mr-6"
          >
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
            <!-- <div class="flex gap-1">
              <Button
                icon="pi pi-plus"
                @click="userDisabilityPercentage++"
                :disabled="userDisabilityPercentage >= 100"
                style="width: 24px; height: 24px; font-size: 12px;"
              />
              <Button
                icon="pi pi-minus"
                @click="userDisabilityPercentage--"
                :disabled="userDisabilityPercentage <= 0"
                style="width: 24px; height: 24px; font-size: 12px;"
              />
            </div> -->
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
                  :disabled="areInputsDisabled"
                />
                <label for="userCatastrophicIllness"
                  >Enfermedad Catastrófica</label
                >
              </FloatLabel>
            </div>
          </transition>

          <!-- Documentos de respaldo (Discapacidad/Enfermedad) -->

          <!-- Usando v-show para evitar la destrucción del diálogo -->
          <!-- <Dialog
  v-model:visible="evidenceDialog"
  modal
  header="Documento de respaldo"
  :style="{ width: '30rem' }"
>
  <div class="p-6">
    <div class="grid grid-cols-1 gap-6 mb-20">
      <FileUpload
        name="file"
        accept=".pdf"
        :multiple="false"
        :maxFileSize="5000000"
        class="w-full:md:w-70"
        @select="onUploadDocument"
        :autoClear="false"  
      >
        <template #empty>
          <span>Arrastra los archivos aquí para subirlos.</span>
        </template>
      </FileUpload>
    </div>
  </div>
  <div class="flex justify-end p-4 rounded-b-lg">
    <Button
      type="button"
      icon="pi pi-times"
      label="Cancelar"
      severity="secondary"
      class="mr-3"
      @click="cancelUpload()"
    />
    <Button
      type="button"
      icon="pi pi-check"
      label="Guardar"
      class="bg-blue-600 hover:bg-blue-700 text-white"
      @click="onSaveDocument()"
    />
  </div>
</Dialog> -->


<!-- Diálogo para cargar el documento de respaldo -->
<Dialog
    v-model:visible="evidenceDialog"
    modal
    header="Documento de respaldo"
    :style="{ width: '30rem' }"
  >
    <div class="p-6">
      <div class="grid grid-cols-1 gap-6 mb-20">
        <FileUpload
          name="file"
          accept=".pdf"
          :multiple="false"
          :maxFileSize="5000000"
          class="w-full md:w-70"
          @select="onUploadDocument"
          :autoClear="false"
        >
          <!-- Template para cuando no hay archivo pendiente -->
          <template #empty>
            <div class="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded">
              <i class="pi pi-file-pdf text-6xl text-red-600"></i>
              <span class="mt-4 text-lg font-semibold">Arrastra el archivo PDF aquí</span>
            </div>
          </template>
          <!-- Contenido personalizado: vista previa del archivo pendiente o ya guardado -->
          <template #content="{ files, removeFileCallback }">
            <!-- Si hay archivo pendiente de subir -->
            <div v-if="files.length > 0" class="flex flex-col items-center">
              <div class="w-24 h-24 flex items-center justify-center border border-dashed border-gray-300 rounded">
                <i class="pi pi-file-pdf text-5xl text-red-600"></i>
              </div>
              <p class="mt-2 font-semibold">{{ files[0].name }}</p>
              <Button
                icon="pi pi-times"
                label="Eliminar"
                class="p-button-danger mt-2"
                @click="removeFile(removeFileCallback)"
              />
            </div>
            <!-- Si no hay archivo pendiente pero ya se guardó uno previamente -->
            <div v-else-if="userHealthDocuments" class="flex flex-col items-center">
              <div class="w-24 h-24 flex items-center justify-center border border-dashed border-gray-300 rounded">
                <i class="pi pi-file-pdf text-5xl text-red-600"></i>
              </div>
              <p class="mt-2 font-semibold">{{ userHealthDocuments.name }}</p>
              <Button
                icon="pi pi-times"
                label="Quitar y reemplazar"
                class="p-button-danger mt-2"
                @click="removeUploadedFile"
              />
            </div>
            <!-- Mensaje en caso de que no exista ningún archivo -->
            <div v-else class="flex items-center justify-center">
              <span>No hay archivo seleccionado</span>
            </div>
          </template>
        </FileUpload>
      </div>
    </div>
    <div class="flex justify-end p-4 rounded-b-lg">
      <Button
        type="button"
        icon="pi pi-times"
        label="Cancelar"
        severity="secondary"
        class="mr-3"
        @click="cancelUpload"
      />
      <Button
        type="button"
        icon="pi pi-check"
        label="Guardar"
        class="bg-blue-600 hover:bg-blue-700 text-white"
        @click="onSaveDocument"
      />
    </div>
  </Dialog>












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
                @click="evidenceDialog = true"
                label="Documento de respaldo"
                icon="pi pi-file-pdf"
                severity="contrast"
                class="w-full md:w-70 md:h-12"
                :disabled="areInputsDisabled"
              />

              <!-- Dialog para visualizar el documento PDF -->
              <Dialog
                v-model:visible="visibleDocumentoDialog"
                modal
                header="Documento de la Actividad"
                class="p-6 rounded-lg shadow-lg bg-white max-w-7xl w-full"
              >
                <iframe
                  :src="documentoUrl"
                  class="w-full h-250"
                  frameborder="0"
                ></iframe>
              </Dialog>

              <Button
                @click="loadUserHealthDocument(userID)"
                label="Ver documento"
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
  <div class="card mr-4">
    <Tabs value="0">
      <TabList>
        <Tab value="0">Asesorias </Tab>
        <Tab value="1" v-if="authStore.user?.type == 'Administrador'"
          >Patrocinios</Tab
        >
        <div
          class="flex justify-between items-center w-full"
          :class="authStore.user?.type == 'Estudiante' ? 'ml-266' : 'ml-0'"
        >
          <!-- Checkbox -->
          <div
            v-if="authStore.user?.type == 'Administrador'"
            class="flex items-center gap-2 ml-165"
          >
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

          <!-- Botones alineados al final -->
          <div class="flex items-center gap-2 mr-10">
            <Button
              icon="pi pi-file-plus"
              @click="requestNewConsultation()"
              v-tooltip.bottom="'Nueva Ficha'"
              rounded
              aria-label="Nueva Ficha"
              size="large"
              :disabled="!doesUserExist || isSaveButtonDisabled"
            />
            <div v-if="authStore.user?.type !== 'Estudiante'">
              <Button
                icon="pi pi-file-edit"
                @click="requestEditConsultation()"
                v-tooltip.bottom="'Editar Ficha'"
                rounded
                aria-label="Editar Ficha"
                size="large"
                severity="info"
                :disabled="!doesUserExist || isEditButtonDisabled"
              />
            </div>
            <Button
              icon="pi pi-file-pdf"
              v-tooltip.bottom="'Exportar PDF'"
              rounded
              aria-label="Exportar PDF"
              size="large"
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
                      v-model="initStatus"
                      inputId="initStatus"
                      :options="initStatusOptions"
                      size="large"
                      optionLabel="name"
                      class="w-full"
                      :disabled="isInitStatusDisabled"
                    />
                    <label for="initStatus">Estado</label>
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
                  :disabled="areInputsDisabled"
                />
                <label for="initSubject">Área</label>
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
                      :options="initServiceOptions"
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
                  editorStyle="height: 212px"
                  :class="[
                    !doesUserRequestOp && doesUserExist
                      ? 'mouse pointer-events-none'
                      : '',
                    areInputsDisabled ? 'select-none opacity-50' : '',
                  ]"
                  :readonly="areInputsDisabled"
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
                  id="archivo"
                  name="demo[]"
                  class="h-40"
                  url="/api/upload"
                  @upload=""
                  :multiple="true"
                  accept="image/*"
                  :maxFileSize="1000000"
                  @select=""
                  @clear=""
                  :disabled="areInputsDisabled"
                >
                  <template
                    #header="{
                      chooseCallback,
                      uploadCallback,
                      clearCallback,
                      files,
                    }"
                  >
                    <div
                      class="flex flex-wrap justify-between items-center gap-4"
                    >
                      <div class="flex gap-2">
                        <Button
                          @click="chooseCallback()"
                          icon="pi pi-images"
                          rounded
                          :class="
                            !doesUserRequestOp && doesUserExist
                              ? 'mouse pointer-events-none'
                              : ''
                          "
                          outlined
                          severity="secondary"
                        ></Button>
                        <Button
                          @click=""
                          icon="pi pi-cloud-upload"
                          rounded
                          outlined
                          severity="success"
                          :disabled="!files || files.length === 0"
                        ></Button>
                        <Button
                          @click="clearCallback()"
                          icon="pi pi-times"
                          rounded
                          outlined
                          severity="danger"
                          :disabled="!files || files.length === 0"
                        ></Button>
                      </div>
                      <ProgressBar
                        :value="totalSizePercent"
                        :showValue="false"
                        class="md:w-20rem h-1 w-full md:ml-auto"
                      >
                        <span class="whitespace-nowrap"
                          >{{ totalSize }}B / 1Mb</span
                        >
                      </ProgressBar>
                    </div>
                  </template>

                  <template #empty>
                    <div class="flex items-center justify-center flex-col">
                      <i
                        class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl !text-muted-color"
                      />
                      <p class="mt-6 mb-0">
                        Arrastra y suelta los archivos aquí para subirlos.
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
          <p class="m-0">En desarrollo... 😁</p>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <div v-if="!doesUserExist" class="flex justify-center mr-25">
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
    <!-- <div v-if="!editConsultationButtonDisabled" class="flex justify-center mr-25">
        <Button label="Editar Ficha" icon="pi pi-folder-edit" @click="" />
      </div> -->
  </div>
</template>

<style scoped>
.border-b {
  border-bottom: 1px solid #e5e7eb;
}

.input-spacing > :not(:last-child) {
  margin-bottom: 4px;
}
</style>
