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
const actividades = ref<{ descripcion: string, fecha: Date }[]>([
  { descripcion: 'Revisión de documentación', fecha: new Date('2025-01-01') },
  { descripcion: 'Reunión con cliente', fecha: new Date('2025-01-02') },
  { descripcion: 'Envío de informes', fecha: new Date('2025-01-03') },
  { descripcion: 'Llamada a testigos', fecha: new Date('2025-01-04') },
]);

const nuevaActividad = ref('');
const nuevaFecha = ref<Date | null>(null);

const agregarActividad = () => {
  if (nuevaActividad.value && nuevaFecha.value) {
    actividades.value.push({ descripcion: nuevaActividad.value, fecha: nuevaFecha.value });
    nuevaActividad.value = '';
    nuevaFecha.value = null; 
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

  <div class="p-6 bg-gray-100 min-h-screen">    
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
        @click="filtrarDatos"
      />
    </div>

    <!-- Pestañas con TabView -->
    <TabView>
      <TabPanel header="Casos Activos">
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

      <TabPanel header="Casos Archivados">
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

      <TabPanel header="Casos Finalizados">
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
<Dialog v-model:visible="visibleDialog" modal header="Actividades del Caso" class="p-6 rounded-lg shadow-lg bg-white max-w-3xl w-full">
  <div class="flex flex-col space-y-6">
    
    <!-- Última actividad realizada -->
    <div v-if="actividades.length > 0" class="space-y-4">
      <h3 class="font-bold text-lg">Última Actividad Realizada</h3>
      <div class="p-3 bg-gray-50 rounded-lg shadow-sm text-gray-700">
        {{ actividades[actividades.length - 1].descripcion }} - {{ actividades[actividades.length - 1].fecha.toLocaleDateString() }}
      </div>
    </div>

    <!-- Otras actividades -->
    <div v-if="actividades.length > 1" class="space-y-4">
      <h3 class="font-bold text-lg">Otras Actividades</h3>
      <div v-for="(actividad, index) in actividades.slice(0, actividades.length - 1)" :key="index" class="p-3 bg-gray-50 rounded-lg shadow-sm text-gray-700">
        {{ actividad.descripcion }} - {{ actividad.fecha.toLocaleDateString() }}
      </div>
    </div>

    <div v-else>
      <p class="text-gray-500">No hay actividades registradas.</p>
    </div>

    <!-- Formulario para agregar nueva actividad -->
    <div class="flex gap-4">
      <input v-model="nuevaActividad" type="text" placeholder="Nueva actividad..." class="p-inputtext p-2 rounded-lg shadow-sm w-full max-w-md" />
      <Calendar v-model="nuevaFecha" placeholder="Seleccionar fecha" class="p-inputtext p-2 rounded-lg shadow-sm" />
      <Button label="Agregar" icon="pi pi-plus" class="p-button-success px-4 py-2 rounded-lg shadow-md" @click="agregarActividad" />
    </div>
  </div>
</Dialog>


    <Dialog v-model:visible="visibleUploadDialog" modal header="Subir Reporte" class="p-6 rounded-lg shadow-lg">
      <FileUpload mode="advanced" accept=".pdf,.doc,.docx" :maxFileSize="1000000" chooseLabel="Seleccionar Archivo" uploadLabel="Subir" cancelLabel="Cancelar" />
    </Dialog>
  </div>
</template>
