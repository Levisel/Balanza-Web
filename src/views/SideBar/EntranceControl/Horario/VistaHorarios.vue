<template>
  <main class="flex flex-col items-center p-6 min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-sky-50">
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
    optionLabel="PeriodoNombre"
    placeholder="Período"
    class="min-w-[130px]"
  />
  <Dropdown
  v-model="areaSeleccionada"
  :options="opcionesAreas"
  optionLabel="label"
  optionValue="value"
  placeholder="Área"
  class="min-w-[130px]"
/>

  <InputText
    v-model="busquedaNombre"
    placeholder="Buscar por Nombre/Apellido"
    class="min-w-[160px]"
  />
  <InputText
    v-model="busquedaCedula"
    placeholder="Buscar por Cédula"
    class="min-w-[130px]"
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
        <Column field="usuario.Internal_ID" header="Cédula" />
        <Column field="usuario.Internal_Name" header="Nombres" />
        <Column field="usuario.Internal_LastName" header="Apellidos" />
        <Column field="usuario.Internal_Area" header="Área" />
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


// Arreglo de estudiantes y horarios completos
const estudiantes = ref<any[]>([])
const horariosCompletos = ref<any[]>([])
  const toast = useToast()

// Selección del estudiante en la DataTable
const estudianteSeleccionado = ref<any>(null)

// Computed: filtrar estudiantes según búsqueda
const estudiantesFiltrados = computed(() =>
  estudiantes.value.filter(est =>
    (est.usuario.Internal_Name?.toLowerCase().includes(busquedaNombre.value.toLowerCase()) ||
     est.usuario.Internal_LastName?.toLowerCase().includes(busquedaNombre.value.toLowerCase())) &&
    est.usuario.Internal_ID.includes(busquedaCedula.value)
  )
)

// Computed: horarios del estudiante seleccionado (filtrados por Internal_ID)
const schedulesSeleccionados = computed(() => {
  if (!estudianteSeleccionado.value) return []
  const ced = estudianteSeleccionado.value.usuario.Internal_ID
  return horariosCompletos.value.filter((registro: any) => registro.Internal_ID === ced)
})

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
    const res = await fetch(`${API}/periodos`)
    periodos.value = await res.json()
  } catch (error) {
    console.error('Error al cargar periodos:', error)
    useToast().add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los períodos' })
  }
}

async function fetchEstudiantes() {
  if (!periodoSeleccionado.value || !areaSeleccionada.value) return
  try {
    const url = `${API}/usuarioXPeriodo/periodo/${periodoSeleccionado.value.Periodo_ID}/area/${areaSeleccionada.value}`
    const res = await fetch(url)
    estudiantes.value = await res.json()
    console.log('Estudiantes cargados:', estudiantes.value)
  } catch (error) {
    console.error('Error al cargar estudiantes:', error)
    useToast().add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los estudiantes' })
  }
}

async function cargarHorariosCompletos() {

  
  try {
    const pid = periodoSeleccionado.value.Periodo_ID
    // Si se selecciona área, incluirla; de lo contrario, traer de todas las áreas.
    const areaParam = areaSeleccionada.value ? encodeURIComponent(areaSeleccionada.value) : ''
    let url = ''
    if (areaParam) {
      url = `${API}/horarioEstudiantes/completo-extraccion?periodoId=${pid}&area=${areaParam}`
    } else {
      url = `${API}/horarioEstudiantes/completo-extraccion?periodoId=${pid}`
    }
    const res = await fetch(url)
    horariosCompletos.value = await res.json()
    console.log('Horarios completos cargados:', horariosCompletos.value)
  } catch (error) {
    console.error('Error al cargar horarios completos:', error)
  }
}

/* ===== EXPORTAR A EXCEL ===== */
async function exportarAExcel() {
  if (!periodoSeleccionado.value) return

  // Cargar los horarios completos (incluyendo eliminados) del período y área (opcional)
  await cargarHorariosCompletos()

  // Mostrar Toast si no hay horarios
if (horariosCompletos.value.length === 0) {
  const mensaje = areaSeleccionada.value
    ? `No hay horarios en el período "${periodoSeleccionado.value.PeriodoNombre}" para el área "${areaSeleccionada.value}"`
    : `No hay horarios en el período "${periodoSeleccionado.value.PeriodoNombre}"`

  toast.add({
    severity: 'warn',
    summary: 'Sin datos',
    detail: mensaje,
    life: 4000
  })
  return
}


  // Transformar los datos para el Excel
  const dataParaExcel = horariosCompletos.value.map(item => {
    return {
      Cedula: item.Internal_ID,
      Nombre: item.Internal_Name,
      Apellido: item.Internal_LastName,
      Area: item.Internal_Area,
      Horario_Modalidad: item.Horario_Modalidad,
      Estado: item.Horario_IsDeleted ? "Inactivo" : "Activo",
      Lunes_Entrada: item.Lunes_Entrada,
      Lunes_Salida: item.Lunes_Salida,
      Lunes_Tipo: item.Lunes_Tipo,
      Martes_Entrada: item.Martes_Entrada,
      Martes_Salida: item.Martes_Salida,
      Martes_Tipo: item.Martes_Tipo,
      Miercoles_Entrada: item.Miercoles_Entrada,
      Miercoles_Salida: item.Miercoles_Salida,
      Miercoles_Tipo: item.Miercoles_Tipo,
      Jueves_Entrada: item.Jueves_Entrada,
      Jueves_Salida: item.Jueves_Salida,
      Jueves_Tipo: item.Jueves_Tipo,
      Viernes_Entrada: item.Viernes_Entrada,
      Viernes_Salida: item.Viernes_Salida,
      Viernes_Tipo: item.Viernes_Tipo
    }
  })

  // Crear la hoja de cálculo usando XLSX
  const worksheet = XLSX.utils.json_to_sheet(dataParaExcel)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Horarios")

  // Escribir el workbook en formato binario
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

  // Construir el nombre del archivo
  const fileName = areaSeleccionada.value
    ? `Horarios_${areaSeleccionada.value}_${periodoSeleccionado.value.PeriodoNombre}.xlsx`
    : `Horarios_${periodoSeleccionado.value.PeriodoNombre}.xlsx`

  // Usar FileSaver para forzar la descarga
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName)
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
/* Personaliza tus estilos aquí */
</style>
