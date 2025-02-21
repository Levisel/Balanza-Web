<script setup>
import { ref } from "vue";
import * as XLSX from "xlsx";
import Dropdown from "primevue/dropdown";
import FileUpload from "primevue/fileupload";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Message from "primevue/message";

// Estado del Período Académico
const periodos = ref([
  { id: 1, nombre: "Periodo Académico 2024-01" },
  { id: 2, nombre: "Periodo Académico 2024-02" },
  { id: 3, nombre: "Periodo Académico 2024-03" },
  { id: 4, nombre: "Periodo Académico 2024-04" }
]);
const periodoSeleccionado = ref(null);

// Estado para almacenar los datos extraídos
const estudiantes = ref([]);

// Mensaje de error
const errorMensaje = ref("");

// Función para procesar el archivo Excel (solo `Hoja1` y filtro `Práct Preprof (Consultorios I)`)
const procesarArchivo = (event) => {
  errorMensaje.value = ""; // Limpiar errores
  estudiantes.value = []; // Resetear la tabla

  const archivo = event.files[0];
  if (!archivo) {
    errorMensaje.value = "Debe seleccionar un archivo.";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    // Verificar si `Hoja1` existe
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase() === "hoja1");
    if (!sheetName) {
      errorMensaje.value = "El archivo no contiene una hoja llamada 'Hoja1'.";
      return;
    }

    const sheet = workbook.Sheets[sheetName];

    // Convertimos la hoja en JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Filtramos solo los que tienen `TITULO_DE_LA_ASIGNATURA` igual a `Práct Preprof (Consultorios I)`
    estudiantes.value = jsonData
      .filter(row => row["TITULO_DE_LA_ASIGNATURA"] === "Práct Preprof (Consultorios I)")
      .map(row => ({
        id: row["IDENTIFICACION_ID"] || "N/A",
        nombres: row["NOMBRES"] || "N/A",
        apellidos: row["APELLIDOS"] || "N/A",
        celular: row["Celular"] || "N/A",
        correoPersonal: row["Correo_personal"] || "N/A",
        correoInstitucional: row["Correo_institucional"] || "N/A"
      }));

    if (estudiantes.value.length === 0) {
      errorMensaje.value = "No se encontraron estudiantes en 'Práct Preprof (Consultorios I)'.";
    }
  };
  reader.readAsArrayBuffer(archivo);
};

// Función de guardar (placeholder)
const guardarEstudiantes = () => {
  console.log("Guardando estudiantes...", estudiantes.value);
};
</script>

<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <h1 class="text-3xl font-bold text-center mb-10">Ingreso Estudiantes</h1>

    <!-- Selector de Período Académico y Cargar Excel -->
    <div class="flex items-center w-full max-w-6xl justify-between mb-6">
      <!-- Selector de período -->
      <div class="flex flex-col">
        <label class="mb-2 text-lg font-medium">Período Académico</label>
        <Dropdown v-model="periodoSeleccionado" :options="periodos" optionLabel="nombre" placeholder="Seleccionar Período Académico"
          class="w-72" />
      </div>

      <!-- Botón de Cargar Excel -->
      <div class="flex flex-col">
        <label class="mb-2 text-lg font-medium">Cargar Excel</label>
        <FileUpload mode="basic" accept=".xls,.xlsx" customUpload @select="procesarArchivo" chooseLabel="Seleccionar archivo xlsx" />
      </div>

      <!-- Botón de Guardar -->
      <Button label="Guardar" icon="pi pi-save" iconPos="right" class="px-6 py-3 rounded-full bg-blue-600 text-white" @click="guardarEstudiantes" />
    </div>

    <!-- Mensaje de error -->
    <Message v-if="errorMensaje" severity="error" class="mb-4">{{ errorMensaje }}</Message>

    <!-- Tabla de estudiantes -->
    <DataTable :value="estudiantes" paginator :rows="20" class="w-full max-w-6xl shadow-lg">
      <Column field="id" header="Identificación" />
      <Column field="nombres" header="Nombres" />
      <Column field="apellidos" header="Apellidos" />
      <Column field="celular" header="Celular" />
      <Column field="correoPersonal" header="Correo Personal" />
      <Column field="correoInstitucional" header="Correo Institucional" />
    </DataTable>
  </main>
</template>
