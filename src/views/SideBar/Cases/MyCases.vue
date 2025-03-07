<script setup lang="ts">
import { ref, computed } from 'vue';
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

const Casos = [
  { nro: 1, fecha: '2025-01-01', usuario: 'Juan Perez', cedula: '12345678', codigo: 'C-001', materia: 'Civil', caso: 'Divorcio', estado: 'Abierto', sintesis: 'Síntesis 1', nroJuicio: 'J001', ultimaDiligencia: '2025-01-10' },
  { nro: 2, fecha: '2025-01-02', usuario: 'Maria Lopez', cedula: '87654321', codigo: 'C-002', materia: 'Penal',  caso: 'Divorcio', estado: 'Cerrado', sintesis: 'Síntesis 2', nroJuicio: 'J002', ultimaDiligencia: '2025-01-11' },
  { nro: 3, fecha: '2025-01-03', usuario: 'Carlos Ruiz', cedula: '11223344', codigo: 'C-003', materia: 'Laboral',caso: 'Divorcio', estado: 'Abierto', sintesis: 'Síntesis 3', nroJuicio: 'J003', ultimaDiligencia: '2025-01-12' },
  { nro: 4, fecha: '2025-01-04', usuario: 'Ana Gomez', cedula: '44332211', codigo: 'C-004', materia: 'Civil',caso: 'Divorcio',  estado: 'Cerrado', sintesis: 'Síntesis 4', nroJuicio: 'J004', ultimaDiligencia: '2025-01-13' },
  { nro: 5, fecha: '2025-01-05', usuario: 'Luis Martinez', cedula: '55667788', codigo: 'C-005', materia: 'Penal',caso: 'Divorcio',  estado: 'Abierto', sintesis: 'Síntesis 5', nroJuicio: 'J005', ultimaDiligencia: '2025-01-14' },
  { nro: 6, fecha: '2025-01-06', usuario: 'Laura Sanchez', cedula: '88776655', codigo: 'C-006', materia: 'Laboral',caso: 'Divorcio',  estado: 'Cerrado', sintesis: 'Síntesis 6', nroJuicio: 'J006', ultimaDiligencia: '2025-01-15' },
  { nro: 7, fecha: '2025-01-07', usuario: 'Pedro Fernandez', cedula: '99887766', codigo: 'C-007', materia: 'Civil', caso: 'Divorcio', estado: 'Abierto', sintesis: 'Síntesis 7', nroJuicio: 'J007', ultimaDiligencia: '2025-01-16' },
  { nro: 8, fecha: '2025-01-08', usuario: 'Sofia Ramirez', cedula: '66778899', codigo: 'C-008', materia: 'Penal', caso: 'Divorcio', estado: 'Cerrado', sintesis: 'Síntesis 8', nroJuicio: 'J008', ultimaDiligencia: '2025-01-17' },
  { nro: 9, fecha: '2025-01-09', usuario: 'Miguel Torres', cedula: '33445566', codigo: 'C-009', materia: 'Laboral',caso: 'Divorcio',  estado: 'Abierto', sintesis: 'Síntesis 9', nroJuicio: 'J009', ultimaDiligencia: '2025-01-18' },
  { nro: 10, fecha: '2025-01-10', usuario: 'Elena Diaz', cedula: '22334455', codigo: 'C-010', materia: 'Civil',  estado: 'Cerrado', sintesis: 'Síntesis 10', nroJuicio: 'J010', ultimaDiligencia: '2025-01-19' },
  { nro: 11, fecha: '2025-01-11', usuario: 'Javier Castro', cedula: '11224433', codigo: 'C-011', materia: 'Penal',caso: 'Divorcio',  estado: 'Abierto', sintesis: 'Síntesis 11', nroJuicio: 'J011', ultimaDiligencia: '2025-01-20' },
  { nro: 12, fecha: '2025-01-12', usuario: 'Patricia Vega', cedula: '33446655', codigo: 'C-012', materia: 'Laboral', caso: 'Divorcio', estado: 'Cerrado', sintesis: 'Síntesis 12', nroJuicio: 'J012', ultimaDiligencia: '2025-01-21' },
  { nro: 13, fecha: '2025-01-13', usuario: 'Gabriel Mendez', cedula: '55667799', codigo: 'C-013', materia: 'Civil',caso: 'Divorcio',  estado: 'Abierto', sintesis: 'Síntesis 13', nroJuicio: 'J013', ultimaDiligencia: '2025-01-22' },
  { nro: 14, fecha: '2025-01-14', usuario: 'Natalia Ortiz', cedula: '77889900', codigo: 'C-014', materia: 'Penal', caso: 'Divorcio', estado: 'Cerrado', sintesis: 'Síntesis 14', nroJuicio: 'J014', ultimaDiligencia: '2025-01-23' },
  { nro: 15, fecha: '2025-01-15', usuario: 'Oscar Rivas', cedula: '99001122', codigo: 'C-015', materia: 'Laboral', caso: 'Divorcio', estado: 'Abierto', sintesis: 'Síntesis 15', nroJuicio: 'J015', ultimaDiligencia: '2025-01-24' },
  { nro: 16, fecha: '2025-01-14', usuario: 'Natalia Ortiz', cedula: '77889900', codigo: 'C-016', materia: 'Penal',caso: 'Divorcio',  estado: 'Archivado', sintesis: 'Síntesis 14', nroJuicio: 'J014', ultimaDiligencia: '2025-01-23' },
  { nro: 17, fecha: '2025-01-15', usuario: 'Oscar Rivas', cedula: '99001122', codigo: 'C-017', materia: 'Laboral', caso: 'Divorcio', estado: 'Archivado', sintesis: 'Síntesis 15', nroJuicio: 'J015', ultimaDiligencia: '2025-01-24' }
];

const toast = useToast();
const nuevaActividadTipo = ref('');
const nuevaActividadUbicacion = ref('');
const nuevaActividadFecha = ref<Date | null>(null);
const nuevaActividadAbogado = ref('');
const nuevaActividadDuracion = ref('');
const nuevaActividadReferenciaExpediente = ref('');
const nuevaActividadContraparte = ref('');
const nuevaActividadJuez = ref('');

const visibleActividadDialog = ref(false);

const searchQuery = ref('');

const fechasFiltro = ref<[Date, Date] | null>(null);

const casosFiltrados = computed(() => {
  const query = searchQuery.value.toLowerCase();
  const filteredBySearch = Casos.filter(caso => 
    caso.codigo.toLowerCase().includes(query) ||
    caso.usuario.toLowerCase().includes(query) ||
    caso.fecha.includes(query) 
  );

  if (!fechasFiltro.value) {
    return filteredBySearch;
  }

  const [fechaInicio, fechaFin] = fechasFiltro.value;
  return filteredBySearch.filter(caso => {
    const casoFecha = new Date(caso.fecha);
    return casoFecha >= fechaInicio && casoFecha <= fechaFin;
  });
});

const casosActivos = computed(() => casosFiltrados.value.filter(caso => caso.estado === 'Abierto'));
const casosArchivados = computed(() => casosFiltrados.value.filter(caso => caso.estado === 'Archivado'));
const casosFinalizados = computed(() => casosFiltrados.value.filter(caso => caso.estado === 'Cerrado'));

const visibleDialog = ref(false);
const casoSeleccionado = ref<any>(null);
const visibleUploadDialog = ref(false);
const actividades = ref([
  { tipo: 'Revisión', ubicacion: 'Oficina', fecha: new Date('2025-01-01'), abogado: 'Juan Perez', duracion: '2 horas', referenciaExpediente: 'R001', contraparte: 'Carlos Ruiz', juez: 'Juez 1' },
  { tipo: 'Reunión', ubicacion: 'Sala de Juntas', fecha: new Date('2025-01-02'), abogado: 'Maria Lopez', duracion: '1 hora', referenciaExpediente: 'R002', contraparte: 'Ana Gomez', juez: 'Juez 2' },
  { tipo: 'Llamada', ubicacion: 'Teléfono', fecha: new Date('2025-01-03'), abogado: 'Luis Martinez', duracion: '30 minutos', referenciaExpediente: 'R003', contraparte: 'Pedro Fernandez', juez: 'Juez 3' },
  { tipo: 'Visita', ubicacion: 'Corte', fecha: new Date('2025-01-04'), abogado: 'Elena Diaz', duracion: '3 horas', referenciaExpediente: 'R004', contraparte: 'Javier Castro', juez: 'Juez 4' },
]);

const nuevaActividad = ref('');
const nuevaFecha = ref<Date | null>(null);

const agregarNuevaActividad = () => {
  if (nuevaActividadTipo.value && nuevaActividadUbicacion.value && nuevaActividadFecha.value && nuevaActividadAbogado.value && nuevaActividadDuracion.value && nuevaActividadReferenciaExpediente.value && nuevaActividadContraparte.value && nuevaActividadJuez.value) {
    actividades.value.push({
      tipo: nuevaActividadTipo.value,
      ubicacion: nuevaActividadUbicacion.value,
      fecha: nuevaActividadFecha.value,
      abogado: nuevaActividadAbogado.value,
      duracion: nuevaActividadDuracion.value,
      referenciaExpediente: nuevaActividadReferenciaExpediente.value,
      contraparte: nuevaActividadContraparte.value,
      juez: nuevaActividadJuez.value
    });
    toast.add({ severity: 'success', summary: 'Actividad Agregada', detail: 'La actividad se ha agregado correctamente.', life: 3000 });
    visibleActividadDialog.value = false;
    // Limpiar los campos
    nuevaActividadTipo.value = '';
    nuevaActividadUbicacion.value = '';
    nuevaActividadFecha.value = null;
    nuevaActividadAbogado.value = '';
    nuevaActividadDuracion.value = '';
    nuevaActividadReferenciaExpediente.value = '';
    nuevaActividadContraparte.value = '';
    nuevaActividadJuez.value = '';
  } else {
    toast.add({ severity: 'error', summary: 'Campos Incompletos', detail: 'Por favor, rellene todos los campos.', life: 3000 });
  }
};

const verActividades = (caso: any) => {
  casoSeleccionado.value = caso;
  visibleDialog.value = true;
};

const agregarReporte = (caso: any) => {
  casoSeleccionado.value = caso;
  visibleUploadDialog.value = true;
};

const finalizarCaso = (caso: any) => {
  caso.estado = 'Finalizado';
  const index = casosActivos.value.indexOf(caso);
  if (index > -1) {
    casosActivos.value.splice(index, 1);
  }
  casosFinalizados.value.push(caso);

  toast.add({ severity: 'success', summary: 'Caso Finalizado', detail: `Caso ${caso.nro} finalizado.`, life: 3000 });
};

const archivarCaso = (caso: any) => {
  caso.estado = 'Archivado';
  const index = casosActivos.value.indexOf(caso);
  if (index > -1) {
    casosActivos.value.splice(index, 1);
  }
  casosArchivados.value.push(caso);

  toast.add({ severity: 'success', summary: 'Caso Archivado', detail: `Caso ${caso.nro} archivado.`, life: 3000 });
};

const desarchivarCaso = (caso: any) => {
  caso.estado = 'Activo';
  const indexArchivado = casosArchivados.value.indexOf(caso);
  if (indexArchivado > -1) {
    casosArchivados.value.splice(indexArchivado, 1);
  }
  casosActivos.value.push(caso);

  toast.add({ severity: 'success', summary: 'Caso Reactivado', detail: `Caso ${caso.nro} reactivado.`, life: 3000 });
};

const reactivarCaso = (caso: any) => {
  caso.estado = 'Activo';
  const indexFinalizado = casosFinalizados.value.indexOf(caso);
  if (indexFinalizado > -1) {
    casosFinalizados.value.splice(indexFinalizado, 1);
  }
  casosActivos.value.push(caso);

  toast.add({ severity: 'success', summary: 'Caso Reactivado', detail: `Caso ${caso.nro} reactivado.`, life: 3000 });
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
        <DataTable :value="casosActivos" paginator :rows="5" class="w-full">
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
                <Button icon="pi pi-plus" class="bg-green-500 text-white px-3 py-1 rounded-lg shadow hover:bg-green-600" @click="agregarReporte(slotProps.data)" />
                <Button icon="pi pi-inbox" class="bg-yellow-500 text-white px-3 py-1 rounded-lg shadow hover:bg-yellow-600" @click="archivarCaso(slotProps.data)" />
                <Button icon="pi pi-check" class="bg-green-500 text-white px-3 py-1 rounded-lg shadow hover:bg-green-600" @click="finalizarCaso(slotProps.data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <TabPanel header="Casos Archivados" :value="1">
        <DataTable :value="casosArchivados" paginator :rows="5" class="w-full">
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
        <DataTable :value="casosFinalizados" paginator :rows="5" class="w-full">
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
    <Button label="Agregar Nueva Actividad" icon="pi pi-plus" class="p-button-success mb-4" @click="visibleActividadDialog = true" />
    
    <!-- Tabla de actividades -->
    <DataTable :value="actividades" class="p-datatable-gridlines w-full">
      <Column field="tipo" header="Tipo" />
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
    </DataTable>
  </div>
</Dialog>


    <Dialog v-model:visible="visibleUploadDialog" modal header="Subir Reporte" class="p-6 rounded-lg shadow-lg">
      <FileUpload mode="advanced" accept=".pdf,.doc,.docx" :maxFileSize="1000000" chooseLabel="Seleccionar Archivo" uploadLabel="Subir" cancelLabel="Cancelar" />
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

      <div class="flex justify-end gap-4">
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="visibleActividadDialog = false" />
        <Button label="Agregar" icon="pi pi-check" class="p-button-success" @click="agregarNuevaActividad" />
      </div>
    </div>
  </Dialog>
  </div>
</template>
