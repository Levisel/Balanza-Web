import { defineStore } from 'pinia';

interface Notification {
  id: number;
  mensaje: string;
  fecha: string;
  leida: boolean;
  userId: string;
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
  }),
  actions: {
    // Add a new notification
    addNotification(notification: Notification) {
      this.notifications.push(notification);
    },

    // Mark a specific notification as read
    markAsRead(notificationId: number) {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) notification.leida = true;
    },

    // Remove a specific notification
    removeNotification(notificationId: number) {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
    },

    // Mark all notifications for a specific user as read
    markAllAsRead(userId: string) {
      this.notifications.forEach(notification => {
        if (notification.userId === userId) {
          notification.leida = true;
        }
      });
    },

    // Clear all notifications for a specific user
    clearAllNotifications(userId: string) {
      this.notifications = this.notifications.filter(notification => notification.userId !== userId);
    },
  },
});