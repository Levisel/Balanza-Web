<script setup lang="ts">
import SideBar from "@/components/SideBar.vue"; 
</script>

<template>
    <div>
      <SideBar />
      <div class="pl-85">
        <slot />
        <router-view />
      </div>
    </div>
  </template>