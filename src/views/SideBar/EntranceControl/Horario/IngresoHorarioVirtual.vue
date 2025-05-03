<template>
  <main class="flex flex-col items-center p-6 min-h-screen">
    <h1 class="text-3xl font-bold mb-6">Asignar Horarios Virtuales</h1>
    <Toast />

    <!-- Filtros -->
    <div class="flex gap-4 mb-4 w-full max-w-6xl">
      <Dropdown
        v-model="periodoSeleccionado"
        :options="periodos"
        optionLabel="Period_Name"
        placeholder="Período"
        class="w-60"
      />
      <Dropdown
  v-model="areaSeleccionada"
  :options="opcionesAreas"
  optionLabel="label"
  optionValue="label"
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
        <Column field="user.Internal_ID" header="Cédula" />
        <Column field="user.Internal_Name" header="Nombres" />
        <Column field="user.Internal_LastName" header="Apellidos" />
        <Column field="user.Internal_Area" header="Área" />
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
        <Button
          label="Cambiar máximo de horas"
          icon="pi pi-cog"
          class="p-button-secondary"
          @click="abrirDialogoMaxHoras"
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
        <Button label="Cancelar" class="p-button-danger" @click="dialogoHorarioEspecialVisible = false" />
        <Button label="Guardar" class="p-button-success" @click="crearHorarioEspecial" />
      </template>
    </Dialog>

    <!-- Modal de error (más de 8 horas virtuales) -->
    <Dialog v-model:visible="dialogoErrorVisible" header="Error">
      <p>No puedes asignar más de {{ maxHorasVirtuales }} horas semanales en modalidad Virtual.</p>
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

    <Dialog v-model:visible="mostrarDialogoMaxHoras" header="Cambiar máximo de horas permitidas">
  <div class="p-4">
    <p>Valor actual: <strong>{{ maxHorasVirtuales }}</strong> horas</p>
    <p class="mt-2">Ingrese un nuevo máximo (entre 1 y 100):</p>
    <InputNumber
      v-model="nuevoMaxHoras"
      :min="1"
      :max="100"
      showButtons
      class="w-full mt-2"
    />
  </div>
  <template #footer>
    <Button label="Cancelar"    @click="mostrarDialogoMaxHoras = false" />
    <Button 
      label="Guardar" 
      class="p-button-success" 
      @click="guardarNuevoMaximoHoras" 
    />
  </template>
</Dialog>

  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { API, type UserXPeriod, type Period } from "@/ApiRoute"
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
import axios from 'axios'


const toast = useToast()

// Filtros y selección de estudiante
const periodos = ref<Period[]>([])
const estudiantes = ref<UserXPeriod[]>([])
const estudianteSeleccionado = ref<UserXPeriod | null>(null)
const periodoSeleccionado = ref<Period | null>(null)
const areaSeleccionada = ref<string | null>(null)
const busquedaNombre = ref('')
const busquedaCedula = ref('')
const { subjects: opcionesAreas, fetchSubjects } = useSubjects()

const maxHorasVirtuales = ref(8); // valor por defecto
const mostrarDialogoMaxHoras = ref(false);
const nuevoMaxHoras = ref(8);

function abrirDialogoMaxHoras() {
  nuevoMaxHoras.value = maxHorasVirtuales.value;
  mostrarDialogoMaxHoras.value = true;
}

function guardarNuevoMaximoHoras() {
  if (nuevoMaxHoras.value < 1 || nuevoMaxHoras.value > 100) {
    toast.add({
      severity: 'error',
      summary: 'Valor inválido',
      detail: 'Debe estar entre 1 y 100',
      life: 3000
    });
    return;
  }
  maxHorasVirtuales.value = nuevoMaxHoras.value;
  mostrarDialogoMaxHoras.value = false;
  toast.add({
    severity: 'success',
    summary: 'Máximo actualizado',
    detail: `Nuevo límite: ${nuevoMaxHoras.value} horas`,
    life: 3000
  });
}



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
  { nombre: 'Monday', horarios: [] },
  { nombre: 'Tuesday', horarios: [] },
  { nombre: 'Wednesday', horarios: [] },
  { nombre: 'Thursday', horarios: [] },
  { nombre: 'Friday', horarios: [] }
]);


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
    const res = await axios.get(`${API}/periodos`);
    periodos.value = res.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los períodos' });
  }
}


async function fetchEstudiantes() {
  if (!periodoSeleccionado.value || !areaSeleccionada.value) return;
  try {
    const url = `${API}/usuarioXPeriodo/periodo/${periodoSeleccionado.value.Period_ID}/area/${areaSeleccionada.value}`;
    const res = await axios.get(url);
    estudiantes.value = res.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los estudiantes' });
  }
}


// Cargar todos los parámetros de horario y filtrar por rango (09:00 a 17:00)
async function cargarParametros() {
  try {
    const res = await axios.get(`${API}/parametroHorario`);
    let data = res.data || [];
    data = data.filter((p: any) =>
      p.Parameter_Schedule_Start_Time >= '09:00:00' &&
      p.Parameter_Schedule_End_Time <= '17:00:00'
    );
    allParametros.value = data;
  } catch (err) {
    console.error('Error al cargar ParametroHorario:', err);
    allParametros.value = [];
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
    const resUXP = await axios.get(`${API}/usuarioXPeriodo/${periodoSeleccionado.value.Period_ID}/${estudianteSeleccionado.value.user.Internal_ID}`);
    const dataUXP = resUXP.data;
    usuarioXPeriodoId.value = dataUXP.UserXPeriod_ID;

    const resHor = await axios.get(`${API}/horarioEstudiantes/completo?periodId=${periodoSeleccionado.value.Period_ID}&area=${encodeURIComponent(areaSeleccionada.value)}`);
    const todosHorarios = resHor.data || [];

    const horariosEstudiante = todosHorarios.filter(
      (h: any) => h.Internal_ID === estudianteSeleccionado.value.user.Internal_ID && h.Schedule_Mode === 'Presencial' && h.Schedule_IsDeleted === 0
    );

    const dias = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const dia of dias) {
      const turnos: string[] = [];
      const rangos: string[] = [];

      for (const h of horariosEstudiante) {
        const paramId = h[`Schedule_Day_${dia}`];
        if (!paramId) continue;

        let param = allParametros.value.find(p => p.Parameter_Schedule_ID === paramId);
        if (!param) {
          const res = await axios.get(`${API}/parametroHorario/${paramId}`);
          param = res.data;
          allParametros.value.push(param);
        }

        turnos.push(param.Parameter_Schedule_Type);
        const entrada = param.Parameter_Schedule_Start_Time.slice(0, 5);
        const salida = param.Parameter_Schedule_End_Time.slice(0, 5);
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
  if (!usuarioXPeriodoId.value) return;
  try {
    const resHor = await axios.get(`${API}/horarioEstudiantes/completo?periodId=${periodoSeleccionado.value.Period_ID}&area=${encodeURIComponent(areaSeleccionada.value)}`);
    const todosHorarios = resHor.data || [];
    const horEstudiante = todosHorarios.filter((h: any) => h.Internal_ID === estudianteSeleccionado.value.user.Internal_ID);
    const virtual = horEstudiante.find(
      (h: any) => h.Schedule_Mode === 'Virtual' && h.Schedule_IsDeleted === 0
    );

    if (virtual) {
      horarioActual.value = virtual;
      horarioGuardado.value = true;
      await asignarHorarioVirtualActual(virtual);
    }
  } catch (err) {
    console.error('Error al cargar horario virtual:', err);
  }
}


// Asigna en los dropdowns la opción virtual ya guardada (para cada día)
async function asignarHorarioVirtualActual(virtualData: any) {
  const dias = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  for (const dia of dias) {
    const campo = `Schedule_Day_${dia}`;
    const paramId = virtualData[campo];
    if (!paramId) continue;

    let paramInfo = allParametros.value.find((p: any) => p.Parameter_Schedule_ID === paramId);
    if (!paramInfo) {
      paramInfo = await obtenerParametroHorario(paramId);
      if (!paramInfo) continue;
      allParametros.value.push(paramInfo);
    }

    const op = {
      label: `${paramInfo.Parameter_Schedule_Start_Time.slice(0, 5)} - ${paramInfo.Parameter_Schedule_End_Time.slice(0, 5)}`,
      value: paramInfo.Parameter_Schedule_ID,
      tipo: paramInfo.Parameter_Schedule_Type
    };

    horariosSeleccionados.value[dia] = op;
  }
}


// Obtiene un parámetro de horario por ID
async function obtenerParametroHorario(id: number) {
  try {
    const res = await axios.get(`${API}/parametroHorario/${id}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
}


/** Computed: filtra estudiantes por nombre/cédula */
const estudiantesFiltrados = computed(() => {
  return estudiantes.value.filter(est => {
    const nom = est.user.Internal_Name?.toLowerCase() || ''
    const ape = est.user.Internal_LastName?.toLowerCase() || ''
    const ced = est.user.Internal_ID || ''
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
    label: `${p.Parameter_Schedule_Start_Time.slice(0,5)} - ${p.Parameter_Schedule_End_Time.slice(0,5)}`,
    value: p.Parameter_Schedule_ID,
    tipo: p.Parameter_Schedule_Type
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
  if (isGuardando.value) return;

  // 🔒 Validación nueva
  const hayAlMenosUno = Object.values(horariosSeleccionados.value).some(h => h && h.value);
  if (!hayAlMenosUno) {
    toast.add({
      severity: 'warn',
      summary: 'Horario vacío',
      detail: 'Debe seleccionar al menos un horario antes de guardar.',
      life: 3000
    });
    return;
  }

  if (calcularHorasTotales() > maxHorasVirtuales.value) {
    dialogoErrorVisible.value = true;
    return;
  }

  if (await verificarSolapamientoConPresencial()) {
    toast.add({
      severity: 'error',
      summary: 'Solapamiento',
      detail: 'El horario virtual se cruza con el horario presencial.'
    });
    return;
  }

  if (horarioGuardado.value) {
    dialogoCambioAdministrativo.value = true;
  } else {
    await guardarHorario(false);
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
  if (isGuardando.value) return;
  isGuardando.value = true;

  const nuevoHorario = {
    Schedule_Day_Monday: horariosSeleccionados.value['Monday']?.value || null,
    Schedule_Day_Tuesday: horariosSeleccionados.value['Tuesday']?.value || null,
    Schedule_Day_Wednesday: horariosSeleccionados.value['Wednesday']?.value || null,
    Schedule_Day_Thursday: horariosSeleccionados.value['Thursday']?.value || null,
    Schedule_Day_Friday: horariosSeleccionados.value['Friday']?.value || null,
    Schedule_Mode: 'Virtual'
  };

  try {
    if (!horarioGuardado.value) {
      // No había horario, se crea
      nuevoHorario['UserXPeriod_ID'] = usuarioXPeriodoId.value;
      await axios.post(`${API}/horarioEstudiantes`, nuevoHorario);
    } else {
      if (esCambioAdministrativo) {
        // Cambio administrativo: se guarda con historial
        await axios.post(`${API}/horarioEstudiantes/cambio-administrativo`, {
          userXPeriodId: usuarioXPeriodoId.value,
          newSchedules: [nuevoHorario]
        });
      } else {
        // Modificación normal: actualizar el existente
        if (horarioActual.value?.Schedule_Students_ID) {
          await axios.put(`${API}/horarioEstudiantes/${horarioActual.value.Schedule_Students_ID}`, nuevoHorario);
        } else {
          // No existía registro previo, crear uno nuevo
          nuevoHorario['UserXPeriod_ID'] = usuarioXPeriodoId.value;
          await axios.post(`${API}/horarioEstudiantes`, nuevoHorario);
        }
      }
    }

    toast.add({
      severity: 'success',
      summary: 'Horario Virtual Guardado',
      detail: 'Se asignó correctamente.',
      life: 5000
    });
    horarioGuardado.value = true;
  } catch (error) {
    console.error('Error al guardar horario virtual:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo guardar el horario virtual.'
    });
  } finally {
    isGuardando.value = false;
    dialogoCambioAdministrativo.value = false;
  }
}


async function crearHorarioEspecial() {
  const entrada = nuevoHorarioEspecial.value.entrada;
  const salida = nuevoHorarioEspecial.value.salida;

  if (!entrada || !salida) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Debe ingresar la hora de entrada y salida.' });
    return;
  }

  const payload = {
    Parameter_Schedule_Start_Time: entrada,
    Parameter_Schedule_End_Time: salida,
    Parameter_Schedule_Type: (parseInt(entrada.replace(":", "")) <= 1300) ? 'Temprano' : 'Tarde'
  };

  try {
    await axios.post(`${API}/parametroHorario`, payload);

    toast.add({ severity: 'success', summary: 'Horario Especial Creado', detail: 'Se registró correctamente.' });
    dialogoHorarioEspecialVisible.value = false;
    nuevoHorarioEspecial.value = { entrada: '', salida: '', tipo: 'Virtual' };
    await cargarParametros();
  } catch (error) {
    console.error('Error al crear horario especial:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el horario especial.' });
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
