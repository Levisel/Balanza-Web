<!-- SocialWorkCases.vue -->
<template>
  <div class="container mx-auto px-4">
    <!-- Search Bar -->
    <div class="mb-6 flex items-center space-x-4">
      <input 
        type="text" 
        v-model="searchName" 
        placeholder="Buscar por Nombre" 
        class="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input 
        type="text" 
        v-model="searchCedula" 
        placeholder="Buscar por Documento de Identidad" 
        class="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Case Status Tabs -->
    <div class="mb-6 flex flex-wrap gap-2">
      <button 
        v-for="status in availableCaseStatuses"
        :key="status.Case_Status_Id"
        @click="currentStatus = status.Case_Status_Name"
        :class="[
          'px-4 py-2 rounded-lg transition-colors',
          currentStatus === status.Case_Status_Name 
            ? 'bg-[#164284] text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        {{ status.Case_Status_Name }}
      </button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>

    <!-- Error Message -->
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
      <p>{{ error }}</p>
      <button @click="fetchData" class="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
        Reintentar
      </button>
    </div>

    <!-- Case Boxes -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="caso in filteredCases" 
        :key="caso.User_ID"
        class="bg-white shadow-md rounded-lg p-6 relative"
      >
        <!-- Case Details -->
        <div @click="openCase(caso)" class="cursor-pointer">
          <h3 class="text-lg font-semibold mb-2">{{ caso.User_FirstName }} {{ caso.User_LastName }}</h3>
          <p class="text-gray-600">Documento de Identidad: {{ caso.User_ID || 'No disponible' }}</p>
          <p class="text-gray-500">Estado: {{ caso.SW_Status }}</p>
          <!-- Add this line to debug SW_ProcessNumber -->
          <p class="text-xs text-gray-400">ID Proceso: {{ caso.SW_ProcessNumber || 'No disponible' }}</p>
        </div>

        <!-- Status Change Dropdown -->
        <div class="mt-4">
          <select 
            v-model="caso.newStatus" 
            @change="confirmStatusChange(caso)"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Cambiar Status</option>
            <option 
              v-for="status in getAvailableStatuses(caso.SW_Status)" 
              :key="status.Case_Status_Id" 
              :value="status.Case_Status_Name"
            >
              {{ status.Case_Status_Name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && filteredCases.length === 0" class="text-center py-10">
      <p class="text-gray-500 text-lg">No se encontraron casos con los filtros actuales.</p>
    </div>

    <!-- Confirmation Dialog -->
    <div 
      v-if="showConfirmDialog" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 class="text-xl font-bold mb-4">Confirmar Cambio</h2>
        <p class="mb-4">
          ¿Estás seguro de cambiar el estado del caso
          para {{ pendingStatusChange?.User_FirstName }} {{ pendingStatusChange?.User_LastName }} de
          {{ pendingStatusChange?.SW_Status }} a
          {{ pendingStatusChange?.newStatus }}?
        </p>
        <div class="mb-4">
          <label for="statusObservations" class="block text-gray-700 font-medium mb-2">
            Observaciones del Cambio de Estado <span class="text-red-500">*</span>
          </label>
          <textarea 
            id="statusObservations"
            v-model="statusObservations"
            rows="4"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Escriba las observaciones del cambio de estado..."
          ></textarea>
        </div>
        <div class="flex justify-end space-x-4">
          <button 
            @click="cancelStatusChange"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button 
            @click="confirmStatusChangeAction"
            :disabled="!statusObservations"
            class="px-4 py-2 bg-[#164284] text-white rounded-lg hover:bg-blue-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

// Define interfaces
interface SocialWorkCase {
  User_ID: string;
  User_FirstName: string;
  User_LastName: string;
  Init_Code: string | null;
  SW_ProcessNumber: string | null;
  SW_Status: string;
  SW_Status_Observations?: string;
  newStatus?: string;
}

interface CaseStatus {
  Case_Status_Id: number;
  Case_Status_Name: string;
  Case_Status_Status: boolean; // Changed from number to boolean
}

interface User {
  User_ID: string;
  User_FirstName: string;
  User_LastName: string;
  Initial_Consultations?: InitialConsultation[];
}

interface InitialConsultation {
  Init_Code: string;
  SocialWork?: SocialWork;
}

interface SocialWork {
  SW_ProcessNumber: string;
  SW_Status: string;
}

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// State variables
const casos = ref<SocialWorkCase[]>([]);
const caseStatuses = ref<CaseStatus[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const router = useRouter();

// Search and filter states
const searchName = ref('');
const searchCedula = ref('');
const currentStatus = ref<string>('');

// Confirmation dialog states
const showConfirmDialog = ref(false);
const pendingStatusChange = ref<SocialWorkCase | null>(null);
const statusObservations = ref('');

// Get only active case statuses
const availableCaseStatuses = computed(() => {
  return caseStatuses.value.filter(status => status.Case_Status_Status === true);
});

// Fetch all case statuses from the database
const fetchCaseStatuses = async (): Promise<void> => {
  try {
    const response = await axios.get<CaseStatus[]>(`${API_URL}/case-status`);
    caseStatuses.value = response.data;
    
    // Debug the case statuses data
    console.log('Raw case status response:', response.data);
    console.log('Case statuses after parsing:', caseStatuses.value);
    console.log('Active case statuses:', caseStatuses.value.filter(status => status.Case_Status_Status === true));
    
    // Set default status if available
    if (caseStatuses.value.length > 0) {
      const activeStatuses = caseStatuses.value.filter(status => status.Case_Status_Status === true);
      if (activeStatuses.length > 0) {
        currentStatus.value = activeStatuses[0].Case_Status_Name;
        console.log('Set default status to:', currentStatus.value);
      }
    }
    
    // If no case statuses were retrieved, fall back to a default of "Activo"
    if (caseStatuses.value.length === 0 || !currentStatus.value) {
      console.log('No case statuses found, using default "Activo"');
      currentStatus.value = 'Activo';
    }
    
    console.log('Current selected status:', currentStatus.value);
  } catch (err) {
    console.error('Error fetching case statuses:', err);
    error.value = 'Error al cargar los estados de casos. Por favor intente nuevamente más tarde.';
  }
};

// Fetch all users with social work records
const fetchSocialWorkCases = async (): Promise<void> => {
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.get<User[]>(`${API_URL}/users/socialwork`);
    
    // Debug the API response
    console.log('API response:', response.data);
    
    casos.value = response.data.map((user: User) => {
      // Handle cases where a user might have multiple consultations
      const initialConsultation: InitialConsultation = user.Initial_Consultations && user.Initial_Consultations.length > 0 
        ? user.Initial_Consultations[0] 
        : { Init_Code: '', SocialWork: undefined };
      
      const socialWork: SocialWork = initialConsultation.SocialWork || { SW_ProcessNumber: '', SW_Status: '' };
      
      // Log individual mapping for debugging
      console.log(`Mapping user ${user.User_ID}:`, {
        name: `${user.User_FirstName} ${user.User_LastName}`,
        init_code: initialConsultation.Init_Code,
        process_number: socialWork.SW_ProcessNumber,
        status: socialWork.SW_Status // Add status to debug log
      });
      
      return {
        User_ID: user.User_ID,
        User_FirstName: user.User_FirstName,
        User_LastName: user.User_LastName,
        Init_Code: initialConsultation.Init_Code || null,
        SW_ProcessNumber: socialWork.SW_ProcessNumber || null, // Ensure it's not undefined
        SW_Status: socialWork.SW_Status || '',
      };
    }).filter((caso: SocialWorkCase) => caso.SW_ProcessNumber !== null); // Only include cases with a valid process number
    
    // Log the processed cases array
    console.log('Processed cases:', casos.value);
  } catch (err) {
    console.error('Error fetching social work cases:', err);
    error.value = 'Error al cargar los casos. Por favor intente nuevamente más tarde.';
  } finally {
    loading.value = false;
  }
};

// Update the status of a social work case
const updateSocialWorkStatus = async (processNumber: string, observations: string, newStatus: string) => {
  try {
    // Make sure processNumber is not undefined or null
    if (!processNumber) {
      console.error('Cannot update status: SW_ProcessNumber is missing');
      error.value = 'Error: No se encontró el número de proceso para actualizar el estado.';
      return false;
    }
    
    // Add console logging to debug the request
    console.log('Updating status with data:', {
      processNumber,
      newStatus,
      observations
    });
    
    const response = await axios.put(`${API_URL}/social-work-status/${processNumber}`, {
      status: newStatus,
      observations: observations
    });
    
    // Log the response
    console.log('Server response:', response.data);
    
    return true;
  } catch (err) {
    console.error('Error updating social work status:', err);
    
    // Log more details about the error
    if (axios.isAxiosError(err)) {
      console.error('Request details:', err.config);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
    }
    
    error.value = 'Error al actualizar el estado del caso. Por favor intente nuevamente.';
    return false;
  }
};

// Filtered cases based on search and status
const filteredCases = computed(() => {
  // Debug logs for filtering
  console.log('Current filter status:', currentStatus.value);
  console.log('Available case statuses:', caseStatuses.value);
  console.log('All cases before filtering:', casos.value);
  
  // Check status matches between cases and current filter
  console.log('Status matches:', casos.value.map(caso => ({
    case_id: caso.SW_ProcessNumber,
    case_status: caso.SW_Status,
    matches_current: caso.SW_Status === currentStatus.value
  })));
  
  return casos.value.filter(
    (caso) =>
      matchesStatus(caso.SW_Status, currentStatus.value) &&
      `${caso.User_FirstName} ${caso.User_LastName}`
        .toLowerCase()
        .includes(searchName.value.toLowerCase()) &&
      (caso.User_ID || '')
        .toLowerCase()
        .includes(searchCedula.value.toLowerCase())
  );
});

// Open specific case
const openCase = (caso: SocialWorkCase) => {
  if (!caso.SW_ProcessNumber) {
    console.error('Cannot open case: SW_ProcessNumber is missing', caso);
    error.value = 'Error: No se puede abrir el caso porque falta el número de proceso.';
    return;
  }
  
  router.push({
    path: '/nuevoCasoTrabajoSocial',
    query: {
      casoId: caso.SW_ProcessNumber,
      userId: caso.User_ID,
      internalId: caso.Init_Code,
    },
  });
};

// Get available statuses for changing
const getAvailableStatuses = (currentStatusName: string) => {
  return availableCaseStatuses.value.filter(status => 
    status.Case_Status_Name !== currentStatusName && status.Case_Status_Status === true
  );
};

// Confirm status change
const confirmStatusChange = (caso: SocialWorkCase) => {
  if (!caso.SW_ProcessNumber) {
    console.error('Cannot change status: SW_ProcessNumber is missing', caso);
    error.value = 'Error: No se puede cambiar el estado porque falta el número de proceso.';
    return;
  }
  
  if (caso.newStatus && caso.newStatus !== caso.SW_Status) {
    pendingStatusChange.value = { ...caso }; // Create a copy to avoid reference issues
    statusObservations.value = '';
    showConfirmDialog.value = true;
  }
};

// Cancel status change
const cancelStatusChange = () => {
  if (pendingStatusChange.value) {
    // Find the original case and reset its newStatus
    const original = casos.value.find(c => 
      c.SW_ProcessNumber === pendingStatusChange.value?.SW_ProcessNumber
    );
    if (original) {
      original.newStatus = undefined;
    }
  }
  showConfirmDialog.value = false;
  pendingStatusChange.value = null;
  statusObservations.value = '';
};

// Confirm status change action
const confirmStatusChangeAction = async () => {
  if (!pendingStatusChange.value || !pendingStatusChange.value.newStatus) {
    console.error('Invalid pending status change');
    return;
  }
  
  const caso = pendingStatusChange.value;
  
  // Ensure we have a process number
  if (!caso.SW_ProcessNumber) {
    console.error('Cannot confirm status change: SW_ProcessNumber is missing', caso);
    error.value = 'Error: No se puede actualizar el estado porque falta el número de proceso.';
    showConfirmDialog.value = false;
    pendingStatusChange.value = null;
    return;
  }

  // Ensure observations are provided
  if (!statusObservations.value) {
    alert("Las observaciones son obligatorias para cambiar el estado.");
    return;
  }

  // Close dialog first to avoid UI freezing
  showConfirmDialog.value = false;

  // Show loading indicator
  loading.value = true;

  try {
    console.log('Attempting to update status for:', caso.SW_ProcessNumber);
    
    const success = await updateSocialWorkStatus(
      caso.SW_ProcessNumber,
      statusObservations.value,
      caso.newStatus as string
    );

    if (success) {
      // Update locally
      const index = casos.value.findIndex(
        (c) => c.SW_ProcessNumber === caso.SW_ProcessNumber
      );
      
      if (index !== -1) {
        casos.value[index].SW_Status = caso.newStatus ?? casos.value[index].SW_Status;
        casos.value[index].newStatus = undefined;
        casos.value[index].SW_Status_Observations = statusObservations.value;
        console.log('Updated local case data:', casos.value[index]);
      } else {
        console.warn('Could not find case in local array to update');
      }
    } else {
      throw new Error('Failed to update status');
    }
  } catch (err) {
    console.error("Error updating social work status:", err);
    error.value = "Error al actualizar el estado del caso. Por favor intente nuevamente.";
  } finally {
    // Reset
    pendingStatusChange.value = null;
    statusObservations.value = '';
    loading.value = false;
  }
};

// Unified fetch function to load all necessary data
const fetchData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // First fetch case statuses to set the default status
    await fetchCaseStatuses();
    // Then fetch the cases
    await fetchSocialWorkCases();
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = 'Error al cargar los datos. Por favor intente nuevamente más tarde.';
  } finally {
    loading.value = false;
  }
};

// Case-insensitive status comparison helper
const matchesStatus = (caseStatus: string, filterStatus: string): boolean => {
  // Perform case-insensitive comparison
  if (!caseStatus || !filterStatus) return false;
  return caseStatus.toLowerCase() === filterStatus.toLowerCase();
};

// Fetch data on component mount
onMounted(() => {
  fetchData();
});
</script>