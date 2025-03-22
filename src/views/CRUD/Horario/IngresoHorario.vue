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
      <Column field="usuario.Usuario_Cedula" header="Cédula" />
      <Column field="usuario.Usuario_Nombres" header="Nombres" />
      <Column field="usuario.Usuario_Apellidos" header="Apellidos" />
      <Column field="usuario.Usuario_Area" header="Área" />
    </DataTable>

    <!-- Sección de asignación de horarios -->
    <div v-if="estudianteSeleccionado" class="mt-6 w-full max-w-6xl">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">
          Asignar Horarios (Lunes a Viernes) – Modalidad: Presencial
        </h3>
        <!-- Botón global para crear horario especial -->
        <Button
          label="Agregar Horario Especial"
          class="p-button-success"
          @click="abrirModalHorarioEspecial"
        />
      </div>
      <div
        v-for="dia in diasSemana"
        :key="dia.nombre"
        class="flex items-center gap-4 mb-2"
      >
        <span class="w-24 font-bold">{{ dia.nombre }}</span>
        <Dropdown
          v-model="horariosSeleccionados[dia.nombre]"
          :options="dia.horarios"
          optionLabel="label"
          placeholder="Seleccionar horario"
          class="w-60"
        />
        <!-- Mostrar cupos al lado del dropdown -->
        <small class="whitespace-nowrap">
          Temprano: {{ cuposDisponibles[dia.nombre]?.Temprano || 0 }} /
          Tarde: {{ cuposDisponibles[dia.nombre]?.Tarde || 0 }}
        </small>
        <Button
          icon="pi pi-trash"
          class="p-button-danger"
          @click="quitarHorario(dia.nombre)"
        />
      </div>
      <Button
  label="Guardar Horarios"
  class="mt-4 p-button-success"
  :disabled="isGuardando"
  @click="validarYGuardar"
/>
    </div>

    <!-- Modal para crear horario especial (general) -->
    <Dialog v-model:visible="dialogoHorarioEspecialVisible" header="Crear Horario Especial">
      <div class="flex flex-col gap-3">
        <p>Crear un horario especial para casos excepcionales (se podrá usar en cualquier día).</p>
        <InputText v-model="nuevoHorarioEspecial.entrada" type="time" label="Hora Entrada" />
        <InputText v-model="nuevoHorarioEspecial.salida" type="time" label="Hora Salida" />
      </div>
      <template #footer>
        <Button label="Cancelar" @click="dialogoHorarioEspecialVisible = false" />
        <Button label="Guardar" class="p-button-success" @click="crearHorarioEspecial" />
      </template>
    </Dialog>

    <!-- Modal de error por exceso de horas o cupos 0 -->
    <Dialog v-model:visible="dialogoErrorVisible" header="Error">
      <p>No puedes asignar más de 12 horas semanales o guardar si algún cupo es 0.</p>
      <template #footer>
        <Button label="Entendido" class="p-button-danger" @click="dialogoErrorVisible = false" />
      </template>
    </Dialog>

    <!-- Modal de confirmación de cambio administrativo -->
    <Dialog v-model:visible="dialogoCambioAdministrativo" header="Confirmar Cambio">
      <p>¿El cambio se realiza antes de iniciar registros de asistencia?</p>
      <template #footer>
        <Button label="Antes de registros" class="p-button-secondary" @click="guardarHorario(true)" />
        <Button label="Cambio Administrativo" class="p-button-danger" @click="guardarHorario(false)" />
      </template>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { API, type UsuarioXPeriodo, type Periodo, type Parametro_Horario } from '@/views/Interfaces';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
// Variable para evitar múltiples envíos
const isGuardando = ref(false);

// Bandera para indicar que ya se guardó el horario para el estudiante
const horarioGuardado = ref(false);
// Variable para almacenar el horario actual del estudiante (obtenido de la BD)
const horarioActual = ref(null);

// Estados principales
const periodos = ref<Periodo[]>([]);
const estudiantes = ref<UsuarioXPeriodo[]>([]);
const estudianteSeleccionado = ref<UsuarioXPeriodo | null>(null);
const periodoSeleccionado = ref<Periodo | null>(null);
const areaSeleccionada = ref<string | null>(null);
const busquedaNombre = ref('');
const busquedaCedula = ref('');
const parametroHorarioCache = {};

// Estados para horarios, cupos y disponibilidad
const horariosSeleccionados = ref<Record<string, any>>({});
const usuarioXPeriodoId = ref<number | null>(null);
const tieneHorarioActual = ref(false);
const cuposDisponibles = ref<Record<string, any>>({});

const dialogoHorarioEspecialVisible = ref(false);
const dialogoErrorVisible = ref(false);
const dialogoCambioAdministrativo = ref(false);
const diaEspecial = ref('');
const nuevoHorarioEspecial = ref({ entrada: '', salida: '', tipo: 'Temprano' });

// Días de la semana y opciones de área
const diasSemana = ref([
  { nombre: 'Lunes', horarios: [] },
  { nombre: 'Martes', horarios: [] },
  { nombre: 'Miercoles', horarios: [] },
  { nombre: 'Jueves', horarios: [] },
  { nombre: 'Viernes', horarios: [] }
]);
const opcionesAreas = ['Derecho Penal', 'Derecho Civil', 'Niñez y Adolescencia', 'Movilidad Humana'];

// Carga inicial de períodos
onMounted(() => {
  fetchPeriodos();
});

// Al cambiar filtros (período/área) se limpian estudiantes, horarios y cupos
watch([periodoSeleccionado, areaSeleccionada], () => {
  limpiarHorarios();
  fetchEstudiantes();
});

// Al cambiar la selección del estudiante, se limpian y se cargan los horarios y cupos
watch(estudianteSeleccionado, async () => {
  limpiarHorarios();
  await nextTick();
  if (estudianteSeleccionado.value) {
    await cargarHorarios();
  }
});

// Función para cargar períodos
async function fetchPeriodos() {
  try {
    periodos.value = await (await fetch(`${API}/periodos`)).json();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los períodos' });
  }
}

// Función para cargar estudiantes según período y área
async function fetchEstudiantes() {
  if (!periodoSeleccionado.value || !areaSeleccionada.value) return;
  try {
    estudiantes.value = await (await fetch(`${API}/usuarioXPeriodo/periodo/${periodoSeleccionado.value.Periodo_ID}/area/${areaSeleccionada.value}`)).json();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los estudiantes' });
  }
}

const estudiantesFiltrados = computed(() =>
  estudiantes.value.filter(est =>
    est.usuario.Usuario_Nombres.toLowerCase().includes(busquedaNombre.value.toLowerCase()) &&
    est.usuario.Usuario_Cedula.includes(busquedaCedula.value)
  )
);

function abrirModalHorarioEspecial() {
  // Limpia los campos del modal
  nuevoHorarioEspecial.value.entrada = '';
  nuevoHorarioEspecial.value.salida = '';
  nuevoHorarioEspecial.value.tipo = 'Temprano'; // o lo que prefieras por defecto
  // Muestra el modal
  dialogoHorarioEspecialVisible.value = true;
}


// Función para limpiar la selección de horarios, cupos y usuarioXPeriodo
function limpiarHorarios() {
  horarioGuardado.value = false;
  horariosSeleccionados.value = {};
  usuarioXPeriodoId.value = null;
  tieneHorarioActual.value = false;
  cuposDisponibles.value = {};
  diasSemana.value.forEach(dia => (dia.horarios = []));
}

// Dentro de cargarHorarios(), se ajustan las URLs de disponibilidad
async function cargarHorarios() {
  if (!estudianteSeleccionado.value) return;
  try {
    const usuarioRes = await fetch(
      `${API}/usuarioxperiodo/${periodoSeleccionado.value.Periodo_ID}/${estudianteSeleccionado.value.usuario.Usuario_Cedula}`
    );
    const usuarioData = await usuarioRes.json();
    usuarioXPeriodoId.value = usuarioData.UsuarioXPeriodo_ID;
  } catch (error) {
    console.error("Error al obtener usuarioXPeriodo", error);
    return;
  }

  // Primero, cargar las opciones disponibles y los cupos para cada día
  for (const dia of diasSemana.value) {
    try {
      // Consulta de cupos disponibles
      const cuposRes = await fetch(
        `${API}/horario/disponibilidad/${periodoSeleccionado.value.Periodo_ID}/${areaSeleccionada.value}/${dia.nombre}`
      );
      const cupos = await cuposRes.json();
      // Suponiendo un máximo de 7 cupos por turno
      const MAX_TURNO = 7;
      const usadoTemprano = parseInt(cupos.cantidadTemprano) || 0;
      const usadoTarde = parseInt(cupos.cantidadTarde) || 0;
      cuposDisponibles.value[dia.nombre] = {
        Temprano: Math.max(0, MAX_TURNO - usadoTemprano),
        Tarde: Math.max(0, MAX_TURNO - usadoTarde)
      };

      // Importante: Se removió el usuarioXPeriodoId de la URL
      const urlTemprano = `${API}/parametroHorario/disponibilidad/Temprano/${periodoSeleccionado.value.Periodo_ID}/${areaSeleccionada.value}/${dia.nombre}`;
      const urlTarde = `${API}/parametroHorario/disponibilidad/Tarde/${periodoSeleccionado.value.Periodo_ID}/${areaSeleccionada.value}/${dia.nombre}`;
      
      const [horariosTempranoRes, horariosTardeRes] = await Promise.all([
        fetch(urlTemprano),
        fetch(urlTarde)
      ]);
      let horariosTemprano = horariosTempranoRes.ok ? await horariosTempranoRes.json() : [];
      let horariosTarde = horariosTardeRes.ok ? await horariosTardeRes.json() : [];
      if (!Array.isArray(horariosTemprano)) horariosTemprano = [];
      if (!Array.isArray(horariosTarde)) horariosTarde = [];
      
      dia.horarios = [
        ...horariosTemprano.map((h) => ({
          label: `${h.Parametro_Horario_Hora_Entrada} - ${h.Parametro_Horario_Hora_Salida} (Temprano)`,
          value: h.Parametro_Horario_ID,
          tipo: 'Temprano'
        })),
        ...horariosTarde.map((h) => ({
          label: `${h.Parametro_Horario_Hora_Entrada} - ${h.Parametro_Horario_Hora_Salida} (Tarde)`,
          value: h.Parametro_Horario_ID,
          tipo: 'Tarde'
        }))
      ];
    } catch (error) {
      console.error(`Error al cargar horarios para ${dia.nombre}`, error);
    }
  }
  
  // Luego, cargar el horario actual asignado (para que se muestre en el dropdown, incluso si no está en la lista)
  try {
    const horarioRes = await fetch(`${API}/horario/usuarioxperiodo/${usuarioXPeriodoId.value}`);
    tieneHorarioActual.value = horarioRes.ok;
    if (tieneHorarioActual.value) {
      await cargarHorarioActual();
    }
  } catch (error) {
    console.error("Error al verificar horario existente", error);
    tieneHorarioActual.value = false;
  }
}


// Función auxiliar para buscar la opción en el array que coincida con el ID
function obtenerOpcionPorId(opciones, id) {
  return opciones.find(opcion => opcion.value === id) || null;
}


// Función auxiliar asíncrona para asignar la opción "Tu horario actual"
async function asignarOpcion(diaNombre, paramId, turnoDefault) {
  const diaObj = diasSemana.value.find(d => d.nombre === diaNombre);
  if (!diaObj) return null;

  // Eliminar cualquier opción existente con el mismo ID para evitar duplicados
  diaObj.horarios = diaObj.horarios.filter(opt => opt.value !== paramId);

  let opcion = obtenerOpcionPorId(diaObj.horarios, paramId);
  if (!opcion && paramId) {
    // Primero, revisamos la cache
    if (parametroHorarioCache[paramId]) {
      opcion = {
        label: `Tu horario actual: ${parametroHorarioCache[paramId].label}`,
        value: paramId,
        tipo: parametroHorarioCache[paramId].tipo
      };
    } else {
      // Si no está en cache, obtenemos la información mediante fetch
      try {
        const response = await fetch(`${API}/parametroHorario/${paramId}`);
        if (response.ok) {
          const data = await response.json();
          opcion = {
            label: `${data.Parametro_Horario_Hora_Entrada} - ${data.Parametro_Horario_Hora_Salida} (${data.Parametro_Horario_Tipo})`,
            value: paramId,
            tipo: data.Parametro_Horario_Tipo
          };
          // Guardamos en cache
          parametroHorarioCache[paramId] = { ...opcion };
          // Actualizamos el label para indicar que es el horario actual
          opcion.label = `Tu horario actual: ${opcion.label}`;
        } else {
          console.error(`Error fetching parametroHorario con ID ${paramId}`);
        }
      } catch (err) {
        console.error(`Error al obtener parametroHorario con ID ${paramId}:`, err);
      }
    }
    if (opcion) {
      diaObj.horarios.push(opcion);
    }
  } else if (opcion) {
    // Si ya existe, actualizamos su label
    opcion.label = `Tu horario actual: ${opcion.label}`;
  }
  return opcion;
}

async function cargarHorarioActual() {
  if (!usuarioXPeriodoId.value) return;
  try {
    const res = await fetch(`${API}/horario/usuarioxperiodo/${usuarioXPeriodoId.value}`);
    if (res.ok) {
      const horarioData = await res.json();
      // Para cada día, se espera que horarioData tenga los IDs asignados, por ejemplo:
      // { Horario_Dia_Lunes: 4, Horario_Dia_Martes: 4, Horario_Dia_Miercoles: 6, Horario_Dia_Jueves: null, Horario_Dia_Viernes: null }
      
      horariosSeleccionados.value['Lunes'] = await asignarOpcion('Lunes', horarioData.Horario_Dia_Lunes, 'Temprano');
      horariosSeleccionados.value['Martes'] = await asignarOpcion('Martes', horarioData.Horario_Dia_Martes, 'Temprano');
      horariosSeleccionados.value['Miercoles'] = await asignarOpcion('Miercoles', horarioData.Horario_Dia_Miercoles, 'Temprano');
      // Para Jueves y Viernes, asumiendo que se asignan del turno Tarde:
      horariosSeleccionados.value['Jueves'] = await asignarOpcion('Jueves', horarioData.Horario_Dia_Jueves, 'Tarde');
      horariosSeleccionados.value['Viernes'] = await asignarOpcion('Viernes', horarioData.Horario_Dia_Viernes, 'Tarde');
      
      horarioGuardado.value = true;
      await nextTick();
    }
  } catch (error) {
    console.error("Error al cargar el horario actual", error);
  }
}



// Antes de guardar, se verifica que para cada día, si se eligió un horario,
// el cupo disponible para el tipo seleccionado sea mayor que 0.
function validarCupos() {
  for (const dia of diasSemana.value) {
    const seleccionado = horariosSeleccionados.value[dia.nombre];
    if (seleccionado) {
      const tipo = seleccionado.tipo;
      const cupo = cuposDisponibles.value[dia.nombre] ? cuposDisponibles.value[dia.nombre][tipo] : 0;
      if (cupo === 0) {
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

// Función para calcular el total de horas asignadas (basado en el label de la opción)
function calcularHorasTotales() {
  return Object.values(horariosSeleccionados.value).reduce((total, horario) => {
    if (!horario) return total;
    const [inicio, fin] = horario.label.split(' - ').map(h => parseInt(h.split(':')[0]));
    return total + (fin - inicio);
  }, 0);
}

async function validarYGuardar() {
  // Evitar envíos múltiples mientras se está guardando
  if (isGuardando.value) return;
  
  if (calcularHorasTotales() > 12) {
    dialogoErrorVisible.value = true;
    return;
  }
  if (!validarCupos()) return;
  
  // Si ya se guardó el horario, en lugar de volver a enviarlo, mostramos la confirmación de cambio
  if (horarioGuardado.value) {
    dialogoCambioAdministrativo.value = true;
  } else {
    await guardarHorario(false);
  }
}
async function guardarHorario(esCambioAdministrativo) {
  if (isGuardando.value) return;
  isGuardando.value = true;

  // Construir el objeto que representa el nuevo horario basado en la selección actual
  const nuevoHorario = {
    Horario_Dia_Lunes: horariosSeleccionados.value['Lunes']?.value || null,
    Horario_Dia_Martes: horariosSeleccionados.value['Martes']?.value || null,
    Horario_Dia_Miercoles: horariosSeleccionados.value['Miercoles']?.value || null,
    Horario_Dia_Jueves: horariosSeleccionados.value['Jueves']?.value || null,
    Horario_Dia_Viernes: horariosSeleccionados.value['Viernes']?.value || null,
    Horario_Modalidad: "Presencial"
  };

  let url = "";
  let method = "POST";
  let body = {};

  if (!horarioGuardado.value) {
    // Primera vez: creación (POST a /horario)
    nuevoHorario.UsuarioXPeriodo_ID = usuarioXPeriodoId.value;
    console.log("Creando horario:", nuevoHorario);
    url = `${API}/horario`;
    body = JSON.stringify({
      ...nuevoHorario
    });   
  } else {
    if (esCambioAdministrativo) {
      // Cambio administrativo: se debe enviar un objeto con usuarioXPeriodoId y nuevoHorario
      url = `${API}/horario/cambio-administrativo`;
      body = JSON.stringify({
        usuarioXPeriodoId: usuarioXPeriodoId.value,
        nuevoHorario: nuevoHorario
      });
      method = "POST";
    } else {
      // Cambio "antes de registros": se actualiza mediante PUT a /horario/:Horario_ID
      if (horarioActual.value && horarioActual.value.Horario_ID) {
        url = `${API}/horario/${horarioActual.value.Horario_ID}`;
        body = JSON.stringify({
          ...nuevoHorario
        });
        method = "PUT";
      } else {
        // Por seguridad, si no tenemos el ID, usamos la ruta de creación
        url = `${API}/horario`;
        body = JSON.stringify({
          ...nuevoHorario
        });
      }
    }
  }

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body
    });
    const respJson = await res.json();
    console.log("Respuesta:", respJson);
    if (res.ok) {
      toast.add({ 
        severity: "success", 
        summary: "Horario Guardado", 
        detail: "Asignado correctamente.", 
        life: 3000,
      });
      // Si fue creación inicial o actualización "antes de registros", marcamos el horario como guardado
      if (!horarioGuardado.value || method === "PUT") {
        horarioGuardado.value = true;
        tieneHorarioActual.value = true;
        // Actualizamos el registro si es PUT (suponiendo que respJson contiene el horario actualizado)
        if (method === "PUT") {
          horarioActual.value = respJson;
        }
      }
    } else {
      toast.add({ severity: "error", summary: "Error", detail: "No se pudo guardar el horario." });
    }
  } catch (error) {
    console.error("Error al guardar horario:", error);
  } finally {
    isGuardando.value = false;
    dialogoCambioAdministrativo.value = false; // Cierra el diálogo de cambio administrativo
  }
}


// Función para limpiar filtros
function limpiarFiltros() {
  periodoSeleccionado.value = null;
  areaSeleccionada.value = null;
  busquedaNombre.value = '';
  busquedaCedula.value = '';
  estudianteSeleccionado.value = null;
  estudiantes.value = [];
}

async function crearHorarioEspecial() {
  // 1. Calcular si es Temprano o Tarde según la hora de entrada/salida
  const entradaNum = parseInt(nuevoHorarioEspecial.value.entrada.split(':')[0]) || 0;
  const salidaNum = parseInt(nuevoHorarioEspecial.value.salida.split(':')[0]) || 0;

  // Reglas simples: si la hora de entrada o salida es >= 13 => Tarde; de lo contrario => Temprano
  let tipoCalculado = 'Temprano';
  if (entradaNum >= 13 || salidaNum > 13) {
    tipoCalculado = 'Tarde';
  }

  // 2. Construir el payload con los campos que necesita tu backend
  // (Asegúrate de que coincidan con tu modelo Parametro_Horario en el servidor)
  const payload = {
    Parametro_Horario_Hora_Entrada: nuevoHorarioEspecial.value.entrada,
    Parametro_Horario_Hora_Salida:  nuevoHorarioEspecial.value.salida,
    Parametro_Horario_Tipo:         tipoCalculado
  };

  try {
    // 3. Hacer POST a /parametroHorario
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
      // Cerrar el modal
      dialogoHorarioEspecialVisible.value = false;
      // Limpiar campos
      nuevoHorarioEspecial.value.entrada = '';
      nuevoHorarioEspecial.value.salida = '';
      // 4. Recargar la lista de horarios disponibles
      await cargarHorarios();
    } else {
      // Mostrar el error del servidor
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

function quitarHorario(dia) {
  // Limpiamos la selección para ese día.
  horariosSeleccionados.value[dia] = null;
  // Opcionalmente, si quieres que se quite también la opción "Tu horario actual" del array de opciones,
  // la eliminamos:
  const diaObj = diasSemana.value.find(d => d.nombre === dia);
  if (diaObj && Array.isArray(diaObj.horarios)) {
    // Por ejemplo, si la opción tiene un label que comienza con "Tu horario actual:", se elimina.
    diaObj.horarios = diaObj.horarios.filter(opt => !opt.label.startsWith("Tu horario actual:"));
  }
  // Forzamos la reactividad (opcional) para que el dropdown se refresque
  diasSemana.value = [...diasSemana.value];
}

</script>
