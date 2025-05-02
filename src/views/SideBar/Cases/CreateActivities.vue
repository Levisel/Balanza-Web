<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown'; // Importado
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';
import { API } from "@/ApiRoute";
import { useConfirm } from 'primevue/useconfirm';
// Importamos las interfaces necesarias
import type { User } from '@/ApiRoute';
import type { Initial_Consultation } from '@/ApiRoute';

// *** Interfaz actualizada para el tipo de actividad ***
interface ActivityType {
  Type_Of_Activity_Id: number;   // Coincide con la API
  Type_Of_Activity_Name: string; // Coincide con la API
  Type_Of_Activity_Status: boolean; // Coincide con la API
}

const toast = useToast();
const confirm = useConfirm();
const authStore = useAuthStore();

// Detalles del Usuario
const visibleUsuarioDialog = ref<boolean>(false);
const usuarioDetalles = ref<User>({} as User);

// Estado del dialog de actividades y lista de actividades
const visibleDialog = ref<boolean>(false);
const actividades = ref<any[]>([]);
const selectedCaseCode = ref<string>('');

// Estado para el diálogo de Nueva Actividad
const visibleNuevaActividadDialog = ref<boolean>(false);
const isLoadingActivityTypes = ref<boolean>(false); // Para indicar carga

// Estado para el Dropdown de Tipos de Actividad
const selectedActivityType = ref<number | null>(null); // Almacenará el ID seleccionado (Type_Of_Activity_Id)
const activityTypeOptions = ref<ActivityType[]>([]); // Almacenará las opciones

// Estado para los campos dinámicos
const dynamicFields = ref<any[]>([]); // Campos obtenidos de la API
const dynamicFieldValues = ref<Record<string, any>>({}); // Valores de los campos dinámicos

// Obtener los casos
const casosActivos = ref<any[]>([]);
const casosInactivos = ref<any[]>([]);

// Búsqueda
const searchQuery = ref<string>('');

// Función para obtener los campos dinámicos
const fetchDynamicFields = async (activityTypeId: number) => {
  try {
    const response = await axios.get(`${API}/field-of-activity/type/${activityTypeId}/status`);
    dynamicFields.value = response.data;

    // Inicializa los valores de los campos dinámicos
    dynamicFieldValues.value = {};
    dynamicFields.value.forEach((field: any) => {
      dynamicFieldValues.value[field.Field_Of_Activity_Name] = null;
    });

    console.log('Campos dinámicos cargados:', dynamicFields.value);
  } catch (error) {
    console.error('Error al obtener los campos dinámicos:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los campos dinámicos.',
      life: 3000,
    });
  }
};

// Observa cambios en el tipo de actividad seleccionado
watch(selectedActivityType, (newValue) => {
  if (newValue) {
    fetchDynamicFields(newValue);
  } else {
    dynamicFields.value = [];
    dynamicFieldValues.value = {};
  }
});

const filtrarCasos = (casos: any[], query: string) => {
  if (!query) {
    return casos;
  }
  const lowerCaseQuery = query.toLowerCase();
  return casos.filter((caso: { codigo: string; fecha: string; usuario: string; }) =>
    caso.codigo.toLowerCase().includes(lowerCaseQuery) ||
    caso.fecha.toLowerCase().includes(lowerCaseQuery) ||
    caso.usuario.toLowerCase().includes(lowerCaseQuery)
  );
};

const casosActivosFiltrados = computed(() => filtrarCasos(casosActivos.value, searchQuery.value));
const casosInactivosFiltrados = computed(() => filtrarCasos(casosInactivos.value, searchQuery.value));

// Obtener los datos de los usuarios
const obtenerNombreUsuario = async (userId: string | number): Promise<string> => {
  try {
    // Asegúrate de que la URL base de API esté configurada correctamente si no es localhost
    const response = await axios.get(`${API}/user/${userId}`);
    return `${response.data.User_FirstName} ${response.data.User_LastName}`;
  } catch (error) {
    console.error(`Error al obtener el usuario con ID ${userId}:`, error);
    return "Usuario no encontrado";
  }
}

const verDetallesUsuario = async (cedula: string | number) => {
  try {
    const response = await axios.get(`${API}/user/${cedula}`);
    usuarioDetalles.value = response.data;
    visibleUsuarioDialog.value = true;
  } catch (error) {
    console.error('Error al obtener los detalles del usuario:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron obtener los detalles del usuario.',
      life: 3000,
    });
  }
};

const obtenerCasos = async () => {
  try {
    const userType = authStore.user?.type;

    let activeCasesUrl = '';
    let inactiveCasesUrl = '';

    if (userType === 'Administrador' || userType === 'SuperAdmin') {
      // URLs generales para Administrador o SuperAdmin
      activeCasesUrl = `${API}/initial-consultations/review/Asignado/Activo`;
      inactiveCasesUrl = `${API}/initial-consultations/review/Asignado/Inactivo`;
    } else {
      // URLs específicas para otros usuarios
      const subject = authStore.user?.area;
      if (!subject) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo determinar el área del usuario para filtrar los casos.',
          life: 4000,
        });
        console.error("Error: authStore.user.area is not defined.");
        casosActivos.value = [];
        casosInactivos.value = [];
        return;
      }

      const type = 'Asignado';
      activeCasesUrl = `${API}/initial-consultations/type/${encodeURIComponent(subject)}/${encodeURIComponent(type)}/Activo`;
      inactiveCasesUrl = `${API}/initial-consultations/type/${encodeURIComponent(subject)}/${encodeURIComponent(type)}/Inactivo`;
    }

    const [activeResponse, inactiveResponse] = await Promise.all([
      axios.get<Initial_Consultation[]>(activeCasesUrl),
      axios.get<Initial_Consultation[]>(inactiveCasesUrl)
    ]);

    const mapCasoData = async (caso: Initial_Consultation, index: number) => {
      if (!caso || !caso.User_ID) {
        console.warn("Caso inválido o sin User_ID:", caso);
        return null;
      }
      const nombreUsuario = await obtenerNombreUsuario(caso.User_ID);
      return {
        nro: index + 1,
        codigo: caso.Init_Code,
        fecha: caso.Init_Date ? new Date(caso.Init_Date).toLocaleDateString() : 'N/A',
        cedula: caso.User_ID,
        usuario: nombreUsuario,
        caso: caso.Init_Topic,
        oficina: caso.Init_Office,
        tema: caso.Init_Subject,
        estado: caso.Init_Status,
        tipocliente: caso.Init_ClientType,
      };
    };

    const activeCasesData = activeResponse.data || [];
    casosActivos.value = (await Promise.all(activeCasesData.map(mapCasoData))).filter(caso => caso !== null);

    const inactiveCasesData = inactiveResponse.data || [];
    casosInactivos.value = (await Promise.all(inactiveCasesData.map(mapCasoData))).filter(caso => caso !== null);

  } catch (error) {
    console.error('Error al obtener los casos por tipo y estado:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron obtener los casos.',
      life: 3000,
    });
    casosActivos.value = [];
    casosInactivos.value = [];
  }
};

// Función para obtener los tipos de actividad
const fetchActivityTypes = async () => {
  // Solo carga si no hay opciones ya cargadas
  if (activityTypeOptions.value.length > 0) return;

  isLoadingActivityTypes.value = true;
  try {
    // Usa tu variable API si está configurada correctamente, si no, la URL directa
    const response = await axios.get<ActivityType[]>(`${API}/type-of-activity`);
    activityTypeOptions.value = response.data;
    console.log('Tipos de actividad cargados:', activityTypeOptions.value);
  } catch (error) {
    console.error('Error al obtener los tipos de actividad:', error);
    toast.add({
      severity: 'error',
      summary: 'Error de Carga',
      detail: 'No se pudieron cargar los tipos de actividad.',
      life: 3000,
    });
    activityTypeOptions.value = []; // Limpia en caso de error
  } finally {
    isLoadingActivityTypes.value = false;
  }
};


onMounted(() => {
  obtenerCasos(); // Cargar todos los casos en las tablas
});

const finalizarCaso = async (caso: { codigo: any; }) => {
  try {
    const internalID = authStore.user?.id;

    if (!internalID) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    const response = await axios.put(`${API}/initial-consultations/${caso.codigo}`, {
      Init_Status: 'Inactivo'
    }, {
      headers: {
        'Internal-ID': internalID,
      }
    });

    if (response.status === 200) {
      toast.add({
        severity: 'success',
        summary: 'Caso Finalizado',
        detail: `El caso ${caso.codigo} ha sido finalizado.`,
        life: 3000,
      });
      await obtenerCasos();
    } else {
      throw new Error(`Error al finalizar el caso: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error al finalizar el caso:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo finalizar el caso ${caso.codigo}.`,
      life: 3000,
    });
  }
};

const reactivarCaso = async (caso: { codigo: any; }) => {
  try {
    const internalID = authStore.user?.id;

    if (!internalID) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    const response = await axios.put(`${API}/initial-consultations/${caso.codigo}`, {
      Init_Status: 'Activo'
    }, {
      headers: {
        'Internal-ID': internalID,
      }
    });

    if (response.status === 200) {
      toast.add({
        severity: 'success',
        summary: 'Caso Reactivado',
        detail: `El caso ${caso.codigo} ha sido reactivado.`,
        life: 3000,
      });
      await obtenerCasos();
    } else {
      throw new Error(`Error al reactivar el caso: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error al reactivar el caso:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo reactivar el caso ${caso.codigo}.`,
      life: 3000,
    });
  }
};

const eliminarCaso = async (caso: { codigo: any; }) => {
  confirm.require({
    message: `¿Estás seguro de que deseas eliminar el caso ${caso.codigo}?`,
    header: 'Confirmación',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        const internalID = authStore.user?.id;

        if (!internalID) {
          throw new Error('No se pudo obtener el ID del usuario');
        }

        const response = await axios.delete(`${API}/initial-consultations/${caso.codigo}`, {
          headers: {
            'Internal-ID': internalID,
          }
        });

        if (response.status === 200) {
          toast.add({
            severity: 'success',
            summary: 'Caso Eliminado',
            detail: `El caso ${caso.codigo} ha sido eliminado.`,
            life: 3000,
          });
          await obtenerCasos();
        } else {
          throw new Error(`Error al eliminar el caso: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error al eliminar el caso:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo eliminar el caso ${caso.codigo}.`,
          life: 3000,
        });
      }
    },
    reject: () => {
      toast.add({
        severity: 'info',
        summary: 'Cancelado',
        detail: 'Eliminación cancelada',
        life: 3000,
      });
    }
  });
};

// Obtener y mostrar las actividades según código del caso
const verActividades = async (caso: { codigo: any; }) => {
  try {
    const userType = authStore.user?.type;
    let codigoCaso = caso.codigo;

    // Si el usuario es Administrador o SuperAdmin, no filtrar por código de caso
    if (userType === 'Administrador' || userType === 'SuperAdmin') {
      codigoCaso = caso.codigo || ''; // Asegúrate de que no sea undefined
    }

    // Verifica si el código del caso es válido
    if (!codigoCaso) {
      toast.add({
        severity: 'warn',
        summary: 'Código de Caso Inválido',
        detail: 'No se puede obtener actividades sin un código de caso válido.',
        life: 3000,
      });
      return;
    }

    const response = await axios.get(`${API}/activity/case/${codigoCaso}`);

    actividades.value = response.data.map((act: any) => ({
      id: act.Activity_ID,
      actividad: act.Activity_Name,
      ubicacion: act.Activity_Location,
      fecha: act.Activity_Start_Date,
      abogado: act.Internal_ID,
      duracion: act.Activity_Duration,
      referenciaExpediente: act.Activity_Reference_File,
      contraparte: act.Activity_Counterparty,
      juez: act.Activity_Judge_Name,
      tiempo: act.Activity_Start_Time,
      juzgado: act.Activity_Judged,
      estado: act.Activity_Status,
    }));

    console.log("Activities fetched for case:", codigoCaso, actividades.value);

    // Mostrar mensaje informativo si no hay actividades
    if (actividades.value.length === 0) {
      toast.add({
        severity: 'info',
        summary: 'Sin Actividades',
        detail: `No se encontraron actividades para el caso ${codigoCaso}`,
        life: 3000,
      });
    }

    // Asegúrate de que el modal se abra siempre
    visibleDialog.value = true;

  } catch (error) {
    console.error('Error al obtener las actividades:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudieron obtener las actividades del caso ${caso.codigo}`,
      life: 3000,
    });
  }
};

// Función para abrir el diálogo de nueva actividad
const abrirDialogoNuevaActividad = async () => {
  selectedActivityType.value = null; // Resetea el valor seleccionado
  // Llama a la función para cargar los tipos ANTES de mostrar el diálogo
  await fetchActivityTypes();
  visibleNuevaActividadDialog.value = true;
};

// Función para guardar la nueva actividad (esqueleto)
const guardarNuevaActividad = async () => {
  if (!selectedActivityType.value) {
    toast.add({ severity: 'warn', summary: 'Campo Requerido', detail: 'Por favor, selecciona un tipo de actividad.', life: 3000 });
    return;
  }

  // Aquí iría la lógica para recolectar todos los datos del formulario
  const nuevaActividadData = {
    Init_Code: selectedCaseCode.value, // El código del caso actual
    Type_Of_Activity_Id: selectedActivityType.value, // El ID del tipo seleccionado (coincide con optionValue)
    Internal_ID: authStore.user?.id, // El ID del abogado/usuario logueado
    // ... otros campos del formulario (nombre, fecha, ubicación, etc.)
    Activity_Name: 'Nombre de prueba', // Ejemplo, reemplazar con InputText
    Activity_Start_Date: new Date().toISOString(), // Ejemplo, reemplazar con Calendar
    // ... etc
  };

  console.log("Datos a guardar:", nuevaActividadData);

  try {
    // const response = await axios.post(`${API}/activity`, nuevaActividadData); // Ajusta la URL de tu API POST
    // console.log('Respuesta de guardado:', response.data);
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Actividad creada correctamente.', life: 3000 });

    visibleNuevaActividadDialog.value = false; // Cierra el diálogo
    // Opcional: Recargar la lista de actividades del caso actual
    // await verActividades({ codigo: selectedCaseCode.value });

  } catch (error) {
    console.error("Error al guardar la actividad:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la actividad.', life: 3000 });
  }
};

</script>

<template>
  <Toast />
  <ConfirmDialog />

  <div>
    <!-- Barra de Búsqueda -->
    <div class="flex items-center gap-4 mb-4">
      <InputText
        v-model="searchQuery"
        placeholder="Buscar por código, usuario o fecha"
        class="p-2 rounded-lg shadow-sm w-full max-w-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <Button
        icon="pi pi-search"
        class="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 focus:outline-none"
      />
    </div>

    <!-- Pestañas con TabView -->
    <TabView>
      <TabPanel header="Casos Activos" :value="0">
        <DataTable :value="casosActivosFiltrados" paginator :rows="8" class="w-full">
          <!-- Columnas Casos Activos -->
          <Column field="nro" header="Nro." />
          <Column field="codigo" header="Código del Caso" />
          <Column field="fecha" header="Fecha de Inicio" />
          <Column field="cedula" header="Cédula" />
          <Column field="usuario" header="Usuario">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                {{ slotProps.data.usuario }}
                <Button icon="pi pi-info-circle" class="p-button-text p-0" @click="verDetallesUsuario(slotProps.data.cedula)" />
              </div>
            </template>
          </Column>
          <Column field="caso" header="Caso" />
          <Column field="oficina" header="Oficina" />
          <Column field="tema" header="Tema" />
          <Column field="estado" header="Estado" />
          <Column field="tipocliente" header="Tipo de Cliente" />
          <Column field="actividades" header="Actividades">
            <template #body="slotProps">
              <Button label="Ver Actividades" icon="pi pi-eye" class="p-button-info" @click="verActividades(slotProps.data)" />
            </template>
          </Column>
          <Column header="Acciones">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button icon="pi pi-check" class="bg-green-500 text-white px-3 py-1 rounded-lg shadow hover:bg-green-600" @click="finalizarCaso(slotProps.data)" />
                <Button icon="pi pi-trash" class="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600" @click="eliminarCaso(slotProps.data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <TabPanel header="Casos Inactivos" :value="1">
        <DataTable :value="casosInactivosFiltrados" paginator :rows="8" class="w-full">
           <!-- Columnas Casos Inactivos -->
           <Column field="nro" header="Nro." />
          <Column field="codigo" header="Código del Caso" />
          <Column field="fecha" header="Fecha de Inicio" />
          <Column field="cedula" header="Cédula" />
          <Column field="usuario" header="Usuario">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                {{ slotProps.data.usuario }}
                <Button icon="pi pi-info-circle" class="p-button-text p-0" @click="verDetallesUsuario(slotProps.data.cedula)" />
              </div>
            </template>
          </Column>
          <Column field="caso" header="Caso" />
          <Column field="oficina" header="Oficina" />
          <Column field="tema" header="Tema" />
          <Column field="estado" header="Estado" />
          <Column field="tipocliente" header="Tipo de Cliente" />
          <Column field="actividades" header="Actividades">
            <template #body="slotProps">
              <Button label="Ver Actividades" icon="pi pi-eye" class="p-button-info" @click="verActividades(slotProps.data)" />
            </template>
          </Column>
          <Column header="Acciones">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button icon="pi pi-refresh" class="bg-yellow-500 text-white px-3 py-1 rounded-lg shadow hover:bg-yellow-600" @click="reactivarCaso(slotProps.data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>
    </TabView>

    <!-- Dialog para MOSTRAR Actividades -->
    <Dialog v-model:visible="visibleDialog" modal header="Actividades del Caso" class="p-6 rounded-lg shadow-lg bg-white max-w-5xl w-full">
      <div class="flex flex-col space-y-6">
        <!-- Botón para abrir el diálogo de nueva actividad -->
        <div class="flex justify-end">
          <Button
            label="Crear nueva actividad"
            icon="pi pi-plus"
            class="p-button-success"
            @click="abrirDialogoNuevaActividad"
          />
        </div>
      </div>
    </Dialog>

    <!-- Dialog para CREAR Nueva Actividad -->
    <Dialog v-model:visible="visibleNuevaActividadDialog" modal header="Crear Nueva Actividad" class="p-6 rounded-lg shadow-lg bg-white max-w-2xl w-full">
    <div class="space-y-4">
      <p>Nueva actividad para el caso: <strong>{{ selectedCaseCode }}</strong></p>

      <!-- Dropdown (Combobox) de Tipos de Actividad -->
      <div class="field">
        <label for="activityType" class="block text-sm font-semibold mb-1">Tipo de Actividad*</label>
        <Dropdown
          id="activityType"
          v-model="selectedActivityType"
          :options="activityTypeOptions"
          optionLabel="Type_Of_Activity_Name"
          optionValue="Type_Of_Activity_ID"
          placeholder="Selecciona un tipo"
          class="w-full"
          :loading="isLoadingActivityTypes"
          :showClear="true"
          :filter="activityTypeOptions.length > 10"
        />
      </div>

      <!-- Campos dinámicos -->
      <div v-for="field in dynamicFields" :key="field.Field_Of_Activity_Id" class="field">
  <!-- Label dinámico basado en la API -->
  <label :for="field.Field_Of_Activity_Name" class="block text-sm font-semibold mb-1">
    {{ field.Field_Of_Activity_Name }}
  </label>


  <!-- Renderiza el componente según el tipo de campo -->
  <InputText
    v-if="field.Field_Of_Activity_Type === 'Texto'"
    :id="field.Field_Of_Activity_Name"
    v-model="dynamicFieldValues[field.Field_Of_Activity_Name]"
    class="w-full"
  />

  <Calendar
    v-else-if="field.Field_Of_Activity_Type === 'Fecha'"
    :id="field.Field_Of_Activity_Name"
    v-model="dynamicFieldValues[field.Field_Of_Activity_Name]"
    class="w-full"
    dateFormat="dd/mm/yy"
  />

  <Dropdown
    v-else-if="field.Field_Of_Activity_Type === 'dropdown'"
    :id="field.Field_Of_Activity_Name"
    v-model="dynamicFieldValues[field.Field_Of_Activity_Name]"
    :options="field.Field_Of_Activity_Options"
    optionLabel="label"
    optionValue="value"
    class="w-full"
  />

  <!-- Agrega más componentes según sea necesario -->
</div>
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="visibleNuevaActividadDialog = false" />
      <Button label="Guardar" icon="pi pi-check" class="p-button-success" @click="guardarNuevaActividad" />
    </template>
  </Dialog>

    <!-- Dialog de Detalles del Usuario -->
    <Dialog v-model:visible="visibleUsuarioDialog" modal header="Detalles del Usuario" class="p-6 rounded-lg shadow-lg bg-white max-w-3xl w-full">
      <div class="space-y-4">
        <!-- Contenido del diálogo de detalles del usuario (sin cambios) -->
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Nombre</label>
            <p>{{ usuarioDetalles.User_FirstName }} {{ usuarioDetalles.User_LastName }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Cédula</label>
            <p>{{ usuarioDetalles.User_ID }}</p>
          </div>
        </div>
        <!-- ... resto de los campos de detalles del usuario ... -->
         <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Edad</label>
            <p>{{ usuarioDetalles.User_Age }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Género</label>
            <p>{{ usuarioDetalles.User_Gender }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Fecha de Nacimiento</label>
            <p>{{ usuarioDetalles.User_BirthDate ? new Date(usuarioDetalles.User_BirthDate).toLocaleDateString() : 'N/A' }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Nacionalidad</label>
            <p>{{ usuarioDetalles.User_Nationality }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Teléfono</label>
            <p>{{ usuarioDetalles.User_Phone }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Email</label>
            <p>{{ usuarioDetalles.User_Email }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Dirección</label>
            <p>{{ usuarioDetalles.User_Address }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Ciudad</label>
            <p>{{ usuarioDetalles.User_City }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Provincia</label>
            <p>{{ usuarioDetalles.User_Province }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Sector</label>
            <p>{{ usuarioDetalles.User_Sector }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Zona</label>
            <p>{{ usuarioDetalles.User_Zone }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Relación de Referencia</label>
            <p>{{ usuarioDetalles.User_ReferenceRelationship }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Nombre de Referencia</label>
            <p>{{ usuarioDetalles.User_ReferenceName }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Teléfono de Referencia</label>
            <p>{{ usuarioDetalles.User_ReferencePhone }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Beneficio Social</label>
            <p>{{ usuarioDetalles.User_SocialBenefit ? 'Sí' : 'No' }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Dependencia Económica</label>
            <p>{{ usuarioDetalles.User_EconomicDependence ? 'Sí' : 'No' }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Instrucción Académica</label>
            <p>{{ usuarioDetalles.User_Academic_Instruction }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Profesión</label>
            <p>{{ usuarioDetalles.User_Profession }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Estado Civil</label>
            <p>{{ usuarioDetalles.User_MaritalStatus }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Dependientes</label>
            <p>{{ usuarioDetalles.User_Dependents }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Nivel de Ingresos</label>
            <p>{{ usuarioDetalles.User_IncomeLevel }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Ingreso Familiar</label>
            <p>{{ usuarioDetalles.User_FamilyIncome }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Personas Económicamente Activas</label>
            <p>{{ usuarioDetalles.User_EconomicActivePeople }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Tipo de Vivienda</label>
            <p>{{ usuarioDetalles.User_HousingType }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Pensionado</label>
            <p>{{ usuarioDetalles.User_Pensioner }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Seguro de Salud</label>
            <p>{{ usuarioDetalles.User_HealthInsurance }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Situación Vulnerable</label>
            <p>{{ usuarioDetalles.User_VulnerableSituation }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Discapacidad</label>
            <p>{{ usuarioDetalles.User_Disability }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Porcentaje de Discapacidad</label>
            <p>{{ usuarioDetalles.User_DisabilityPercentage }}%</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Enfermedad Catastrófica</label>
            <p>{{ usuarioDetalles.User_CatastrophicIllness }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Documentos de Apoyo</label>
            <p>{{ usuarioDetalles.User_SupportingDocuments }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Documentos de Salud</label>
            <p>{{ usuarioDetalles.User_HealthDocuments }}</p>
          </div>
        </div>
        <div class="flex justify-end gap-4">
          <Button label="Cerrar" icon="pi pi-times" class="p-button-text" @click="visibleUsuarioDialog = false" />
        </div>
      </div>
    </Dialog>

  </div>
</template>
