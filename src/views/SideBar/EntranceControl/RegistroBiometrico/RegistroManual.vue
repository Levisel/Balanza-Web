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
          Registro Manual de Asistencia
        </h1>
        <div class="w-10"></div>
      </div>
  
      <Toast />
  
      <!-- Modal de error en caso de búsqueda fallida -->
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
  
      <!-- Modal de confirmación de asistencia -->
      <Dialog
        v-model:visible="confirmDialogVisible"
        header="Confirmar asistencia"
        :modal="true"
        :closable="false"
        style="width: 30rem"
      >
        <div class="p-4">
          <p class="text-center text-lg">
            ¿Está seguro de que desea guardar la asistencia?
          </p>
        </div>
        <template #footer>
          <div class="flex justify-end gap-3 p-2">
            <Button label="Cancelar" class="p-button-danger" @click="cancelConfirm" />
            <Button label="Confirmar" class="p-button-success" @click="confirmGuardarAsistencia" />
          </div>
        </template>
      </Dialog>
  
      <!-- Formulario para ingresar cédula -->
      <div class="w-full max-w-md p-6 rounded-lg shadow-lg mb-8" :class="cardClass">
        <h2 class="text-xl font-semibold text-center mb-4">
          Ingrese la Cédula del Estudiante
        </h2>
        <input
          v-model="cedulaInput"
          type="text"
          placeholder="Ingrese la cédula"
          class="w-full p-3 border rounded-lg"
        />
        <Button label="Buscar" class="mt-4" @click="buscarEstudiante" />
      </div>
  
      <!-- Datos mínimos del estudiante y formulario manual -->
      <div v-if="estudianteCargado" :class="['w-full max-w-lg p-6 rounded-lg shadow-lg', cardClass]">
        <h2 class="text-xl font-semibold text-center mb-4">
          Datos del Estudiante y Registro Manual
        </h2>
        <div class="mb-4">
          <p><strong>Cédula:</strong> {{ cedula }}</p>
          <p><strong>Nombre:</strong> {{ nombres }}</p>
          <p><strong>Período Activo: </strong>
            <span v-if="periodoActual">
              {{ periodoActual.periodo.PeriodoNombre }}
            </span>
            <span v-else>
              No asignado
            </span>
          </p>
        </div>
        <!-- Formulario para ingresar manualmente la hora de entrada y salida -->
        <div class="mb-4">
          <label class="block font-medium mb-1">Hora de Entrada</label>
          <input
            v-model="manualEntrada"
            type="datetime-local"
            class="w-full p-2 border rounded-lg"
          />
        </div>
        <div class="mb-4">
          <label class="block font-medium mb-1">Hora de Salida</label>
          <input
            v-model="manualSalida"
            type="datetime-local"
            class="w-full p-2 border rounded-lg"
          />
        </div>
        <div class="flex justify-center mt-4">
          <Button
            label="Guardar Asistencia"
            class="p-button-success"
            @click="openConfirmDialog"
          />
        </div>
      </div>
    </main>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from "vue";
  import { useRouter } from "vue-router";
  import Button from "primevue/button";
  import Toast from "primevue/toast";
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
  
  // Variables para búsqueda y carga del estudiante
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
  
  // Variables para períodos y UsuarioXPeriodo
  const periodoActual = ref(null);
  const usuarioXPeriodoId = ref("");
  
  // Variables para registro manual, pre-llenando con la fecha de hoy (hora "00:00")
  const manualEntrada = ref(getTodayDateLocal());
  const manualSalida = ref(getTodayDateLocal());
  
  // Variable para el modal de confirmación
  const confirmDialogVisible = ref(false);
  
  // Estados UI y estilos
  const cardClass = computed(() =>
    isDarkTheme.value ? "bg-gray-800 text-white shadow-lg" : "bg-white text-gray-900 shadow-lg"
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
      
      // Consultar los períodos del estudiante
      const resPeriodos = await fetch(`${API}/usuarioXPeriodo/usuario/${cedula.value}`);
      if (!resPeriodos.ok) throw new Error("Error al obtener los períodos del estudiante");
      const periodosData = await resPeriodos.json();
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
      estudianteCargado.value = true;
    } catch (error: any) {
      console.error("Error al cargar el estudiante:", error);
      errorModalMessage.value = error.message || "Error al cargar los datos del estudiante.";
      showErrorModal.value = true;
    }
  };

  // Función para verificar que entrada y salida sean el mismo día
const validarMismoDia = (entrada: string, salida: string): boolean => {
  const fechaEntrada = new Date(entrada);
  const fechaSalida = new Date(salida);
  return (
    fechaEntrada.getFullYear() === fechaSalida.getFullYear() &&
    fechaEntrada.getMonth() === fechaSalida.getMonth() &&
    fechaEntrada.getDate() === fechaSalida.getDate()
  );
};
  
  // Función para abrir el modal de confirmación
  const openConfirmDialog = () => {
    confirmDialogVisible.value = true;
  };
  
  // Función para cancelar la confirmación
  const cancelConfirm = () => {
    confirmDialogVisible.value = false;
  };
  
  // Función para guardar la asistencia manual usando el endpoint especializado
  const confirmGuardarAsistencia = async () => {
    confirmDialogVisible.value = false;
    if (!manualEntrada.value || !manualSalida.value) {
      toast.add({
        severity: "warn",
        summary: "Campos Incompletos",
        detail: "Ingrese tanto la hora de entrada como la de salida.",
        life: 3000,
      });
      return;
    }

    // Validar que la hora de entrada y salida sean del mismo día
  if (!validarMismoDia(manualEntrada.value, manualSalida.value)) {
    toast.add({
      severity: "error",
      summary: "Fechas inválidas",
      detail: "La hora de entrada y salida deben ser del mismo día.",
      life: 3000,
    });
    return;
  }

    try {
      const registroData = {
        UsuarioXPeriodo_ID: usuarioXPeriodoId.value,
        Registro_Entrada: new Date(manualEntrada.value),
        Registro_Salida: new Date(manualSalida.value),
        Registro_Tipo: "Presencial",
        Registro_Observaciones: null,
        Registro_fecha: new Date(manualEntrada.value),
        Registro_IsDeleted: false
      };
      // Usar el endpoint especializado para crear el registro y actualizar el resumen
      const response = await fetch(`${API}/registros/createConResumen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registroData)
      });
      if (!response.ok) throw new Error("No se pudo crear el registro de asistencia.");
      toast.add({
        severity: "success",
        summary: "Registrado",
        detail: "La asistencia fue registrada correctamente.",
        life: 3000,
      });
      setTimeout(() => {
        router.push("/AsignacionHuella");
      }, 3000);
    } catch (error: any) {
      console.error("Error al guardar la asistencia manual:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: error.message || "No se pudo guardar la asistencia.",
        life: 5000,
      });
    }
  };
  
  // Función para volver a la vista anterior
  const volver = () => {
    router.push("/AsignacionHuella");
  };
  </script>
  
  <style scoped>
  /* Ajusta estilos según tus necesidades */
  </style>
  