<template>
  <main class="p-8 max-w-3xl mx-auto min-h-screen transition-colors duration-300">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-8">
      <Button
        icon="pi pi-arrow-left"
        class="p-button-text text-blue-600 hover:text-blue-800"
        @click="volver"
        tooltip="Volver al listado"
        tooltipOptions="{ position: 'top' }"
      />
      <h1 class="text-3xl font-bold text-center flex-grow">Registro Manual de Asistencia</h1>
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

    <!-- Confirmación -->
    <Dialog
      v-model:visible="confirmDialogVisible"
      header="Confirmar Asistencia"
      modal
      :closable="false"
      :style="{ width: '30rem' }"
      :breakpoints="{ '960px': '90vw' }"
      :class="isDarkTheme ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'"
    >
      <div class="p-4 text-center text-lg">
        ¿Está seguro de que desea guardar la asistencia?
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 px-4 pb-4">
          <Button label="Cancelar" class="p-button-danger" @click="cancelConfirm" />
          <Button label="Confirmar" class="p-button-success" @click="confirmGuardarAsistencia" />
        </div>
      </template>
    </Dialog>

    <!-- Formulario de búsqueda -->
<!-- Formulario de búsqueda -->
<div :class="[
  'mx-auto rounded-2xl shadow-md p-6 mb-8 w-full max-w-md',
  isDarkTheme ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'
]">
  <h2 class="text-xl font-semibold text-center mb-4">Ingrese la Cédula del Estudiante</h2>
  <InputText
    v-model="cedulaInput"
    type="text"
    maxlength="15"
    placeholder="Ej: 0102030405"
    class="w-full p-3 border rounded-lg mb-4"
    @keyup.enter="buscarEstudiante"
  />
  <Button
    label="Buscar"
    class="p-button-success w-full px-6 py-2 text-base rounded-lg shadow-md"
    @click="buscarEstudiante"
  />
</div>


    <!-- Registro de asistencia -->
    <div
      v-if="estudianteCargado"
      :class="[
        'mx-auto w-full max-w-xl rounded-2xl shadow-md p-6 space-y-4',
        isDarkTheme ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'
      ]"
    >

      <h2 class="text-xl font-semibold text-center">Datos del Estudiante y Registro</h2>
      <div class="space-y-1">
        <p><strong>Cédula:</strong> {{ cedula }}</p>
        <p><strong>Nombre:</strong> {{ nombres }}</p>
        <p><strong>Período Activo:</strong>
          <span v-if="periodoActual">{{ periodoActual.period.Period_Name }}</span>
          <span v-else>No asignado</span>
        </p>
      </div>

      <!-- Entrada -->
      <div>
        <label class="block font-medium mb-1">Hora de Entrada</label>
        <input
          v-model="manualEntrada"
          type="datetime-local"
          class="w-full p-3 border rounded-lg"
          :min="formatMinMaxDate(periodoInicio)"
          :max="formatMinMaxDate(periodoFin)"
        />
      </div>

      <!-- Salida -->
      <div>
        <label class="block font-medium mb-1">Hora de Salida</label>
        <input
          v-model="manualSalida"
          type="datetime-local"
          class="w-full p-3 border rounded-lg"
          :min="formatMinMaxDate(periodoInicio)"
          :max="formatMinMaxDate(periodoFin)"
        />
      </div>

      <!-- Tipo asistencia -->
      <div>
        <label class="block font-medium mb-1">Tipo de Asistencia</label>
        <Dropdown
          v-model="attendanceTypeSelected"
          :options="['Presencial', 'Virtual']"
          placeholder="Seleccione tipo de asistencia"
          class="w-full"
        />
      </div>

   <div class="flex justify-center pt-4">
  <Button
    label="Guardar Asistencia"
    class="p-button-success px-6 py-2 text-base rounded-lg"
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
  import { useAuthStore } from "@/stores/auth";
  import axios from "axios";


  const router = useRouter();
  const toast = useToast();
  const authStore = useAuthStore();
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
  const attendanceTypeSelected = ref("Presencial"); // Valor inicial puede ser "Presencial"

  
  // Variables para períodos y UsuarioXPeriodo
  interface Periodo {
    period: {
      Period_Name: string;
      Period_Start: string;
      Period_End: string;
    };
    UserXPeriod_ID: string;
  }
  
  const periodoActual = ref<Periodo | null>(null);
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
  
  function formatMinMaxDate(date: Date | null): string {
  if (!date) return "";
  const iso = date.toISOString();
  return iso.slice(0, 16); // yyyy-MM-ddTHH:mm
}


  // Función para buscar y cargar datos del estudiante y sus períodos
  const buscarEstudiante = async () => {
  if (!cedulaInput.value) {
    errorModalMessage.value = "Por favor, ingrese una cédula o pasaporte para buscar.";
    showErrorModal.value = true;
    return;
  }



  try {
    // 📥 Obtener datos del estudiante
    const { data } = await axios.get(`${API}/internal-user/${cedulaInput.value}`);
    
    if (!data || !data.Internal_ID) {
      errorModalMessage.value = "No se encontró ningún estudiante con la cédula o pasaporte ingresado.";
      showErrorModal.value = true;
      return;
    }

    // Verificar que sea un estudiante
    if (data.Internal_Type !== "Estudiante") {
      errorModalMessage.value = "El usuario encontrado no es un estudiante. Solo los estudiantes pueden registrar asistencia manual.";
      showErrorModal.value = true;
      return;
    }

    cedula.value = data.Internal_ID;
    nombres.value = `${data.Internal_Name} ${data.Internal_LastName}`;
    apellidos.value = data.Internal_LastName;
    correo.value = data.Internal_Email;
    area.value = data.Internal_Area || "";

    // 📥 Obtener períodos del estudiante
    const { data: periodosData } = await axios.get(`${API}/usuarioXPeriodo/usuario/${cedula.value}`);
    
    if (!periodosData || periodosData.length === 0) {
      errorModalMessage.value = "Este estudiante no está asignado a ningún período académico. Contacte al administrador.";
      showErrorModal.value = true;
      return;
    }

    const hoy = new Date();
    periodoActual.value = periodosData.find((p: any) => {
      const inicio = new Date(p.period.Period_Start);
      const fin = new Date(p.period.Period_End);
      return hoy >= inicio && hoy <= fin;
    });

    if (!periodoActual.value) {
      errorModalMessage.value = "No se encontró un período académico activo para este estudiante. El registro manual de asistencia no está disponible.";
      showErrorModal.value = true;
      return;
    }

    usuarioXPeriodoId.value = periodoActual.value.UserXPeriod_ID;
    estudianteCargado.value = true;

    // Mostrar mensaje de éxito
    toast.add({
      severity: "success",
      summary: "Estudiante encontrado",
      detail: `${nombres.value} - ${periodoActual.value.period.Period_Name}`,
      life: 3000,
    });

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
  }
};


  const periodoInicio = computed(() => {
  return periodoActual.value ? new Date(periodoActual.value.period.Period_Start) : null;
});
const periodoFin = computed(() => {
  if (!periodoActual.value) return null;

  const rawFin = new Date(periodoActual.value.period.Period_End);
  const day = rawFin.getDay(); // 0: domingo, 6: sábado, 5: viernes, etc.

  // Si cae sábado (6), retrocede 1 día
  // Si cae domingo (0), retrocede 2 días
  if (day === 6) {
    rawFin.setDate(rawFin.getDate() - 1); // pasa al viernes
  } else if (day === 0) {
    rawFin.setDate(rawFin.getDate() - 2); // pasa al viernes
  }

  return rawFin;
});



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
  
const openConfirmDialog = () => {
  // Validar que los campos no estén vacíos
  if (!manualEntrada.value || !manualSalida.value) {
    errorModalMessage.value = "Debe ingresar tanto la hora de entrada como la hora de salida.";
    showErrorModal.value = true;
    return;
  }

  // Validar que el tipo de asistencia esté seleccionado
  if (!attendanceTypeSelected.value) {
    errorModalMessage.value = "Debe seleccionar un tipo de asistencia (Presencial o Virtual).";
    showErrorModal.value = true;
    return;
  }

  // Validar rango de fechas del período
  if (periodoInicio.value && new Date(manualEntrada.value) < periodoInicio.value) {
    const fechaInicio = periodoInicio.value.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    errorModalMessage.value = `La fecha de entrada no puede ser anterior al inicio del período académico (${fechaInicio}).`;
    showErrorModal.value = true;
    return;
  }

  const periodoFinAdjusted = periodoFin.value ? new Date(periodoFin.value) : new Date();
  periodoFinAdjusted.setHours(23, 59, 59, 999);

  if (new Date(manualSalida.value) > periodoFinAdjusted) {
    const fechaFin = periodoFin.value?.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    errorModalMessage.value = `La fecha de salida no puede ser posterior al fin del período académico (${fechaFin}).`;
    showErrorModal.value = true;
    return;
  }

  // Validar que las fechas sean del mismo día
  if (!validarMismoDia(manualEntrada.value, manualSalida.value)) {
    errorModalMessage.value = "La hora de entrada y la hora de salida deben ser del mismo día.";
    showErrorModal.value = true;
    return;
  }

  // Validar que la entrada sea anterior a la salida
  const fechaEntrada = new Date(manualEntrada.value);
  const fechaSalida = new Date(manualSalida.value);
  
  if (fechaEntrada >= fechaSalida) {
    errorModalMessage.value = "La hora de entrada debe ser anterior a la hora de salida.";
    showErrorModal.value = true;
    return;
  }

  // Validar duración mínima y máxima
  const duracionMinutos = (fechaSalida.getTime() - fechaEntrada.getTime()) / (1000 * 60);
  
  if (duracionMinutos < 15) {
    errorModalMessage.value = "La duración mínima entre entrada y salida debe ser de 15 minutos.";
    showErrorModal.value = true;
    return;
  }

  if (duracionMinutos > 18 * 60) { // 18 horas
    errorModalMessage.value = "La duración máxima entre entrada y salida no puede exceder las 18 horas.";
    showErrorModal.value = true;
    return;
  }

  // Validar que no sea una fecha futura
  const ahora = new Date();
  if (fechaSalida > ahora) {
    errorModalMessage.value = "No se puede registrar asistencia para fechas futuras.";
    showErrorModal.value = true;
    return;
  }

  // Validar días hábiles (lunes a viernes)
  const diaSemana = fechaEntrada.getDay();
  if (diaSemana === 0 || diaSemana === 6) {
    errorModalMessage.value = "No se puede registrar asistencia para fines de semana (sábado o domingo).";
    showErrorModal.value = true;
    return;
  }

  // Validar horarios razonables (no antes de 6:00 AM ni después de 10:00 PM)
  const horaEntrada = fechaEntrada.getHours();
  const horaSalida = fechaSalida.getHours();
  
  if (horaEntrada < 6 || horaEntrada > 22) {
    errorModalMessage.value = "La hora de entrada debe estar entre las 6:00 AM y las 10:00 PM.";
    showErrorModal.value = true;
    return;
  }

  if (horaSalida < 6 || horaSalida > 22) {
    errorModalMessage.value = "La hora de salida debe estar entre las 6:00 AM y las 10:00 PM.";
    showErrorModal.value = true;
    return;
  }

  // ✅ Si todas las validaciones pasan, mostrar confirmación
  confirmDialogVisible.value = true;
};

  
  // Función para cancelar la confirmación
  const cancelConfirm = () => {
    confirmDialogVisible.value = false;
  };
  
  // Función para guardar la asistencia manual usando el endpoint especializado
  const confirmGuardarAsistencia = async () => {
  confirmDialogVisible.value = false;

  try {
    const registroData = {
      UserXPeriod_ID: usuarioXPeriodoId.value,
      Attendance_Entry: new Date(manualEntrada.value),
      Attendance_Exit: new Date(manualSalida.value),
      Attendance_Type: attendanceTypeSelected.value,
      Attendance_Comment: null,
      Attendance_Date: new Date(manualEntrada.value),
      Attendance_IsDeleted: false
    };

    // POST con axios
    await axios.post(`${API}/registros/createConResumen`, registroData, {
      headers: {
        "internal-id": authStore.user?.id,
      },
      withCredentials: true
    });

    toast.add({
      severity: "success",
      summary: "Asistencia Registrada",
      detail: "La asistencia manual fue registrada correctamente.",
      life: 3000,
    });

    setTimeout(() => {
      router.push("/AsignacionHuella");
    }, 3000);
    
  } catch (error: any) {
    console.error("Error al guardar la asistencia manual:", error);
    
    // Manejar errores específicos del servidor
    if (error.response) {
      if (error.response.status === 409) {
        errorModalMessage.value = "Ya existe un registro de asistencia para esta fecha y estudiante. No se puede duplicar el registro.";
      } else if (error.response.status === 400) {
        errorModalMessage.value = "Los datos de asistencia son inválidos. Verifique la información ingresada e intente nuevamente.";
      } else if (error.response.status === 403) {
        errorModalMessage.value = "No tienes permisos para registrar asistencia manual. Contacte al administrador.";
      } else if (error.response.status === 422) {
        errorModalMessage.value = "Los datos proporcionados no cumplen con los requisitos del sistema. Verifique las fechas y horarios.";
      } else if (error.response.status === 500) {
        errorModalMessage.value = "Error interno del servidor al guardar la asistencia. Intente nuevamente más tarde.";
      } else {
        errorModalMessage.value = error.response.data?.message || "Error del servidor al guardar la asistencia manual.";
      }
    } else if (error.request) {
      errorModalMessage.value = "Error de conexión al guardar la asistencia. Verifique su conexión a internet e intente nuevamente.";
    } else {
      errorModalMessage.value = error.message || "Error inesperado al guardar la asistencia manual.";
    }
    
    showErrorModal.value = true;
  }
};

  
  // Función para volver a la vista anterior
  const volver = () => {
    router.push("/AsignacionHuella");
  };
  </script>
  
  <style scoped>
  </style>
  