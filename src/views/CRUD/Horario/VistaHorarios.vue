<!-- VistaHorarios.vue -->
<template>
  <main class="flex flex-col items-center p-6 min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-sky-50">Visualización de Horarios</h1>
    <Toast />

    <!-- Filtros -->
    <div class="flex gap-4 mb-4 w-full max-w-6xl">
      <Dropdown
        v-model="periodoSeleccionado"
        :options="periodos"
        optionLabel="PeriodoNombre"
        placeholder="Período"
        class="w-60"
      />
      <Dropdown
        v-model="areaSeleccionada"
        :options="opcionesAreas"
        placeholder="Área"
        class="w-60"
      />
      <InputText
        v-model="busquedaNombre"
        placeholder="Buscar por Nombre/Apellido"
        class="w-72"
      />
      <InputText
        v-model="busquedaCedula"
        placeholder="Buscar por Cédula"
        class="w-60"
      />
      <Button
        label="Limpiar"
        icon="pi pi-filter-slash"
        class="p-button-secondary"
        @click="limpiarFiltros"
      />
    </div>

    <!-- Tabla de estudiantes (1 registro por página: siempre 10 filas) -->
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
        <Column field="usuario.Usuario_Cedula" header="Cédula" />
        <Column field="usuario.Usuario_Nombres" header="Nombres" />
        <Column field="usuario.Usuario_Apellidos" header="Apellidos" />
        <Column field="usuario.Usuario_Area" header="Área" />
      </DataTable>
    </div>

<!-- Cuadrícula de Horarios para el estudiante seleccionado -->
<div v-if="estudianteSeleccionado && schedulesSeleccionados.length" class="w-full max-w-6xl">
  <CuadriculaHorario :schedules="schedulesSeleccionados" />
</div>


  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { API } from '@/views/Interfaces'

// Componentes PrimeVue
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Toast from 'primevue/toast'

// Nuestro componente de cuadrícula
import CuadriculaHorario from '@/components/CuadriculaHorario.vue'

// Filtros y selección
const periodoSeleccionado = ref<any>(null)  // Se espera un objeto {Periodo_ID, PeriodoNombre, ...}
const areaSeleccionada = ref<string>('')
const busquedaNombre = ref('')
const busquedaCedula = ref('')

// Opciones para dropdowns
const periodos = ref<any[]>([])
const opcionesAreas = ref([
  'Derecho Penal',
  'Derecho Civil',
  'Niñez y Adolescencia',
  'Movilidad Humana'
])

// Arreglo para almacenar estudiantes y registros completos de horarios
const estudiantes = ref<any[]>([])
const horariosCompletos = ref<any[]>([])

// Selección del estudiante en la DataTable
const estudianteSeleccionado = ref<any>(null)

// Computed: filtrar estudiantes según búsqueda
const estudiantesFiltrados = computed(() => {
  const name = busquedaNombre.value.toLowerCase()
  const ced = busquedaCedula.value
  return estudiantes.value.filter(est => {
    const nombre = est.usuario.Usuario_Nombres?.toLowerCase() || ''
    const apellido = est.usuario.Usuario_Apellidos?.toLowerCase() || ''
    const cedula = est.usuario.Usuario_Cedula || ''
    return (
      (nombre.includes(name) || apellido.includes(name)) &&
      cedula.includes(ced)
    )
  })
})

// Computed: extraer todos los registros de horario del estudiante seleccionado (por cédula)
const schedulesSeleccionados = computed(() => {
  if (!estudianteSeleccionado.value) return []
  const ced = estudianteSeleccionado.value.usuario.Usuario_Cedula
  return horariosCompletos.value.filter((registro: any) => registro.Usuario_Cedula === ced)
})



// Cargar períodos al montar
onMounted(() => {
  cargarPeriodos()
})

// Cuando cambian período o área, limpiamos la data y cargamos los estudiantes
watch([periodoSeleccionado, areaSeleccionada], async ([nuevoPeriodo, nuevaArea]) => {
  if (!nuevoPeriodo || !nuevaArea) {
    estudiantes.value = []
    horariosCompletos.value = []
    estudianteSeleccionado.value = null
    return
  }
  // Limpiar data previa (sin resetear los filtros de período o área)
  estudiantes.value = []
  horariosCompletos.value = []
  estudianteSeleccionado.value = null
  await fetchEstudiantes()
})

// Cuando se selecciona un estudiante, cargar los horarios completos y desplazar la vista
watch(estudianteSeleccionado, async newEst => {
  if (newEst && periodoSeleccionado.value && areaSeleccionada.value) {
    await cargarHorariosCompletos()
    await nextTick()
    // Desplazar la vista para que se muestre la cuadrícula
    dataTableContainer.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }
})

// Referencia al contenedor de la DataTable (para scroll)
const dataTableContainer = ref<HTMLElement | null>(null)

// Función para cargar períodos (GET /periodos)
async function cargarPeriodos() {
  try {
    const res = await fetch(`${API}/periodos`)
    periodos.value = await res.json()
  } catch (error) {
    console.error('Error al cargar periodos:', error)
  }
}

// Función para cargar estudiantes (GET /usuarioXPeriodo/periodo/:periodoId/area/:area)
async function fetchEstudiantes() {
  try {
    const url = `${API}/usuarioXPeriodo/periodo/${periodoSeleccionado.value.Periodo_ID}/area/${areaSeleccionada.value}`
    const res = await fetch(url)
    estudiantes.value = await res.json()
    console.log('Estudiantes cargados:', estudiantes.value)
  } catch (err) {
    console.error('Error al cargar estudiantes:', err)
  }
}

// Función para cargar horarios completos (GET /horario/completo?periodoId=X&area=Y)
async function cargarHorariosCompletos() {
  try {
    const pid = periodoSeleccionado.value.Periodo_ID
    const area = encodeURIComponent(areaSeleccionada.value)
    const url = `${API}/horario/completo?periodoId=${pid}&area=${area}`
    const res = await fetch(url)
    horariosCompletos.value = await res.json()
    console.log('Horarios completos cargados:', horariosCompletos.value)
  } catch (err) {
    console.error('Error al cargar horarios completos:', err)
  }
}

// Función para limpiar filtros y datos (sin resetear los dropdowns de período y área)
function limpiarFiltros() {
  areaSeleccionada.value = ''
  periodoSeleccionado.value = null
  busquedaNombre.value = ''
  busquedaCedula.value = ''
  estudiantes.value = []
  horariosCompletos.value = []
  estudianteSeleccionado.value = null
}
</script>

<style scoped>
/* Estilos personalizados sin fondos agresivos */
</style>
