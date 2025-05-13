<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <!-- Encabezado con botón "Volver" a la izquierda -->
    <div class="relative w-full max-w-3xl mb-10">
      <h1 class="text-3xl font-bold text-center">Información del Estudiante</h1>
    </div>

    <!-- Toast para mensajes -->
    <Toast />

    <!-- Tarjeta informativa del estudiante -->
    <div :class="['w-full max-w-3xl p-8 rounded-lg shadow-lg', cardClass]">
      <h2 class="text-xl font-semibold text-center mb-6">Detalles del Estudiante</h2>

      <Message v-if="errorMensaje" severity="error" class="mb-4">
        {{ errorMensaje }}
      </Message>

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

      <!-- Botones de captura y guardado de huella -->
      <div class="flex flex-col items-center mt-8 gap-5">
        <!-- Si aún no se capturó la huella, mostrar botón para capturar y botón Cancelar -->
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
        <!-- Si ya se capturó la huella, mostrar mensaje y botón para guardar -->
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

    <!-- Modal de Captura de Huella -->
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
          <Button
            label="Cancelar"
            class="p-button-danger"
            severity="danger"
            @click="cancelarCaptura"
          />
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
import { API, type Usuario } from "@/ApiRoute";
import { useDarkMode } from "@/components/ThemeSwitcher";
import axios from "axios";

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { isDarkTheme } = useDarkMode();

// Obtener la cédula del estudiante desde la ruta (puede venir en "cedula" o "id")
const estudianteId = computed(() =>
  route.params.cedula ? String(route.params.cedula) : route.params.id ? String(route.params.id) : null
);

const getLectorURL = (path: string): string => {
  if (import.meta.env.DEV) {
    // Desarrollo: usa proxy
    return path;
  } else {
    // Producción: usa la IP local o hostname de la máquina cliente
    return `https://${window.location.hostname}:8443${path}`;
  }
};


// Variables del estudiante
const cedula = ref("");
const nombres = ref("");
const apellidos = ref("");
const correo = ref("");
const area = ref("");

// Estados para huella digital
const huellaBase64 = ref("");
const huellaCapturada = ref(false);

// Estados de la UI
const errorMensaje = ref("");
const cargando = ref(false);
const dialogoActivo = ref(false);
const capturando = ref(false);

// Clases dinámicas para dark mode
const cardClass = computed(() =>
  isDarkTheme.value ? "bg-gray-800 text-white shadow-lg" : "bg-white text-gray-900 shadow-lg"
);
const inputClass = computed(() =>
  isDarkTheme.value
    ? "bg-gray-900 text-white border-gray-700 focus:border-blue-500"
    : "bg-white text-gray-900 border-gray-300 focus:border-blue-500"
);

// Función para cargar los datos del estudiante
const cargarEstudiante = async () => {
  if (!estudianteId.value) {
    errorMensaje.value = "No se encontró la cédula del estudiante en la ruta.";
    return;
  }
  cargando.value = true;
  try {
    const { data } = await axios.get(`${API}/internal-user/${estudianteId.value}`);
    cedula.value = data.Internal_ID;
    nombres.value = data.Internal_Name;
    apellidos.value = data.Internal_LastName;
    correo.value = data.Internal_Email;
    area.value = data.Internal_Area || "";
  } catch (error) {
    console.error("Error al cargar el estudiante:", error);
    errorMensaje.value = "Error al cargar los datos del estudiante.";
  } finally {
    cargando.value = false;
  }
};


// Función para iniciar la captura de huella
const iniciarCaptura = async () => {
  if (capturando.value) {
    console.log("Captura ya en proceso, evitando múltiples intentos.");
    return;
  }
  capturando.value = true;
  dialogoActivo.value = true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(getLectorURL("/SGIFPCapture"), {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*"
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
    console.log("Respuesta de captura:", data);
    if (data.ErrorCode === 0 && data.TemplateBase64) {
      huellaBase64.value = data.TemplateBase64;
      huellaCapturada.value = true;
      toast.add({
        severity: "success",
        summary: "Huella Capturada",
        detail: "La huella digital fue escaneada correctamente.",
        life: 3000,
      });
      // Cierra el modal inmediatamente
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


// Se realiza un PUT enviando la cédula en query y en el body { Usuario_Huella: huellaBase64 }
// 📌 4️⃣ Guardar huella en la base de datos
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
    await axios.put(`${API}/usuarios/actualizar-huella`, {
      usuarioCedula: cedula.value,
      template: huellaBase64.value,
    });

    toast.add({
      severity: "success",
      summary: "Huella Guardada",
      detail: "La huella digital se registró correctamente.",
      life: 3000,
    });

    router.push("/AsignacionHuella");

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


// Función para volver a la vista de Asignación de Huella
const volverAsignacionHuella = () => {
  router.push("/AsignacionHuella");
};

// Cargar datos del estudiante al montar el componente
onMounted(() => {
  cargarEstudiante();
});
</script>

<style scoped>
</style>
