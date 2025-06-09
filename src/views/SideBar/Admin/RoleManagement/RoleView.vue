<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import ConfirmDialog from "primevue/confirmdialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Tag from "primevue/tag";
import ToggleSwitch from 'primevue/toggleswitch';
import Card from 'primevue/card';
import Badge from 'primevue/badge';
import ScrollPanel from 'primevue/scrollpanel';

import { useDarkMode } from "@/components/ThemeSwitcher";
import { useToast } from "primevue/usetoast";
import { API } from "@/ApiRoute";
import { useConfirm } from "primevue/useconfirm";

// Importa APP_VIEWS y el tipo ViewPermission de tu config
import { APP_VIEWS, type AppView, type ViewPermission } from '@/config/views';

const { isDarkTheme} = useDarkMode();
const toast = useToast();
const confirm = useConfirm();

// Estado para la gestión de roles
const tableData = ref<any[]>([]);
const dataKey = ref("Profile_ID");

// Estado para el diálogo de permisos
const permissionsDialogVisible = ref(false);
const selectedProfileForPermissions = ref<any | null>(null);
const profileViewPermissions = ref<ViewPermission[]>([]);
const isLoadingPermissions = ref(false);
const isLoadingProfiles = ref(false);


// Columnas para la tabla de Perfiles
const profileColumns = [
  { field: "Profile_ID", header: "ID" },
  { field: "Profile_Name", header: "Nombre del Rol" },
  { field: "Profile_Status", header: "Estado", type: "boolean" },
];

//Permisos relacionados que deben sincronizarse
const linkedPermissionPairs = [
  { a: 'IngresoCronograma', b: 'Cronograma' },
  { a: 'RegistroHuella', b: 'AsignacionHuella' },
  { a: 'NewUser', b: 'UserView' }
];

// Función para sincronizar permisos relacionados
function syncLinkedPermissions(viewKey: string, value: boolean) {
  const pair = linkedPermissionPairs.find(p => p.a === viewKey || p.b === viewKey);
  if (!pair) return;
  const otherKey = pair.a === viewKey ? pair.b : pair.a;
  const otherPerm = profileViewPermissions.value.find(p => p.viewKey === otherKey);
  if (otherPerm && otherPerm.isEnabled !== value) {
    otherPerm.isEnabled = value;
  }
}

// Organización de secciones según el sidebar
const sidebarSections = [
  {
    name: "Gestión de Casos",
    icon: "pi pi-briefcase",
    color: "green",
    views: ['NewCase', 'MyCases', 'CaseReview', 'CreateActivities','CaseAssign', 'AssignedCases', 'AllCases']
  },
  {
    name: "Reportes de Casos",
    icon: "pi pi-chart-line",
    color: "purple",
    views: ['ExcelReport', 'CaseNotifications']
  },
  {
    name: "Control de Ingresos - Cronograma",
    icon: "pi pi-calendar",
    color: "orange",
    views: ['Cronograma', 'IngresoCronograma', 'PeriodoSemanal']
  },
  {
    name: "Control de Ingresos - Estudiantes",
    icon: "pi pi-users",
    color: "teal",
    views: ['AsignacionPeriodo', 'IngresoEstudiantesExcel', 'IngresoManualEstudiantes', 'ListadoEstudiantes', 'RemoverPeriodo', 'IngresoArea']
  },
  {
    name: "Control de Ingresos - Horarios",
    icon: "pi pi-clock",
    color: "indigo",
    views: ['IngresoHorario', 'IngresoHorarioVirtual', 'VistaHorarios', 'VistaHorariosPersonal']
  },
  {
    name: "Control de Ingresos - Biometría",
    icon: "pi pi-qrcode",
    color: "pink",
    views: ['AsignacionHuella', 'RegistroHuella', 'RegistroPorCedula']
  },
  {
    name: "Control de Ingresos - Asistencia",
    icon: "pi pi-calendar-clock",
    color: "cyan",
    views: ['RegistroManual', 'ModificacionHoras', 'RegistrosAbiertos', 'RegistrosCerrados']
  },
  {
    name: "Control de Ingresos - Seguimiento",
    icon: "pi pi-chart-bar",
    color: "yellow",
    views: ['SeguimientoGeneral', 'ResumenSemanal']
  },
  {
    name: "Gestión de Prácticas",
    icon : "pi pi-graduation-cap",
    color: "blue",
    views: ['VistaHorariosPersonal', 'RegistroVirtual', 'ResumenSemanalEstudiante', 'AlertasView']
  },
  {
    name: "Trabajo Social",
    icon: "pi pi-heart",
    color: "red",
    views: ['SocialWorkCases', 'SocialWorkSchedule', 'SocialWorkNewCase']
  },
  {
    name: "Administración del Sistema",
    icon: "pi pi-cog",
    color: "gray",
    views: ['Parameter', 'RoleView', 'UserView', 'NewUser']
  }
];

// Cargar la lista de perfiles (roles)
const loadProfiles = async () => {
  isLoadingProfiles.value = true;
  try {
    const response = await axios.get(`${API}/profile`);
    tableData.value = response.data.filter((profile: any) => profile.Profile_Name !== 'SuperAdmin');
  } catch (error) {
    console.error("Error al cargar los perfiles:", error);
    toast.add({ severity: "error", summary: "Error", detail: "No se pudieron cargar los perfiles.", life: 3000 });
    tableData.value = [];
  } finally {
    isLoadingProfiles.value = false;
  }
};

// Abrir el diálogo para gestionar permisos de un perfil
const openPermissionsDialog = async (profile: any) => {
  if (profile.Profile_Name === 'Administrador') {
    toast.add({ 
      severity: 'warn', 
      summary: 'No permitido', 
      detail: 'El rol Administrador tiene acceso a todas las vistas y sus permisos no se pueden modificar.', 
      life: 5000 
    });
    return;
  }
  
  selectedProfileForPermissions.value = profile;
  isLoadingPermissions.value = true;
  permissionsDialogVisible.value = true;

  try {
    const response = await axios.get(`${API}/profile/auth/${profile.Profile_ID}`);
    const permissionsFromApi = response.data as Array<{ View_Name: string, Has_Permission: boolean }>;

    profileViewPermissions.value = APP_VIEWS.map(appView => {
      const permFromApi = permissionsFromApi.find(p => p.View_Name === appView.key);
      return {
        viewKey: appView.key,
        isEnabled: permFromApi ? permFromApi.Has_Permission : false,
      };
    });

  } catch (error) {
    console.error(`Error cargando permisos para el perfil ${profile.Profile_Name}:`, error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los permisos del perfil.', life: 3000 });
    profileViewPermissions.value = APP_VIEWS.map(appView => ({ viewKey: appView.key, isEnabled: false }));
  } finally {
    isLoadingPermissions.value = false;
  }
};

// Guardar los permisos modificados
const saveProfilePermissions = async () => {
  if (!selectedProfileForPermissions.value || !selectedProfileForPermissions.value.Profile_ID) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No hay perfil seleccionado.', life: 3000 });
    return;
  }
  
  isLoadingPermissions.value = true;
  try {
    const permissionsToSave = profileViewPermissions.value.map(p => ({
      View_Name: p.viewKey,
      Has_Permission: p.isEnabled,
    }));

    await axios.put(`${API}/profile/auth/${selectedProfileForPermissions.value.Profile_ID}`, permissionsToSave);
    toast.add({ severity: 'success', summary: 'Guardado', detail: 'Permisos actualizados correctamente.', life: 3000 });
    permissionsDialogVisible.value = false;
  } catch (error) {
    console.error(`Error guardando permisos:`, error);
    const errorMessage = (error as any).response?.data?.message || 'No se pudieron guardar los permisos.';
    toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
  } finally {
    isLoadingPermissions.value = false;
  }
};

// Helper para obtener el objeto de permiso reactivo
const getReactivePermission = (viewKey: string): ViewPermission => {
  let perm = profileViewPermissions.value.find(p => p.viewKey === viewKey);
  if (!perm) {
    perm = { viewKey, isEnabled: false };
    profileViewPermissions.value.push(perm);
  }
  return perm;
};

// Obtener vistas organizadas por sección
const getViewsForSection = (section: any) => {
  return APP_VIEWS.filter(view => section.views.includes(view.key));
};

// Contar permisos habilitados por sección
const getEnabledPermissionsCount = (section: any) => {
  const viewsInSection = getViewsForSection(section);
  return viewsInSection.filter(view => 
    profileViewPermissions.value.find(p => p.viewKey === view.key)?.isEnabled
  ).length;
};

// Alternar todos los permisos de una sección
const toggleSectionPermissions = (section: any, enable: boolean) => {
  const viewsInSection = getViewsForSection(section);
  viewsInSection.forEach(view => {
    const permission = getReactivePermission(view.key);
    permission.isEnabled = enable;
  });
};

onMounted(() => {
  loadProfiles();
});
</script>

<template>
  <Toast />
  <ConfirmDialog />
  
  <div class="card">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Gestión de Permisos por Rol</h1>
        <p class="test-lg text-surface-600 dark:text-surface-300 mt-2">Configura los permisos de acceso para cada rol del sistema</p>
      </div>
      <Button
        label="Nuevo Rol"
        icon="pi pi-plus-circle"
        severity="primary"
        class="p-button-sm"
        @click="$router.push({ name: 'Parameter', query: { tabla: 'Profiles' } })"
      />
    </div>

    <Card class="shadow-md">
      <template #content>
        <DataTable
          :value="tableData"
          :dataKey="dataKey"
          paginator
          :rows="10"
          :loading="isLoadingProfiles"
          responsiveLayout="scroll"
          size="large"
          class="p-datatable-sm"
          :globalFilterFields="['Profile_Name']"
        >
          <template #header>
            <div class="flex justify-between items-center py-2">
              <h2 class="text-xl font-semibold text-surface-800 dark:text-surface-200">
                <i class="pi pi-users mr-2"></i>
                Roles del Sistema
              </h2>
              <Badge :value="tableData.length" severity="info" v-tooltip.top="'Número de roles'" />
            </div>
          </template>
          
          <template #empty>
            <div class="text-center py-8">
              <i class="pi pi-inbox text-4xl text-surface-400 mb-4"></i>
              <p class="text-surface-500">No hay roles para mostrar</p>
            </div>
          </template>

          <Column v-for="col in profileColumns" :key="col.field" :field="col.field" :header="col.header" sortable>
            <template #body="slotProps">
              <span v-if="col.type === 'boolean'">
                <Tag 
                  :value="slotProps.data[col.field] ? 'Activo' : 'Inactivo'" 
                  :severity="slotProps.data[col.field] ? 'success' : 'danger'"
                  :icon="slotProps.data[col.field] ? 'pi pi-check' : 'pi pi-times'"
                />
              </span>
              <span v-else class="font-medium">
                {{ slotProps.data[col.field] }}
              </span>
            </template>
          </Column>

          <Column header="Acciones" headerStyle="width: 120px; text-align: center" bodyStyle="text-align: center">
            <template #body="slotProps">
              <div class="flex justify-center">
                <Button
                  v-if="slotProps.data.Profile_Name !== 'Administrador'"
                  @click="openPermissionsDialog(slotProps.data)"
                  icon="pi pi-lock-open"
                  severity="info"
                  size="small"
                  outlined
                  rounded
                  v-tooltip.top="'Gestionar Permisos'"
                />
                <div v-else class="flex items-center" v-tooltip.top="'Los permisos del Administrador no se pueden modificar'">
                  <i class="pi pi-shield text-2xl text-green-500"></i>
                </div>
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Diálogo para Gestionar Permisos -->
    <Dialog
      v-model:visible="permissionsDialogVisible"
      :header="`Gestionar Permisos - ${selectedProfileForPermissions?.Profile_Name || ''}`"
      :style="{ width: '90vw', maxWidth: '1200px' }"
      modal
      :blockScroll="true"
      :closable="!isLoadingPermissions"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <i class="pi pi-shield text-2xl text-primary"></i>
          <div>
            <h3 class="text-xl font-bold m-0">Gestionar Permisos</h3>
            <p class="text-sm text-surface-600 dark:text-surface-300 m-0">
              Rol: <span class="font-semibold text-primary">{{ selectedProfileForPermissions?.Profile_Name }}</span>
            </p>
          </div>
        </div>
      </template>

      <div v-if="isLoadingPermissions" class="flex flex-col items-center justify-center py-12">
        <i class="pi pi-spin pi-spinner text-4xl text-primary mb-4"></i>
        <p class="text-lg text-surface-600">Cargando permisos...</p>
      </div>

      <div v-else>
        <ScrollPanel style="width: 100%; height: 70vh" class="custombar">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
<Card
  v-for="section in sidebarSections"
  :key="section.name"
  :class="['mb-6 rounded-xl shadow-lg', isDarkTheme ? 'border border-surface-100 bg-white' : '']"
>
  <template #header>
    <div
      :class="[
        'flex items-center justify-between p-5 rounded-t-xl shadow-sm pb-4 -mb-1',
        isDarkTheme ? 'bg-surface-900' : 'bg-white'
      ]"
    >
      <div class="flex items-center gap-4">
        <div :class="`w-12 h-12 rounded-full flex items-center justify-center bg-${section.color}-100 dark:bg-${section.color}-900/20 shadow-md`">
          <i :class="[section.icon, `text-xl text-${section.color}-600 dark:text-${section.color}-400`]"></i>
        </div>
        <div>
          <h4 :class="[isDarkTheme ? 'text-surface-0' : 'text-surface-900', 'font-bold text-lg']">{{ section.name }}</h4>
          <p :class="[isDarkTheme ? 'text-surface-400' : 'text-surface-500', 'text-sm']">
            {{ getEnabledPermissionsCount(section) }}/{{ getViewsForSection(section).length }} permisos activos
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <Button
          @click="toggleSectionPermissions(section, true)"
          icon="pi pi-check"
          size="small"
          severity="success"
          outlined
          rounded
          v-tooltip.top="'Habilitar todos'"
          class="hover:shadow-md transition-shadow duration-200"
        />
        <Button
          @click="toggleSectionPermissions(section, false)"
          icon="pi pi-times"
          size="small"
          severity="danger"
          outlined
          rounded
          v-tooltip.top="'Deshabilitar todos'"
          class="hover:shadow-md transition-shadow duration-200"
        />
      </div>
    </div>
  </template>

  <template #content>
    <div class="p-5 pt-4 space-y-4">
      <div
        v-for="view in getViewsForSection(section)"
        :key="view.key"
        :class="[
          'flex items-center justify-between p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200',
          isDarkTheme ? 'bg-gray-700' : 'bg-surface-50'
        ]"
      >
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <i :class="[view.icon, isDarkTheme ? 'text-surface-400' : 'text-surface-600', 'text-xl']"></i>
          <div class="min-w-0 flex-1">
            <p :class="[isDarkTheme ? 'text-surface-0' : 'text-surface-900', 'font-semibold text-base truncate']">
              {{ view.name }}
            </p>
            <p :class="[isDarkTheme ? 'text-surface-400' : 'text-surface-500', 'text-sm truncate']">
              {{ view.path }}
            </p>
          </div>
        </div>
          <ToggleSwitch
            :modelValue="getReactivePermission(view.key).isEnabled"
            @update:modelValue="val => { getReactivePermission(view.key).isEnabled = val; syncLinkedPermissions(view.key, val); }"
            :inputId="`perm-${view.key}`"
            class="ml-4"
          />
      </div>
    </div>
  </template>
</Card>
          </div>
        </ScrollPanel>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2 text-sm text-surface-600">
            <i class="pi pi-info-circle"></i>
            <span class="font-medium">Los cambios se aplicarán inmediatamente al guardar</span>
          </div>
          <div class="flex gap-2">
            <Button 
              class="ml-160"
              label="Cancelar" 
              icon="pi pi-times" 
              severity="contrast" 
              @click="permissionsDialogVisible = false" 
              :disabled="isLoadingPermissions"
              raised
            />
            <Button 
              label="Guardar Cambios" 
              icon="pi pi-check" 
              severity="primary" 
              @click="saveProfilePermissions" 
              :loading="isLoadingPermissions"
              raised
            />
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.custombar :deep(.p-scrollpanel-bar-y) {
  background: var(--primary-color);
  border-radius: 6px;
  width: 6px;
}

.custombar :deep(.p-scrollpanel-track-y) {
  background: var(--surface-200);
  border-radius: 6px;
  width: 6px;
}

/* Animaciones suaves */
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
}

/* Colores específicos para las secciones */
.bg-blue-100 { background-color: rgb(219, 234, 254); }
.bg-green-100 { background-color: rgb(220, 252, 231); }
.bg-purple-100 { background-color: rgb(243, 232, 255); }
.bg-orange-100 { background-color: rgb(255, 237, 213); }
.bg-teal-100 { background-color: rgb(204, 251, 241); }
.bg-indigo-100 { background-color: rgb(224, 231, 255); }
.bg-pink-100 { background-color: rgb(252, 231, 243); }
.bg-cyan-100 { background-color: rgb(207, 250, 254); }
.bg-yellow-100 { background-color: rgb(254, 249, 195); }
.bg-red-100 { background-color: rgb(254, 226, 226); }
.bg-gray-100 { background-color: rgb(243, 244, 246); }

.text-blue-600 { color: rgb(37, 99, 235); }
.text-green-600 { color: rgb(22, 163, 74); }
.text-purple-600 { color: rgb(147, 51, 234); }
.text-orange-600 { color: rgb(234, 88, 12); }
.text-teal-600 { color: rgb(13, 148, 136); }
.text-indigo-600 { color: rgb(79, 70, 229); }
.text-pink-600 { color: rgb(219, 39, 119); }
.text-cyan-600 { color: rgb(8, 145, 178); }
.text-yellow-600 { color: rgb(202, 138, 4); }
.text-red-600 { color: rgb(220, 38, 38); }
.text-gray-600 { color: rgb(75, 85, 99); }

/* Dark mode colors */
.dark .bg-blue-900\/20 { background-color: rgba(30, 58, 138, 0.2); }
.dark .bg-green-900\/20 { background-color: rgba(20, 83, 45, 0.2); }
.dark .bg-purple-900\/20 { background-color: rgba(88, 28, 135, 0.2); }
.dark .bg-orange-900\/20 { background-color: rgba(154, 52, 18, 0.2); }
.dark .bg-teal-900\/20 { background-color: rgba(19, 78, 74, 0.2); }
.dark .bg-indigo-900\/20 { background-color: rgba(49, 46, 129, 0.2); }
.dark .bg-pink-900\/20 { background-color: rgba(131, 24, 67, 0.2); }
.dark .bg-cyan-900\/20 { background-color: rgba(22, 78, 99, 0.2); }
.dark .bg-yellow-900\/20 { background-color: rgba(113, 63, 18, 0.2); }
.dark .bg-red-900\/20 { background-color: rgba(127, 29, 29, 0.2); }
.dark .bg-gray-900\/20 { background-color: rgba(17, 24, 39, 0.2); }

.dark .text-blue-400 { color: rgb(96, 165, 250); }
.dark .text-green-400 { color: rgb(74, 222, 128); }
.dark .text-purple-400 { color: rgb(196, 181, 253); }
.dark .text-orange-400 { color: rgb(251, 146, 60); }
.dark .text-teal-400 { color: rgb(45, 212, 191); }
.dark .text-indigo-400 { color: rgb(129, 140, 248); }
.dark .text-pink-400 { color: rgb(244, 114, 182); }
.dark .text-cyan-400 { color: rgb(34, 211, 238); }
.dark .text-yellow-400 { color: rgb(250, 204, 21); }
.dark .text-red-400 { color: rgb(248, 113, 113); }
.dark .text-gray-400 { color: rgb(156, 163, 175); }
</style>