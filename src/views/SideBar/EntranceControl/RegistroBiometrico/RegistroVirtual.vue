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
        Registro de Asistencia Virtual
      </h1>
      <div class="w-10"></div>
    </div>

    <Toast />

    <!-- Modal de confirmación -->
    <Dialog
      v-model:visible="dialogoConfirmacion"
      header="Confirmar Registro"
      modal
      :closable="false"
      :style="{ width: '30rem' }"
      :class="isDarkTheme ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'"
    >
      <div class="p-4 text-center text-base">
        ¿Deseas registrar
        <span class="font-semibold">{{ tipoRegistro === 'entrada' ? 'la Entrada' : 'la Salida' }}</span>
        virtual?
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 px-4 pb-4">
          <Button label="Cancelar" class="p-button-danger text-sm px-4 py-2" @click="dialogoConfirmacion = false" />
          <Button label="Confirmar" class="p-button-success text-sm px-4 py-2" @click="guardarAsistenciaVirtual" />
        </div>
      </template>
    </Dialog>

    <!-- Modal de error -->
    <Dialog
      v-model:visible="showErrorModal"
      header="Error"
      modal
      :closable="true"
      :style="{ width: '30rem' }"
      :class="isDarkTheme ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'"
    >
      <p class="text-center text-base">{{ errorModalMessage }}</p>
      <template #footer>
        <div class="flex justify-center p-3">
          <Button label="Cerrar" class="text-sm px-4 py-2" @click="showErrorModal = false" />
        </div>
      </template>
    </Dialog>

    <!-- Datos del estudiante -->
    <div
      v-if="estudianteCargado"
      :class="[cardClass, 'rounded-2xl shadow-md p-6 w-full mx-auto']"
    >
      <h2 class="text-lg font-semibold text-center mb-4">Datos del Estudiante</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
        <p><strong>Cédula:</strong> {{ cedula }}</p>
        <p><strong>Nombres:</strong> {{ nombres }}</p>
        <p><strong>Apellidos:</strong> {{ apellidos }}</p>
        <p><strong>Correo:</strong> {{ correo }}</p>
        <p><strong>Área:</strong> {{ area || "N/A" }}</p>
        <p v-if="periodoActual"><strong>Período:</strong> {{ periodoActual.period.Period_Name }}</p>
      </div>
    </div>

<!-- Registro de asistencia -->
<div
  v-if="estudianteCargado"
  :class="[cardClass, 'rounded-2xl shadow-md p-6 w-full max-w-xl mx-auto']"
>
  <h2 class="text-xl font-bold text-center mb-6">
    Registro de Asistencia
  </h2>

  <!-- Entrada registrada, falta salida -->
  <div v-if="registroAbierto" class="space-y-8">

    <!-- Información alineada horizontalmente -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
      <div class="flex flex-col items-center">
        <span class="text-gray-400 text-base">Hora Programada</span>
        <span class="text-lg font-semibold">{{ scheduledTimeString }}</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-gray-400 text-base">Entrada registrada</span>
        <span class="text-lg text-blue-400 font-semibold">
          {{ formatTime(registroAbierto.Attendance_Entry) }}
        </span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-gray-400 text-base">Falta</span>
        <span class="text-lg text-red-400 font-semibold">Salida</span>
      </div>
    </div>

    <!-- Botones centrados y amplios -->
    <div class="flex flex-col items-center gap-4">
      <Button
        label="Registrar Salida"
        class="p-button-success text-base px-6 py-3"
        @click="confirmarRegistro"
      />
      <Button
        label="Cancelar"
        class="p-button-danger text-base px-6 py-3"
        @click="volver"
      />
    </div>
  </div>

  <!-- Sin horario asignado -->
  <div v-else class="text-center text-red-500 text-base mt-6">
    No tienes horario virtual asignado hoy ({{ currentDayMessage }}).
  </div>
</div>



  </main>
</template>






  
  <script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import Button from "primevue/button";
  import Dialog from "primevue/dialog";
  import Toast from "primevue/toast";
  import { useToast } from "primevue/usetoast";
  import { API } from "@/ApiRoute";
  import { useAuthStore } from "@/stores/auth";
  import { useDarkMode } from "@/components/ThemeSwitcher";
  import { nextTick } from 'vue'
  import axios from 'axios'; // Asegúrate que esté importado arriba

  const router = useRouter();
  const toast = useToast();
  const { isDarkTheme } = useDarkMode();
  const authStore = useAuthStore();
  
  // VARIABLES DE DATOS DEL ESTUDIANTE Y PERÍODO (se cargan desde el auth store)
  const estudianteCargado = ref(false);
  const cedula = ref("");
  const nombres = ref("");
  const apellidos = ref("");
  const correo = ref("");
  const area = ref("");
  const usuarioXPeriodoId = ref("");
  const periodoActual = ref<any>(null);

  const modoSimulacion = false;
  const fechaSimulada = new Date("2025-04-22T13:09:00");

  // Constantes de ventana de validación (editable fácilmente)
const MINUTOS_ANTES = 10;
const MINUTOS_DESPUES = 10;
const ventanaTexto = `${MINUTOS_ANTES} minutos antes y ${MINUTOS_DESPUES} después`;



// Computed para validar si estamos dentro del rango permitido
const dentroDeRango = computed(() => {
  if (!scheduledTimeVirtual.value) return false;
  const ahora = getAhoraLocal();
  const inicio = new Date(scheduledTimeVirtual.value.getTime() - MINUTOS_ANTES * 60000);
  const fin = new Date(scheduledTimeVirtual.value.getTime() + MINUTOS_DESPUES * 60000);
  return ahora >= inicio && ahora <= fin;
});

const dentroDeRangoSalida = computed(() => {
  if (!scheduledTimeVirtual.value || tipoRegistro.value !== "salida") return false;
  const ahora = getAhoraLocal();
  const inicio = new Date(scheduledTimeVirtual.value.getTime() - MINUTOS_ANTES * 60000);
  const fin = new Date(scheduledTimeVirtual.value.getTime() + MINUTOS_DESPUES * 60000);
  return ahora >= inicio && ahora <= fin;
});





  function getAhoraLocal(): Date {
    return modoSimulacion ? new Date(fechaSimulada) : new Date();
  }

  
  // VARIABLES PARA HORARIO VIRTUAL Y REGISTRO VIRTUAL
  const horarioVirtualData = ref<any[]>([]);
  const registroVirtualCompleto = ref<any>(null); // Registro completo (entrada y salida) virtual ya existente, si lo hay
  const registroAbierto = ref<any>(null); // Registro abierto (sin salida) virtual, si existe
  const tipoRegistro = ref("entrada"); // "entrada" si no hay registro abierto; "salida" si ya se registró la entrada
  


  // CÁLCULO DEL HORARIO VIRTUAL PROGRAMADO
  const scheduledTimeVirtual = computed(() => {
  if (!horarioVirtualData.value || horarioVirtualData.value.length === 0) return null;

  const dayKeys = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = getAhoraLocal();
  const todayKey = dayKeys[now.getDay()];

  if (todayKey === "Sunday" || todayKey === "Saturday") return null; // No asistencia sábado/domingo

  // Buscar el primer horario válido
  const schedule = horarioVirtualData.value.find((h: any) => {
  const campo = tipoRegistro.value === 'entrada'
    ? `${todayKey}_Start`
    : `${todayKey}_End`;
  return (h.Schedule_IsDeleted === false || h.Schedule_IsDeleted === 0) && h[campo];
});

  if (!schedule) return null;

  let timeString = "";

  if (tipoRegistro.value === "entrada") {
    timeString = schedule[`${todayKey}_Start`]; // ejemplo: Monday_Start
  } else {
    timeString = schedule[`${todayKey}_End`];   // ejemplo: Monday_End
  }

  if (!timeString) return null;

  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds || 0);
});

  
  const scheduledTimeString = computed(() => {
    if (!scheduledTimeVirtual.value) return "No asignado";
    return scheduledTimeVirtual.value.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
  });
  
  // Si no existe horario virtual asignado, mostrar mensaje con el día y hora actual en EC
const currentDayMessage = computed(() => {
  const dayKeys = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayLabels = {
    Sunday: "Domingo",
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
  };

  const now = getAhoraLocal();
  const todayKey = dayKeys[now.getDay()];
  const dayLabel = dayLabels[todayKey as keyof typeof dayLabels] || todayKey;
  const currentTime = now.toLocaleTimeString("es-EC", { timeZone: "America/Guayaquil", hour: "2-digit", minute: "2-digit" });

  return `${dayLabel} a las ${currentTime}`;
});

  
  // Determinar si es atraso (para registro de entrada)
  const esAtraso = computed(() => {
    if (!scheduledTimeVirtual.value || tipoRegistro.value !== "entrada") return false;
    const now = getAhoraLocal();
    const diffMinutes = (now.getTime() - scheduledTimeVirtual.value.getTime()) / 60000;
    return diffMinutes > 30;
  });
  
  // VARIABLES PARA UI y DIALOGOS
  const dialogoConfirmacion = ref(false);
  const cargando = ref(true);
  const showErrorModal = ref(false);
  const errorModalMessage = ref("");
  
  // CLASES PARA DARK MODE
const cardClass = computed(() =>
  isDarkTheme.value ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'
)

const inputClass = computed(() =>
  isDarkTheme.value ? 'bg-[#121212] text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
)

  
  // HELPER PARA FORMATEAR HORAS
  function formatTime(fechaStr: string | null): string {
    if (!fechaStr) return "";
    return new Date(fechaStr).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
  }
  
  // Función para cargar los datos del estudiante desde el auth store
async function cargarDatosEstudiante() {
  const user = authStore.user;

  if (!user) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se encontró información del usuario autenticado",
      life: 3000,
    });
    return;
  }

  // Asignar datos básicos
  cedula.value = user.id;
  const nombresArr = user.name ? user.name.split(" ") : [];
  nombres.value = nombresArr[0] || "";
  apellidos.value = nombresArr.slice(1).join(" ") || "";
  correo.value = user.email;
  area.value = user.area || "";

  try {
    // Obtener usuarioXPeriodo
    const res = await axios.get(`${API}/usuarioXPeriodo/usuario/${cedula.value}`, {
      withCredentials: true,
    });
    const data = res.data;

    const hoy = getAhoraLocal();
    const periodoAct = data.find((p: any) => {
      const inicio = new Date(p.period.Period_Start);
      const fin = new Date(p.period.Period_End);
      return hoy >= inicio && hoy <= fin;
    });

    if (!periodoAct) {
      toast.add({
        severity: "warn",
        summary: "Sin período activo",
        detail: "No se encontró un período actual para el estudiante.",
        life: 3000,
      });
      return;
    }

    periodoActual.value = periodoAct;
    usuarioXPeriodoId.value = periodoAct.UserXPeriod_ID;

    // Cargar horario virtual asignado
    const horarioRes = await axios.get(`${API}/horarioEstudiantes/completo/usuarioxperiodo/${usuarioXPeriodoId.value}?mode=Virtual`, {
      withCredentials: true,
    });
    horarioVirtualData.value = horarioRes.data || [];

    // Verificar registros de asistencia del día
    const today = getAhoraLocal().toISOString().split("T")[0];

    // Registro completo (entrada y salida)
    const regCompletoRes = await axios.get(`${API}/registros/virtual/completo?userXPeriodId=${usuarioXPeriodoId.value}&date=${today}`, {
      withCredentials: true,
    }).catch(() => null);

    if (regCompletoRes && regCompletoRes.data) {
      registroVirtualCompleto.value = regCompletoRes.data;
    } else {
      // Si no hay completo, busca abierto
      const regAbiertoRes = await axios.get(`${API}/registros/abierto?userXPeriodId=${usuarioXPeriodoId.value}&date=${today}&mode=Virtual`, {
        withCredentials: true,
      }).catch(() => null);

      if (regAbiertoRes && regAbiertoRes.data) {
        registroAbierto.value = regAbiertoRes.data;
        tipoRegistro.value = "salida";
      } else {
        tipoRegistro.value = "entrada";
      }
    }

  } catch (err) {
    console.error("Error al cargar datos del estudiante:", err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo cargar correctamente los datos del estudiante.",
      life: 4000,
    });
  }

  estudianteCargado.value = true;
  cargando.value = false;
}


  
  // Al montar la vista, cargar los datos del estudiante
  onMounted(() => {
    cargarDatosEstudiante();
  });
  
  // Función para guardar la asistencia virtual
// Función para guardar la asistencia virtual (actualizada con validación)
async function guardarAsistenciaVirtual() {
  const now = getAhoraLocal();

  try {
    if (tipoRegistro.value === "entrada") {
      if (!dentroDeRango.value) {
        toast.add({
          severity: "warn",
          summary: "Fuera de Rango",
          detail: `Debes registrar la entrada dentro de los ${MINUTOS_ANTES} minutos antes o ${MINUTOS_DESPUES} después de la hora programada.`,
          life: 4000,
        });
        return;
      }

      const payloadEntrada = {
        UserXPeriod_ID: usuarioXPeriodoId.value,
        Attendance_Type: "Virtual",
        Attendance_Date: now,
        Attendance_Entry: now,
        Attendance_Late: esAtraso.value,
        Attendance_IsDeleted: false,
      };

      await axios.post(`${API}/registros`, payloadEntrada, {
        withCredentials: true,
      });

      toast.add({
        severity: "success",
        summary: "Entrada Registrada",
        detail: "Registro de entrada virtual creado correctamente.",
        life: 3000,
      });

      await nextTick();
      tipoRegistro.value = "salida";

    } else if (tipoRegistro.value === "salida") {
      if (!registroAbierto.value) {
        toast.add({
          severity: "warn",
          summary: "Atención",
          detail: "No tienes registro abierto para marcar salida.",
          life: 3000,
        });
        return;
      }

      if (!dentroDeRangoSalida.value) {
        toast.add({
          severity: "warn",
          summary: "Fuera de Rango",
          detail: `Debes registrar la salida dentro de los ${MINUTOS_ANTES} minutos antes o ${MINUTOS_DESPUES} después de la hora programada.`,
          life: 4000,
        });
        return;
      }

      const payloadSalida = {
        UserXPeriod_ID: usuarioXPeriodoId.value,
        Attendance_Type: "Virtual",
        Attendance_Date: now,
        Attendance_Exit: now,
        Attendance_IsDeleted: false,
      };

      const registroId = registroAbierto.value.Attendance_ID;

      await axios.put(`${API}/registros/${registroId}/salida`, payloadSalida, {
        withCredentials: true,
      });

      toast.add({
        severity: "success",
        summary: "Salida Registrada",
        detail: "Registro de salida virtual actualizado correctamente.",
        life: 3000,
      });

      registroVirtualCompleto.value = payloadSalida;
    }

    dialogoConfirmacion.value = false;
    await cargarDatosEstudiante();

  } catch (error: any) {
    console.error("Error al guardar la asistencia virtual:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.message || error.message || "No se pudo guardar la asistencia virtual.",
      life: 5000,
    });
  }
}


function estaDentroDeVentana(fechaReferencia: Date): boolean {
  const ahora = new Date();
  const inicio = new Date(fechaReferencia.getTime() - MINUTOS_ANTES * 60000);
  const fin = new Date(fechaReferencia.getTime() + MINUTOS_DESPUES * 60000);
  return ahora >= inicio && ahora <= fin;
}


  
  // Función para abrir el diálogo de confirmación
function confirmarRegistro() {
  const scheduled = scheduledTimeVirtual.value;

  if (!scheduled) {
    toast.add({
      severity: "warn",
      summary: "Sin horario",
      detail: "No tienes un horario virtual asignado para hoy.",
      life: 4000,
    });
    return;
  }

  if (!estaDentroDeVentana(scheduled)) {
    toast.add({
      severity: "warn",
      summary: "Fuera de Rango",
      detail: `Debes registrar la ${tipoRegistro.value} dentro de los ${MINUTOS_ANTES} minutos antes o ${MINUTOS_DESPUES} después de la hora programada.`,
      life: 4000,
    });
    return;
  }

  dialogoConfirmacion.value = true;
}


  
  // Función de navegación
  function volver() {
    router.push("/");
  }
  </script>
  
  <style scoped>
  </style>
  
  <!-- Filtro opcional para formatear horas -->
  <script lang="ts">
  export default {
    filters: {
      horaLocal(value: string) {
        if (!value) return "";
        const d = new Date(value);
        return d.toLocaleTimeString("es-EC", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
      }
    }
  }
  </script>
  