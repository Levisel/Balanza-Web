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
import { useToast } from 'primevue/usetoast'; 

const toast = useToast();

//Estado del dialog y actividades
const visibleDialog = ref(false) 
const actividades = ref([])   
const visibleActividadDialog = ref(false)
const visibleDocumentoDialog = ref(false);
const documentoUrl = ref('');

// Obtener los casos
const casosActivos = ref([]);
const casosInactivos = ref([]);


const selectedCaseCode = ref('');
const abogadosActivos = ref([]);

// Obtener los datos de los usuarios
const obtenerNombreUsuario = async (userId) => {
  try {
    const response = await axios.get(`http://localhost:3000/usuario/${userId}`);
    return `${response.data.User_FirstName} ${response.data.User_LastName}`;
  } catch (error) {
    console.error(`Error al obtener el usuario con ID ${userId}:`, error);
    return "Usuario no encontrado";
  }
}

const obtenerCasos = async (estado) => {
  try {
    // Obtener el Internal_ID del usuario logueado
    const userResponse = await axios.get('http://localhost:3000/api/me');
    const internalID = userResponse.data.Internal_ID;

    const response = await axios.get(`http://localhost:3000/primerasconsultas/${estado}/${internalID}`);

    const casosConUsuarios = await Promise.all(response.data.map(async (caso, index) => {
      const nombreUsuario = await obtenerNombreUsuario(caso.User_ID);  // Obtener el nombre completo del usuario

      return {
        nro: index + 1,
        codigo: caso.Init_Code,
        fecha: new Date(caso.Init_Date).toLocaleDateString(),
        cedula: caso.User_ID,
        usuario: nombreUsuario,  // Se coloca el nombre completo del usuario
        caso: caso.Init_Topic,
        ciudad: caso.Init_Office,
        provincia: caso.Init_Subject,
        estado: caso.Init_Status ? 'Activo' : 'Inactivo',
        tipocliente: caso.Init_ClientType,
      }
    }));

    if (estado === 1) {
      casosActivos.value = casosConUsuarios;
    } else {
      casosInactivos.value = casosConUsuarios;
    }

  } catch (error) {
    console.error('Error al obtener los casos:', error)
  }
}

onMounted(() => {
  obtenerCasos(1); // Cargar casos activos
  obtenerCasos(0); // Cargar casos inactivos
  obtenerAbogadosActivos();
});

//Obtener las actividades según código del caso
const verActividades = async (caso) => {
  try {
    const codigoCaso = caso.codigo; // Init_Code que ya tienes en el objeto "caso"
    selectedCaseCode.value = codigoCaso; // Almacenar el Init_Code del caso seleccionado

    // Llamada directa a la API que trae actividades solo de ese caso
    const response = await axios.get(`http://localhost:3000/actividad/caso/${codigoCaso}`);

    // Mapear la respuesta a los campos que muestra la tabla de actividades
    actividades.value = response.data.map(act => ({
      id: act.Activity_ID, // Asegúrate de que este campo coincida con el nombre del campo de ID en tu respuesta
      actividad: act.Last_Activity,
      ubicacion: act.Location,
      fecha: act.Activity_Date,
      abogado: act.Activity_Type, // Cambia si tienes un campo específico para abogado
      duracion: act.Duration,
      referenciaExpediente: act.Reference_File,
      contraparte: act.Counterparty,
      juez: act.Judge_Name,
      tipo: act.Activity_Type,
      tiempo: act.Time,
      juzgado: act.Location,
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
const nuevaActividadEstado = ref('');
const documento = ref(null);

// Función para agregar una nueva actividad
const agregarNuevaActividad = async () => {
    try {
        if (!selectedCaseCode.value) {
            throw new Error('No se ha seleccionado ningún caso');
        }

        // Obtener el Internal_ID del usuario logueado
        const userResponse = await axios.get('http://localhost:3000/api/me');
        const internalID = userResponse.data.Internal_ID;

        const formData = new FormData();
        formData.append('Internal_ID', internalID); // Usar el valor obtenido
        formData.append('Init_Code', selectedCaseCode.value); // Usar el código del caso seleccionado
        formData.append('Activity_Type', nuevaActividadTipo.value);
        formData.append('Location', nuevaActividadUbicacion.value);
        
        if (nuevaActividadFecha.value) {
            formData.append('Activity_Date', nuevaActividadFecha.value);
        } else {
            throw new Error('La fecha de la actividad no puede estar vacía');
        }

        formData.append('Duration', nuevaActividadDuracion.value);
        formData.append('Counterparty', nuevaActividadContraparte.value);
        formData.append('Judge_Name', nuevaActividadJuez.value);
        formData.append('Reference_File', nuevaActividadReferenciaExpediente.value);
        formData.append('Status', nuevaActividadEstado.value);
        
        if (documento.value) {
            formData.append('file', documento.value);
        }

        console.log('FormData:', formData); // Log the FormData

        // Realizar la solicitud para agregar la actividad
        const response = await axios.post('http://localhost:3000/actividad', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
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

    } catch (error: unknown) {
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

// Función para ver el documento
const verDocumento = async (actividadId) => {
  try {
    const response = await axios.get(`http://localhost:3000/actividad/documento/${actividadId}`, {
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

const obtenerAbogadosActivos = async () => {
  try {
    const response = await axios.get('http://localhost:3000/usuariointerno/abogados/activos');
    abogadosActivos.value = response.data.map(abogado => ({
      label: `${abogado.Internal_Name} ${abogado.Internal_LastName}`,
      value: abogado.Internal_ID
    }));
  } catch (error) {
    console.error('Error al obtener los abogados activos:', error);
  }
};

</script>

<template>

<Toast />

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
    <DataTable :value="casosActivos" paginator :rows="8" class="w-full">
      <Column field="nro" header="Nro." />
      <Column field="codigo" header="Código del Caso" />
      <Column field="fecha" header="Fecha de Inicio" />
      <Column field="cedula" header="Cédula" />
      <Column field="usuario" header="Usuario" />
      <Column field="caso" header="Caso" />
      <Column field="ciudad" header="Ciudad" />
      <Column field="provincia" header="Provincia" />
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
          </div>
        </template>
      </Column>
    </DataTable>
  </TabPanel>

  <TabPanel header="Casos Inactivos" :value="1">
    <DataTable :value="casosInactivos" paginator :rows="8" class="w-full">
      <Column field="nro" header="Nro." />
      <Column field="codigo" header="Código del Caso" />
      <Column field="fecha" header="Fecha de Inicio" />
      <Column field="cedula" header="Cédula" />
      <Column field="usuario" header="Usuario" />
      <Column field="caso" header="Caso" />
      <Column field="ciudad" header="Ciudad" />
      <Column field="provincia" header="Provincia" />
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
      @click="visibleActividadDialog = true" 
    />
    
    <!-- Tabla de actividades -->
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
  <Column field="tipoactividad" header="Tipo" />
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
        <label for="contraparte" class="block text-sm font-semibold">Tipo</label>
        <input v-model="nuevaActividadTipo" id="tipo" type="text" class="p-inputtext p-component w-full" />
      </div>
      <div class="flex-1">
        <label for="juez" class="block text-sm font-semibold">Tiempo</label>
        <input v-model="nuevaActividadTiempo" id="tiempo" type="text" class="p-inputtext p-component w-full" />
      </div>
    </div>

    <div class="flex gap-4">
      <div class="flex-1">
        <label for="contraparte" class="block text-sm font-semibold">Juzgado</label>
        <input v-model="nuevaActividadJuzgado" id="juzgado" type="text" class="p-inputtext p-component w-full" />
      </div>
      <div class="flex-1">
        <label for="juez" class="block text-sm font-semibold">Estado</label>
        <input v-model="nuevaActividadEstado" id="estado" type="text" class="p-inputtext p-component w-full" />
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

  </div>
</template>
