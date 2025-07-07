<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Paginator, { type PageState } from 'primevue/paginator'; 
import { useNotificationStore } from '@/stores/notifications';  
import { API } from "@/ApiRoute";

interface Case {
  Internal_ID: string;
  Init_Code: string;
  Init_Subject: string;
  Init_Type: string;
  Init_Complexity: string;
  assignedTo?: string | null;
  assignedStudentName?: string;
  assignedStudentId?: string | null; 
  Reassignment_Reason?: string | null; 
}

interface Student {
  Internal_ID: string;
  Internal_Name: string;
  Internal_LastName: string;
}

interface AssignedCase {
  Init_Code: string; 
  assignedTo: string; 
}

export default defineComponent({
  name: 'CaseAssign',
  components: {
    Dropdown,
    Textarea,
    Dialog,
    Button,
    TabView,
    TabPanel,
    Paginator // <-- Registra Paginator
  },
  setup() {
    const authStore = useAuthStore();
    const selectedArea = ref<string>(authStore.user?.area || '');
    const loading = ref<boolean>(true);
    const cases = ref<Case[]>([]);
    const students = ref<Student[]>([]);
    const autoAssignLoading = ref<boolean>(false);
    const showNotification = ref<boolean>(false);
    const notificationType = ref<'success' | 'error' | 'info' | 'warning'>('success');
    const notificationIcon = ref<string>('');
    const notificationTitle = ref<string>('');
    const notificationMessage = ref<string>('');
    const filters = ref<{ global: string }>({ global: '' });
    const showReassignModal = ref<boolean>(false);
    const selectedCaseToReassign = ref<Case | null>(null);
    const selectedStudentToReassign = ref<string | null>(null);
    const reassignObservation = ref<string>('');
    const notificationStore = useNotificationStore(); // Store para notificaciones

    // --- ESTADO DE PAGINACIÓN ---
    const rowsPerPage = ref<number>(10); // Número de filas por página
    const pendingFirst = ref<number>(0); // Índice del primer elemento en la página actual (pendientes)
    const assignedFirst = ref<number>(0); // Índice del primer elemento en la página actual (asignados)
    // --- FIN ESTADO DE PAGINACIÓN ---

    // --- FILTROS GLOBALES (antes de paginar) ---
    const filteredPendingCases = computed(() =>
  cases.value.filter(
    (caso) =>
      caso.Init_Type === 'Por Asignar' &&
      (authStore.user?.type === 'Administrador' || authStore.user?.type === 'SuperAdmin' || caso.Init_Subject === selectedArea.value) &&
      (filters.value.global === '' ||
       Object.values(caso).some(val =>
         String(val).toLowerCase().includes(filters.value.global.toLowerCase())
       ))
  )
);

const filteredAssignedCases = computed(() =>
  cases.value.filter(
    (caso) =>
      caso.Init_Type === 'Asignado' &&
      (authStore.user?.type === 'Administrador' || authStore.user?.type === 'SuperAdmin' || caso.Init_Subject === selectedArea.value) &&
      // Aplicar filtro de búsqueda global
      (filters.value.global === '' ||
       Object.values(caso).some(val =>
         String(val).toLowerCase().includes(filters.value.global.toLowerCase())
       ))
  )
);
    // --- FIN FILTROS GLOBALES ---


    // --- PROPIEDADES COMPUTADAS PARA PAGINACIÓN ---
    const paginatedPendingCases = computed(() => {
      const start = pendingFirst.value;
      const end = start + rowsPerPage.value;
      return filteredPendingCases.value.slice(start, end);
    });

    const paginatedAssignedCases = computed(() => {
      const start = assignedFirst.value;
      const end = start + rowsPerPage.value;
      return filteredAssignedCases.value.slice(start, end);
    });
    // --- FIN PROPIEDADES COMPUTADAS PARA PAGINACIÓN ---

    const fetchCases = async (): Promise<void> => {
  loading.value = true; // Iniciar carga al principio
  try {
    const userType = authStore.user?.type;

    let pendingUrl = '';
    let assignedUrl = '';

    if (userType === 'Administrador' || userType === 'SuperAdmin') {
      // URLs generales para Administrador o SuperAdmin
      pendingUrl = `${API}/initial-consultations/review/Por%20Asignar/Activo`;
      assignedUrl = `${API}/initial-consultations/review/Asignado/Activo`;
    } else {
      // URLs específicas para otros usuarios
      if (!authStore.user?.area) {
        console.error("El área del usuario no está definida.");
        notificationMessage.value = 'No se pudo determinar el área del usuario.';
        showNotification.value = true;
        notificationType.value = 'error';
        notificationTitle.value = 'Error de Configuración';
        return;
      }

      const areaEncoded = encodeURIComponent(authStore.user.area);
      pendingUrl = `${API}/initial-consultations/type/${areaEncoded}/Por%20Asignar/Activo`;
      assignedUrl = `${API}/initial-consultations/type/${areaEncoded}/Asignado/Activo`;
    }

    // Realizar peticiones en paralelo
    const [pendingResponse, assignedResponse] = await Promise.all([
      axios.get(pendingUrl),
      axios.get(assignedUrl)
    ]);

    const pendingCases: Case[] = pendingResponse.data || [];
    const assignedCases: Case[] = assignedResponse.data || [];

    // Procesar casos asignados para obtener detalles del estudiante
    const processedAssignedCases = await Promise.all(
      assignedCases.map(async (caso) => {
        try {
          console.log(`Fetching assignment for case: ${caso.Init_Code}`);
          const assignmentResponse = await axios.get(
            `${API}/assignment/student/initcode/${caso.Init_Code}`
          );

          if (typeof assignmentResponse.data === 'string' && assignmentResponse.data) {
            const studentId = assignmentResponse.data;
            caso.assignedStudentId = studentId;
            caso.assignedTo = studentId; // Mantener consistencia

            try {
              const studentResponse = await axios.get(`${API}/internal-user/${studentId}`);
              const studentData = studentResponse.data;
              caso.assignedStudentName = `${studentData.Internal_Name || ''} ${studentData.Internal_LastName || ''}`.trim();
            } catch (studentError: any) {
              console.error(`Error fetching student details for ID ${studentId} (Case ${caso.Init_Code}):`, studentError);
              caso.assignedStudentName = 'Estudiante no encontrado';
            }

          } else {
            console.warn(`No assignment found or unexpected format for case ${caso.Init_Code}. Response:`, assignmentResponse.data);
            caso.assignedStudentName = 'No asignado';
            caso.assignedTo = null;
            caso.assignedStudentId = null;
          }
        } catch (error: any) {
          console.error(`Error fetching assignment/student for case ${caso.Init_Code}:`, error);
          if (error.response && error.response.status === 404) {
            console.warn(`404: No assignment found for case ${caso.Init_Code}`);
            caso.assignedStudentName = 'No asignado';
          } else {
            caso.assignedStudentName = 'Error al cargar';
          }
          caso.assignedTo = null;
          caso.assignedStudentId = null;
        }
        return caso; // Devolver el caso procesado
      })
    );

    // Unir ambos conjuntos de casos en la variable principal
    cases.value = [...pendingCases, ...processedAssignedCases];

  } catch (error: any) {
    console.error("Error fetching cases:", error);
    notificationMessage.value = 'Error al cargar los casos. ' + (error.message || '');
    showNotification.value = true;
    notificationType.value = 'error';
    notificationTitle.value = 'Error de Red';
  } finally {
    loading.value = false;
  }
};

    const fetchStudents = async (): Promise<void> => {
      if (!selectedArea.value) return; // No hacer fetch si no hay área
      try {
        const response = await axios.get(
          `${API}/internal-users/students/${encodeURIComponent(selectedArea.value)}`
        );
        students.value = response.data || [];
      } catch (error) {
        console.error('Error fetching students:', error);
        students.value = []; // Limpiar estudiantes en caso de error
        // Opcional: mostrar notificación de error al cargar estudiantes
      }
    };

    const assignCase = async (caso: Case): Promise<void> => {
      if (!caso.assignedTo) {
        notificationMessage.value = 'Por favor, selecciona un estudiante para asignar el caso.';
        showNotification.value = true;
        notificationType.value = 'error';
        notificationTitle.value = 'Error de Validación';
        return;
      }
      if (!authStore.user?.id) {
         notificationMessage.value = 'No se pudo obtener el ID del usuario para la asignación.';
         showNotification.value = true;
         notificationType.value = 'error';
         notificationTitle.value = 'Error de Autenticación';
         return;
      }

      // Podrías añadir un estado de carga por fila si lo deseas
      // caso.isAssigning = true; // Necesitarías añadir esta propiedad a la interfaz Case

      try {
        const assignmentData = {
          Init_Code: caso.Init_Code,
          Assignment_Date: new Date().toISOString(),
          Internal_User_ID_Student: caso.assignedTo,
          Internal_User_ID: authStore.user.id,
        };

        await axios.post(`${API}/assignment`, assignmentData, {
          headers: { 'internal-id': authStore.user.id },
        });

        const updateData = { Init_Type: 'Asignado' };
        await axios.put(
          `${API}/initial-consultations/${caso.Init_Code}`,
          updateData,
          { headers: { 'internal-id': authStore.user.id } }
        );

        // Find the student's name from the `students` array
        const assignedStudent = students.value.find(student => student.Internal_ID === caso.assignedTo);
        const assignedStudentName = assignedStudent
          ? `${assignedStudent.Internal_Name} ${assignedStudent.Internal_LastName}`
          : 'Estudiante no encontrado';

        // Add a notification to the store
        notificationStore.addNotification({
          id: Date.now(), // Unique ID for the notification
          mensaje: `El caso ${caso.Init_Code} te ha sido asignado.`,
          fecha: new Date().toISOString(),
          leida: false,
          userId: caso.assignedTo,
        });

        showNotification.value = true;
        notificationType.value = 'success';
        notificationTitle.value = 'Asignación exitosa';
        notificationMessage.value = `El caso ${caso.Init_Code} ha sido asignado correctamente.`;

        // Optimización: Mover el caso de pendiente a asignado localmente antes de recargar
        // O simplemente recargar todo con fetchCases
        await fetchCases(); // Recarga los datos para reflejar el cambio

      } catch (error: any) {
        console.error('Error al asignar el caso:', error);
        let errorMessage = 'No se pudo asignar el caso.';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        showNotification.value = true;
        notificationType.value = 'error';
        notificationTitle.value = 'Error en la asignación';
        notificationMessage.value = errorMessage;
      } finally {
        // caso.isAssigning = false; // Finalizar estado de carga por fila
      }
    };

    const autoAssignAllCases = async (): Promise<void> => {
  if (!selectedArea.value) {
    notificationMessage.value = 'No se ha seleccionado un área para la asignación automática.';
    showNotification.value = true;
    notificationType.value = 'error';
    notificationTitle.value = 'Error';
    return;
  }
  if (!authStore.user?.id) {
    notificationMessage.value = 'No se pudo obtener el ID del usuario para la asignación.';
    showNotification.value = true;
    notificationType.value = 'error';
    notificationTitle.value = 'Error de Autenticación';
    return;
  }

  autoAssignLoading.value = true;
  try {
    const response = await axios.post(
      `${API}/assignment/assign-pending-by-area`,
      { area: selectedArea.value },
      { headers: { 'internal-id': authStore.user.id } }
    );

    // Verifica que assignedCases exista y sea un array antes de usar forEach
    if (response.data && Array.isArray(response.data.assignedCases)) {
      response.data.assignedCases.forEach((assignedCase: AssignedCase) => {
        notificationStore.addNotification({
          id: Date.now(),
          mensaje: `El caso ${assignedCase.Init_Code} ha sido asignado automáticamente.`,
          fecha: new Date().toISOString(),
          leida: false,
          userId: assignedCase.assignedTo, // Associate with the assigned student's ID
        });
      });
    } else {
      console.warn('La respuesta de asignación automática no contiene assignedCases:', response.data);
    }

    showNotification.value = true;
    notificationType.value = 'success';
    notificationTitle.value = 'Asignación Automática Iniciada';
    notificationMessage.value = response.data.message || `Se inició la asignación automática para el área ${selectedArea.value}. Los casos se actualizarán en breve.`;

    setTimeout(() => {
      fetchCases();
    }, 2000);

  } catch (error: any) {
    console.error('Error en la asignación automática:', error);
    let errorMessage = 'Ocurrió un error al intentar asignar los casos automáticamente.';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    showNotification.value = true;
    notificationType.value = 'error';
    notificationTitle.value = 'Error en Asignación Automática';
    notificationMessage.value = errorMessage;
  } finally {
    autoAssignLoading.value = false;
  }
};

    const openReassignModal = (caso: Case): void => {
      selectedCaseToReassign.value = { ...caso }; // Copiar el objeto para evitar mutaciones directas
      selectedStudentToReassign.value = caso.assignedStudentId || null; // Preseleccionar estudiante actual si existe
      reassignObservation.value = ''; // Limpiar observación
      showReassignModal.value = true;
    };

    // --- NUEVA FUNCIÓN PARA CONFIRMAR REASIGNACIÓN ---
    const confirmReassign = async (): Promise<void> => {
        // --- VALIDACIONES (sin cambios) ---
        if (!selectedCaseToReassign.value || !selectedStudentToReassign.value) {
            notificationMessage.value = 'Faltan datos para la reasignación (caso o estudiante).';
            showNotification.value = true; notificationType.value = 'error'; notificationTitle.value = 'Error de Validación';
            return;
        }
        if (!selectedCaseToReassign.value.Init_Code) {
            notificationMessage.value = 'No se pudo encontrar el Código del Caso para reasignar.';
            showNotification.value = true; notificationType.value = 'error'; notificationTitle.value = 'Error de Datos';
            return;
        }
        if (!authStore.user?.id) {
            notificationMessage.value = 'No se pudo obtener el ID del usuario para la reasignación.';
            showNotification.value = true; notificationType.value = 'error'; notificationTitle.value = 'Error de Autenticación';
            return;
        }

        // const reassignLoading = ref(false); // Opcional

        try {
            const initCode = selectedCaseToReassign.value.Init_Code;

            // --- Payload para la API PUT /assignment/initcode/:initCode ---
            // --- CAMBIO AQUÍ: Cambiar la clave del ID del estudiante ---
            const updateData = {
                Internal_User_ID_Student: selectedStudentToReassign.value, // Clave corregida para coincidir con el backend/DB
                Reassignment_Reason: reassignObservation.value || null, // Motivo (esta clave ya era correcta)
                // Internal_User_ID: authStore.user.id, // ID del usuario que reasigna (si la API lo necesita en el body)
            };
            // --- FIN CAMBIO ---

            console.log(`Datos enviados a PUT /assignment/initcode/${initCode}:`, updateData);

            // --- Llamada a la API (sin cambios en URL o método) ---
            await axios.put(
                `${API}/assignment/initcode/${initCode}`,
                updateData, // Ahora envía la clave correcta
                {
                    headers: { 'internal-id': authStore.user.id },
                }
            );
            // Find the new student's name
            const reassignedStudent = students.value.find(student => student.Internal_ID === selectedStudentToReassign.value);
            const reassignedStudentName = reassignedStudent
              ? `${reassignedStudent.Internal_Name} ${reassignedStudent.Internal_LastName}`
              : 'Estudiante no encontrado';

            // Add a notification for the reassignment
            notificationStore.addNotification({
              id: Date.now(),
              mensaje: `El caso ${initCode} ha sido reasignado a ${reassignedStudentName}.`,
              fecha: new Date().toISOString(),
              leida: false,
              userId: selectedStudentToReassign.value, // ID del nuevo estudiante asignado
            });

            // --- Notificaciones y recarga (sin cambios) ---
            showNotification.value = true;
            notificationType.value = 'success';
            notificationTitle.value = 'Reasignación Exitosa';
            notificationMessage.value = `El caso ${initCode} ha sido reasignado correctamente.`;

            showReassignModal.value = false;
            await fetchCases();

        } catch (error: any) {
            console.error(`Error al reasignar el caso con Init_Code ${selectedCaseToReassign.value.Init_Code}:`, error);
            let errorMessage = 'No se pudo reasignar el caso.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            showNotification.value = true;
            notificationType.value = 'error';
            notificationTitle.value = 'Error en la Reasignación';
            notificationMessage.value = errorMessage;
        } finally {
            // reassignLoading.value = false; // Opcional
        }
    };
    // --- FIN NUEVA FUNCIÓN ---


    const closeNotification = (): void => {
      showNotification.value = false;
    };

    // --- MANEJADORES DE CAMBIO DE PÁGINA ---
    const onPendingPageChange = (event: PageState) => {
      pendingFirst.value = event.first;
      rowsPerPage.value = event.rows; // Actualiza si permites cambiar filas por página
    };

    const onAssignedPageChange = (event: PageState) => {
      assignedFirst.value = event.first;
      rowsPerPage.value = event.rows; // Actualiza si permites cambiar filas por página
    };
    // --- FIN MANEJADORES DE CAMBIO DE PÁGINA ---

    onMounted(() => {
      fetchCases();
      fetchStudents(); // Carga inicial de estudiantes basada en el área del usuario
    });

    // Observar cambios en el área seleccionada (si permites cambiarla)
    // O si el área del usuario puede cambiar dinámicamente
    watch(selectedArea, (newArea, oldArea) => {
      if (newArea !== oldArea) {
        console.log(`Área cambiada a: ${newArea}. Recargando estudiantes y casos...`);
        // Reiniciar paginación y filtros al cambiar de área
        pendingFirst.value = 0;
        assignedFirst.value = 0;
        filters.value.global = ''; // Limpiar búsqueda global
        fetchStudents(); // Recargar estudiantes para la nueva área
        fetchCases(); // Recargar casos para la nueva área
      }
    });

     // Observar cambios en el filtro global para reiniciar paginación
    watch(filters, () => {
        pendingFirst.value = 0;
        assignedFirst.value = 0;
    }, { deep: true }); // Usar deep watch para objetos

    return {
      authStore, // Exponer para depuración o uso futuro si es necesario
      selectedArea,
      loading,
      autoAssignLoading,
      cases, // Puede ser útil para depuración, pero no se usa directamente en el template
      students,
      filteredPendingCases, // Necesario para totalRecords del paginador de pendientes
      filteredAssignedCases, // Necesario para totalRecords del paginador de asignados
      paginatedPendingCases, // Usar este en el v-for de pendientes
      paginatedAssignedCases, // Usar este en el v-for de asignados
      showNotification,
      notificationType,
      notificationIcon, // Asegúrate de asignar iconos si los usas
      notificationTitle,
      notificationMessage,
      filters,
      assignCase,
      showReassignModal,
      selectedCaseToReassign,
      selectedStudentToReassign,
      reassignObservation,
      openReassignModal,
      confirmReassign, // <-- Retornar la función de confirmar reasignación
      closeNotification,
      autoAssignAllCases,
      // Paginación
      rowsPerPage,
      pendingFirst,
      assignedFirst,
      onPendingPageChange,
      onAssignedPageChange,
    };
  },
});
</script>


<template>
  <div class="container mx-auto p-4">
    <div class="mb-4 flex items-center gap-4">
      <div class="relative">
        <i class="pi pi-search absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
        <input
          type="text"
          v-model="filters.global"
          class="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Buscar caso..."
        />
      </div>

      <!-- Botón de asignación automática actualizado -->
      <Button
        label="Asignar automáticamente todos los casos"
        icon="pi pi-bolt"
        class="p-button-success ml-auto"
        @click="autoAssignAllCases"
        :loading="autoAssignLoading"
        :disabled="autoAssignLoading || filteredPendingCases.length === 0"
      />

    </div>

    <TabView>
      <TabPanel header="Casos por Asignar" :value="'casosPorAsignar'">
        <div class="border border-gray-300 rounded-md overflow-hidden">
          <!-- Cabecera de la tabla -->
          <div class="bg-gray-100 font-semibold text-gray-700 flex">
            <div class="w-1/12 p-2">#</div>
            <div class="w-2/12 p-2">Código de Caso</div>
            <div class="w-3/12 p-2">Área</div>
            <div class="w-2/12 p-2">Estado</div>
            <div class="w-2/12 p-2">Complejidad</div>
            <div class="w-2/12 p-2">Asignar a</div>
            <div class="w-2/12 p-2 text-center">Acciones</div>
          </div>

          <!-- Estado de carga -->
          <div v-if="loading" class="flex flex-col items-center justify-center p-8 text-gray-500">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
            <span>Cargando casos...</span>
          </div>

          <!-- Mensaje si no hay casos filtrados (antes de paginar) -->
          <div v-else-if="filteredPendingCases.length === 0" class="p-8 text-center text-gray-500">
            No se encontraron casos para asignar que coincidan con los filtros.
          </div>

          <!-- Iterar sobre los casos paginados -->
          <div v-else>
            <div
              v-for="(caso, index) in paginatedPendingCases"
              :key="caso.Internal_ID"
              class="flex border-b border-gray-300 even:bg-gray-50 items-center"
            >
              <!-- Calcular número de fila correcto para la paginación -->
              <div class="w-1/12 p-2">{{ pendingFirst + index + 1 }}</div>
              <div class="w-2/12 p-2">{{ caso.Init_Code }}</div>
              <div class="w-3/12 p-2">{{ caso.Init_Subject }}</div>
              <div class="w-2/12 p-2">{{ caso.Init_Type }}</div>
              <div class="w-2/12 p-2">{{ caso.Init_Complexity }}</div>
              <div class="w-2/12 p-2">
                <!-- Dropdown para seleccionar estudiante -->
                <Dropdown
                  v-model="caso.assignedTo"
                  :options="students"
                  optionLabel="Internal_Name"
                  optionValue="Internal_ID"
                  placeholder="Seleccionar"
                  class="w-full text-sm"
                  scrollHeight="150px"
                >
                  <template #option="slotProps">
                    {{ slotProps.option.Internal_Name }} {{ slotProps.option.Internal_LastName }}
                  </template>
                  <template #value="slotProps">
                     <div v-if="slotProps.value">
                        {{ students.find(s => s.Internal_ID === slotProps.value)?.Internal_Name }}
                        {{ students.find(s => s.Internal_ID === slotProps.value)?.Internal_LastName }}
                     </div>
                     <span v-else class="text-gray-500 text-xs">
                        {{ slotProps.placeholder }}
                     </span>
                   </template>
                </Dropdown>
              </div>
              <div class="w-2/12 p-2 flex justify-center">
                <!-- Botón para asignar -->
                <Button
                  icon="pi pi-check"
                  class="p-button-sm p-button-success"
                  @click="assignCase(caso)"
                  :disabled="!caso.assignedTo"
                  v-tooltip.top="'Asignar caso'"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- Paginador para casos pendientes -->
        <Paginator
          v-if="filteredPendingCases.length > rowsPerPage"
          :rows="rowsPerPage"
          :totalRecords="filteredPendingCases.length"
          :first="pendingFirst"
          @page="onPendingPageChange($event)"
          class="mt-4"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} casos por asignar"
        />
      </TabPanel>

      <TabPanel header="Casos Asignados" :value="'casosAsignados'">
        <div class="border border-gray-300 rounded-md overflow-hidden">
          <!-- Cabecera de la tabla -->
          <div class="bg-gray-100 font-semibold text-gray-700 flex">
            <div class="w-1/12 p-2">#</div>
            <div class="w-2/12 p-2">Código de Caso</div>
            <div class="w-3/12 p-2">Área</div>
            <div class="w-2/12 p-2">Estado</div>
            <div class="w-2/12 p-2">Complejidad</div>
            <div class="w-2/12 p-2">Asignado a</div>
            <div class="w-2/12 p-2 text-center">Acciones</div>
          </div>

          <!-- Estado de carga -->
          <div v-if="loading" class="flex flex-col items-center justify-center p-8 text-gray-500">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
            <span>Cargando casos...</span>
          </div>

          <!-- Mensaje si no hay casos filtrados (antes de paginar) -->
          <div v-else-if="filteredAssignedCases.length === 0" class="p-8 text-center text-gray-500">
            No se encontraron casos asignados que coincidan con los filtros.
          </div>

          <!-- Iterar sobre los casos paginados -->
          <div v-else>
            <div
              v-for="(caso, index) in paginatedAssignedCases"
              :key="caso.Internal_ID"
              class="flex border-b border-gray-300 even:bg-gray-50 items-center"
            >
              <!-- Calcular número de fila correcto para la paginación -->
              <div class="w-1/12 p-2">{{ assignedFirst + index + 1 }}</div>
              <div class="w-2/12 p-2">{{ caso.Init_Code }}</div>
              <div class="w-3/12 p-2">{{ caso.Init_Subject }}</div>
              <div class="w-2/12 p-2">{{ caso.Init_Type }}</div>
              <div class="w-2/12 p-2">{{ caso.Init_Complexity }}</div>
              <div class="w-2/12 p-2">{{ caso.assignedStudentName || 'No disponible' }}</div>
              <div class="w-2/12 p-2 flex justify-center">
                <!-- Botón para reasignar -->
                <Button
                  icon="pi pi-user-edit"
                  class="p-button-sm p-button-warning"
                  @click="openReassignModal(caso)"
                  v-tooltip.top="'Reasignar caso'"
                />
              </div>
            </div>
          </div>
        </div>
         <!-- Paginador para casos asignados -->
         <Paginator
          v-if="filteredAssignedCases.length > rowsPerPage"
          :rows="rowsPerPage"
          :totalRecords="filteredAssignedCases.length"
          :first="assignedFirst"
          @page="onAssignedPageChange($event)"
          class="mt-4"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        />
      </TabPanel>
    </TabView>

    <!-- Notification Toast (sin cambios) -->
    <div
  v-if="showNotification"
  class="fixed top-6 right-6 z-50 max-w-sm bg-white shadow-lg rounded-lg p-4 border-l-4"
  :class="{
    'border-green-500': notificationType === 'success',
    'border-red-500': notificationType === 'error',
    'border-blue-500': notificationType === 'info',
    'border-yellow-500': notificationType === 'warning'
  }"
  role="alert"
>
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 text-xl">
          <i v-if="notificationType === 'success'" class="pi pi-check-circle text-green-500"></i>
          <i v-else-if="notificationType === 'error'" class="pi pi-times-circle text-red-500"></i>
          <i v-else-if="notificationType === 'info'" class="pi pi-info-circle text-blue-500"></i>
          <i v-else-if="notificationType === 'warning'" class="pi pi-exclamation-triangle text-yellow-500"></i>
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-gray-800">{{ notificationTitle }}</h3>
          <p class="text-sm text-gray-600">{{ notificationMessage }}</p>
        </div>
        <button @click="closeNotification" class="ml-2 -mt-1 -mr-1 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300">
          <span class="sr-only">Cerrar</span>
          <i class="pi pi-times text-sm"></i>
        </button>
      </div>
    </div>


    <!-- Dialog de Reasignación -->
    <Dialog v-model:visible="showReassignModal" modal header="Reasignar Caso" :style="{ width: '30rem' }">
      <div class="p-4">
        <p class="mb-4 text-gray-700">
          Selecciona un nuevo estudiante para reasignar el caso
          <strong v-if="selectedCaseToReassign"> {{ selectedCaseToReassign.Init_Code }}</strong>.
        </p>

        <Dropdown
          v-model="selectedStudentToReassign"
          :options="students"
          optionLabel="Internal_Name"
          optionValue="Internal_ID"
          placeholder="Seleccionar estudiante"
          class="w-full mb-4"
          filter  
          showClear 
        >
          <template #option="slotProps">
            {{ slotProps.option.Internal_Name }} {{ slotProps.option.Internal_LastName }}
          </template>
           <!-- Template para mostrar el valor seleccionado -->
           <template #value="slotProps">
             <div v-if="slotProps.value">
                {{ students.find(s => s.Internal_ID === slotProps.value)?.Internal_Name }}
                {{ students.find(s => s.Internal_ID === slotProps.value)?.Internal_LastName }}
             </div>
             <span v-else class="text-gray-500">
                {{ slotProps.placeholder }}
             </span>
           </template>
        </Dropdown>

        <Textarea v-model="reassignObservation" placeholder="Motivo de la reasignación (opcional)..." class="w-full mb-4" rows="3"/>

        <div class="flex justify-end gap-2 mt-4">
          <Button label="Cancelar" @click="showReassignModal = false" class="p-button-text p-button-secondary"/>
          <!-- Botón Confirmar llama a confirmReassign -->
          <Button
            label="Confirmar Reasignación"
            @click="confirmReassign"
            :disabled="!selectedStudentToReassign || selectedStudentToReassign === selectedCaseToReassign?.assignedStudentId"
            class="p-button-warning"
            icon="pi pi-check"
          />
          <!-- Deshabilitado si no hay estudiante seleccionado o es el mismo que ya está asignado -->
        </div>
      </div>
    </Dialog>

  </div>
</template>
