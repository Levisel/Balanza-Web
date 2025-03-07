
<template>
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Gestión de Citas - Consultorios Jurídicos</h1>
        
        <!-- Filtros y Acciones -->
        <div class="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap justify-between items-center">
          <div class="flex space-x-4 mb-2 sm:mb-0">
            <select v-model="filtroArea" class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="">Todas las áreas</option>
              <option value="niñez">Niñez</option>
              <option value="movilidad">Movilidad Humana</option>
              <option value="civil">Civil</option>
              <option value="penal">Penal</option>
            </select>
            
            <select v-model="filtroEstado" class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="">Todos los estados</option>
              <option value="agendada">Agendada</option>
              <option value="contactada">Contactada</option>
              <option value="pendiente">Pendiente de contacto</option>
            </select>
          </div>
          
          <button @click="mostrarModalAgendarCita = true" 
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
            Agendar Nueva Cita
          </button>
        </div>
  
        <!-- Calendario Semanal -->
        <div class="bg-white p-4 rounded-lg shadow-sm mb-6 overflow-x-auto">
          <h2 class="text-lg font-semibold mb-4">Calendario Semanal</h2>
          <div class="min-w-max">
            <div class="grid grid-cols-6 gap-2 mb-2">
              <div class="font-medium text-gray-500">Hora</div>
              <div v-for="dia in diasSemana" :key="dia.valor" class="font-medium text-center py-2">
                {{ dia.nombre }} <br> <span class="text-sm">{{ dia.fecha }}</span>
              </div>
            </div>
            
            <div v-for="hora in horasLaborales" :key="hora" class="grid grid-cols-6 gap-2 border-t border-gray-100">
              <div class="py-2 text-sm text-gray-600">{{ formatearHora(hora) }}</div>
              <div v-for="(dia, index) in diasSemana" :key="`${dia.valor}-${hora}`" 
                   class="min-h-16 p-1 border border-gray-200 rounded-md relative">
                <div v-for="cita in getCitasEnHorario(dia.valor, hora)" :key="cita.id"
                     :class="[
                       'text-xs p-1 rounded cursor-pointer mb-1',
                       getColorClaseCita(cita)
                     ]"
                     @click="seleccionarCita(cita)">
                  {{ cita.cliente }} - {{ cita.area }}
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Lista de Citas con Alertas de Contacto -->
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <h2 class="text-lg font-semibold mb-4">Estado de Contacto con Clientes</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Cita</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Contacto</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="cita in citasFiltradas" :key="cita.id"
                    :class="{'bg-yellow-50': diasSinContacto(cita) > 10 && diasSinContacto(cita) <= 30, 
                             'bg-red-50': diasSinContacto(cita) > 30}">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ cita.cliente }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ cita.area }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatearFechaCompleta(cita.fecha) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ cita.ultimoContacto ? formatearFechaCompleta(cita.ultimoContacto) : 'Sin contacto' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'px-2 py-1 text-xs rounded-full',
                      diasSinContacto(cita) > 30 ? 'bg-red-100 text-red-800' : 
                      diasSinContacto(cita) > 10 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    ]">
                      {{ estadoContactoTexto(cita) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button @click="registrarContacto(cita)" 
                            class="text-indigo-600 hover:text-indigo-900 mr-3">
                      Registrar Contacto
                    </button>
                    <button @click="seleccionarCita(cita)" 
                            class="text-gray-600 hover:text-gray-900">
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  
      <!-- Modal Agendar Cita -->
      <div v-if="mostrarModalAgendarCita" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold mb-4">Agendar Nueva Cita</h2>
          <form @submit.prevent="guardarCita">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
              <input v-model="nuevaCita.cliente" type="text" required
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <select v-model="nuevaCita.area" required
                      class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option value="niñez">Niñez</option>
                <option value="movilidad">Movilidad Humana</option>
                <option value="civil">Civil</option>
                <option value="penal">Penal</option>
              </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input v-model="nuevaCita.fecha" type="date" required
                       class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <select v-model="nuevaCita.hora" required
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                  <option v-for="hora in horasLaborales" :key="hora" :value="hora">
                    {{ formatearHora(hora) }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea v-model="nuevaCita.notas" rows="3"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button type="button" @click="mostrarModalAgendarCita = false"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                Cancelar
              </button>
              <button type="submit"
                      class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
                Guardar Cita
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Modal Detalles Cita -->
      <div v-if="citaSeleccionada" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-bold">Detalles de la Cita</h2>
            <button @click="citaSeleccionada = null" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500">Cliente</h3>
              <p class="mt-1">{{ citaSeleccionada.cliente }}</p>
            </div>
            
            <div>
              <h3 class="text-sm font-medium text-gray-500">Área</h3>
              <p class="mt-1">{{ citaSeleccionada.area }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500">Fecha</h3>
                <p class="mt-1">{{ formatearFechaCompleta(citaSeleccionada.fecha) }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500">Hora</h3>
                <p class="mt-1">{{ formatearHora(citaSeleccionada.hora) }}</p>
              </div>
            </div>
            
            <div>
              <h3 class="text-sm font-medium text-gray-500">Estado de Contacto</h3>
              <p class="mt-1 flex items-center">
                <span :class="[
                  'inline-block w-3 h-3 rounded-full mr-2',
                  diasSinContacto(citaSeleccionada) > 30 ? 'bg-red-500' : 
                  diasSinContacto(citaSeleccionada) > 10 ? 'bg-yellow-500' : 
                  'bg-green-500'
                ]"></span>
                {{ estadoContactoTexto(citaSeleccionada) }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ citaSeleccionada.ultimoContacto ? 
                  `Último contacto: ${formatearFechaCompleta(citaSeleccionada.ultimoContacto)}` : 
                  'Sin contacto registrado' }}
              </p>
            </div>
            
            <div>
              <h3 class="text-sm font-medium text-gray-500">Notas</h3>
              <p class="mt-1 text-sm text-gray-600">{{ citaSeleccionada.notas || 'Sin notas adicionales' }}</p>
            </div>
  
            <div>
              <h3 class="text-sm font-medium text-gray-500">Historial de Contacto</h3>
              <div class="mt-1 max-h-40 overflow-y-auto">
                <div v-if="citaSeleccionada.historialContacto && citaSeleccionada.historialContacto.length">
                  <div v-for="(contacto, index) in citaSeleccionada.historialContacto" :key="index"
                       class="py-2 border-b border-gray-100 last:border-0">
                    <p class="text-sm font-medium">{{ formatearFechaCompleta(contacto.fecha) }}</p>
                    <p class="text-sm text-gray-600">{{ contacto.notas }}</p>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-500">No hay registros de contacto</p>
              </div>
            </div>
          </div>
  
          <div class="mt-6 flex justify-end space-x-3">
            <button @click="registrarContacto(citaSeleccionada)"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
              Registrar Contacto
            </button>
          </div>
        </div>
      </div>
  
      <!-- Modal Registrar Contacto -->
      <div v-if="mostrarModalRegistrarContacto" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold mb-4">Registrar Contacto</h2>
          <form @submit.prevent="guardarContacto">
            <div class="mb-4">
              <p class="text-sm font-medium text-gray-700">Cliente: {{ citaContacto.cliente }}</p>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Contacto</label>
              <input v-model="nuevoContacto.fecha" type="date" required
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Notas de Contacto</label>
              <textarea v-model="nuevoContacto.notas" rows="3" required
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Detalle del contacto realizado..."></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button type="button" @click="mostrarModalRegistrarContacto = false"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                Cancelar
              </button>
              <button type="submit"
                      class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  
  interface Contacto {
    fecha: string;
    notas: string;
  }
  
  interface Cita {
    id: number;
    cliente: string;
    area: string;
    fecha: string;
    hora: number;
    notas?: string;
    ultimoContacto?: string;
    historialContacto?: Contacto[];
  }
  
  export default defineComponent({
    name: 'GestionCitas',
    setup() {
      // Estado
      const citas = ref<Cita[]>([
        {
          id: 1,
          cliente: 'Ana Martínez',
          area: 'niñez',
          fecha: '2025-02-20',
          hora: 9,
          notas: 'Custodia de menor',
          ultimoContacto: '2025-02-18',
          historialContacto: [
            { fecha: '2025-02-18', notas: 'Llamada telefónica para confirmar cita' }
          ]
        },
        {
          id: 2,
          cliente: 'Carlos Vega',
          area: 'civil',
          fecha: '2025-02-21',
          hora: 11,
          notas: 'Contrato de arrendamiento',
          ultimoContacto: '2025-02-01',
          historialContacto: [
            { fecha: '2025-02-01', notas: 'Contacto inicial y agendamiento' }
          ]
        },
        {
          id: 3,
          cliente: 'María López',
          area: 'movilidad',
          fecha: '2025-02-22',
          hora: 10,
          notas: 'Solicitud de refugio',
        },
        {
          id: 4,
          cliente: 'Juan Pérez',
          area: 'penal',
          fecha: '2025-02-19',
          hora: 14,
          notas: 'Denuncia por robo',
          ultimoContacto: '2025-01-15',
          historialContacto: [
            { fecha: '2025-01-15', notas: 'Primera entrevista' }
          ]
        },
        {
          id: 5,
          cliente: 'Sofía Ramírez',
          area: 'niñez',
          fecha: '2025-02-21',
          hora: 15,
          notas: 'Alimentos',
          ultimoContacto: '2025-02-19',
          historialContacto: [
            { fecha: '2025-02-19', notas: 'Actualización de documentos' }
          ]
        }
      ]);
  
      // Filtros
      const filtroArea = ref('');
      const filtroEstado = ref('');
  
      // Modales
      const mostrarModalAgendarCita = ref(false);
      const mostrarModalRegistrarContacto = ref(false);
      const citaSeleccionada = ref<Cita | null>(null);
      const citaContacto = ref<Cita>({} as Cita);
  
      // Formularios
      const nuevaCita = ref<Omit<Cita, 'id'>>({
        cliente: '',
        area: 'civil',
        fecha: '',
        hora: 9,
        notas: ''
      });
  
      const nuevoContacto = ref<Contacto>({
        fecha: new Date().toISOString().split('T')[0],
        notas: ''
      });
  
      // Calendario
      const hoy = new Date();
      const horasLaborales = ref([8, 9, 10, 11, 12, 14, 15, 16, 17]);
  
      const diasSemana = computed(() => {
        const dias = [];
        for (let i = 0; i < 5; i++) {
          const fecha = new Date(hoy);
          fecha.setDate(hoy.getDate() - hoy.getDay() + i + 1); // Lunes a Viernes
          
          dias.push({
            nombre: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'][i],
            valor: fecha.toISOString().split('T')[0],
            fecha: `${fecha.getDate()}/${fecha.getMonth() + 1}`
          });
        }
        return dias;
      });
  
      // Filtrado de citas
      const citasFiltradas = computed(() => {
        return citas.value.filter(cita => {
          const cumpleFiltroArea = !filtroArea.value || cita.area === filtroArea.value;
          
          if (!filtroEstado.value) return cumpleFiltroArea;
          
          const diasSinContactar = diasSinContacto(cita);
          if (filtroEstado.value === 'agendada') {
            return cumpleFiltroArea && diasSinContactar <= 10;
          } else if (filtroEstado.value === 'pendiente') {
            return cumpleFiltroArea && diasSinContactar > 10;
          } else if (filtroEstado.value === 'contactada') {
            return cumpleFiltroArea && cita.ultimoContacto;
          }
          
          return cumpleFiltroArea;
        });
      });
  
      // Métodos
      const formatearHora = (hora: number): string => {
        return `${hora}:00`;
      };
  
      const formatearFechaCompleta = (fechaStr: string): string => {
        if (!fechaStr) return '';
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      };
  
      const getCitasEnHorario = (dia: string, hora: number): Cita[] => {
        return citas.value.filter(cita => cita.fecha === dia && cita.hora === hora);
      };
  
      const diasSinContacto = (cita: Cita): number => {
        if (!cita.ultimoContacto) {
          // Si nunca ha sido contactado, calcular días desde la creación de la cita
          const fechaCita = new Date(cita.fecha);
          const hoy = new Date();
          return Math.floor((hoy.getTime() - fechaCita.getTime()) / (1000 * 60 * 60 * 24));
        }
        
        const ultimoContacto = new Date(cita.ultimoContacto);
        const hoy = new Date();
        return Math.floor((hoy.getTime() - ultimoContacto.getTime()) / (1000 * 60 * 60 * 24));
      };
  
      const estadoContactoTexto = (cita: Cita): string => {
        const dias = diasSinContacto(cita);
        if (dias > 30) return 'Crítico: +30 días sin contacto';
        if (dias > 10) return 'Alerta: +10 días sin contacto';
        return 'Al día';
      };
  
      const getColorClaseCita = (cita: Cita): string => {
        const areaColors: Record<string, string> = {
          'niñez': 'bg-blue-100 text-blue-800',
          'movilidad': 'bg-green-100 text-green-800',
          'civil': 'bg-purple-100 text-purple-800',
          'penal': 'bg-orange-100 text-orange-800'
        };
        
        return areaColors[cita.area] || 'bg-gray-100 text-gray-800';
      };
  
      const seleccionarCita = (cita: Cita): void => {
        citaSeleccionada.value = {...cita};
      };
  
      const guardarCita = (): void => {
        const id = Math.max(0, ...citas.value.map(c => c.id)) + 1;
        citas.value.push({
          id,
          ...nuevaCita.value
        });
        
        // Resetear formulario
        nuevaCita.value = {
          cliente: '',
          area: 'civil',
          fecha: '',
          hora: 9,
          notas: ''
        };
        
        mostrarModalAgendarCita.value = false;
      };
  
      const registrarContacto = (cita: Cita): void => {
        citaContacto.value = cita;
        nuevoContacto.value = {
          fecha: new Date().toISOString().split('T')[0],
          notas: ''
        };
        mostrarModalRegistrarContacto.value = true;
      };
  
      const guardarContacto = (): void => {
        // Buscar la cita original en el array
        const index = citas.value.findIndex(c => c.id === citaContacto.value.id);
        if (index !== -1) {
          // Actualizar último contacto
          citas.value[index].ultimoContacto = nuevoContacto.value.fecha;
          
          // Agregar al historial
          if (!citas.value[index].historialContacto) {
            citas.value[index].historialContacto = [];
          }
          
          citas.value[index].historialContacto!.push({
            fecha: nuevoContacto.value.fecha,
            notas: nuevoContacto.value.notas
          });
          
          // Si la cita estaba seleccionada, actualizar la vista de detalles
          if (citaSeleccionada.value && citaSeleccionada.value.id === citaContacto.value.id) {
            citaSeleccionada.value = {...citas.value[index]};
          }
        }
        
        mostrarModalRegistrarContacto.value = false;
      };
  
      return {
        // Estado
        citas,
        filtroArea,
        filtroEstado,
        mostrarModalAgendarCita,
        mostrarModalRegistrarContacto,
        citaSeleccionada,
        citaContacto,
        nuevaCita,
        nuevoContacto,
        horasLaborales,
        diasSemana,
        citasFiltradas,
        
        // Métodos
        formatearHora,
        formatearFechaCompleta,
        getCitasEnHorario,
        diasSinContacto,
        estadoContactoTexto,
        getColorClaseCita,
        seleccionarCita,
        guardarCita,
        registrarContacto,
        guardarContacto
      };
    }
  });
</script>

<style scoped>

</style>