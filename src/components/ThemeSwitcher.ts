import { computed, reactive, watchEffect } from "vue";

interface LayoutConfig {
  preset: string;
  primary: string;
  surface: string | null;
  darkTheme: boolean;
  menuMode: string;
}

const LOCAL_STORAGE_KEY = 'darkModeEnabled';


const initialDarkMode = localStorage.getItem(LOCAL_STORAGE_KEY);

const layoutConfig: LayoutConfig = reactive({
  preset: "Aura",
  primary: "emerald",
  surface: null,
  darkTheme: initialDarkMode ? JSON.parse(initialDarkMode) : false,
  menuMode: "static",
});

export function useDarkMode() {
  const toggleDarkMode = (): void => {
    if (!document.startViewTransition) {
      executeDarkModeToggle();
      return;
    }

    document.startViewTransition(() => executeDarkModeToggle());
  };

  const executeDarkModeToggle = (): void => {
    layoutConfig.darkTheme = !layoutConfig.darkTheme;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layoutConfig.darkTheme));
    document.documentElement.classList.toggle(
      "app-dark",
      layoutConfig.darkTheme
    );
  };

  watchEffect(() => {
      document.documentElement.classList.toggle(
          "app-dark",
          layoutConfig.darkTheme
      );
  });


  const isDarkTheme = computed<boolean>(() => layoutConfig.darkTheme);

  return {
    isDarkTheme,
    toggleDarkMode,
  };
}