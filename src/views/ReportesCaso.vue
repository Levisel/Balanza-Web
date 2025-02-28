<script setup lang="ts">
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { ref, computed } from 'vue';

const reportes = ref([
  { id: 1, nombre: 'Reporte C-001', fecha: '2025-02-01', descripcion: 'Informe de Viabilidad', url: '/src/reports/ejemplo-del-informe.pdf' },
  { id: 2, nombre: 'Reporte C-002', fecha: '2025-02-02', descripcion: 'Informe de Viabilidad', url: '/src/reports/ejemplo-del-informe.pdf' },
  { id: 3, nombre: 'Reporte C-003', fecha: '2025-02-03', descripcion: 'Informe de Estado', url: '/src/reports/ejemplo-del-informe.pdf' },
  { id: 4, nombre: 'Reporte C-004', fecha: '2025-02-02', descripcion: 'Informe de Viabilidad', url: '/src/reports/ejemplo-del-informe.pdf' },
  { id: 5, nombre: 'Reporte C-015', fecha: '2025-02-03', descripcion: 'Informe de Estado', url: '/src/reports/ejemplo-del-informe.pdf' },
  { id: 6, nombre: 'Reporte C-052', fecha: '2025-02-02', descripcion: 'Informe de Viabilidad', url: '/src/reports/ejemplo-del-informe.pdf' },
  { id: 7, nombre: 'Reporte C-023', fecha: '2025-02-03', descripcion: 'Informe de Estado', url: '/src/reports/ejemplo-del-informe.pdf' },
  { id: 8, nombre: 'Reporte C-023', fecha: '2025-02-03', descripcion: 'Informe de Estado', url: '/src/reports/ejemplo-del-informe.pdf' },
]);

const reporteSeleccionado = ref(null);
const dialogVisible = ref(false);

const searchQuery = ref('');

const abrirVisor = (url: string) => {
  reporteSeleccionado.value = url;
  dialogVisible.value = true;
};

const cerrarVisor = () => {
  reporteSeleccionado.value = null;
  dialogVisible.value = false;
};

const reportesFiltrados = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return reportes.value.filter(reporte => 
    reporte.nombre.toLowerCase().includes(query) || 
    reporte.fecha.includes(query)
  );
});
</script>

<template>
  <div class="container p-6">
    <h2 class="text-2xl font-bold mb-6">Últimos Reportes Subidos</h2>

    <!-- Barra de búsqueda -->
    <div class="mb-6">
      <InputText v-model="searchQuery" placeholder="Buscar reportes" class="p-inputtext-lg w-full max-w-md" />
    </div>

    <div class="flex flex-wrap gap-6">
      <!-- Iterar sobre los reportes filtrados y crear una card por cada uno -->
      <Card v-for="reporte in reportesFiltrados" :key="reporte.id" class="w-80 shadow-lg rounded-lg">
        <template #title>
          <h3 class="text-xl font-semibold">{{ reporte.nombre }}</h3>
          <span class="text-sm text-gray-500">{{ reporte.fecha }}</span>
        </template>
        <template #content>
          <p class="text-gray-600 text-sm mb-4">{{ reporte.descripcion }}</p>
          <Button 
            label="Ver Reporte" 
            icon="pi pi-file-pdf" 
            class="p-button-link text-indigo-600 hover:text-indigo-800" 
            @click="abrirVisor(reporte.url)" />
        </template>
      </Card>
    </div>

    <!-- Dialog para visualizar el PDF -->
    <Dialog 
      header="Visualización del Reporte" 
      v-model:visible="dialogVisible" 
      :style="{ width: '80%' }" 
      :closable="false"
      class="bg-white rounded-lg shadow-xl"
    >
      <iframe :src="reporteSeleccionado" width="100%" height="700px" frameborder="0"></iframe>
      <div class="flex justify-end mt-4">
        <Button label="Cerrar" icon="pi pi-times" class="p-button-danger" @click="cerrarVisor" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.container {
  display: block;
  margin-left: 0;
  margin-right: 0;
}

.flex {
  justify-content: flex-start; 
}

.mb-8 {
  margin-bottom: 2rem; 
}

.w-full {
  width: 100%;
}

.max-w-md {
  max-width: 100%;
}
</style>
