<template>
  <div v-if="estaInicializado" class="p-4">
    <h2 class="text-2xl font-bold mb-4">Horario (09:00 - 17:00)</h2>
    <div class="overflow-x-auto">
      <!-- Encabezado: columna de hora y días -->
      <div class="grid grid-cols-6 gap-2 mb-2 border-b pb-2">
        <div>Hora</div>
        <div v-for="dia in diasSemana" :key="dia" class="text-center font-medium">
          {{ dia }}
        </div>
      </div>
      <!-- Filas: una por cada hora -->
      <div v-for="hora in horas" :key="hora" class="grid grid-cols-6 gap-2 border-b py-2">
        <!-- Columna de hora (formateada) -->
        <div class="font-semibold">
          {{ formatearHora(hora) }}
        </div>
        <!-- Columnas para cada día -->
        <div
          v-for="dia in diasSemana"
          :key="dia + '-' + hora"
          class="border p-1 min-h-[3rem] flex flex-col items-center justify-center"
        >
          <template v-if="scheduleMatrix[dia][hora].length">
            <!-- Si la celda incluye Presencial -->
            <span v-if="scheduleMatrix[dia][hora].includes(1)" class="text-green-700 font-bold">
              Presencial
            </span>
            <!-- Si la celda incluye Virtual -->
            <span v-if="scheduleMatrix[dia][hora].includes(2)" class="text-blue-700 font-bold">
              Virtual
            </span>
          </template>
          <span v-else class="text-gray-500">
            Libre
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

// Ahora el componente espera un arreglo de horarios
const props = defineProps({
  schedules: {
    type: Array,
    default: () => []
  }
})

// Días y horas de la cuadrícula
const diasSemana = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const horas = [9, 10, 11, 12, 13, 14, 15, 16, 17]

// Matriz para la visualización. Cada celda es un arreglo (inicialmente vacío).
const scheduleMatrix = ref<Record<string, Record<number, number[]>>>({})

// Indica si la matriz ya se inicializó
const estaInicializado = computed(() => Object.keys(scheduleMatrix.value).length > 0)

// Función para inicializar la matriz: cada celda es un arreglo vacío
function inicializarMatriz() {
  const mat: Record<string, Record<number, number[]>> = {}
  for (const dia of diasSemana) {
    mat[dia] = {}
    for (const h of horas) {
      mat[dia][h] = []
    }
  }
  scheduleMatrix.value = mat
}

// Función para recorrer cada horario recibido y marcar en la matriz los rangos correspondientes
function parsearHorarios() {
  for (const schedule of props.schedules as Array<{ Schedule_Mode: string; [key: string]: any }>) {
    const modCode = schedule.Schedule_Mode?.toLowerCase() === 'virtual' ? 2 : 1;

    for (const dia of diasSemana) {
      const startKey = `${dia}_Start`; // ej: Monday_Start
      const endKey = `${dia}_End`;     // ej: Monday_End

      const start = schedule[startKey];
      const end = schedule[endKey];

      if (start && end) {
        const startHour = parseInt(start.slice(0, 2), 10);
        const endHour = parseInt(end.slice(0, 2), 10);

        for (let h = startHour; h < endHour; h++) {
          if (!scheduleMatrix.value[dia][h].includes(modCode)) {
            scheduleMatrix.value[dia][h].push(modCode);
          }
        }
      }
    }
  }
}


// Inicializamos y parseamos al montar el componente
onMounted(() => {
  inicializarMatriz()
  parsearHorarios()
})

// Si cambia el arreglo de horarios, reinicializamos la matriz y la volvemos a parsear
watch(
  () => props.schedules,
  () => {
    inicializarMatriz()
    parsearHorarios()
  },
  { deep: true }
)

// Función para formatear la hora (e.g., 9 => "09:00")
function formatearHora(h: number): string {
  return String(h).padStart(2, '0') + ':00'
}
</script>

<style scoped>
/* Puedes ajustar estilos adicionales si lo deseas */
</style>
