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
    <div class="mb-6 flex space-x-4">
      <button 
        @click="currentStatus = 'Activo'"
        :class="[
          'px-4 py-2 rounded-lg transition-colors',
          currentStatus === 'Activo' 
            ? 'bg-[#164284] text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        Casos Activos
      </button>
      <button 
        @click="currentStatus = 'Inactivo'"
        :class="[
          'px-4 py-2 rounded-lg transition-colors',
          currentStatus === 'Inactivo' 
            ? 'bg-[#164284] text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        Casos Inactivos
      </button>
      <button 
        @click="currentStatus = 'Archivado'"
        :class="[
          'px-4 py-2 rounded-lg transition-colors',
          currentStatus === 'Archivado' 
            ? 'bg-[#164284] text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        Casos Archivados
      </button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>

    <!-- Error Message -->
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
      <p>{{ error }}</p>
      <button @click="fetchSocialWorkCases" class="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
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
          <p class="text-gray-500">Estado: {{ getCaseStatusLabel(caso.SW_Status) }}</p>
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
              :key="status" 
              :value="status"
            >
              {{ getCaseStatusLabel(status) }}
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
          {{ getCaseStatusLabel(pendingStatusChange?.SW_Status) }} a
          {{ getCaseStatusLabel(pendingStatusChange?.newStatus) }}?
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

// Define interface for case
interface SocialWorkCase {
  User_ID: string;
  User_FirstName: string;
  User_LastName: string;
  Init_Code: string;
  SW_ProcessNumber: string;
  SW_Status: 'Activo' | 'Inactivo' | 'Archivado';
  SW_Status_Observations?: string; // New field
  newStatus?: 'Activo' | 'Inactivo' | 'Archivado';
}


// API URL - adjust this to match your environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// State variables
const casos = ref<SocialWorkCase[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const router = useRouter();

// Search and filter states
const searchName = ref('');
const searchCedula = ref('');
const currentStatus = ref<'Activo' | 'Inactivo' | 'Archivado'>('Activo');

// Confirmation dialog states
const showConfirmDialog = ref(false);
const pendingStatusChange = ref<SocialWorkCase | null>(null);
const statusObservations = ref(''); // New separate ref for observations


// Fetch all users with social work records
const fetchSocialWorkCases = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.get(`${API_URL}/users/socialwork`);
    casos.value = response.data.map((user: any) => {
      const socialWork = user.Initial_Consultations?.[0]?.SocialWork || {};
      return {
        User_ID: user.User_ID,
        User_FirstName: user.User_FirstName,
        User_LastName: user.User_LastName,
        Init_Code: user.Initial_Consultations?.[0]?.Init_Code || null,
        SW_ProcessNumber: socialWork.SW_ProcessNumber,
        SW_Status: socialWork.SW_Status || 'Activo',
      };});
  } catch (err) {
    console.error('Error fetching social work cases:', err);
    error.value = 'Error al cargar los casos. Por favor intente nuevamente más tarde.';
  } finally {
    loading.value = false;
  }
};

// Update the status of a social work case
const updateSocialWorkStatus = async (SW_ProcessNumber: string, SW_Status_Observations: string, newStatus:string) => {
  try {    
    // Add console logging to debug the request
    console.log('Updating status with data:', {
      processNumber: SW_ProcessNumber,
      newStatus: newStatus,
      observations: SW_Status_Observations
    });
    
    // FIX: Make sure the field names match what your backend expects
    const response = await axios.put(`${API_URL}/social-work-status/${SW_ProcessNumber}`, {
      status: newStatus,
      observations: SW_Status_Observations
    });
    
    // Log the response to see what the server returns
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
  return casos.value.filter(
    (caso) =>
      caso.SW_Status === currentStatus.value &&
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
  router.push({
    path: '/nuevoCasoTrabajoSocial',
    query: {
      casoId: caso.SW_ProcessNumber,
      userId: caso.User_ID,
      internalId: caso.Init_Code,
    },
  });
};

// Get readable status label
const getCaseStatusLabel = (status?: string) => {
  switch (status) {
    case 'Activo':
      return 'Activo';
    case 'Inactivo':
      return 'Inactivo';
    case 'Archivado':
      return 'Archivado';
    default:
      return 'Desconocido';
  }
};

// Get available statuses for changing
const getAvailableStatuses = (currentStatus: string) => {
  const allStatuses: ('Activo' | 'Inactivo' | 'Archivado')[] = [
    'Activo',
    'Inactivo',
    'Archivado',
  ];
  return allStatuses.filter((status) => status !== currentStatus);
};

// Confirm status change
const confirmStatusChange = (caso: SocialWorkCase) => {
  if (caso.newStatus && caso.newStatus !== caso.SW_Status) {
    pendingStatusChange.value = caso;
    statusObservations.value = ''; // Reset observations when opening dialog
    showConfirmDialog.value = true;
  }
};

// Cancel status change
const cancelStatusChange = () => {
  if (pendingStatusChange.value) {
    pendingStatusChange.value.newStatus = undefined;
  }
  showConfirmDialog.value = false;
  pendingStatusChange.value = null;
  statusObservations.value = ''; // Clear observations on cancel
};

// Confirm status change action
// In SocialWorkCases.vue, update the confirmStatusChangeAction function:

const confirmStatusChangeAction = async () => {
  if (pendingStatusChange.value && pendingStatusChange.value.newStatus) {
    const caso = pendingStatusChange.value;

    // Ensure observations are provided
    if (!statusObservations.value) {
      alert("Las observaciones son obligatorias para cambiar el estado.");
      return;
    }

    // Close dialog first to avoid UI freezing
    showConfirmDialog.value = false;

    // Show loading indicator
    loading.value = true;

    // Update the status in the backend
    try {
      console.log('Attempting to update status for:', caso.SW_ProcessNumber);
      console.log('Observations text:', statusObservations.value);
      
      // FIX: Pass the parameters in the correct order
      const success = await updateSocialWorkStatus(
        caso.SW_ProcessNumber,
        statusObservations.value,
        caso.newStatus ?? ''
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
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchSocialWorkCases();
});
</script>