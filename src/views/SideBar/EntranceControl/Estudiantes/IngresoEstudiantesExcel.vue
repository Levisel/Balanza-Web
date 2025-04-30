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
  archivoNombre.value = archivo.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target!.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });
    // Buscamos la hoja "consolidado"
    const sheetName = workbook.SheetNames.find(
      (name) => name.toLowerCase() === "consolidado"
    );
    if (!sheetName) {
      errorMensaje.value = "El archivo no contiene una hoja llamada 'consolidado'.";
      return;
    }
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    datosTemp.value = jsonData; // Opcional: guardar data completa

    const dataFiltrada = jsonData.map((row: any) => {
      let cedulaString = row["CEDULA"]?.toString().trim() || "N/A";
      // Si la cédula tiene 9 dígitos, anteponemos un '0'
      if (cedulaString.length === 9) {
        cedulaString = "0" + cedulaString;
      }

      // Se obtiene el área a partir del NRC usando el mapeo de useSubjects
      // Nota: nrcAreaMap es un computed; por eso accedemos a su valor con .value
      const area = nrcAreaMap.value[row["NRC"]] || "Sin Área";

      // Definimos los campos obligatorios (sin considerar teléfono)
      const tieneDatosObligatorios =
        cedulaString !== "N/A" &&
        row["APELLIDOS"] &&
        row["NOMBRES"] &&
        row["Correo_institucional"] &&
        row["NRC"];

      const usuario: Internal_User = {
        Internal_ID: cedulaString,
        Internal_LastName: row["APELLIDOS"]?.toString().trim() || "N/A",
        Internal_Name: row["NOMBRES"]?.toString().trim() || "N/A",
        Internal_Email: row["Correo_institucional"]?.toString().trim() || "N/A",
        Internal_Password: "",
        Internal_Type: "Estudiante",
        Internal_Area: area,
        Internal_Huella: undefined,
        Internal_Status: "Activo",
        completo: !!tieneDatosObligatorios,
      };
      return usuario;
    });

    // Si es la primera carga, se eliminan duplicados y se asigna la data completa.
    if (estudiantes.value.length === 0) {
      const idSet = new Set();
      estudiantes.value = dataFiltrada.filter((est) => {
        if (!idSet.has(est.Internal_ID)) {
          idSet.add(est.Internal_ID);
          return true;
        }
        return false;
      });
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

    // Actualizamos el mensaje de error según la cantidad de registros incompletos.
    const numIncompletos = estudiantes.value.filter((est) => !est.completo).length;
    errorMensaje.value =
      numIncompletos > 0
        ? `Existen ${numIncompletos} estudiantes con datos incompletos. Corrige el Excel o edítalos manualmente.`
        : "";
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
          accept=".xls,.xlsx" 
          customUpload 
          @select="procesarArchivo" 
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
      <Button
        label="Cargar sin Email (prueba)"
        icon="pi pi-exclamation-triangle"
        class="mt-4 px-6 py-3 rounded-full bg-yellow-500 text-white hover:bg-yellow-600"
        @click="forzarCargaSinCorreo"
      />
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
        <div class="rounded-2xl shadow-md border border-gray-200 bg-white mb-6">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
            <i class="pi pi-user-edit text-primary-600 text-lg"></i>
            <h5 class="text-base font-semibold text-gray-700 m-0">Datos Personales</h5>
          </div>
          <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="cedula" class="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
              <InputText
                id="cedula"
                v-model="registroEditando.Internal_ID"
                disabled
                class="w-full"
                :class="{ 'p-invalid': !registroEditando.Internal_ID }"
              />
              <small v-if="!registroEditando.Internal_ID" class="text-red-500">La cédula es requerida</small>
            </div>
            <div>
              <label for="apellidos" class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
              <InputText
                id="apellidos"
                v-model="registroEditando.Internal_LastName"
                class="w-full"
                :class="{ 'p-invalid': !registroEditando.Internal_LastName }"
              />
              <small v-if="!registroEditando.Internal_LastName" class="text-red-500">Los apellidos son requeridos</small>
            </div>
            <div>
              <label for="nombres" class="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
              <InputText
                id="nombres"
                v-model="registroEditando.Internal_Name"
                class="w-full"
                :class="{ 'p-invalid': !registroEditando.Internal_Name }"
              />
              <small v-if="!registroEditando.Internal_Name" class="text-red-500">Los nombres son requeridos</small>
            </div>
          </div>
        </div>
        <div class="rounded-2xl shadow-md border border-gray-200 bg-white">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
            <i class="pi pi-envelope text-primary-600 text-lg"></i>
            <h5 class="text-base font-semibold text-gray-700 m-0">Información de Contacto</h5>
          </div>
          <div class="p-4 grid grid-cols-1 gap-4">
            <div>
              <label for="correo" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <InputText
                id="correo"
                v-model="registroEditando.Internal_Email"
                class="w-full"
                :class="{ 'p-invalid': !registroEditando.Internal_Email }"
              />
              <small v-if="!registroEditando.Internal_Email" class="text-red-500">El correo es requerido</small>
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
</style>
