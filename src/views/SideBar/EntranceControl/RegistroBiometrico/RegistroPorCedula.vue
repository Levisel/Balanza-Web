<template>
  <main class="px-4 sm:px-8 py-6 max-w-2xl mx-auto min-h-screen transition-colors duration-300 space-y-8">
    <!-- Encabezado -->
    <div class="flex items-center gap-4">
      <Button
        icon="pi pi-arrow-left"
        class="p-button-text text-blue-600 hover:text-blue-800"
        @click="volver"
        tooltip="Volver al listado"
        tooltipOptions="{ position: 'top' }"
      />
      <h1 class="text-2xl sm:text-3xl font-bold text-center flex-grow">
        Registro de Asistencia Automático
      </h1>
      <div class="w-10"></div>
    </div>

    <Toast />

    <!-- Modal de error -->
    <Dialog
      v-model:visible="showErrorModal"
      header="⚠️ Error"
      modal
      :closable="true"
      style="width: 30rem"
      :class="isDarkTheme ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'"
    >
      <p class="text-center text-lg">{{ errorModalMessage }}</p>
        <div class="flex justify-center mt-4 mt-5">
          <Button label="Cerrar" severity="contrast" @click="showErrorModal = false" />
        </div>
    </Dialog>

    <!-- Formulario para cédula -->
    <div :class="[cardClass, 'rounded-2xl shadow-md p-6 w-full max-w-md mx-auto']">
      <h2 class="text-lg font-semibold text-center mb-4">Ingrese su Cédula</h2>
      <input
        v-model="cedulaInput"
        type="text"
        maxlength="15"
        placeholder="Ej: 0102030405"
        class="w-full p-3 border rounded-lg mb-4"
        @keyup.enter="buscarEstudiante"
      />
      <Button label="Buscar" class="w-full text-base px-6 py-3" @click="buscarEstudiante" />
    </div>

    <!-- Datos del estudiante -->
    <div
      v-if="estudianteCargado"
      :class="[cardClass, 'rounded-2xl shadow-md p-6 w-full mx-auto']"
    >
      <h2 class="text-lg font-semibold text-center mb-4">Datos del Estudiante</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
        <p><strong>Cédula:</strong> {{ cedula }}</p>
        <p><strong>Correo:</strong> {{ correo }}</p>
        <p><strong>Nombres:</strong> {{ nombres }}</p>             
        <p><strong>Área:</strong> {{ area || "N/A" }}</p>
        <p><strong>Apellidos:</strong> {{ apellidos }}</p>
        <p v-if="periodoActual"><strong>Período:</strong> {{ periodoActual.period.Period_Name }}</p>
      </div>
    </div>

    <!-- Registro de asistencia -->
   <!-- Registro de asistencia -->
<div
  v-if="estudianteCargado"
  :class="[cardClass, 'rounded-2xl shadow-md p-6 w-full max-w-xl mx-auto']"
>
  <h2 class="text-xl font-bold text-center mb-6">
    Registro de Asistencia
  </h2>

  <!-- Si ya registró entrada -->
  <div v-if="tipoRegistro === 'salida'" class="space-y-8">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
      <div class="flex flex-col items-center">
        <span class="text-gray-400 text-base sm:text-lg">Hora Programada</span>
        <span class="text-xl font-semibold">{{ scheduledTimeString }}</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-gray-400 text-base sm:text-lg">Entrada registrada</span>
        <span class="text-xl text-blue-400 font-semibold">{{ registroEntradaLocal }}</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-gray-400 text-base sm:text-lg">Falta</span>
        <span class="text-xl text-red-400 font-semibold">Salida</span>
      </div>
    </div>
  </div>

  <!-- Si aún no registra -->
  <div v-else class="text-center space-y-4">
    <p class="text-lg sm:text-xl">
      Tu hora de entrada es: <span class="font-bold">{{ scheduledTimeString }}</span>
    </p>
    <p class="text-base text-gray-500">
      (Ventana de 10 minutos antes y 10 después)
    </p>
  </div>

  <!-- Botones -->
  <div class="flex flex-col items-center mt-8 gap-4">
    <Button
      label="Cancelar"
      class="text-base px-6 py-3 p-button-danger"
      @click="volver"
    />
  </div>
</div>


    <!-- Modal de huella -->
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
import ProgressSpinner from "primevue/progressspinner";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { API } from "@/ApiRoute";
import { useDarkMode } from "@/components/ThemeSwitcher";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

// Router
const router = useRouter();

//Usuario del Sistema
const authStore = useAuthStore();

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


// SIMULACIÓN DE FECHA Y HORA ACTUAL
const modoSimulacion = false; // Cambiar a false para usar la hora real
const fechaSimulada = new Date("2025-04-30T13:51:00"); // Lunes 8:49 AM

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
    if (!h || !h.entrada) return null;
    const entradaDesde = h && h.entrada ? new Date(h.entrada.getTime() - 10 * 60000) : null;
    const salidaHasta = h.salida;
    return entradaDesde && ahora >= entradaDesde && ahora <= salidaHasta;
  })?.entrada || null;
});

const horaSalidaProgramada = computed(() => {
  const ahora = getAhoraLocal();
  const posiblesHorarios = horarioDelDia.value || [];

  // Filtrar solo los horarios cuyo turno ya haya empezado (es decir, estamos dentro o después del turno)
  const horariosValidos = posiblesHorarios.filter(h => h && ahora >= h.entrada);

  // De esos, tomar el que esté más cerca a la hora actual (último que aplica)
  if (horariosValidos.length > 0) {
    return horariosValidos.length > 0 && horariosValidos[horariosValidos.length - 1] !== null ? horariosValidos[horariosValidos.length - 1]!.salida : null;
  }

  return null;
});






// Clases para dark mode
const cardClass = computed(() =>
  isDarkTheme.value
    ? 'bg-[#1f1f1f] text-white border border-gray-700'
    : 'bg-white text-gray-900 border border-gray-200'
);

const inputClass = computed(() =>
  isDarkTheme.value
    ? 'bg-[#121212] text-white border border-gray-600'
    : 'bg-white text-gray-900 border border-gray-300'
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
    errorModalMessage.value = "Por favor, ingrese una cédula o pasaporte para buscar.";
    showErrorModal.value = true;
    return;
  }

  cargando.value = true;
  try {
    // Obtener datos del estudiante
    const { data } = await axios.get(`${API}/internal-user/${cedulaInput.value}`, {
      withCredentials: true,
    });

    if (!data || !data.Internal_ID) {
      errorModalMessage.value = "No se encontró ningún estudiante con la cédula ingresada.";
      showErrorModal.value = true;
      return;
    }

    // Verificar que sea un estudiante
    if (data.Internal_Type !== "Estudiante") {
      errorModalMessage.value = "El usuario encontrado no es un estudiante. Solo los estudiantes pueden usar este sistema.";
      showErrorModal.value = true;
      return;
    }

    cedula.value = data.Internal_ID;
    nombres.value = data.Internal_Name;
    apellidos.value = data.Internal_LastName;
    correo.value = data.Internal_Email;
    area.value = data.Internal_Area || "";

    // Obtener huella guardada
    try {
      const { data: huellaData } = await axios.get(`${API}/usuarios/obtener-huella/${data.Internal_ID}`, {
        withCredentials: true,
      });
      huellaGuardada.value = huellaData.huella || "";
    } catch (huellaError: any) {
      console.log("Error al obtener huella:", huellaError);
      // Si hay error al obtener la huella, asumimos que no tiene huella registrada
      huellaGuardada.value = "";
    }

    // Verificar si el usuario tiene una huella guardada
    if (!huellaGuardada.value) {
      huellaBase64.value = "";
      huellaCapturada.value = false;
      errorModalMessage.value = "Este estudiante no tiene huella registrada. Debe registrar su huella primero en el sistema para poder usar el registro automático.";
      showErrorModal.value = true;
      return;
    } 

    // Obtener períodos del estudiante
    const { data: periodosData } = await axios.get(`${API}/usuarioXPeriodo/usuario/${cedula.value}`, {
      withCredentials: true,
    });

    if (!periodosData || periodosData.length === 0) {
      errorModalMessage.value = "Este estudiante no está asignado a ningún período académico. Contacte al administrador.";
      showErrorModal.value = true;
      return;
    }

    const hoy = getAhoraLocal();
    periodoActual.value = periodosData.find((p: any) => {
      const inicio = new Date(p.period.Period_Start);
      const fin = new Date(p.period.Period_End);
      return hoy >= inicio && hoy <= fin;
    });

    if (!periodoActual.value) {
      errorModalMessage.value = "No se encontró un período académico activo para este estudiante. El registro de asistencia no está disponible.";
      showErrorModal.value = true;
      return;
    }

    usuarioXPeriodoId.value = periodoActual.value.UserXPeriod_ID;

    // Cargar asistencia y horario
    await cargarRegistroAsistenciaAbierto();
    await cargarHorarioCompleto();

    // Verificar que tenga horario asignado
    if (!horarioCompleto.value || horarioCompleto.value.length === 0) {
      errorModalMessage.value = "Este estudiante no tiene horario asignado. Contacte al administrador para configurar su horario.";
      showErrorModal.value = true;
      return;
    }

    estudianteCargado.value = true;

    // Validar horario antes de capturar
    if (!scheduledTimeUTC.value) {
      if (horarioDelDia.value && horarioDelDia.value.length > 0) {
        const ahora = getAhoraLocal();
        let turnoProximo: any = null;
        let mensajeHorario = "";

        for (const h of horarioDelDia.value) {
          const entradaDesde = h && h.entrada ? new Date(h.entrada.getTime() - 10 * 60000) : null;
          const salidaHasta = h && h.salida ? new Date(h.salida.getTime() + 10 * 60000) : null;

          if (h && tipoRegistro.value === "entrada" && ahora < h.entrada) {
            turnoProximo = h.entrada;
            const diffMin = Math.ceil((turnoProximo.getTime() - ahora.getTime()) / 60000);
            mensajeHorario = `Aún no puedes registrar entrada. Tu horario inicia a las ${turnoProximo.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}. Faltan ${diffMin} minutos.`;
            break;
          }

          if (tipoRegistro.value === "salida" && salidaHasta && ahora < salidaHasta) {
            turnoProximo = h ? h.salida : null;
            const diffMin = Math.ceil((turnoProximo.getTime() - ahora.getTime()) / 60000);
            mensajeHorario = `Aún no puedes registrar salida. Tu horario termina a las ${turnoProximo.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}. Faltan ${diffMin} minutos.`;
            break;
          }
        }

        if (turnoProximo) {
          errorModalMessage.value = mensajeHorario;
          showErrorModal.value = true;
        } else {
          errorModalMessage.value = `Ya no estás en un horario válido para registrar ${tipoRegistro.value}. Verifica tus horarios asignados.`;
          showErrorModal.value = true;
        }
      } else {
        const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const diaActual = diasSemana[getAhoraLocal().getDay()];
        errorModalMessage.value = `No tienes horario asignado para ${diaActual}. El registro de asistencia no está disponible.`;
        showErrorModal.value = true;
      }
      return;
    }

    dialogoActivo.value = true;
    iniciarCaptura();

  } catch (error: any) {
    console.error("Error al cargar el estudiante:", error);
    
    // Manejar errores específicos del servidor
    if (error.response) {
      if (error.response.status === 404) {
        errorModalMessage.value = "No se encontró ningún estudiante con la cédula o pasaporte ingresado.";
      } else if (error.response.status === 403) {
        errorModalMessage.value = "No tienes permisos para acceder a esta información.";
      } else if (error.response.status === 500) {
        errorModalMessage.value = "Error interno del servidor. Intente nuevamente más tarde.";
      } else {
        errorModalMessage.value = error.response.data?.message || "Error del servidor al buscar el estudiante.";
      }
    } else if (error.request) {
      errorModalMessage.value = "Error de conexión. Verifique su conexión a internet e intente nuevamente.";
    } else {
      errorModalMessage.value = error.message || "Error inesperado al cargar los datos del estudiante.";
    }
    
    showErrorModal.value = true;
  } finally {
    cargando.value = false;
  }
};

/* Cargar el registro de asistencia abierto (para determinar si es entrada o salida) */
const cargarRegistroAsistenciaAbierto = async () => {
  if (!cedula.value) return;
  try {
    const hoy = getAhoraLocal().toISOString();
    const url = `${API}/registros/abierto?userXPeriodId=${usuarioXPeriodoId.value}&date=${hoy}&mode=Presencial`;

    const response = await axios.get(url, { withCredentials: true });

    if (response.data) {
      registroAbierto.value = response.data;
      tipoRegistro.value = "salida";
    } else {
      registroAbierto.value = null;
      tipoRegistro.value = "entrada";
    }
  } catch (error: any) {
    console.error("Error al cargar registro abierto:", error);
    
    // En caso de error, asumimos que es entrada
    registroAbierto.value = null;
    tipoRegistro.value = "entrada";
    
    // Solo mostramos error si es crítico
    if (error.response && error.response.status >= 500) {
      errorModalMessage.value = "Error del servidor al verificar registros de asistencia. Contacte al administrador.";
      showErrorModal.value = true;
    }
  }
};

/* Cargar el horario completo asignado al estudiante */
const cargarHorarioCompleto = async () => {
  if (!usuarioXPeriodoId.value) return;
  try {
    const url = `${API}/horarioEstudiantes/completo/usuarioxperiodo/${usuarioXPeriodoId.value}?mode=Presencial`;

    const response = await axios.get(url, { withCredentials: true });

    // Filtrar los horarios activos (Schedule_IsDeleted === 0)
    horarioCompleto.value = response.data.filter((h: any) => h.Schedule_IsDeleted === 0);

    console.log("Horario completo cargado:", horarioCompleto.value);
  } catch (error: any) {
    console.error("Error al cargar el horario completo:", error);
    
    // Si no se puede cargar el horario, es un error crítico
    if (error.response) {
      if (error.response.status === 404) {
        errorModalMessage.value = "No se encontró horario asignado para este estudiante. Contacte al administrador.";
      } else if (error.response.status >= 500) {
        errorModalMessage.value = "Error del servidor al cargar el horario. Intente nuevamente más tarde.";
      } else {
        errorModalMessage.value = "Error al cargar el horario del estudiante.";
      }
    } else {
      errorModalMessage.value = "Error de conexión al cargar el horario. Verifique su conexión a internet.";
    }
    
    showErrorModal.value = true;
  }
};




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
  return diffMinutos > 10; // Si es mayor a 10 minutos, se considera atraso
});



/* GUARDAR ASISTENCIA: Usaremos el endpoint de registros para crear/actualizar asistencia */
const guardarAsistencia = async () => {
  console.log("Scheduled:", scheduledTimeUTC.value?.toLocaleTimeString());
  console.log("Ahora:", getAhoraLocal().toLocaleTimeString());
  console.log("¿Es atraso?:", esAtraso.value);

  if (!scheduledTimeUTC.value) {
    errorModalMessage.value = "No tienes un horario asignado para hoy. No se puede registrar la asistencia.";
    showErrorModal.value = true;
    return;
  }

  try {
    const nowUTC = modoSimulacion ? new Date(fechaSimulada) : new Date();
    const fechaSimuladaSalida = new Date("2025-04-23T17:59:00");

    let payload: any = {
      UserXPeriod_ID: usuarioXPeriodoId.value,
      Attendance_Type: "Presencial",
      Attendance_Comment: null,
      Attendance_Date: nowUTC,
      Attendance_Late: esAtraso.value,
      Attendance_IsDeleted: false,
    };

    if (tipoRegistro.value === "entrada") {
      payload.Attendance_Entry = nowUTC;
    } else if (tipoRegistro.value === "salida") {
      payload.Attendance_Exit = modoSimulacion ? fechaSimuladaSalida : nowUTC;
    }

    if (registroAbierto.value && tipoRegistro.value === "salida") {
      //  Actualizar registro de salida (axios.put)
      const registroId = registroAbierto.value.Attendance_ID;
      if (!registroId) {
        errorModalMessage.value = "No se encontró el registro de entrada para actualizar la salida. Contacte al administrador.";
        showErrorModal.value = true;
        return;
      }

      await axios.put(
        `${API}/registros/${registroId}/salida`,
        payload,
        {
        headers: {
          "internal-id": authStore.user?.id,
        },
        withCredentials: true
      });

      toast.add({
        severity: "success",
        summary: "Salida Registrada",
        detail: "Registro de salida actualizado correctamente.",
        life: 3000,
      });
    } else {
      // 🔵 Crear nuevo registro de entrada (axios.post)
      await axios.post(`${API}/registros`, payload, {
        headers: {
          "internal-id": authStore.user?.id,
        },
        withCredentials: true
      });

      toast.add({
        severity: "success",
        summary: "Entrada Registrada",
        detail: "Registro de entrada creado correctamente.",
        life: 3000,
      });
    }

    setTimeout(() => {
      router.push("/AsignacionHuella");
    }, 3000);

  } catch (error: any) {
    console.error("Error al guardar la asistencia:", error);
    
    // Manejar errores específicos del servidor
    if (error.response) {
      if (error.response.status === 409) {
        errorModalMessage.value = "Ya existe un registro de asistencia para este horario. No se puede duplicar.";
      } else if (error.response.status === 400) {
        errorModalMessage.value = "Datos de asistencia inválidos. Verifique la información e intente nuevamente.";
      } else if (error.response.status === 403) {
        errorModalMessage.value = "No tienes permisos para registrar asistencia.";
      } else if (error.response.status === 500) {
        errorModalMessage.value = "Error interno del servidor al guardar la asistencia. Intente nuevamente más tarde.";
      } else {
        errorModalMessage.value = error.response.data?.message || "Error del servidor al guardar la asistencia.";
      }
    } else if (error.request) {
      errorModalMessage.value = "Error de conexión al guardar la asistencia. Verifique su conexión a internet.";
    } else {
      errorModalMessage.value = error.message || "Error inesperado al guardar la asistencia.";
    }
    
    showErrorModal.value = true;
  }
};


/* FUNCIONES PARA CAPTURA DE HUELLA */
const iniciarCaptura = async () => {
  if (capturando.value) return;
  capturando.value = true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    // ⬇️ SGIFPCapture sigue con fetch (lector local)
    const response = await fetch("/SGIFPCapture", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        Origin: "http://localhost:5173",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        Licstr: "",
        FakeDetection: 1,
        Timeout: 15000,
        TemplateFormat: "ISO",
        ImageWSQRate: 2.25,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error de conexión con el lector de huella: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.ErrorCode !== 0) {
      let errorMessage = "Error desconocido en el lector de huella.";
      switch (data.ErrorCode) {
        case 1:
          errorMessage = "No se detectó ningún dedo en el lector. Intente nuevamente.";
          break;
        case 2:
          errorMessage = "Calidad de huella insuficiente. Limpie el sensor e intente nuevamente.";
          break;
        case 3:
          errorMessage = "Tiempo de espera agotado. Intente nuevamente.";
          break;
        case 4:
          errorMessage = "Error de hardware del lector de huella.";
          break;
        default:
          errorMessage = `Error en el lector de huella (Código: ${data.ErrorCode}).`;
      }
      throw new Error(errorMessage);
    }

    if (!data.TemplateBase64) {
      throw new Error("No se pudo capturar la huella correctamente. Intente nuevamente.");
    }

    huellaBase64.value = data.TemplateBase64;
    huellaCapturada.value = true;

    // ⬇️ SGIMatchScore sigue con fetch (comparación local)
    const params = new URLSearchParams();
    params.append("Template1", huellaGuardada.value);
    params.append("Template2", huellaBase64.value);
    params.append("Licstr", "");
    params.append("TemplateFormat", "ISO");

    console.log("Template1 (BD):", huellaGuardada.value.length);
    console.log("Template2 (capturada):", huellaBase64.value.length);

    const resMatch = await fetch("/SGIMatchScore", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "*/*",
        "Access-Control-Allow-Origin": "*",
      },
      body: params,
    });

    if (!resMatch.ok) {
      throw new Error("Error al comunicarse con el sistema de comparación de huellas.");
    }
    
    const matchData = await resMatch.json();

    if (matchData.ErrorCode !== 0) {
      throw new Error(`Error en la comparación de huellas (Código: ${matchData.ErrorCode}).`);
    }

    if (matchData.MatchingScore < 70) {
      errorModalMessage.value = `La huella no coincide con la registrada en el sistema.\n\nPuntuación de coincidencia: ${matchData.MatchingScore}% (mínimo requerido: 70%)\n\nVerifique que esté usando el dedo correcto e intente nuevamente.`;
      showErrorModal.value = true;
      dialogoActivo.value = false;
      huellaBase64.value = "";
      huellaCapturada.value = false;
      return;
    }

    toast.add({
      severity: "success",
      summary: "Huella Validada",
      detail: `Coincidencia aceptada. Score: ${matchData.MatchingScore}%`,
      life: 3000,
    });

    // ⬇️ Aquí sí usamos axios para actualizar tu backend
    try {
      await axios.put(
      `${API}/usuarios/actualizar-huella`,
      {
        usuarioCedula: cedula.value,
        template: huellaBase64.value,
      },
      {
        headers: {
          "internal-id": authStore.user?.id,
        },
        withCredentials: true
      }
    );
      console.log("Huella actualizada correctamente.");
    } catch (err: any) {
      console.error("Error actualizando la huella en backend:", err);
      // No mostramos error al usuario por este fallo, ya que la validación fue exitosa
    }

    dialogoActivo.value = false;
    await guardarAsistencia();
    
  } catch (error: any) {
    console.error("Error al capturar la huella:", error);
    
    let errorMessage = "Error inesperado al capturar la huella.";
    
    if (error.name === 'AbortError') {
      errorMessage = "La captura de huella fue cancelada por tiempo de espera (15 segundos). Intente nuevamente.";
    } else if (error.message.includes("fetch")) {
      errorMessage = "No se puede conectar con el lector de huella. Verifique que:\n\n• El lector esté conectado correctamente\n• Los drivers estén instalados\n• El servicio del lector esté ejecutándose";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    errorModalMessage.value = errorMessage;
    showErrorModal.value = true;
    dialogoActivo.value = false;
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
</style>
