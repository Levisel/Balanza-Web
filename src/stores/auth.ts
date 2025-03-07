// src/stores/auth.ts
import router from "@/router";
import { defineStore } from "pinia";
import { API } from "@/ApiRoute";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  type: string;
  area: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
  }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
  },
  actions: {
    async verifySession() {
      try {
        const response = await axios.get(`${API}/api/me`);
        //  el endpoint /api/me retorna el objeto con { id, email, name, type }
        this.user = response.data;
      } catch (error) {
        this.user = null;
      }
    },
    async logout() {
      this.user = null;
      const response = await axios.post(`${API}/logout`);
      if (response.status === 200) router.push({ name: "Login" });
    },
  },
});
