<template>
  <div class="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto mt-8">
    <h3 class="text-2xl font-semibold mb-4">Notificaciones</h3>
    <div class="notificaciones">
      <div
        v-for="notificacion in notificaciones"
        :key="notificacion.id"
        :class="['p-4 mb-4 border rounded-lg cursor-pointer transition duration-300 ease-in-out', notificacion.leida ? 'bg-gray-100 border-gray-300' : 'bg-white border-blue-500']"
        @click="toggleLeida(notificacion)"
      >
        <p :class="notificacion.leida ? 'text-gray-500' : 'text-gray-700'">{{ notificacion.mensaje }}</p>
        <p class="text-gray-500 text-sm">{{ notificacion.fecha }}</p>
        <p class="text-gray-600 text-sm">Se te ha asignado el caso {{ notificacion.id }}</p>
      </div>
    </div>
  </div>
</template>

<script>
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