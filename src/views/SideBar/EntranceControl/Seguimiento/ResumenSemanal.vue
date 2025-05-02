<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import { API } from "@/ApiRoute";
import { useAuthStore } from "@/stores/auth";
import { useDarkMode } from "@/components/ThemeSwitcher";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import Dialog from 'primevue/dialog';
import axios from "axios";


const { isDarkTheme } = useDarkMode(); // 🔥 usa el modo oscuro global
const toast = useToast(); // 🔥 usa el toast global
const router = useRouter();
const route = useRoute();


const modalComentarioVisible = ref(false);
const comentarioSeleccionado = ref("");

const verComentarioCompleto = (comentario: string) => {
  comentarioSeleccionado.value = comentario;
  modalComentarioVisible.value = true;
};


const authStore = useAuthStore();
const usuarioAuth = authStore.user;

const isEstudiante = usuarioAuth?.type === "Estudiante";

// Si es estudiante, se usa su propio ID. Si no, se usa desde la ruta.
const internalId = isEstudiante ? usuarioAuth.id : route.params.internalId;
const resumenId = ref(isEstudiante ? null : route.params.resumenId); // se llenará luego si es estudiante


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
    (acc, item) => acc + parseFloat(item.Attendance_Hours || "0"),
    0
  )
);

const mostrarModalHoras = ref(false)
const horasExtraordinarias = ref<any[]>([])

const abrirModalHoras = async () => {
  try {
    const { data } = await axios.get(`${API}/horasExtraordinariasByUser/${internalId}`, {
      withCredentials: true,
    });

    if (!data.length) {
      return toast.add({
        severity: "info",
        summary: "Sin horas extraordinarias",
        detail: "No se encontraron horas extraordinarias para este usuario.",
        life: 3000,
      });
    }

    horasExtraordinarias.value = data;
    mostrarModalHoras.value = true;
  } catch (error) {
    console.error("Error al cargar horas extraordinarias:", error);
  }
};




const volver = () => {
  router.push({ name: "SeguimientoGeneral" });
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
};

const resumenGeneral = ref({
  Summary_Total_Hours: 0,
  Summary_Extra_Hours: 0,
  Summary_Reduced_Hours: 0,
});

const fetchResumenGeneral = async () => {
  try {
    const { data } = await axios.get(`${API}/resumenHoras/porCedula/${internalId}`, {
      withCredentials: true,
    });

    if (!data?.Summary_ID) {
      toast.add({
        severity: "warn",
        summary: "Resumen no encontrado",
        detail: "Este estudiante no tiene resumen general registrado.",
        life: 4000,
      });
      loading.value = false;
      return;
    }

    resumenGeneral.value = data;
    resumenId.value = data.Summary_ID;
    await fetchResumenSemanales();
  } catch (error: any) {
    if (error.response?.status === 404) {
      toast.add({
        severity: "warn",
        summary: "Resumen no encontrado",
        detail: "Este estudiante no tiene resumen general registrado.",
        life: 4000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Error al cargar",
        detail: "Ocurrió un error inesperado al intentar cargar el resumen general.",
        life: 4000,
      });
    }
    loading.value = false;
  }
};








const fetchResumenSemanales = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(`${API}/resumenSemanales/resumenGeneral/${resumenId.value}`, {
      withCredentials: true,
    });
    resumenesSemanales.value = data;
  } catch (error: any) {
    console.error("Error al cargar el resumen semanal:", error.message);
    resumenesSemanales.value = [];
  } finally {
    loading.value = false;
  }
};



const fetchStudent = async () => {
  try {
    const { data } = await axios.get(`${API}/internal-user/${internalId}`, {
      withCredentials: true,
    });
    student.value = data;
  } catch (error: any) {
    console.error("Error al cargar la información del estudiante:", error.message);
  }
};



onMounted(() => {
  fetchStudent();
  fetchResumenGeneral(); // si es estudiante, este llamará a fetchResumenSemanales
  if (!isEstudiante) {
    fetchResumenSemanales();
  }
});


</script>

<template>
  <main class="p-8 max-w-5xl mx-auto transition-colors duration-300 min-h-screen">
       <!-- Toast para mensajes -->
       <Toast />
   <!-- Encabezado -->
<div class="flex items-center gap-4 mb-8">
  <Button 
    v-if="!isEstudiante"
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

    <!-- Datos del resumen general -->
<div :class="[
  'rounded-2xl shadow-md p-6 mb-8 space-y-2',
  isDarkTheme ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'
]">
 <p class="text-lg"><strong>Total de Horas:</strong> {{ resumenGeneral.Summary_Total_Hours }}</p>
<p class="text-lg"><strong>Horas Adicionales:</strong> {{ resumenGeneral.Summary_Extra_Hours }}</p>
<p class="text-lg"><strong>Horas Reducidas:</strong> {{ resumenGeneral.Summary_Reduced_Hours }}</p>
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
        <p class="text-xl"><strong>Horas de Asistencia Semanales:</strong> {{ totalHoras }}</p>
      </div>

      <Button 
  icon="pi pi-eye"
  label="Ver Horas Extraordinarias"
  class="mb-4 p-button-outlined p-button-secondary"
  @click="abrirModalHoras"
/>



      <div :class="[
        'rounded-2xl shadow-md p-4',
        isDarkTheme ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'
      ]">
        <DataTable :value="resumenesSemanales" paginator rows="10" class="w-full">
          <Column field="Period_Name" header="Período" sortable />
          <Column field="Week_Number" header="Semana" sortable />
          <Column header="Inicio" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.Week_Start) }}
            </template>
          </Column>
          <Column header="Fin" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.Week_End) }}
            </template>
          </Column>
          <Column field="Attendance_Hours" header="Horas Asistencia" sortable />
        </DataTable>
      </div>
    </div>

    <Dialog 
  v-model:visible="mostrarModalHoras"
  header="Horas Extraordinarias"
  modal
  :style="{ width: '60vw' }"
  :breakpoints="{ '960px': '95vw' }"
>
  <div class="overflow-x-auto">
    <DataTable :value="horasExtraordinarias" class="w-full">

      <Column field="Horas_Fecha" header="Fecha">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.Hours_Date) }}
        </template>
      </Column>
      <Column field="Hours_Type" header="Tipo" />
      <Column field="Hours_Num" header="Cantidad" />
      <Column field="Hours_Approved_By" header="Aprobado Por" />
      <Column header="Comentario">
  <template #body="slotProps">
    <div class="flex items-center gap-2">
      <!-- Truncar solo visualmente, sin limitar el acceso al comentario completo -->
      <span class="truncate max-w-[200px]">
        {{ slotProps.data.Hours_Comment || '—' }}
      </span>
      <!-- Mostrar botón SIEMPRE que haya comentario -->
      <Button 
        v-if="slotProps.data.Hours_Comment"
        icon="pi pi-comment"
        class="p-button-text text-blue-500"
        @click="verComentarioCompleto(slotProps.data.Hours_Comment)"
        v-tooltip.top="'Ver comentario completo'"
      />
    </div>
  </template>
</Column>



    </DataTable>
  </div>
</Dialog>

<Dialog
  v-model:visible="modalComentarioVisible"
  header="Comentario Completo"
  modal
  :style="{ width: '50vw' }"
  :breakpoints="{ '960px': '90vw' }"
>
  <div
    class="p-4 max-h-[400px] overflow-y-auto break-words whitespace-pre-wrap leading-relaxed text-justify"
    :class="isDarkTheme ? 'text-white' : 'text-gray-900'"
  >
    {{ comentarioSeleccionado }}
  </div>
</Dialog>




  </main>
</template>
