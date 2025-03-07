<script setup lang="ts">
import { ref, computed } from "vue";
import { Form } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { useToast } from "primevue/usetoast";
import { z } from "zod";
import { API } from "@/ApiRoute";

import InputOtp from "primevue/inputotp";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import router from "@/router";
import axios from "axios";

const step = ref(1);

const loading = ref(false);
const email = ref<string>("");
const code = ref<string>("");
const newPassword = ref<string>("");
const toast = useToast();
const codeResent = ref<number>(0);

const isEmailDisabled = computed(() => !email.value);
const isCodeDisabled = computed(() => !code.value);
const isNewPasswordDisabled = computed(() => !newPassword.value);

const instructionMessage = computed(() => {
  if (loading.value) return "⏳ Cargando...\nPor favor, espera un momento.";

  switch (step.value) {
    case 1:
      return "🔐 Porfavor, ingresa tu correo para recuperar el acceso a tu cuenta.";

    case 2:
      return (
        "📧 Hemos enviado un código de verificación a tu correo.\n\n" +
        "*Recuerda que expira en 15 minutos.* ⏳"
      );

    case 3:
      return (
        "🔑 *Establece una nueva contraseña*\n\n" +
        "Por seguridad, usa una contraseña fuerte:\n"
      );

    case 4:
      return "Felicidades, tu contraseña ha sido actualizada correctamente. 🎉";
    default:
      return "🔐 Porfavor, ingresa tu correo para recuperar el acceso a tu cuenta.";
  }
});

const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo es obligatorio." })
    .email({ message: "Correo no válido." }),
});
const codeSchema = z.object({
  code: z.string().min(1, { message: "El código es obligatorio." }),
});
const resetSchema = z.object({
  newPassword: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

const emailResolver = zodResolver(emailSchema);
const codeResolver = zodResolver(codeSchema);
const resetResolver = zodResolver(resetSchema);
const isClearing = ref(false);

const clearCode = () => {
  isClearing.value = true; 
  setTimeout(() => {
    code.value = "";
    isClearing.value = false; 
  }, 500);
};

async function submitEmail() {
  loading.value = true;
  try {
    await axios.post(`${API}/forgot-password`, { email: email.value });
    toast.add({
      severity: "success",
      summary: "Correo enviado",
      detail: "Revisa tu correo para ver el código de verificación.",
      life: 8000,
    });
    step.value = 2;
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Se produjo un problema",
      detail:
        "Lo sentimos. No hemos podido identificar tu cuenta, asegurate que la información ingresada es correcta.",
      life: 15000,
    });
  } finally {
    loading.value = false;
  }
}

async function resendEmail() {
  if (codeResent.value < 2) {
    codeResent.value++;
    await submitEmail();
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail:
        "Has alcanzado el límite de reenvíos de código. Porfavor, intenta más tarde..",
      life: 15000,
    });
  }
}

async function submitCode() {
  loading.value = false;
  try {
    await axios.post(`${API}/verify-code`, {
      email: email.value,
      code: code.value,
    });
    toast.add({
      severity: "success",
      summary: "Código verificado",
      detail: "Ingresa tu nueva contraseña.",
      life: 8000,
    });
    step.value = 3;
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Código no válido o expirado. Porfavor, intenta nuevamente..",
      life: 15000,
    });
    clearCode();
  } finally {
    loading.value = false;
  }
}

async function submitResetPassword() {
  loading.value = false;
  try {
    await axios.post(`${API}/reset-password`, {
      email: email.value,
      code: code.value,
      newPassword: newPassword.value,
    });
    step.value = 4;
    toast.add({
      severity: "info",
      summary: "Contraseña actualizada",
      detail: "¡Tu contraseña ha sido actualizada correctamente!",
      life: 8000,
    });
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail:
        "Error al actualizar la contraseña. Porfavor, intenta nuevamente..",
      life: 15000,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div id="background" class="select-none"></div>
  <Toast />
  <div class="select-none flex flex-col items-center justify-center">
    <div class="mb-5 mt-10 flex flex-col items-center">
      <img
        draggable="false"
        src="/src/components/icons/cjpuce.png"
        class="h-25 mb-4"
      />
    </div>
    <div
      class="select-none w-full lg:w-[500px] bg-white rounded shadow-sm lg:p-[80px]"
    >
      <div class="mb-12 -mt-7">
        <h2
          id="initialText"
          class="select-none text-3xl font-medium text-center"
        >
          {{ step === 4 ? "¡Contraseña actualizada!" : "Recuperar Contraseña" }}
        </h2>
        <p
          class="w-full lg:w-[350px] text-center text-gray-500 text-lg mt-5 whitespace-pre-line"
        >
          {{ instructionMessage }}
        </p>
      </div>
      <div v-if="loading" class="flex justify-center">
        <ProgressSpinner
          style="width: 50px; height: 50px"
          strokeWidth="8"
          fill="transparent"
          animationDuration=".5s"
        />
      </div>
      <Form
        v-if="step === 1 && !loading"
        :resolver="emailResolver"
        @submit="submitEmail"
        class="flex flex-col gap-11"
      >
        <FloatLabel>
          <InputText
            id="email"
            type="email"
            class="w-full"
            v-model="email"
            size="large"
          />
          <label for="email">Correo Electrónico</label>
        </FloatLabel>
        <div class="grid grid-cols-2 gap-4 mt-1">
          <Button
            @click="router.push('/login')"
            label="Cancelar"
            severity="contrast"
          />
          <Button
            type="submit"
            label="Enviar"
            severity="info"
            :disabled="isEmailDisabled"
          />
        </div>
      </Form>

      <Form
        v-if="step === 2"
        :resolver="codeResolver"
        @submit="submitCode"
        class="flex flex-col items-center gap-8"
      >
        <div class="w-full flex flex-col items-center">
          <label for="code" class="text-gray-500 text-sm self-start mb-2">
            Código de Verificación
          </label>
          <InputOtp
            id="code"
            v-model="code"
            :length="6"
            :class="{ 'opacity-0 translate-x-10 scale-110': isClearing }"
            class="mb-2 text-center transition-all duration-500 ease-in-out transform"
          />
        </div>

        <div class="grid grid-cols-2 gap-4 w-full">
          <Button
            @click="router.push('/login')"
            label="Cancelar"
            severity="contrast"
          />
          <Button
            type="submit"
            label="Verificar Código"
            severity="info"
            :disabled="isCodeDisabled"
          />
        </div>

        <div class="text-center text-gray-500 text-sm mt-4">
          ¿No recibiste el código?
          <a
            @click="resendEmail"
            class="text-cyan-500 hover:text-cyan-700 cursor-pointer"
          >
            Reenviar código
          </a>
        </div>
      </Form>

      <Form
        v-if="step === 3"
        :resolver="resetResolver"
        @submit="submitResetPassword"
        class="flex flex-col gap-11"
      >
        <div class="w-full flex flex-col items-center">
          <FloatLabel>
            <Password v-model="newPassword" size="large" toggleMask>
              <template #header>
                <div class="font-semibold text-xm mb-4">
                  Escribe tu contraseña
                </div>
              </template>
              <template #footer>
                <Divider />
                <ul class="pl-2 my-0 leading-normal">
                  <li>Al menos una minúscula</li>
                  <li>Al menos una mayúscula</li>
                  <li>Al menos un número</li>
                  <li>Mínimo 8 caracteres</li>
                </ul>
              </template>
            </Password>
            <label for="newPassword">Nueva Contraseña</label>
          </FloatLabel>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-1">
          <Button
            @click="router.push('/login')"
            label="Cancelar"
            severity="contrast"
          />
          <Button
            type="submit"
            label="Guardar"
            icon="pi pi-check-circle"
            iconPos="right"
            severity="success"
            :disabled="isNewPasswordDisabled"
          />
        </div>
      </Form>

      <div v-if="step === 4" class="flex flex-col items-center gap-4">
        <Button
          @click="router.push('/login')"
          label="Volver al inicio"
          severity="success"
        />
      </div>
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
.custom-otp-input {
  width: 40px;
  font-size: 36px;
  border: 0 none;
  appearance: none;
  text-align: center;
  transition: all 0.2s;
  background: transparent;
  border-bottom: 2px solid var(--p-inputtext-border-color);
}

.custom-otp-input:focus {
  outline: 0 none;
  border-bottom-color: var(--p-primary-color);
}
</style>
