<template>


<div class="flex justify-center items-center min-h-screen">
  <Card class="grid content-center w-full sm:w-1/2" style="height: 100%">
    <template #content>
          <h3 class="text-2xl font-semibold mb-4">Notificaciones</h3>
      <div class="notificaciones">
        <div
          v-for="notificacion in notificaciones"
          :key="notificacion.id"
          :class="['p-4 mb-4 border rounded-lg cursor-pointer transition duration-300 ease-in-out', notificacion.leida ? 'border-green-300' : 'border-blue-500']"
          @click="toggleLeida(notificacion)"
        >
          <p>{{ notificacion.mensaje }}</p>
          <p class="text-sm">{{ notificacion.fecha }}</p>
          <p class="text-sm">Se te ha asignado el caso {{ notificacion.id }}</p>
        </div>
      </div>
        </template>
  </Card>
</div>


  </template>
  
  <script>

  import Card from 'primevue/card';
  export default {
    data() {
      return {
        notificaciones: [
          { id: 1, mensaje: 'Notificación 1', fecha: '2025-02-17', leida: false },
          { id: 2, mensaje: 'Notificación 2', fecha: '2025-02-20', leida: false },
          { id: 3, mensaje: 'Notificación 3', fecha: '2025-02-23', leida: false },
          { id: 4, mensaje: 'Notificación 4', fecha: '2025-02-28', leida: false },
          { id: 5, mensaje: 'Notificación 5', fecha: '2025-03-10', leida: false },
          { id: 6, mensaje: 'Notificación 6', fecha: '2025-03-15', leida: false },
        ]
      };
    },
    methods: {
      toggleLeida(notificacion) {
        notificacion.leida = !notificacion.leida;
      }
    }
  }
  </script>
  
  <style scoped>
  
  </style>