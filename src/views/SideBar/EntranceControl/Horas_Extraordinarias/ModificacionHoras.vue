<template>
  <main class="p-8 max-w-3xl mx-auto min-h-screen transition-colors duration-300">
    <!-- Encabezado -->
    <div class="flex items-center gap-4 mb-8">
      <Button
        icon="pi pi-arrow-left"
        class="p-button-text text-blue-600 hover:text-blue-800"
        @click="volver"
        tooltip="Volver al listado"
        tooltipOptions="{ position: 'top' }"
      />
      <h1 class="text-3xl font-bold text-center flex-grow">Ajuste de Horas Extraordinarias</h1>
      <div class="w-10"></div>
    </div>

    <Toast />

    <!-- Modal de error -->
    <Dialog
      v-model:visible="showErrorModal"
      header="⚠️ Error"
      modal
      :style="{ width: '30rem' }"
      :breakpoints="{ '960px': '90vw' }"
      :class="isDarkTheme ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'"
    >
      <p class="text-center text-lg">{{ errorModalMessage }}</p>
      <div class="flex justify-center mt-4 mt-5">
        <Button label="Cerrar" severity="contrast" @click="showErrorModal = false" />
      </div>
    </Dialog>

    <!-- Modal de confirmación -->
    <Dialog
      v-model:visible="confirmDialogVisible"
      header="Confirmar ajuste"
      modal
      :closable="false"
      :style="{ width: '30rem' }"
      :breakpoints="{ '960px': '90vw' }"
      :class="isDarkTheme ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'"
    >
      <div class="p-4 text-center text-lg">
        ¿Está seguro de que desea
        <span class="font-semibold" v-if="ajusteTipo === 'adicional'">adicionar</span>
        <span class="font-semibold" v-else>reducir</span>
        {{ ajusteHoras }} horas?
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 px-4 pb-4">
          <Button label="Cancelar" class="p-button-danger" @click="cancelConfirm" />
          <Button label="Confirmar" class="p-button-success" @click="guardarAjuste" />
        </div>
      </template>
    </Dialog>

    <!-- Formulario de búsqueda -->
    <div
      :class="[
        'mx-auto rounded-2xl shadow-md p-6 mb-8 w-full max-w-md',
        isDarkTheme ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'
      ]"
    >
      <h2 class="text-xl font-semibold text-center mb-4">Ingrese la Cédula del Estudiante</h2>
      <InputText
        v-model="cedulaInput"
        type="text"
        maxlength="15"
        placeholder="Ej: 0102030405"
        class="w-full p-3 border rounded-lg mb-4"
        :class="isDarkTheme ? '!bg-[#121212] !text-white !border-gray-600' : ''"
        @keyup.enter="buscarEstudiante"
      />
      <Button
        label="Buscar"
        class="p-button-success w-full px-6 py-2 text-base rounded-lg shadow-md"
        @click="buscarEstudiante"
      />
    </div>

    <!-- Registro y formulario -->
    <div
      v-if="estudianteCargado"
      class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto"
    >
      <!-- Datos del Estudiante -->
      <div :class="[cardClass, 'p-6 rounded-2xl shadow-md']">
        <h2 class="text-xl font-semibold text-center mb-4">Datos del Estudiante</h2>
        <div class="space-y-1">
          <p><strong>Cédula:</strong> {{ resumenDisplay.userSummary.Internal_ID }}</p>
          <p><strong>Nombre:</strong> {{ resumenDisplay.userSummary.Internal_Name }} {{ resumenDisplay.userSummary.Internal_LastName }}</p>
          <p><strong>Correo:</strong> {{ resumenDisplay.userSummary.Internal_Email }}</p>
          <p><strong>Área:</strong> {{ resumenDisplay.userSummary.Internal_Area || "N/A" }}</p>
          <p><strong>Total Horas:</strong> {{ resumenDisplay.Summary_Total_Hours }}</p>
          <p><strong>Horas Adicionales:</strong> {{ resumenDisplay.Summary_Extra_Hours }}</p>
          <p><strong>Horas Reducidas:</strong> {{ resumenDisplay.Summary_Reduced_Hours }}</p>
        </div>
      </div>

      <!-- Formulario Ajuste -->
      <div :class="[cardClass, 'p-6 rounded-2xl shadow-md']">
        <h2 class="text-xl font-semibold text-center mb-4">Registrar Ajuste</h2>

        <div class="mb-4">
          <label class="block font-medium mb-1">Horas a Ajustar</label>
          <InputNumber
            v-model="ajusteHoras"
            class="w-full"
            inputClass="p-3 border rounded-lg"
            :min="0"
            mode="decimal"
            :step="0.1"
            :useGrouping="false"
            showButtons
          />
        </div>

        <div class="mb-4">
          <label class="block font-medium mb-1">Tipo de Ajuste</label>
          <Dropdown
            v-model="ajusteTipo"
            :options="tiposDeAjuste"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione un tipo"
            class="w-full"
            :class="isDarkTheme ? '!border-gray-600' : ''"
            :inputStyle="isDarkTheme ? { backgroundColor: '#121212', color: 'white' } : {}"
            :panelClass="isDarkTheme ? '!bg-[#1f1f1f] !text-white' : '!bg-white !text-black'"

          />
        </div>

        <div class="mb-4">
          <label class="block font-medium mb-1">Comentario (opcional)</label>
          <Textarea
            v-model="ajusteComentario"
            rows="3"
            maxlength="150"
            class="w-full p-3 border rounded-lg"
            :class="isDarkTheme ? '!bg-[#121212] !text-white !border-gray-600' : ''"
            placeholder="Ingrese un comentario (opcional)"
          />
          <div class="text-sm text-right text-gray-500 mt-1">
            {{ ajusteComentario.length }}/150
          </div>
        </div>

        <div class="flex justify-center pt-4">
          <Button
            label="Guardar Ajuste"
            class="p-button-success px-6 py-2 text-base rounded-lg"
            @click="openConfirmDialog"
          />
        </div>
      </div>
    </div>
  </main>
</template>

  
<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import Dropdown from 'primevue/dropdown';
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import { useToast } from "primevue/usetoast";
import { API, type Usuario } from "@/ApiRoute";
import { useDarkMode } from "@/components/ThemeSwitcher";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

const router = useRouter();
const toast = useToast();
const { isDarkTheme } = useDarkMode();
const authStore = useAuthStore();


const tiposDeAjuste = [
  { label: "Adicional", value: "adicional" },
  { label: "Reducida", value: "reducida" }
];


// Función para obtener la fecha de hoy en formato "YYYY-MM-DDT00:00"
function getTodayDateLocal() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T00:00`;
}

// Variables para búsqueda
const cedulaInput = ref("");
const estudianteCargado = ref(false);
const showErrorModal = ref(false);
const errorModalMessage = ref("");

// Variable para almacenar el resumen del estudiante con datos (usuarioResumen)
// Se guarda el resultado de la búsqueda. Si no existe, se utiliza un objeto por defecto.
const resumenData = ref(null);
const resumenDisplay = computed(() => {
  return resumenData.value || {
    Summary_Total_Hours: 0,
    Summary_Extra_Hours: 0,
    Summary_Reduced_Hours: 0,
    userSummary: {
      Internal_ID: usuarioData.value ? usuarioData.value.Internal_ID : "",
      Internal_Name: usuarioData.value ? usuarioData.value.Internal_Name : "",
      Internal_LastName: usuarioData.value ? usuarioData.value.Internal_LastName : "",
      Internal_Email: usuarioData.value ? usuarioData.value.Internal_Email : "",
      Internal_Area: usuarioData.value ? usuarioData.value.Internal_Area : ""
    }
  };
});


// Variable para almacenar los datos del usuario (en caso de que no exista resumen)
const usuarioData = ref<Usuario | null>(null);

// Variables para ajustes
const ajusteHoras = ref(0);
const ajusteTipo = ref("");
const ajusteComentario = ref("");

// Variable para el modal de confirmación
const confirmDialogVisible = ref(false);

// Estados UI y estilos (las tarjetas se adaptan al modo dark/light)
const cardClass = computed(() =>
  isDarkTheme.value
    ? "bg-[#1f1f1f] text-white border border-gray-700 shadow-md"
    : "bg-white text-gray-900 border border-gray-200 shadow-md"
);


// Función para buscar y cargar el resumen con datos del estudiante
const buscarEstudiante = async () => {
  if (!cedulaInput.value) {
    errorModalMessage.value = "Por favor, ingrese una cédula para buscar.";
    showErrorModal.value = true;
    return;
  }

  try {
    // Primero buscar los datos del estudiante
    const { data: usuario } = await axios.get(`${API}/internal-user/${cedulaInput.value}`);
    
    if (!usuario || !usuario.Internal_ID) {
      errorModalMessage.value = "No se encontró ningún estudiante con la cédula ingresada.";
      showErrorModal.value = true;
      return;
    }

    // Verificar que sea un estudiante
    if (usuario.Internal_Type !== "Estudiante") {
      errorModalMessage.value = "El usuario encontrado no es un estudiante. Solo los estudiantes pueden tener ajustes de horas.";
      showErrorModal.value = true;
      return;
    }

    usuarioData.value = usuario;

    // Luego intentar obtener el resumen
    try {
      const resResumen = await axios.get(`${API}/resumenHoras/conDatos/${usuario.Internal_ID}`);
      resumenData.value = resResumen.data;
    } catch (errorResumen: any) {
      console.warn('No se encontró resumen, usando valores por defecto');
      resumenData.value = null;  // Esto hará que use el computed con valores 0
    }

    estudianteCargado.value = true;

    // Mostrar mensaje de éxito
    toast.add({
      severity: "success",
      summary: "Estudiante encontrado",
      detail: `${usuario.Internal_Name} ${usuario.Internal_LastName}`,
      life: 3000,
    });

  } catch (error: any) {
    console.error("Error al buscar el estudiante:", error);
    
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
    estudianteCargado.value = false;
  }
};


// Función para abrir el modal de confirmación
const openConfirmDialog = () => {
  // Validar que las horas sean válidas
  if (!ajusteHoras.value || ajusteHoras.value <= 0) {
    errorModalMessage.value = "Debe ingresar un número de horas válido (mayor a 0).";
    showErrorModal.value = true;
    return;
  }

  // Validar que el tipo esté seleccionado
  if (!ajusteTipo.value) {
    errorModalMessage.value = "Debe seleccionar un tipo de ajuste (Adicional o Reducida).";
    showErrorModal.value = true;
    return;
  }

  // Validación: máximo permitido
  if (ajusteHoras.value > 500) {
    errorModalMessage.value = "No se pueden registrar más de 500 horas en un solo ajuste.";
    showErrorModal.value = true;
    return;
  }


  // Validación: si intenta reducir más horas de las que tiene
  if (ajusteTipo.value === "reducida" && ajusteHoras.value > resumenDisplay.value.Summary_Total_Hours) {
    errorModalMessage.value = `No puede reducir más horas de las que tiene asignadas.\n\nHoras totales actuales: ${resumenDisplay.value.Summary_Total_Hours}\nHoras que intenta reducir: ${ajusteHoras.value}`;
    showErrorModal.value = true;
    return;
  }


  // Validación adicional: no permitir ajustes que resulten en horas negativas
  if (ajusteTipo.value === "reducida") {
    const horasRestantes = resumenDisplay.value.Summary_Total_Hours - ajusteHoras.value;
    if (horasRestantes < 0) {
      errorModalMessage.value = `Este ajuste dejaría al estudiante con horas negativas (${horasRestantes.toFixed(2)}). No es permitido.`;
      showErrorModal.value = true;
      return;
    }
  }

  // Validación: límite razonable para horas adicionales
  if (ajusteTipo.value === "adicional") {
    const horasFinales = resumenDisplay.value.Summary_Total_Hours + ajusteHoras.value;
    if (horasFinales > 1000) {
      errorModalMessage.value = `El total de horas después del ajuste sería ${horasFinales.toFixed(2)}, lo cual excede el límite máximo de 1000 horas.`;
      showErrorModal.value = true;
      return;
    }
  }

  confirmDialogVisible.value = true;
};


// Función para cancelar la confirmación
const cancelConfirm = () => {
  confirmDialogVisible.value = false;
};

// Función para guardar el ajuste (POST al endpoint de horasExtraordinarias con resumen)
const guardarAjuste = async () => {
  confirmDialogVisible.value = false;
  try {
    const ajusteData = {
      Internal_ID: resumenDisplay.value.userSummary.Internal_ID,
      Hours_Num: ajusteHoras.value,
      Hours_Type: ajusteTipo.value,
      Hours_Date: new Date(),
      Hours_Comment: ajusteComentario.value,
      Hours_Approved_By: authStore.user?.name || null
    };

    await axios.post(`${API}/horasExtraordinarias/createConResumen`, ajusteData,
      {
        headers: {
          "internal-id": authStore.user?.id,
        }
      }
    );

    toast.add({
      severity: "success",
      summary: "Ajuste Registrado",
      detail: "El ajuste de horas fue registrado correctamente.",
      life: 3000,
    });

    setTimeout(() => {
      router.push("/SeguimientoGeneral");
    }, 3000);
    
  } catch (error: any) {
    console.error("Error al guardar el ajuste:", error);
    
    // Manejar errores específicos del servidor
    if (error.response) {
      if (error.response.status === 409) {
        errorModalMessage.value = "Ya existe un ajuste similar para este estudiante en esta fecha. No se puede duplicar.";
      } else if (error.response.status === 400) {
        errorModalMessage.value = "Los datos del ajuste son inválidos. Verifique la información ingresada e intente nuevamente.";
      } else if (error.response.status === 403) {
        errorModalMessage.value = "No tienes permisos para registrar ajustes de horas. Contacte al administrador.";
      } else if (error.response.status === 422) {
        errorModalMessage.value = "Los datos proporcionados no cumplen con los requisitos del sistema. Verifique las horas y el tipo de ajuste.";
      } else if (error.response.status === 500) {
        errorModalMessage.value = "Error interno del servidor al guardar el ajuste. Intente nuevamente más tarde.";
      } else {
        errorModalMessage.value = error.response.data?.message || "Error del servidor al guardar el ajuste de horas.";
      }
    } else if (error.request) {
      errorModalMessage.value = "Error de conexión al guardar el ajuste. Verifique su conexión a internet e intente nuevamente.";
    } else {
      errorModalMessage.value = error.message || "Error inesperado al guardar el ajuste de horas.";
    }
    
    showErrorModal.value = true;
  }
};

  
// Función para volver
const volver = () => {
  router.push("/AsignacionHuella");
};
</script>
  
<style scoped>
</style>
