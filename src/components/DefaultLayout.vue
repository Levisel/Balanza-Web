<script setup lang="ts">
import SideBar from "@/components/SideBar.vue"; 
</script>

<template>
    <div>
      <!-- Sidebar fijo -->
      <SideBar />
      <!-- Contenedor principal con separación a la izquierda igual a la anchura del sidebar -->
      <div class="pl-85">
        <slot />
      </div>
    </div>
  </template>
  

  