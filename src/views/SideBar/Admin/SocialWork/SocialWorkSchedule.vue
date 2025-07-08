<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Gestión de Citas</h1>
        <p class="text-gray-600 mt-1">Consultorios Jurídicos</p>
      </div>
      
      <!-- Estadísticas Rápidas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-500">Total Citas</p>
              <p class="text-2xl font-bold text-gray-900">{{ citas.length }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-500">Al Día</p>
              <p class="text-2xl font-bold text-green-600">{{ estadisticas.alDia }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-500">Alerta</p>
              <p class="text-2xl font-bold text-yellow-600">{{ estadisticas.alerta }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-500">Crítico</p>
              <p class="text-2xl font-bold text-red-600">{{ estadisticas.critico }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros y Acciones -->
      <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-gray-700">Estado:</label>
              <select v-model="filtroEstado" class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option value="">Todos</option>
                <option value="aldia">Al día</option>
                <option value="alerta">Alerta (+10 días)</option>
                <option value="critico">Crítico (+30 días)</option>
              </select>
            </div>
            
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-gray-700">Semana:</label>
              <input 
                v-model="fechaBaseCalendario" 
                type="date" 
                class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                @change="actualizarSemana"
              >
            </div>
          </div>
          
          <button @click="mostrarModalAgendarCita = true" 
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Agendar Nueva Cita
          </button>
        </div>
      </div>

      <!-- Calendario Semanal -->
      <div class="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Calendario Semanal</h2>
            <div class="flex items-center gap-2">
              <button @click="cambiarSemana(-1)" class="p-1 hover:bg-gray-100 rounded">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <span class="text-sm text-gray-600">{{ rangoSemana }}</span>
              <button @click="cambiarSemana(1)" class="p-1 hover:bg-gray-100 rounded">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="p-4 overflow-x-auto">
          <div class="min-w-max">
            <div class="grid grid-cols-6 gap-2 mb-2">
              <div class="w-20 font-medium text-gray-500">Hora</div>
              <div v-for="dia in diasSemana" :key="dia.valor" class="w-32 font-medium text-center py-2 text-gray-700">
                {{ dia.nombre }}
                <br>
                <span class="text-sm text-gray-500">{{ dia.fecha }}</span>
              </div>
            </div>
            
            <div v-for="hora in horasLaborales" :key="hora" class="grid grid-cols-6 gap-2 border-t border-gray-100">
              <div class="py-3 text-sm text-gray-600 font-medium">{{ formatearHora(hora) }}</div>
              <div v-for="dia in diasSemana" :key="`${dia.valor}-${hora}`" 
                   class="min-h-16 p-1 border border-gray-200 rounded-md relative hover:bg-gray-50"
                   @click="abrirModalCitaRapida(dia.valor, hora)">
                <div v-for="cita in getCitasEnHorario(dia.valor, hora)" :key="cita.id"
                     :class="[
                       'text-xs p-2 rounded cursor-pointer mb-1 transition-colors',
                       getColorCita(cita)
                     ]"
                     @click.stop="seleccionarCita(cita)">
                  <div class="font-medium">{{ cita.cliente }}</div>
                  <div class="text-xs opacity-75">{{ getEstadoCorto(cita) }}</div>
                </div>
                <div v-if="getCitasEnHorario(dia.valor, hora).length === 0" 
                     class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span class="text-xs text-gray-400">+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Citas -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Estado de Contacto con Clientes</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Contacto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="cita in citasFiltradas" :key="cita.id"
                  :class="getRowClass(cita)">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 w-2 h-2 rounded-full mr-3" :class="getIndicadorColor(cita)"></div>
                    <div class="text-sm font-medium text-gray-900">{{ cita.cliente }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{{ formatearFechaCompleta(cita.fecha) }}</div>
                  <div class="text-xs text-gray-400">{{ formatearHora(cita.hora) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ cita.ultimoContacto ? formatearFechaCompleta(cita.ultimoContacto) : 'Sin contacto' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getEstadoBadgeClass(cita)">
                    {{ estadoContactoTexto(cita) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex items-center space-x-2">
                    <button @click="registrarContacto(cita)" 
                            class="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 px-2 py-1 rounded">
                      Contactar
                    </button>
                    <button @click="seleccionarCita(cita)" 
                            class="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded">
                      Ver
                    </button>
                    <button @click="confirmarEliminarCita(cita.id)"
                            class="text-red-600 hover:text-red-900 hover:bg-red-50 px-2 py-1 rounded">
                      Eliminar
                    </button>
                  </div>
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
                   class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                   placeholder="Ingrese el nombre completo">
          </div>
        
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input v-model="nuevaCita.fecha" type="date" required
                     :min="fechaMinima"
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
                      class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Información adicional sobre la cita..."></textarea>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button type="button" @click="cerrarModalAgendarCita"
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
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-bold">Detalles de la Cita</h2>
          <button @click="citaSeleccionada = null" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500">Cliente</h3>
              <p class="mt-1 text-lg font-semibold">{{ citaSeleccionada.cliente }}</p>
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
                  getIndicadorColor(citaSeleccionada)
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
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Historial de Contacto</h3>
            <div class="max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-3">
              <div v-if="citaSeleccionada.historialContacto && citaSeleccionada.historialContacto.length">
                <div v-for="(contacto, index) in citaSeleccionada.historialContacto" :key="index"
                     class="py-2 border-b border-gray-200 last:border-0">
                  <p class="text-sm font-medium">{{ formatearFechaCompleta(contacto.fecha) }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ contacto.notas }}</p>
                </div>
              </div>
              <p v-else class="text-sm text-gray-500 text-center py-4">No hay registros de contacto</p>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button @click="registrarContacto(citaSeleccionada)"
                  class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
            Registrar Contacto
          </button>
          <button @click="confirmarEliminarCita(citaSeleccionada.id); citaSeleccionada = null"
                  class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">
            Eliminar Cita
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
            <p class="text-sm font-medium text-gray-700">Cliente: <span class="font-semibold">{{ citaContacto.cliente }}</span></p>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Contacto</label>
            <input v-model="nuevoContacto.fecha" type="date" required
                   :max="fechaMaxima"
                   class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Notas de Contacto</label>
            <textarea v-model="nuevoContacto.notas" rows="4" required
                      class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Describa el contacto realizado, temas tratados, próximos pasos, etc."></textarea>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button type="button" @click="mostrarModalRegistrarContacto = false"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
              Cancelar
            </button>
            <button type="submit"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
              Guardar Contacto
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, onMounted, watch } from 'vue';

  interface Contacto {
    fecha: string;
    notas: string;
  }

  interface Cita {
    id: number;
    cliente: string;
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
      const citas = ref<Cita[]>([]);
      const fechaBaseCalendario = ref('');

      // Filtros
      const filtroEstado = ref('');

      // Modales
      const mostrarModalAgendarCita = ref(false);
      const mostrarModalRegistrarContacto = ref(false);
      const citaSeleccionada = ref<Cita | null>(null);
      const citaContacto = ref<Cita>({} as Cita);

      // Formularios
      const nuevaCita = ref<Omit<Cita, 'id'>>({
        cliente: '',
        fecha: '',
        hora: 9,
        notas: ''
      });

      const nuevoContacto = ref<Contacto>({
        fecha: '',
        notas: ''
      });

      // Configuración de fechas
      const horasLaborales = ref([8, 9, 10, 11, 12, 14, 15, 16, 17]);
      
      // Función para formatear fechas en formato español
      const formatearFechaEspanol = (fecha: Date): string => {
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear();
        return `${año}-${mes}-${dia}`;
      };

      // Función para parsear fechas considerando el formato local
      const parsearFecha = (fechaStr: string): Date => {
        // Asumimos que las fechas vienen en formato ISO (YYYY-MM-DD)
        const [año, mes, dia] = fechaStr.split('-').map(Number);
        return new Date(año, mes - 1, dia);
      };

      // Fechas límite
      const fechaMinima = computed(() => {
        return formatearFechaEspanol(new Date());
      });

      const fechaMaxima = computed(() => {
        return formatearFechaEspanol(new Date());
      });

      // Inicializar fecha base del calendario
      const inicializarFechaBase = () => {
        fechaBaseCalendario.value = formatearFechaEspanol(new Date());
      };

      // Calendario
      const diasSemana = computed(() => {
        const fechaBase = fechaBaseCalendario.value ? parsearFecha(fechaBaseCalendario.value) : new Date();
        const lunes = new Date(fechaBase);
        lunes.setDate(fechaBase.getDate() - fechaBase.getDay() + 1);
        
        const dias = [];
        for (let i = 0; i < 5; i++) {
          const fecha = new Date(lunes);
          fecha.setDate(lunes.getDate() + i);
          
          dias.push({
            nombre: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][i],
            valor: formatearFechaEspanol(fecha),
            fecha: `${fecha.getDate()}/${fecha.getMonth() + 1}`
          });
        }
        return dias;
      });

      const rangoSemana = computed(() => {
        if (diasSemana.value.length === 0) return '';
        const inicio = parsearFecha(diasSemana.value[0].valor);
        const fin = parsearFecha(diasSemana.value[4].valor);
        return `${inicio.getDate()}/${inicio.getMonth() + 1} - ${fin.getDate()}/${fin.getMonth() + 1}`;
      });

      // Estadísticas
      const estadisticas = computed(() => {
        return {
          alDia: citas.value.filter(c => diasSinContacto(c) <= 10).length,
          alerta: citas.value.filter(c => diasSinContacto(c) > 10 && diasSinContacto(c) <= 30).length,
          critico: citas.value.filter(c => diasSinContacto(c) > 30).length
        };
      });

      // Filtrado de citas
      const citasFiltradas = computed(() => {
        return citas.value.filter(cita => {
          if (!filtroEstado.value) return true;

          const diasSinContactar = diasSinContacto(cita);
          if (filtroEstado.value === 'aldia') {
            return diasSinContactar <= 10;
          } else if (filtroEstado.value === 'alerta') {
            return diasSinContactar > 10 && diasSinContactar <= 30;
          } else if (filtroEstado.value === 'critico') {
            return diasSinContactar > 30;
          }
          
          return true;
        });
      });

      // Métodos de formateo
      const formatearHora = (hora: number): string => {
        return `${hora.toString().padStart(2, '0')}:00`;
      };

      const formatearFechaCompleta = (fechaStr: string): string => {
        if (!fechaStr) return '';
        const fecha = parsearFecha(fechaStr);
        return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
      };

      // Métodos de calendario
      const getCitasEnHorario = (dia: string, hora: number): Cita[] => {
        return citas.value.filter(cita => cita.fecha === dia && cita.hora === hora);
      };

      const cambiarSemana = (direccion: number): void => {
        const fechaActual = parsearFecha(fechaBaseCalendario.value);
        fechaActual.setDate(fechaActual.getDate() + (direccion * 7));
        fechaBaseCalendario.value = formatearFechaEspanol(fechaActual);
      };

      const actualizarSemana = (): void => {
        // La fecha ya está actualizada por el v-model
      };

      const abrirModalCitaRapida = (fecha: string, hora: number): void => {
        nuevaCita.value.fecha = fecha;
        nuevaCita.value.hora = hora;
        mostrarModalAgendarCita.value = true;
      };

      // Métodos de estado
      const diasSinContacto = (cita: Cita): number => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        let fechaReferencia: Date;
        
        if (cita.ultimoContacto) {
          fechaReferencia = parsearFecha(cita.ultimoContacto);
        } else {
          fechaReferencia = parsearFecha(cita.fecha);
        }
        
        fechaReferencia.setHours(0, 0, 0, 0);
        return Math.floor((hoy.getTime() - fechaReferencia.getTime()) / (1000 * 60 * 60 * 24));
      };

      const estadoContactoTexto = (cita: Cita): string => {
        const dias = diasSinContacto(cita);
        if (dias > 30) return 'Crítico';
        if (dias > 10) return 'Alerta';
        return 'Al día';
      };

      const getEstadoCorto = (cita: Cita): string => {
        const dias = diasSinContacto(cita);
        if (dias > 30) return '⚠️';
        if (dias > 10) return '⏰';
        return '✅';
      };

      // Métodos de estilo
      const getColorCita = (cita: Cita): string => {
        const dias = diasSinContacto(cita);
        if (dias > 30) return 'bg-red-100 text-red-800 border-red-200';
        if (dias > 10) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-green-100 text-green-800 border-green-200';
      };

      const getRowClass = (cita: Cita): string => {
        const dias = diasSinContacto(cita);
        if (dias > 30) return 'bg-red-50 hover:bg-red-100';
        if (dias > 10) return 'bg-yellow-50 hover:bg-yellow-100';
        return 'hover:bg-gray-50';
      };

      const getIndicadorColor = (cita: Cita): string => {
        const dias = diasSinContacto(cita);
        if (dias > 30) return 'bg-red-500';
        if (dias > 10) return 'bg-yellow-500';
        return 'bg-green-500';
      };

      const getEstadoBadgeClass = (cita: Cita): string => {
        const dias = diasSinContacto(cita);
        const baseClass = 'px-2 py-1 text-xs rounded-full font-medium';
        if (dias > 30) return `${baseClass} bg-red-100 text-red-800`;
        if (dias > 10) return `${baseClass} bg-yellow-100 text-yellow-800`;
        return `${baseClass} bg-green-100 text-green-800`;
      };

      // Métodos de acciones
      const seleccionarCita = (cita: Cita): void => {
        citaSeleccionada.value = { ...cita };
      };

      const cerrarModalAgendarCita = (): void => {
        mostrarModalAgendarCita.value = false;
        nuevaCita.value = {
          cliente: '',
          fecha: '',
          hora: 9,
          notas: ''
        };
      };

      const guardarCita = (): void => {
        // Validar que no haya conflicto de horario
        const conflicto = citas.value.find(c => 
          c.fecha === nuevaCita.value.fecha && c.hora === nuevaCita.value.hora
        );

        if (conflicto) {
          alert('Ya existe una cita agendada en ese horario. Por favor, seleccione otro horario.');
          return;
        }

        const id = Math.max(0, ...citas.value.map(c => c.id)) + 1;
        citas.value.push({
          id,
          ...nuevaCita.value,
          historialContacto: []
        });
        
        cerrarModalAgendarCita();
      };

      const registrarContacto = (cita: Cita): void => {
        citaContacto.value = cita;
        nuevoContacto.value = {
          fecha: formatearFechaEspanol(new Date()),
          notas: ''
        };
        mostrarModalRegistrarContacto.value = true;
      };

      const guardarContacto = (): void => {
        const index = citas.value.findIndex(c => c.id === citaContacto.value.id);
        if (index !== -1) {
          // Actualizar último contacto
          citas.value[index].ultimoContacto = nuevoContacto.value.fecha;
          
          // Agregar al historial
          if (!citas.value[index].historialContacto) {
            citas.value[index].historialContacto = [];
          }
          
          citas.value[index].historialContacto!.unshift({
            fecha: nuevoContacto.value.fecha,
            notas: nuevoContacto.value.notas
          });
          
          // Ordenar historial por fecha descendente
          citas.value[index].historialContacto!.sort((a, b) => 
            parsearFecha(b.fecha).getTime() - parsearFecha(a.fecha).getTime()
          );
          
          // Actualizar vista de detalles si está abierta
          if (citaSeleccionada.value && citaSeleccionada.value.id === citaContacto.value.id) {
            citaSeleccionada.value = { ...citas.value[index] };
          }
        }
        
        mostrarModalRegistrarContacto.value = false;
      };

      const eliminarCita = (citaId: number): void => {
        citas.value = citas.value.filter(c => c.id !== citaId);
        if (citaSeleccionada.value && citaSeleccionada.value.id === citaId) {
          citaSeleccionada.value = null;
        }
      };

      const confirmarEliminarCita = (citaId: number): void => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
          eliminarCita(citaId);
        }
      };

      // Persistencia con localStorage
      const cargarCitas = (): void => {
        const citasGuardadas = localStorage.getItem('citasAgendadasSocialWork');
        if (citasGuardadas) {
          try {
            citas.value = JSON.parse(citasGuardadas);
          } catch (error) {
            console.error('Error al cargar citas:', error);
            citas.value = [];
          }
        }
      };

      const guardarCitas = (): void => {
        localStorage.setItem('citasAgendadasSocialWork', JSON.stringify(citas.value));
      };

      // Inicialización
      onMounted(() => {
        inicializarFechaBase();
        cargarCitas();
        
        // Establecer fecha por defecto para nueva cita
        nuevaCita.value.fecha = fechaMinima.value;
        nuevoContacto.value.fecha = fechaMaxima.value;
      });

      // Watchers
      watch(citas, guardarCitas, { deep: true });

      return {
        // Estado
        citas,
        fechaBaseCalendario,
        filtroEstado,
        mostrarModalAgendarCita,
        mostrarModalRegistrarContacto,
        citaSeleccionada,
        citaContacto,
        nuevaCita,
        nuevoContacto,
        horasLaborales,
        diasSemana,
        rangoSemana,
        citasFiltradas,
        estadisticas,
        fechaMinima,
        fechaMaxima,
        
        // Métodos de formateo
        formatearHora,
        formatearFechaCompleta,
        
        // Métodos de calendario
        getCitasEnHorario,
        cambiarSemana,
        actualizarSemana,
        abrirModalCitaRapida,
        
        // Métodos de estado
        diasSinContacto,
        estadoContactoTexto,
        getEstadoCorto,
        
        // Métodos de estilo
        getColorCita,
        getRowClass,
        getIndicadorColor,
        getEstadoBadgeClass,
        
        // Métodos de acciones
        seleccionarCita,
        cerrarModalAgendarCita,
        guardarCita,
        registrarContacto,
        guardarContacto,
        eliminarCita,
        confirmarEliminarCita
      };
    }
  });
</script>