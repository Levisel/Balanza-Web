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

// Obtener los casos
const casosActivos = ref([])

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

const obtenerCasos = async () => {
  try {
    const response = await axios.get('http://localhost:3000/primerasconsultas')

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

    casosActivos.value = casosConUsuarios;

  } catch (error) {
    console.error('Error al obtener los casos:', error)
  }
}

onMounted(() => {
  obtenerCasos()
})

//Obtener las actividades según código del caso
const verActividades = async (caso) => {
  try {
    const codigoCaso = caso.codigo // Init_Code que ya tienes en el objeto "caso"

    // Llamada directa a la API que trae actividades solo de ese caso
    const response = await axios.get(`http://localhost:3000/actividad/caso/${codigoCaso}`)

    // Mapear la respuesta a los campos que muestra la tabla de actividades
    actividades.value = response.data.map(act => ({
      actividad: act.Last_Activity,
      ubicacion: act.Location,
      fecha: act.Activity_Date,
      abogado: act.Activity_Type, // Cambia si tienes un campo específico para abogado
      duracion: act.Duration,
      referenciaExpediente: act.Reference_File,
      contraparte: act.Counterparty,
      juez: act.Judge_Name,
      documento: act.Documents
    }))

    // Verificar si hay actividades o no
    if (actividades.value.length === 0) {
      toast.add({
        severity: 'info',
        summary: 'Sin Actividades',
        detail: `No se encontraron actividades para el caso ${codigoCaso}`,
        life: 3000
      })
    }

    // Abre el dialog de actividades
    visibleDialog.value = true

  } catch (error) {
    console.error('Error al obtener las actividades:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudieron obtener las actividades del caso ${caso.codigo}`,
      life: 3000
    })
  }
}

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
const nuevaActividadTipo1 = ref('');
const nuevaActividadTiempo = ref('');
const nuevaActividadJuzgado = ref('');
const nuevaActividadEstado = ref('');
const documento = ref(null);

// Función para agregar una nueva actividad
const agregarNuevaActividad = async () => {
  try {
    const actividadData = {
      tipo: nuevaActividadTipo.value,
      ubicacion: nuevaActividadUbicacion.value,
      fecha: nuevaActividadFecha.value,
      abogado: nuevaActividadAbogado.value,
      duracion: nuevaActividadDuracion.value,
      referenciaExpediente: nuevaActividadReferenciaExpediente.value,
      contraparte: nuevaActividadContraparte.value,
      juez: nuevaActividadJuez.value,
      tipoactividad: nuevaActividadTipo.value,
      tiempo: nuevaActividadTiempo.value,
      juzgado: nuevaActividadJuzgado.value,
      estado: nuevaActividadEstado.value,
      documento: documento.value, // Si es necesario, agregar la URL del documento cargado
    };

    // Realizar la solicitud para agregar la actividad
    const response = await axios.post('http://localhost:3000/actividad', actividadData);
    toast.add({
      severity: 'success',
      summary: 'Actividad Agregada',
      detail: 'La actividad fue agregada con éxito.',
      life: 3000,
    });
    visibleActividadDialog.value = false; // Cerrar el diálogo
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo agregar la actividad.',
      life: 3000,
    });
    console.error('Error al agregar la actividad:', error);
  }
};

//Subir documento
const onUploadDocumento = async (event) => {
  const formData = new FormData();
  formData.append('documento', event.files[0]);  // 'documento' es el nombre del campo

  try {
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Archivo cargado', response);
  } catch (error) {
    console.error('Error al cargar archivo', error);
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
          <Button icon="pi pi-inbox" class="bg-yellow-500 text-white px-3 py-1 rounded-lg shadow hover:bg-yellow-600" @click="archivarCaso(slotProps.data)" />
          <Button icon="pi pi-check" class="bg-green-500 text-white px-3 py-1 rounded-lg shadow hover:bg-green-600" @click="finalizarCaso(slotProps.data)" />
        </div>
      </template>
    </Column>
  </DataTable>
      </TabPanel>

      <TabPanel header="Casos Archivados" :value="1">
        <DataTable :value="casosArchivados" paginator :rows="8" class="w-full">
          <Column field="nro" header="Nro." />
          <Column field="codigo" header="Código Caso" />
          <Column field="fecha" header="Fecha" />
          <Column field="cedula" header="Cédula" />
          <Column field="usuario" header="Usuario" />
          <Column field="materia" header="Materia" />
          <Column field="caso" header="Caso" />
          <Column field="estado" header="Estado" />
          <Column field="actividades" header="Actividades">
            <template #body="slotProps">
              <Button label="Ver Actividades" icon="pi pi-eye" class="p-button-info" @click="verActividades(slotProps.data)" />
            </template>
          </Column>
          <Column header="Acciones">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button icon="pi pi-refresh" class="bg-yellow-500 text-white px-3 py-1 rounded-lg shadow hover:bg-yellow-600" @click="desarchivarCaso(slotProps.data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <TabPanel header="Casos Finalizados" :value="2">
        <DataTable :value="casosFinalizados" paginator :rows="8" class="w-full">
          <Column field="nro" header="Nro." />
          <Column field="codigo" header="Código Caso" />
          <Column field="fecha" header="Fecha" />
          <Column field="cedula" header="Cédula" />
          <Column field="usuario" header="Usuario" />
          <Column field="caso" header="Caso" />
          <Column field="estado" header="Estado" />
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
    <DataTable :value="actividades" class="p-datatable-gridlines w-full">
  <Column field="actividad" header="Actividad" />
  <Column field="ubicacion" header="Ubicación" />
  <Column field="fecha" header="Fecha">
    <template #body="slotProps">
      {{ new Date(slotProps.data.fecha).toLocaleDateString() }}
    </template>
  </Column>
  <Column field="abogado" header="Abogado Asignado" />
  <Column field="duracion" header="Duración" />
  <Column field="referenciaExpediente" header="Referencia Expediente" />
  <Column field="contraparte" header="Contraparte" />
  <Column field="juez" header="Juez Asignado" />
  <Column field="tipoactividad" header="Tipo" />
  <Column field="tiempo" header="Tiempo" />
  <Column field="juzgado" header="Juzgado" />
  <Column field="estado" header="Estado" />
</DataTable>

  </div>
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
        <input v-model="nuevaActividadAbogado" id="abogado" type="text" class="p-inputtext p-component w-full" />
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
  url="/api/upload" 
  accept=".pdf,.doc,.docx" 
  chooseLabel="Seleccionar Archivo" 
  class="w-full" 
  @upload="onUploadDocumento"
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
