<template>
    <main class="p-6 max-w-6xl mx-auto min-h-screen">
                <h1 :class="['text-3xl font-bold mb-6', isDarkTheme ? 'text-white' : 'text-gray-800']">
        Mi Horario Asignado
        </h1>

  
      <div v-if="loading" class="text-center text-lg text-gray-500 dark:text-gray-300">
        Cargando horario...
      </div>
  
      <CuadriculaHorario
        v-else-if="schedules.length"
        :schedules="schedules"
      />
  
      <div v-else class="text-center text-lg text-gray-400 mt-8">
        No tienes horarios asignados en este momento.
      </div>
    </main>
  </template>
  
  <script setup lang="ts">
  import { onMounted, ref } from "vue";
  import { API } from "@/ApiRoute";
  import { useAuthStore } from "@/stores/auth";
  import CuadriculaHorario from "@/components/CuadriculaHorario.vue";
  import { useDarkMode } from "@/components/ThemeSwitcher";
  import axios from "axios";
  const { isDarkTheme } = useDarkMode();
  

  const authStore = useAuthStore();
  const user = authStore.user;
  
  const schedules = ref<any[]>([]);
  const loading = ref(true);
  
  const fetchHorarioEstudiante = async () => {
  try {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }
    const res = await axios.get(`${API}/horarioEstudiantes/porEstudiante/${user.id}`);
    schedules.value = res.data;
  } catch (error) {
    console.error("❌ Error al cargar horario:", error);
  } finally {
    loading.value = false;
  }
};
  
  onMounted(() => {
    fetchHorarioEstudiante();
  });
  </script>
  
  <style scoped>
  /* Personaliza si lo deseas */
  </style>
  