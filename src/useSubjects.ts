// components/useSubjects.ts
import { ref, onMounted } from "vue";
import { API } from "@/ApiRoute";

export function useSubjects() {
  const subjects = ref<{ label: string; value: string }[]>([]);
  const loadingSubjects = ref(false);
  const errorSubjects = ref("");

  const fetchSubjects = async () => {
    loadingSubjects.value = true;
    errorSubjects.value = "";
    try {
      const response = await fetch(`${API}/subjects`);
      if (!response.ok) throw new Error("Error al obtener áreas");
      const data = await response.json();
      subjects.value = data
        .filter((s: any) => s.Subject_Status === true)
        .map((s: any) => ({
          label: s.Subject_Name,
          value: s.Subject_Name, // puedes usar Subject_ID si prefieres
        }));
    } catch (error: any) {
      errorSubjects.value = "No se pudieron cargar las áreas";
      console.error(error);
    } finally {
      loadingSubjects.value = false;
    }
  };

  onMounted(() => {
    fetchSubjects();
  });

  return {
    subjects,
    loadingSubjects,
    errorSubjects,
    fetchSubjects, // por si quieres forzar reload
  };
}
