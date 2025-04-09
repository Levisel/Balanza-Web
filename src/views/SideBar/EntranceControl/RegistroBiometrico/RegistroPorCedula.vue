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
          Estás en el período: {{ periodoActual.periodo.PeriodoNombre }}
        </p>
      </div>

      <!-- Horario programado -->
      <div class="mt-6 text-center">
        <p class="text-lg">
          Hora programada: <strong>{{ scheduledTimeString }}</strong>
        </p>
        <p class="text-sm text-gray-600">(Pruebas sin restricción de tiempo)</p>
      </div>

      <!-- Si ya existe registro de entrada, mostrar la hora convertida a local -->
      <div v-if="tipoRegistro === 'salida' && registroEntradaLocal" class="mt-4 text-center">
        <p class="text-lg text-blue-600">
          Ya ingresaste a las: {{ registroEntradaLocal }}
        </p>
      </div>

      <!-- Botón de Cancelar (la captura se inicia automáticamente) -->
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
      header="Capturar Huella"
      :modal="true"
      :closable="false"
      style="width: 30rem"
    >
      <div class="flex flex-col items-center">
        <p class="mb-4 text-center">
          Por favor, coloca tu dedo en el lector para capturar la huella.
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
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import Message from "primevue/message";
import Toast from "primevue/toast";
import Dialog from "primevue/dialog";
import ProgressSpinner from "primevue/progressspinner";
import { useToast } from "primevue/usetoast";
import { API, type Usuario } from "@/ApiRoute";
import { useDarkMode } from "@/components/ThemeSwitcher";

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { isDarkTheme } = useDarkMode();

// Variables para búsqueda y carga de estudiante
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
const registroAbierto = ref(null);
const tipoRegistro = ref("entrada"); // "entrada" o "salida"

// Identificador de UsuarioXPeriodo y período actual
const usuarioXPeriodoId = ref("");
const periodoActual = ref(null);

// Estados UI
const cargando = ref(false);
const dialogoActivo = ref(false);
const capturando = ref(false);

// Horario programado (para pruebas)
const scheduledTime = ref(new Date("2025-03-24T21:03:00"));
const scheduledTimeString = computed(() =>
  scheduledTime.value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
);

// Mostrar hora de entrada (convertida a local)
const registroEntradaLocal = computed(() => {
  if (registroAbierto.value && registroAbierto.value.Registro_Entrada) {
    return new Date(registroAbierto.value.Registro_Entrada).toLocaleString("es-EC", {
      timeZone: "America/Guayaquil",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }
  return "";
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

// Función para buscar y cargar datos del estudiante y sus períodos
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
    const hoy = new Date();
    periodoActual.value = periodosData.find((p: any) => {
      const inicio = new Date(p.periodo.Periodo_Inicio);
      const fin = new Date(p.periodo.Periodo_Fin);
      return hoy >= inicio && hoy <= fin;
    });
    if (!periodoActual.value) {
      throw new Error("No se encontró un período activo para el estudiante");
    }
    usuarioXPeriodoId.value = periodoActual.value.UsuarioXPeriodo_ID;
    console.log("Periodo actual:", periodoActual.value);
    console.log("usuarioXPeriodoId:", usuarioXPeriodoId.value);
    await cargarRegistroAsistenciaAbierto();
    estudianteCargado.value = true;
    // Abrir automáticamente el modal para captura de huella e iniciar captura
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

// Función para cargar el registro de asistencia abierto para hoy
const cargarRegistroAsistenciaAbierto = async () => {
  if (!cedula.value) return;
  try {
    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split("T")[0];
    const response = await fetch(`${API}/registros/abierto?usuarioxPeriodoId=${usuarioXPeriodoId.value}&fecha=${hoy.toISOString()}`);
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

// Función para iniciar la captura de huella (se invoca automáticamente al buscar estudiante)
const iniciarCaptura = async () => {
  if (capturando.value) {
    console.log("Captura ya en proceso.");
    return;
  }
  capturando.value = true;
  try {
    // Se asume que el servicio de captura se encuentra en /SGIFPCapture
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
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
    if (!response.ok) throw new Error(`Respuesta HTTP inválida: ${response.status}`);
    const data = await response.json();
    if (data.ErrorCode === 0 && data.TemplateBase64) {
      huellaBase64.value = data.TemplateBase64;
      huellaCapturada.value = true;
      toast.add({
        severity: "success",
        summary: "Huella Capturada",
        detail: "La huella digital fue escaneada correctamente.",
        life: 3000,
      });
      dialogoActivo.value = false;
      // Guardar la asistencia automáticamente
      await guardarHuella();
    } else {
      throw new Error(`Error en la captura. Código: ${data.ErrorCode}`);
    }
  } catch (error: any) {
    console.error("Error al capturar la huella:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo capturar la huella. Verifica la conexión con el lector.",
      life: 5000,
    });
  } finally {
    capturando.value = false;
  }
};

// Cancelar la captura
const cancelarCaptura = () => {
  dialogoActivo.value = false;
  capturando.value = false;
};

// Función para guardar la asistencia (POST para entrada, PUT para salida)
// Si hay registro abierto, se actualiza la salida mediante PUT; de lo contrario, se crea un registro (entrada).
const guardarHuella = async () => {
  if (!huellaBase64.value || !cedula.value) {
    toast.add({
      severity: "warn",
      summary: "Falta Información",
      detail: "Captura la huella antes de guardarla.",
      life: 3000,
    });
    return;
  }
  if (!huellaGuardada.value) {
    toast.add({
      severity: "info",
      summary: "Sin huella previa",
      detail: "No existe huella almacenada para comparar, se procede a guardar la nueva.",
      life: 3000,
    });
    return;
  }
  try {
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
        Accept: "*/*",
      },
      body: params,
    });
    if (!resMatch.ok) throw new Error("Error en la comparación de huellas.");
    const matchData = await resMatch.json();
    if (matchData.ErrorCode === 0) {
      const score = matchData.MatchingScore;
      const umbral = 70;
      if (score < umbral) {
        console.log("Huella no coincide, score:", score);
        toast.add({
          severity: "error",
          summary: "Huella no coincide",
          detail: `La huella no coincide (score: ${score}/200). Intente de nuevo.`,
          life: 3000,
        });
        huellaCapturada.value = false;
        huellaBase64.value = "";
        return;
      } else {
        toast.add({
          severity: "success",
          summary: "Huella válida",
          detail: `Coincidencia con score = ${score}. Se procede a guardar la asistencia.`,
          life: 3000,
        });
        console.log("Huella válida, score:", score);

        if (registroAbierto.value) {
          // Actualizar registro de salida (PUT) usando el endpoint especializado
          const registroId = registroAbierto.value.Registro_ID;
          if (!registroId) {
            toast.add({
              severity: "error",
              summary: "Error",
              detail: "No se encontró el registro de entrada para actualizar la salida.",
              life: 5000,
            });
            return;
          }
          // Simular la hora de salida (en producción, se usaría la hora actual)
          const salidaSimulada = new Date(new Date("2025-03-24T17:03:00"));
          const response = await fetch(`${API}/registros/${registroId}/salida`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Registro_Salida: salidaSimulada })
          });
          if (!response.ok) throw new Error("No se pudo actualizar el registro de asistencia.");
          console.log("Registro de salida actualizado correctamente.");
        } else {
          // Crear un registro nuevo (entrada)
          const registroData = {
            UsuarioXPeriodo_ID: usuarioXPeriodoId.value,
            Registro_Entrada: new Date(new Date("2025-03-24T13:03:00")),
            Registro_Salida: null,
            Registro_Tipo: "Presencial",
            Registro_Observaciones: null,
            Registro_fecha: new Date(),
            Registro_IsDeleted: false
          };
          const response = await fetch(`${API}/registros`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registroData)
          });
          if (!response.ok) throw new Error("No se pudo crear el registro de asistencia.");
          console.log("Registro de entrada creado correctamente.");
        }
        // Redirigir después de 3 segundos
        setTimeout(() => {
          router.push("/AsignacionHuella");
        }, 3000);
      }
    } else {
      toast.add({
        severity: "error",
        summary: "Error de comparación",
        detail: `Error comparando las huellas (ErrorCode: ${matchData.ErrorCode}).`,
        life: 5000,
      });
    }
  } catch (error) {
    console.error("Error al guardar la huella:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo procesar la huella. Verifica la conexión con el lector.",
      life: 5000,
    });
  }
};

// Función para volver a la vista de AsignacionHuella
const volver = () => {
  router.push("/AsignacionHuella");
};
</script>

<style scoped>
/* Ajusta estilos a tu preferencia */
</style>
