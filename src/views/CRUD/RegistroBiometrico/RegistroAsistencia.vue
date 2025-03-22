<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <!-- Encabezado con título -->
    <div class="w-full flex items-center justify-between mb-8">
      <!-- Botón Cancelar (para volver a AsignacionHuella) -->
      <Button 
        icon="pi pi-arrow-left" 
        class="p-button-text text-blue-600 hover:text-blue-800"
        @click="volverAsignacionHuella" 
        tooltip="Volver al listado" 
        tooltipOptions="{ position: 'top' }"
      />
      <h1 class="text-3xl font-bold text-center flex-grow">Registro de Huella</h1>
      <!-- Un espacio para alinear (puedes colocar un div vacío) -->
      <div class="w-10"></div>
    </div>

    <!-- Mostrar datos del estudiante -->
    <div class="w-full max-w-3xl p-6 rounded-lg shadow-lg" :class="cardClass">
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

      <!-- Intervalo de tiempo (simulado en este ejemplo) -->
      <div class="mt-6 text-center">
        <p class="text-lg">Hora programada: <strong>{{ scheduledTimeString }}</strong></p>
        <p class="text-sm text-gray-600">Se permite capturar desde 15 minutos antes hasta 15 minutos después.</p>
      </div>

      <!-- Botones para captura de huella -->
      <div class="flex flex-col items-center mt-8 gap-5">
        <div v-if="!huellaCapturada">
          <Button
            label="Capturar Huella"
            class="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white mr-4"
            @click="iniciarCaptura"
          />
          <Button
            label="Cancelar"
            severity="danger"
            class="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white"
            @click="volverAsignacionHuella"
          />
        </div>
        <div v-else class="flex flex-col items-center">
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
        <p class="mb-4 text-center">Coloca tu dedo en el lector y espera a que se capture la huella.</p>
        <ProgressSpinner style="width:50px; height:50px;" strokeWidth="8" animationDuration=".8s" />
        <div class="flex gap-4 mt-4">
          <Button label="Cancelar" class="p-button-danger" @click="cancelarCaptura" />
        </div>
      </div>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import Message from "primevue/message";
import Toast from "primevue/toast";
import Dialog from "primevue/dialog";
import ProgressSpinner from "primevue/progressspinner";
import { useToast } from "primevue/usetoast";
import { API, type Usuario } from "@/views/Interfaces";
import { useDarkMode } from "@/components/ThemeSwitcher";

// Hooks
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { isDarkTheme } = useDarkMode();

// Obtener cédula del estudiante desde la ruta (puede venir en "cedula" o "id")
const estudianteCedula = computed(() =>
  route.params.cedula ? String(route.params.cedula) : route.params.id ? String(route.params.id) : null
);

// Variables del estudiante
const cedula = ref("");
const nombres = ref("");
const apellidos = ref("");
const correo = ref("");
const area = ref("");

// Variable para almacenar la huella almacenada (si la necesitas para comparar)
const huellaGuardada = ref("");

// Estados para la huella capturada
const huellaBase64 = ref("");
const huellaCapturada = ref(false);

// Estados UI
const errorMensaje = ref("");
const cargando = ref(false);
const dialogoActivo = ref(false);
const capturando = ref(false);

// Para el control de tiempo: (simulamos una hora programada)
const scheduledTime = ref(new Date("2025-03-22T00:39:00")); // Ejemplo: 9:00 AM
const scheduledTimeString = computed(() => scheduledTime.value.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }));

// Clases dinámicas para dark mode
const cardClass = computed(() =>
  isDarkTheme.value ? "bg-gray-800 text-white shadow-lg" : "bg-white text-gray-900 shadow-lg"
);
const inputClass = computed(() =>
  isDarkTheme.value ? "bg-gray-900 text-white border-gray-700" : "bg-white text-gray-900 border-gray-300"
);

// Función para cargar la información del estudiante
const cargarEstudiante = async () => {
  if (!estudianteCedula.value) {
    errorMensaje.value = "No se encontró la cédula del estudiante en la ruta.";
    return;
  }
  cargando.value = true;
  try {
    const response = await fetch(`${API}/usuarios/${estudianteCedula.value}`);
    if (!response.ok) throw new Error("Error al obtener el estudiante");
    const data: Usuario = await response.json();
    cedula.value = data.Usuario_Cedula;
    nombres.value = data.Usuario_Nombres;
    apellidos.value = data.Usuario_Apellidos;
    correo.value = data.Usuario_Correo;
    area.value = data.Usuario_Area || "";
    // Si se requiere, cargar la huella almacenada
    const resHuella = await fetch(`${API}/usuarios/obtener-huella/${data.Usuario_Cedula}`);
    if (resHuella.ok) {
      const huellaData = await resHuella.json();
      huellaGuardada.value = huellaData.huella || "";
    }
  } catch (error) {
    console.error("Error al cargar el estudiante:", error);
    errorMensaje.value = "Error al cargar los datos del estudiante.";
  } finally {
    cargando.value = false;
  }
};

// Validar que el tiempo actual esté dentro del intervalo permitido (15 minutos antes y después)
const tiempoPermitido = () => {
  const now = new Date();
  const diffMinutes = (now.getTime() - scheduledTime.value.getTime()) / (1000 * 60);
  // Permitir si diff está entre -15 y +15
  return diffMinutes >= -15 && diffMinutes <= 15;
};

// Función para iniciar la captura de huella
const iniciarCaptura = async () => {
  // Validar si el tiempo actual está dentro del intervalo permitido
  if (!tiempoPermitido()) {
    toast.add({
      severity: "warn",
      summary: "Tiempo no permitido",
      detail: "La captura de huella sólo se permite 15 minutos antes o después de la hora programada.",
      life: 4000,
    });
    return;
  }
  if (capturando.value) {
    console.log("Captura ya en proceso, evitando múltiples intentos.");
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
    if (!response.ok) {
      throw new Error(`Respuesta HTTP inválida: ${response.status}`);
    }
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
      // Cerrar el modal inmediatamente
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

// Función para cancelar la captura
const cancelarCaptura = () => {
  dialogoActivo.value = false;
  capturando.value = false;
};

// Función para guardar la huella: se compara con la almacenada y, si coincide (por encima de un umbral),
// se realiza un PUT para actualizar la huella en BD. (Aquí se simula la comparación con /SGIMatchScore)

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
  try {
    // Llamada a /SGIMatchScore: se envía la huella capturada y la almacenada.
    // Se asume que el endpoint devuelve un objeto { score: number }

    console.log("Comparando huellas...", huellaBase64.value);
    console.log("Comparando huellas...", huellaGuardada.value);

    const params = new URLSearchParams();
params.append("template1", huellaGuardada.value);
params.append("template2", huellaBase64.value);
params.append("licstr", "");
params.append("templateFormat", "ISO");

const resMatch = await fetch("/SGIMatchScore", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept": "*/*"
  },
  body: params
});


    if (!resMatch.ok) throw new Error("Error en la comparación de huellas.");
    const matchData = await resMatch.json();
    console.log("Resultado de comparación de huellas:", matchData);
    const score = matchData.score; // Ejemplo: score entre 0 y 100
    const umbral = 70; // Definir umbral mínimo aceptable
    if (score < umbral) {
      toast.add({
        severity: "error",
        summary: "Huella no coincide",
        detail: "La huella capturada no coincide con la almacenada.",
        life: 5000,
      });
      return;
    }

  } catch (error) {
    console.error("Error al guardar la huella:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo guardar la huella en la base de datos.",
      life: 5000,
    });
  }
};

// Función para volver a la vista de AsignacionHuella
const volverAsignacionHuella = () => {
  router.push("/AsignacionHuella");
};

// Cargar datos del estudiante al montar
onMounted(() => {
  cargarEstudiante();
});
</script>

<style scoped>
/* Estilos adicionales (ajusta según necesites) */
</style>
