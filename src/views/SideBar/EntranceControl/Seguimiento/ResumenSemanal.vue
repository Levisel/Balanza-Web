<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import { API } from "@/ApiRoute";
import { useDarkMode } from "@/components/ThemeSwitcher";

const { isDarkTheme } = useDarkMode(); // 🔥 usa el modo oscuro global

const router = useRouter();
const route = useRoute();

const resumenId = route.params.resumenId;
const internalId = route.params.internalId;

const resumenesSemanales = ref<any[]>([]);
const loading = ref(true);

const student = ref({
  Internal_ID: "",
  Internal_Name: "",
  Internal_LastName: "",
  Internal_Email: "",
  Internal_Area: ""
});

const totalHoras = computed(() =>
  resumenesSemanales.value.reduce(
    (acc, item) => acc + parseFloat(item.Horas_Asistencia || "0"),
    0
  )
);

const volver = () => {
  router.push({ name: "SeguimientoGeneral" });
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
};

const fetchResumenSemanales = async () => {
  try {
    const response = await fetch(`${API}/resumenSemanales/resumenGeneral/${resumenId}`);
    if (!response.ok) throw new Error("Error al obtener el resumen semanal");
    const data = await response.json();
    resumenesSemanales.value = data;
  } catch (error: any) {
    console.error("Error al cargar el resumen semanal:", error.message);
  } finally {
    loading.value = false;
  }
};

const fetchStudent = async () => {
  try {
    const response = await fetch(`${API}/internal-user/${internalId}`);
    if (!response.ok) throw new Error("Error al obtener la información del estudiante");
    const data = await response.json();
    student.value = data;
  } catch (error: any) {
    console.error("Error al cargar la información del estudiante:", error.message);
  }
};

onMounted(() => {
  fetchResumenSemanales();
  fetchStudent();
});
</script>

<template>
  <main class="p-8 max-w-5xl mx-auto transition-colors duration-300 min-h-screen">
    <!-- Encabezado -->
    <div class="flex items-center gap-4 mb-8">
      <Button 
        icon="pi pi-arrow-left" 
        class="p-button-rounded p-button-outlined text-blue-600 hover:text-blue-800"
        @click="volver"
        tooltip="Volver"
        tooltipOptions="{ position: 'top' }"
      />
      <h1 class="text-3xl font-bold">Resumen Semanal</h1>
    </div>

    <!-- Info estudiante -->
    <div :class="[
      'rounded-2xl shadow-md p-6 mb-8 space-y-2',
      isDarkTheme ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'
    ]">
      <p class="text-lg"><strong>Cédula:</strong> {{ student.Internal_ID || 'N/A' }}</p>
      <p class="text-lg"><strong>Nombre:</strong> {{ student.Internal_Name }} {{ student.Internal_LastName }}</p>
      <p class="text-lg"><strong>Área:</strong> {{ student.Internal_Area || 'N/A' }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-lg" :class="isDarkTheme ? 'text-gray-300' : 'text-gray-500'">
      Cargando resumen semanal...
    </div>

    <!-- Tabla -->
    <div v-else>
      <div :class="[
        'border-l-4 p-4 rounded-lg mb-6',
        isDarkTheme 
          ? 'bg-[#2c2c2c] border-blue-500 text-white'
          : 'bg-blue-100 border-blue-400 text-blue-800'
      ]">
        <p class="text-xl"><strong>Total de Horas Semanales:</strong> {{ totalHoras }}</p>
      </div>

      <div :class="[
        'rounded-2xl shadow-md p-4',
        isDarkTheme ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'
      ]">
        <DataTable :value="resumenesSemanales" paginator rows="10" class="w-full">
          <Column field="Semana_Numero" header="Semana" sortable />
          <Column header="Inicio" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.Semana_Inicio) }}
            </template>
          </Column>
          <Column header="Fin" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.Semana_Fin) }}
            </template>
          </Column>
          <Column field="Horas_Asistencia" header="Horas Asistencia" sortable />
        </DataTable>
      </div>
    </div>
  </main>
</template>
