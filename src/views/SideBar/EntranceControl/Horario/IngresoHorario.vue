<template>
  <main class="flex flex-col items-center p-6 min-h-screen">
    <h1 class="text-3xl font-bold mb-6">Asignar Horarios Presenciales</h1>
    <Toast />

    <!-- Filtros -->
    <div class="flex gap-4 mb-4">
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
      <Column field="usuario.Internal_ID" header="Cédula" />
      <Column field="usuario.Internal_Name" header="Nombres" />
      <Column field="usuario.Internal_LastName" header="Apellidos" />
      <Column field="usuario.Internal_Area" header="Área" />
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
      </div>

    <!-- Para cada día se muestran los dropdowns (1 o 2) -->
<div v-for="dia in diasSemana" :key="dia.nombre" class="mb-4">
  <!-- Encabezado del día -->
  <div class="flex items-center gap-4 mb-2">
    <span class="w-24 font-bold">{{ dia.nombre }}</span>
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
      <p>No puedes asignar más de 12 horas semanales o guardar si algún cupo es 0.</p>
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
  <div class="text-sm leading-relaxed">
    <p><strong>Modificar:</strong> Solo cambia los horarios actuales <em>si aún no se ha comenzado a registrar asistencia</em>.</p>
    <p class="mt-2"><strong>Cambio Administrativo:</strong> Guarda un registro del horario anterior, lo deja como inactivo y crea uno nuevo. Ideal cuando ya hay registros de asistencia y necesitas cambiar los horarios sin perder historial.</p>
  </div>
  <template #footer>
    <Button label="Entendido" class="p-button-primary" @click="mostrarAyudaCambio = false" />
  </template>
</Dialog>


  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { API, type Periodo } from '@/ApiRoute';
import { useToast } from 'primevue/usetoast';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import { useSubjects } from '@/useSubjects';

const { subjects: opcionesAreas } = useSubjects();



const toast = useToast();

/* ESTADOS DE GUARDADO Y HORARIOS */
const isGuardando = ref(false);
const horarioGuardado = ref(false);
// Guardamos el objeto (o arreglo) obtenido del back para usarlo en PUT
const horarioActual = ref<any>(null);

/* ESTADOS PRINCIPALES */
const periodos = ref<Periodo[]>([]);
const estudiantes = ref<any[]>([]);
const estudianteSeleccionado = ref<any>(null);
const periodoSeleccionado = ref<Periodo | null>(null);
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
  Lunes: [],
  Martes: [],
  Miercoles: [],
  Jueves: [],
  Viernes: []
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
  { nombre: 'Lunes', horarios: [] },
  { nombre: 'Martes', horarios: [] },
  { nombre: 'Miercoles', horarios: [] },
  { nombre: 'Jueves', horarios: [] },
  { nombre: 'Viernes', horarios: [] }
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
  }
});

/* GETTERS COMPUTED */
const estudiantesFiltrados = computed(() =>
  estudiantes.value.filter(est =>
    est.usuario.Internal_Name.toLowerCase().includes(busquedaNombre.value.toLowerCase()) &&
    est.usuario.Internal_ID.includes(busquedaCedula.value)
  )
);

/* FUNCIONES DE CARGA */
async function fetchPeriodos() {
  try {
    const resp = await fetch(`${API}/periodos`);
    periodos.value = await resp.json();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los períodos' });
  }
}

async function fetchEstudiantes() {
  if (!periodoSeleccionado.value || !areaSeleccionada.value) return;
  try {
    const url = `${API}/usuarioXPeriodo/periodo/${periodoSeleccionado.value.Periodo_ID}/area/${areaSeleccionada.value}`;
    const resp = await fetch(url);
    estudiantes.value = await resp.json();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los estudiantes' });
  }
}

async function cargarParametros() {
  try {
    const resp = await fetch(`${API}/parametroHorario`);
    if (resp.ok) {
      allParametros.value = await resp.json();
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
    const urlUser = `${API}/usuarioxperiodo/${periodoSeleccionado.value.Periodo_ID}/${estudianteSeleccionado.value.usuario.Internal_ID}`;
    const userRes = await fetch(urlUser);
    const userData = await userRes.json();
    usuarioXPeriodoId.value = userData.UsuarioXPeriodo_ID;
  } catch (error) {
    console.error("Error al obtener usuarioXPeriodo", error);
    return;
  }
  for (const dia of diasSemana.value) {
    try {
      const urlCup = `${API}/horarioEstudiantes/disponibilidad/${periodoSeleccionado.value.Periodo_ID}/${areaSeleccionada.value}/${dia.nombre}`;
      const cuposRes = await fetch(urlCup);
      const cupos = await cuposRes.json();
      const MAX_TURNO = 7;
      const usadoTemprano = parseInt(cupos.cantidadTemprano) || 0;
      const usadoTarde = parseInt(cupos.cantidadTarde) || 0;
      cuposDisponibles.value[dia.nombre] = {
        Temprano: Math.max(0, MAX_TURNO - usadoTemprano),
        Tarde: Math.max(0, MAX_TURNO - usadoTarde)
      };

      const urlTemp = `${API}/parametroHorario/disponibilidad/Temprano/${periodoSeleccionado.value.Periodo_ID}/${areaSeleccionada.value}/${dia.nombre}`;
      const urlTard = `${API}/parametroHorario/disponibilidad/Tarde/${periodoSeleccionado.value.Periodo_ID}/${areaSeleccionada.value}/${dia.nombre}`;
      const [tempRes, tardRes] = await Promise.all([fetch(urlTemp), fetch(urlTard)]);
      let horariosTemprano = tempRes.ok ? await tempRes.json() : [];
      let horariosTarde = tardRes.ok ? await tardRes.json() : [];
      if (!Array.isArray(horariosTemprano)) horariosTemprano = [];
      if (!Array.isArray(horariosTarde)) horariosTarde = [];
      dia.horarios = [
        ...horariosTemprano.map(h => ({
          ...h,
          label: `${h.Parametro_Horario_Hora_Entrada} - ${h.Parametro_Horario_Hora_Salida} (Temprano)`,
          value: h.Parametro_Horario_ID,
          tipo: 'Temprano'
        })),
        ...horariosTarde.map(h => ({
          ...h,
          label: `${h.Parametro_Horario_Hora_Entrada} - ${h.Parametro_Horario_Hora_Salida} (Tarde)`,
          value: h.Parametro_Horario_ID,
          tipo: 'Tarde'
        }))
      ];
    } catch (error) {
      console.error(`Error al cargar horarios para ${dia.nombre}`, error);
    }
  }
  try {
    const horarioRes = await fetch(`${API}/horarioEstudiantes/usuarioxperiodo/${usuarioXPeriodoId.value}`);
    tieneHorarioActual.value = horarioRes.ok;
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
    const res = await fetch(`${API}/horarioEstudiantes/usuarioxperiodo/${usuarioXPeriodoId.value}`);
    if (!res.ok) return;

    const horarioData = await res.json();

    // ✅ Filtrar solo modalidad presencial
    const soloPresencial = Array.isArray(horarioData)
      ? horarioData.filter((h: any) => h.Horario_Modalidad === "Presencial")
      : [];

    horarioActual.value = soloPresencial;
    tieneHorarioActual.value = soloPresencial.length > 0;

    const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];

    for (const day of days) {
      const registros = soloPresencial.filter((h: any) => h[`Horario_Dia_${day}`]);
      horariosSeleccionados.value[day] = [];

      for (const reg of registros) {
        const paramId = reg[`Horario_Dia_${day}`];
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
  const dayObj = diasSemana.value.find(d => d.nombre === dayName);
  if (!dayObj) return null;
  let found = dayObj.horarios.find((opt: any) => opt.value === paramId);
  if (!found) {
    const param = allParametros.value.find((p: any) => p.Parametro_Horario_ID === paramId);
    if (param) {
      found = {
        ...param,
        label: `${param.Parametro_Horario_Hora_Entrada} - ${param.Parametro_Horario_Hora_Salida} (${param.Parametro_Horario_Tipo})`,
        value: param.Parametro_Horario_ID,
        tipo: param.Parametro_Horario_Tipo
      };
      dayObj.horarios.push(found);
    } else {
      return null;
    }
  }
  found.label = `Tu horario actual: ${found.label}`;
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

/*function quitarHorario(dayName: string, index: number) {
  if (horariosSeleccionados.value[dayName][index]) {
    horariosSeleccionados.value[dayName].splice(index, 1);
  }
}*/

function quitarHorario(dayName: string, index: number) {
  if (horariosSeleccionados.value[dayName] && horariosSeleccionados.value[dayName].length > index) {
    horariosSeleccionados.value[dayName][index] = null;
  }
}


/* GUARDAR HORARIOS */
async function guardarHorario(esCambioAdministrativo: boolean) {
  if (isGuardando.value) return;
  isGuardando.value = true;

  // Armar los dos registros PRESENCIALES
  const registro1 = {
    UsuarioXPeriodo_ID: usuarioXPeriodoId.value,
    Horario_Modalidad: "Presencial",
    Horario_Dia_Lunes: null,
    Horario_Dia_Martes: null,
    Horario_Dia_Miercoles: null,
    Horario_Dia_Jueves: null,
    Horario_Dia_Viernes: null
  };

  const registro2 = {
    UsuarioXPeriodo_ID: usuarioXPeriodoId.value,
    Horario_Modalidad: "Presencial",
    Horario_Dia_Lunes: null,
    Horario_Dia_Martes: null,
    Horario_Dia_Miercoles: null,
    Horario_Dia_Jueves: null,
    Horario_Dia_Viernes: null
  };

  // Llenar solo si hay selección
  for (const dia of diasSemana.value) {
    const sel = horariosSeleccionados.value[dia.nombre];
    if (sel[0]) {
      registro1[`Horario_Dia_${dia.nombre}`] = sel[0].value;
    }
    if (sel[1]) {
      registro2[`Horario_Dia_${dia.nombre}`] = sel[1].value;
    }
  }

  // Solo se agregará registro2 si contiene algún valor válido
  const nuevosRegistros = [registro1];
  const registro2TieneDatos = Object.keys(registro2).some(key => {
    if (key === "UsuarioXPeriodo_ID" || key === "Horario_Modalidad") return false;
    return registro2[key] !== null;
  });
  if (registro2TieneDatos || (Array.isArray(horarioActual.value) && horarioActual.value.length > 1)) {
    nuevosRegistros.push(registro2);
  }

  try {
    if (!horarioGuardado.value) {
      // No existía un horario: se crea (POST)
      for (const reg of nuevosRegistros) {
        await fetch(`${API}/horarioEstudiantes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reg)
        });
      }
      horarioGuardado.value = true;
      tieneHorarioActual.value = true;
    } else {
      // Ya había horario presencial: PUT o cambio administrativo
      if (esCambioAdministrativo) {
        await fetch(`${API}/horarioEstudiantes/cambio-administrativo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioXPeriodoId: usuarioXPeriodoId.value,
            nuevosHorarios: nuevosRegistros
          })
        });
      } else {
        // Modificación por PUT
        if (Array.isArray(horarioActual.value)) {
          for (let i = 0; i < nuevosRegistros.length; i++) {
            if (i < horarioActual.value.length && horarioActual.value[i]?.Horario_ID) {
              await fetch(`${API}/horarioEstudiantes/${horarioActual.value[i].Horario_ID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevosRegistros[i])
              });
            } else {
              await fetch(`${API}/horarioEstudiantes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevosRegistros[i])
              });
            }
          }
        } else {
          // Caso único registro
          if (horarioActual.value?.Horario_ID) {
            await fetch(`${API}/horarioEstudiantes/${horarioActual.value.Horario_ID}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(nuevosRegistros[0])
            });
          } else {
            await fetch(`${API}/horarioEstudiantes`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(nuevosRegistros[0])
            });
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
  } catch (error: any) {
    console.error("Error al guardarHorario:", error);
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
    const urlHor = `${API}/horarioEstudiantes/completo?periodoId=${periodoSeleccionado.value.Periodo_ID}&area=${encodeURIComponent(areaSeleccionada.value)}`;
    const resHor = await fetch(urlHor);
    const todosHorarios = resHor.ok ? await resHor.json() : [];
    const horEstudiante = todosHorarios.filter((h: any) => h.Internal_ID === estudianteSeleccionado.value.usuario.Internal_ID);
    const virtual = horEstudiante.find((h: any) => h.Horario_Modalidad === 'Virtual');
    if (virtual) {
      const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
      for (const dia of dias) {
        const campo = `Horario_Dia_${dia}`;
        const paramId = virtual[campo];
        if (!paramId) continue;
        let paramInfo = allParametros.value.find((p: any) => p.Parametro_Horario_ID === paramId);
        if (!paramInfo) continue;
        horarioVirtual.value[dia] = {
          label: `${paramInfo.Parametro_Horario_Hora_Entrada.slice(0,5)} - ${paramInfo.Parametro_Horario_Hora_Salida.slice(0,5)}`,
          tipo: paramInfo.Parametro_Horario_Tipo
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
  if (isGuardando.value) return;
  if (calcularHorasTotales() > 12) {
    dialogoErrorVisible.value = true;
    return;
  }
  if (!validarCupos()) return;
  // Muestra el diálogo de confirmación para elegir el tipo de cambio (PUT o administrativo)
  if (tieneHorarioActual.value) {
  // ⚠️ Verifica si lo actual tiene registros presenciales, no virtuales
  if (Array.isArray(horarioActual.value) && horarioActual.value.length > 0) {
    dialogoCambioAdministrativo.value = true;
  } else {
    // No hay horarios presenciales, se hace POST directo
    await guardarHorario(false);
  }
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

  // Rango permitido: 07:00 a 21:00
  if (entradaTotalMin < 420 || salidaTotalMin > 1260) {
    toast.add({
      severity: 'error',
      summary: 'Horario fuera de rango',
      detail: 'Solo se permiten horarios entre 07:00 y 21:00.'
    });
    return;
  }

  // Validar que esté en un único turno: Temprano o Tarde
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
      nuevoHorarioEspecial.value = { entrada: '', salida: '', tipo: 'Temprano' };
      await cargarHorarios();
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


function volver() {
  // Ejemplo: router.push({ name: 'Dashboard' });
}
</script>

<style scoped>
/* Ajusta los estilos según prefieras */
</style>
