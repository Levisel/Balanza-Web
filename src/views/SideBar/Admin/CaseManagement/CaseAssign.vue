<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth'; // Asegúrate de que la ruta sea correcta
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

interface Case {
  Internal_ID: string;
  Init_Code: string;
  Init_Subject: string;
  Init_Type: string;
  Init_Complexity: string;
  assignedTo?: string;
  assignedStudentName?: string; // Nuevo campo para el nombre del estudiante
  assignedStudentId?: string; // Nuevo campo para almacenar el id del estudiante
}

interface Student {
  Internal_ID: string;
  Internal_Name: string;
  Internal_LastName: string;
}

export default defineComponent({
  name: 'CaseAssign',
  components: {
    Dropdown,
    Textarea,
    Dialog,
    Button,
    TabView,
    TabPanel
  },
  setup() {
    const authStore = useAuthStore();
    const selectedArea = ref<string>(authStore.user?.area || '');
    const loading = ref<boolean>(true);
    const cases = ref<Case[]>([]);
    const students = ref<Student[]>([]);
    const showNotification = ref<boolean>(false);
    const notificationType = ref<'success' | 'error'>('');
    const notificationIcon = ref<string>('');
    const notificationTitle = ref<string>('');
    const notificationMessage = ref<string>('');
    const filters = ref<{ global: string }>({ global: '' });
    const showReassignModal = ref<boolean>(false);
    const selectedCaseToReassign = ref<Case | null>(null);
    const selectedStudentToReassign = ref<string | null>(null);
    const reassignObservation = ref<string>('');

    const filteredPendingCases = computed(() =>
      cases.value.filter(
        (caso) =>
          caso.Init_Type === 'Por Asignar' &&
          (selectedArea.value === '' || caso.Init_Subject === selectedArea.value)
      )
    );

    const filteredAssignedCases = computed(() =>
      cases.value.filter(
        (caso) =>
          caso.Init_Type === 'Asignado' &&
          (selectedArea.value === '' || caso.Init_Subject === selectedArea.value)
      )
    );

    const fetchCases = async (): Promise<void> => {
      try {
        if (!authStore.user?.area) {
          console.error("El área del usuario no está definida.");
          return;
        }

        // Obtener casos por asignar
        const pendingResponse = await axios.get(
          `http://localhost:3000/initial-consultations/type/${authStore.user.area}/Por%20Asignar/Activo`
        );
        const pendingCases = pendingResponse.data;

        // Obtener casos asignados
        const assignedResponse = await axios.get(
          `http://localhost:3000/initial-consultations/type/${authStore.user.area}/Asignado/Activo`
        );
        const assignedCases = assignedResponse.data;

        // Unir ambos conjuntos de casos en la variable principal
        cases.value = [...pendingCases, ...assignedCases];

        // Obtener los nombres de los estudiantes asignados para los casos asignados
        await Promise.all(
          cases.value.map(async (caso) => {
            if (caso.Init_Type === 'Asignado') {
              try {
                console.log(`Fetching assignment for case: ${caso.Init_Code}`);
                const assignmentResponse = await axios.get(
                  `http://localhost:3000/assignment/student/initcode/${caso.Init_Code}`
                );

                // Check if the response is a string
                if (typeof assignmentResponse.data === 'string') {
                  caso.assignedStudentId = assignmentResponse.data; // Store the ID directly
                  console.log(`Assigned student ID for case ${caso.Init_Code}: ${caso.assignedStudentId}`);
                  caso.assignedTo = caso.assignedStudentId; // Actualizar el assignedTo con el ID del estudiante

                  const studentResponse = await axios.get(
                    `http://localhost:3000/internal-user/${caso.assignedStudentId}` // Use assignedStudentId here
                  );
                  const studentData = studentResponse.data;
                  caso.assignedStudentName = `${studentData.Internal_Name} ${studentData.Internal_LastName}`;
                } else {
                  console.warn(`No assignment found for case ${caso.Init_Code} or unexpected response format`);
                  caso.assignedStudentName = 'No asignado';
                  caso.assignedTo = null;
                  caso.assignedStudentId = null;
                }
              } catch (error: any) {
                console.error(`Error fetching assigned student for case ${caso.Init_Code}:`, error);
                if (error.response && error.response.status === 404) {
                  console.warn(`404 error: No assignment found for case ${caso.Init_Code}`);
                  caso.assignedStudentName = 'No asignado';
                  caso.assignedTo = null;
                  caso.assignedStudentId = null;
                } else {
                  caso.assignedStudentName = 'Error al cargar';
                  caso.assignedTo = null;
                  caso.assignedStudentId = null;
                }
              }
            }
          })
        );
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        loading.value = false;
      }
    };

    const fetchStudents = async (): Promise<void> => {
      try {
        const response = await axios.get(
          `http://localhost:3000/internal-users/students/${selectedArea.value}`
        );
        students.value = response.data;
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    const assignCase = async (caso: Case): Promise<void> => {
      if (!caso.assignedTo) {
        console.error('No se ha seleccionado un estudiante para asignar.');
        return;
      }

      try {
        // Crear el registro en la tabla de asignaciones
        const assignmentData = {
          Init_Code: caso.Init_Code,
          Assignment_Date: new Date().toISOString(),
          Internal_User_ID_Student: caso.assignedTo, // Usar directamente el ID del estudiante
          Internal_User_ID: authStore.user?.id, // ID del usuario logueado
        };

        console.log('Datos enviados a la API (asignación):', assignmentData);

        // Enviar la solicitud para crear la asignación
        await axios.post('http://localhost:3000/assignment', assignmentData, {
          headers: {
            'internal-id': authStore.user?.id, // ID del usuario logueado
          },
        });

        // Actualizar el Init_Type del caso a "Asignado"
        const updateData = { Init_Type: 'Asignado' };
        console.log('Datos enviados a la API (actualización):', updateData);

        await axios.put(
          `http://localhost:3000/initial-consultations/${caso.Init_Code}`,
          updateData,
          {
            headers: {
              'internal-id': authStore.user?.id, // ID del usuario logueado
            },
          }
        );

        // Notificación de éxito
        showNotification.value = true;
        notificationType.value = 'success';
        notificationTitle.value = 'Asignación exitosa';
        notificationMessage.value = `El caso ${caso.Init_Code} ha sido asignado correctamente.`;

        // Actualizar la lista de casos
        await fetchCases();
      } catch (error: any) {
        if (error.response) {
          console.error('Error del servidor:', error.response.data);
          notificationMessage.value = error.response.data.message || 'Error desconocido en el servidor.';
        } else {
          console.error('Error al asignar el caso:', error);
          notificationMessage.value = 'No se pudo asignar el caso. Inténtalo nuevamente.';
        }

        // Notificación de error
        showNotification.value = true;
        notificationType.value = 'error';
        notificationTitle.value = 'Error en la asignación';
      }
    };

    const openReassignModal = (caso: Case): void => {
  console.log("Abriendo modal para el caso:", caso);
  selectedCaseToReassign.value = caso;
  selectedStudentToReassign.value = null;
  reassignObservation.value = '';
  showReassignModal.value = true;
  console.log("Valor de showReassignModal:", showReassignModal.value);
};

    const closeNotification = (): void => {
      showNotification.value = false;
    };

    onMounted(() => {
      fetchCases();
      fetchStudents();
    });

    watch(selectedArea, () => {
      fetchStudents();
    });

    return {
      selectedArea,
      loading,
      cases,
      students,
      filteredPendingCases,
      filteredAssignedCases,
      showNotification,
      notificationType,
      notificationIcon,
      notificationTitle,
      notificationMessage,
      filters,
      assignCase,
      showReassignModal,
      selectedStudentToReassign,
      closeNotification,
      openReassignModal,
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
    </div>

    <TabView>
      <TabPanel header="Casos por Asignar">
        <div class="border border-gray-300 rounded-md overflow-hidden">
          <div class="bg-gray-100 font-semibold text-gray-700 flex">
            <div class="w-1/12 p-2">#</div>
            <div class="w-2/12 p-2">Código de Caso</div>
            <div class="w-3/12 p-2">Área</div>
            <div class="w-2/12 p-2">Estado</div>
            <div class="w-2/12 p-2">Complejidad</div>
            <div class="w-2/12 p-2">Asignar a</div>
            <div class="w-2/12 p-2">Acciones</div>
          </div>

          <div v-if="loading" class="flex flex-col items-center justify-center p-8 text-gray-500">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
            <span>Cargando casos...</span>
          </div>

          <div v-else-if="filteredPendingCases.length === 0" class="p-8 text-center text-gray-500">
            No se encontraron casos para asignar.
          </div>

          <div v-else>
            <div
              v-for="(caso, index) in filteredPendingCases"
              :key="caso.Internal_ID"
              class="flex border-b border-gray-300 even:bg-gray-50"
            >
              <div class="w-1/12 p-2">{{ index + 1 }}</div>
              <div class="w-2/12 p-2">{{ caso.Init_Code }}</div>
              <div class="w-3/12 p-2">{{ caso.Init_Subject }}</div>
              <div class="w-2/12 p-2">{{ caso.Init_Type }}</div>
              <div class="w-2/12 p-2">{{ caso.Init_Complexity }}</div>
              <div class="w-2/12 p-2">
                <select
                  v-model="caso.assignedTo"
                  class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar estudiante</option>
                  <option
                    v-for="student in students"
                    :key="student.Internal_ID"
                    :value="student.Internal_ID"
                  >
                    {{ student.Internal_Name }} {{ student.Internal_LastName }}
                  </option>
                </select>
              </div>
              <div class="w-2/12 p-2 flex justify-center">
                <button
                  @click="assignCase(caso)"
                  class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  :disabled="!caso.assignedTo"
                >
                  Asignar
                </button>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      <TabPanel header="Casos Asignados">
        <div class="border border-gray-300 rounded-md overflow-hidden">
          <div class="bg-gray-100 font-semibold text-gray-700 flex">
            <div class="w-1/12 p-2">#</div>
            <div class="w-2/12 p-2">Código de Caso</div>
            <div class="w-3/12 p-2">Área</div>
            <div class="w-2/12 p-2">Estado</div>
            <div class="w-2/12 p-2">Complejidad</div>
            <div class="w-2/12 p-2">Asignado a</div>
            <div class="w-2/12 p-2">Acciones</div>
          </div>

          <div v-if="loading" class="flex flex-col items-center justify-center p-8 text-gray-500">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
            <span>Cargando casos...</span>
          </div>

          <div v-else-if="filteredAssignedCases.length === 0" class="p-8 text-center text-gray-500">
            No se encontraron casos asignados.
          </div>

          <div v-else>
            <div
              v-for="(caso, index) in filteredAssignedCases"
              :key="caso.Internal_ID"
              class="flex border-b border-gray-300 even:bg-gray-50"
            >
              <div class="w-1/12 p-2">{{ index + 1 }}</div>
              <div class="w-2/12 p-2">{{ caso.Init_Code }}</div>
              <div class="w-3/12 p-2">{{ caso.Init_Subject }}</div>
              <div class="w-2/12 p-2">{{ caso.Init_Type }}</div>
              <div class="w-2/12 p-2">{{ caso.Init_Complexity }}</div>
              <div class="w-2/12 p-2">{{ caso.assignedStudentName || 'Cargando...' }}</div>
              <div class="w-2/12 p-2 flex justify-center">
                <button
                  @click="openReassignModal(caso)"
                  class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
                >
                  Reasignar
                </button>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
    </TabView>

    <!-- Notification Toast -->
    <div
      v-if="showNotification"
      class="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-white shadow-lg rounded-md p-4 flex items-center gap-4"
      :class="notificationType === 'success' ? 'border-green-500' : 'border-red-500'"
    >
      <i :class="notificationIcon" class="text-xl"></i>
      <div>
        <h3 class="font-semibold">{{ notificationTitle }}</h3>
        <p>{{ notificationMessage }}</p>
      </div>
      <button @click="closeNotification" class="ml-auto text-gray-500 hover:text-gray-700">
        <i class="pi pi-times"></i>
      </button>
    </div>

    <Dialog v-model:visible="showReassignModal" modal header="Reasignar Caso" :style="{ width: '30rem' }">
  <div class="p-4">
    <p class="mb-4 text-gray-700">Selecciona un nuevo estudiante para reasignar el caso<strong>{{ selectedCaseToReassign?.Init_Code }}</strong>.</p>
    
    <Dropdown
      v-model="selectedStudentToReassign"
      :options="students"
      optionLabel="Internal_Name"
      optionValue="Internal_ID"
      placeholder="Seleccionar estudiante"
      class="w-full mb-4"
    >
      <template #option="slotProps">
        {{ slotProps.option.Internal_Name }} {{ slotProps.option.Internal_LastName }}
      </template>
    </Dropdown>

    <Textarea v-model="reassignObservation" placeholder="Motivo de la reasignación..." class="w-full mb-4" rows="3"/>

    <div class="flex justify-end gap-2">
      <Button label="Cancelar" @click="showReassignModal = false" class="p-button-secondary"/>
      <Button label="Confirmar Reasignación" :disabled="!selectedStudentToReassign" class="p-button-warning"/>
    </div>
  </div>
</Dialog>

  </div>
</template>
