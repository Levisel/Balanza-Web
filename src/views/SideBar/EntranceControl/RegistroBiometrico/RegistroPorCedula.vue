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
      <h1 class="text-3xl font-bold text-center flex-grow">Registro de Asistencia Automático</h1>
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

    <!-- Si se cargaron los datos del estudiante, se muestran -->
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

      <!-- Mostrar información del período actual -->
      <div v-if="periodoActual" class="mt-4 text-center">
        <p class="text-lg text-green-600">
          Estás en el período: {{ periodoActual.periodo.PeriodoNombre }}
        </p>
      </div>

      <!-- Intervalo de tiempo (para pruebas, siempre se permite) -->
      <div class="mt-6 text-center">
        <p class="text-lg">
          Hora programada: <strong>{{ scheduledTimeString }}</strong>
        </p>
        <p class="text-sm text-gray-600">
          (Pruebas sin restricción de tiempo)
        </p>
      </div>

      <!-- Si ya existe registro de entrada, mostrar la hora de entrada convertida a local -->
      <div v-if="tipoRegistro === 'salida' && registroEntradaLocal" class="mt-4 text-center">
        <p class="text-lg text-blue-600">
          Ya ingresaste a las: {{ registroEntradaLocal }}
        </p>
      </div>

      <!-- Sección de botones para huella -->
      <div class="flex flex-col items-center mt-8 gap-5">
        <div class="flex flex-col items-center">
          <Button
            v-if="!huellaCapturada"
            :label="tipoRegistro === 'entrada' ? 'Capturar Huella (Registrar Entrada)' : 'Capturar Huella (Registrar Salida)'"
            class="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white"
            @click="iniciarCaptura"
          />
          <div v-if="huellaCapturada" class="flex flex-col items-center mt-1 mb-3">
            <Message severity="success" class="mb-4">
              Huella capturada correctamente.
            </Message>
            <Button
              label="Guardar Huella"
              icon="pi pi-check"
              class="mt-4 p-button-success"
              @click="guardarHuella"
            />
          </div>
          <Button
            label="Cancelar"
            severity="danger"
            class="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white mt-2"
            @click="volver"
          />
        </div>
      </div>
    </div>

    <!-- Modal para Captura de Huella -->
    <Dialog
      v-model:visible="dialogoActivo"
      header="Capturar Huella"
      :modal="true"
      :closable="false"
      style="width: 30rem"
    >
      <div class="flex flex-col items-center">
        <p class="mb-4 text-center">
          Coloca tu dedo en el lector y espera a que se capture la huella.
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

// Variable para ingresar la cédula manualmente
const cedulaInput = ref("");
// Modal de error si no se encuentra el estudiante
const showErrorModal = ref(false);
const errorModalMessage = ref("");

// Indicador para saber si ya se cargaron los datos del estudiante
const estudianteCargado = ref(false);

// Variables del estudiante
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
const tipoRegistro = ref("entrada"); // 'entrada' o 'salida'

// Variable para usuarioXPeriodoId (se obtiene de /usuarioXPeriodo/usuario/:cedula)
const usuarioXPeriodoId = ref("");

// Variable para almacenar el período actual (filtrado entre Periodo_Inicio y Periodo_Fin)
const periodoActual = ref(null);

// Estados UI
const errorMensaje = ref("");
const cargando = ref(false);
const dialogoActivo = ref(false);
const capturando = ref(false);

// Horario programado (para pruebas, quemado)
const scheduledTime = ref(new Date("2025-03-24T21:03:00"));
const scheduledTimeString = computed(() =>
  scheduledTime.value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
);

// Propiedad computada para mostrar la hora de entrada (convertida a local Ecuador)
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

// Clases dinámicas para dark mode
const cardClass = computed(() =>
  isDarkTheme.value ? "bg-gray-800 text-white shadow-lg" : "bg-white text-gray-900 shadow-lg"
);
const inputClass = computed(() =>
  isDarkTheme.value
    ? "bg-gray-900 text-white border-gray-700"
    : "bg-white text-gray-900 border-gray-300"
);

// Función para buscar y cargar los datos del estudiante y sus períodos
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
    const response = await fetch(`${API}/usuariointerno/${cedulaInput.value}`);
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
    // Consultar los períodos del estudiante (ruta: /usuarioXPeriodo/usuario/:usuarioCedula)
    const resPeriodos = await fetch(`${API}/usuarioXPeriodo/usuario/${cedula.value}`);
    if (!resPeriodos.ok) throw new Error("Error al obtener los períodos del estudiante");
    const periodos = await resPeriodos.json();
    console.log("Períodos del estudiante:", periodos);
    // Filtrar para obtener el período actual (donde hoy esté entre Periodo_Inicio y Periodo_Fin)
    const hoy = new Date();

    periodoActual.value = periodos.find((p: any) => {
    console.log("Periodo_Inicio:", p.periodo.Periodo_Inicio, "Periodo_Fin:", p.periodo.Periodo_Fin);
    const inicio = new Date(p.periodo.Periodo_Inicio);
    const fin = new Date(p.periodo.Periodo_Fin);
    return hoy >= inicio && hoy <= fin;
  });
    if (!periodoActual.value) {
      throw new Error("No se encontró un período activo para el estudiante");
    }
    // Establecer usuarioXPeriodoId a partir del período actual (se asume que el objeto tiene la propiedad UsuarioXPeriodo_ID)
    usuarioXPeriodoId.value = periodoActual.value.UsuarioXPeriodo_ID;
    console.log("Periodo actual:", periodoActual.value);
    console.log("usuarioXPeriodoId:", usuarioXPeriodoId.value);
    // Consultar si ya existe un registro de asistencia abierto para hoy
    await cargarRegistroAsistenciaAbierto();
    estudianteCargado.value = true;
  } catch (error: any) {
    console.error("Error al cargar el estudiante:", error);
    errorModalMessage.value = error.message || "Error al cargar los datos del estudiante.";
    showErrorModal.value = true;
  } finally {
    cargando.value = false;
  }
};

// Función para cargar el registro de asistencia abierto para el día actual
const cargarRegistroAsistenciaAbierto = async () => {
  if (!cedula.value) return;
  try {
    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split("T")[0];
    const response = await fetch(`${API}/registros/abierto?usuarioxPeriodoId=${usuarioXPeriodoId.value}&fecha=${fechaHoy}`);
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

// Función para iniciar la captura de huella
const iniciarCaptura = async () => {
  if (capturando.value) {
    console.log("Captura ya en proceso.");
    return;
  }
  capturando.value = true;
  dialogoActivo.value = true;
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
// Al registrar la salida, se actualiza la asistencia y se guarda/actualiza el resumen de horas.
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
          detail: `La huella no coincide con un puntaje de = ${score}/200. Por favor, intente de nuevo.`,
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
        if (tipoRegistro.value === "entrada") {
          // Registro de entrada (POST)
          try {
            const registroData = {
              UsuarioXPeriodo_ID: usuarioXPeriodoId.value,
              // Para pruebas, se simula la hora de entrada (ajusta según necesites)
              Registro_Entrada: new Date('2025-03-24T17:15:00Z'),
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
          } catch (error) {
            console.error("Error creando registro de entrada:", error);
            toast.add({
              severity: "error",
              summary: "Error",
              detail: "No se pudo registrar la entrada en la base de datos.",
              life: 5000,
            });
            return;
          }
        } else {
          // Registro de salida (PUT)
          try {
            const registroId = registroAbierto.value?.Registro_ID;
            if (!registroId) {
              toast.add({
                severity: "error",
                summary: "Error",
                detail: "No se encontró el registro de entrada para actualizar la salida.",
                life: 5000,
              });
              return;
            }
            // Para pruebas, se simula la hora de salida (ajusta según necesites)
            const salidaSimulada = new Date('2025-03-24T22:15:00Z');
            const response = await fetch(`${API}/registros/${registroId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ Registro_Salida: salidaSimulada })
            });
            if (!response.ok) throw new Error("No se pudo actualizar el registro de asistencia.");
            console.log("Registro de salida actualizado correctamente.");
            // Guardar o actualizar el resumen de horas (acumulativo)
            await guardarResumenHoras(registroAbierto.value.Registro_Entrada, salidaSimulada);
          } catch (error) {
            console.error("Error actualizando registro de salida:", error);
            toast.add({
              severity: "error",
              summary: "Error",
              detail: "No se pudo registrar la salida en la base de datos.",
              life: 5000,
            });
            return;
          }
        }
        // Mostrar toast de éxito y redirigir después de 3 segundos
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

// Función para guardar el resumen de horas de asistencia (acumulativo)
// Se suma el total actual a lo previamente registrado (si existe); si es el primer registro se crea.
const guardarResumenHoras = async (entrada, salida) => {
  try {
    // Calcular la diferencia en horas sin redondear
    const diffMs = new Date(salida) - new Date(entrada);
    const horasActuales = diffMs / (1000 * 60 * 60);
  
    // Consultar si ya existe un resumen para el usuario (por cédula)
    const resGet = await fetch(`${API}/resumenHoras/user/${cedula.value}`);
    let resumenExistente = null;
    if (resGet.ok) {
      resumenExistente = await resGet.json();
      console.log("Resumen existente:", resumenExistente);
    }
  
    let resumenData = {};
    if (resumenExistente && resumenExistente.Resumen_ID) {
      // Si ya existe, se suma lo acumulado con las horas actuales
      const totalAcumulado = Number(resumenExistente.Resumen_Horas_Totales) + horasActuales;
      resumenData = {
        Resumen_Horas_Totales: totalAcumulado
        // No se toca Resumen_Inicio (queda con la fecha del primer registro)
      };
      const resPut = await fetch(`${API}/resumenHoras/${resumenExistente.Resumen_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumenData)
      });
      if (!resPut.ok) throw new Error("Error al actualizar el resumen de horas.");
      console.log("Resumen de horas actualizado correctamente.");
    } else {
      // Si no existe, se crea un nuevo resumen usando la fecha de entrada del primer registro
      resumenData = {
        Usuario_Cedula: cedula.value,
        Resumen_Inicio: entrada,
        Resumen_Horas_Totales: horasActuales
      };
      const resPost = await fetch(`${API}/resumenHoras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumenData)
      });
      if (!resPost.ok) throw new Error("Error al crear el resumen de horas.");
      console.log("Resumen de horas creado correctamente.");
    }
  } catch (error) {
    console.error("Error en guardar resumen de horas:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo guardar el resumen de horas.",
      life: 5000,
    });
  }
};

// Función para volver a la vista de AsignacionHuella
const volver = () => {
  router.push("/AsignacionHuella");
};

// No se carga nada al montar; la carga se inicia cuando el usuario ingresa la cédula y pulsa "Buscar".
</script>

<style scoped>
/* Ajusta estilos a tu preferencia */
</style>
