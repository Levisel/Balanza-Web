// components/useSubjects.ts
import { computed, ref, onMounted } from "vue";
import { API } from "@/ApiRoute";

export function useSubjects() {
  // Variables locales para cada instancia
  const subjectsCache = ref<{ label: string; value: string; nrc: string }[]>([]);
  const subjectsLoaded = ref(false);
  const loadingSubjects = ref(false);
  const errorSubjects = ref("");

  // Esta función se encargará de hacer la petición solo si aún no se han cargado los datos.
  async function fetchSubjects() {
    if (subjectsLoaded.value) return;
    loadingSubjects.value = true;
    errorSubjects.value = "";
    try {
      const response = await fetch(`${API}/subjects`, {
        credentials: 'include', // 🔥 agregado aquí
      });
      if (!response.ok) throw new Error("Error al obtener áreas");
      const data = await response.json();
      // Filtramos y mapeamos solo las áreas activas
      subjectsCache.value = data
        .filter((s: any) => s.Subject_Status === true)
        .map((s: any) => ({
          label: s.Subject_Name, // nombre de la asignatura/área (ej: "CDH")
          value: s.Subject_NRC,   // usamos el NRC, ya que es único
          nrc: s.Subject_NRC,     // lo dejamos para crear el mapeo
        }));
      subjectsLoaded.value = true;
    } catch (error: any) {
      errorSubjects.value = "No se pudieron cargar las áreas";
      console.error(error);
    } finally {
      loadingSubjects.value = false;
    }
  }

  // Al montarse el componente que use este composable, disparamos fetchSubjects
  onMounted(() => {
    fetchSubjects();
  });

  return {
    subjects: subjectsCache,
    loadingSubjects,
    errorSubjects,
    fetchSubjects,
    // Mapeo derivado de subjectsCache: cada NRC → Subject_Name
    nrcAreaMap: computed(() => {
      const map: Record<string, string> = {};
      subjectsCache.value.forEach((s) => {
        map[s.nrc] = s.label;
      });
      return map;
    }),
  };
}
