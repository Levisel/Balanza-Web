<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { API } from "@/ApiRoute";
import type { Internal_User } from "@/ApiRoute";
import { useAuthStore } from "@/stores/auth";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import ProgressSpinner from "primevue/progressspinner";
import { useToast } from "primevue/usetoast";
import Avatar from "primevue/avatar";
import FileUpload, { type FileUploadSelectEvent } from "primevue/fileupload";
import FloatLabel from "primevue/floatlabel";

const toast = useToast();
const authStore = useAuthStore();
const currentUserId = authStore.user?.id;
const userInfo = ref<Internal_User | null>(null);
const loading = ref(false);

// Cambio de contraseña
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const changePasswordLoading = ref(false);

// Carga de imagen
const fileInputRef = ref<InstanceType<typeof FileUpload> | null>(null);
const selectedFile = ref<File | null>(null);

const uploadLoading = ref(false);
// key reactiva para resetear FileUpload
const fileUploadKey = ref(0);

const userAvatar = computed(() => {
  return authStore.userProfilePicture;
});

const fetchUserInfo = async () => {
  if (!currentUserId) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo identificar al usuario.",
      life: 4000,
    });
    return;
  }
  loading.value = true;
  try {
    const { data } = await axios.get(`${API}/internal-user/${currentUserId}`);
    userInfo.value = data;
    if (data.Internal_Picture && authStore.user) {
      authStore.user.picture = data.Internal_Picture;
    }
  } catch {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo cargar la información del usuario",
      life: 4000,
    });
  } finally {
    loading.value = false;
  }
};

const submitChangePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "Las contraseñas no coinciden",
      life: 4000,
    });
    return;
  }
  if (!userInfo.value?.Internal_Email) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo obtener el email del usuario.",
      life: 4000,
    });
    return;
  }

  changePasswordLoading.value = true;
  try {
    await axios.post(
      `${API}/change-password`,
      {
        email: userInfo.value.Internal_Email,
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      },
      { withCredentials: true }
    );
    toast.add({
      severity: "info",
      summary: "Éxito",
      detail: "Contraseña cambiada correctamente",
      life: 4000,
    });
    currentPassword.value = newPassword.value = confirmPassword.value = "";
  } catch (error: any) {
    const msg =
      error.response?.data?.message ||
      "No se pudo cambiar la contraseña, verifica que tu contraseña actual sea correcta.";
    toast.add({ severity: "error", summary: "Error", detail: msg, life: 4000 });
  } finally {
    changePasswordLoading.value = false;
  }
};

const onFileSelect = (event: FileUploadSelectEvent) => {
  const file = event.files[0];
  const max = 1 * 1024 * 1024;
  if (file && file.size > max) {
    toast.add({
      severity: "warn",
      summary: "Atención",
      detail: "La imagen excede el tamaño máximo de 1MB.",
      life: 5000,
    });
    selectedFile.value = null;
    fileUploadKey.value++;
    return;
  }
  selectedFile.value = file || null;
};

const onFileClear = () => {
  selectedFile.value = null;
  fileUploadKey.value++;
};

const uploadProfilePicture = async () => {
  if (!selectedFile.value) {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "Por favor, selecciona un archivo de imagen.",
      life: 3000,
    });
    return;
  }
  uploadLoading.value = true;
  const form = new FormData();
  form.append("profilePic", selectedFile.value);

  try {
    const { data } = await axios.put<{ Picture: string }>(
      `${API}/internal-users/profile-picture`,
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "internal-id": authStore.user?.id,
        },
        withCredentials: true,
      }
    );
    await authStore.updateProfilePictureUrl(data.Picture);
    await fetchUserInfo();
    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: "Foto de perfil actualizada.",
      life: 3000,
    });
    selectedFile.value = null;
    fileUploadKey.value++;
  } catch (error: any) {
    toast.add({ severity: "error", summary: "Error", detail: "Error al subir la imagen. Porfavor, inténtalo de nuevo..", life: 5000 });
  } finally {
    uploadLoading.value = false;
  }
};

onMounted(fetchUserInfo);
</script>

<template>
  <Toast />
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Configuración</h1>

    <!-- Sección: Información del perfil -->
    <div class="card shadow rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <i class="pi pi-user text-xl"></i>
        Información del perfil
      </h2>
      <div v-if="loading" class="flex justify-center">
        <ProgressSpinner
          strokeWidth="8"
          fill="transparent"
          animationDuration=".5s"
          aria-label="Cargando"
        />
      </div>
      <div v-else-if="userInfo" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block font-medium mb-1">Cédula</label>
          <InputText
            v-model="userInfo.Internal_ID"
            size="large"
            class="w-full"
            readonly
          />
        </div>
        <div>
          <label class="block font-medium mb-1">Tipo</label>
          <InputText
            v-model="userInfo.Internal_Type"
            size="large"
            class="w-full"
            readonly
          />
        </div>
        <div>
          <label class="block font-medium mb-1">Nombre</label>
          <InputText
            v-model="userInfo.Internal_Name"
            size="large"
            class="w-full"
            readonly
          />
        </div>
        <div>
          <label class="block font-medium mb-1">Apellido</label>
          <InputText
            v-model="userInfo.Internal_LastName"
            size="large"
            class="w-full"
            readonly
          />
        </div>
        <div>
          <label class="block font-medium mb-1">Correo electrónico</label>
          <InputText
            v-model="userInfo.Internal_Email"
            size="large"
            class="w-full"
            readonly
          />
        </div>
        <div>
          <label class="block font-medium mb-1">Área</label>
          <InputText
            v-model="userInfo.Internal_Area"
            size="large"
            class="w-full"
            readonly
          />
        </div>

        <div>
          <label class="block font-medium mb-1">Teléfono</label>
          <InputText
            v-model="userInfo.Internal_Phone"
            size="large"
            class="w-full"
            readonly
          />
        </div>
        <div>
          <label class="block font-medium mb-1">Estado</label>
          <InputText
            v-model="userInfo.Internal_Status"
            size="large"
            class="w-full"
            readonly
          />
        </div>
      </div>
    </div>

    <!-- Sección: Cambio de foto de perfil -->
    <div class="card shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <i class="pi pi-image text-xl"></i>Cambiar foto de perfil
      </h2>

      <div class="grid grid-flow-col grid-rows-3">
        <!-- Avatar: igual -->
        <div class="row-start-1 row-end-4 flex justify-center items-center"> <!-- Added flex centering -->
          <Avatar
            :image="userAvatar"
            shape="circle"
            class="custom-size  mb-10 mt-5 ml-8"
            :class="{ 'opacity-50': uploadLoading }"
          >
            <!-- Slot for loading indicator -->
            <template v-if="uploadLoading">
              <ProgressSpinner
                style="width: 50px; height: 50px"
                strokeWidth="8"
                fill="transparent"
                animationDuration=".5s"
                aria-label="Subiendo imagen"
              />
            </template>
          </Avatar>
        </div>

        <!-- FileUpload: sólo fila 2 -->
        <div class="row-start-2 row-end-3 mr-18">
          <FileUpload
            :key="fileUploadKey"
            ref="fileInputRef"
            mode="basic"
            accept="image/*"
            :showMessage="false"
            invalidFileSizeMessageSummary=""
            invalidFileSizeMessageDetail=""
            chooseLabel="Elegir Foto"
            chooseIcon="pi pi-images"
            :auto="false"
            customUpload
            @select="onFileSelect"
            @clear="onFileClear"
            :disabled="uploadLoading"
            class="p-button-md p-button-raised p-button-secondary"
          />
        </div>

        <!-- Botón Guardar: fila 2, igual que antes -->
        <div class="row-start-2 row-end-3 -mt-1.5">
          <Button
            label="Guardar Foto"
            icon="pi pi-cloud-upload"
            raised
            :loading="uploadLoading"
            :disabled="!selectedFile || uploadLoading"
            @click="uploadProfilePicture"
            class="p-button-md p-button-contrast mt-2"
          />
        </div>

        <!-- Nombre del archivo: fila 3, centrado -->

        <div
          class="row-start-3 row-end-4 col-start-2 justify-self-center mt-1 -ml-16"
        >
          <transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 transform -translate-y-2"
            enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition ease-in duration-300"
            leave-from-class="opacity-100 transform translate-y-0"
            leave-to-class="opacity-0 transform -translate-y-2"
          >
            <div v-if="selectedFile">
              <span class="text-md font-semibold">Archivo: </span>
              <span class="text-md">
                {{
                  selectedFile.name.length > 8
                    ? selectedFile.name.substring(0, 8) +
                      "…" +
                      selectedFile.name.slice(-3)
                    : selectedFile.name
                }}
              </span>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Sección: Cambio de contraseña -->
    <div class="card shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <i class="pi pi-lock text-xl"></i>
        Cambiar contraseña
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FloatLabel variant="on" class="w-full md:w-80">
            <Password
              id="password"
              type="text"
              :feedback="false"
              toggleMask
              fluid
              size="large"
              v-model="currentPassword"
              class="w-full"
            />
            <label for="password"
              ><span class="text-red-500">*</span>Contraseña actual</label
            >
          </FloatLabel>
        </div>
        <div>
          <FloatLabel variant="on" class="w-full md:w-80">
            <Password
              id="password"
              type="text"
              :feedback="false"
              toggleMask
              fluid
              size="large"
              v-model="newPassword"
              class="w-full"
            />
            <label for="password"
              ><span class="text-red-500">*</span>Nueva contraseña</label
            >
          </FloatLabel>

          <FloatLabel variant="on" class="w-full md:w-80 mt-6 mb-6">
            <Password
              id="password"
              type="text"
              :feedback="false"
              toggleMask
              fluid
              size="large"
              v-model="confirmPassword"
              class="w-full"
            />
            <label for="password"
              ><span class="text-red-500">*</span>Confirmar contraseña</label
            >
          </FloatLabel>
        </div>
      </div>
      <div class="mt-6 flex justify-center">
        <Button
          label="Cambiar contraseña"
          icon="pi pi-check-circle"
          raised
          class="p-button-info"
          :loading="changePasswordLoading"
          @click="submitChangePassword"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-size {
  width: 145px;
  height: 140px;
  border: 2px solid hsla(0, 0%, 100%, 0.914);
}

/* Oculta el nombre del archivo por defecto en modo basic */
/* :deep(.p-fileupload-basic .p-fileupload-filename) {
  display: none !important;
} */

:deep(span[files]) {
  display: none !important;
}
</style>
