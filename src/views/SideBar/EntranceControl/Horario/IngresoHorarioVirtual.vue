<template>
  <main class="flex flex-col items-center p-6 min-h-screen">
    <h1 class="text-3xl font-bold mb-6">Asignar Horarios Virtuales</h1>
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
  optionLabel="label"
  optionValue="value"
  placeholder="Área"
  class="w-60"
/>
<InputText
        v-model="busquedaCedula"
        placeholder="Buscar por Cédula"
        class="w-60"
      />
      <InputText
        v-model="busquedaNombre"
        placeholder="Buscar por Nombre/Apellido"
        class="w-72"
      />
      <Button
        label="Limpiar"
        icon="pi pi-filter-slash"
        class="p-button-secondary"
        @click="limpiarFiltros"
      />
    </div>

    <!-- Tabla de estudiantes -->
    <div class="w-full max-w-6xl mb-6">
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

    <!-- Sección de asignación de horarios virtuales -->
    <div v-if="estudianteSeleccionado" class="w-full max-w-6xl">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">
          Asignar Horarios (Lunes a Viernes) – Modalidad: Virtual
        </h3>
        <!-- Botón para crear horario especial virtual -->
        <Button
          label="Agregar Horario Especial"
          class="p-button-success"
          @click="dialogoHorarioEspecialVisible = true"
        />
      </div>

      <!-- Dropdowns para cada día -->
      <div
        v-for="diaObj in diasSemana"
        :key="diaObj.nombre"
        class="flex items-center gap-4 mb-2"
      >
        <span class="w-24 font-bold">{{ diaObj.nombre }}</span>

        <!-- Dropdown con opciones virtuales filtradas (solo turno opuesto al presencial) -->
        <Dropdown
  v-model="horariosSeleccionados[diaObj.nombre]"
  :options="opcionesDropdownDia(diaObj.nombre)"
  optionLabel="label"
  placeholder="Seleccionar horario"
  class="w-60"
  :disabled="horarioPresencial[diaObj.nombre]?.bloqueado"
/>


        <!-- Etiqueta informativa si existe un horario PRESENCIAL para ese día -->
        <span v-if="horarioPresencial[diaObj.nombre]" class="text-sm text-blue-700">
          Presencial: {{ horarioPresencial[diaObj.nombre].label }}
        </span>

        <!-- Botón para quitar la selección del día -->
        <Button
          icon="pi pi-trash"
          class="p-button-danger"
          @click="quitarHorario(diaObj.nombre)"
        />
      </div>

      <Button
        label="Guardar Horarios"
        class="mt-4 p-button-success"
        :disabled="isGuardando"
        @click="validarYGuardar"
      />
    </div>

    <!-- Modal para crear horario virtual especial -->
    <Dialog v-model:visible="dialogoHorarioEspecialVisible" header="Crear Horario Virtual Especial">
      <div class="flex flex-col gap-3">
        <p>Crear un horario especial (por ejemplo, 09:30 - 12:30) para Virtual.</p>
        <InputText v-model="nuevoHorarioEspecial.entrada" type="time" label="Hora Entrada" />
        <InputText v-model="nuevoHorarioEspecial.salida" type="time" label="Hora Salida" />
      </div>
      <template #footer>
        <Button label="Cancelar" @click="dialogoHorarioEspecialVisible = false" />
        <Button label="Guardar" class="p-button-success" @click="crearHorarioEspecial" />
      </template>
    </Dialog>

    <!-- Modal de error (más de 8 horas virtuales) -->
    <Dialog v-model:visible="dialogoErrorVisible" header="Error">
      <p>No puedes asignar más de 8 horas semanales en modalidad Virtual.</p>
      <template #footer>
        <Button label="Entendido" class="p-button-danger" @click="dialogoErrorVisible = false" />
      </template>
    </Dialog>

    <!-- Modal de confirmación de cambio administrativo -->
    <Dialog v-model:visible="dialogoCambioAdministrativo" header="Confirmar Cambio">
      <p>¿El cambio se realiza antes de iniciar registros de asistencia?</p>
      <template #footer>
        <Button label="Antes de registros" class="p-button-secondary" @click="guardarHorario(false)" />
        <Button label="Cambio Administrativo" class="p-button-danger" @click="guardarHorario(true)" />
      </template>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { API, type UsuarioXPeriodo, type Periodo } from "@/ApiRoute"
import { useToast } from 'primevue/usetoast'

// Componentes PrimeVue
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import { useSubjects } from '@/useSubjects'


const toast = useToast()

// Filtros y selección de estudiante
const periodos = ref<Periodo[]>([])
const estudiantes = ref<UsuarioXPeriodo[]>([])
const estudianteSeleccionado = ref<UsuarioXPeriodo | null>(null)
const periodoSeleccionado = ref<Periodo | null>(null)
const areaSeleccionada = ref<string | null>(null)
const busquedaNombre = ref('')
const busquedaCedula = ref('')
const { subjects: opcionesAreas, fetchSubjects } = useSubjects()

// Para horarios virtuales
const isGuardando = ref(false)
const horarioGuardado = ref(false)
const horarioActual = ref<any>(null)
const usuarioXPeriodoId = ref<number | null>(null)

// Cargamos todos los parámetros de horario (GET /parametroHorario) y filtramos por el rango 09:00 a 17:00
const allParametros = ref<any[]>([])
const parametroHorarioCache: Record<number, any> = {}

// Para la asignación en dropdowns (virtual)
const horariosSeleccionados = ref<Record<string, any>>({})

// Días de la semana (fijos)
const diasSemana = ref([
  { nombre: 'Lunes', horarios: [] },
  { nombre: 'Martes', horarios: [] },
  { nombre: 'Miercoles', horarios: [] },
  { nombre: 'Jueves', horarios: [] },
  { nombre: 'Viernes', horarios: [] }
])

// Horario presencial (informativo y para filtrar)
const horarioPresencial = ref<Record<string, { label: string; tipo: string; bloqueado?: boolean }>>({})

// Modales
const dialogoHorarioEspecialVisible = ref(false)
const nuevoHorarioEspecial = ref({ entrada: '', salida: '', tipo: 'Virtual' })
const dialogoErrorVisible = ref(false)
const dialogoCambioAdministrativo = ref(false)

// --- Carga inicial y watches ---

// Cargar períodos al montar
onMounted(() => {
  fetchPeriodos()
  fetchSubjects()  // 👈 agrega esto
})


// Cuando cambian período o área, limpiamos y cargamos estudiantes
watch([periodoSeleccionado, areaSeleccionada], () => {
  limpiarHorarios()
  fetchEstudiantes()
})

// Cuando se selecciona un estudiante, cargamos:
// 1. Los parámetros de horario (para opciones virtuales)  
// 2. El horario PRESENCIAL asignado (para informar y filtrar)  
// 3. El horario VIRTUAL actual (para precargar la selección, si existe)
watch(estudianteSeleccionado, async () => {
  limpiarHorarios()
  await nextTick()
  if (estudianteSeleccionado.value) {
    await cargarParametros()
    await cargarHorarioPresencial()
    await cargarHorarioVirtual()
  }
})

// --- Funciones --- 

async function fetchPeriodos() {
  try {
    const res = await fetch(`${API}/periodos`)
    periodos.value = await res.json()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los períodos' })
  }
}

async function fetchEstudiantes() {
  if (!periodoSeleccionado.value || !areaSeleccionada.value) return
  try {
    const url = `${API}/usuarioXPeriodo/periodo/${periodoSeleccionado.value.Periodo_ID}/area/${areaSeleccionada.value}`
    const res = await fetch(url)
    estudiantes.value = await res.json()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los estudiantes' })
  }
}

// Cargar todos los parámetros de horario y filtrar por rango (09:00 a 17:00)
async function cargarParametros() {
  try {
    const res = await fetch(`${API}/parametroHorario`)
    let data = res.ok ? await res.json() : []
    // Filtrar por rango (asumiendo que los tiempos vienen en formato "HH:MM:SS")
    data = data.filter((p: any) =>
      p.Parametro_Horario_Hora_Entrada >= '09:00:00' &&
      p.Parametro_Horario_Hora_Salida  <= '17:00:00'
    )
    allParametros.value = data
  } catch (err) {
    console.error('Error al cargar ParametroHorario:', err)
    allParametros.value = []
  }
}

// Limpia variables de horarios, cachés y dropdowns
function limpiarHorarios() {
  horarioGuardado.value = false
  horarioActual.value = null
  usuarioXPeriodoId.value = null
  horariosSeleccionados.value = {}
  diasSemana.value.forEach(dia => (dia.horarios = []))
  horarioPresencial.value = {}
}

// Cargar el horario PRESENCIAL asignado al estudiante (usando el endpoint sin modalidad)
// Filtramos en front según la modalidad Presencial
async function cargarHorarioPresencial() {
  if (!estudianteSeleccionado.value) return;

  try {
    const urlUXP = `${API}/usuarioXPeriodo/${periodoSeleccionado.value.Periodo_ID}/${estudianteSeleccionado.value.usuario.Internal_ID}`;
    const resUXP = await fetch(urlUXP);
    const dataUXP = await resUXP.json();
    usuarioXPeriodoId.value = dataUXP.UsuarioXPeriodo_ID;

    const urlHor = `${API}/horarioEstudiantes/completo?periodoId=${periodoSeleccionado.value.Periodo_ID}&area=${encodeURIComponent(areaSeleccionada.value)}`;
    const resHor = await fetch(urlHor);
    const todosHorarios = resHor.ok ? await resHor.json() : [];

    const horariosEstudiante = todosHorarios.filter(
      (h: any) =>
        h.Internal_ID === estudianteSeleccionado.value.usuario.Internal_ID &&
        h.Horario_Modalidad === 'Presencial'
    );

    const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];

    for (const dia of dias) {
      const turnos: string[] = [];
      const rangos: string[] = [];

      for (const h of horariosEstudiante) {
        const paramId = h[`Horario_Dia_${dia}`];
        if (!paramId) continue;

        let param = allParametros.value.find(p => p.Parametro_Horario_ID === paramId);
        if (!param) {
          const res = await fetch(`${API}/parametroHorario/${paramId}`);
          param = await res.json();
          allParametros.value.push(param);
        }

        turnos.push(param.Parametro_Horario_Tipo); // Temprano o Tarde
        const entrada = param.Parametro_Horario_Hora_Entrada.slice(0, 5);
        const salida = param.Parametro_Horario_Hora_Salida.slice(0, 5);
        rangos.push(`${entrada} - ${salida}`);
      }

      if (turnos.length > 0) {
        horarioPresencial.value[dia] = {
          label: rangos.join(' / '),
          tipo: turnos.length === 2 ? 'Ambos' : turnos[0],
          bloqueado: turnos.includes('Temprano') && turnos.includes('Tarde')
        };
      }
    }
  } catch (err) {
    console.error('Error al cargar horario presencial:', err);
  }
}


// Cargar el horario VIRTUAL asignado al estudiante (si lo hay) y asignarlo a los dropdowns
async function cargarHorarioVirtual() {
  if (!usuarioXPeriodoId.value) return
  try {
    const urlHor = `${API}/horarioEstudiantes/completo?periodoId=${periodoSeleccionado.value.Periodo_ID}&area=${encodeURIComponent(areaSeleccionada.value)}`
    const resHor = await fetch(urlHor)
    const todosHorarios = resHor.ok ? await resHor.json() : []
    const horEstudiante = todosHorarios.filter((h: any) => h.Internal_ID === estudianteSeleccionado.value.usuario.Internal_ID)
    const virtual = horEstudiante.find((h: any) => h.Horario_Modalidad === 'Virtual')
    if (virtual) {
      console.log('Horario virtual encontrado:', virtual)
      horarioActual.value = virtual
      horarioGuardado.value = true
      await asignarHorarioVirtualActual(virtual)
    }
  } catch (err) {
    console.error('Error al cargar horario virtual:', err)
  }
}

// Asigna en los dropdowns la opción virtual ya guardada (para cada día)
async function asignarHorarioVirtualActual(virtualData: any) {
  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']
  for (const dia of dias) {
    const campo = `Horario_Dia_${dia}`
    const paramId = virtualData[campo]
    if (!paramId) continue

    let paramInfo = allParametros.value.find((p: any) => p.Parametro_Horario_ID === paramId)
    if (!paramInfo) {
      paramInfo = await obtenerParametroHorario(paramId)
      if (!paramInfo) continue
      allParametros.value.push(paramInfo)
    }
    const op = {
      label: `${paramInfo.Parametro_Horario_Hora_Entrada.slice(0,5)} - ${paramInfo.Parametro_Horario_Hora_Salida.slice(0,5)}`,
      value: paramInfo.Parametro_Horario_ID,
      tipo: paramInfo.Parametro_Horario_Tipo
    }
    horariosSeleccionados.value[dia] = op
  }
}

// Obtiene un parámetro de horario por ID
async function obtenerParametroHorario(id: number) {
  try {
    const r = await fetch(`${API}/parametroHorario/${id}`)
    if (!r.ok) return null
    return r.json()
  } catch (err) {
    console.error(err)
    return null
  }
}

/** Computed: filtra estudiantes por nombre/cédula */
const estudiantesFiltrados = computed(() => {
  return estudiantes.value.filter(est => {
    const nom = est.usuario.Internal_Name?.toLowerCase() || ''
    const ape = est.usuario.Internal_LastName?.toLowerCase() || ''
    const ced = est.usuario.Internal_ID || ''
    return (
      (nom.includes(busquedaNombre.value.toLowerCase()) ||
       ape.includes(busquedaNombre.value.toLowerCase())) &&
      ced.includes(busquedaCedula.value)
    )
  })
})

// Función para filtrar las opciones del dropdown de un día
function opcionesDropdownDia(dayName: string) {
  if (!allParametros.value.length) return []
  let opciones = allParametros.value.map((p: any) => ({
    label: `${p.Parametro_Horario_Hora_Entrada.slice(0,5)} - ${p.Parametro_Horario_Hora_Salida.slice(0,5)}`,
    value: p.Parametro_Horario_ID,
    tipo: p.Parametro_Horario_Tipo
  }))
  const pres = horarioPresencial.value[dayName]
  if (pres && pres.tipo) {
    opciones = opciones.filter(op => op.tipo !== pres.tipo)
  }
  return opciones
}

// Quitar la selección de un día
function quitarHorario(dia: string) {
  horariosSeleccionados.value[dia] = null
}

// Calcular el total de horas virtuales (sólo las asignadas en los dropdowns virtuales)
function calcularHorasTotales(): number {
  let total = 0
  for (const dia in horariosSeleccionados.value) {
    const sel = horariosSeleccionados.value[dia]
    if (!sel || !sel.label) continue
    if (sel.label.includes(' - ')) {
      const [iniStr, finStr] = sel.label.split(' - ')
      const ini = parseInt(iniStr.slice(0,2), 10)
      const fin = parseInt(finStr.slice(0,2), 10)
      total += (fin - ini)
    }
  }
  console.log('Total horas virtuales:', total)
  return total
}

// Validar y guardar: se verifica que no supere 8 horas virtuales y que no se solape con presencial
async function validarYGuardar() {
  if (isGuardando.value) return
  if (calcularHorasTotales() > 8) {
    dialogoErrorVisible.value = true
    return
  }
  if (await verificarSolapamientoConPresencial()) {
    toast.add({
      severity: 'error',
      summary: 'Solapamiento',
      detail: 'El horario virtual se cruza con el horario presencial.'
    })
    return
  }
  if (horarioGuardado.value) {
    dialogoCambioAdministrativo.value = true
  } else {
    await guardarHorario(false)
  }
}

// Verificar que ningún turno virtual se solape con el turno presencial asignado
async function verificarSolapamientoConPresencial(): Promise<boolean> {
  for (const dia of Object.keys(horariosSeleccionados.value)) {
    const sel = horariosSeleccionados.value[dia]
    if (!sel) continue
    const [iniVStr, finVStr] = sel.label.split(' - ')
    const iniV = parseInt(iniVStr.slice(0,2), 10)
    const finV = parseInt(finVStr.slice(0,2), 10)
    const presObj = horarioPresencial.value[dia]
    if (!presObj) continue
    const [iniPStr, finPStr] = presObj.label.split(' - ')
    const iniP = parseInt(iniPStr.slice(0,2), 10)
    const finP = parseInt(finPStr.slice(0,2), 10)
    if (iniV < finP && finV > iniP) {
      return true
    }
  }
  return false
}

// Guardar el horario virtual (POST, PUT o cambio administrativo)
async function guardarHorario(esCambioAdministrativo: boolean) {
  if (isGuardando.value) return
  isGuardando.value = true

  const nuevoHorario = {
    Horario_Dia_Lunes: horariosSeleccionados.value['Lunes']?.value || null,
    Horario_Dia_Martes: horariosSeleccionados.value['Martes']?.value || null,
    Horario_Dia_Miercoles: horariosSeleccionados.value['Miercoles']?.value || null,
    Horario_Dia_Jueves: horariosSeleccionados.value['Jueves']?.value || null,
    Horario_Dia_Viernes: horariosSeleccionados.value['Viernes']?.value || null,
    Horario_Modalidad: 'Virtual'
  }

  let url = ''
  let method = 'POST'
  let body = {}

  if (!horarioGuardado.value) {
    nuevoHorario['UsuarioXPeriodo_ID'] = usuarioXPeriodoId.value
    url = `${API}/horarioEstudiantes`
    body = JSON.stringify(nuevoHorario)
  } else {
    if (esCambioAdministrativo) {
      url = `${API}/horarioEstudiantes/cambio-administrativo`
      body = JSON.stringify({
        usuarioXPeriodoId: usuarioXPeriodoId.value,
        nuevosHorarios: [nuevoHorario]
      })
    } else {
      if (horarioActual.value && horarioActual.value.Horario_ID) {
        url = `${API}/horarioEstudiantes/${horarioActual.value.Horario_ID}`
        method = 'PUT'
        body = JSON.stringify(nuevoHorario)
      } else {
        url = `${API}/horarioEstudiantes`
        body = JSON.stringify(nuevoHorario)
      }
    }
  }

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body
    })
    const respJson = await res.json()
    if (res.ok) {
      toast.add({
        severity: 'success',
        summary: 'Horario Virtual Guardado',
        detail: 'Se asignó correctamente.'
      })
      if (!horarioGuardado.value || method === 'PUT') {
        horarioGuardado.value = true
        if (method === 'PUT') {
          horarioActual.value = respJson
        }
      }
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el horario virtual.' })
    }
  } catch (error) {
    console.error('Error al guardar horario virtual:', error)
  } finally {
    isGuardando.value = false
    dialogoCambioAdministrativo.value = false
  }
}

async function crearHorarioEspecial() {
  const entrada = nuevoHorarioEspecial.value.entrada;
  const salida = nuevoHorarioEspecial.value.salida;
  if (!entrada || !salida) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Debe ingresar la hora de entrada y salida.'
    })
    return
  }

  const entradaNum = parseInt(entrada.replace(":", ""));
  const salidaNum = parseInt(salida.replace(":", ""));

  if (entradaNum >= salidaNum) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'La hora de entrada debe ser menor que la hora de salida.'
    })
    return
  }

  let tipoCalculado = '';
  if (entradaNum >= 700 && salidaNum <= 1300) {
    tipoCalculado = 'Temprano';
  } else if (entradaNum >= 1301 && salidaNum <= 2100) {
    tipoCalculado = 'Tarde';
  } else {
    toast.add({
      severity: 'error',
      summary: 'Horario Inválido',
      detail: 'El horario debe estar completamente entre 07:00-13:00 (Temprano) o 13:01-21:00 (Tarde).'
    });
    return;
  }

  const payload = {
    Parametro_Horario_Hora_Entrada: entrada,
    Parametro_Horario_Hora_Salida: salida,
    Parametro_Horario_Tipo: tipoCalculado
  };

  try {
    const res = await fetch(`${API}/parametroHorario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      toast.add({
        severity: 'success',
        summary: 'Horario Especial Creado',
        detail: 'Se registró correctamente.'
      });
      dialogoHorarioEspecialVisible.value = false;
      nuevoHorarioEspecial.value.entrada = '';
      nuevoHorarioEspecial.value.salida = '';
      await cargarParametros();
    } else {
      const errorText = await res.text();
      console.error('Error al crear horario especial:', errorText);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo crear el horario especial.'
      });
    }
  } catch (error) {
    console.error('Error al crear horario especial:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo crear el horario especial.'
    });
  }
}


// Dentro de cargarHorarios(), se ajustan las URLs de disponibilidad
async function cargarHorarios() {
  if (!estudianteSeleccionado.value) return;
  try {
    const usuarioRes = await fetch(
      `${API}/usuarioxperiodo/${periodoSeleccionado.value.Periodo_ID}/${estudianteSeleccionado.value.usuario.Internal_ID}`
    );
    const usuarioData = await usuarioRes.json();
    usuarioXPeriodoId.value = usuarioData.UsuarioXPeriodo_ID;
  } catch (error) {
    console.error("Error al obtener usuarioXPeriodo", error);
    return;
  }
}


// Limpiar filtros y data
function limpiarFiltros() {
  periodoSeleccionado.value = null
  areaSeleccionada.value = null
  busquedaNombre.value = ''
  busquedaCedula.value = ''
  estudianteSeleccionado.value = null
  estudiantes.value = []
  limpiarHorarios()
}
</script>

<style scoped>
/* Ajusta estilos según prefieras, sin fondos agresivos */
</style>
