<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';
import { API } from "@/ApiRoute";
import { useConfirm } from 'primevue/useconfirm';
// Importamos las interfaces necesarias
import type { User } from '@/ApiRoute';
import type { Initial_Consultation } from '@/ApiRoute';

interface Caso {
  codigo: string;
  usuario: string;
}

interface ActividadCompletar {
  id: number | null;
  Evidencia: File | null;
  TipoJudicatura: string;
  ReferenciaInterna: string;
  NroJuzgado: string;
  UltimaActividad: string;
  FechaUltimaActividad: Date | null;
  Observaciones: string;
}

interface Actividad {
  Activity_ID: number;
  Activity_Type: string;
  Activity_Location: string;
  Activity_Date: string | null;
  Activity_StartTime: string;
  Activity_Status: string;
  Activity_Description: string;
}

interface ActivityType {
  Type_Of_Activity_ID: number;   
  Type_Of_Activity_Name: string; 
  Type_Of_Activity_Status: boolean; 
}

const toast = useToast();
const confirm = useConfirm();
const authStore = useAuthStore();
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const visibleFinalizarCasoDialog = ref(false); // Controla la visibilidad del diálogo
const finalizarCasoMotivo = ref(""); // Almacena el motivo seleccionado
const finalizarCasoDetalles = ref(""); // Almacena los detalles adicionales
const casoSeleccionado = ref<Caso | null>(null); // Almacena el caso que se está finalizando
const isLoadingDynamicFields = ref<boolean>(false);

const isCompletarActividadFormValid = computed(() => {
  return (
    actividadCompletar.value.Evidencia &&
    actividadCompletar.value.TipoJudicatura.trim() !== "" &&
    actividadCompletar.value.ReferenciaInterna.trim() !== "" &&
    actividadCompletar.value.NroJuzgado.trim() !== "" &&
    actividadCompletar.value.UltimaActividad.trim() !== "" &&
    actividadCompletar.value.FechaUltimaActividad !== null &&
    actividadCompletar.value.Observaciones.trim() !== ""
  );
});

const motivosFinalizacion = [
  "Informe de viabilidad Rechazado",
  "Desistimiento del usuario",
  "Cambio de abogado",
  "Abandono",
  "Negligencia",
];

const formatFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/_/g, " ") // Reemplaza guiones bajos por espacios
    .replace(/\b\w/g, (char: string) => char.toUpperCase()); // Convierte la primera letra de cada palabra a mayúscula
};

const camposVisiblesEnCard = [
  { key: 'Activity_Location', label: 'Lugar' },
  { key: 'Activity_Date', label: 'Fecha' },
  { key: 'Activity_StartTime', label: 'Hora de Inicio' },
  { key: 'Activity_Description', label: 'Descripción' }
];

const visibleCompletarActividadDialog = ref(false);
const actividadCompletar = ref<ActividadCompletar>({
  id: null, // Inicializamos la propiedad id
  Evidencia: null,
  TipoJudicatura: "",
  ReferenciaInterna: "",
  NroJuzgado: "",
  UltimaActividad: "",
  FechaUltimaActividad: null,
  Observaciones: "",
});

const abrirFinalizarCasoDialog = (caso: Caso) => {
  casoSeleccionado.value = caso;
  finalizarCasoMotivo.value = "";
  finalizarCasoDetalles.value = "";
  visibleFinalizarCasoDialog.value = true;
};

const abrirCompletarActividadDialog = (actividad: any) => {
  actividadCompletar.value = {
    id: actividad.Activity_ID || null,
    Evidencia: null,
    TipoJudicatura: actividad.Activity_JurisdictionType || "",
    ReferenciaInterna: actividad.Activity_InternalReference || "",
    NroJuzgado: actividad.Activity_CourtNumber || "",
    UltimaActividad: actividad.Activity_lastCJGActivity || "",
    FechaUltimaActividad: actividad.Activity_lastCJGActivityDate || null,
    Observaciones: actividad.Activity_Observation || "",
  };
  visibleCompletarActividadDialog.value = true;
};

const isNuevaActividadFormValid = computed(() => {
  // El botón se habilitará si se ha seleccionado un tipo de actividad
  // y los campos dinámicos han terminado de cargar.
  // La validación de si los campos están llenos se hará al intentar guardar.
  if (selectedActivityType.value === null) {
    return false;
  }
  if (isLoadingDynamicFields.value) {
    return false;
  }
  // Si se seleccionó un tipo y la carga terminó, el botón se habilita.
  // La validación detallada ocurrirá en guardarNuevaActividad.
  return true;
});


const fetchDynamicFields = async (activityTypeId: number) => {
  isLoadingDynamicFields.value = true; // Indica que los campos dinámicos están cargando
  dynamicFields.value = []; // Limpia los campos dinámicos existentes
  dynamicFieldValues.value = {}; // Limpia los valores de los campos dinámicos existentes

  try {
    console.log(`[FETCH_DYNAMIC_FIELDS] Cargando campos dinámicos para el tipo de actividad ID: ${activityTypeId}`);

    // Realiza la solicitud a la API para obtener los campos dinámicos
    const response = await axios.get(`${API}/field-of-activity/type/${activityTypeId}/status`);
    if (response.data && Array.isArray(response.data)) {
      dynamicFields.value = response.data;

      // Inicializa los valores de los campos dinámicos
      const newFieldValues: Record<string, any> = {};
      response.data.forEach((field: any) => {
        newFieldValues[field.Field_Of_Activity_Name] = ""; // Inicializa con una cadena vacía
      });
      dynamicFieldValues.value = newFieldValues;

      console.log("[FETCH_DYNAMIC_FIELDS] Campos dinámicos cargados correctamente:", dynamicFields.value);
    } else {
      console.warn("[FETCH_DYNAMIC_FIELDS] La respuesta de la API no contiene un array válido:", response.data);
      dynamicFields.value = [];
      dynamicFieldValues.value = {};
    }
  } catch (error) {
    console.error("[FETCH_DYNAMIC_FIELDS] Error al obtener los campos dinámicos:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudieron cargar los campos dinámicos.",
      life: 3000,
    });
  } finally {
    isLoadingDynamicFields.value = false; // Indica que la carga ha finalizado
  }
};

const isDynamicFieldsValid = computed(() => {
  // Verifica que todos los campos requeridos tengan un valor válido
  const isValid = dynamicFields.value.every((field) => {
    if (field.Field_Of_Activity_Required) {
      const value = dynamicFieldValues.value[field.Field_Of_Activity_Name];
      return value !== null && value !== undefined && value !== ""; // Verifica explícitamente
    }
    return true; // Si el campo no es requerido, siempre es válido
  });

  console.log("isDynamicFieldsValid:", isValid, dynamicFieldValues.value); // Depuración
  return isValid;
});

const onFileSelect = (event: { files: File[] }) => {
  const file = event.files[0];
  if (file) {
    if (file.size > MAX_FILE_SIZE) {
      toast.add({
        severity: "warn",
        summary: "Archivo demasiado grande",
        detail: `El archivo excede el tamaño máximo permitido de ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
        life: 3000,
      });
      actividadCompletar.value.Evidencia = null; // No asigna el archivo
      selectedFileName.value = ""; // Limpia el nombre del archivo
      return;
    }

    actividadCompletar.value.Evidencia = file; // Asigna el archivo al estado
    selectedFileName.value = file.name; // Muestra el nombre del archivo
  } else {
    actividadCompletar.value.Evidencia = null;
    selectedFileName.value = "";
  }
};

// Detalles del Usuario
const visibleUsuarioDialog = ref<boolean>(false);
const usuarioDetalles = ref<User>({} as User);

const visibleDocumentoDialog = ref(false); // Controla la visibilidad del modal
const documentoUrl = ref<string | null>(null); // Almacena la URL del documento
// Estado del dialog de actividades y lista de actividades
const visibleDialog = ref<boolean>(false);
const actividades = ref<any[]>([]);
const selectedCaseCode = ref<string>('');
const selectedFileName = ref("");

// Estado para el diálogo de Nueva Actividad
const visibleNuevaActividadDialog = ref<boolean>(false);
const isLoadingActivityTypes = ref<boolean>(false); // Para indicar carga

// Estado para el Dropdown de Tipos de Actividad
const selectedActivityType = ref<number | null>(null); // Almacenará el ID seleccionado (Type_Of_Activity_Id)
const activityTypeOptions = ref<ActivityType[]>([]); // Almacenará las opciones

// Estado para los campos dinámicos
const dynamicFields = ref<any[]>([]); // Campos obtenidos de la API
const dynamicFieldValues = ref<Record<string, any>>({}); // Valores de los campos dinámicos

// Obtener los casos
const casosActivos = ref<any[]>([]);
const casosInactivos = ref<any[]>([]);

// Búsqueda
const searchQuery = ref<string>('');

// Función para obtener los campos dinámicos
const guardarNuevaActividad = async () => {
  // 1. Validar que se haya seleccionado un Tipo de Actividad
  if (selectedActivityType.value === null) {
    toast.add({
      severity: "warn",
      summary: "Selección Requerida",
      detail: "Por favor, selecciona un Tipo de Actividad.",
      life: 3000,
    });
    return;
  }

  // 2. Validar que todos los campos dinámicos cargados estén llenos
  let formEsValido = true;
  if (dynamicFields.value.length > 0) {
    for (const field of dynamicFields.value) {
      const value = dynamicFieldValues.value[field.Field_Of_Activity_Name];
      const valorEsencialmenteVacio = value === null || value === undefined || String(value).trim() === "";

      if (field.Field_Of_Activity_Required && valorEsencialmenteVacio) {
        formEsValido = false;
        toast.add({
          severity: "warn",
          summary: "Campo Requerido",
          detail: `El campo "${formatFieldName(field.Field_Of_Activity_Name)}" es obligatorio y está vacío.`,
          life: 3000,
        });
        break;
      }
    }
  }

  if (!formEsValido) {
    return;
  }

  // Encontrar el nombre del tipo de actividad seleccionado
  const selectedTypeObject = activityTypeOptions.value.find(
    (type) => type.Type_Of_Activity_ID === selectedActivityType.value
  );

  if (!selectedTypeObject) {
    toast.add({
      severity: "error",
      summary: "Error Interno",
      detail: "No se pudo encontrar el tipo de actividad seleccionado.",
      life: 3000,
    });
    return;
  }

  // 3. Construir el payload y enviar
  try {
    const dataToSave: Record<string, any> = {
      Init_Code: selectedCaseCode.value,
      Type_Of_Activity_ID: selectedActivityType.value,
      Activity_Type: selectedTypeObject.Type_Of_Activity_Name,
      Activity_Status: "En progreso",
      Internal_ID: authStore.user?.id,
    };

    // Mapear los valores de los campos dinámicos al payload
    dynamicFields.value.forEach((field) => {
      const fieldName = field.Field_Of_Activity_Name;
      let value = dynamicFieldValues.value[fieldName];

      // Ajustar el valor si es un campo de fecha
      if (field.Field_Of_Activity_Type === "Fecha" && value) {
        if (value instanceof Date) {
          value = value.toISOString().split("T")[0];
        } else if (typeof value === "string" || typeof value === "number") {
          try {
            value = new Date(value).toISOString().split("T")[0];
          } catch (e) {
            console.warn(`Valor de fecha inválido para ${fieldName}:`, value);
            value = null;
          }
        } else {
          value = null;
        }
      } else if (field.Field_Of_Activity_Type === "Tiempo" && value) {
        if (value instanceof Date) {
          const hours = value.getHours().toString().padStart(2, '0');
          const minutes = value.getMinutes().toString().padStart(2, '0');
          const seconds = value.getSeconds().toString().padStart(2, '0');
          value = `${hours}:${minutes}:${seconds}`;
        } else if (typeof value === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
          // El valor ya es un string de tiempo válido
        } else {
          console.warn(`Valor de tiempo inválido para ${fieldName}:`, value);
          value = null;
        }
      }

      // Mapear los nombres de los campos al formato esperado por el backend
      const backendFieldMapping: Record<string, string> = {
        "Descripción de Actividad": "Activity_Description",
        "Lugar": "Activity_Location",
        "Fecha de Actividad": "Activity_Date",
        "Tiempo de Ejecución": "Activity_StartTime",
      };

      const backendFieldName = backendFieldMapping[fieldName] || fieldName;
      dataToSave[backendFieldName] = value;
    });

    console.log("Payload enviado al backend:", dataToSave); // Depuración

    const response = await axios.post(`${API}/activity`, dataToSave, {
      headers: {
        "internal-id": authStore.user?.id,
      },
    });

    if (response.status === 201) {
      toast.add({
        severity: "success",
        summary: "Éxito",
        detail: "Actividad creada correctamente.",
        life: 3000,
      });

      visibleNuevaActividadDialog.value = false;
      dynamicFieldValues.value = {};
      selectedActivityType.value = null;
    } else {
      throw new Error(`Error al guardar la actividad: Estado ${response.status} - ${response.statusText}`);
    }
  } catch (error: any) {
    console.error("Error al guardar la actividad:", error.response?.data || error.message);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.message || "No se pudo guardar la actividad. Intenta de nuevo.",
      life: 3000,
    });
  }
};

watch(dynamicFieldValues, (newValue) => {
  console.log("dynamicFieldValues actualizado:", newValue);
}, { deep: true });

watch(dynamicFields, (newValue) => {
  console.log("dynamicFields actualizado:", newValue);
});

// Observa cambios en el tipo de actividad seleccionado
watch(selectedActivityType, async (newValue, oldValue) => {
  console.log(`[WATCH] selectedActivityType cambió. Anterior: ${oldValue}, Nuevo: ${newValue}, Tipo del nuevo valor: ${typeof newValue}`);

  if (newValue === null || newValue === undefined) {
    console.log("[WATCH] Tipo de actividad deseleccionado o nulo. Limpiando campos dinámicos.");
    dynamicFields.value = [];
    dynamicFieldValues.value = {};
    return;
  }

  if (typeof newValue === "number") {
    console.log(`[WATCH] Procesando ID de tipo de actividad: ${newValue}.`);

    const selectedType = activityTypeOptions.value.find(
      (type) => type.Type_Of_Activity_ID === newValue
    );

    if (selectedType) {
      console.log("[WATCH] Tipo de actividad encontrado:", selectedType);
      await fetchDynamicFields(newValue); // Llama a la función para cargar los campos dinámicos
    } else {
      console.warn(`[WATCH] No se encontró el tipo de actividad con ID: ${newValue} en activityTypeOptions.`);
      dynamicFields.value = [];
      dynamicFieldValues.value = {};
    }
  } else {
    console.error(`[WATCH] Valor inesperado en selectedActivityType. Tipo: ${typeof newValue}, Valor: ${newValue}`);
    dynamicFields.value = [];
    dynamicFieldValues.value = {};
  }
});

const filtrarCasos = (casos: any[], query: string) => {
  if (!query) {
    return casos;
  }
  const lowerCaseQuery = query.toLowerCase();
  return casos.filter((caso: { codigo: string; fecha: string; usuario: string; }) =>
    caso.codigo.toLowerCase().includes(lowerCaseQuery) ||
    caso.fecha.toLowerCase().includes(lowerCaseQuery) ||
    caso.usuario.toLowerCase().includes(lowerCaseQuery)
  );
};

const isFormValid = computed(() => {
  return dynamicFields.value.every((field) => {
    if (field.Field_Of_Activity_Required) {
      const value = dynamicFieldValues.value[field.Field_Of_Activity_Name];
      return value !== null && value !== undefined && String(value).trim() !== "";
    }
    return true;
  });
});

const casosActivosFiltrados = computed(() => filtrarCasos(casosActivos.value, searchQuery.value));
const casosInactivosFiltrados = computed(() => filtrarCasos(casosInactivos.value, searchQuery.value));

// Obtener los datos de los usuarios
const obtenerNombreUsuario = async (userId: string | number): Promise<string> => {
  try {
    // Asegúrate de que la URL base de API esté configurada correctamente si no es localhost
    const response = await axios.get(`${API}/user/${userId}`);
    return `${response.data.User_FirstName} ${response.data.User_LastName}`;
  } catch (error) {
    console.error(`Error al obtener el usuario con ID ${userId}:`, error);
    return "Usuario no encontrado";
  }
}

const verDetallesUsuario = async (cedula: string | number) => {
  try {
    const response = await axios.get(`${API}/user/${cedula}`);
    usuarioDetalles.value = response.data;
    visibleUsuarioDialog.value = true;
  } catch (error) {
    console.error('Error al obtener los detalles del usuario:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron obtener los detalles del usuario.',
      life: 3000,
    });
  }
};

const obtenerCasos = async () => {
  try {
    const userType = authStore.user?.type;

    let activeCasesUrl = '';
    let inactiveCasesUrl = '';

    if (userType === 'Administrador' || userType === 'SuperAdmin') {
      // URLs generales para Administrador o SuperAdmin
      activeCasesUrl = `${API}/initial-consultations/review/Asignado/Activo`;
      inactiveCasesUrl = `${API}/initial-consultations/review/Asignado/Inactivo`;
    } else {
      // URLs específicas para otros usuarios
      const subject = authStore.user?.area;
      if (!subject) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo determinar el área del usuario para filtrar los casos.',
          life: 4000,
        });
        console.error("Error: authStore.user.area is not defined.");
        casosActivos.value = [];
        casosInactivos.value = [];
        return;
      }

      const type = 'Asignado';
      activeCasesUrl = `${API}/initial-consultations/type/${encodeURIComponent(subject)}/${encodeURIComponent(type)}/Activo`;
      inactiveCasesUrl = `${API}/initial-consultations/type/${encodeURIComponent(subject)}/${encodeURIComponent(type)}/Inactivo`;
    }

    const [activeResponse, inactiveResponse] = await Promise.all([
      axios.get<Initial_Consultation[]>(activeCasesUrl),
      axios.get<Initial_Consultation[]>(inactiveCasesUrl)
    ]);

    const mapCasoData = async (caso: Initial_Consultation, index: number) => {
      if (!caso || !caso.User_ID) {
        console.warn("Caso inválido o sin User_ID:", caso);
        return null;
      }
      const nombreUsuario = await obtenerNombreUsuario(caso.User_ID);
      return {
        nro: index + 1,
        codigo: caso.Init_Code,
        fecha: caso.Init_Date ? new Date(caso.Init_Date).toLocaleDateString() : 'N/A',
        cedula: caso.User_ID,
        usuario: nombreUsuario,
        caso: caso.Init_Topic,
        oficina: caso.Init_Office,
        tema: caso.Init_Subject,
        estado: caso.Init_Status,
        tipocliente: caso.Init_ClientType,
      };
    };

    const activeCasesData = activeResponse.data || [];
    casosActivos.value = (await Promise.all(activeCasesData.map(mapCasoData))).filter(caso => caso !== null);

    const inactiveCasesData = inactiveResponse.data || [];
    casosInactivos.value = (await Promise.all(inactiveCasesData.map(mapCasoData))).filter(caso => caso !== null);

  } catch (error) {
    console.error('Error al obtener los casos por tipo y estado:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron obtener los casos.',
      life: 3000,
    });
    casosActivos.value = [];
    casosInactivos.value = [];
  }
};

// Función para obtener los tipos de actividad
const fetchActivityTypes = async () => {
  isLoadingActivityTypes.value = true;
  console.log("[FETCH_TYPES] Iniciando carga de tipos de actividad.");

  try {
    const response = await axios.get<ActivityType[]>(`${API}/type-of-activity`);
    if (response.data && Array.isArray(response.data)) {
      activityTypeOptions.value = response.data.map((type) => ({
        Type_Of_Activity_ID: type.Type_Of_Activity_ID,
        Type_Of_Activity_Name: type.Type_Of_Activity_Name,
        Type_Of_Activity_Status: type.Type_Of_Activity_Status || true,
      }));

      console.log("[FETCH_TYPES] Tipos de actividad cargados exitosamente:", activityTypeOptions.value);
    } else {
      console.warn("[FETCH_TYPES] La respuesta de la API no es un array válido:", response.data);
      activityTypeOptions.value = [];
    }
  } catch (error) {
    console.error("[FETCH_TYPES] Error al obtener los tipos de actividad:", error);
    activityTypeOptions.value = [];
  } finally {
    isLoadingActivityTypes.value = false;
  }
};

const finalizarCaso = async (caso: { codigo: any; }) => {
  try {
    const internalID = authStore.user?.id;

    if (!internalID) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    const response = await axios.put(`${API}/initial-consultations/${caso.codigo}`, {
      Init_Status: 'Inactivo'
    }, {
      headers: {
        'Internal-ID': internalID,
      }
    });

    if (response.status === 200) {
      toast.add({
        severity: 'success',
        summary: 'Caso Finalizado',
        detail: `El caso ${caso.codigo} ha sido finalizado.`,
        life: 3000,
      });
      await obtenerCasos();
    } else {
      throw new Error(`Error al finalizar el caso: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error al finalizar el caso:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo finalizar el caso ${caso.codigo}.`,
      life: 3000,
    });
  }
};

const confirmarFinalizarCaso = async () => {
  if (!finalizarCasoMotivo.value || !finalizarCasoDetalles.value) {
    toast.add({
      severity: "warn",
      summary: "Campos Requeridos",
      detail: "Por favor completa todos los campos antes de confirmar.",
      life: 3000,
    });
    return;
  }

  if (!casoSeleccionado.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se ha seleccionado un caso válido.",
      life: 3000,
    });
    return;
  }

  try {
    const internalID = authStore.user?.id;

    if (!internalID) {
      throw new Error("No se pudo obtener el ID del usuario");
    }

    const response = await axios.put(
      `${API}/initial-consultations/${casoSeleccionado.value.codigo}`,
      {
        Init_Status: "Inactivo",
        Init_EndCaseReason: finalizarCasoMotivo.value, // Motivo de finalización
        Init_EndCaseDescription: finalizarCasoDetalles.value, // Descripción adicional
      },
      {
        headers: {
          "Internal-ID": internalID,
        },
      }
    );

    if (response.status === 200) {
      toast.add({
        severity: "success",
        summary: "Caso Finalizado",
        detail: `El caso ${casoSeleccionado.value.codigo} ha sido finalizado exitosamente.`,
        life: 3000,
      });
      visibleFinalizarCasoDialog.value = false;
      await obtenerCasos(); // Actualiza la lista de casos
    } else {
      throw new Error(`Error al finalizar el caso: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error al finalizar el caso:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: `No se pudo finalizar el caso ${casoSeleccionado.value?.codigo}.`,
      life: 3000,
    });
  }
};

const isFinalizarCasoFormValid = computed(() => {
  return finalizarCasoMotivo.value.trim() !== "" && finalizarCasoDetalles.value.trim() !== "";
});

const reactivarCaso = async (caso: { codigo: any; }) => {
  try {
    const internalID = authStore.user?.id;

    if (!internalID) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    const response = await axios.put(`${API}/initial-consultations/${caso.codigo}`, {
      Init_Status: 'Activo'
    }, {
      headers: {
        'Internal-ID': internalID,
      }
    });

    if (response.status === 200) {
      toast.add({
        severity: 'success',
        summary: 'Caso Reactivado',
        detail: `El caso ${caso.codigo} ha sido reactivado.`,
        life: 3000,
      });
      await obtenerCasos();
    } else {
      throw new Error(`Error al reactivar el caso: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error al reactivar el caso:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo reactivar el caso ${caso.codigo}.`,
      life: 3000,
    });
  }
};

const eliminarCaso = async (caso: { codigo: any; }) => {
  confirm.require({
    message: `¿Estás seguro de que deseas eliminar el caso ${caso.codigo}?`,
    header: 'Confirmación',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        const internalID = authStore.user?.id;

        if (!internalID) {
          throw new Error('No se pudo obtener el ID del usuario');
        }

        const response = await axios.delete(`${API}/initial-consultations/${caso.codigo}`, {
          headers: {
            'Internal-ID': internalID,
          }
        });

        if (response.status === 200) {
          toast.add({
            severity: 'success',
            summary: 'Caso Eliminado',
            detail: `El caso ${caso.codigo} ha sido eliminado.`,
            life: 3000,
          });
          await obtenerCasos();
        } else {
          throw new Error(`Error al eliminar el caso: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error al eliminar el caso:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo eliminar el caso ${caso.codigo}.`,
          life: 3000,
        });
      }
    },
    reject: () => {
      toast.add({
        severity: 'info',
        summary: 'Cancelado',
        detail: 'Eliminación cancelada',
        life: 3000,
      });
    }
  });
};

// Obtener y mostrar las actividades según código del caso
const verActividades = async (caso: Caso) => {
  try {
    selectedCaseCode.value = caso.codigo; // Asigna el código del caso seleccionado
    visibleDialog.value = true;

    const response = await axios.get(`${API}/activity/case/${caso.codigo}`);
    actividades.value = await Promise.all(
      response.data.map(async (act: Actividad) => {
        let documentUrl = null;

        // Verifica si el documento existe
        try {
          const documentResponse = await axios.get(`${API}/activity/document/${act.Activity_ID}`, {
            responseType: "blob",
          });

          const blob = new Blob([documentResponse.data], { type: "application/pdf" });
          documentUrl = URL.createObjectURL(blob);
        } catch (error) {
          console.warn(`No se encontró un documento para la actividad con ID ${act.Activity_ID}`);
        }

        return {
          Activity_Type: act.Activity_Type,
          Activity_ID: act.Activity_ID,
          Activity_Location: act.Activity_Location,
          Activity_Date: act.Activity_Date ? new Date(act.Activity_Date).toLocaleDateString() : null,
          Activity_StartTime: act.Activity_StartTime,
          Activity_Status: act.Activity_Status,
          Activity_Description: act.Activity_Description,
          Activity_Document: documentUrl,
        };
      })
    );

    actividades.value.sort((a, b) => (b.Activity_ID || 0) - (a.Activity_ID || 0));

    if (actividades.value.length === 0) {
      toast.add({
        severity: "info",
        summary: "Sin Actividades",
        detail: `No se encontraron actividades para el caso ${caso.codigo}`,
        life: 3000,
      });
    }
  } catch (error) {
    console.error("Error al obtener las actividades:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: `No se pudieron obtener las actividades del caso ${caso.codigo}`,
      life: 3000,
    });
  }
};


// Función para abrir el diálogo de nueva actividad
const abrirDialogoNuevaActividad = async (codigoCaso: string) => {
  if (!codigoCaso) {
    toast.add({
      severity: 'warn',
      summary: 'Error',
      detail: 'No se puede abrir el diálogo sin un código de caso válido.',
      life: 3000,
    });
    return;
  }

  selectedCaseCode.value = codigoCaso;
  selectedActivityType.value = null;
  await fetchActivityTypes(); // Asegúrate de que las opciones estén cargadas
  visibleNuevaActividadDialog.value = true;
};

const handleFileUpload = async (event: { files: File | File[] }) => {
  const files = Array.isArray(event.files) ? event.files : [event.files];
  const file: File = files[0];
  if (file && file.type === "application/pdf") {
    actividadCompletar.value.Evidencia = file;

    toast.add({
      severity: "success",
      summary: "Archivo Subido",
      detail: "El archivo se ha subido correctamente.",
      life: 3000,
    });
  } else {
    toast.add({
      severity: "warn",
      summary: "Archivo Inválido",
      detail: "Solo se permiten archivos PDF.",
      life: 3000,
    });
  }
};

const guardarActividadCompletada = async () => {
  try {
    const formData = new FormData();
    if (actividadCompletar.value.Evidencia) {
        formData.append("file", actividadCompletar.value.Evidencia); // Cambia "Evidencia" a "file"
    }
    formData.append("Activity_JurisdictionType", actividadCompletar.value.TipoJudicatura);
    formData.append("Activity_InternalReference", actividadCompletar.value.ReferenciaInterna);
    formData.append("Activity_CourtNumber", actividadCompletar.value.NroJuzgado);
    formData.append("Activity_lastCJGActivity", actividadCompletar.value.UltimaActividad);
    formData.append(
      "Activity_lastCJGActivityDate",
      actividadCompletar.value.FechaUltimaActividad
        ? actividadCompletar.value.FechaUltimaActividad.toISOString().split("T")[0]
        : ""
    );
    formData.append("Activity_Observation", actividadCompletar.value.Observaciones);
    formData.append("Activity_Status", "Completado"); // Cambia el estado a "Completado"

    const internalID = authStore.user?.id; // Obtén el ID del usuario autenticado
    if (!internalID) {
      throw new Error("No se pudo obtener el ID del usuario.");
    }

    const response = await axios.put(`${API}/activity/${actividadCompletar.value.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "internal-id": internalID, // Agrega el encabezado internal-id
      },
    });

    if (response.status === 200) {
      toast.add({
        severity: "success",
        summary: "Actividad Completada",
        detail: "La actividad ha sido completada exitosamente.",
        life: 3000,
      });
      visibleCompletarActividadDialog.value = false;

      // Actualiza la lista de actividades
      await verActividades({ codigo: selectedCaseCode.value, usuario: "Unknown User" });
    } else {
      throw new Error("Error al completar la actividad.");
    }
  } catch (error) {
    console.error("Error al completar la actividad:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo completar la actividad.",
      life: 3000,
    });
  }
};

const verDocumento = (documentUrl: string): void => {
  if (documentUrl) {
    console.log("Mostrando documento:", documentUrl); // Depuración
    documentoUrl.value = documentUrl; // Asigna la URL al estado
    visibleDocumentoDialog.value = true; // Muestra el modal
  } else {
    toast.add({
      severity: "warn",
      summary: "Documento no disponible",
      detail: "No se encontró un documento para esta actividad.",
      life: 3000,
    });
  }
};

onMounted(() => {
  fetchActivityTypes();
  obtenerCasos();
});

</script>

<template>
  <Toast />
  <ConfirmDialog />

  <div>
    <!-- Barra de Búsqueda -->
    <div class="flex items-center gap-4 mb-4">
      <InputText
        v-model="searchQuery"
        placeholder="Buscar por código, usuario o fecha"
        class="p-2 rounded-lg shadow-sm w-full max-w-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <Button
        icon="pi pi-search"
        class="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 focus:outline-none"
      />
    </div>

    <!-- Pestañas con TabView -->
    <TabView>
      <TabPanel header="Casos Activos" :value="0">
        <DataTable :value="casosActivosFiltrados" paginator :rows="8" class="w-full">
  <Column field="nro" header="Nro." />
  <Column field="codigo" header="Código del Caso" />
  <Column field="fecha" header="Fecha de Inicio" />
  <Column field="cedula" header="Cédula" />
  <Column field="usuario" header="Usuario">
    <template #body="slotProps">
      <div class="flex items-center gap-2">
        {{ slotProps.data.usuario }}
        <Button icon="pi pi-info-circle" class="p-button-text p-0" @click="verDetallesUsuario(slotProps.data.cedula)" />
      </div>
    </template>
  </Column>
          <Column field="caso" header="Caso" />
          <Column field="oficina" header="Oficina" />
          <Column field="tema" header="Tema" />
          <Column field="estado" header="Estado" />
          <Column field="tipocliente" header="Tipo de Cliente" />
          <Column field="actividades" header="Actividades">
            <template #body="slotProps">
              <Button label="Ver Actividades" icon="pi pi-eye" class="p-button-info" @click="verActividades(slotProps.data)" />
            </template>
          </Column>
          <Column header="Acciones">
            <template #body="slotProps">
              <div class="flex gap-2">
                <!-- Botón Finalizar Caso -->
<Button
  icon="pi pi-check"
  class="bg-green-500 text-white px-3 py-1 rounded-lg shadow hover:bg-green-600"
  @click="abrirFinalizarCasoDialog(slotProps.data)"
/>
                <Button icon="pi pi-trash" class="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600" @click="eliminarCaso(slotProps.data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <TabPanel header="Casos Inactivos" :value="1">
        <DataTable :value="casosInactivosFiltrados" paginator :rows="8" class="w-full">
           <!-- Columnas Casos Inactivos -->
           <Column field="nro" header="Nro." />
          <Column field="codigo" header="Código del Caso" />
          <Column field="fecha" header="Fecha de Inicio" />
          <Column field="cedula" header="Cédula" />
          <Column field="usuario" header="Usuario">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                {{ slotProps.data.usuario }}
                <Button icon="pi pi-info-circle" class="p-button-text p-0" @click="verDetallesUsuario(slotProps.data.cedula)" />
              </div>
            </template>
          </Column>
          <Column field="caso" header="Caso" />
          <Column field="oficina" header="Oficina" />
          <Column field="tema" header="Tema" />
          <Column field="estado" header="Estado" />
          <Column field="tipocliente" header="Tipo de Cliente" />
          <Column field="actividades" header="Actividades">
            <template #body="slotProps">
              <Button label="Ver Actividades" icon="pi pi-eye" class="p-button-info" @click="verActividades(slotProps.data)" />
            </template>
          </Column>
          <Column header="Acciones">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button icon="pi pi-refresh" class="bg-yellow-500 text-white px-3 py-1 rounded-lg shadow hover:bg-yellow-600" @click="reactivarCaso(slotProps.data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>
    </TabView>

    <!-- Dialog para MOSTRAR Actividades -->
    <Dialog v-model:visible="visibleDialog" modal header="Actividades del Caso" class="p-6 rounded-lg shadow-lg bg-white max-w-5xl w-full">
  <div class="flex flex-col space-y-6">
    <!-- Botón para abrir el diálogo de nueva actividad -->
    <div class="flex justify-end">
      <Button
        label="Crear nueva actividad"
        icon="pi pi-plus"
        class="p-button-success"
        @click="abrirDialogoNuevaActividad(selectedCaseCode)"
      />
    </div>

            <!-- Cards de Actividades -->
    <div v-if="actividades.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="actividad in actividades" :key="actividad.Activity_ID" 
           class="card flex flex-col h-full shadow-lg rounded-lg bg-white border border-gray-200">
        
        <!-- Cabecera de la Card -->
        <div class="card-header p-4 border-b border-gray-200 bg-white rounded-t-lg min-h-[72px] flex items-center justify-center">
          <h3 class="text-xl font-semibold text-center text-gray-800" :title="actividad.Activity_Type">
            {{ actividad.Activity_Type }}
          </h3>
        </div>

        <!-- Cuerpo de la Card -->
        <div class="card-body p-4 flex-grow overflow-y-auto" style="max-height: 200px;"> <!-- Limita altura y permite scroll -->
          <ul class="space-y-2 text-sm text-gray-700">
            <template v-for="campo in camposVisiblesEnCard" :key="campo.key">
              <li v-if="actividad[campo.key] !== null && actividad[campo.key] !== undefined && String(actividad[campo.key]).trim() !== ''">
                <strong class="font-bold text-gray-600">{{ campo.label }}: </strong>
                <span class="break-words">{{ actividad[campo.key] }}</span>
              </li>
            </template>
          </ul>
        </div>

        <!-- Pie de la Card -->
        <div class="card-footer p-4 border-t border-gray-200 bg-white rounded-b-lg mt-auto">
          <div class="flex flex-col gap-2">
            <Button
              label="Completar"
              icon="pi pi-check"
              class="p-button-success w-full"
              @click="abrirCompletarActividadDialog(actividad)" />
            <Button
              v-if="actividad.Activity_Document"
              label="Ver Documento"
              icon="pi pi-file-pdf"
              class="p-button-info w-full"
              @click="verDocumento(actividad.Activity_Document)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje si no hay actividades -->
    <div v-else class="text-center text-gray-500">
      <p>No se encontraron actividades para este caso.</p>
    </div>
  </div>
</Dialog>

    <!-- Dialog para CREAR Nueva Actividad -->
    <Dialog v-model:visible="visibleNuevaActividadDialog" modal header="Crear Nueva Actividad" class="p-6 rounded-lg shadow-lg bg-white max-w-2xl w-full">
    <div class="space-y-4">
      <p>Nueva actividad para el caso: <strong>{{ selectedCaseCode }}</strong></p>

      <!-- Dropdown (Combobox) de Tipos de Actividad -->
      <div class="field">
        <label for="activityType" class="block text-sm font-semibold mb-1">Tipo de Actividad</label>
        <Select
  id="activityType"
  v-model="selectedActivityType"
  :options="activityTypeOptions"
  option-label="Type_Of_Activity_Name"
  option-value="Type_Of_Activity_ID"
  placeholder="Selecciona un tipo"
  class="w-full"
  :loading="isLoadingActivityTypes"
  :clearable="true"
  :filterable="activityTypeOptions.length > 10"
/>
      </div>

      <!-- Campos dinámicos -->
      <div v-for="field in dynamicFields" :key="field.Field_Of_Activity_Id" class="field">
  <label :for="field.Field_Of_Activity_Name" class="block text-sm font-semibold mb-1">
    {{ field.Field_Of_Activity_Name }}
    <span v-if="field.Field_Of_Activity_Required" class="text-red-500">*</span>
  </label>

  <InputText
    v-if="field.Field_Of_Activity_Type === 'Texto'"
    :id="field.Field_Of_Activity_Name"
    v-model="dynamicFieldValues[field.Field_Of_Activity_Name]"
    placeholder="Ingrese la descripción"
    class="w-full"
  />

  <Calendar
    v-else-if="field.Field_Of_Activity_Type === 'Fecha'"
    :id="field.Field_Of_Activity_Name"
    v-model="dynamicFieldValues[field.Field_Of_Activity_Name]"
    placeholder="Ingrese la fecha"
    class="w-full"
    dateFormat="dd/mm/yy"
  />

  <InputText
    v-else-if="field.Field_Of_Activity_Type === 'Lugar'"
    :id="field.Field_Of_Activity_Name"
    v-model="dynamicFieldValues[field.Field_Of_Activity_Name]"
    placeholder="Ingrese el lugar"
    class="w-full"
  />

  <Calendar
    v-else-if="field.Field_Of_Activity_Type === 'Tiempo'"
    :id="field.Field_Of_Activity_Name"
    v-model="dynamicFieldValues[field.Field_Of_Activity_Name]"
    class="w-full"
    timeOnly
    hourFormat="24"
    placeholder="Seleccione la hora"
  />

        <Select
  v-else-if="field.Field_Of_Activity_Type === 'dropdown'"
  :id="field.Field_Of_Activity_Name"
  v-model="dynamicFieldValues[field.Field_Of_Activity_Name]"
  :options="field.Field_Of_Activity_Options"
  option-label="label"
  option-value="value"
  class="w-full"
  :class="{ 'border-red-500': field.Field_Of_Activity_Required && !dynamicFieldValues[field.Field_Of_Activity_Name] }"
/>
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="visibleNuevaActividadDialog = false" />
      <Button
  label="Guardar"
  icon="pi pi-check"
  class="p-button-success"
  :disabled="!isNuevaActividadFormValid"
  @click="guardarNuevaActividad"
/>
    </template>
  </Dialog>

    <!-- Dialog de Detalles del Usuario -->
    <Dialog v-model:visible="visibleUsuarioDialog" modal header="Detalles del Usuario" class="p-6 rounded-lg shadow-lg bg-white max-w-3xl w-full">
      <div class="space-y-4">
        <!-- Contenido del diálogo de detalles del usuario (sin cambios) -->
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Nombre</label>
            <p>{{ usuarioDetalles.User_FirstName }} {{ usuarioDetalles.User_LastName }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Cédula</label>
            <p>{{ usuarioDetalles.User_ID }}</p>
          </div>
        </div>
        <!-- ... resto de los campos de detalles del usuario ... -->
         <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Edad</label>
            <p>{{ usuarioDetalles.User_Age }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Género</label>
            <p>{{ usuarioDetalles.User_Gender }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Fecha de Nacimiento</label>
            <p>{{ usuarioDetalles.User_BirthDate ? new Date(usuarioDetalles.User_BirthDate).toLocaleDateString() : 'N/A' }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Nacionalidad</label>
            <p>{{ usuarioDetalles.User_Nationality }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Teléfono</label>
            <p>{{ usuarioDetalles.User_Phone }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Email</label>
            <p>{{ usuarioDetalles.User_Email }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Dirección</label>
            <p>{{ usuarioDetalles.User_Address }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Ciudad</label>
            <p>{{ usuarioDetalles.User_City }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Provincia</label>
            <p>{{ usuarioDetalles.User_Province }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Sector</label>
            <p>{{ usuarioDetalles.User_Sector }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Zona</label>
            <p>{{ usuarioDetalles.User_Zone }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Relación de Referencia</label>
            <p>{{ usuarioDetalles.User_ReferenceRelationship }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Nombre de Referencia</label>
            <p>{{ usuarioDetalles.User_ReferenceName }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Teléfono de Referencia</label>
            <p>{{ usuarioDetalles.User_ReferencePhone }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Beneficio Social</label>
            <p>{{ usuarioDetalles.User_SocialBenefit ? 'Sí' : 'No' }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Dependencia Económica</label>
            <p>{{ usuarioDetalles.User_EconomicDependence ? 'Sí' : 'No' }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Instrucción Académica</label>
            <p>{{ usuarioDetalles.User_AcademicInstruction }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Profesión</label>
            <p>{{ usuarioDetalles.User_Profession }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Estado Civil</label>
            <p>{{ usuarioDetalles.User_MaritalStatus }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Dependientes</label>
            <p>{{ usuarioDetalles.User_Dependents }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Nivel de Ingresos</label>
            <p>{{ usuarioDetalles.User_IncomeLevel }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Ingreso Familiar</label>
            <p>{{ usuarioDetalles.User_FamilyIncome }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Personas Económicamente Activas</label>
            <p>{{ usuarioDetalles.User_EconomicActivePeople }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Tipo de Vivienda</label>
            <p>{{ usuarioDetalles.User_HousingType }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Pensionado</label>
            <p>{{ usuarioDetalles.User_Pensioner }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Seguro de Salud</label>
            <p>{{ usuarioDetalles.User_HealthInsurance }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Situación Vulnerable</label>
            <p>{{ usuarioDetalles.User_VulnerableSituation }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Discapacidad</label>
            <p>{{ usuarioDetalles.User_Disability }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Porcentaje de Discapacidad</label>
            <p>{{ usuarioDetalles.User_DisabilityPercentage }}%</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Enfermedad Catastrófica</label>
            <p>{{ usuarioDetalles.User_CatastrophicIllness }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Documentos de Salud</label>
            <p>{{ usuarioDetalles.User_HealthDocuments }}</p>
          </div>
        </div>
        <div class="flex justify-end gap-4">
          <Button label="Cerrar" icon="pi pi-times" class="p-button-text" @click="visibleUsuarioDialog = false" />
        </div>
      </div>
    </Dialog>

    <!-- Dialog para Completar Actividad -->
    <Dialog v-model:visible="visibleCompletarActividadDialog" modal header="Completar Actividad" class="p-6 rounded-lg shadow-lg bg-white max-w-3xl w-full">
    <div class="space-y-4">
      <p>Para completar la actividad, llena los siguientes campos:</p>

      <!-- Campo para subir evidencia -->
      <div class="field">
        <label for="evidencia" class="block text-sm font-semibold mb-1">Evidencia (PDF)</label>
        <FileUpload
          id="evidencia"
          name="evidencia"
          accept="application/pdf"
          mode="basic"
          customUpload
          :auto="true"
          chooseLabel="Seleccionar Archivo"
          @upload="handleFileUpload"
          @select="onFileSelect"
          class="w-full"
        />
        <p v-if="selectedFileName" class="text-sm text-gray-600 mt-2">
          Archivo seleccionado: <strong>{{ selectedFileName }}</strong>
        </p>
      </div>

      <!-- Tipo de Judicatura -->
      <div class="field">
        <label for="judicatura" class="block text-sm font-semibold mb-1">Tipo de Judicatura</label>
        <InputText id="judicatura" v-model="actividadCompletar.TipoJudicatura" class="w-full" />
      </div>

      <!-- Referencia Interna -->
      <div class="field">
        <label for="referenciaInterna" class="block text-sm font-semibold mb-1">Referencia Interna</label>
        <InputText id="referenciaInterna" v-model="actividadCompletar.ReferenciaInterna" class="w-full" />
      </div>

      <!-- Número de Juzgado/Unidad Judicial -->
      <div class="field">
        <label for="nroJuzgado" class="block text-sm font-semibold mb-1">Nro. Juzgado/Unidad Judicial</label>
        <InputText id="nroJuzgado" v-model="actividadCompletar.NroJuzgado" class="w-full" />
      </div>

      <!-- Última Actividad o Diligencia Realizada -->
      <div class="field">
        <label for="ultimaActividad" class="block text-sm font-semibold mb-1">Última Actividad o Diligencia Realizada por el CJG</label>
        <InputText id="ultimaActividad" v-model="actividadCompletar.UltimaActividad" class="w-full" />
      </div>

      <!-- Fecha de la Última Diligencia o Actividad -->
      <div class="field">
        <label for="fechaUltimaActividad" class="block text-sm font-semibold mb-1">Fecha de la Última Diligencia o Actividad</label>
        <Calendar id="fechaUltimaActividad" v-model="actividadCompletar.FechaUltimaActividad" class="w-full" dateFormat="dd/mm/yy" />
      </div>

      <!-- Observaciones -->
      <div class="field">
        <label for="observaciones" class="block text-sm font-semibold mb-1">Observaciones</label>
        <textarea
          id="observaciones"
          v-model="actividadCompletar.Observaciones"
          class="w-full border border-gray-300 rounded-lg p-2"
          rows="5"
          placeholder="Escribe tus observaciones aquí..."
        ></textarea>
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="visibleCompletarActividadDialog = false" />
      <Button
        label="Guardar"
        icon="pi pi-check"
        class="p-button-success"
        :disabled="!isCompletarActividadFormValid"
        @click="guardarActividadCompletada"
      />
    </template>
  </Dialog>

<Dialog v-model:visible="visibleDocumentoDialog" modal header="Documento" class="p-6 rounded-lg shadow-lg bg-white max-w-4xl w-full">
  <div class="h-96">
    <iframe
      v-if="documentoUrl"
      :src="documentoUrl"
      class="w-full h-full"
      frameborder="0"
    ></iframe>
    <p v-else class="text-center text-gray-500">Cargando documento...</p>
  </div>
  <template #footer>
    <Button label="Cerrar" icon="pi pi-times" class="p-button-text" @click="visibleDocumentoDialog = false" />
  </template>
</Dialog>

<!-- Dialog para Finalizar Caso -->
<Dialog
  v-model:visible="visibleFinalizarCasoDialog"
  modal
  header="Finalizar Caso"
  class="p-6 rounded-lg shadow-lg bg-white max-w-2xl w-full"
>
  <div class="space-y-4">
    <p>Por favor selecciona un motivo para finalizar el caso <strong>{{ casoSeleccionado?.codigo }}</strong>:</p>

    <!-- Combobox para seleccionar el motivo -->
    <div class="field">
      <label for="motivo" class="block text-sm font-semibold mb-1">Motivo</label>
      <Select
  id="motivo"
  v-model="finalizarCasoMotivo"
  :options="motivosFinalizacion"
  placeholder="Selecciona un motivo"
  class="w-full"
/>
    </div>

    <!-- Campo de texto para detalles adicionales -->
    <div class="field">
      <label for="detalles" class="block text-sm font-semibold mb-1">Detalles Adicionales</label>
      <textarea
        id="detalles"
        v-model="finalizarCasoDetalles"
        class="w-full border border-gray-300 rounded-lg p-2"
        rows="5"
        placeholder="Escribe detalles adicionales aquí..."
      ></textarea>
    </div>
  </div>

  <template #footer>
    <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="visibleFinalizarCasoDialog = false" />
    <Button
      label="Confirmar"
      icon="pi pi-check"
      class="p-button-success"
      :disabled="!isFinalizarCasoFormValid"
      @click="confirmarFinalizarCaso"
    />
  </template>
</Dialog>

  </div>
</template>
