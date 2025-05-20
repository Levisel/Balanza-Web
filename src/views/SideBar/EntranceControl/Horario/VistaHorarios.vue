<template>
  <main class="flex flex-col items-center p-6 min-h-screen">
<h1
  class="text-3xl font-bold mb-6"
  :style="{
    color: isDarkTheme ? '#f0f8ff' : '#0a0a0a',
    opacity: 1
  }"
>
  Visualización de Horarios
</h1>


    <Toast />

 <!-- Filtros con botón Limpiar integrado -->
<!-- Filtros con botón Limpiar integrado correctamente -->
<!-- Filtros compactos -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 w-full max-w-6xl min-w-0">
  <Dropdown
    v-model="periodoSeleccionado"
    :options="periodos"
    optionLabel="Period_Name"
    placeholder="Período"
    class="min-w-[130px]"
  />
  <Dropdown
  v-model="areaSeleccionada"
  :options="opcionesAreas"
  optionLabel="label"
  optionValue="label"
  placeholder="Área"
  class="min-w-[130px]"
/>
<InputText
    v-model="busquedaCedula"
    placeholder="Buscar por Cédula"
    class="min-w-[130px]"
  />
  <InputText
    v-model="busquedaNombre"
    placeholder="Buscar por Nombre/Apellido"
    class="min-w-[160px]"
  />
  <Button
    label="Limpiar"
    icon="pi pi-filter-slash"
    class="p-button-secondary px-3 py-2 text-sm"
    @click="limpiarFiltros"
  />
</div>


<!-- Exportar a Excel: abajo centrado -->
<div class="flex flex-col items-center mt-2 mb-6 w-full">
  <Button
    label="Exportar a Excel"
    class="p-button-info"
    :disabled="!periodoSeleccionado"
    @click="exportarAExcel"
  />
  <span
    v-if="periodoSeleccionado"
    class="text-sm text-gray-600 dark:text-gray-300 mt-2 text-center"
  >
    Exporta {{ areaSeleccionada ? `el horario del área "${areaSeleccionada}"` : 'todos los horarios del período' }}
  </span>
</div>


    <!-- Tabla de estudiantes (selección única) -->
    <div class="w-full max-w-6xl mb-6" ref="dataTableContainer">
      <DataTable
        :value="estudiantesFiltrados"
        v-model:selection="estudianteSeleccionado"
        selectionMode="single"
        paginator
        :rows="10"
        class="w-full"
        responsiveLayout="scroll"
      >
        <Column selectionMode="single" headerStyle="width: 3rem" />
        <Column field="user.Internal_ID" header="Cédula" />
        <Column field="user.Internal_Name" header="Nombres" />
        <Column field="user.Internal_LastName" header="Apellidos" />
        <Column field="user.Internal_Area" header="Área" />
      </DataTable>
    </div>

    <!-- Aquí puedes incluir la cuadrícula o más vistas adicionales (como la vista de horarios del estudiante) -->
    <div v-if="estudianteSeleccionado && schedulesSeleccionados.length" class="w-full max-w-6xl">
      <CuadriculaHorario :schedules="schedulesSeleccionados" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { API } from '@/ApiRoute'
import { useToast } from 'primevue/usetoast'

// Componentes PrimeVue y otros
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Toast from 'primevue/toast'
import CuadriculaHorario from '@/components/CuadriculaHorario.vue'
import {useSubjects} from '@/useSubjects' // ajusta la ruta si es necesario
import axios from 'axios'

// Importar XLSX y FileSaver
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/* ===== ESTADOS Y VARIABLES ===== */
const periodoSeleccionado = ref<any>(null) // Se espera objeto {Periodo_ID, PeriodoNombre, ...}
  const areaSeleccionada = ref<string | null>(null)
const busquedaNombre = ref('')
const busquedaCedula = ref('')
const periodos = ref<any[]>([])
  const { subjects: opcionesAreas, fetchSubjects } = useSubjects()

import { useDarkMode } from '@/components/ThemeSwitcher'
const { isDarkTheme } = useDarkMode()


// Arreglo de estudiantes y horarios completos
const estudiantes = ref<any[]>([])
const horariosCompletos = ref<any[]>([])
  const toast = useToast()

// Selección del estudiante en la DataTable
const estudianteSeleccionado = ref<any>(null)

// Computed: filtrar estudiantes según búsqueda
const estudiantesFiltrados = computed(() =>
  estudiantes.value.filter(est =>
    (est.user.Internal_Name?.toLowerCase().includes(busquedaNombre.value.toLowerCase()) ||
     est.user.Internal_LastName?.toLowerCase().includes(busquedaNombre.value.toLowerCase())) &&
    est.user.Internal_ID.includes(busquedaCedula.value)
  )
)

// Computed: horarios del estudiante seleccionado (filtrados por Internal_ID)
const schedulesSeleccionados = computed(() => {
  if (!estudianteSeleccionado.value) return [];

  const cedula = estudianteSeleccionado.value.user.Internal_ID;

  return horariosCompletos.value.filter(
    h => h.Internal_ID === cedula && h.Schedule_IsDeleted === 0
  );
});





// Referencia para scroll (opcional)
const dataTableContainer = ref<HTMLElement | null>(null)

/* ===== CICLO DE VIDA ===== */
onMounted(() => {
  cargarPeriodos()
  fetchSubjects()
})

watch([periodoSeleccionado, areaSeleccionada], async ([nuevoPeriodo, nuevaArea]) => {
  if (!nuevoPeriodo || !nuevaArea) {
    estudiantes.value = []
    horariosCompletos.value = []
    estudianteSeleccionado.value = null
    return
  }
  // Limpiar data previa y cargar estudiantes
  estudiantes.value = []
  horariosCompletos.value = []
  estudianteSeleccionado.value = null
  await fetchEstudiantes()
})

watch(estudianteSeleccionado, async newEst => {
  if (newEst && periodoSeleccionado.value && areaSeleccionada.value) {
    await cargarHorariosCompletos()
    await nextTick()
    dataTableContainer.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }
})

/* ===== FUNCIONES DE CARGA ===== */
async function cargarPeriodos() {
  try {
    const res = await axios.get(`${API}/periodos`);
    periodos.value = res.data;
  } catch (error) {
    console.error('Error al cargar periodos:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los períodos' });
  }
}

async function fetchEstudiantes() {
  if (!periodoSeleccionado.value || !areaSeleccionada.value) return;
  try {
    const url = `${API}/usuarioXPeriodo/periodo/${periodoSeleccionado.value.Period_ID}/area/${areaSeleccionada.value}`;
    const res = await axios.get(url);
    estudiantes.value = res.data;
    console.log('Estudiantes cargados:', estudiantes.value);
  } catch (error) {
    console.error('Error al cargar estudiantes:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los estudiantes' });
  }
}

async function cargarHorariosCompletos(soloActivos = true) {
  try {
    const pid = periodoSeleccionado.value.Period_ID;
    const areaParam = areaSeleccionada.value ? encodeURIComponent(areaSeleccionada.value) : '';
    let url = areaParam
      ? `${API}/horarioEstudiantes/completo-extraccion?periodId=${pid}&area=${areaParam}`
      : `${API}/horarioEstudiantes/completo-extraccion?periodId=${pid}`;

    const res = await axios.get(url);
    const todosLosHorarios = res.data;
    console.log("Respuesta completa de horarios:", todosLosHorarios);

    horariosCompletos.value = soloActivos
      ? todosLosHorarios.filter((h: any) => h.Schedule_IsDeleted === 0)
      : todosLosHorarios;
    
    console.log('Horarios cargados:', horariosCompletos.value);
  } catch (error) {
    console.error('Error al cargar horarios completos:', error);
  }
}




/* ===== EXPORTAR A EXCEL ===== */
async function exportarAExcel() {
  if (!periodoSeleccionado.value) return;

  const pid = periodoSeleccionado.value.Period_ID;
  const areaParam = areaSeleccionada.value ? encodeURIComponent(areaSeleccionada.value) : '';
  let url = areaParam
    ? `${API}/horarioEstudiantes/completo-extraccion?periodId=${pid}&area=${areaParam}`
    : `${API}/horarioEstudiantes/completo-extraccion?periodId=${pid}`;

  try {
    const res = await axios.get(url);
    const dataParaExportar = res.data;

    if (dataParaExportar.length === 0) {
      const mensaje = areaSeleccionada.value
        ? `No hay horarios en el período "${periodoSeleccionado.value.Period_Name}" para el área "${areaSeleccionada.value}"`
        : `No hay horarios en el período "${periodoSeleccionado.value.Period_Name}"`;

      toast.add({
        severity: 'warn',
        summary: 'Sin datos',
        detail: mensaje,
        life: 4000
      });
      return;
    }

    interface HorarioItem {
      Internal_ID: string;
      Internal_Name: string;
      Internal_LastName: string;
      Internal_Area: string;
      Schedule_Mode: string;
      Schedule_IsDeleted: number;
      Monday_Start?: string;
      Monday_End?: string;
      Monday_Type?: string;
      Tuesday_Start?: string;
      Tuesday_End?: string;
      Tuesday_Type?: string;
      Wednesday_Start?: string;
      Wednesday_End?: string;
      Wednesday_Type?: string;
      Thursday_Start?: string;
      Thursday_End?: string;
      Thursday_Type?: string;
      Friday_Start?: string;
      Friday_End?: string;
      Friday_Type?: string;
    }
    
    const dataParaExcel = dataParaExportar.map((item: HorarioItem) => ({
      Cedula: item.Internal_ID,
      Nombre: item.Internal_Name,
      Apellido: item.Internal_LastName,
      Area: item.Internal_Area,
      Horario_Modalidad: item.Schedule_Mode,
      Estado: item.Schedule_IsDeleted ? "Inactivo" : "Activo",

      Lunes_Entrada: item.Monday_Start?.slice(0, 5) || '',
      Lunes_Salida: item.Monday_End?.slice(0, 5) || '',
      Lunes_Tipo: item.Monday_Type || '',

      Martes_Entrada: item.Tuesday_Start?.slice(0, 5) || '',
      Martes_Salida: item.Tuesday_End?.slice(0, 5) || '',
      Martes_Tipo: item.Tuesday_Type || '',

      Miercoles_Entrada: item.Wednesday_Start?.slice(0, 5) || '',
      Miercoles_Salida: item.Wednesday_End?.slice(0, 5) || '',
      Miercoles_Tipo: item.Wednesday_Type || '',

      Jueves_Entrada: item.Thursday_Start?.slice(0, 5) || '',
      Jueves_Salida: item.Thursday_End?.slice(0, 5) || '',
      Jueves_Tipo: item.Thursday_Type || '',

      Viernes_Entrada: item.Friday_Start?.slice(0, 5) || '',
      Viernes_Salida: item.Friday_End?.slice(0, 5) || '',
      Viernes_Tipo: item.Friday_Type || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataParaExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Horarios");
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const fileName = areaSeleccionada.value
      ? `Horarios_${areaSeleccionada.value}_${periodoSeleccionado.value.Period_Name}.xlsx`
      : `Horarios_${periodoSeleccionado.value.Period_Name}.xlsx`;

    saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName);
  } catch (error) {
    console.error("Error al exportar horarios:", error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo exportar el archivo.',
      life: 4000
    });
  }
}


function limpiarFiltros() {
  periodoSeleccionado.value = null
  areaSeleccionada.value = ''
  busquedaNombre.value = ''
  busquedaCedula.value = ''
  estudianteSeleccionado.value = []
  estudianteSeleccionado.value = null
  horariosCompletos.value = []
}

</script>

<style scoped>

</style>
