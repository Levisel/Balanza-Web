<template>
  <main class="min-h-screen p-8">
    <!-- Encabezado -->
    <div class="w-full flex items-center justify-between mb-8">
      <Button 
        icon="pi pi-arrow-left" 
        class="p-button-text text-blue-600 hover:text-blue-800" 
        @click="volver" 
        tooltip="Volver al listado" 
        tooltipOptions="{ position: 'top' }" 
      />
      <h1 class="text-3xl font-bold flex-grow text-center" :class="isDarkTheme ? 'text-white' : 'text-gray-900'">
        Ajuste de Horas Extraordinarias
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
      class="w-full max-w-md"
      :class="isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'"
    >
      <p class="text-center">{{ errorModalMessage }}</p>
      <div class="flex justify-center mt-4">
        <Button label="Cerrar" @click="showErrorModal = false" />
      </div>
    </Dialog>
  
    <!-- Modal de confirmación -->
    <Dialog
      v-model:visible="confirmDialogVisible"
      header="Confirmar ajuste"
      :modal="true"
      :closable="false"
      class="w-full max-w-md"
      :class="isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'"
    >
      <div class="p-4">
        <p class="text-center text-lg">
          ¿Está seguro de que desea 
          <span class="font-semibold" v-if="ajusteTipo === 'adicional'">adicionar</span>
          <span class="font-semibold" v-else>reducir</span>
          {{ ajusteHoras }} horas?
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 p-2">
          <Button label="Cancelar" class="p-button-danger" @click="cancelConfirm" />
          <Button label="Confirmar" class="p-button-success" @click="guardarAjuste" />
        </div>
      </template>
    </Dialog>
  
    <!-- Cuadro de búsqueda de cédula (centrado) -->
    <div :class="[cardClass, 'w-full max-w-md p-6 rounded-lg shadow-lg mb-8 mx-auto']">
      <h2 class="text-xl font-semibold text-center mb-4">
        Ingrese la Cédula del Estudiante
      </h2>
      <InputText 
        v-model="cedulaInput" 
        placeholder="Ingrese la cédula" 
        class="w-full p-3 border rounded-lg" 
        :class="isDarkTheme ? 'bg-gray-700 text-white border-gray-600' : ''"
      />
      <div class="flex justify-center mt-4">
        <Button label="Buscar" class="p-button-primary" @click="buscarEstudiante" />
      </div>
    </div>
  
    <!-- Grid de datos y formulario -->
    <div v-if="estudianteCargado" class="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Tarjeta de datos del estudiante y resumen -->
      <div :class="[cardClass, 'p-6 rounded-lg shadow-lg']">
        <h2 class="text-xl font-semibold text-center mb-4">Datos del Estudiante</h2>
        <div class="mb-4">
          <p><strong>Cédula:</strong> {{ resumenDisplay.usuarioResumen.Internal_ID }}</p>
          <p>
            <strong>Nombre:</strong> 
            {{ resumenDisplay.usuarioResumen.Internal_Name }} 
            {{ resumenDisplay.usuarioResumen.Internal_LastName }}
          </p>
          <p><strong>Correo:</strong> {{ resumenDisplay.usuarioResumen.Internal_Email }}</p>
          <p><strong>Área:</strong> {{ resumenDisplay.usuarioResumen.Internal_Area || "N/A" }}</p>
        </div>
        <div>
          <h3 class="text-lg font-medium">Resumen de Horas</h3>
          <p><strong>Total Horas:</strong> {{ resumenDisplay.Resumen_Horas_Totales }}</p>
          <p><strong>Horas Adicionales:</strong> {{ resumenDisplay.Resumen_Horas_Adicionales }}</p>
          <p><strong>Horas Reducidas:</strong> {{ resumenDisplay.Resumen_Horas_Reducidas }}</p>
        </div>
      </div>
      <!-- Tarjeta con formulario de ajuste -->
      <div :class="[cardClass, 'p-6 rounded-lg shadow-lg']">
        <h2 class="text-xl font-semibold text-center mb-4">Registrar Ajuste</h2>
        <div class="mb-4">
          <label class="block font-medium mb-1">Horas a Ajustar</label>
          <input 
            v-model.number="ajusteHoras" 
            type="number" 
            step="0.1" 
            min="0" 
            class="w-full p-2 border rounded-lg" 
            :class="isDarkTheme ? 'bg-gray-700 text-white border-gray-600' : ''"
            placeholder="Ej: 1.5"
          />
        </div>
        <div class="mb-4">
          <label class="block font-medium mb-1">Tipo de Ajuste</label>
          <select 
            v-model="ajusteTipo" 
            class="w-full p-2 border rounded-lg" 
            :class="isDarkTheme ? 'bg-gray-700 text-white border-gray-600' : ''"
          >
            <option disabled value="">Seleccione un tipo</option>
            <option value="adicional">Adicional</option>
            <option value="reducida">Reducida</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block font-medium mb-1">Comentario (opcional)</label>
          <textarea 
            v-model="ajusteComentario" 
            rows="3" 
            class="w-full p-2 border rounded-lg" 
            :class="isDarkTheme ? 'bg-gray-700 text-white border-gray-600' : ''"
            placeholder="Ingrese un comentario si es necesario"
            maxlength="250"
          ></textarea>
        </div>
        <div class="flex justify-center mt-4">
          <Button label="Guardar Ajuste" class="p-button-success" @click="openConfirmDialog" />
        </div>
      </div>
    </div>
  </main>
</template>
  
<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import { useToast } from "primevue/usetoast";
import { API, type Usuario } from "@/ApiRoute";
import { useDarkMode } from "@/components/ThemeSwitcher";

const router = useRouter();
const toast = useToast();
const { isDarkTheme } = useDarkMode();

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

// Variable para almacenar el resumen del estudiante con datos (usuarioResumen)
// Se guarda el resultado de la búsqueda. Si no existe, se utiliza un objeto por defecto.
const resumenData = ref(null);
const resumenDisplay = computed(() => {
  return resumenData.value || {
    Resumen_Horas_Totales: 0,
    Resumen_Horas_Adicionales: 0,
    Resumen_Horas_Reducidas: 0,
    usuarioResumen: {
      Internal_ID: usuarioData.value ? usuarioData.value.Internal_ID : "",
      Internal_Name: usuarioData.value ? usuarioData.value.Internal_Name : "",
      Internal_LastName: usuarioData.value ? usuarioData.value.Internal_LastName : "",
      Internal_Email: usuarioData.value ? usuarioData.value.Internal_Email : "",
      Internal_Area: usuarioData.value ? usuarioData.value.Internal_Area : ""
    }
  };
});

// Variable para almacenar los datos del usuario (en caso de que no exista resumen)
const usuarioData = ref(null);

// Variables para ajustes
const ajusteHoras = ref(0);
const ajusteTipo = ref("");
const ajusteComentario = ref("");

// Variable para el modal de confirmación
const confirmDialogVisible = ref(false);

// Estados UI y estilos (las tarjetas se adaptan al modo dark/light)
const cardClass = computed(() =>
  isDarkTheme.value ? "bg-gray-800 text-white shadow-lg" : "bg-white text-gray-900 shadow-lg"
);

// Función para buscar y cargar el resumen con datos del estudiante
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
  try {
    // Obtener datos del estudiante
    const response = await fetch(`${API}/internal-user/${cedulaInput.value}`);
    if (!response.ok) throw new Error("Estudiante no encontrado");
    const usuario: Usuario = await response.json();
    usuarioData.value = usuario;
    
    // Consultar el resumen con datos básicos usando la ruta que devuelve usuarioResumen
    const resResumen = await fetch(`${API}/resumenHoras/conDatos/${usuario.Internal_ID}`);
    // Si no se encuentra el resumen, dejamos resumenData en null para usar el valor por defecto en resumenDisplay
    if (resResumen.ok) {
      const resumen = await resResumen.json();
      resumenData.value = resumen;
    } else {
      resumenData.value = null;
    }
    estudianteCargado.value = true;
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message || "Error al buscar el estudiante.",
      life: 5000,
    });
  }
};

// Función para abrir el modal de confirmación
const openConfirmDialog = () => {
  if (ajusteHoras.value <= 0 || !ajusteTipo.value) {
    toast.add({
      severity: "warn",
      summary: "Campos incompletos",
      detail: "Complete los campos de ajuste.",
      life: 3000,
    });
    return;
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
      Internal_ID: resumenDisplay.value.usuarioResumen.Internal_ID,
      Horas_Num: ajusteHoras.value,
      Horas_Tipo: ajusteTipo.value, // "adicional" o "reducida"
      Horas_Fecha: new Date(), // Fecha actual en UTC (se recomienda usar ISO)
      Horas_Comentario: ajusteComentario.value
    };
    const response = await fetch(`${API}/horasExtraordinarias/createConResumen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ajusteData)
    });
    if (!response.ok) throw new Error("No se pudo registrar el ajuste de horas extraordinarias.");
    toast.add({
      severity: "success",
      summary: "Registrado",
      detail: "El ajuste fue registrado correctamente.",
      life: 3000,
    });
    setTimeout(() => {
      router.push("/SeguimientoGeneral");
    }, 3000);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message || "Error al guardar el ajuste.",
      life: 5000,
    });
  }
};
  
// Función para volver
const volver = () => {
  router.push("/AsignacionHuella");
};
</script>
  
<style scoped>
/* Puedes agregar estilos adicionales o personalizar clases aquí */
</style>
