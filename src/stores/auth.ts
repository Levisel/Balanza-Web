import router from "@/router";
import { defineStore } from "pinia";
import { API } from "@/ApiRoute";
import { APP_VIEWS, type ViewPermission } from '@/config/views'; // Asegúrate que la ruta a views.ts sea correcta
import axios from "axios";

interface User {
  id: string; // Cédula del usuario (Internal_ID)
  name: string;
  email: string;
  type: string; // Nombre del rol (Internal_Type), ej: "Administrador"
  profile: number | null; // Profile_ID NUMÉRICO del rol, puede ser null
  area: string;
  phone: string;
  status: string;
  picture: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    viewPermissions: {} as Record<string, boolean>, 
  }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
    userProfilePicture: (state) => state.user?.picture || '/src/components/icons/default-user.png',
    getUser: (state) => state.user,
    canView: (state) => (viewKey: string) => {
      //Si el usuario no está definido o no tiene tipo, no tiene acceso a las vistas
      if (!state.user || !state.user.type) {
        return false;
      }
      if (state.user.type === "Administrador") { // El rol "Administrador" siempre tiene acceso
        return true;
      }
      return !!state.viewPermissions[viewKey];
    },
  },
  actions: {
    async verifySession() {
      try {
        const response = await axios.get(`${API}/api/me`);
        this.user = response.data as User;
        if (this.user) {
          await this.loadPermissionsForCurrentUser();
        } else {
          this.clearPermissions();
        }
      } catch (error) {
        this.user = null;
        this.clearPermissions();
      }
    },

    async loadPermissionsForCurrentUser() {
      if (!this.user) {
        this.clearPermissions();
        return;
      }

      if (this.user.type === "Administrador") {
        const adminPermissions: Record<string, boolean> = {};
        APP_VIEWS.forEach(view => adminPermissions[view.key] = true);
        this.viewPermissions = adminPermissions;
      } else if (this.user.profile !== null && this.user.profile !== undefined) { // Usar this.user.profile (numérico)
        await this.fetchViewPermissions(this.user.profile);
      } else {
        console.warn(`Usuario ${this.user.name} (Rol: ${this.user.type}) no es Administrador y no tiene un profile ID numérico válido. No se cargaron permisos específicos.`);
        this.clearPermissions();
      }
    },

    async fetchViewPermissions(profileId: number) { // profileId es el Profile_ID numérico del rol
      try {
        // Llama al endpoint del backend que devuelve [{ View_Name: string, Has_Permission: boolean }]
        const response = await axios.get(`${API}/profile/auth/${profileId}`);
        const permissionsFromApi = response.data as Array<{ View_Name: string, Has_Permission: boolean }>;

        const newPermissions: Record<string, boolean> = {};
        // Inicializar todos los permisos definidos en APP_VIEWS a false
        APP_VIEWS.forEach(appView => {
            newPermissions[appView.key] = false;
        });

        // Actualizar con los permisos recibidos de la API
        permissionsFromApi.forEach(perm => {
            // Solo procesar si View_Name de la API existe como 'key' en APP_VIEWS
            if (newPermissions.hasOwnProperty(perm.View_Name)) {
                newPermissions[perm.View_Name] = perm.Has_Permission;
            } else {
                console.warn(`Permiso recibido del backend para una vista desconocida en el frontend: '${perm.View_Name}'. Esta vista no está en APP_VIEWS.`);
            }
        });
        this.viewPermissions = newPermissions;

      } catch (error) {
        console.error(`Error fetching view permissions for profile ID ${profileId}:`, error);
        this.clearPermissions(); // Fallback a no tener permisos si hay error
      }
    },

    clearPermissions() {
      const defaultPermissions: Record<string, boolean> = {};
      APP_VIEWS.forEach(view => defaultPermissions[view.key] = false);
      this.viewPermissions = defaultPermissions;
    },

    async logout() {
      try {
        await axios.post(`${API}/logout`);
      } catch (error) {
        console.error("Error during logout API call:", error);
      } finally {
        this.user = null;
        this.clearPermissions();
        router.push({ name: "Login" }); 
      }
    },

    async updateProfilePictureUrl(newUrl: string) {
      if (this.user) {
        this.user.picture = newUrl;
      }
    },

    setUser(userData: User | null) { // Llamado después de un login exitoso o al restaurar sesión
        this.user = userData; // userData debe incluir el 'profile' numérico
        if (userData) {
            this.loadPermissionsForCurrentUser();
        } else {
            this.clearPermissions();
        }
    }
  },
});