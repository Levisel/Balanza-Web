<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Calendar from 'primevue/calendar';
import FileUpload from 'primevue/fileupload';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Toast from 'primevue/toast'; 
import ConfirmDialog from 'primevue/confirmdialog';
import { useToast } from 'primevue/usetoast'; 
import { useAuthStore } from '@/stores/auth';
import { API } from "@/ApiRoute";
import { useConfirm } from 'primevue/useconfirm';
//Importamos las interfaces de los archivos, que contiene las estructuras de los datos que se van a manejar
import type { User } from '@/ApiRoute';
import type { Internal_User } from '@/ApiRoute';
import type { Initial_Consultation } from '@/ApiRoute';
import type { Activity } from '@/ApiRoute';


const toast = useToast();
const confirm = useConfirm();
const authStore = useAuthStore();

//Detalles del Usuario
const visibleUsuarioDialog = ref(false);

//USA LAS INTERFACES DE LOS ARCHIVOS DONDE ESTAN LAS VARIABLES DE LOS DATOS
const usuarioDetalles = ref<User>({} as User); //Se usan las interfaces del archivo ApiRoute.ts
const casoDetalles = ref<Initial_Consultation>({} as Initial_Consultation);
const actividadDetalles = ref<Activity>({} as Activity);
const usuarioInternoDetalles = ref<Internal_User>({} as Internal_User);

//Estado del dialog y actividades
const visibleDialog = ref(false) 
const actividades = ref([])   
const visibleActividadDialog = ref(false)
const visibleDocumentoDialog = ref(false);
const documentoUrl = ref('');
const nuevaActividadEstadoText = ref('En progreso');

// Obtener los casos
const casosActivos = ref([]);
const casosInactivos = ref([]);
const selectedCaseCode = ref('');
const abogadosActivos = ref([]);

//Búsqueda
const searchQuery = ref('');

const filtrarCasos = (casos, query) => {
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
const obtenerNombreUsuario = async (userId) => {
  try {
    const response = await axios.get(`${API}/user/${userId}`);
    return `${response.data.User_FirstName} ${response.data.User_LastName}`;
  } catch (error) {
    console.error(`Error al obtener el usuario con ID ${userId}:`, error);
    return "Usuario no encontrado";
  }
}

const verDetallesUsuario = async (cedula) => {
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
    // Obtener el Internal_ID del usuario logueado desde el authStore
    const internalID = authStore.user?.id;

    if (!internalID) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    // Obtener los datos de las asignaciones usando el internal_id
    const asignacionesResponse = await axios.get(`${API}/assignment/studentid/${internalID}`);

    console.log('asignacionesResponse:', asignacionesResponse.data); // Verificar la respuesta de asignaciones

    if (!asignacionesResponse.data || asignacionesResponse.data.length === 0) {
      throw new Error('No se encontraron asignaciones para el usuario');
    }

    // Obtener los detalles de cada caso usando los init_code
    const casosConUsuarios = await Promise.all(asignacionesResponse.data.map(async (asignacion, index) => {
      const consultaResponse = await axios.get(`${API}/initial-consultations/${asignacion.Init_Code}`);
      const caso = consultaResponse.data;

      if (!caso) {
        throw new Error(`No se encontraron detalles para el init_code ${asignacion.Init_Code}`);
      }

      const nombreUsuario = await obtenerNombreUsuario(caso.User_ID);

      return {
        nro: index + 1,
        codigo: caso.Init_Code,
        fecha: new Date(caso.Init_Date).toLocaleDateString(),
        cedula: caso.User_ID,
        usuario: nombreUsuario,  // Se coloca el nombre completo del usuario
        caso: caso.Init_Topic,
        oficina: caso.Init_Office,
        tema: caso.Init_Subject,
        estado: caso.Init_Status ? 'Activo' : 'Inactivo',
        tipocliente: caso.Init_ClientType,
      }
    }));

    // Asignar todos los casos a casosActivos
    casosActivos.value = casosConUsuarios;

  } catch (error) {
    console.error('Error al obtener los casos:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron obtener los casos.',
      life: 3000,
    });
  }
}

onMounted(() => {
  obtenerCasos(); // Cargar todos los casos en la tabla de casos activos
  obtenerAbogadosActivosPorArea(); // Obtener abogados activos por área
});

const finalizarCaso = async (caso: { codigo: any; }) => {
  try {
    const internalID = authStore.user?.id;

    if (!internalID) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    const response = await axios.put(`${API}/initial-consultations/${caso.codigo}`, {
      Init_Status: 0
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

      // Actualizar la lista de casos
      await obtenerCasos(1); // Cargar casos activos
      await obtenerCasos(0); // Cargar casos inactivos
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
      Init_Status: 1
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

      // Actualizar la lista de casos
      await obtenerCasos(1); // Cargar casos activos
      await obtenerCasos(0); // Cargar casos inactivos
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

const eliminarCaso = (caso) => {
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

          // Actualizar la lista de casos
          await obtenerCasos(1); // Cargar casos activos
          await obtenerCasos(0); // Cargar casos inactivos
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

//Obtener las actividades según código del caso
const verActividades = async (caso) => {
  try {
    const codigoCaso = caso.codigo; // Init_Code que ya tienes en el objeto "caso"
    selectedCaseCode.value = codigoCaso; // Almacenar el Init_Code del caso seleccionado

    // Llamada directa a la API que trae actividades solo de ese caso
    const response = await axios.get(`${API}/activity/case/${codigoCaso}`);

    if (!response.data || response.data.length === 0) {
      throw new Error(`No se encontraron actividades para el caso ${codigoCaso}`);
    }

    // Mapear la respuesta a los campos que muestra la tabla de actividades
    actividades.value = response.data.map((act) => ({
      id: act.Activity_ID,
      actividad: act.Activity_Type,
      ubicacion: act.Location,
      fecha: act.Activity_Date,
      abogado: act.Internal_ID, // Cambia si tienes un campo específico para abogado
      duracion: act.Duration,
      referenciaExpediente: act.Reference_File,
      contraparte: act.Counterparty,
      juez: act.Judge_Name,
      tipo: act.Activity_Type,
      tiempo: act.Time,
      estado: act.Status,
      documento: act.Documents
    }));

    // Verificar si hay actividades o no
    if (actividades.value.length === 0) {
      toast.add({
        severity: 'info',
        summary: 'Sin Actividades',
        detail: `No se encontraron actividades para el caso ${codigoCaso}`,
        life: 3000
      });
    }

    // Abre el dialog de actividades
    visibleDialog.value = true;

  } catch (error) {
    console.error('Error al obtener las actividades:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudieron obtener las actividades del caso ${caso.codigo}`,
      life: 3000
    });
  }
};

//Agregar nueva actividad
// Estado de la actividad
const nuevaActividadTipo = ref('');
const nuevaActividadUbicacion = ref('');
const nuevaActividadFecha = ref(null);
const nuevaActividadAbogado = ref('');
const nuevaActividadDuracion = ref('');
const nuevaActividadReferenciaExpediente = ref('');
const nuevaActividadContraparte = ref('');
const nuevaActividadJuez = ref('');
const nuevaActividadTiempo = ref('');
const nuevaActividadJuzgado = ref('');
const documento = ref(null);

// Función para agregar una nueva actividad
const agregarNuevaActividad = async () => {
  try {
    if (!selectedCaseCode.value) {
      throw new Error('No se ha seleccionado ningún caso');
    }

    // Obtener el Internal_ID del usuario logueado desde el authStore
    const internalID = authStore.user?.id;

    if (!internalID) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    const formData = new FormData();
    formData.append('Internal_ID', internalID); // Usar el valor obtenido
    formData.append('Init_Code', selectedCaseCode.value); // Usar el código del caso seleccionado

    if (nuevaActividadTipo.value) {
      formData.append('Activity_Type', nuevaActividadTipo.value);
    }
    if (nuevaActividadUbicacion.value) {
      formData.append('Location', nuevaActividadUbicacion.value);
    }
    if (nuevaActividadFecha.value) {
      formData.append('Activity_Date', nuevaActividadFecha.value);
    } else {
      throw new Error('La fecha de la actividad no puede estar vacía');
    }
    if (nuevaActividadDuracion.value) {
      formData.append('Duration', nuevaActividadDuracion.value);
    }
    if (nuevaActividadContraparte.value) {
      formData.append('Counterparty', nuevaActividadContraparte.value);
    }
    if (nuevaActividadJuez.value) {
      formData.append('Judge_Name', nuevaActividadJuez.value);
    }
    if (nuevaActividadReferenciaExpediente.value) {
      formData.append('Reference_File', nuevaActividadReferenciaExpediente.value);
    }
    if (nuevaActividadJuzgado.value) {
      formData.append('Judged', nuevaActividadJuzgado.value); // Asegúrate de que el campo juzgado se esté agregando
    }
    formData.append('Status', nuevaActividadEstadoText.value); // Asegúrate de que el estado se esté agregando
    if (documento.value) {
      formData.append('file', documento.value);
    }

    console.log('FormData:', formData); // Log the FormData

    // Realizar la solicitud para agregar la actividad
    const response = await axios.post(`${API}/activity`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Internal-ID': internalID
      },
    });

    console.log('Response:', response); // Log the response

    toast.add({
      severity: 'success',
      summary: 'Actividad Agregada',
      detail: 'La actividad fue agregada con éxito.',
      life: 3000,
    });

    // Close the dialog
    visibleActividadDialog.value = false;

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo agregar la actividad.',
      life: 3000,
    });
    console.error('Error al agregar la actividad:', error);

    if (axios.isAxiosError(error)) {
      console.error('Error response data:', error.response?.data); // Log the response data
      console.error('Error response status:', error.response?.status); // Log the response status
      console.error('Error response headers:', error.response?.headers); // Log the response headers
    } else {
      console.error('Unexpected error:', error);
    }
  }
};

const eliminarActividad = (actividad: { id: any; }) => {
  confirm.require({
    message: `¿Estás seguro de que deseas eliminar la actividad ${actividad.id}?`,
    header: 'Confirmación',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        const internalID = authStore.user?.id;

        if (!internalID) {
          throw new Error('No se pudo obtener el ID del usuario');
        }

        const response = await axios.delete(`${API}/activity/${actividad.id}`, {
          headers: {
            'Internal-ID': internalID,
          }
        });

        if (response.status === 200) {
          toast.add({
            severity: 'success',
            summary: 'Actividad Eliminada',
            detail: `La actividad ${actividad.id} ha sido eliminada.`,
            life: 3000,
          });

          // Actualizar la lista de actividades
          await verActividades({ codigo: selectedCaseCode.value }); // Recargar actividades del caso seleccionado
        } else {
          throw new Error(`Error al eliminar la actividad: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error al eliminar la actividad:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo eliminar la actividad ${actividad.id}.`,
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

// Función para ver el documento
const verDocumento = async (actividadId: any) => {
  try {
    const response = await axios.get(`${API}/activity/document/${actividadId}`, {
      responseType: 'blob'
    });

    if (response.status === 200) {
      const contentType = response.headers['content-type'] || 'application/pdf';
const blob = new Blob([response.data], { type: contentType });
      documentoUrl.value = URL.createObjectURL(blob);
      visibleDocumentoDialog.value = true;
    } else {
      throw new Error(`Error al obtener el documento: ${response.statusText}`);
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cargar el documento PDF.',
      life: 3000
    });
    console.error('Error al cargar el documento PDF:', error);

    if (axios.isAxiosError(error)) {
      console.error('Error response data:', error.response?.data); // Log the response data
      console.error('Error response status:', error.response?.status); // Log the response status
      console.error('Error response headers:', error.response?.headers); // Log the response headers
    } else {
      console.error('Unexpected error:', error);
    }
  }
};

//Subir documento
const onUploadDocumento = (event: any) => {
  documento.value = event.files[0]; // Asigna el archivo seleccionado a documento.value
};

const obtenerAbogadosActivosPorArea = async () => {
  try {
    // Obtener el área del usuario logueado desde el authStore
    const area = authStore.user?.area;

    if (!area) {
      throw new Error('No se pudo obtener el área del usuario');
    }

    const response = await axios.get(`${API}/usuariointerno/abogados/activos/${area}`);
    abogadosActivos.value = response.data.map((abogado: { Internal_Name: any; Internal_LastName: any; Internal_ID: any; }) => ({
      label: `${abogado.Internal_Name} ${abogado.Internal_LastName}`,
      value: abogado.Internal_ID
    }));
  } catch (error) {
    console.error('Error al obtener los abogados activos:', error);
  }
};

const abrirDialogoNuevaActividad = () => {
  visibleActividadDialog.value = true; // Abrir el diálogo de nueva actividad
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
      <Button icon="pi pi-trash" class="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600" @click="eliminarCaso(slotProps.data)" />
    </div>
  </template>
</Column>
  </DataTable>
</TabPanel>
</TabView>

<!-- Dialog de Actividades con fecha -->
<Dialog v-model:visible="visibleDialog" modal header="Actividades del Caso" class="p-6 rounded-lg shadow-lg bg-white max-w-5xl w-full">
  <div class="flex flex-col space-y-6">
    <!-- Botón para agregar nueva actividad -->
    <Button 
    label="Agregar Nueva Actividad" 
    icon="pi pi-plus" 
    class="p-button-success mb-4" 
    @click="abrirDialogoNuevaActividad" 
    />
    
    <!-- Tabla de actividades -->
    <DataTable :value="actividades" class="p-datatable-gridlines w-full">
  <Column field="id" header="ID de Actividad" />
  <Column field="actividad" header="Actividad" />
  <Column field="ubicacion" header="Ubicación" />
  <Column field="fecha" header="Fecha">
    <template #body="slotProps">
      {{ new Date(slotProps.data.fecha).toLocaleDateString() }}
    </template>
  </Column>
  <Column field="abogado" header="Abogado Asignado">
    <template #body="slotProps">
      {{ slotProps.data.abogado }}
    </template>
  </Column>
  <Column field="duracion" header="Duración" />
  <Column field="referenciaExpediente" header="Referencia Expediente" />
  <Column field="contraparte" header="Contraparte" />
  <Column field="juez" header="Juez Asignado" />
  <Column field="tipo" header="Tipo" />
  <Column field="tiempo" header="Tiempo" />
  <Column field="juzgado" header="Juzgado" />
  <Column field="estado" header="Estado" />
  <Column field="documento" header="Documento">
    <template #body="slotProps">
      <Button 
        label="Ver Documento" 
        icon="pi pi-file" 
        class="p-button-info" 
        @click="verDocumento(slotProps.data.id)" 
      />
    </template>
  </Column>
  <Column header="Acciones">
    <template #body="slotProps">
      <div class="flex gap-2">
        <Button icon="pi pi-trash" class="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600" @click="eliminarActividad(slotProps.data)" />
      </div>
    </template>
  </Column>
</DataTable>
  </div>
</Dialog>

<!-- Dialog para visualizar el documento PDF -->
<Dialog v-model:visible="visibleDocumentoDialog" modal header="Documento de la Actividad" class="p-6 rounded-lg shadow-lg bg-white max-w-7xl w-full">
  <iframe :src="documentoUrl" class="w-full h-250" frameborder="0"></iframe>
</Dialog>

    <!-- Dialog de Nueva Actividad -->
    <Dialog v-model:visible="visibleActividadDialog" modal header="Nueva Actividad" class="p-6 rounded-lg shadow-lg">
  <div class="space-y-4">
    <div class="flex gap-4">
      <div class="flex-1">
        <label for="tipo" class="block text-sm font-semibold">Tipo de Actividad</label>
        <input v-model="nuevaActividadTipo" id="tipo" type="text" class="p-inputtext p-component w-full" />
      </div>
      <div class="flex-1">
        <label for="ubicacion" class="block text-sm font-semibold">Ubicación</label>
        <input v-model="nuevaActividadUbicacion" id="ubicacion" type="text" class="p-inputtext p-component w-full" />
      </div>
    </div>

    <div class="flex gap-4">
      <div class="flex-1">
        <label for="fecha" class="block text-sm font-semibold">Fecha</label>
        <Calendar v-model="nuevaActividadFecha" id="fecha" class="w-full" />
      </div>
      <div class="flex-1">
        <label for="abogado" class="block text-sm font-semibold">Abogado Asignado</label>
        <Dropdown v-model="nuevaActividadAbogado" :options="abogadosActivos" optionLabel="label" optionValue="value" placeholder="Seleccionar Abogado" class="w-full" />
      </div>
    </div>

    <div class="flex gap-4">
      <div class="flex-1">
        <label for="duracion" class="block text-sm font-semibold">Duración</label>
        <input v-model="nuevaActividadDuracion" id="duracion" type="text" class="p-inputtext p-component w-full" />
      </div>
      <div class="flex-1">
        <label for="referenciaExpediente" class="block text-sm font-semibold">Referencia Expediente</label>
        <input v-model="nuevaActividadReferenciaExpediente" id="referenciaExpediente" type="text" class="p-inputtext p-component w-full" />
      </div>
    </div>

    <div class="flex gap-4">
      <div class="flex-1">
        <label for="contraparte" class="block text-sm font-semibold">Contraparte</label>
        <input v-model="nuevaActividadContraparte" id="contraparte" type="text" class="p-inputtext p-component w-full" />
      </div>
      <div class="flex-1">
        <label for="juez" class="block text-sm font-semibold">Juez Asignado</label>
        <input v-model="nuevaActividadJuez" id="juez" type="text" class="p-inputtext p-component w-full" />
      </div>
    </div>

    <div class="flex gap-4">
      <div class="flex-1">
        <label for="tiempo" class="block text-sm font-semibold">Tiempo</label>
        <input v-model="nuevaActividadTiempo" id="tiempo" type="text" class="p-inputtext p-component w-full" />
      </div>
      <div class="flex-1">
        <label for="juzgado" class="block text-sm font-semibold">Juzgado</label>
        <input v-model="nuevaActividadJuzgado" id="juzgado" type="text" class="p-inputtext p-component w-full" />
      </div>
    </div>

    <div class="flex gap-4">
      <div class="flex-1">
        <label for="estado" class="block text-sm font-semibold">Estado</label>
        <input v-model="nuevaActividadEstadoText" id="estado" type="text" class="p-inputtext p-component w-full" disabled />
      </div>
    </div>

    <!-- Campo de carga de documento -->
    <div class="flex-1">
      <label for="documento" class="block text-sm font-semibold">Subir Documento</label>
      <FileUpload 
        mode="basic" 
        name="documento" 
        accept=".pdf,.doc,.docx" 
        chooseLabel="Seleccionar Archivo" 
        class="w-full" 
        @select="onUploadDocumento"
      />
    </div>
    
    <div class="flex justify-end gap-4">
      <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="visibleActividadDialog = false" />
      <Button label="Agregar" icon="pi pi-check" class="p-button-success" @click="agregarNuevaActividad" />
    </div>
  </div>
</Dialog>

<!-- filepath: c:\Users\Alex.DESKTOP-BU9JACC\Desktop\BalanzaFinal\Balanza-Web\src\views\SideBar\Cases\MyCases.vue -->
<Dialog v-model:visible="visibleUsuarioDialog" modal header="Detalles del Usuario" class="p-6 rounded-lg shadow-lg bg-white max-w-3xl w-full">
  <div class="space-y-4">
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
        <p>{{ new Date(usuarioDetalles.User_BirthDate).toLocaleDateString() }}</p>
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
