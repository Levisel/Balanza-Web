<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import Message from "primevue/message";
import { useDarkMode } from "@/components/ThemeSwitcher";
import { API, type Usuario } from  "@/ApiRoute";

const router = useRouter();
const route = useRoute();
const { isDarkTheme } = useDarkMode();

const estudianteId = route.params.id ? String(route.params.id) : null; // ID si se está editando

// **Datos del Formulario**
const cedula = ref("");
const nombres = ref("");
const apellidos = ref("");
const correo = ref("");
const area = ref("");

const errorMensaje = ref("");
const cargando = ref(false);

// **Opciones de Áreas**
const opcionesAreas = ref([
  { label: "Derecho Penal", value: "Derecho Penal" },
  { label: "Derecho Civil", value: "Derecho Civil" },
  { label: "Derecho Laboral", value: "Derecho Laboral" },
  { label: "Derecho Constitucional", value: "Derecho Constitucional" },
]);

// **Clases dinámicas para el Dark Mode**
const cardClass = computed(() =>
  isDarkTheme.value ? "bg-gray-800 text-white shadow-lg" : "bg-white text-gray-900 shadow-lg"
);

const inputClass = computed(() =>
  isDarkTheme.value ? "bg-gray-900 text-white border-gray-700 focus:border-blue-500" : "bg-white text-gray-900 border-gray-300 focus:border-blue-500"
);

const buttonClass = computed(() =>
  isDarkTheme.value ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-400 hover:bg-blue-500"
);

// **Función para validar formato de correo**
const validarCorreo = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// **Cargar datos si se edita un estudiante**
const cargarEstudiante = async () => {
  if (!estudianteId) return; // Si no hay ID, es creación
  cargando.value = true;

  try {
    const response = await fetch(`${API}/usuarios/${estudianteId}`);
    if (!response.ok) throw new Error("Error al obtener el estudiante");

    const data: Usuario = await response.json();
    cedula.value = data.Usuario_Cedula;
    nombres.value = data.Usuario_Nombres;
    apellidos.value = data.Usuario_Apellidos;
    correo.value = data.Usuario_Correo;
    area.value = data.Usuario_Area || "";
  } catch (error) {
    console.error("Error al cargar el estudiante:", error);
  } finally {
    cargando.value = false;
  }
};

// **Guardar o actualizar estudiante**
const validarYGuardar = async () => {
  errorMensaje.value = ""; // Limpiar errores

  if (!cedula.value.trim()) {
    errorMensaje.value = "Debe ingresar la cédula del estudiante.";
    return;
  }

  if (!nombres.value.trim()) {
    errorMensaje.value = "Debe ingresar los nombres.";
    return;
  }

  if (!apellidos.value.trim()) {
    errorMensaje.value = "Debe ingresar los apellidos.";
    return;
  }

  if (!correo.value.trim()) {
    errorMensaje.value = "Debe ingresar un correo.";
    return;
  }

  if (!validarCorreo(correo.value.trim())) {
    errorMensaje.value = "El formato del correo es inválido.";
    return;
  }

  cargando.value = true;

  const estudianteData: Usuario = {
    Usuario_Cedula: cedula.value.trim(),
    Usuario_Nombres: nombres.value.trim(),
    Usuario_Apellidos: apellidos.value.trim(),
    Usuario_Correo: correo.value.trim(),
    Usuario_Area: area.value || "", // Puede estar vacío
    Usuario_Activo: true,
    Usuario_Tipo: "Estudiante",
    Usuario_IsDeleted: false,
    Usuario_Huella: undefined,
  };

  try {
    const method = estudianteId ? "PUT" : "POST";
    const endpoint = estudianteId ? `${API}/usuarios/${estudianteId}` : `${API}/usuarios`;

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(estudianteData),
    });

    if (!response.ok) throw new Error("Error al guardar el estudiante");
    console.log("Estudiante guardado correctamente.");

    router.push("/ListadoEstudiantes"); // Redirigir al listado
  } catch (error) {
    console.error("Error guardando el estudiante:", error);
    errorMensaje.value = "Ocurrió un error al guardar.";
  } finally {
    cargando.value = false;
  }
};

// **Cargar datos si es edición**
onMounted(() => {
  if (estudianteId) cargarEstudiante();
});
</script>

<template>
  <main class="flex flex-col items-center p-8 min-h-screen">
    <h1 class="text-3xl font-bold text-center mb-10">
      {{ estudianteId ? "Editar Estudiante" : "Agregar Estudiante" }}
    </h1>

    <div :class="['w-full max-w-3xl p-8 rounded-lg shadow-lg', cardClass]">
      <h2 class="text-xl font-semibold text-center mb-6">Información del Estudiante</h2>

      <Message v-if="errorMensaje" severity="error" class="mb-4">{{ errorMensaje }}</Message>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InputText v-model="cedula" placeholder="Cédula" class="w-full p-3 rounded-lg" :class="inputClass" />
        <InputText v-model="nombres" placeholder="Nombres" class="w-full p-3 rounded-lg" :class="inputClass" />
        <InputText v-model="apellidos" placeholder="Apellidos" class="w-full p-3 rounded-lg" :class="inputClass" />
        <InputText v-model="correo" placeholder="Correo" class="w-full p-3 rounded-lg" :class="inputClass" />
        <Dropdown v-model="area" :options="opcionesAreas" optionLabel="label" optionValue="value" placeholder="Área (Opcional)" class="w-full" />
      </div>

      <div class="flex justify-center mt-8 gap-4">
        <Button :label="estudianteId ? 'Guardar Cambios' : 'Crear Estudiante'" :class="buttonClass" :disabled="cargando" @click="validarYGuardar" />
        <Button label="Cancelar" severity="danger" class="px-6 py-3 rounded-full" @click="router.push('/ListadoEstudiantes')" />
      </div>
    </div>
  </main>
</template>
