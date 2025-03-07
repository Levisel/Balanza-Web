<script setup lang="ts">

</script>

<template>
    <div class="flex justify-end mb-6">
      <router-link to="/nuevoCasoTrabajoSocial" custom v-slot="{ navigate }">
        <button 
          @click="navigate" 
          class="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nuevo Caso
        </button>
      </router-link>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'BotonNuevoCaso'
  });
  </script>

<style scoped>

</style>