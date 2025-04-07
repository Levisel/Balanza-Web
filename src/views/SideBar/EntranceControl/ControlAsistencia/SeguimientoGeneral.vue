<template>
    <main class="flex flex-col items-center p-8 min-h-screen">
      <h1 class="text-3xl font-bold text-center mb-6">Resumen de Horas Estudiantes</h1>
      <Toast />
  
      <!-- Filtros -->
      <div class="flex flex-wrap gap-4 mb-6 items-center justify-center">
        <!-- Buscar por Cédula -->
        <InputText
          v-model="busquedaCedula"
          placeholder="Buscar por Cédula"
          class="w-60 p-inputtext-lg"
        />
  
        <!-- Buscar por Nombre y Apellido -->
        <InputText
          v-model="busquedaNombre"
          placeholder="Buscar por Nombre y Apellido"
          class="w-72 p-inputtext-lg"
        />
  
        <!-- Dropdown para filtrar por Área -->
        <Dropdown
          v-model="areaSeleccionada"
          :options="areas"
          optionLabel="label"
          placeholder="Filtrar por Área"
          class="w-60"
        />
  
        <!-- Botón para restablecer filtros -->
        <Button
          label="Restablecer filtros"
          icon="pi pi-filter-slash"
          class="p-button-outlined p-button-secondary"
          @click="limpiarFiltros"
        />
      </div>
  
      <!-- Mensaje de error, si lo hay -->
      <Message v-if="errorMensaje" severity="error" class="mb-4">
        {{ errorMensaje }}
      </Message>
  
      <!-- Tabla de Resumen de Horas Estudiantes -->
      <DataTable
        :value="resumenesFiltrados"
        paginator
        :rows="10"
        class="w-full max-w-6xl shadow-lg"
        removableSort
      >
        <!-- Columna: Cédula -->
        <Column field="Usuario_Cedula" header="Cédula" sortable>
          <template #body="slotProps">
            {{ slotProps.data.usuarioResumen?.Internal_ID || "N/A" }}
          </template>
        </Column>
  
        <!-- Columna: Nombres -->
        <Column field="Usuario_Nombres" header="Nombres" sortable>
          <template #body="slotProps">
            {{ slotProps.data.usuarioResumen?.Internal_Name || "N/A" }}
          </template>
        </Column>
  
        <!-- Columna: Apellidos -->
        <Column field="Usuario_Apellidos" header="Apellidos" sortable>
          <template #body="slotProps">
            {{ slotProps.data.usuarioResumen?.Internal_LastName || "N/A" }}
          </template>
        </Column>
  
        <!-- Columna: Correo Institucional -->
        <Column field="Usuario_Correo" header="Correo Institucional" sortable>
          <template #body="slotProps">
            {{ slotProps.data.usuarioResumen?.Internal_Email?.trim() || "N/A" }}
          </template>
        </Column>
  
        <!-- Columna: Área -->
        <Column field="Usuario_Area" header="Área" sortable>
          <template #body="slotProps">
            {{ slotProps.data.usuarioResumen?.Internal_Area?.trim() || "N/A" }}
          </template>
        </Column>
  
        <!-- Columna: Inicio (Fecha de Inicio) -->
        <Column field="Resumen_Inicio" header="Inicio" sortable>
          <template #body="slotProps">
            {{ formatDate(slotProps.data.Resumen_Inicio) }}
          </template>
        </Column>
  
        <!-- Columna: Horas Totales -->
        <Column field="Resumen_Horas_Totales" header="Horas Totales" sortable>
          <template #body="slotProps">
            {{ slotProps.data.Resumen_Horas_Totales || "N/A" }}
          </template>
        </Column>
  
        <!-- Columna de Acciones -->
        <Column header="Acciones">
          <template #body="slotProps">
            <div class="flex gap-2">
      <!-- Botón para ver detalle (ya existente) -->
      <Button 
        icon="pi pi-info-circle" 
        class="p-button-rounded p-button-info" 
        @click="verDetalle(slotProps.data)"
        v-tooltip.bottom="{ value: 'Ver Detalle', tooltipOptions: { position: 'top', showDelay: 300 } }"
      />
      <!-- Nuevo botón para ir a Seguimiento Semanal -->
      <Button 
        icon="pi pi-arrow-right" 
        class="p-button-rounded p-button-success" 
         @click="irSeguimientoSemanal(slotProps.data.Resumen_ID, slotProps.data.usuarioResumen.Internal_ID)"
        v-tooltip.bottom="{ value: 'Ver Seguimiento Semanal', tooltipOptions: { position: 'top', showDelay: 300 } }"
      />
    </div>
          </template>
        </Column>
      </DataTable>
  
      <!-- Modal para mostrar detalle completo -->
      <Dialog v-model:visible="modalInfoVisible" header="Detalle del Resumen" :modal="true" style="width: 30rem">
        <div class="flex flex-col gap-2">
          <p><strong>ID:</strong> {{ detalleSeleccionado?.Resumen_ID }}</p>
          <p><strong>Cédula:</strong> {{ detalleSeleccionado?.usuarioResumen?.Usuario_Cedula }}</p>
          <p>
            <strong>Nombre Completo:</strong>
            {{ detalleSeleccionado?.usuarioResumen?.Usuario_Nombres }} {{ detalleSeleccionado?.usuarioResumen?.Usuario_Apellidos }}
          </p>
          <p><strong>Correo:</strong> {{ detalleSeleccionado?.usuarioResumen?.Usuario_Correo }}</p>
          <p><strong>Área:</strong> {{ detalleSeleccionado?.usuarioResumen?.Usuario_Area || "N/A" }}</p>
          <p><strong>Inicio:</strong> {{ formatDate(detalleSeleccionado?.Resumen_Inicio) }}</p>
          <p>
            <strong>Fin:</strong>
            {{ detalleSeleccionado?.Resumen_Fin ? formatDate(detalleSeleccionado?.Resumen_Fin) : "N/A" }}
          </p>
          <p><strong>Horas Totales:</strong> {{ detalleSeleccionado?.Resumen_Horas_Totales }}</p>
          <p><strong>Horas Adicionales:</strong> {{ detalleSeleccionado?.Resumen_Horas_Adicionales }}</p>
          <p><strong>Horas Reducidas:</strong> {{ detalleSeleccionado?.Resumen_Horas_Reducidas }}</p>
          <p><strong>Creado:</strong> {{ formatDate(detalleSeleccionado?.createdAt) }}</p>
          <p><strong>Actualizado:</strong> {{ formatDate(detalleSeleccionado?.updatedAt) }}</p>
        </div>
        <template #footer>
          <Button label="Cerrar" icon="pi pi-times" class="p-button-secondary" @click="modalInfoVisible = false" />
        </template>
      </Dialog>
    </main>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { useToast } from "primevue/usetoast";
  
  // Componentes PrimeVue
  import InputText from "primevue/inputtext";
  import Button from "primevue/button";
  import Dropdown from "primevue/dropdown";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import Message from "primevue/message";
  import Toast from "primevue/toast";
  import Dialog from "primevue/dialog";
  
  // Importa la constante de API según tu proyecto
  import { API } from "@/ApiRoute";
  
  // Función para formatear la fecha a la hora local
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };
  
  // Estados
  const resumenes = ref([]);
  const busquedaCedula = ref("");
  const busquedaNombre = ref("");
  const areaSeleccionada = ref(""); // Dropdown: valor inicial vacío
  const errorMensaje = ref("");
  
  // Opciones para el Dropdown de Área
  const areas = ref([
    { label: "Todos", value: "" },
    { label: "Administración", value: "administración" },
    { label: "Recursos Humanos", value: "recursos humanos" },
    { label: "Finanzas", value: "finanzas" },
    // Agrega más opciones según tus áreas...
  ]);
  
  const toast = useToast();
  const router = useRouter();
  
  // Variables para el modal de detalle
  const modalInfoVisible = ref(false);
  const detalleSeleccionado = ref<any>(null);
  
  // Computed: Filtrar el JSON según cédula, nombre/apellido y área
  const resumenesFiltrados = computed(() => {
    return resumenes.value.filter((item) => {
      const cedula = item.usuarioResumen?.Internal_ID?.toLowerCase() || "";
      const nombres = item.usuarioResumen?.Internal_Name?.toLowerCase() || "";
      const apellidos = item.usuarioResumen?.Internal_LastName?.toLowerCase() || "";
      const area = item.usuarioResumen?.Internal_Area?.toLowerCase() || "";
      const fullName = `${nombres} ${apellidos}`;
  
      const filtroCedula = busquedaCedula.value.trim()
        ? cedula.includes(busquedaCedula.value.toLowerCase().trim())
        : true;
      const filtroNombre = busquedaNombre.value.trim()
        ? fullName.includes(busquedaNombre.value.toLowerCase().trim())
        : true;
      const filtroArea =
        areaSeleccionada.value && areaSeleccionada.value !== ""
          ? area === areaSeleccionada.value.toLowerCase()
          : true;
  
      return filtroCedula && filtroNombre && filtroArea;
    });
  });
  
  // Función para limpiar filtros
  const limpiarFiltros = () => {
    busquedaCedula.value = "";
    busquedaNombre.value = "";
    areaSeleccionada.value = "";
  };
  
  // Función para ver detalle: asigna el dato seleccionado y muestra el modal
  const verDetalle = (data: any) => {
    detalleSeleccionado.value = data;
    modalInfoVisible.value = true;
  };
  
  // Función para cargar datos desde la API
  const fetchResumenes = async () => {
    try {
      const res = await fetch(`${API}/resumenHoras/completo`);
      if (!res.ok) throw new Error("Error al obtener el resumen de horas");
      const data = await res.json();
      resumenes.value = data;
    } catch (error) {
      console.error("Error cargando resumenes:", error);
      errorMensaje.value = "Error al cargar el resumen de horas.";
    }
  };


const irSeguimientoSemanal = (resumenId: number, internalId: number) => {
  router.push({
    name: 'ResumenSemanal',
    params: { resumenId, internalId }
  });
};


  
  onMounted(() => {
    fetchResumenes();
  });
  </script>
  
  <style scoped>
  /* Puedes agregar tus estilos personalizados aquí */
  </style>
  