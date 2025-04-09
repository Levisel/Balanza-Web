<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
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
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
//Importamos las interfaces de los archivos, que contiene las estructuras de los datos que se van a manejar
import type { User } from '@/ApiRoute';
import type { Internal_User } from '@/ApiRoute';
import type { Initial_Consultation } from '@/ApiRoute';
import type { Activity } from '@/ApiRoute';


const toast = useToast();
const confirm = useConfirm();
const authStore = useAuthStore();

//Detalles del Usuario
const visibleUsuarioDialog = ref<boolean>(false);

//USA LAS INTERFACES DE LOS ARCHIVOS DONDE ESTAN LAS VARIABLES DE LOS DATOS
const usuarioDetalles = ref<User>({} as User); //Se usan las interfaces del archivo ApiRoute.ts

//Estado del dialog y actividades
const visibleDialog = ref<boolean>(false);
const actividades = ref<any[]>([]);
const visibleActividadDialog = ref<boolean>(false);
const visibleDocumentoDialog = ref<boolean>(false);
const documentoUrl = ref<string>('');
const nuevaActividadEstadoText = ref<string>('En progreso');
const visibleActividadDetallesDialog = ref<boolean>(false);
const actividadDetalles = ref<any>({});

// Obtener los casos
const casosActivos = ref<any[]>([]);
const casosInactivos = ref<any[]>([]);
const selectedCaseCode = ref<string>('');
const abogadosActivos = ref<any[]>([]);

//Búsqueda
const searchQuery = ref<string>('');

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
    const casosConUsuarios = await Promise.all(asignacionesResponse.data.map(async (asignacion: { Init_Code: any; }, index: number) => {
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
        estado: caso.Init_Status,
        tipocliente: caso.Init_ClientType,
      }
    }));

    // Separar los casos activos e inactivos
    const casosActivosData = casosConUsuarios.filter(caso => caso.estado === 'Activo');
    const casosInactivosData = casosConUsuarios.filter(caso => caso.estado === 'Inactivo');

    // Asignar los casos a sus respectivas variables
    casosActivos.value = casosActivosData;
    casosInactivos.value = casosInactivosData;

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

      // Actualizar la lista de casos
      await obtenerCasos(); // Cargar casos activos
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
      Init_Status: 'Activo' // Cambio: Ahora se envía 1 para indicar "Activo"
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
      await obtenerCasos(); // Cargar casos activos
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

          // Actualizar la lista de casos
          await obtenerCasos(); // Cargar casos activos
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
const verActividades = async (caso: { codigo: any; }) => {
  try {
    const codigoCaso = caso.codigo; // Init_Code que ya tienes en el objeto "caso"
    selectedCaseCode.value = codigoCaso; // Almacenar el Init_Code del caso seleccionado

    // Llamada directa a la API que trae actividades solo de ese caso
    const response = await axios.get(`${API}/activity/case/${codigoCaso}`);

    // Mapear la respuesta a los campos que muestra la tabla de actividades
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
      aTiempo: act.Activity_OnTime,
      estado: act.Activity_Status,
      documento: act.Activity_Document, // This field will be used to check if a document exists
      hasDocument: act.Activity_Document !== null && act.Activity_Document !== undefined && act.Activity_Document !== "", // New field to check if a document exists
    }));

    console.log("Activities:", actividades.value); // Log the entire activities array

    // Mostrar un mensaje informativo si no hay actividades
    if (actividades.value.length === 0) {
      toast.add({
        severity: 'info',
        summary: 'Sin Actividades',
        detail: `No se encontraron actividades para el caso ${codigoCaso}`,
        life: 3000
      });
    }

    // Abre el diálogo de actividades incluso si no hay actividades
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
const nuevaActividadNombre = ref<string>('');
const nuevaActividadUbicacion = ref<string>('');
const nuevaActividadFecha = ref<Date | null>(null);
const nuevaActividadATiempo = ref<boolean>(false);
const nuevaActividadDuracion = ref<string>('');
const nuevaActividadReferenciaExpediente = ref<string>('');
const nuevaActividadContraparte = ref<string>('');
const nuevaActividadJuez = ref<string>('');
const nuevaActividadTiempo = ref<string>('');
const nuevaActividadJuzgado = ref<string>('');
const documento = ref(null);
const selectedFileName = ref<string | null>(null);


// Función para agregar una nueva actividad
const agregarNuevaActividad = async () => {
  try {
    if (!selectedCaseCode.value) {
      throw new Error('No se ha seleccionado ningún caso');
    }
    // Validar que el campo "Nombre de Actividad" no esté vacío
    if (!nuevaActividadNombre.value) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El campo "Nombre de Actividad" es obligatorio.',
        life: 3000,
      });
      return; // Detener la ejecución si el campo está vacío
    }
    // Validar que el campo "Hora de Inicio" no esté vacío
    if (!nuevaActividadTiempo.value) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El campo "Hora de Inicio" es obligatorio.',
        life: 3000,
      });
      return; // Detener la ejecución si el campo está vacío
    }

    // Obtener el Internal_ID del usuario logueado desde el authStore
    const internalID = authStore.user?.id;

    if (!internalID) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    const formData = new FormData();
    formData.append('Internal_ID', internalID); // Usar el valor obtenido
    formData.append('Init_Code', selectedCaseCode.value); // Usar el código del caso seleccionado

    formData.append('Activity_Name', nuevaActividadNombre.value); //Se agrega el nombre de la actividad
    if (nuevaActividadUbicacion.value) {
      formData.append('Activity_Location', nuevaActividadUbicacion.value);
    }
    if (nuevaActividadFecha.value) {
        const formattedDate = nuevaActividadFecha.value.toLocaleDateString('en-CA'); // 'en-CA' para YYYY-MM-DD
        formData.append('Activity_Start_Date', formattedDate);
    } else {
      throw new Error('La fecha de la actividad no puede estar vacía');
    }
    if (nuevaActividadTiempo.value) {
        const formattedTime = nuevaActividadTiempo.value;
        formData.append('Activity_Start_Time', formattedTime);
    }
    formData.append('Activity_Duration', nuevaActividadDuracion.value);
    if (nuevaActividadContraparte.value) {
      formData.append('Activity_Counterparty', nuevaActividadContraparte.value);
    }
    if (nuevaActividadJuez.value) {
      formData.append('Activity_Judge_Name', nuevaActividadJuez.value);
    }
    if (nuevaActividadReferenciaExpediente.value) {
      formData.append('Activity_Reference_File', nuevaActividadReferenciaExpediente.value);
    }
    if (nuevaActividadJuzgado.value) {
      formData.append('Activity_Judged', nuevaActividadJuzgado.value); // Asegúrate de que el campo juzgado se esté agregando
    }
    formData.append('Activity_Status', nuevaActividadEstadoText.value); // Asegúrate de que el estado se esté agregando
    
    formData.append('Activity_OnTime', nuevaActividadATiempo.value);
    if (documento.value) {
      formData.append('file', documento.value);
    }

    // Realizar la solicitud para agregar la actividad
    const response = await axios.post(`${API}/activity`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Internal-ID': internalID
      },
    });

    toast.add({
      severity: 'success',
      summary: 'Actividad Agregada',
      detail: 'La actividad fue agregada con éxito.',
      life: 3000,
    });

    // Close the dialog
    visibleActividadDialog.value = false;

    await verActividades({ codigo: selectedCaseCode.value }); // Recargar actividades del caso seleccionado

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

// Función para ver los detalles de la actividad
const verDetallesActividad = async (actividadId: any) => {
  try {
    const response = await axios.get(`${API}/activity/${actividadId}`);
    actividadDetalles.value = response.data;
    visibleActividadDetallesDialog.value = true;
  } catch (error) {
    console.error('Error al obtener los detalles de la actividad:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron obtener los detalles de la actividad.',
      life: 3000,
    });
  }
};

// Función para marcar la actividad como completada
const marcarActividadComoCompletada = async (actividad: { id: any; }) => {
  confirm.require({
    message: `¿Estás seguro de que deseas marcar la actividad ${actividad.id} como completada?`,
    header: 'Confirmación',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        const internalID = authStore.user?.id;

        if (!internalID) {
          throw new Error('No se pudo obtener el ID del usuario');
        }

        const response = await axios.put(`${API}/activity/${actividad.id}`, {
          Activity_Status: 'Completado'
        }, {
          headers: {
            'Internal-ID': internalID,
          }
        });

        if (response.status === 200) {
          toast.add({
            severity: 'success',
            summary: 'Actividad Completada',
            detail: `La actividad ${actividad.id} ha sido marcada como completada.`,
            life: 3000,
          });

          // Actualizar la lista de actividades
          await verActividades({ codigo: selectedCaseCode.value }); // Recargar actividades del caso seleccionado
        } else {
          throw new Error(`Error al marcar la actividad como completada: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error al marcar la actividad como completada:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo marcar la actividad ${actividad.id} como completada.`,
          life: 3000,
        });
      }
    },
    reject: () => {
      toast.add({
        severity: 'info',
        summary: 'Cancelado',
        detail: 'Acción cancelada',
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
  selectedFileName.value = event.files[0].name; //Se guarda el nombre del archivo
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
          <Column field="id" header="ID de Actividad" class="text-center" headerClass="text-center" />
          <Column field="actividad" header="Actividad" class="text-center" headerClass="text-center" />
          <Column field="ubicacion" header="Ubicación" class="text-center" headerClass="text-center" />
          <Column field="fecha" header="Fecha de Inicio" class="text-center" headerClass="text-center">
            <template #body="slotProps">
              <div class="text-center">
                {{ new Date(slotProps.data.fecha).toLocaleDateString() }}
              </div>
            </template>
          </Column>
          <Column field="abogado" header="Abogado Asignado" class="text-center" headerClass="text-center">
            <template #body="slotProps">
              <div class="text-center">
                {{ slotProps.data.abogado }}
              </div>
            </template>
          </Column>
          <Column field="duracion" header="Duración" class="text-center" headerClass="text-center" />
          <Column field="referenciaExpediente" header="Referencia Expediente" class="text-center" headerClass="text-center" />
          <Column field="contraparte" header="Contraparte" class="text-center" headerClass="text-center" />
          <Column field="juez" header="Juez Asignado" class="text-center" headerClass="text-center" />
          <Column field="tiempo" header="Tiempo" class="text-center" headerClass="text-center" />
          <Column field="juzgado" header="Juzgado" class="text-center" headerClass="text-center" />
          <Column field="estado" header="Estado" class="text-center" headerClass="text-center" />
          <Column
            field="documento"
            header="Documento"
            class="text-center"
            headerClass="text-center"
          >
            <template #body="slotProps">
              <div class="flex justify-center">
                <Button
                  v-if="slotProps.data.hasDocument"
                  label="Ver Documento"
                  icon="pi pi-file"
                  class="p-button-info"
                  @click="verDocumento(slotProps.data.id)"
                />
                <span v-else>N/A</span>
              </div>
            </template>
          </Column>
          <Column header="Acciones" class="text-center" headerClass="text-center">
            <template #body="slotProps">
              <div class="flex justify-center gap-2">
                <Button icon="pi pi-info-circle" class="bg-blue-500 text-white px-3 py-1 rounded-lg shadow hover:bg-blue-600" @click="verDetallesActividad(slotProps.data.id)" />
                <Button icon="pi pi-check" class="bg-green-500 text-white px-3 py-1 rounded-lg shadow hover:bg-green-600" @click="marcarActividadComoCompletada(slotProps.data)" />
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
    <Dialog v-model:visible="visibleActividadDialog" modal header="Nueva Actividad"
      class="p-6 rounded-lg shadow-lg max-w-4xl w-full">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="nombre" class="block text-sm font-semibold">Nombre de Actividad</label>
          <InputText v-model="nuevaActividadNombre" id="nombre" type="text" class="p-inputtext p-component w-full" />
        </div>
        <div>
          <label for="fecha" class="block text-sm font-semibold">Fecha de Inicio</label>
          <Calendar v-model="nuevaActividadFecha" id="fecha" type="text" class="w-full" />
        </div>
        <div>
          <label for="hora" class="block text-sm font-semibold">Hora de Inicio</label>
          <InputText v-model="nuevaActividadTiempo" id="hora"  class="w-full" />
        </div>
        <div>
          <label for="ubicacion" class="block text-sm font-semibold">Ubicación</label>
          <InputText v-model="nuevaActividadUbicacion" id="ubicacion" type="text"
            class="p-inputtext p-component w-full" />
        </div>
        <div>
          <label for="duracion" class="block text-sm font-semibold">Duración</label>
          <InputText v-model="nuevaActividadDuracion" id="duracion" type="text" class="w-full" />
        </div>
        <div>
          <label for="contraparte" class="block text-sm font-semibold">Contraparte</label>
          <InputText v-model="nuevaActividadContraparte" id="contraparte" type="text"
            class="p-inputtext p-component w-full" />
        </div>
        <div>
          <label for="juzgado" class="block text-sm font-semibold">Juzgado</label>
          <InputText v-model="nuevaActividadJuzgado" id="juzgado" type="text"
            class="p-inputtext p-component w-full" />
        </div>
        <div>
          <label for="juez" class="block text-sm font-semibold">Nombre del Juez</label>
          <InputText v-model="nuevaActividadJuez" id="juez" type="text" class="p-inputtext p-component w-full" />
        </div>
        <div>
          <label for="referencia" class="block text-sm font-semibold">Referencia de Archivo</label>
          <InputText v-model="nuevaActividadReferenciaExpediente" id="referencia" type="text"
            class="p-inputtext p-component w-full" />
        </div>
        <div>
          <label for="estado" class="block text-sm font-semibold">Estado</label>
          <InputText v-model="nuevaActividadEstadoText" id="estado" type="text"
            class="p-inputtext p-component w-full" />
        </div>
        <div class="flex items-center">
          <Checkbox v-model="nuevaActividadATiempo" id="aTiempo" :binary="true" />
          <label for="aTiempo" class="ml-2 text-sm font-semibold">A tiempo</label>
        </div>
        <div class="col-span-2">
          <label for="documento" class="block text-sm font-semibold">Documento</label>
          <FileUpload
            name="documento"
            :maxFileSize="10000000"
            accept=".pdf"
            :chooseLabel="'Seleccionar Archivo'"
            :cancelLabel="'Cancelar'"
            :uploadLabel="'Subir'"
            mode="basic"
            @select="onUploadDocumento"
            class="w-full"
          />
        </div>
      </div>


      <div class="flex justify-end gap-4 mt-4">
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text"
          @click="visibleActividadDialog = false" />
        <Button label="Agregar" icon="pi pi-check" class="p-button-success" @click="agregarNuevaActividad" />
      </div>
    </Dialog>

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

    <!-- Dialog para ver los detalles de la actividad -->
    <Dialog v-model:visible="visibleActividadDetallesDialog" modal header="Detalles de la Actividad" class="p-6 rounded-lg shadow-lg bg-white max-w-3xl w-full">
      <div class="space-y-4">
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">ID de Actividad</label>
            <p>{{ actividadDetalles.Activity_ID }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Nombre de Actividad</label>
            <p>{{ actividadDetalles.Activity_Name }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Ubicación</label>
            <p>{{ actividadDetalles.Activity_Location }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Fecha de Inicio</label>
            <p>{{ new Date(actividadDetalles.Activity_Start_Date).toLocaleDateString() }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Hora de Inicio</label>
            <p>{{ actividadDetalles.Activity_Start_Time }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Duración</label>
            <p>{{ actividadDetalles.Activity_Duration }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Referencia de Expediente</label>
            <p>{{ actividadDetalles.Activity_Reference_File }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Contraparte</label>
            <p>{{ actividadDetalles.Activity_Counterparty }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Juez Asignado</label>
            <p>{{ actividadDetalles.Activity_Judge_Name }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">Juzgado</label>
            <p>{{ actividadDetalles.Activity_Judged }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold">Estado</label>
            <p>{{ actividadDetalles.Activity_Status }}</p>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold">A Tiempo</label>
            <p>{{ actividadDetalles.Activity_OnTime ? 'Sí' : 'No' }}</p>
          </div>
        </div>
      </div>
    </Dialog>

  </div>
</template>
