<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import * as XLSX from "xlsx";
import Dropdown from "primevue/dropdown";
import FileUpload from "primevue/fileupload";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Message from "primevue/message";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { API } from "@/ApiRoute";
import { useDarkMode } from "@/components/ThemeSwitcher";
// Importamos el composable que maneja los subjects (áreas)
import { useSubjects } from "@/useSubjects";

// Interfaz para cada estudiante (sin teléfono)
interface Internal_User {
  Internal_ID: string;       // Cédula
  Internal_Name: string;     // Nombres
  Internal_LastName: string; // Apellidos
  Internal_Email: string;    // Correo institucional
  Internal_Password: string;
  Internal_Type: string;
  Internal_Area: string;     // Área determinada según el NRC
  Internal_Huella: Blob | undefined;
  Internal_Status: string;
  completo?: boolean;        // Indica si el registro está completo
}

const toast = useToast();
const { isDarkTheme } = useDarkMode();

// Estados locales
const periodos = ref<any[]>([]);
const periodoSeleccionado = ref<any | null>(null);
const estudiantes = ref<Internal_User[]>([]);
const errorMensaje = ref("");
const loading = ref(false);
const archivoNombre = ref("");
const datosTemp = ref<any[]>([]);

// Estados para el diálogo de edición
const dialogVisible = ref(false);
const registroEditando = ref<Internal_User | null>(null);

// Usamos el composable para obtener la info de "subjects" y armar el mapeo NRC -> Subject_Name
const { nrcAreaMap, fetchSubjects } = useSubjects();

// Función para asignar clase de fila según si el registro está completo
const rowClass = (data: Internal_User) => {
  if (!data.completo) {
    return isDarkTheme.value ? "incomplete-row dark" : "incomplete-row light";
  }
  return "";
};

// Obtiene los períodos desde la API
const fetchPeriodos = async () => {
  try {
    const { data } = await axios.get(`${API}/periodos`);
    periodos.value = data;
  } catch (err: any) {
    errorMensaje.value = err.response?.data?.message || err.message;
  }
};


onMounted(() => {
  fetchPeriodos();
  fetchSubjects(); // Cargamos los subjects para formar el mapeo NRC -> Área
});

/**
 * Procesa el archivo Excel y lo mapea a la interfaz Internal_User.
 * Se utiliza la columna NRC del Excel para obtener el nombre del área desde nrcAreaMap.
 */
function procesarArchivo(event: any) {
  // Verifica que esté seleccionado un período
  if (!periodoSeleccionado.value) {
    errorMensaje.value = "Primero selecciona un Período Académico.";
    return;
  }

  errorMensaje.value = "";
  const archivo = event.files[0];
  if (!archivo) {
    errorMensaje.value = "Debe seleccionar un archivo.";
    return;
  }

  // Validar extensión del archivo
  const extensionesValidas = ['.xlsx', '.xls'];
  const extension = archivo.name.toLowerCase().substring(archivo.name.lastIndexOf('.'));
  if (!extensionesValidas.includes(extension)) {
    errorMensaje.value = "El archivo debe ser de formato Excel (.xlsx o .xls).";
    toast.add({
      severity: "error",
      summary: "Formato incorrecto",
      detail: "Solo se permiten archivos Excel (.xlsx o .xls)",
      life: 5000,
    });
    return;
  }

  // Validar tamaño del archivo (máximo 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (archivo.size > maxSize) {
    errorMensaje.value = "El archivo es demasiado grande. Máximo permitido: 10MB.";
    toast.add({
      severity: "error",
      summary: "Archivo muy grande",
      detail: "El archivo excede el tamaño máximo de 10MB",
      life: 5000,
    });
    return;
  }

  archivoNombre.value = archivo.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      // Validar que el archivo tenga hojas
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        errorMensaje.value = "El archivo Excel está vacío o corrupto.";
        toast.add({
          severity: "error",
          summary: "Archivo no válido",
          detail: "El archivo Excel no contiene hojas de trabajo",
          life: 5000,
        });
        return;
      }

      // Buscar la hoja "consolidado"
      const sheetName = workbook.SheetNames.find(
        (name) => name.toLowerCase() === "consolidado"
      );
      
      if (!sheetName) {
        errorMensaje.value = `El archivo no contiene una hoja llamada 'consolidado'. Hojas encontradas: ${workbook.SheetNames.join(', ')}`;
        toast.add({
          severity: "error",
          summary: "Hoja requerida no encontrada",
          detail: "Se requiere una hoja llamada 'consolidado'",
          life: 5000,
        });
        return;
      }

      const sheet = workbook.Sheets[sheetName];
      
      // Validar que la hoja no esté vacía
      if (!sheet || Object.keys(sheet).length === 0) {
        errorMensaje.value = "La hoja 'consolidado' está vacía.";
        toast.add({
          severity: "warn",
          summary: "Hoja vacía",
          detail: "La hoja 'consolidado' no contiene datos",
          life: 5000,
        });
        return;
      }

      const jsonData = XLSX.utils.sheet_to_json(sheet);
      
      // Validar que haya datos
      if (!jsonData || jsonData.length === 0) {
        errorMensaje.value = "No se encontraron datos en la hoja 'consolidado'.";
        toast.add({
          severity: "warn",
          summary: "Sin datos",
          detail: "La hoja 'consolidado' no contiene registros",
          life: 5000,
        });
        return;
      }

      // Validar estructura de columnas requeridas
      const columnasRequeridas = ['CEDULA', 'APELLIDOS', 'NOMBRES', 'Correo_institucional', 'NRC'];
      const primeraFila = jsonData[0] as any;
      const columnasEncontradas = Object.keys(primeraFila);
      const columnasFaltantes = columnasRequeridas.filter(col => !columnasEncontradas.includes(col));
      
      if (columnasFaltantes.length > 0) {
        const columnasDisponibles = columnasEncontradas.join(', ');
        errorMensaje.value = `Estructura incorrecta. Faltan columnas: ${columnasFaltantes.join(', ')}`;
        toast.add({
          severity: "warn",
          summary: "Estructura de Excel incorrecta",
          detail: `Columnas requeridas: ${columnasRequeridas.join(', ')}\nColumnas encontradas: ${columnasDisponibles}`,
          life: 10000,
        });
        return;
      }

      // Validar que las columnas no estén vacías en su mayoría
      let filasVacidasCount = 0;
      const totalFilas = jsonData.length;
      
      columnasRequeridas.forEach(columna => {
        const filasVacias = jsonData.filter((row: any) => !row[columna] || row[columna].toString().trim() === '').length;
        if (filasVacias > totalFilas * 0.8) { // Si más del 80% están vacías
          filasVacidasCount++;
        }
      });

      if (filasVacidasCount > 0) {
        toast.add({
          severity: "warn",
          summary: "Datos insuficientes",
          detail: "Se detectaron columnas con muchos valores vacíos. Verifica la estructura del archivo.",
          life: 8000,
        });
      }

      datosTemp.value = jsonData;

      // Validar formato de datos y detectar errores específicos
      let filasConErrores = 0;
      const erroresDetallados: string[] = [];
      const cedulasDuplicadas = new Set();
      const cedulasVistas = new Set();

      toast.add({
        severity: "info",
        summary: "Procesando archivo",
        detail: `Validando ${totalFilas} registros...`,
        life: 3000,
      });

      const dataFiltrada = jsonData.map((row: any, index: number) => {
        const filaNum = index + 2; // +2 porque Excel empieza en 1 y tenemos header
        let erroresFila = [];

        // Validar y procesar cédula
        let cedulaString = row["CEDULA"]?.toString().trim() || "";
        if (!cedulaString || cedulaString === "N/A") {
          erroresFila.push(`Fila ${filaNum}: Cédula vacía`);
          cedulaString = "N/A";
        } else {
          // Validar que solo contenga números
          if (!/^\d+$/.test(cedulaString)) {
            erroresFila.push(`Fila ${filaNum}: Cédula '${cedulaString}' debe contener solo números`);
          } else {
            // Si la cédula tiene 9 dígitos, anteponemos un '0'
            if (cedulaString.length === 9) {
              cedulaString = "0" + cedulaString;
            }
            // Validar longitud de cédula
            if (cedulaString.length !== 10) {
              erroresFila.push(`Fila ${filaNum}: Cédula '${cedulaString}' debe tener 10 dígitos`);
            }
            // Detectar duplicados
            if (cedulasVistas.has(cedulaString)) {
              cedulasDuplicadas.add(cedulaString);
              erroresFila.push(`Fila ${filaNum}: Cédula '${cedulaString}' está duplicada en el archivo`);
            } else {
              cedulasVistas.add(cedulaString);
            }
          }
        }

        // Validar apellidos
        const apellidos = row["APELLIDOS"]?.toString().trim() || "";
        if (!apellidos) {
          erroresFila.push(`Fila ${filaNum}: Campo 'APELLIDOS' vacío`);
        } else if (apellidos.length < 2) {
          erroresFila.push(`Fila ${filaNum}: 'APELLIDOS' muy corto`);
        }

        // Validar nombres
        const nombres = row["NOMBRES"]?.toString().trim() || "";
        if (!nombres) {
          erroresFila.push(`Fila ${filaNum}: Campo 'NOMBRES' vacío`);
        } else if (nombres.length < 2) {
          erroresFila.push(`Fila ${filaNum}: 'NOMBRES' muy corto`);
        }

        // Validar correo
        const correo = row["Correo_institucional"]?.toString().trim() || "";
        if (!correo) {
          erroresFila.push(`Fila ${filaNum}: Campo 'Correo_institucional' vacío`);
        } else {
          // Validar formato de correo
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(correo)) {
            erroresFila.push(`Fila ${filaNum}: Formato de correo '${correo}' inválido`);
          }
        }

        // Validar NRC
        const nrc = row["NRC"];
        if (!nrc) {
          erroresFila.push(`Fila ${filaNum}: Campo 'NRC' vacío`);
        } else if (!nrcAreaMap.value[nrc]) {
          erroresFila.push(`Fila ${filaNum}: NRC '${nrc}' no encontrado en el sistema`);
        }

        if (erroresFila.length > 0) {
          filasConErrores++;
          erroresDetallados.push(...erroresFila);
        }

        // Se obtiene el área a partir del NRC usando el mapeo de useSubjects
        const area = nrcAreaMap.value[row["NRC"]] || "Sin Área";

        // Definimos los campos obligatorios
        const tieneDatosObligatorios =
          cedulaString !== "N/A" &&
          apellidos &&
          nombres &&
          correo &&
          row["NRC"] &&
          erroresFila.length === 0;

        // Extraer primer nombre y primer apellido
        const primerApellido = apellidos.split(" ")[0] || "N/A";
        const primerNombre = nombres.split(" ")[0] || "N/A";

        const usuario: Internal_User = {
          Internal_ID: cedulaString,
          Internal_LastName: primerApellido,
          Internal_Name: primerNombre,
          Internal_Email: correo,
          Internal_Password: "",
          Internal_Type: "Estudiante",
          Internal_Area: area,
          Internal_Huella: undefined,
          Internal_Status: "Activo",
          completo: !!tieneDatosObligatorios,
        };

        return usuario;
      });

      // Mostrar resumen de validación
      if (erroresDetallados.length > 0) {
        const maxErrores = 15;
        const erroresAMostrar = erroresDetallados.slice(0, maxErrores);
        const mensajeErrores = erroresAMostrar.join('\n');
        const textoAdicional = erroresDetallados.length > maxErrores 
          ? `\n... y ${erroresDetallados.length - maxErrores} errores más.` 
          : '';
        
        toast.add({
          severity: "warn",
          summary: `${filasConErrores} filas con errores de ${totalFilas}`,
          detail: `Errores encontrados:\n${mensajeErrores}${textoAdicional}`,
          life: 12000,
        });
      }

      if (cedulasDuplicadas.size > 0) {
        toast.add({
          severity: "error",
          summary: "Cédulas duplicadas encontradas",
          detail: `Se encontraron ${cedulasDuplicadas.size} cédulas duplicadas en el archivo`,
          life: 8000,
        });
      }

      // Si es la primera carga, se eliminan duplicados y se asigna la data completa.
      if (estudiantes.value.length === 0) {
        const idSet = new Set();
        const estudiantesFiltrados = dataFiltrada.filter((est) => {
          if (!idSet.has(est.Internal_ID)) {
            idSet.add(est.Internal_ID);
            return true;
          } else {
            return false;
          }
        });
        estudiantes.value = estudiantesFiltrados;
      } else {
        // Si ya hay registros, se actualizan aquellos que estén incompletos.
        const newDataMap = new Map<string, Internal_User>();
        dataFiltrada.forEach((est) => {
          newDataMap.set(est.Internal_ID, est);
        });
        estudiantes.value = estudiantes.value.map((est) => {
          if (!est.completo) {
            const newEst = newDataMap.get(est.Internal_ID);
            return newEst && newEst.completo ? newEst : est;
          }
          return est;
        });
      }

      // Ordenamos para que los registros incompletos aparezcan primero
      estudiantes.value.sort((a, b) => {
        if (a.completo === b.completo) return 0;
        return a.completo ? 1 : -1;
      });

      // Mostrar resumen final
      const numCompletos = estudiantes.value.filter(est => est.completo).length;
      const numIncompletos = estudiantes.value.length - numCompletos;

      if (numIncompletos === 0 && erroresDetallados.length === 0) {
        toast.add({
          severity: "success",
          summary: "Archivo procesado correctamente",
          detail: `Se cargaron ${numCompletos} estudiantes sin errores`,
          life: 5000,
        });
      } else if (numIncompletos > 0) {
        errorMensaje.value = `Existen ${numIncompletos} estudiantes con datos incompletos. Corrige el Excel o edítalos manualmente.`;
      }

    } catch (error: any) {
      console.error("Error procesando archivo:", error);
      errorMensaje.value = "Error al procesar el archivo Excel. Verifica que el archivo no esté corrupto.";
      toast.add({
        severity: "error",
        summary: "Error de procesamiento",
        detail: "No se pudo procesar el archivo Excel. Verifica la estructura y formato.",
        life: 5000,
      });
    }
  };

  reader.onerror = () => {
    errorMensaje.value = "Error al leer el archivo.";
    toast.add({
      severity: "error",
      summary: "Error de lectura",
      detail: "No se pudo leer el archivo seleccionado",
      life: 5000,
    });
  };

  reader.readAsArrayBuffer(archivo);
}

async function forzarCargaSinCorreo() {
  if (estudiantes.value.length === 0) {
    errorMensaje.value = "No hay estudiantes cargados.";
    return;
  }
  estudiantes.value.forEach((est) => {
    est.completo = !!(
      est.Internal_ID &&
      est.Internal_LastName &&
      est.Internal_Name &&
      est.Internal_Area
    );
  });

  const incompletos = estudiantes.value.filter((est) => !est.completo);
  if (incompletos.length > 0) {
    errorMensaje.value = `Aún hay ${incompletos.length} registros incompletos.`;
    return;
  }

  try {
    loading.value = true;
    errorMensaje.value = "";

    // 1. Guardar estudiantes
    await axios.post(`${API}/usuariointernoBulk/${periodoSeleccionado.value.Period_ID}`, estudiantes.value);

    // 2. Asignarlos al período
    const usuariosXPeriodo = estudiantes.value.map((est) => ({
      Period_ID: periodoSeleccionado.value.Period_ID,
      Internal_ID: est.Internal_ID,
    }));

    await axios.post(`${API}/usuarioXPeriodo`, usuariosXPeriodo);

    toast.add({
      severity: "success",
      summary: "Carga sin correo exitosa",
      detail: "Estudiantes enviados correctamente.",
      life: 4000,
    });

    estudiantes.value = [];
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || error.message, life: 5000 });
  } finally {
    loading.value = false;
  }
}


async function guardarEstudiantes() {
  if (estudiantes.value.length === 0) {
    errorMensaje.value = "No hay estudiantes para guardar.";
    return;
  }
  if (estudiantes.value.some((est) => !est.completo)) {
    errorMensaje.value = "No se puede guardar. Hay estudiantes con datos incompletos.";
    return;
  }

  try {
    loading.value = true;
    errorMensaje.value = "";

    // Guardar estudiantes
    await axios.post(`${API}/usuariointernoBulk/${periodoSeleccionado.value.Period_ID}`, estudiantes.value);

    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: "Estudiantes guardados correctamente.",
      life: 3000,
    });

    estudiantes.value = [];
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || error.message, life: 5000 });
  } finally {
    loading.value = false;
  }
}


const isGuardarDisabled = computed(() => {
  const noEstudiantes = estudiantes.value.length === 0;
  const hayIncompletos = estudiantes.value.some((est) => !est.completo);
  const sinPeriodo = !periodoSeleccionado.value;
  return noEstudiantes || hayIncompletos || sinPeriodo || loading.value;
});

const nombreArchivoVisible = computed(() => {
  if (!archivoNombre.value) return "";
  return archivoNombre.value.length > 30
    ? archivoNombre.value.slice(0, 30) + "..."
    : archivoNombre.value;
});


function editarRegistro(usuario: Internal_User) {
  registroEditando.value = { ...usuario };
  dialogVisible.value = true;
}

function guardarEdicion() {
  if (!registroEditando.value) return;
  const idx = estudiantes.value.findIndex(
    (est) => est.Internal_ID === registroEditando.value!.Internal_ID
  );
  if (idx !== -1) {
    estudiantes.value[idx] = { ...registroEditando.value };
    const user = estudiantes.value[idx];
    user.completo = !!(
      user.Internal_ID &&
      user.Internal_LastName &&
      user.Internal_Name &&
      user.Internal_Email &&
      user.Internal_Area
    );
  }
  const numIncompletos = estudiantes.value.filter((est) => !est.completo).length;
  errorMensaje.value =
    numIncompletos > 0
      ? `Existen ${numIncompletos} estudiantes con datos incompletos. Corrige el Excel o edítalos manualmente.`
      : "";
  dialogVisible.value = false;
}
</script>

<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <h1 class="text-3xl font-bold text-center mb-10">Ingreso de Estudiantes</h1>
    <!-- Mensajes Toast -->
    <Toast />

    <!-- Selector de Período y Cargar/Actualizar Excel -->
    <div class="flex items-center w-full max-w-6xl justify-between mb-6 flex-wrap">
      <div class="flex flex-col">
        <label class="mb-2 text-lg font-medium">Período Académico</label>
        <Dropdown 
          v-model="periodoSeleccionado" 
          :options="periodos" 
          optionLabel="Period_Name" 
          placeholder="Seleccionar Período Académico"
          class="w-72" 
        />
      </div>
      <div class="flex flex-col">
        <label class="mb-2 text-lg font-medium">
          {{ estudiantes.length === 0 ? 'Cargar Excel' : 'Actualizar Excel' }}
        </label>
        <FileUpload 
            mode="basic"
            auto
            customUpload
            @select="procesarArchivo"
            accept=".xls,.xlsx"
            chooseLabel="Seleccionar archivo xlsx"
            :disabled="!periodoSeleccionado"
          />

      </div>
      <Button 
        :disabled="isGuardarDisabled" 
        :label="loading ? 'Guardando...' : 'Guardar'" 
        icon="pi pi-save" 
        iconPos="right"
        class="px-6 py-3 rounded-full bg-blue-600 text-white transition duration-300 hover:bg-blue-700 disabled:opacity-50"
        @click="guardarEstudiantes" 
      />
      <!-- <Button
        label="Cargar sin Email (prueba)"
        icon="pi pi-exclamation-triangle"
        class="mt-4 px-6 py-3 rounded-full bg-yellow-500 text-white hover:bg-yellow-600"
        @click="forzarCargaSinCorreo"
      /> -->
    </div>

    <div v-if="archivoNombre" class="text-sm italic text-gray-400 mb-2">
  Archivo cargado: <span class="font-medium text-white">{{ nombreArchivoVisible }}</span>
</div>



    <div class="flex flex-col items-center mt-2 mb-4">
      <label class="mb-1 text-lg font-medium">Total Estudiantes Cargados :</label>
      <div class="text-xl font-bold">{{ estudiantes.length }}</div>
    </div>
    <Message v-if="errorMensaje" severity="error" class="mb-4">{{ errorMensaje }}</Message>
    <DataTable 
      :value="estudiantes" 
      paginator 
      :rows="12" 
      class="w-full max-w-6xl shadow-lg"
      :rowClass="rowClass"
    >
      <Column field="Internal_ID" header="Cédula" />
      <Column field="Internal_LastName" header="Apellidos" />
      <Column field="Internal_Name" header="Nombres" />
      <Column field="Internal_Email" header="Correo" />
      <Column field="Internal_Area" header="Área" />
      <Column header="Acciones">
        <template #body="slotProps">
          <Button
            class="p-button p-component p-button-icon-only p-button-info p-button-rounded p-button-outlined"
            icon="pi pi-pencil"
            :disabled="!periodoSeleccionado"
            @click="editarRegistro(slotProps.data)"
            v-if="!slotProps.data.completo"
          />
        </template>
      </Column>
    </DataTable>
  <Dialog
  v-model:visible="dialogVisible"
  :style="{ width: '600px' }"
  header="Editar Información del Estudiante"
  :modal="true"
  :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
  class="edit-dialog"
>
  <div class="p-fluid" v-if="registroEditando">
    <!-- Datos personales -->
    <div :class="[isDarkTheme ? 'bg-[#1f1f1f] text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200', 'rounded-2xl shadow-md border mb-6']">
      <div :class="[isDarkTheme ? 'bg-[#2c2c2c] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-700', 'flex items-center gap-2 px-4 py-3 border-b rounded-t-2xl']">
        <i class="pi pi-user-edit text-primary-600 text-lg"></i>
        <h5 class="text-base font-semibold m-0">Datos Personales</h5>
      </div>
      <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Cédula</label>
          <InputText
            v-model="registroEditando.Internal_ID"
            disabled
            class="w-full"
            :class="{ 'p-invalid': !registroEditando.Internal_ID }"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Apellidos</label>
          <InputText
            v-model="registroEditando.Internal_LastName"
            class="w-full"
            :class="{ 'p-invalid': !registroEditando.Internal_LastName }"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Nombres</label>
          <InputText
            v-model="registroEditando.Internal_Name"
            class="w-full"
            :class="{ 'p-invalid': !registroEditando.Internal_Name }"
          />
        </div>
      </div>
    </div>

    <!-- Información de contacto -->
    <div :class="[isDarkTheme ? 'bg-[#1f1f1f] text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200', 'rounded-2xl shadow-md border']">
      <div :class="[isDarkTheme ? 'bg-[#2c2c2c] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-700', 'flex items-center gap-2 px-4 py-3 border-b rounded-t-2xl']">
        <i class="pi pi-envelope text-primary-600 text-lg"></i>
        <h5 class="text-base font-semibold m-0">Información de Contacto</h5>
      </div>
      <div class="p-4 grid grid-cols-1 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Correo Electrónico</label>
          <InputText
            v-model="registroEditando.Internal_Email"
            class="w-full"
            :class="{ 'p-invalid': !registroEditando.Internal_Email }"
          />
        </div>
      </div>
    </div>
  </div>

  <template #footer>
    <div class="flex justify-between items-center w-full px-2 py-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        class="p-button-outlined p-button-danger"
        @click="dialogVisible = false"
      />
      <Button
        label="Guardar Cambios"
        icon="pi pi-check"
        class="p-button-success"
        @click="guardarEdicion"
      />
    </div>
  </template>
</Dialog>

  </main>
</template>

<style scoped>
:deep(.incomplete-row.light) {
  background-color: #ffe6e6 !important;
}
:deep(.incomplete-row.dark) {
  background-color: #7f1d1d !important;
}

/* Oculta el nombre del archivo que PrimeVue muestra por defecto */
:deep(.p-fileupload-filename) {
  display: none !important;
}

:deep(.p-button + span) {
  display: none !important;
}

</style>
