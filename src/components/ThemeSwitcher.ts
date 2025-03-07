import { computed, reactive } from "vue";

interface LayoutConfig {
  preset: string;
  primary: string;
  surface: string | null;
  darkTheme: boolean;
  menuMode: string;
}

const layoutConfig: LayoutConfig = reactive({
  preset: "Aura",
  primary: "emerald",
  surface: null,
  darkTheme: false,
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
    document.documentElement.classList.toggle(
      "app-dark",
      layoutConfig.darkTheme
    );
  };

  const isDarkTheme = computed<boolean>(() => layoutConfig.darkTheme);

  return {
    isDarkTheme,
    toggleDarkMode,
  };
}
