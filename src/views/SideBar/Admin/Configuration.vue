<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API } from '@/ApiRoute'
import type { Internal_User } from '@/ApiRoute'
import { useAuthStore } from '@/stores/auth'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const currentUserId = useAuthStore().user?.id;
const authStore = useAuthStore()
const userInfo = ref<Internal_User | null>(null)
const loading = ref(false)

// Estados para el formulario de cambio de contraseña
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const changePasswordLoading = ref(false)

// Obtiene la información del usuario actual
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API}/internal-user/${currentUserId}`)
    userInfo.value = response.data
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la información del usuario', life: 4000 })
  } finally {
    loading.value = false
  }
}

// Envía la solicitud para cambiar la contraseña
const submitChangePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Las contraseñas no coinciden', life: 4000 })
    return
  }
  
  changePasswordLoading.value = true
  try {
    await axios.post(`${API}/change-password`, {
      email: userInfo.value?.Internal_Email,
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    })
    toast.add({ severity: 'info', summary: 'Éxito', detail: 'Contraseña cambiada correctamente', life: 4000 })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar la contraseña, verifica que tu contraseña actual sea correcta.', life: 4000 })
  } finally {
    changePasswordLoading.value = false
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<template>
    <Toast/>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Configuración</h1>
    <!-- Sección: Información del perfil -->
    <div class="card shadow rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <i class="pi pi-user text-xl"></i>
        Información del perfil
      </h2>
      <div v-if="loading" class="flex justify-center">
        <ProgressSpinner strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Cargando" />
      </div>
      <div v-else-if="userInfo" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block font-medium mb-1">Cédula</label>
          <InputText v-model="userInfo.Internal_ID" size="large" class="w-full" readonly />
        </div>
        <div>
          <label class="block font-medium mb-1">Nombre</label>
          <InputText v-model="userInfo.Internal_Name" size="large" class="w-full" readonly />
        </div>
        <div>
          <label class="block font-medium mb-1">Apellido</label>
          <InputText v-model="userInfo.Internal_LastName" size="large" class="w-full" readonly />
        </div>
        <div>
          <label class="block font-medium mb-1">Correo electrónico</label>
          <InputText v-model="userInfo.Internal_Email" size="large" class="w-full" readonly />
        </div>
        <div>
          <label class="block font-medium mb-1">Tipo</label>
          <InputText v-model="userInfo.Internal_Type" size="large" class="w-full" readonly />
        </div>
        <div>
          <label class="block font-medium mb-1">Área</label>
          <InputText v-model="userInfo.Internal_Area" size="large" class="w-full" readonly />
        </div>
        <div>
          <label class="block font-medium mb-1">Teléfono</label>
          <InputText v-model="userInfo.Internal_Phone" size="large" class="w-full" readonly />
        </div>
        <div>
          <label class="block font-medium mb-1">Estado</label>
          <InputText v-model="userInfo.Internal_Status" size="large" class="w-full" readonly />
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
        <Button label="Cambiar contraseña" icon="pi pi-check-circle" size="large" class="p-button-info" :loading="changePasswordLoading" @click="submitChangePassword" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Puedes agregar estilos adicionales o ajustar la disposición con Tailwind secuencialmente si lo requieres */
</style>