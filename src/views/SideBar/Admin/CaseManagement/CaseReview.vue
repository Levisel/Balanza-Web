
<template>
    <div class="case-assignment-container">
      <div class="card">
        <div class="header-section">
          <h1 class="text-2xl font-bold mb-4">Revisión de Casos</h1>
        </div>
  
        <div class="filters-section mb-4">
          <div class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input type="text" v-model="filters.global" class="p-inputtext p-component" placeholder="Buscar caso..." />
          </div>
          <div class="area-filter">
            <label class="mr-2">Filtrar por área:</label>
            <select v-model="selectedArea" class="p-inputtext p-component">
              <option value="">Todas las áreas</option>
              <option value="Penal">Penal</option>
              <option value="Civil">Civil</option>
              <option value="Movilidad Humana">Movilidad Humana</option>
              <option value="Niñez">Niñez</option>
            </select>
          </div>
        </div>
  
        <!-- DataTable for Cases -->
        <div class="cases-table">
          <div class="table-header">
            <div class="column-header" style="width: 5%">#</div>
            <div class="column-header" style="width: 15%">Número de Caso</div>
            <div class="column-header" style="width: 20%">Cliente</div>
            <div class="column-header" style="width: 15%">Área</div>
            <div class="column-header" style="width: 20%">Creado por</div>
            <div class="column-header" style="width: 15%">Estado</div>
            <div class="column-header" style="width: 10%">Acciones</div>
          </div>
  
          <div v-if="loading" class="loading-container">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
            <span>Cargando casos...</span>
          </div>
  
          <div v-else-if="filteredCases.length === 0" class="empty-message">
            No se encontraron casos para asignar.
          </div>
  
          <div v-else class="table-body">
            <div 
              v-for="(caso, index) in filteredCases" 
              :key="caso.id" 
              class="table-row"
              :class="{ 'row-alternate': index % 2 !== 0 }"
            >
              <div class="column-cell" style="width: 5%">{{ index + 1 }}</div>
              <div class="column-cell" style="width: 15%">{{ caso.caseNumber }}</div>
              <div class="column-cell" style="width: 20%">{{ caso.clientName }}</div>
              <div class="column-cell" style="width: 15%">
                <span class="area-badge" :class="getAreaClass(caso.area)">
                  {{ caso.area }}
                </span>
              </div>
              <div class="column-cell" style="width: 20%">
                <select 
                  v-model="caso.assignedTo" 
                  class="p-inputtext p-component assign-select"
                  :disabled="caso.status === 'Asignado'"
                >
                  <option value="">Seleccionar estudiante</option>
                  <option 
                    v-for="student in getStudentsByArea(caso.area)" 
                    :key="student.id" 
                    :value="student.id"
                  >
                    {{ student.name }}
                  </option>
                </select>
              </div>
              <div class="column-cell" style="width: 15%">
                <span class="status-badge" :class="getStatusClass(caso.status)">
                  {{ caso.status }}
                </span>
              </div>
              <div class="column-cell actions" style="width: 10%">
                <div class="actions-buttons">
                  <button 
                    @click="assignCase(caso)" 
                    class="p-button p-button-sm p-button-outlined"
                    :disabled="!caso.assignedTo || caso.status === 'Asignado'"
                    title="Asignar caso"
                  >
                    <i class="pi pi-user-edit"></i>
                  </button>
                  <button 
                    v-if="caso.status === 'Asignado'"
                    @click="openReassignModal(caso)" 
                    class="p-button p-button-sm p-button-warning p-button-outlined ml-1"
                    title="Reasignar caso"
                  >
                    <i class="pi pi-sync"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
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
  
      <!-- Reassignment Modal -->
      <div v-if="showReassignModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Reasignar Caso</h2>
            <button @click="closeReassignModal" class="modal-close">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <div class="modal-case-info">
              <div class="info-item">
                <span class="info-label">Número de Caso:</span>
                <span class="info-value">{{ selectedCase?.caseNumber }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Cliente:</span>
                <span class="info-value">{{ selectedCase?.clientName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Área:</span>
                <span class="info-value">
                  <span class="area-badge" :class="getAreaClass(selectedCase?.area || '')">
                    {{ selectedCase?.area }}
                  </span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Actualmente asignado a:</span>
                <span class="info-value">{{ getCurrentAssignee(selectedCase?.assignedTo) }}</span>
              </div>
            </div>
            
            <div class="reassign-form">
              <div class="form-group">
                <label>Reasignar a:</label>
                <select 
                  v-model="newAssignee" 
                  class="p-inputtext p-component w-full"
                >
                  <option value="">Seleccionar nuevo estudiante</option>
                  <option 
                    v-for="student in getStudentsByArea(selectedCase?.area || '')" 
                    :key="student.id" 
                    :value="student.id"
                    :disabled="student.id === selectedCase?.assignedTo"
                  >
                    {{ student.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Motivo de reasignación:</label>
                <textarea 
                  v-model="reassignmentReason" 
                  class="p-inputtext p-component w-full"
                  rows="3"
                  placeholder="Indique el motivo de la reasignación del caso..."
                ></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              @click="closeReassignModal" 
              class="p-button p-button-outlined"
            >
              Cancelar
            </button>
            <button 
              @click="confirmReassignment" 
              class="p-button p-button-warning ml-2"
              :disabled="!newAssignee || !reassignmentReason"
            >
              Confirmar Reasignación
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, onMounted } from 'vue';
  
  interface Student {
    id: number;
    name: string;
    area: string;
  }
  
  interface Case {
    id: number;
    caseNumber: string;
    clientName: string;
    area: string;
    assignedTo: number | null;
    status: 'Pendiente' | 'Asignado' | 'En Progreso';
    reassignmentHistory?: ReassignmentRecord[];
  }
  
  interface ReassignmentRecord {
    date: string;
    previousAssignee: number;
    newAssignee: number;
    reason: string;
  }
  
  export default defineComponent({
    name: 'CaseAssignment',
    setup() {
      const cases = ref<Case[]>([]);
      const students = ref<Student[]>([]);
      const loading = ref(true);
      const processing = ref(false);
      const selectedArea = ref('');
      const filters = ref({
        global: '',
      });
  
      // Reassignment modal state
      const showReassignModal = ref(false);
      const selectedCase = ref<Case | null>(null);
      const newAssignee = ref<number | null>(null);
      const reassignmentReason = ref('');
  
      // Notification state
      const showNotification = ref(false);
      const notificationType = ref('success');
      const notificationTitle = ref('');
      const notificationMessage = ref('');
      const notificationIcon = ref('pi pi-check-circle');
  
      // Mock data for initial load
      const mockCases: Case[] = [
        { 
          id: 1, 
          caseNumber: 'P-2023-001', 
          clientName: 'Juan Pérez', 
          area: 'Penal', 
          assignedTo: 1, 
          status: 'Asignado',
          reassignmentHistory: []
        },
        { 
          id: 2, 
          caseNumber: 'C-2023-045', 
          clientName: 'María González', 
          area: 'Civil', 
          assignedTo: 3, 
          status: 'Asignado',
          reassignmentHistory: []
        },
        { 
          id: 3, 
          caseNumber: 'MH-2023-032', 
          clientName: 'Carlos Rodríguez', 
          area: 'Movilidad Humana', 
          assignedTo: null, 
          status: 'Pendiente' 
        },
        { 
          id: 4, 
          caseNumber: 'N-2023-018', 
          clientName: 'Ana López', 
          area: 'Niñez', 
          assignedTo: 7, 
          status: 'Asignado',
          reassignmentHistory: []
        },
        { id: 5, caseNumber: 'P-2023-056', clientName: 'Roberto Martínez', area: 'Penal', assignedTo: null, status: 'Pendiente' },
        { id: 6, caseNumber: 'C-2023-089', clientName: 'Luisa Hernández', area: 'Civil', assignedTo: null, status: 'Pendiente' },
        { id: 7, caseNumber: 'MH-2023-102', clientName: 'Miguel Sánchez', area: 'Movilidad Humana', assignedTo: null, status: 'Pendiente' },
        { id: 8, caseNumber: 'N-2023-075', clientName: 'Elena Díaz', area: 'Niñez', assignedTo: null, status: 'Pendiente' },
      ];
  
      const mockStudents: Student[] = [
        { id: 1, name: 'José Morales', area: 'Penal' },
        { id: 2, name: 'Karla Ramírez', area: 'Penal' },
        { id: 3, name: 'Federico Torres', area: 'Civil' },
        { id: 4, name: 'Claudia Vega', area: 'Civil' },
        { id: 5, name: 'Raúl Jiménez', area: 'Movilidad Humana' },
        { id: 6, name: 'Daniela Castro', area: 'Movilidad Humana' },
        { id: 7, name: 'Pablo Mendoza', area: 'Niñez' },
        { id: 8, name: 'Sofía Vargas', area: 'Niñez' },
      ];
  
      // Simulating data loading
      onMounted(() => {
        setTimeout(() => {
          cases.value = mockCases;
          students.value = mockStudents;
          loading.value = false;
        }, 1000);
      });
  
      // Filter cases based on selected area and global search
      const filteredCases = computed(() => {
        let result = [...cases.value];
        
        if (selectedArea.value) {
          result = result.filter(caso => caso.area === selectedArea.value);
        }
        
        if (filters.value.global) {
          const searchTerm = filters.value.global.toLowerCase();
          result = result.filter(caso => 
            caso.caseNumber.toLowerCase().includes(searchTerm) ||
            caso.clientName.toLowerCase().includes(searchTerm)
          );
        }
        
        return result;
      });
  
      // Get students by area
      const getStudentsByArea = (area: string) => {
        return students.value.filter(student => student.area === area);
      };
  
      // Get current assignee name
      const getCurrentAssignee = (assigneeId: number | null | undefined) => {
        if (!assigneeId) return 'No asignado';
        const student = students.value.find(s => s.id === assigneeId);
        return student ? student.name : 'Desconocido';
      };
  
      // Class helpers
      const getAreaClass = (area: string) => {
        const areaClasses: {[key: string]: string} = {
          'Penal': 'area-penal',
          'Civil': 'area-civil',
          'Movilidad Humana': 'area-movilidad',
          'Niñez': 'area-ninez'
        };
        return areaClasses[area] || '';
      };
  
      const getStatusClass = (status: string) => {
        const statusClasses: {[key: string]: string} = {
          'Pendiente': 'status-pending',
          'Asignado': 'status-assigned',
          'En Progreso': 'status-progress'
        };
        return statusClasses[status] || '';
      };
  
      // Assign a single case
      const assignCase = (caso: Case) => {
        if (!caso.assignedTo) return;
        
        processing.value = true;
        
        // Simulate API call
        setTimeout(() => {
          caso.status = 'Asignado';
          if (!caso.reassignmentHistory) {
            caso.reassignmentHistory = [];
          }
          
          const assignedStudent = students.value.find(s => s.id === caso.assignedTo);
          
          showSuccessNotification(
            'Caso Asignado',
            `El caso ${caso.caseNumber} ha sido asignado a ${assignedStudent?.name}`
          );
          
          processing.value = false;
        }, 800);
      };
  
      // Assign all cases
      const assignAllCases = () => {
        if (loading.value) return;
        
        processing.value = true;
        
        // Automatic assignment logic - assign to students in their respective areas
        const pendingCases = cases.value.filter(c => c.status === 'Pendiente');
        
        if (pendingCases.length === 0) {
          showWarningNotification(
            'Sin casos pendientes',
            'No hay casos pendientes para asignar.'
          );
          processing.value = false;
          return;
        }
        
        // Simulate API call
        setTimeout(() => {
          // Group students by area for round-robin assignment
          const studentsByArea: Record<string, Student[]> = {};
          students.value.forEach(student => {
            if (!studentsByArea[student.area]) {
              studentsByArea[student.area] = [];
            }
            studentsByArea[student.area].push(student);
          });
          
          // Counters for round-robin assignment
          const areaCounters: Record<string, number> = {
            'Penal': 0,
            'Civil': 0,
            'Movilidad Humana': 0,
            'Niñez': 0
          };
          
          // Assign cases using round-robin within each area
          pendingCases.forEach(caso => {
            const areaStudents = studentsByArea[caso.area] || [];
            if (areaStudents.length > 0) {
              const currentCounter = areaCounters[caso.area] % areaStudents.length;
              caso.assignedTo = areaStudents[currentCounter].id;
              caso.status = 'Asignado';
              if (!caso.reassignmentHistory) {
                caso.reassignmentHistory = [];
              }
              areaCounters[caso.area]++;
            }
          });
          
          showSuccessNotification(
            'Asignación Completada',
            `Se han asignado ${pendingCases.length} casos a los estudiantes correspondientes.`
          );
          
          processing.value = false;
        }, 1500);
      };
  
      // Reassignment Modal Methods
      const openReassignModal = (caso: Case) => {
        selectedCase.value = { ...caso };
        newAssignee.value = null;
        reassignmentReason.value = '';
        showReassignModal.value = true;
      };
  
      const closeReassignModal = () => {
        showReassignModal.value = false;
        selectedCase.value = null;
        newAssignee.value = null;
        reassignmentReason.value = '';
      };
  
      const confirmReassignment = () => {
        if (!selectedCase.value || !newAssignee.value || !reassignmentReason.value) return;
        
        processing.value = true;
        
        // Find the actual case in our array
        const caseToUpdate = cases.value.find(c => c.id === selectedCase.value?.id);
        
        if (caseToUpdate && caseToUpdate.assignedTo !== null) {
          // Store history record
          if (!caseToUpdate.reassignmentHistory) {
            caseToUpdate.reassignmentHistory = [];
          }
          
          caseToUpdate.reassignmentHistory.push({
            date: new Date().toISOString(),
            previousAssignee: caseToUpdate.assignedTo,
            newAssignee: newAssignee.value,
            reason: reassignmentReason.value
          });
          
          // Update assignee
          const previousAssigneeName = getCurrentAssignee(caseToUpdate.assignedTo);
          caseToUpdate.assignedTo = newAssignee.value;
          const newAssigneeName = getCurrentAssignee(newAssignee.value);
          
          // Show notification
          showSuccessNotification(
            'Caso Reasignado',
            `El caso ${caseToUpdate.caseNumber} ha sido reasignado de ${previousAssigneeName} a ${newAssigneeName}.`
          );
        }
        
        setTimeout(() => {
          processing.value = false;
          closeReassignModal();
        }, 800);
      };
  
      // Notification helpers
      const showSuccessNotification = (title: string, message: string) => {
        notificationType.value = 'success';
        notificationTitle.value = title;
        notificationMessage.value = message;
        notificationIcon.value = 'pi pi-check-circle';
        showNotification.value = true;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          showNotification.value = false;
        }, 5000);
      };
  
      const showWarningNotification = (title: string, message: string) => {
        notificationType.value = 'warning';
        notificationTitle.value = title;
        notificationMessage.value = message;
        notificationIcon.value = 'pi pi-exclamation-triangle';
        showNotification.value = true;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          showNotification.value = false;
        }, 5000);
      };
  
      const closeNotification = () => {
        showNotification.value = false;
      };
  
      return {
        cases,
        students,
        loading,
        processing,
        selectedArea,
        filters,
        filteredCases,
        showNotification,
        notificationType,
        notificationTitle,
        notificationMessage,
        notificationIcon,
        showReassignModal,
        selectedCase,
        newAssignee,
        reassignmentReason,
        getStudentsByArea,
        getAreaClass,
        getStatusClass,
        getCurrentAssignee,
        assignCase,
        assignAllCases,
        openReassignModal,
        closeReassignModal,
        confirmReassignment,
        closeNotification
      };
    }
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
  
  /* Notification toast */
  .notification-toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 350px;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: flex-start;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .notification-toast.success {
    background-color: var(--p-green-50);
    border-left: 4px solid var(--p-green-500);
  }
  
  .notification-toast.warning {
    background-color: var(--p-yellow-50);
    border-left: 4px solid var(--p-yellow-500);
  }
  
  .notification-icon {
    font-size: 1.5rem;
    margin-right: 1rem;
  }
  
  .success .notification-icon {
    color: var(--p-green-500);
  }
  
  .warning .notification-icon {
    color: var(--p-yellow-500);
  }
  
  .notification-content {
    flex: 1;
  }
  
  .notification-content h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
  }
  
  .notification-content p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--p-surface-600);
  }
  
  .close-notification {
    background: transparent;
    border: none;
    cursor: pointer;
  color: var(--p-surface-500);
  padding: 0.25rem;
  margin-left: 0.5rem;
  font-size: 1rem;
}

.close-notification:hover {
  color: var(--p-surface-700);
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .p-input-icon-left {
    width: 100%;
  }
  
  .p-input-icon-left > input {
    width: 100%;
  }
  
  .area-filter {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .area-filter select {
    width: 100%;
  }
  
  .cases-table {
    overflow-x: auto;
  }
  
  .notification-toast {
    width: calc(100% - 2rem);
    left: 1rem;
    right: 1rem;
  }
}

</style>