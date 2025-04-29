<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <!-- Encabezado -->
    <div class="w-full flex items-center justify-between mb-8">
      <Button
        icon="pi pi-arrow-left"
        class="p-button-text text-blue-600 hover:text-blue-800"
        @click="volver"
        tooltip="Volver al listado"
        tooltipOptions="{ position: 'top' }"
      />
      <h1 class="text-3xl font-bold text-center flex-grow">
        Registro de Asistencia Automático
      </h1>
      <div class="w-10"></div>
    </div>

    <Toast />

    <!-- Modal de error en caso de no encontrar el estudiante -->
    <Dialog
      v-model:visible="showErrorModal"
      header="Error"
      :modal="true"
      :closable="true"
      style="width: 30rem"
    >
      <p class="text-center">{{ errorModalMessage }}</p>
      <div class="flex justify-center mt-4">
        <Button label="Cerrar" @click="showErrorModal = false" />
      </div>
    </Dialog>

    <!-- Formulario para ingresar cédula -->
    <div class="w-full max-w-md p-6 rounded-lg shadow-lg mb-8" :class="cardClass">
      <h2 class="text-xl font-semibold text-center mb-4">Ingrese su Cédula</h2>
      <input
        v-model="cedulaInput"
        type="text"
        placeholder="Ingrese su cédula"
        class="w-full p-3 border rounded-lg"
        @keyup.enter="buscarEstudiante"
      />

      <Button label="Buscar" class="mt-4" @click="buscarEstudiante" />
    </div>

    <!-- Datos del estudiante -->
    <div v-if="estudianteCargado" :class="['w-full max-w-3xl p-6 rounded-lg shadow-lg', cardClass]">
      <h2 class="text-xl font-semibold text-center mb-6">Detalles del Estudiante</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label class="block font-medium mb-1">Cédula</label>
          <p class="p-3 rounded-lg border" :class="inputClass">{{ cedula }}</p>
        </div>
        <div>
          <label class="block font-medium mb-1">Nombres</label>
          <p class="p-3 rounded-lg border" :class="inputClass">{{ nombres }}</p>
        </div>
        <div>
          <label class="block font-medium mb-1">Apellidos</label>
          <p class="p-3 rounded-lg border" :class="inputClass">{{ apellidos }}</p>
        </div>
        <div>
          <label class="block font-medium mb-1">Correo Institucional</label>
          <p class="p-3 rounded-lg border" :class="inputClass">{{ correo }}</p>
        </div>
        <div>
          <label class="block font-medium mb-1">Área</label>
          <p class="p-3 rounded-lg border" :class="inputClass">{{ area || "N/A" }}</p>
        </div>
      </div>

      <!-- Información del período actual -->
      <div v-if="periodoActual" class="mt-4 text-center">
        <p class="text-lg text-green-600">
          Estás en el período: {{ periodoActual.period.Period_Name }}
        </p>
      </div>

    <!-- Horario programado -->
        <div class="mt-6 text-center" v-if="scheduledTimeUTC">
          <p class="text-lg">
            Tu hora de {{ tipoRegistro === 'entrada' ? 'entrada' : 'salida' }} es: 
            <strong>{{ scheduledTimeUTC.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</strong>
          </p>
          <p v-if="tipoRegistro === 'entrada'" class="text-sm text-gray-600">
            (Ventana de 10 minutos antes y 10 después)
          </p>
        </div>


      <!-- Si ya existe registro de entrada, mostrar la hora convertida a local -->
      <div v-if="tipoRegistro === 'salida' && registroEntradaLocal" class="mt-4 text-center">
        <p class="text-lg text-blue-600">
          Ya ingresaste a las: {{ registroEntradaLocal }}
        </p>
      </div>

      <!-- Botón para guardar la asistencia -->
      <div class="flex flex-col items-center mt-8">
        <Button
          label="Cancelar"
          severity="danger"
          class="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white mt-2"
          @click="volver"
        />
      </div>
    </div>

    <!-- Modal para Captura de Huella con Spinner -->
    <Dialog
  v-model:visible="dialogoActivo"
  :header="`Capturar Huella (${tipoRegistro === 'entrada' ? 'Ingreso' : 'Salida'})`"
  :modal="true"
  :closable="false"
  style="width: 30rem"
>
  <div class="flex flex-col items-center">
    <p class="mb-4 text-center text-lg font-medium">
      {{ tipoRegistro === 'entrada' ? 'Ingreso' : 'Salida' }} - Coloca tu dedo en el lector
    </p>
    <ProgressSpinner
      style="width:50px; height:50px;"
      strokeWidth="8"
      animationDuration=".8s"
    />
    <div class="flex gap-4 mt-4">
      <Button label="Cancelar" class="p-button-danger" @click="cancelarCaptura" />
    </div>
  </div>
</Dialog>

  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import ProgressSpinner from "primevue/progressspinner";
import Dropdown from "primevue/dropdown";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { API, type Usuario } from "@/ApiRoute";
import { useDarkMode } from "@/components/ThemeSwitcher";

// Router
const router = useRouter();

// Temas
const { isDarkTheme } = useDarkMode();

// Toast
const toast = useToast();

// VARIABLES DE DATOS DEL ESTUDIANTE Y REGISTRO
const cedulaInput = ref("");
const showErrorModal = ref(false);
const errorModalMessage = ref("");
const estudianteCargado = ref(false);

// Datos del estudiante
const cedula = ref("");
const nombres = ref("");
const apellidos = ref("");
const correo = ref("");
const area = ref("");

// Variables para huella
const huellaGuardada = ref("");
const huellaBase64 = ref("");
const huellaCapturada = ref(false);

// Variables para registro de asistencia
const registroAbierto = ref<any>(null);
const tipoRegistro = ref("entrada"); // "entrada" o "salida"

// UsuarioXPeriodo y período actual
const usuarioXPeriodoId = ref("");
const periodoActual = ref<any>(null);

// Estados UI
const cargando = ref(false);
const dialogoActivo = ref(false);
const capturando = ref(false);


// 🧪 SIMULACIÓN DE FECHA Y HORA
// SIMULACIÓN DE FECHA Y HORA ACTUAL
const modoSimulacion = true; // ⚠️ Cambia a false para usar la hora real
const fechaSimulada = new Date("2025-04-23T13:51:00"); // Lunes 8:49 AM

function getAhoraLocal(): Date {
  return modoSimulacion ? new Date(fechaSimulada) : new Date();
}


// Mostrar hora de entrada (convertida a local) si ya existe registro de asistencia
const registroEntradaLocal = computed(() => {
  if (registroAbierto.value && registroAbierto.value.Attendance_Entry) {
    return new Date(registroAbierto.value.Attendance_Entry).toLocaleTimeString("es-EC", {
      timeZone: "America/Guayaquil",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  return "";
});

const horaEntradaProgramada = computed(() => {
  const ahora = getAhoraLocal();
  return horarioDelDia.value?.find(h => {
    const entradaDesde = new Date(h.entrada.getTime() - 10 * 60000);
    const salidaHasta = h.salida;
    return ahora >= entradaDesde && ahora <= salidaHasta;
  })?.entrada || null;
});

const horaSalidaProgramada = computed(() => {
  const ahora = getAhoraLocal();
  const posiblesHorarios = horarioDelDia.value || [];

  // Filtrar solo los horarios cuyo turno ya haya empezado (es decir, estamos dentro o después del turno)
  const horariosValidos = posiblesHorarios.filter(h => ahora >= h.entrada);

  // De esos, tomar el que esté más cerca a la hora actual (último que aplica)
  if (horariosValidos.length > 0) {
    return horariosValidos[horariosValidos.length - 1].salida;
  }

  return null;
});






// Clases para dark mode
const cardClass = computed(() =>
  isDarkTheme.value ? "bg-gray-800 text-white shadow-lg" : "bg-white text-gray-900 shadow-lg"
);
const inputClass = computed(() =>
  isDarkTheme.value
    ? "bg-gray-900 text-white border-gray-700"
    : "bg-white text-gray-900 border-gray-300"
);

// Variables para el horario completo del estudiante (se obtiene vía backend)
const horarioCompleto = ref<any[]>([]);

const horarioDelDia = computed(() => {
  if (!horarioCompleto.value || horarioCompleto.value.length === 0) return null;

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = getAhoraLocal();
  const dayKey = days[now.getDay()];

  // Evitamos los fines de semana
  if (dayKey === "Sunday" || now.getDay() === 0 || now.getDay() > 5) return null;

  return horarioCompleto.value
    .map((schedule: any) => {
      const entryKey = `${dayKey}_Start`;
      const exitKey = `${dayKey}_End`;
      const entryStr = schedule[entryKey];
      const exitStr = schedule[exitKey];

      if (!entryStr || !exitStr) return null;

      const [eh, em, es] = entryStr.split(":").map(Number);
      const entry = new Date(now);
      entry.setHours(eh, em, es || 0, 0);

      const [sh, sm, ss] = exitStr.split(":").map(Number);
      const exit = new Date(now);
      exit.setHours(sh, sm, ss || 0, 0);

      console.log("Horario del día:", entry, exit);
      return { entrada: entry, salida: exit };
    })
    .filter((h: any) => h !== null);
});



/* CICLO DE VIDA: Cargar datos al montar */
onMounted(() => {
  console.log(
    modoSimulacion
      ? `🧪 Modo Simulación ACTIVADO - Fecha simulada: ${fechaSimulada.toLocaleString()}`
      : "⏱️ Modo Real ACTIVADO - Usando hora del sistema"
  );
});


/* FUNCIONES DE BÚSQUEDA Y CARGA DE ESTUDIANTE */
const buscarEstudiante = async () => {
  if (!cedulaInput.value) {
    toast.add({
      severity: "warn",
      summary: "Falta cédula",
      detail: "Ingrese una cédula para buscar.",
      life: 3000,
    });
    return;
  }
  cargando.value = true;
  try {
    // Obtener datos del estudiante
    const response = await fetch(`${API}/internal-user/${cedulaInput.value}`);
    if (!response.ok) throw new Error("Estudiante no encontrado");
    const data: Usuario = await response.json();
    cedula.value = data.Internal_ID;
    nombres.value = data.Internal_Name;
    apellidos.value = data.Internal_LastName;
    correo.value = data.Internal_Email;
    area.value = data.Internal_Area || "";
    // Opcional: obtener la huella almacenada
    const resHuella = await fetch(`${API}/usuarios/obtener-huella/${data.Internal_ID}`);
    if (resHuella.ok) {
      const huellaData = await resHuella.json();
      huellaGuardada.value = huellaData.huella || "";
    }
    // Consultar los períodos del estudiante
    const resPeriodos = await fetch(`${API}/usuarioXPeriodo/usuario/${cedula.value}`);
    if (!resPeriodos.ok) throw new Error("Error al obtener los períodos del estudiante");
    const periodosData = await resPeriodos.json();
    console.log("Períodos del estudiante:", periodosData);
    const hoy = getAhoraLocal();
    periodoActual.value = periodosData.find((p: any) => {
      const inicio = new Date(p.period.Period_Start);
      const fin = new Date(p.period.Period_End);
      return hoy >= inicio && hoy <= fin;
    });
    if (!periodoActual.value) {
      throw new Error("No se encontró un período activo para el estudiante");
    }
    usuarioXPeriodoId.value = periodoActual.value.UserXPeriod_ID;
    console.log("Periodo actual:", periodoActual.value);
    console.log("usuarioXPeriodoId:", usuarioXPeriodoId.value);
    // Cargar el registro de asistencia abierto (si lo hay)
    await cargarRegistroAsistenciaAbierto();
    estudianteCargado.value = true;
    // Cargar el horario completo del estudiante (GET /horarioEstudiantes/completo/usuarioxperiodo/:usuarioXPeriodoId?modalidad=Presencial)
    await cargarHorarioCompleto();
    // ✅ Verificar que tenga horario para hoy antes de capturar huella
    if (!scheduledTimeUTC.value) {
  if (horarioDelDia.value && horarioDelDia.value.length > 0) {
    const ahora = getAhoraLocal();
    let turnoProximo: any = null;

    for (const h of horarioDelDia.value) {
      const entradaDesde = new Date(h.entrada.getTime() - 10 * 60000);
      const salidaHasta = new Date(h.salida.getTime() + 10 * 60000);

      if (
        tipoRegistro.value === "entrada" &&
        ahora < h.entrada
      ) {
        turnoProximo = h.entrada;
        break;
      }

      if (
        tipoRegistro.value === "salida" &&
        ahora < salidaHasta
      ) {
        turnoProximo = h.salida;
        break;
      }
    }

    if (turnoProximo) {
      const diffMin = Math.ceil((turnoProximo.getTime() - ahora.getTime()) / 60000);
      toast.add({
        severity: "info",
        summary: `Aún no puedes registrar ${tipoRegistro.value}`,
        detail: `Tu horario ${tipoRegistro.value === "entrada" ? 'inicia' : 'termina'} a las ${turnoProximo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Faltan ${diffMin} minutos.`,
        life: 6000,
      });
    } else {
      toast.add({
        severity: "warn",
        summary: "Fuera de rango",
        detail: `Ya no estás en un horario válido para registrar ${tipoRegistro.value}.`,
        life: 4000,
      });
    }
  } else {
    toast.add({
      severity: "warn",
      summary: "Sin horario para hoy",
      detail: "No tienes un horario asignado para hoy.",
      life: 4000,
    });
  }
  return;
}


    // Iniciar la captura de huella
    if (!huellaGuardada.value) {
  toast.add({
    severity: "warn",
    summary: "Huella no encontrada",
    detail: "Este estudiante no tiene huella registrada. No se puede realizar el registro automático.",
    life: 4000,
  });
  return;
}

// Iniciar la captura si tiene huella
dialogoActivo.value = true;
iniciarCaptura();

  } catch (error: any) {
    console.error("Error al cargar el estudiante:", error);
    errorModalMessage.value = error.message || "Error al cargar los datos del estudiante.";
    showErrorModal.value = true;
  } finally {
    cargando.value = false;
  }
};

/* Cargar el registro de asistencia abierto (para determinar si es entrada o salida) */
const cargarRegistroAsistenciaAbierto = async () => {
  if (!cedula.value) return;
  try {
    const hoy = getAhoraLocal();

    // Se envía la fecha en formato ISO (considerando UTC)
    const response = await fetch(
  `${API}/registros/abierto?userXPeriodId=${usuarioXPeriodoId.value}&date=${hoy.toISOString()}&mode=Presencial`
);


    console.log("Registro abierto:", response);
    if (response.ok) {
      const data = await response.json();
      if (data) {
        registroAbierto.value = data;
        tipoRegistro.value = "salida";
      } else {
        registroAbierto.value = null;
        tipoRegistro.value = "entrada";
      }
    } else {
      registroAbierto.value = null;
      tipoRegistro.value = "entrada";
    }
  } catch (error) {
    console.error("Error al cargar registro abierto:", error);
    registroAbierto.value = null;
    tipoRegistro.value = "entrada";
  }
};

/* Cargar el horario completo asignado al estudiante */
async function cargarHorarioCompleto() {
  if (!usuarioXPeriodoId.value) return;
  try {
    const url = `${API}/horarioEstudiantes/completo/usuarioxperiodo/${usuarioXPeriodoId.value}?mode=Presencial`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error("No se pudieron cargar los horarios completos");
      return;
    }

    const horarios = await res.json();

    // Filtrar los horarios activos (Schedule_IsDeleted === 0)
    horarioCompleto.value = horarios.filter((h: any) => h.Schedule_IsDeleted === 0);

    console.log("Horario completo cargado:", horarioCompleto.value);
  } catch (error) {
    console.error("Error al cargar el horario completo:", error);
  }
}



/* CALCULAR HORARIO PROGRAMADO: Computed que usa el horario completo y el día actual */
const scheduledTimeUTC = computed(() => {
  return tipoRegistro.value === "salida"
    ? horaSalidaProgramada.value
    : horaEntradaProgramada.value;
});






/* Mostrar la hora programada en pantalla (convertida a local) */
const scheduledTimeString = computed(() => {
  if (!scheduledTimeUTC.value) return "No asignado";
  return scheduledTimeUTC.value.toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  });
});

/* Calcular si el registro es con atraso: se determina comparando la hora actual (UTC) con la programada */
const esAtraso = computed(() => {
  if (!scheduledTimeUTC.value || tipoRegistro.value !== "entrada") return false;

  const ahoraLocal = getAhoraLocal();
  const programado = scheduledTimeUTC.value;

  const diffMinutos = (ahoraLocal.getTime() - programado.getTime()) / 60000;
  return diffMinutos > 30;
});



/* GUARDAR ASISTENCIA: Usaremos el endpoint de registros para crear/actualizar asistencia */
const guardarAsistencia = async () => {

  console.log("Scheduled:", scheduledTimeUTC.value?.toLocaleTimeString());
console.log("Ahora:", getAhoraLocal().toLocaleTimeString());
console.log("¿Es atraso?:", esAtraso.value);


  if (!scheduledTimeUTC.value) {
  toast.add({
    severity: "warn",
    summary: "Horario no asignado",
    detail: "No tienes un horario asignado para hoy. No se puede registrar la asistencia.",
    life: 4000
  });
  return;
}


  try {
    // Preparar el payload del registro de asistencia
    const nowUTC = modoSimulacion
  ? new Date(fechaSimulada)
  : new Date();

const fechaSimuladaSalida = new Date("2025-04-23T17:59:00");


let payload: any = {
  UserXPeriod_ID: usuarioXPeriodoId.value,
  Attendance_Type: "Presencial",
  Attendance_Comment: null,
  Attendance_Date: nowUTC,
  Attendance_Late: esAtraso.value,
  Attendance_IsDeleted: false
};

if (tipoRegistro.value === "entrada") {
  payload.Attendance_Entry = nowUTC;
} else if (tipoRegistro.value === "salida") {
  payload.Attendance_Exit = modoSimulacion ? fechaSimuladaSalida : nowUTC;
}




    if (registroAbierto.value && tipoRegistro.value === "salida") {
      // Actualizar el registro de salida (PUT)
      const registroId = registroAbierto.value.Attendance_ID;
      if (!registroId) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "No se encontró el registro de entrada para actualizar la salida.",
          life: 5000
        });
        return;
      }
      const res = await fetch(`${API}/registros/${registroId}/salida`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("No se pudo actualizar el registro de asistencia (salida).");
      toast.add({
        severity: "success",
        summary: "Salida Registrada",
        detail: "Registro de salida actualizado correctamente.",
        life: 3000
      });
    } else {
      // Crear un nuevo registro de asistencia (entrada)
      const res = await fetch(`${API}/registros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("No se pudo crear el registro de asistencia (entrada).");
      toast.add({
        severity: "success",
        summary: "Entrada Registrada",
        detail: "Registro de entrada creado correctamente.",
        life: 3000
      });
    }
    // Después de registrar asistencia, redirigir o actualizar la vista según se requiera
    setTimeout(() => {
      router.push("/AsignacionHuella");
    }, 3000);
  } catch (error: any) {
    console.error("Error al guardar la asistencia:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message || "No se pudo guardar la asistencia.",
      life: 5000
    });
  }
};

/* FUNCIONES PARA CAPTURA DE HUELLA */
const iniciarCaptura = async () => {
  if (capturando.value) return;
  capturando.value = true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const response = await fetch("/SGIFPCapture", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        Origin: "http://localhost:5173",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        Licstr: "",
        FakeDetection: 1,
        Timeout: 15000,
        TemplateFormat: "ISO",
        ImageWSQRate: 2.25
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`Respuesta HTTP inválida: ${response.status}`);
    const data = await response.json();
  
    if (data.ErrorCode === 0 && data.TemplateBase64) {
  huellaBase64.value = data.TemplateBase64;
  huellaCapturada.value = true;

  // Comparar con la huella almacenada
    // Comparar huellas
    const params = new URLSearchParams();
    params.append("Template1", huellaGuardada.value);
    params.append("Template2", huellaBase64.value);
    params.append("Licstr", "");
    params.append("TemplateFormat", "ISO");

    const resMatch = await fetch("/SGIMatchScore", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "*/*"
      },
      body: params
    });

    if (!resMatch.ok) throw new Error("Error al comparar las huellas.");
    const matchData = await resMatch.json();

    if (matchData.ErrorCode !== 0 || matchData.MatchingScore < 70) {
      toast.add({
        severity: "error",
        summary: "Huella no válida",
        detail: `No coincide la huella (score: ${matchData.MatchingScore}).`,
        life: 4000
      });
      dialogoActivo.value = false;
      huellaBase64.value = "";
      huellaCapturada.value = false;
      return;
    }

    toast.add({
      severity: "success",
      summary: "Huella Validada",
      detail: `Coincidencia aceptada. Score: ${matchData.MatchingScore}`,
      life: 3000
    });
  

  // ✅ Actualizar la huella después de coincidencia
  try {
    const actualizarHuella = await fetch(`${API}/usuarios/actualizar-huella`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioCedula: cedula.value,
        template: huellaBase64.value
      })
    });
    if (!actualizarHuella.ok) throw new Error("No se pudo actualizar la huella.");
    console.log("Huella actualizada correctamente.");
  } catch (err) {
    console.error("Error actualizando la huella del estudiante:", err);
  }

  dialogoActivo.value = false;
  await guardarAsistencia();
}
else {
      throw new Error(`Error en la captura. Código: ${data.ErrorCode}`);
    }
  } catch (error: any) {
    console.error("Error al capturar la huella:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo capturar la huella. Verifica la conexión con el lector.",
      life: 5000
    });
  } finally {
    capturando.value = false;
  }
};

const cancelarCaptura = () => {
  dialogoActivo.value = false;
  capturando.value = false;
};

/* FUNCIONES DE NAVEGACIÓN */
const volver = () => {
  router.push("/AsignacionHuella");
};

</script>

<style scoped>
/* Personaliza tus estilos aquí */
</style>
