<script setup lang="ts">
import { ref } from 'vue';
import FloatLabel from 'primevue/floatlabel';
import { Form } from '@primevue/forms';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useToast } from 'primevue/usetoast';
import { z } from 'zod';

// Configuración del toast y del formulario con Zod
const toast = useToast();
const initialValues = ref({
  username: '',
  email: ''
});

const resolver = ref(
  zodResolver(
    z.object({
      username: z.string().min(1, { message: 'Username is required.' }),
      email: z
        .string()
        .min(1, { message: 'Email is required.' })
        .email({ message: 'Invalid email address.' })
    })
  )
);

const onFormSubmit = ({ valid }: { valid: boolean }) => {
  if (valid) {
    toast.add({
      severity: 'success',
      summary: 'Form is submitted.',
      life: 3000
    });
  }
};
</script>

<template>
  <!-- Contenedor principal centrado vertical y horizontal -->
   <div id="background" class="select-none"></div>
  <div class="select-none flex flex-col items-center justify-center">
    <!-- Logo y Título superior -->
    <div class="mb-5 mt-10 flex flex-col items-center">
      <img draggable="false"
        src="../components/icons/cjpuce.png"
        class="h-25 mb-4"
      />
    </div>
  
    <!-- Tarjeta de Login más grande y centrada -->
    <div class="select-none w-full lg:w-[500px] bg-white rounded shadow-sm lg:p-[80px]">
      <!-- Título de la tarjeta -->
       <div class="mb-12 -mt-7">
        <h2 class="text-3xl font-medium text-center">Ingresar</h2>
       </div>
      
      <!-- Formulario -->
      <Form :resolver="resolver" @submit="onFormSubmit" v-slot="{ field }" class="flex flex-col gap-11 w-full">
        <FloatLabel name="email">
          <InputText id="email" type="email" size="large" class="w-full"/>
          <label for="email">Correo Electrónico</label>
        </FloatLabel>
        <FloatLabel>
          <Password id="over_label" type="text" :feedback="false" toggleMask fluid size="large" />
          <label for="over_label">Contraseña</label>
        </FloatLabel>
        <div class="-mt-6">
          <router-link to="/login/forgot-password" draggable="false" v-ripple>
            <span class="font-medium text-sm text-blue-800 hover:text-blue-400">¿Haz olvidado tu contraseña?</span>
          </router-link>
        </div>
    <Button type="submit" class="mt-3" severity="primary" label="Iniciar Sesión" />
    
</Form>
      
      <!-- Botón de Iniciar sesión -->
     
    </div>
  </div>
</template>

<style scoped>
#background {
  background-image: url('../components/icons/puce.jpg');
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
