<template>
  <div class="case-assignment-container">
    <div class="filters-section mb-4">
      <div class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input type="text" v-model="filters.global" class="p-inputtext p-component" placeholder="Buscar caso..." />
      </div>
    </div>

    <TabView>
      <TabPanel header="Casos por Asignar">
        <div class="cases-table">
          <div class="table-header">
            <div class="column-header" style="width: 5%">#</div>
            <div class="column-header" style="width: 15%">Número de Caso</div>
            <div class="column-header" style="width: 20%">Área</div>
            <div class="column-header" style="width: 15%">Estado</div>
            <div class="column-header" style="width: 15%">Asignar a</div>
            <div class="column-header" style="width: 15%">Acciones</div>
          </div>

          <div v-if="loading" class="loading-container">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
            <span>Cargando casos...</span>
          </div>

          <div v-else-if="filteredPendingCases.length === 0" class="empty-message">
            No se encontraron casos para asignar.
          </div>

          <div v-else class="table-body">
            <div 
              v-for="(caso, index) in filteredPendingCases" 
              :key="caso.Internal_ID" 
              class="table-row"
              :class="{ 'row-alternate': index % 2 !== 0 }"
            >
              <div class="column-cell" style="width: 5%">{{ index + 1 }}</div>
              <div class="column-cell" style="width: 15%">{{ caso.Init_Code }}</div>
              <div class="column-cell" style="width: 20%">{{ caso.Init_Subject }}</div>
              <div class="column-cell" style="width: 15%">{{ caso.Init_Type }}</div>
              <div class="column-cell" style="width: 15%">
                <select v-model="caso.assignedTo" class="p-inputtext p-component assign-select">
                  <option value="">Seleccionar estudiante</option>
                  <option v-for="student in students" :key="student.Internal_ID" :value="student.Internal_ID">
                    {{ student.Internal_Name }} {{ student.Internal_LastName }}
                  </option>
                </select>
              </div>
              <div class="column-cell" style="width: 15%">
                <button @click="assignCase(caso)" class="p-button p-button-sm p-button-outlined" :disabled="!caso.assignedTo">
                  Asignar
                </button>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      <TabPanel header="Casos Asignados">
        <div class="cases-table">
          <div class="table-header">
            <div class="column-header" style="width: 5%">#</div>
            <div class="column-header" style="width: 15%">Número de Caso</div>
            <div class="column-header" style="width: 20%">Área</div>
            <div class="column-header" style="width: 15%">Estado</div>
            <div class="column-header" style="width: 15%">Asignado a</div>
            <div class="column-header" style="width: 15%">Acciones</div>
          </div>

          <div v-if="loading" class="loading-container">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
            <span>Cargando casos...</span>
          </div>

          <div v-else-if="filteredAssignedCases.length === 0" class="empty-message">
            No se encontraron casos asignados.
          </div>

          <div v-else class="table-body">
            <div 
              v-for="(caso, index) in filteredAssignedCases" 
              :key="caso.Internal_ID" 
              class="table-row"
              :class="{ 'row-alternate': index % 2 !== 0 }"
            >
              <div class="column-cell" style="width: 5%">{{ index + 1 }}</div>
              <div class="column-cell" style="width: 15%">{{ caso.Init_Code }}</div>
              <div class="column-cell" style="width: 20%">{{ caso.Init_Subject }}</div>
              <div class="column-cell" style="width: 15%">{{ caso.Init_Type }}</div>
              <div class="column-cell" style="width: 15%">
                <select v-model="caso.assignedTo" class="p-inputtext p-component assign-select">
                  <option value="">Seleccionar estudiante</option>
                  <option v-for="student in students" :key="student.Internal_ID" :value="student.Internal_ID">
                    {{ student.Internal_Name }} {{ student.Internal_LastName }}
                  </option>
                </select>
              </div>
              <div class="column-cell" style="width: 15%">
                <button @click="reassignCase(caso)" class="p-button p-button-sm p-button-outlined" :disabled="!caso.assignedTo">
                  Reasignar
                </button>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
    </TabView>

    <!-- Notification Toast -->
    <div v-if="showNotification" class="notification-toast" :class="notificationType">
      <i :class="notificationIcon" class="notification-icon"></i>
      <div class="notification-content">
        <h3>{{ notificationTitle }}</h3>
        <p>{{ notificationMessage }}</p>
      </div>
      <button @click="closeNotification" class="close-notification">
        <i class="pi pi-times"></i>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth'; // Asegúrate de que la ruta sea correcta

export default defineComponent({
  name: 'CaseAssign',
  setup() {
    const authStore = useAuthStore();
    const selectedArea = ref(authStore.user?.area || '');
    const loading = ref(true);
    const cases = ref([]);
    const students = ref([]);
    const filteredPendingCases = computed(() => {
      return cases.value.filter(caso => caso.Init_Type === 'Por Asignar' && (selectedArea.value === '' || caso.Init_Subject === selectedArea.value));
    });
    const filteredAssignedCases = computed(() => {
      return cases.value.filter(caso => caso.Init_Type === 'Asignado' && (selectedArea.value === '' || caso.Init_Subject === selectedArea.value));
    });
    const showNotification = ref(false);
    const notificationType = ref('');
    const notificationIcon = ref('');
    const notificationTitle = ref('');
    const notificationMessage = ref('');
    const filters = ref({ global: '' });

    const fetchCases = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/initial-consultations/type/${selectedArea.value}`);
        cases.value = response.data;
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        loading.value = false;
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/internal-users/students/${selectedArea.value}`);
        students.value = response.data;
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    onMounted(() => {
      fetchCases();
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
    };
  },
  methods: {
    assignCase(caso) {
      // Implementar la lógica para asignar el caso
      console.log(`Asignar caso ${caso.Init_Code} a ${caso.assignedTo}`);
    },
    reassignCase(caso) {
      // Implementar la lógica para reasignar el caso
      console.log(`Reasignar caso ${caso.Init_Code} a ${caso.assignedTo}`);
    },
    closeNotification() {
      this.showNotification = false;
    },
  },
});
</script>

<style scoped>
.case-assignment-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.p-button {
  background-color: var(--p-primary-500);
  border: 1px solid var(--p-primary-500);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.p-button:hover:not(:disabled) {
  background-color: var(--p-primary-600);
  border-color: var(--p-primary-600);
}

.p-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.p-button-success {
  background-color: var(--p-green-500);
  border-color: var(--p-green-500);
}

.p-button-success:hover:not(:disabled) {
  background-color: var(--p-green-600);
  border-color: var(--p-green-600);
}

.p-button-warning {
  background-color: var(--p-orange-500);
  border-color: var(--p-orange-500);
}

.p-button-warning:hover:not(:disabled) {
  background-color: var(--p-orange-600);
  border-color: var(--p-orange-600);
}

.p-button-outlined {
  background-color: transparent;
  color: var(--p-primary-500);
  border: 1px solid var(--p-primary-500);
}

.p-button-outlined:hover:not(:disabled) {
  background-color: rgba(var(--p-primary-500-rgb), 0.04);
}

.p-button-warning.p-button-outlined {
  color: var(--p-orange-500);
  border-color: var(--p-orange-500);
}

.p-button-warning.p-button-outlined:hover:not(:disabled) {
  background-color: rgba(var(--p-orange-500-rgb), 0.04);
}

.p-button-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.p-inputtext {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: var(--card-bg);
  color: var(--text-color);
}

.p-inputtext:focus {
  outline: 0 none;
  border-color: var(--p-primary-400);
  box-shadow: 0 0 0 1px var(--p-primary-400);
}

.p-input-icon-left {
  position: relative;
  display: inline-block;
}

.p-input-icon-left > i {
  position: absolute;
  top: 50%;
  left: 0.5rem;
  margin-top: -0.5rem;
  color: var(--text-color);
}

.p-input-icon-left > input {
  padding-left: 2rem;
}

/* Table styles */
.cases-table {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
}

.table-header {
  display: flex;
  background-color: var(--p-surface-100);
  font-weight: 600;
  color: var(--p-surface-700);
}

.table-row {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.row-alternate {
  background-color: rgba(var(--p-surface-200-rgb), 0.3);
}

.column-header, .column-cell {
  padding: 0.75rem 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.column-header {
  text-align: left;
}

.area-badge, .status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.area-penal {
  background-color: rgba(var(--p-red-500-rgb), 0.1);
  color: var(--p-red-600);
}

.area-civil {
  background-color: rgba(var(--p-blue-500-rgb), 0.1);
  color: var(--p-blue-600);
}

.area-movilidad {
  background-color: rgba(var(--p-orange-500-rgb), 0.1);
  color: var(--p-orange-600);
}

.area-ninez {
  background-color: rgba(var(--p-purple-500-rgb), 0.1);
  color: var(--p-purple-600);
}

.status-pending {
  background-color: rgba(var(--p-yellow-500-rgb), 0.1);
  color: var(--p-yellow-700);
}

.status-assigned {
  background-color: rgba(var(--p-green-500-rgb), 0.1);
  color: var(--p-green-600);
}

.status-progress {
  background-color: rgba(var(--p-blue-500-rgb), 0.1);
  color: var(--p-blue-600);
}

.assign-select {
  width: 100%;
  max-width: 150px;
}

.actions {
  display: flex;
  justify-content: center;
  align-items: center;
}

.actions-buttons {
  display: flex;
  gap: 0.25rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-color);
  gap: 1rem;
}

.empty-message {
  padding: 2rem;
  text-align: center;
  color: var(--text-color);
}
  
  .notification-toast {
    width: calc(100% - 2rem);
    left: 1rem;
    right: 1rem;
  }

</style>