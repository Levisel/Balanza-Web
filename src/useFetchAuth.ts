// src/composables/useFetchAuth.ts
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    try {
      const finalOptions: RequestInit = {
        ...options,
        credentials: "include", // 🔥 Siempre incluir cookies (access_token)
      };
      const response = await fetch(url, finalOptions);
  
      // Opcionalmente, puedes lanzar un error si no fue ok
      if (!response.ok) {
        const errorBody = await response.text(); // Puedes parsear como JSON si sabes que la API siempre responde JSON
        throw new Error(errorBody || `HTTP error ${response.status}`);
      }
  
      return response;
    } catch (error) {
      console.error("Error en fetchWithAuth:", error);
      throw error;
    }
  };
  