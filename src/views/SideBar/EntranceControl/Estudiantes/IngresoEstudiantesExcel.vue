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
import { API, type Periodo, type Usuario } from  "@/ApiRoute";
import { useDarkMode } from '@/components/ThemeSwitcher'; // Importa el hook para dark mode

const toast = useToast(); // Para mostrar mensajes
const { isDarkTheme } = useDarkMode(); // Extraemos la variable reactiva del modo oscuro

const periodos = ref<Periodo[]>([]);
const periodoSeleccionado = ref<Periodo | null>(null);
const estudiantes = ref<Usuario[]>([]);
const errorMensaje = ref("");
const loading = ref(false);
const archivoNombre = ref("");
const datosTemp = ref<any[]>([]); // Guardamos la data cruda del Excel

// Función que asigna clase a la fila si el registro es incompleto,
// usando el valor reactivo isDarkTheme para elegir la clase adecuada
const rowClass = (data: any) => {
  if (!data.completo) {
    return isDarkTheme.value ? 'incomplete-row dark' : 'incomplete-row light';
  }
  return '';
};

// Función para obtener los períodos desde la API
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
 * Procesa el archivo Excel:
 * - Filtra las filas por "Práct Preprof (Consultorios I)"
 * - Marca cada registro como completo (si tiene CEDULA, NOMBRES, APELLIDOS y Correo_institucional)
 * - Si es la primera carga, asigna el array completo.
 * - Si ya existen registros (carga previa), actualiza los incompletos usando la cédula.
 * - Ordena los registros para que los incompletos se muestren al inicio.
 */
function procesarArchivo(event: any) {
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
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase() === "hoja1");
    if (!sheetName) {
      errorMensaje.value = "El archivo no contiene una hoja llamada 'Hoja1'.";
      return;
    }
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    datosTemp.value = jsonData; // Guardamos la data temporalmente

    // Filtramos las filas que correspondan a la asignatura deseada
    const dataFiltrada = jsonData
      .filter((row: any) => row["TITULO_DE_LA_ASIGNATURA"] === "Práct Preprof (Consultorios I)")
      .map((row: any) => ({
        Usuario_Cedula: row["CEDULA"]?.toString().trim() || "N/A",
        Usuario_Nombres: row["NOMBRES"] || "N/A",
        Usuario_Apellidos: row["APELLIDOS"] || "N/A",
        Usuario_Correo: row["Correo_institucional"] || "N/A",
        Usuario_Area: row["AREA"] || "",
        Usuario_Activo: true,
        Usuario_Tipo: "Estudiante",
        Usuario_IsDeleted: false,
        // Se marca como completo si existen los campos obligatorios
        completo: (row["CEDULA"] && row["NOMBRES"] && row["APELLIDOS"] && row["Correo_institucional"]) ? true : false
      }));

    // Si es la primera carga, asignamos el array completo (eliminando duplicados por cédula)
    if (estudiantes.value.length === 0) {
      const ceduSet = new Set();
      estudiantes.value = dataFiltrada.filter((est: any) => {
        if (!ceduSet.has(est.Usuario_Cedula)) {
          ceduSet.add(est.Usuario_Cedula);
          return true;
        }
        return false;
      });
    } else {
      // Si ya se cargó antes, actualizamos únicamente los registros incompletos
      const newDataMap = new Map<string, any>();
      dataFiltrada.forEach((est: any) => {
        newDataMap.set(est.Usuario_Cedula, est);
      });
      estudiantes.value = estudiantes.value.map((est: any) => {
        if (!est.completo) {
          const newEst = newDataMap.get(est.Usuario_Cedula);
          if (newEst && newEst.completo) {
            return newEst; // Se actualiza con la nueva info completa
          } else {
            return est; // Se mantiene el registro incompleto
          }
        }
        return est;
      });
    }

    // Ordenamos para que los registros incompletos aparezcan al inicio
    estudiantes.value.sort((a, b) => (a.completo === b.completo ? 0 : (a.completo ? 1 : -1)));
    const numIncompletos = estudiantes.value.filter((est: any) => !est.completo).length;
    if (numIncompletos > 0) {
      errorMensaje.value = `Existen ${numIncompletos} estudiantes con datos incompletos. Corrige el Excel para poder guardarlos.`;
    } else {
      errorMensaje.value = "";
    }
  };
  reader.readAsArrayBuffer(archivo);
}

/**
 * Al guardar, se envían solo los registros completos.
 * En este enfoque, el botón de guardar se inhabilita si existe algún registro incompleto.
 */
const guardarEstudiantes = async () => {
  if (estudiantes.value.length === 0) {
    errorMensaje.value = "No hay estudiantes para guardar.";
    return;
  }
  // Si existen registros incompletos, se impide el guardado
  if (estudiantes.value.some(est => !est.completo)) {
    errorMensaje.value = "No se puede guardar. Corrige los registros incompletos y vuelve a cargar el archivo.";
    return;
  }
  try {
    loading.value = true;
    errorMensaje.value = "";

    // Guardar en la tabla Usuario
    const responseUsuarios = await fetch(`${API}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(estudiantes.value)
    });
    if (!responseUsuarios.ok) {
      const errorResponse = await responseUsuarios.json();
      throw new Error(`Error al guardar estudiantes: ${errorResponse.message}`);
    }
    // Si se seleccionó un período, asignar a UsuarioXPeriodo
    if (periodoSeleccionado.value) {
      const usuariosXPeriodo = estudiantes.value.map(est => ({
        Periodo_ID: periodoSeleccionado.value!.Periodo_ID,
        Usuario_Cedula: est.Usuario_Cedula
      }));
      const responseAsignacion = await fetch(`${API}/usuarioXPeriodo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuariosXPeriodo)
      });
      if (!responseAsignacion.ok) {
        const errorResponse = await responseAsignacion.json();
        throw new Error(`Error al asignar estudiantes al período: ${errorResponse.message}`);
      }
    }
    toast.add({ severity: "success", summary: "Éxito", detail: "Estudiantes guardados correctamente.", life: 3000 });
    // Reiniciamos la lista tras guardar
    estudiantes.value = [];
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: error.message, life: 5000 });
  } finally {
    loading.value = false;
  }
};

// El botón Guardar se deshabilita si existe algún registro incompleto o no hay registros
const isGuardarDisabled = computed(() => estudiantes.value.length === 0 || estudiantes.value.some(est => !est.completo));
</script>

<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <h1 class="text-3xl font-bold text-center mb-10">Ingreso de Estudiantes</h1>

    <!-- Mensajes Toast -->
    <Toast />

    <!-- Selector de Período y Cargar/Actualizar Excel -->
    <div class="flex items-center w-full max-w-6xl justify-between mb-6 flex-wrap">
      <div class="flex flex-col">
        <label class="mb-2 text-lg font-medium">Período Académico (Opcional)</label>
        <Dropdown 
          v-model="periodoSeleccionado" 
          :options="periodos" 
          optionLabel="PeriodoNombre" 
          placeholder="Seleccionar Período Académico (Opcional)"
          class="w-72" />
      </div>

      <div class="flex flex-col">
        <!-- Si ya se cargó un archivo, se muestra "Actualizar Excel" -->
        <label class="mb-2 text-lg font-medium">
          {{ estudiantes.length === 0 ? 'Cargar Excel' : 'Actualizar Excel' }}
        </label>
        <FileUpload 
          mode="basic" 
          accept=".xls,.xlsx" 
          customUpload 
          @select="procesarArchivo" 
          chooseLabel="Seleccionar archivo xlsx" />
      </div>

      <Button 
        :disabled="isGuardarDisabled" 
        :label="loading ? 'Guardando...' : 'Guardar'" 
        icon="pi pi-save" 
        iconPos="right"
        class="px-6 py-3 rounded-full bg-blue-600 text-white transition duration-300 hover:bg-blue-700 disabled:opacity-50"
        @click="guardarEstudiantes" />
        
    </div>

    <div class="flex flex-col items-center mt-2 mb-4">
        <label class="mb-1 text-lg font-medium">Total Estudiantes Cargados : </label>
        <div class="text-xl font-bold">{{ estudiantes.length }}</div>
      </div>

    <!-- Mensaje de error en caso de datos incompletos -->
    <Message v-if="errorMensaje" severity="error" class="mb-4">{{ errorMensaje }}</Message>

    <!-- Tabla de estudiantes, con estilo condicional para marcar los registros incompletos -->
    <DataTable 
      :value="estudiantes" 
      paginator 
      :rows="12" 
      class="w-full max-w-6xl shadow-lg"
      :rowClass="rowClass"
    >
      <Column field="Usuario_Cedula" header="Cédula" />
      <Column field="Usuario_Nombres" header="Nombres" />
      <Column field="Usuario_Apellidos" header="Apellidos" />
      <Column field="Usuario_Correo" header="Correo Institucional" />
      <Column field="Usuario_Area" header="Área" />
    </DataTable>


  </main>
</template>

<style scoped>
/* Aplicamos estilos según el modo usando clases separadas y ::v-deep para penetrar el scope */
::v-deep .incomplete-row.light {
  background-color: #ffe6e6 !important; /* rojo suave para modo claro */
}
::v-deep .incomplete-row.dark {
  background-color: #7f1d1d !important; /* rojo más oscuro para modo oscuro */
}
</style>
