<script setup lang="ts">
import { computed, ref } from "vue";
import FloatLabel from "primevue/floatlabel";
import { Form } from "@primevue/forms";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import { z } from "zod";
import axios from "axios";
import { API } from "@/ApiRoute";
import type {Internal_User } from "@/ApiRoute";
import router from "@/router";

const toast = useToast();

const email = ref<string>("");
const password = ref<string>("");
const isLoginDisabled = computed(() => !email.value || !password.value);

const resolver = ref(
  zodResolver(
    z.object({
      username: z.string().min(1, { message: "Username is required." }),
      email: z
        .string()
        .min(1, { message: "Email is required." })
        .email({ message: "Invalid email address." }),
    })
  )
);

const onFormSubmit = async ({ valid }: { valid: boolean }) => {
  // Si el formulario no es válido, mostramos un error y salimos.
  if (!valid) {
    toast.add({
      severity: "error",
      summary: "Campos incompletos",
      detail: "Por favor completa los campos requeridos.",
      life: 3000,
    });
    return;
  }

  try {
    // Llamada al endpoint de login
    const response = await axios.post<Internal_User>(`${API}/login`, {
      Internal_Email: email.value,
      Internal_Password: password.value,
    });

    // Suponiendo que la API retorna un objeto con datos del usuario o un indicador de éxito.
    if (!response.data) {
      toast.add({
        severity: "warn",
        summary: "Datos incorrectos",
        detail: "El correo o la contraseña no coinciden.",
        life: 3000,
      });
    } else {
      router.push("/"); // Redirigimos al usuario a la página principal si toodo salió bien.
    }
  } catch (error: any) {
    // Manejo de errores de Axios
    if (error.response) {
      // Error con respuesta del servidor
      if (error.response.status === 400 || error.response.status === 401) {
        toast.add({
          severity: "error",
          summary: "Credenciales inválidas",
          detail: "El correo o la contraseña son incorrectos.",
          life: 3000,
        });
      } else {
        // Otro error del servidor
        toast.add({
          severity: "error",
          summary: "Error de servidor",
          detail: "Ha ocurrido un error inesperado. Intenta más tarde.",
          life: 3000,
        });
      }
    } else {
      // Error sin respuesta del servidor (red, timeout, etc.)
      toast.add({
        severity: "error",
        summary: "Error de conexión",
        detail: "No se pudo conectar con el servidor.",
        life: 3000,
      });
    }
  }
};
</script>

<template>
  <!-- Contenedor principal centrado vertical y horizontal -->
  <div id="background" class="select-none"></div>
  <div class="select-none flex flex-col items-center justify-center">
    <!-- Logo y Título superior -->
    <div class="mb-5 mt-10 flex flex-col items-center">
      <img
        draggable="false"
        src="/src/components/icons/cjpuce.png"
        class="h-25 mb-4"
      />
    </div>

    <!-- Tarjeta de Login más grande y centrada -->
    <div
      class="select-none w-full lg:w-[500px] bg-white rounded shadow-sm lg:p-[80px]"
    >
      <!-- Título de la tarjeta -->
      <div class="mb-12 -mt-7">
        <h2 class="text-3xl font-medium text-center">Ingresar</h2>
      </div>

      <!-- Formulario -->
      <Form
        :resolver="resolver"
        @submit="onFormSubmit"
        class="flex flex-col gap-11 w-full"
      >
        <FloatLabel name="email">
          <InputText
            id="email"
            type="email"
            size="large"
            class="w-full"
            v-model="email"
          />
          <label for="email">Correo Electrónico</label>
        </FloatLabel>
        <FloatLabel>
          <Password
            id="password"
            type="text"
            :feedback="false"
            toggleMask
            fluid
            size="large"
            v-model="password"
          />
          <label for="password">Contraseña</label>
        </FloatLabel>
        <div class="-mt-6">
          <router-link to="/login/forgot-password" draggable="false" v-ripple>
            <span class="font-medium text-sm text-blue-800 hover:text-blue-400"
              >¿Haz olvidado tu contraseña?</span
            >
          </router-link>
        </div>
        <Toast />
        <Button
          type="submit"
          class="mt-3"
          severity="primary"
          label="Iniciar Sesión"
          :disabled="isLoginDisabled"
        />
      </Form>

      <!-- Botón de Iniciar sesión -->
    </div>
  </div>
</template>

<style scoped>
#background {
  background-image: url("/src/components/icons/puce.jpg");
  background-size: cover;
  background-position: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  filter: blur(8px);
}
</style>
