<template>
    <main class="flex flex-col items-center p-8 min-h-screen">
      <!-- Encabezado -->
      <div class="w-full flex items-center justify-between mb-8">
        <Button
          icon="pi pi-arrow-left"
          class="p-button-text text-blue-600 hover:text-blue-800"
          @click="volver"
          tooltip="Volver al inicio"
          tooltipOptions="{ position: 'top' }"
        />
        <h1 class="text-3xl font-bold text-center flex-grow">
          Registro de Asistencia Virtual
        </h1>
        <div class="w-10"></div>
      </div>
  
      <Toast />
  
      <!-- Modal de error -->
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
  
      <!-- Información del estudiante y horario virtual -->
      <div v-if="estudianteCargado" :class="['w-full max-w-3xl p-6 rounded-lg shadow-lg', cardClass]">
        <h2 class="text-xl font-semibold text-center mb-6">Detalles del Estudiante (Virtual)</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block font-medium mb-1">ID</label>
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
            <label class="block font-medium mb-1">Correo</label>
            <p class="p-3 rounded-lg border" :class="inputClass">{{ correo }}</p>
          </div>
          <div>
            <label class="block font-medium mb-1">Área</label>
            <p class="p-3 rounded-lg border" :class="inputClass">{{ area || "N/A" }}</p>
          </div>
        </div>
  
        <!-- Período activo -->
        <div v-if="periodoActual" class="mt-4 text-center">
          <p class="text-lg text-green-600">
            Estás en el período: {{ periodoActual.period.Period_Name }}
          </p>
        </div>
  
        <!-- Horario virtual programado -->
        <div class="mt-6 text-center" v-if="scheduledTimeVirtual">
          <p class="text-lg">
            Hora programada para hoy: <strong>{{ scheduledTimeString }}</strong>
          </p>
          <p class="text-sm text-gray-600">(Ventana de {{ ventanaTexto }})</p>
        </div>
        <div v-else class="mt-6 text-center text-red-600">
          <p>No tienes un horario virtual asignado para hoy ({{ currentDayMessage }}).</p>
        </div>
  
        <!-- Registro virtual completo (si ya existe) -->
        <div v-if="registroVirtualCompleto" class="mt-4 text-center">
          <p class="text-lg text-blue-600">
            Ya registraste tu asistencia virtual el día de hoy.
            <br />
            Entrada: {{ formatTime(registroVirtualCompleto.Attendance_Entry) }}
            <br />
            Salida: {{ formatTime(registroVirtualCompleto.Attendance_Exit) }}
          </p>
        </div>
  
        <!-- Botón para registrar asistencia virtual (sólo si hay horario y aún no se completó el registro) -->
        <div v-else-if="scheduledTimeVirtual" class="mt-6 text-center">
          <p v-if="tipoRegistro === 'entrada'" class="text-gray-700">
            Aún no has registrado tu asistencia virtual.
          </p>
          <p v-else-if="tipoRegistro === 'salida'" class="text-blue-600">
            Tienes un registro abierto (Entrada a las {{ formatTime(registroAbierto.Attendance_Entry) }}). Falta registrar la Salida Virtual.
          </p>
          <Button
            :label="tipoRegistro === 'entrada' ? 'Registrar Entrada Virtual' : 'Registrar Salida Virtual'"
            class="p-button-success mt-4"
            @click="confirmarRegistro"
          />
        </div>
  
        <!-- Botón de Cancelar -->
        <div class="flex flex-col items-center mt-8">
          <Button
            label="Cancelar"
            severity="danger"
            class="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white mt-2"
            @click="volver"
          />
        </div>
      </div>
  
      <!-- Modal de confirmación para el registro virtual -->
      <Dialog
        v-model:visible="dialogoConfirmacion"
        header="Confirmar Registro Virtual"
        :modal="true"
        :closable="false"
        style="width: 30rem"
      >
        <div class="flex flex-col items-center">
          <p class="mb-4 text-center">
            ¿Estás seguro de que deseas registrar
            <strong>{{ tipoRegistro === 'entrada' ? 'la Entrada Virtual' : 'la Salida Virtual' }}</strong>?
          </p>
          <div class="flex gap-4 mt-4">
            <Button label="Cancelar" class="p-button-danger" @click="dialogoConfirmacion = false" />
            <Button label="Confirmar" class="p-button-success" @click="guardarAsistenciaVirtual" />
          </div>
        </div>
      </Dialog>
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

  const modoSimulacion = true;
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
  const schedule = horarioVirtualData.value.find((h: any) => h.Schedule_IsDeleted === false || h.Schedule_IsDeleted === 0);
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
  const dayLabel = dayLabels[todayKey] || todayKey;
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
    isDarkTheme.value ? "bg-gray-800 text-white shadow-lg" : "bg-white text-gray-900 shadow-lg"
  );
  const inputClass = computed(() =>
    isDarkTheme.value ? "bg-gray-900 text-white border-gray-700" : "bg-white text-gray-900 border-gray-300"
  );
  
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
    const res = await fetch(`${API}/usuarioXPeriodo/usuario/${cedula.value}`);
    const data = await res.json();

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

    // Guardar periodo activo
    periodoActual.value = periodoAct;
    usuarioXPeriodoId.value = periodoAct.UserXPeriod_ID;

    // Cargar horario virtual asignado
    const horarioRes = await fetch(`${API}/horarioEstudiantes/completo/usuarioxperiodo/${usuarioXPeriodoId.value}?mode=Virtual`);
    horarioVirtualData.value = horarioRes.ok ? await horarioRes.json() : [];

    // Verificar registros de asistencia del día
    const today = getAhoraLocal().toISOString().split("T")[0];


    // Registro completo (entrada y salida)
    const regCompletoRes = await fetch(`${API}/registros/virtual/completo?userXPeriodId=${usuarioXPeriodoId.value}&date=${today}`);
    if (regCompletoRes.ok) {
      registroVirtualCompleto.value = await regCompletoRes.json();
    } else {
      // Si no hay completo, busca abierto (solo entrada)
      const regAbiertoRes = await fetch(`${API}/registros/abierto?userXPeriodId=${usuarioXPeriodoId.value}&date=${today}&mode=Virtual`);
      if (regAbiertoRes.ok) {
        registroAbierto.value = await regAbiertoRes.json();
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
      // ✅ Validación de rango para entrada
      if (!dentroDeRango.value) {
        toast.add({
          severity: "warn",
          summary: "Fuera de Rango",
          detail: `Debes registrar la entrada dentro de los ${MINUTOS_ANTES} minutos antes o ${MINUTOS_DESPUES} después de la hora programada.`,
          life: 4000,
        });
        return;
      }

      const payloadEntrada: any = {
        UserXPeriod_ID: usuarioXPeriodoId.value,
        Attendance_Type: "Virtual",
        Attendance_Date: now,
        Attendance_Entry: now,
        Attendance_Late: esAtraso.value,
        Attendance_IsDeleted: false,
      };

      const res = await fetch(`${API}/registros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadEntrada),
      });

      if (!res.ok) throw new Error("No se pudo crear el registro de asistencia virtual (entrada).");

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

      // ✅ Validación de rango para salida
      if (!dentroDeRangoSalida.value) {
        toast.add({
          severity: "warn",
          summary: "Fuera de Rango",
          detail: `Debes registrar la salida dentro de los ${MINUTOS_ANTES} minutos antes o ${MINUTOS_DESPUES} después de la hora programada.`,
          life: 4000,
        });
        return;
      }

      const payloadSalida: any = {
        UserXPeriod_ID: usuarioXPeriodoId.value,
        Attendance_Type: "Virtual",
        Attendance_Date: now,
        Attendance_Exit: now,
        Attendance_IsDeleted: false,
      };

      const registroId = registroAbierto.value.Attendance_ID;

      const res = await fetch(`${API}/registros/${registroId}/salida`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadSalida),
      });

      if (!res.ok) throw new Error("No se pudo actualizar el registro de asistencia virtual (salida).");

      toast.add({
        severity: "success",
        summary: "Salida Registrada",
        detail: "Registro de salida virtual actualizado correctamente.",
        life: 3000,
      });

      registroVirtualCompleto.value = await res.json();
    }

    dialogoConfirmacion.value = false;
    await cargarDatosEstudiante();

  } catch (error: any) {
    console.error("Error al guardar la asistencia virtual:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message || "No se pudo guardar la asistencia virtual.",
      life: 5000,
    });
  }
}


  
  // Función para abrir el diálogo de confirmación
  function confirmarRegistro() {
  // Validación previa al abrir el modal
  if (
    (tipoRegistro.value === "entrada" && !dentroDeRango.value) ||
    (tipoRegistro.value === "salida" && !dentroDeRangoSalida.value)
  ) {
    toast.add({
      severity: "warn",
      summary: "Fuera de Rango",
      detail: `Debes registrar la ${tipoRegistro.value} dentro de los ${MINUTOS_ANTES} minutos antes o ${MINUTOS_DESPUES} después de la hora programada.`,
      life: 4000,
    });
    return;
  }

  // Solo si está en rango se muestra el modal
  dialogoConfirmacion.value = true;
}

  
  // Función de navegación
  function volver() {
    router.push("/");
  }
  </script>
  
  <style scoped>
  /* Personaliza tus estilos aquí */
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
  