<!-- ReportesView.vue -->
<template>
    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold">Informes de Viabilidad</h2>
        <button 
          @click="abrirDialogoNuevoReporte" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <i class="pi pi-plus mr-2"></i>
          Nuevo Informe
        </button>
      </div>
  
      <!-- Tabla de Informes -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200">
          <thead>
            <tr class="bg-gray-100">
              <th class="py-3 px-4 text-left">Título</th>
              <th class="py-3 px-4 text-left">Área</th>
              <th class="py-3 px-4 text-left">Fecha</th>
              <th class="py-3 px-4 text-left">Autor</th>
              <th class="py-3 px-4 text-left">Estado</th>
              <th class="py-3 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="informe in informes" :key="informe.id" class="border-t border-gray-200 hover:bg-gray-50">
              <td class="py-3 px-4">{{ informe.titulo }}</td>
              <td class="py-3 px-4">{{ informe.area }}</td>
              <td class="py-3 px-4">{{ informe.fechaCreacion }}</td>
              <td class="py-3 px-4">{{ informe.autor }}</td>
              <td class="py-3 px-4">
                <span :class="obtenerClaseEstado(informe.estado)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ capitalize(informe.estado) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex space-x-2">
                  <button @click="editarReporte(informe)" class="text-blue-600 hover:text-blue-800">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button @click="verHistorial(informe)" class="text-gray-600 hover:text-gray-800">
                    <i class="pi pi-history"></i>
                  </button>
                  <button @click="verComentarios(informe)" class="text-green-600 hover:text-green-800">
                    <i class="pi pi-comments"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modal de Edición/Creación de Reporte -->
      <Dialog 
        v-model:visible="dialogoReporteVisible" 
        :header="selectedReporte ? 'Editar Informe' : 'Nuevo Informe'"
        :style="{ width: '80vw' }"
        :modal="true"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <InputText v-model="reporteEditado.titulo" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <Dropdown 
                v-model="reporteEditado.area" 
                :options="areaOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="Seleccione un área"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <Dropdown 
                v-model="reporteEditado.estado" 
                :options="estadoOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="Seleccione un estado"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <Textarea v-model="reporteEditado.descripcion" rows="3" class="w-full" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contenido del Informe</label>
            <Editor v-model="editorContent" editorStyle="height: 320px" />
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end space-x-2">
            <button @click="dialogoReporteVisible = false" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button @click="guardarReporte" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Guardar
            </button>
          </div>
        </template>
      </Dialog>
  
      <!-- Modal de Historial -->
      <Dialog
        v-model:visible="historialVisible"
        header="Historial de Cambios"
        :style="{ width: '50vw' }"
        :modal="true"
      >
        <div v-if="selectedReporte">
          <h3 class="text-lg font-medium mb-4">{{ selectedReporte.titulo }}</h3>
          <Timeline :value="obtenerHistorialReporte" class="w-full">
            <template #marker="slotProps">
              <span class="flex w-8 h-8 items-center justify-center rounded-full" :class="obtenerClaseHistorial(slotProps.item.accion)">
                <i :class="obtenerIconoHistorial(slotProps.item.accion)" class="text-white"></i>
              </span>
            </template>
            <template #content="slotProps">
              <div class="ml-4">
                <div class="flex justify-between">
                  <span class="font-bold">{{ slotProps.item.accion }}</span>
                  <span class="text-sm text-gray-500">{{ slotProps.item.fecha }}</span>
                </div>
                <div class="mt-1">
                  <span class="text-sm">{{ slotProps.item.usuario }}</span>
                </div>
                <p class="mt-2 text-gray-600">{{ slotProps.item.detalles }}</p>
              </div>
            </template>
          </Timeline>
        </div>
      </Dialog>
  
      <!-- Modal de Comentarios -->
      <Dialog
        v-model:visible="comentarioVisible"
        header="Comentarios"
        :style="{ width: '50vw' }" 
        :modal="true"
      >
        <div v-if="selectedReporte" class="space-y-6">
          <h3 class="text-lg font-medium mb-4">{{ selectedReporte.titulo }}</h3>
          
          <!-- Lista de comentarios -->
          <div class="space-y-4">
            <div v-for="comentario in comentariosReporte" :key="comentario.id" class="p-4 bg-gray-50 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium">{{ comentario.usuario }}</span>
                <span class="text-sm text-gray-500">{{ comentario.fecha }}</span>
              </div>
              <p class="text-gray-700">{{ comentario.texto }}</p>
            </div>
          </div>
  
          <!-- Agregar nuevo comentario -->
          <div class="mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nuevo comentario</label>
            <Textarea v-model="nuevoComentario" rows="3" class="w-full mb-2" />
            <div class="flex justify-end">
              <button @click="agregarComentario" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Enviar comentario
              </button>
            </div>
          </div>
        </div>
      </Dialog>
  
      <Toast ref="toast" />
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import Dialog from 'primevue/dialog';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import Dropdown from 'primevue/dropdown';
  import Timeline from 'primevue/timeline';
  import Editor from 'primevue/editor';
  import Toast from 'primevue/toast';
  import { useToast } from 'primevue/usetoast';
  
  interface Reporte {
    id: number;
    titulo: string;
    descripcion: string;
    fechaCreacion: string;
    estado: string;
    autor: string;
    area: string;
  }
  
  interface ReporteEditado {
    titulo: string;
    descripcion: string;
    estado: string;
    area: string;
  }
  
  interface HistorialItem {
    id: number;
    reporteId: number;
    fecha: string;
    usuario: string;
    accion: string;
    detalles: string;
  }
  
  interface Comentario {
    id: number;
    reporteId: number;
    fecha: string;
    usuario: string;
    texto: string;
  }
  
  export default defineComponent({
    name: 'ReportesView',
    components: {
      Dialog,
      InputText,
      Textarea,
      Dropdown,
      Timeline,
      Editor,
      Toast
    },
    setup() {
      const toast = useToast();
      const dialogoReporteVisible = ref(false);
      const historialVisible = ref(false);
      const comentarioVisible = ref(false);
      const selectedReporte = ref<Reporte | null>(null);
      const nuevoComentario = ref('');
      const editorContent = ref('');
      
      const reporteEditado = ref<ReporteEditado>({
        titulo: '',
        descripcion: '',
        estado: '',
        area: ''
      });
  
      // Datos quemados para demostración
      const informes = ref<Reporte[]>([
        { 
          id: 1, 
          titulo: 'Viabilidad caso Martínez', 
          descripcion: 'Informe de viabilidad para el caso de pensión alimenticia',
          fechaCreacion: '2023-05-15',
          estado: 'pendiente',
          autor: 'Carlos Jiménez',
          area: 'Niñez'
        },
        { 
          id: 2, 
          titulo: 'Viabilidad demanda laboral Gómez', 
          descripcion: 'Análisis de viabilidad para demanda por despido injustificado',
          fechaCreacion: '2023-05-20',
          estado: 'aprobado',
          autor: 'María López',
          area: 'Penal'
        },
        { 
          id: 3, 
          titulo: 'Informe Sucesión Torres', 
          descripcion: 'Estudio de viabilidad para proceso sucesorio',
          fechaCreacion: '2023-06-01',
          estado: 'rechazado',
          autor: 'Juan Pérez',
          area: 'Civil'
        },
        { 
          id: 4, 
          titulo: 'Análisis Contractual Comercial', 
          descripcion: 'Evaluación de contrato comercial para PyME',
          fechaCreacion: '2023-06-10',
          estado: 'pendiente',
          autor: 'Ana Martínez',
          area: 'Penal'
        }
      ]);
  
      // Historial de cambios (datos quemados)
      const historial = ref<HistorialItem[]>([
        { 
          id: 1,
          reporteId: 1,
          fecha: '2023-05-15 10:30',
          usuario: 'Carlos Jiménez',
          accion: 'Creación',
          detalles: 'Versión inicial del informe de viabilidad'
        },
        { 
          id: 2,
          reporteId: 1,
          fecha: '2023-05-17 14:22',
          usuario: 'Laura Sánchez',
          accion: 'Revisión',
          detalles: 'Solicitud de correcciones en la sección de fundamentos jurídicos'
        },
        { 
          id: 3,
          reporteId: 1,
          fecha: '2023-05-18 09:15',
          usuario: 'Carlos Jiménez',
          accion: 'Modificación',
          detalles: 'Correcciones aplicadas según revisión'
        }
      ]);
  
      // Comentarios (datos quemados)
      const comentarios = ref<Comentario[]>([
        {
          id: 1,
          reporteId: 1,
          fecha: '2023-05-17 14:25',
          usuario: 'Laura Sánchez',
          texto: 'Es necesario ampliar el análisis de jurisprudencia en el caso. Por favor revisa las sentencias recientes del Tribunal Superior.'
        },
        {
          id: 2,
          reporteId: 1,
          fecha: '2023-05-18 09:20',
          usuario: 'Carlos Jiménez',
          texto: 'Aplicadas las correcciones solicitadas. Se agregaron referencias a las sentencias ST-2023-156 y ST-2022-789.'
        }
      ]);
  
      const estadoOptions = [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Aprobado', value: 'aprobado' },
        { label: 'Rechazado', value: 'rechazado' }
      ];
  
      const areaOptions = [
        { label: 'Civil', value: 'Civil' },
        { label: 'Familia', value: 'Familia' },
        { label: 'Laboral', value: 'Laboral' },
        { label: 'Penal', value: 'Penal' },
        { label: 'Comercial', value: 'Comercial' }
      ];
  
      const obtenerHistorialReporte = computed(() => {
        if (!selectedReporte.value) return [];
        return historial.value
          .filter(item => item.reporteId === selectedReporte.value?.id)
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      });
  
      const comentariosReporte = computed(() => {
        if (!selectedReporte.value) return [];
        return comentarios.value
          .filter(item => item.reporteId === selectedReporte.value?.id)
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      });
  
      // Cargar contenido del editor cuando se abre un reporte
      const cargarContenidoEditor = (reporte: Reporte) => {
        // En un caso real, esto vendría del backend
        const contenidoEjemplo = `
        <h2>Informe de Viabilidad: ${reporte.titulo}</h2>
        <p><strong>Fecha:</strong> ${reporte.fechaCreacion}</p>
        <p><strong>Autor:</strong> ${reporte.autor}</p>
        <p><strong>Área:</strong> ${reporte.area}</p>
        
        <h3>1. Descripción del Caso</h3>
        <p>${reporte.descripcion}</p>
        
        <h3>2. Fundamentos Jurídicos</h3>
        <p>Según lo establecido en el artículo X de la Ley Y, el presente caso tiene viabilidad jurídica considerando los precedentes establecidos en la sentencia Z.</p>
        
        <h3>3. Análisis de Probabilidad de Éxito</h3>
        <ul>
            <li>Fortalezas del caso: ...</li>
            <li>Debilidades del caso: ...</li>
            <li>Probabilidad estimada: 75%</li>
        </ul>
        
        <h3>4. Conclusión</h3>
        <p>Con base en el análisis realizado, se considera que el caso tiene viabilidad jurídica y se recomienda proceder con el trámite correspondiente.</p>
        `;
        
        editorContent.value = contenidoEjemplo;
      };
  
      const abrirDialogoNuevoReporte = () => {
        selectedReporte.value = null;
        reporteEditado.value = {
          titulo: '',
          descripcion: '',
          estado: 'pendiente',
          area: ''
        };
        editorContent.value = '';
        dialogoReporteVisible.value = true;
      };
  
      const editarReporte = (reporte: Reporte) => {
        selectedReporte.value = reporte;
        reporteEditado.value = {
          titulo: reporte.titulo,
          descripcion: reporte.descripcion,
          estado: reporte.estado,
          area: reporte.area
        };
        cargarContenidoEditor(reporte);
        dialogoReporteVisible.value = true;
      };
  
      const verHistorial = (reporte: Reporte) => {
        selectedReporte.value = reporte;
        historialVisible.value = true;
      };
  
      const verComentarios = (reporte: Reporte) => {
        selectedReporte.value = reporte;
        comentarioVisible.value = true;
      };
  
      const guardarReporte = () => {
        if (selectedReporte.value) {
          // Editar reporte existente
          const index = informes.value.findIndex(r => r.id === selectedReporte.value?.id);
          if (index !== -1) {
            informes.value[index] = {
              ...informes.value[index],
              ...reporteEditado.value
            };
          }
          
          // Agregar al historial
          const nuevoHistorial: HistorialItem = {
            id: historial.value.length + 1,
            reporteId: selectedReporte.value.id,
            fecha: new Date().toLocaleString(),
            usuario: 'Usuario Actual', // En un caso real vendría del contexto de autenticación
            accion: 'Modificación',
            detalles: 'Actualización del informe'
          };
          historial.value.push(nuevoHistorial);
          
          toast.add({severity: 'success', summary: 'Éxito', detail: 'Informe actualizado correctamente', life: 3000});
        } else {
          // Crear nuevo reporte
          const nuevoReporte: Reporte = {
            id: informes.value.length + 1,
            ...reporteEditado.value,
            fechaCreacion: new Date().toISOString().split('T')[0],
            autor: 'Usuario Actual' // En un caso real vendría del contexto de autenticación
          };
          informes.value.push(nuevoReporte);
          
          // Agregar al historial
          const nuevoHistorial: HistorialItem = {
            id: historial.value.length + 1,
            reporteId: nuevoReporte.id,
            fecha: new Date().toLocaleString(),
            usuario: 'Usuario Actual',
            accion: 'Creación',
            detalles: 'Creación inicial del informe'
          };
          historial.value.push(nuevoHistorial);
          
          toast.add({severity: 'success', summary: 'Éxito', detail: 'Nuevo informe creado correctamente', life: 3000});
        }
        
        dialogoReporteVisible.value = false;
      };
  
      const agregarComentario = () => {
        if (nuevoComentario.value.trim() === '' || !selectedReporte.value) return;
        
        const comentario: Comentario = {
          id: comentarios.value.length + 1,
          reporteId: selectedReporte.value.id,
          fecha: new Date().toLocaleString(),
          usuario: 'Usuario Actual', // En un caso real vendría del contexto de autenticación
          texto: nuevoComentario.value
        };
        
        comentarios.value.push(comentario);
        nuevoComentario.value = '';
        
        // Agregar al historial
        const nuevoHistorial: HistorialItem = {
          id: historial.value.length + 1,
          reporteId: selectedReporte.value.id,
          fecha: new Date().toLocaleString(),
          usuario: 'Usuario Actual',
          accion: 'Comentario',
          detalles: 'Se ha agregado un nuevo comentario al informe'
        };
        historial.value.push(nuevoHistorial);
        
        toast.add({severity: 'info', summary: 'Información', detail: 'Comentario agregado', life: 3000});
      };
  
      const obtenerClaseEstado = (estado: string) => {
        switch (estado) {
          case 'aprobado':
            return 'bg-green-100 text-green-800';
          case 'rechazado':
            return 'bg-red-100 text-red-800';
          default:
            return 'bg-yellow-100 text-yellow-800';
        }
      };
  
      const obtenerClaseHistorial = (accion: string) => {
        switch (accion) {
          case 'Creación':
            return 'bg-blue-500';
          case 'Modificación':
            return 'bg-orange-500';
          case 'Revisión':
            return 'bg-purple-500';
          case 'Comentario':
            return 'bg-green-500';
          default:
            return 'bg-gray-500';
        }
      };
  
      const obtenerIconoHistorial = (accion: string) => {
        switch (accion) {
          case 'Creación':
            return 'pi pi-file';
          case 'Modificación':
            return 'pi pi-pencil';
          case 'Revisión':
            return 'pi pi-eye';
          case 'Comentario':
            return 'pi pi-comment';
          default:
            return 'pi pi-info-circle';
        }
      };
  
      const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
      };
  
      return {
        informes,
        dialogoReporteVisible,
        historialVisible,
        comentarioVisible,
        selectedReporte,
        reporteEditado,
        nuevoComentario,
        editorContent,
        estadoOptions,
        areaOptions,
        obtenerHistorialReporte,
        comentariosReporte,
        abrirDialogoNuevoReporte,
        editarReporte,
        verHistorial,
        verComentarios,
        guardarReporte,
        agregarComentario,
        obtenerClaseEstado,
        obtenerClaseHistorial,
        obtenerIconoHistorial,
        capitalize
      };
    }
  });
  </script>

<style scoped>

</style>