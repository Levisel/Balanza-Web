<template>
  <div class="flex justify-center items-center min-h-screen">
    <Card class="grid content-center w-full sm:w-1/2" style="height: 100%">
      <template #content>
        <h3 class="text-2xl font-semibold mb-4">Notificaciones</h3>
        <div class="flex justify-between mb-4">
          <Button label="Marcar todas como leídas" @click="markAllAsRead" />
          <Button label="Eliminar todas" class="p-button-danger" @click="clearAllNotifications" />
        </div>
        <div class="notificaciones">
          <div
            v-for="notificacion in notificaciones"
            :key="notificacion.id"
            :class="['p-4 mb-4 border rounded-lg cursor-pointer transition duration-300 ease-in-out', notificacion.leida ? 'border-green-300' : 'border-blue-500']"
          >
            <p>{{ notificacion.mensaje }}</p>
            <p class="text-sm">{{ formatDate(notificacion.fecha) }}</p>
            <p class="text-sm">Se te ha asignado el caso {{ notificacion.id }}</p>
            <div class="flex justify-end">
              <Button label="Marcar como leído" @click="toggleLeida(notificacion)" class="p-button-text" />
              <Button label="Eliminar" @click="removeNotification(notificacion.id)" class="p-button-danger p-button-text" />
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
  
<script>
import { computed } from 'vue';
import { useNotificationStore } from '@/stores/notifications';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { useAuthStore } from '@/stores/auth';

export default {
  components: { Card, Button },
  setup() {
    const notificationStore = useNotificationStore();
    const authStore = useAuthStore();

    // Filter notifications for the logged-in user
    const userNotifications = computed(() =>
      notificationStore.notifications.filter(
        (notification) => notification.userId === authStore.user?.id
      )
    );

    // Mark a specific notification as read
    const toggleLeida = (notificacion) => {
      notificationStore.markAsRead(notificacion.id);
    };

    // Remove a specific notification
    const removeNotification = (notificationId) => {
      notificationStore.removeNotification(notificationId);
    };

    // Mark all notifications as read for the logged-in user
    const markAllAsRead = () => {
      if (authStore.user?.id) {
        notificationStore.markAllAsRead(authStore.user.id);
      }
    };

    // Clear all notifications for the logged-in user
    const clearAllNotifications = () => {
      if (authStore.user?.id) {
        notificationStore.clearAllNotifications(authStore.user.id);
      }
    };

    // Format the date for display
    const formatDate = (isoDate) => {
      const date = new Date(isoDate);
      return date.toLocaleString('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    };

    return {
      notificaciones: userNotifications,
      toggleLeida,
      removeNotification,
      markAllAsRead,
      clearAllNotifications,
      formatDate,
    };
  },
};
</script>