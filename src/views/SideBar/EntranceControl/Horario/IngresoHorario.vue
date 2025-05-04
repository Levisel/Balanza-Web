<template>
  <main class="flex flex-col items-center p-6 min-h-screen">
    <h1 class="text-3xl font-bold mb-6">Asignar Horarios Presenciales</h1>
    <Toast />

    <!-- Filtros -->
    <div class="flex gap-4 mb-4">
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

    <!-- Tabla de estudiantes (selección única) -->
    <DataTable
      :value="estudiantesFiltrados"
      v-model:selection="estudianteSeleccionado"
      selectionMode="single"
      paginator
      :rows="10"
      class="w-full max-w-6xl"
    >
      <Column selectionMode="single" headerStyle="width: 3rem" />
      <Column field="user.Internal_ID" header="Cédula" />
      <Column field="user.Internal_Name" header="Nombres" />
      <Column field="user.Internal_LastName" header="Apellidos" />
      <Column field="user.Internal_Area" header="Área" />
    </DataTable>

    <!-- Sección de asignación de horarios -->
    <div v-if="estudianteSeleccionado" class="mt-6 w-full max-w-6xl">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">
          Asignar Horarios (Lunes a Viernes) – Modalidad: Presencial
        </h3>
        <Button
          label="Agregar Horario Especial"
          class="p-button-success"
          @click="abrirModalHorarioEspecial"
        />
        <Button 
          label="Cambiar máximo de horas" 
          icon="pi pi-cog" 
          class="p-button-secondary"
          @click="abrirDialogoMaxHoras"
        />

      </div>

    <!-- Para cada día se muestran los dropdowns (1 o 2) -->
<div v-for="dia in diasSemana" :key="dia.nombre" class="mb-4">
  <!-- Encabezado del día -->
  <div class="flex items-center gap-4 mb-2">
    <span class="w-24 font-bold">{{ traducirDia(dia.nombre) }}</span>
    <small class="text-sm">
      Temprano: {{ cuposDisponibles[dia.nombre]?.Temprano || 0 }} /
      Tarde: {{ cuposDisponibles[dia.nombre]?.Tarde || 0 }}
    </small>
  </div>

  <!-- Lista de horarios -->
  <div class="flex flex-col gap-2 pl-28">
    <!-- Horario 1 -->
    <div class="flex items-center gap-4">
      <span class="text-sm font-medium w-5">1</span>
      <Dropdown
        v-model="horariosSeleccionados[dia.nombre][0]"
        :options="getOpcionesDia(dia.nombre, null)"
        optionLabel="label"
        :optionValue="o => o"
        placeholder="Seleccionar horario"
        class="w-90"
      />
      <Button
        v-if="horariosSeleccionados[dia.nombre][0]"
        icon="pi pi-trash"
        class="p-button-rounded p-button-danger"
        @click="quitarHorario(dia.nombre, 0)"
        tooltip="Eliminar este horario"
      />
    </div>

    <!-- Horario 2 -->
    <div
      v-if="horariosSeleccionados[dia.nombre].length === 2"
      class="flex items-center gap-4"
    >
      <span class="text-sm font-medium w-5">2</span>
      <Dropdown
        v-model="horariosSeleccionados[dia.nombre][1]"
        :options="getOpcionesDia(dia.nombre, horariosSeleccionados[dia.nombre][0]?.tipo)"
        optionLabel="label"
        :optionValue="o => o"
        placeholder="Seleccionar horario"
        class="w-90"
      />
      <Button
        icon="pi pi-trash"
        class="p-button-rounded p-button-danger"
        @click="quitarHorario(dia.nombre, 1)"
        tooltip="Eliminar segundo horario"
      />
    </div>
  </div>

  <!-- Label informativo si tiene virtual -->
<div class="pl-28 mt-1" v-if="horarioVirtual[dia.nombre]">
  <span class="text-sm text-green-700">
    Virtual: {{ horarioVirtual[dia.nombre].label }} ({{ horarioVirtual[dia.nombre].tipo }})
  </span>
</div>

  <!-- Botón agregar horario 2 -->
  <div
    v-if="horariosSeleccionados[dia.nombre].length === 1 && horariosSeleccionados[dia.nombre][0]"
    class="pl-28 mt-2"
  >
    <Button
      icon="pi pi-plus"
      class="p-button-rounded p-button-success"
      @click="agregarSegundoHorario(dia.nombre)"
      tooltip="Agregar segundo horario"
    />
  </div>
</div>


      <!-- Botón para guardar horarios -->
      <div class="flex justify-start mt-4">
        <Button
          label="Guardar Horario"
          class="p-button-primary"
          @click="validarYGuardar"
        />
      </div>
    </div>

    <!-- Modal: Crear Horario Especial -->
    <Dialog v-model:visible="dialogoHorarioEspecialVisible" header="Crear Horario Especial">
      <div class="flex flex-col gap-3">
        <p>Crear un horario especial para casos excepcionales (se podrá usar en cualquier día).</p>
        <InputText v-model="nuevoHorarioEspecial.entrada" type="time" />
        <InputText v-model="nuevoHorarioEspecial.salida" type="time" />
      </div>
      <template #footer>
        <Button label="Cancelar" @click="dialogoHorarioEspecialVisible = false" />
        <Button label="Guardar" class="p-button-success" @click="crearHorarioEspecial" />
      </template>
    </Dialog>

    <!-- Modal: Error por exceso de horas o cupos 0 -->
    <Dialog v-model:visible="dialogoErrorVisible" header="Error">
      <p>No puedes asignar más de {{ maxHorasSemanales }} horas semanales o guardar si algún cupo es 0.</p>

      <template #footer>
        <Button label="Entendido" class="p-button-danger" @click="dialogoErrorVisible = false" />
      </template>
    </Dialog>

  <!-- Modal: Confirmación de cambio administrativo / modificación -->
<Dialog v-model:visible="dialogoCambioAdministrativo" header="Confirmar Acción">
  <div class="flex items-center justify-between mb-3">
    <p class="text-base font-medium">¿Qué deseas hacer con el horario del estudiante?</p>
    <Button
      icon="pi pi-question-circle"
      class="p-button-text p-button-sm"
      @click="mostrarAyudaCambio = true"
      tooltip="¿Cuál es la diferencia?"
      tooltipOptions="{ position: 'top' }"
    />
  </div>
  <template #footer>
    <Button
      label="Modificar (antes de registrar asistencia)"
      class="p-button-secondary"
      @click="guardarHorario(false)"
    />
    <Button
      label="Cambio Administrativo (con historial)"
      class="p-button-danger"
      @click="guardarHorario(true)"
    />
  </template>
</Dialog>

<!-- Dialogo de Ayuda para el cambio -->
<Dialog v-model:visible="mostrarAyudaCambio" header="¿Qué significa cada opción?">
  <div class="leading-relaxed">
    <p><strong>Modificar:</strong> Solo cambia los horarios actuales <em>si aún no se ha comenzado a registrar asistencia</em>.</p>
    <p class="mt-2"><strong>Cambio Administrativo:</strong> Guarda un registro del horario anterior, lo deja como inactivo y crea uno nuevo.</p>
  </div>
  <template #footer>
    <Button label="Entendido" class="p-button-primary" @click="mostrarAyudaCambio = false" />
  </template>
</Dialog>

<Dialog v-model:visible="mostrarDialogoMaxHoras" header="Cambiar máximo de horas permitidas">
  <div class="p-4">
    <p>Valor actual: <strong>{{ maxHorasSemanales }}</strong> horas</p>
    <p class="mt-2">Ingrese un nuevo máximo:</p>
    <InputNumber
      v-model="nuevoMaxHoras"
      :min="1"
      :max="100"
      showButtons
      class="w-full mt-2"
    />
  </div>
  <template #footer>
    <Button label="Cancelar" @click="mostrarDialogoMaxHoras = false" />
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
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { API, type Period } from '@/ApiRoute';
import { useToast } from 'primevue/usetoast';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import { useSubjects } from '@/useSubjects';
import axios from 'axios';

const { subjects: opcionesAreas } = useSubjects();

const maxHorasSemanales = ref(12); // Valor por defecto
const mostrarDialogoMaxHoras = ref(false);
const nuevoMaxHoras = ref(12);

function abrirDialogoMaxHoras() {
  nuevoMaxHoras.value = maxHorasSemanales.value;
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
  maxHorasSemanales.value = nuevoMaxHoras.value;
  mostrarDialogoMaxHoras.value = false;
  toast.add({
    severity: 'success',
    summary: 'Máximo actualizado',
    detail: `Nuevo límite: ${nuevoMaxHoras.value} horas`,
    life: 3000
  });
}




const toast = useToast();

/* ESTADOS DE GUARDADO Y HORARIOS */
const isGuardando = ref(false);
const horarioGuardado = ref(false);
// Guardamos el objeto (o arreglo) obtenido del back para usarlo en PUT
const horarioActual = ref<any>(null);

/* ESTADOS PRINCIPALES */
const periodos = ref<Period[]>([]);
const estudiantes = ref<any[]>([]);
const estudianteSeleccionado = ref<any>(null);
const periodoSeleccionado = ref<Period | null>(null);
const areaSeleccionada = ref<string | null>(null);
const busquedaNombre = ref('');
const busquedaCedula = ref('');
const mostrarAyudaCambio = ref(false);


/* CACHE DE PARÁMETROS */
const parametroHorarioCache = {};
const allParametros = ref<any[]>([]);

/* ESTADOS PARA CUPOS Y HORARIOS VIRTUALES */
const cuposDisponibles = ref<Record<string, any>>({});
const horarioVirtual = ref<Record<string, { label: string; tipo: string }>>({});

/* HORARIOS SELECCIONADOS: para cada día (máx. 2 elementos) */
const horariosSeleccionados = ref<Record<string, any[]>>({
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: []
});


/* USUARIO X PERIODO Y FLAGS */
const usuarioXPeriodoId = ref<number | null>(null);
const tieneHorarioActual = ref(false);

/* DIÁLOGOS */
const dialogoHorarioEspecialVisible = ref(false);
const dialogoErrorVisible = ref(false);
const dialogoCambioAdministrativo = ref(false);
const nuevoHorarioEspecial = ref({ entrada: '', salida: '', tipo: 'Temprano' });

/* DÍAS DE LA SEMANA Y OPCIONES */
const diasSemana = ref([
  { nombre: 'Monday', horarios: [] },
  { nombre: 'Tuesday', horarios: [] },
  { nombre: 'Wednesday', horarios: [] },
  { nombre: 'Thursday', horarios: [] },
  { nombre: 'Friday', horarios: [] }
]);


/* CICLO DE VIDA */
onMounted(() => {
  fetchPeriodos();
});

watch([periodoSeleccionado, areaSeleccionada], () => {
  limpiarHorarios();
  fetchEstudiantes();
});

watch(estudianteSeleccionado, async () => {
  limpiarHorarios();
  await nextTick();

  if (estudianteSeleccionado.value) {
    console.log("Estudiante seleccionado:", estudianteSeleccionado.value);
    await cargarParametros();
    await cargarHorarios();
    await cargarHorarioVirtual();

    // ✅ Resetear estado de horarios presenciales
    horarioActual.value = null;
    tieneHorarioActual.value = false;

    await cargarHorarioActual(); // detecta si tiene presencial
  }
});


/* GETTERS COMPUTED */
const estudiantesFiltrados = computed(() =>
  estudiantes.value.filter(est =>
    est.user.Internal_Name.toLowerCase().includes(busquedaNombre.value.toLowerCase()) &&
    est.user.Internal_ID.includes(busquedaCedula.value)
  )
);

/* FUNCIONES DE CARGA */
async function fetchPeriodos() {
  try {
    const resp = await axios.get(`${API}/periodos`, { withCredentials: true });
    periodos.value = resp.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los períodos' });
  }
}

async function fetchEstudiantes() {
  if (!periodoSeleccionado.value || !areaSeleccionada.value) return;
  try {
    const url = `${API}/usuarioXPeriodo/periodo/${periodoSeleccionado.value.Period_ID}/area/${areaSeleccionada.value}`;
    const resp = await axios.get(url, { withCredentials: true });
    estudiantes.value = resp.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los estudiantes' });
  }
}


function traducirDia(diaIngles: string): string {
  const mapaDias: Record<string, string> = {
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes"
  };
  return mapaDias[diaIngles] || diaIngles;
}


async function cargarParametros() {
  try {
    const resp = await axios.get(`${API}/parametroHorario`, { withCredentials: true });
    if (resp.status === 200) {
      allParametros.value = resp.data;
    }
  } catch (error) {
    console.error('Error al cargar parámetros:', error);
  }
}

/* LIMPIEZA */
function limpiarFiltros() {
  periodoSeleccionado.value = null;
  areaSeleccionada.value = null;
  busquedaNombre.value = '';
  busquedaCedula.value = '';
  estudianteSeleccionado.value = null;
  estudiantes.value = [];
  limpiarHorarios();
}

function limpiarHorarios() {
  horarioGuardado.value = false;
  horariosSeleccionados.value = {
    Lunes: [],
    Martes: [],
    Miercoles: [],
    Jueves: [],
    Viernes: []
  };
  usuarioXPeriodoId.value = null;
  tieneHorarioActual.value = false;
  cuposDisponibles.value = {};
  horarioVirtual.value = {}; // Limpia los datos virtuales
diasSemana.value.forEach(dia => {
  dia.horarios = [];
  horariosSeleccionados.value[dia.nombre] = []; // Limpia las selecciones visuales
});

}

/* CARGAR HORARIOS DISPONIBLES */
async function cargarHorarios() {
  if (!estudianteSeleccionado.value) return;

  try {
    const urlUser = `${API}/usuarioxperiodo/${periodoSeleccionado.value.Period_ID}/${estudianteSeleccionado.value.user.Internal_ID}`;
    const userRes = await axios.get(urlUser, { withCredentials: true });
    const userData = userRes.data;
    usuarioXPeriodoId.value = userData.UserXPeriod_ID;
  } catch (error) {
    console.error("Error al obtener usuarioXPeriodo", error);
    return;
  }

  for (const dia of diasSemana.value) {
    try {
      const urlCup = `${API}/horarioEstudiantes/disponibilidad/${periodoSeleccionado.value.Period_ID}/${areaSeleccionada.value}/${dia.nombre}`;
      const cuposRes = await axios.get(urlCup, { withCredentials: true });
      const cupos = cuposRes.data;
      const MAX_TURNO = 7;
      const usadoTemprano = parseInt(cupos.cantidadTemprano) || 0;
      const usadoTarde = parseInt(cupos.cantidadTarde) || 0;
      cuposDisponibles.value[dia.nombre] = {
        Temprano: Math.max(0, MAX_TURNO - usadoTemprano),
        Tarde: Math.max(0, MAX_TURNO - usadoTarde)
      };

      const urlTemp = `${API}/parametroHorario/disponibilidad/Temprano/${periodoSeleccionado.value.Period_ID}/${areaSeleccionada.value}/${dia.nombre}`;
      const urlTard = `${API}/parametroHorario/disponibilidad/Tarde/${periodoSeleccionado.value.Period_ID}/${areaSeleccionada.value}/${dia.nombre}`;
      const [tempRes, tardRes] = await Promise.all([
        axios.get(urlTemp, { withCredentials: true }),
        axios.get(urlTard, { withCredentials: true })
      ]);

      let horariosTemprano = tempRes.status === 200 ? tempRes.data : [];
      let horariosTarde = tardRes.status === 200 ? tardRes.data : [];

      dia.horarios = [
        ...horariosTemprano.map(h => ({
          ...h,
          label: `${h.Parameter_Schedule_Start_Time} - ${h.Parameter_Schedule_End_Time} (Temprano)`,
          value: h.Parameter_Schedule_ID,
          tipo: 'Temprano'
        })),
        ...horariosTarde.map(h => ({
          ...h,
          label: `${h.Parameter_Schedule_Start_Time} - ${h.Parameter_Schedule_End_Time} (Tarde)`,
          value: h.Parameter_Schedule_ID,
          tipo: 'Tarde'
        }))
      ];
    } catch (error) {
      console.error(`Error al cargar horarios para ${dia.nombre}`, error);
    }
  }

  try {
    const horarioRes = await axios.get(`${API}/horarioEstudiantes/usuarioxperiodo/${usuarioXPeriodoId.value}`, { withCredentials: true });
    tieneHorarioActual.value = horarioRes.status === 200;
    if (tieneHorarioActual.value) {
      await cargarHorarioActual();
    }
  } catch (error) {
    console.error("Error al verificar horario existente", error);
    tieneHorarioActual.value = false;
  }
}

/* CARGAR HORARIO ACTUAL */
async function cargarHorarioActual() {
  if (!usuarioXPeriodoId.value) return;

  try {
    const res = await axios.get(`${API}/horarioEstudiantes/usuarioxperiodo/${usuarioXPeriodoId.value}`, {
      withCredentials: true
    });
    const horarioData = res.data;

    // ✅ Filtrar solo modalidad presencial
    const soloPresencial = Array.isArray(horarioData)
      ? horarioData.filter((h: any) => h.Schedule_Mode === "Presencial")
      : [];

    horarioActual.value = soloPresencial;
    tieneHorarioActual.value = soloPresencial.length > 0;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    for (const day of days) {
      const registros = soloPresencial.filter((h: any) => h[`Schedule_Day_${day}`]);
      horariosSeleccionados.value[day] = [];

      for (const reg of registros) {
        const paramId = reg[`Schedule_Day_${day}`];
        if (!paramId) continue;

        const option = await asignarHorarioExistente(day, paramId);
        if (option) {
          horariosSeleccionados.value[day].push(option);
        }
      }
    }

    horarioGuardado.value = true;
    await nextTick();
  } catch (error) {
    console.error("Error al cargar el horario actual", error);
  }
}



// Función auxiliar para inyectar la opción "Tu horario actual"
async function asignarHorarioExistente(dayName: string, paramId: number) {
  if (!paramId) return null;

  const dayObj = diasSemana.value.find(d => d.nombre === dayName);
  if (!dayObj) return null;

  // Buscar si ya existe en los horarios del día
  let found = dayObj.horarios.find((opt: any) => opt.value === paramId);

  if (!found) {
    const param = allParametros.value.find((p: any) => p.Parameter_Schedule_ID === paramId);
    if (!param) return null;

    found = {
      ...param,
      label: `${param.Parameter_Schedule_Start_Time} - ${param.Parameter_Schedule_End_Time} (${param.Parameter_Schedule_Type})`,
      value: param.Parameter_Schedule_ID,
      tipo: param.Parameter_Schedule_Type
    };

    // Agregarlo al listado del día si no estaba
    dayObj.horarios.push(found);
  }

  // ✅ Asegurar que no tenga múltiples "Tu horario actual:"
  if (!found.label.startsWith("Tu horario actual:")) {
    found.label = `Tu horario actual: ${found.label}`;
  }

  return found;
}



/* OPCIONES PARA DROPDOWN */
function getOpcionesDia(dayName: string, tipoFiltrar: string | null) {
  const dayObj = diasSemana.value.find(d => d.nombre === dayName);
  if (!dayObj || !dayObj.horarios) return [];
  let opciones = dayObj.horarios.map((opt: any) => ({ ...opt }));

  // Si hay un horario virtual, elimina ese turno
  const tipoVirtual = horarioVirtual.value[dayName]?.tipo;
  if (tipoVirtual) {
    opciones = opciones.filter(op => op.tipo !== tipoVirtual);
  }

  // Además, si hay que filtrar un tipo (para evitar que se repita en segundo turno)
  if (tipoFiltrar) {
    opciones = opciones.filter(op => op.tipo !== tipoFiltrar);
  }

  return opciones;
}


/* MANEJO DE LOS HORARIOS: AGREGAR/QUITAR */
function agregarSegundoHorario(dayName: string) {
  if (horariosSeleccionados.value[dayName].length < 2) {
    horariosSeleccionados.value[dayName].push(null);
  }
}


function quitarHorario(dayName: string, index: number) {
  if (horariosSeleccionados.value[dayName] && horariosSeleccionados.value[dayName].length > index) {
    horariosSeleccionados.value[dayName][index] = null;
  }
}


/* GUARDAR HORARIOS */

async function guardarHorario(esCambioAdministrativo: boolean) {
  if (isGuardando.value) return;
  isGuardando.value = true;

  // Eliminar horario 2 vacío
  for (const dia of diasSemana.value) {
    const horarios = horariosSeleccionados.value[dia.nombre];
    if (horarios.length === 2 && !horarios[1]) {
      horariosSeleccionados.value[dia.nombre].pop();
    }
  }

  const registro1 = {
    UserXPeriod_ID: usuarioXPeriodoId.value,
    Schedule_Mode: "Presencial",
    Schedule_Day_Monday: null,
    Schedule_Day_Tuesday: null,
    Schedule_Day_Wednesday: null,
    Schedule_Day_Thursday: null,
    Schedule_Day_Friday: null
  };

  const registro2 = { ...registro1 };

  for (const dia of diasSemana.value) {
    const sel = horariosSeleccionados.value[dia.nombre];
    if (sel[0]) {
      registro1[`Schedule_Day_${dia.nombre}`] = sel[0].value;
    }
    if (sel[1]) {
      registro2[`Schedule_Day_${dia.nombre}`] = sel[1].value;
    }
  }

  const nuevosRegistros = [registro1];
  const registro2TieneDatos = Object.entries(registro2).some(
      ([k, v]) => !["UserXPeriod_ID", "Schedule_Mode"].includes(k) && v !== null
    );

  if (registro2TieneDatos || (Array.isArray(horarioActual.value) && horarioActual.value.length > 1)) {
    nuevosRegistros.push(registro2);
  }

  try {
    if (!horarioGuardado.value) {
      for (const reg of nuevosRegistros) {
        await axios.post(`${API}/horarioEstudiantes`, reg, { withCredentials: true });
      }
      horarioGuardado.value = true;
      tieneHorarioActual.value = true;
    } else {
      if (esCambioAdministrativo) {
        await axios.post(`${API}/horarioEstudiantes/cambio-administrativo`, {
          userXPeriodId: usuarioXPeriodoId.value,
          newSchedules: nuevosRegistros
        }, { withCredentials: true });
      } else {
        if (Array.isArray(horarioActual.value)) {
          for (let i = 0; i < nuevosRegistros.length; i++) {
            const existing = horarioActual.value[i];
            if (existing?.Schedule_Students_ID) {
              await axios.put(`${API}/horarioEstudiantes/${existing.Schedule_Students_ID}`, nuevosRegistros[i], {
                withCredentials: true
              });
            } else {
              await axios.post(`${API}/horarioEstudiantes`, nuevosRegistros[i], { withCredentials: true });
            }
          }
        } else {
          if (horarioActual.value?.Schedule_Students_ID) {
            await axios.put(`${API}/horarioEstudiantes/${horarioActual.value.Schedule_Students_ID}`, nuevosRegistros[0], {
              withCredentials: true
            });
          } else {
            await axios.post(`${API}/horarioEstudiantes`, nuevosRegistros[0], { withCredentials: true });
          }
        }
      }
    }

    toast.add({
      severity: "success",
      summary: "Horario Guardado",
      detail: "Asignado correctamente.",
      life: 3000
    });

    // ✅ Actualizar estado después de guardar
    await cargarHorarioActual();

  } catch (error) {
    console.error("Error al guardar horario:", error);
    toast.add({ severity: "error", summary: "Error", detail: "No se pudo guardar el horario." });
  } finally {
    isGuardando.value = false;
    dialogoCambioAdministrativo.value = false;
  }
}



/* CALCULAR HORAS TOTALES */
function calcularHorasTotales() {
  let total = 0;
  for (const day in horariosSeleccionados.value) {
    for (const horario of horariosSeleccionados.value[day]) {
      if (!horario || !horario.label) continue;

      // Validación: saltar si ya hay horario virtual ese día
      if (horarioVirtual.value[day]) continue;

      const cleanLabel = horario.label.replace("Tu horario actual: ", "");
      const [inicioStr, resto] = cleanLabel.split(" - ");
      const [finStr] = resto.split(" ");
      const inicio = parseInt(inicioStr.split(":")[0]);
      const fin = parseInt(finStr.split(":")[0]);
      total += (fin - inicio);
    }
  }
  return total;
}


// Abrir modal de horario especial
function abrirModalHorarioEspecial() {
  nuevoHorarioEspecial.value = { entrada: '', salida: '', tipo: 'Temprano' };
  dialogoHorarioEspecialVisible.value = true;
}



// Cargar horario virtual (si existe)
async function cargarHorarioVirtual() {
  if (!usuarioXPeriodoId.value) return;

  try {
    const urlHor = `${API}/horarioEstudiantes/completo?periodId=${periodoSeleccionado.value.Period_ID}&area=${encodeURIComponent(areaSeleccionada.value)}`;
    const resHor = await axios.get(urlHor, { withCredentials: true });
    const todosHorarios = Array.isArray(resHor.data) ? resHor.data : [];

    const horEstudiante = todosHorarios.filter(
      (h: any) => h.Internal_ID === estudianteSeleccionado.value.user.Internal_ID
    );

    const virtual = horEstudiante.find(
      (h: any) => h.Schedule_Mode === 'Virtual' && h.Schedule_IsDeleted === 0
    );

    if (virtual) {
      const dias = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      for (const dia of dias) {
        const campo = `Schedule_Day_${dia}`;
        const paramId = virtual[campo];
        if (!paramId) continue;

        const paramInfo = allParametros.value.find(
          (p: any) => p.Parameter_Schedule_ID === paramId
        );
        if (!paramInfo) continue;

        horarioVirtual.value[dia] = {
          label: `${paramInfo.Parameter_Schedule_Start_Time.slice(0, 5)} - ${paramInfo.Parameter_Schedule_End_Time.slice(0, 5)}`,
          tipo: paramInfo.Parameter_Schedule_Type
        };
      }
    }
  } catch (error) {
    console.error('Error al cargar horario virtual:', error);
  }
}


/* VALIDAR CUPOS */
function validarCupos() {
  for (const dia of diasSemana.value) {
    const seleccionados = horariosSeleccionados.value[dia.nombre] || [];
    for (const sel of seleccionados) {
      if (!sel) continue;
      const tipo = sel.tipo;
      const cupo = cuposDisponibles.value[dia.nombre]?.[tipo] ?? 0;
      if (cupo <= 0) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: `No hay cupos disponibles para ${tipo} en ${dia.nombre}`
        });
        return false;
      }
    }
  }
  return true;
}

/* VALIDAR Y GUARDAR */
async function validarYGuardar() {

  const tieneAlMenosUnHorario = Object.values(horariosSeleccionados.value).some(arr =>
  arr.some(h => h && h.value)
);

if (!tieneAlMenosUnHorario) {
  toast.add({
    severity: 'warn',
    summary: 'Sin horarios',
    detail: 'Debes seleccionar al menos un horario antes de guardar.',
    life: 3000
  });
  return;
}


  if (isGuardando.value) return;

  if (calcularHorasTotales() > maxHorasSemanales.value) {
    dialogoErrorVisible.value = true;
    return;
  }

  if (!validarCupos()) return;

  // ✅ Evaluar si ya tiene al menos un horario presencial
  const yaTienePresencial = Array.isArray(horarioActual.value) &&
    horarioActual.value.some(h => h.Schedule_Mode === 'Presencial');

  if (yaTienePresencial) {
    dialogoCambioAdministrativo.value = true;
  } else {
    await guardarHorario(false);
  }
}


/* HORARIO ESPECIAL */
async function crearHorarioEspecial() {
  const entrada = nuevoHorarioEspecial.value.entrada;
  const salida = nuevoHorarioEspecial.value.salida;

  const [entradaHora, entradaMinuto] = entrada.split(':').map(Number);
  const [salidaHora, salidaMinuto] = salida.split(':').map(Number);

  const entradaTotalMin = entradaHora * 60 + entradaMinuto;
  const salidaTotalMin = salidaHora * 60 + salidaMinuto;

  if (entradaTotalMin >= salidaTotalMin) {
    toast.add({
      severity: 'error',
      summary: 'Error de Horario',
      detail: 'La hora de entrada debe ser menor que la hora de salida.'
    });
    return;
  }

  if (entradaTotalMin < 420 || salidaTotalMin > 1260) {
    toast.add({
      severity: 'error',
      summary: 'Horario fuera de rango',
      detail: 'Solo se permiten horarios entre 07:00 y 21:00.'
    });
    return;
  }

  if ((entradaTotalMin <= 780 && salidaTotalMin > 780)) {
    toast.add({
      severity: 'error',
      summary: 'Horario inválido',
      detail: 'No se permiten horarios que crucen de Temprano a Tarde (ej: 09:00 a 17:00).'
    });
    return;
  }

  const tipoCalculado = entradaTotalMin <= 780 ? 'Temprano' : 'Tarde';

  const payload = {
    Parameter_Schedule_Start_Time: entrada,
    Parameter_Schedule_End_Time: salida,
    Parameter_Schedule_Type: tipoCalculado
  };

  try {
    await axios.post(`${API}/parametroHorario`, payload, { withCredentials: true });

    toast.add({
      severity: 'success',
      summary: 'Horario Especial Creado',
      detail: 'Se registró correctamente.'
    });

    dialogoHorarioEspecialVisible.value = false;
    nuevoHorarioEspecial.value = { entrada: '', salida: '', tipo: 'Temprano' };
    await cargarHorarios();
  } catch (error) {
    console.error('Error al crear horario especial:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo crear el horario especial.'
    });
  }
}


</script>

<style scoped>

</style>
