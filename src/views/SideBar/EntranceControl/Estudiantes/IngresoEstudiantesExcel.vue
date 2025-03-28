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

import { API } from "@/ApiRoute";
import { useDarkMode } from "@/components/ThemeSwitcher";

// Interfaz para cada estudiante
interface Internal_User {
  Internal_ID: string;       // cédula
  Internal_Name: string;     // nombres
  Internal_LastName: string; // apellidos
  Internal_Email: string;    // correo institucional
  Internal_Password: string;
  Internal_Type: string;
  Internal_Area: string;
  Internal_Phone: string;    // teléfono o celular
  Internal_Huella: Blob | undefined;
  Internal_Status: string;
  completo?: boolean;        // indica si el registro está completo
}

// Ejemplo de mapeo NRC -> Área
const nrcAreaMap: Record<string, string> = {
  "8303": "Civil",
  "8309": "Penal",
  "8306": "Familia, Niñez y Adolescencia",
  "8308": "Movilidad Humana",
  "8311": "CEMASC",
  "8310": "CDH",
  // Agrega aquí todos los NRC que necesites
};

const toast = useToast();
const { isDarkTheme } = useDarkMode();

// Estados reactivas
const periodos = ref<any[]>([]);
const periodoSeleccionado = ref<any | null>(null);
const estudiantes = ref<Internal_User[]>([]);
const errorMensaje = ref("");
const loading = ref(false);
const archivoNombre = ref("");
const datosTemp = ref<any[]>([]); // Data cruda del Excel

// Estados para el diálogo de edición
const dialogVisible = ref(false);
const registroEditando = ref<Internal_User | null>(null);

/**
 * Asigna la clase de la fila según si está completa o no,
 * usando la variable isDarkTheme para escoger el color de fondo.
 */
const rowClass = (data: Internal_User) => {
  if (!data.completo) {
    return isDarkTheme.value ? "incomplete-row dark" : "incomplete-row light";
  }
  return "";
};

/**
 * Obtiene los períodos desde la API
 */
const fetchPeriodos = async () => {
  try {
    const response = await fetch(`${API}/periodos`);
    if (!response.ok) throw new Error("Error al obtener períodos");
    periodos.value = await response.json();
  } catch (err: any) {
    errorMensaje.value = err.message;
  }
};
onMounted(fetchPeriodos);

/**
 * Procesa el archivo Excel y lo mapea a la interfaz Internal_User.
 */
function procesarArchivo(event: any) {
  // Evita que suban archivos si no hay un período seleccionado
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
    const sheetName = workbook.SheetNames.find(
      (name) => name.toLowerCase() === "consolidado"
    );
    if (!sheetName) {
      errorMensaje.value = "El archivo no contiene una hoja llamada 'consolidado'.";
      return;
    }

    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    datosTemp.value = jsonData; // Guardamos la data completa por si la necesitas

    // Ejemplo de filtrado si lo requieres:
    // .filter((row: any) => row["TITULO_DE_LA_ASIGNATURA"] === "Práct Preprof (Consultorios I)")

    const dataFiltrada = jsonData.map((row: any) => {
      let cedulaString = row["CEDULA"]?.toString().trim() || "N/A";
      // Si la cédula tiene 9 dígitos, anteponemos un '0'
      if (cedulaString.length === 9) {
        cedulaString = "0" + cedulaString;
      }

      // Determina el área según el NRC
      const area = nrcAreaMap[row["NRC"]] || "Sin Área";

      // Campos obligatorios
      const tieneDatosObligatorios =
        cedulaString !== "N/A" &&
        row["APELLIDOS"] &&
        row["NOMBRES"] &&
        row["Correo_institucional"] &&
        (row["Telefono"] || row["Celular"]) &&
        row["NRC"];

      const usuario: Internal_User = {
        Internal_ID: cedulaString,
        Internal_LastName: row["APELLIDOS"]?.toString().trim() || "N/A",
        Internal_Name: row["NOMBRES"]?.toString().trim() || "N/A",
        Internal_Email: row["Correo_institucional"]?.toString().trim() || "N/A",
        Internal_Password: "",
        Internal_Type: "Estudiante",
        Internal_Area: area,
        Internal_Phone:
          row["Telefono"]?.toString().trim() ||
          row["Celular"]?.toString().trim() ||
          "",
        Internal_Huella: undefined,
        Internal_Status: "Activo",
        completo: !!tieneDatosObligatorios,
      };
      return usuario;
    });

    // Si es la primera carga, asignamos el array completo eliminando duplicados por Internal_ID
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
      // Si ya hay registros, actualizamos únicamente los que estén incompletos
      const newDataMap = new Map<string, Internal_User>();
      dataFiltrada.forEach((est) => {
        newDataMap.set(est.Internal_ID, est);
      });

      estudiantes.value = estudiantes.value.map((est) => {
        if (!est.completo) {
          const newEst = newDataMap.get(est.Internal_ID);
          if (newEst && newEst.completo) {
            return newEst; // Se reemplaza con la info completa
          } else {
            return est;
          }
        }
        return est;
      });
    }

    // Ordenamos para que los incompletos aparezcan primero
    estudiantes.value.sort((a, b) => {
      if (a.completo === b.completo) return 0;
      return a.completo ? 1 : -1;
    });

    // Mensaje si hay registros incompletos
    const numIncompletos = estudiantes.value.filter(
      (est) => !est.completo
    ).length;
    if (numIncompletos > 0) {
      errorMensaje.value = `Existen ${numIncompletos} estudiantes con datos incompletos. Corrige el Excel o edita manualmente.`;
    } else {
      errorMensaje.value = "";
    }
  };
  reader.readAsArrayBuffer(archivo);
}

/**
 * Guarda los registros completos en la base de datos
 */
const guardarEstudiantes = async () => {
  if (estudiantes.value.length === 0) {
    errorMensaje.value = "No hay estudiantes para guardar.";
    return;
  }
  if (estudiantes.value.some((est) => !est.completo)) {
    errorMensaje.value =
      "No se puede guardar. Hay estudiantes con datos incompletos. Corrige antes de guardar.";
    return;
  }

  try {
    loading.value = true;
    errorMensaje.value = "";

    console.log("Guardando estudiantes:", estudiantes.value);

    const responseUsuarios = await fetch(`${API}/usuariointernoBulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(estudiantes.value),
    });
    const data = await responseUsuarios.json();
    console.log("Data:", data);

    if (!responseUsuarios.ok) {
      const errorResponse = await responseUsuarios.json();
      throw new Error(`Error al guardar estudiantes: ${errorResponse.message}`);
    }



    // Asignar período si está seleccionado
    if (periodoSeleccionado.value) {
      const usuariosXPeriodo = estudiantes.value.map((est) => ({
        Periodo_ID: periodoSeleccionado.value.Periodo_ID,
        Internal_ID: est.Internal_ID,
      }));
      const responseAsignacion = await fetch(`${API}/usuarioXPeriodo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuariosXPeriodo),
      });
      if (!responseAsignacion.ok) {
        const errorResponse = await responseAsignacion.json();
        throw new Error(
          `Error al asignar estudiantes al período: ${errorResponse.message}`
        );
      }
    }

    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: "Estudiantes guardados correctamente.",
      life: 3000,
    });
    estudiantes.value = [];
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.message, life: 5000 });
  } finally {
    loading.value = false;
  }
};

/**
 * Computed para deshabilitar el botón de "Guardar"
 * Se deshabilita si no hay estudiantes, si hay registros incompletos,
 * o si no se ha seleccionado un período
 */
const isGuardarDisabled = computed(() => {
  const noEstudiantes = estudiantes.value.length === 0;
  const hayIncompletos = estudiantes.value.some((est) => !est.completo);
  const sinPeriodo = !periodoSeleccionado.value;
  return noEstudiantes || hayIncompletos || sinPeriodo || loading.value;
});

/**
 * Funciones y estado para editar un registro incompleto
 */
function editarRegistro(usuario: Internal_User) {
  // Creamos una copia del registro para no mutar directamente la tabla
  registroEditando.value = { ...usuario };
  dialogVisible.value = true;
}

function guardarEdicion() {
  if (!registroEditando.value) return;

  // Buscar el índice del registro en la tabla
  const idx = estudiantes.value.findIndex(
    (est) => est.Internal_ID === registroEditando.value!.Internal_ID
  );
  if (idx !== -1) {
    // Actualizamos con los nuevos valores
    estudiantes.value[idx] = { ...registroEditando.value };

    // Recalcular "completo"
    const user = estudiantes.value[idx];
    user.completo = !!(
      user.Internal_ID &&
      user.Internal_LastName &&
      user.Internal_Name &&
      user.Internal_Email &&
      user.Internal_Phone &&
      user.Internal_Area
    );
  }

  // **Recalcular cuántos registros incompletos quedan**
  const numIncompletos = estudiantes.value.filter((est) => !est.completo).length;
  if (numIncompletos > 0) {
    errorMensaje.value = `Existen ${numIncompletos} estudiantes con datos incompletos. Corrige el Excel o editalos.`;
  } else {
    errorMensaje.value = "";
  }

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
          optionLabel="PeriodoNombre" 
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
    </div>

    <div class="flex flex-col items-center mt-2 mb-4">
      <label class="mb-1 text-lg font-medium">Total Estudiantes Cargados :</label>
      <div class="text-xl font-bold">{{ estudiantes.length }}</div>
    </div>

    <!-- Mensaje de error en caso de datos incompletos -->
    <Message v-if="errorMensaje" severity="error" class="mb-4">{{ errorMensaje }}</Message>

    <!-- Tabla de estudiantes (muestra teléfono y área) -->
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
      <Column field="Internal_Phone" header="Teléfono" />
      <Column field="Internal_Area" header="Área" />

      <!-- Columna para el botón de edición -->
      <Column header="Acciones">
        <template #body="slotProps">
          <!-- Solo mostramos el botón si el registro está incompleto -->
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

      <!-- Dialog para editar un registro -->
      <Dialog
        v-model:visible="dialogVisible"
        :style="{ width: '600px' }"
        header="Editar Información del Estudiante"
        :modal="true"
        :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
        class="edit-dialog"
      >
        <div class="p-fluid" v-if="registroEditando">
          <!-- Sección de datos personales -->
          <div class="rounded-2xl shadow-md border border-gray-200 bg-white mb-6">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
              <i class="pi pi-user-edit text-primary-600 text-lg"></i>
              <h5 class="text-base font-semibold text-gray-700 m-0">Datos Personales</h5>
            </div>
            <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Cédula -->
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

              <!-- Apellidos -->
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

              <!-- Nombres -->
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

          <!-- Sección de contacto -->
          <div class="rounded-2xl shadow-md border border-gray-200 bg-white">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
              <i class="pi pi-envelope text-primary-600 text-lg"></i>
              <h5 class="text-base font-semibold text-gray-700 m-0">Información de Contacto</h5>
            </div>
            <div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Correo -->
              <div class="md:col-span-2">
                <label for="correo" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <InputText
                  id="correo"
                  v-model="registroEditando.Internal_Email"
                  class="w-full"
                  :class="{ 'p-invalid': !registroEditando.Internal_Email }"
                />
                <small v-if="!registroEditando.Internal_Email" class="text-red-500">El correo es requerido</small>
              </div>

              <!-- Teléfono -->
              <div>
                <label for="telefono" class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <InputText
                  id="telefono"
                  v-model="registroEditando.Internal_Phone"
                  class="w-full"
                  :class="{ 'p-invalid': !registroEditando.Internal_Phone }"
                />
                <small v-if="!registroEditando.Internal_Phone" class="text-red-500">El teléfono es requerido</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer del Dialog -->
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
/* Fila resaltada si incompleta */
::v-deep .incomplete-row.light {
  background-color: #ffe6e6 !important; /* rojo suave (modo claro) */
}
::v-deep .incomplete-row.dark {
  background-color: #7f1d1d !important; /* rojo oscuro (modo oscuro) */
}
</style>
