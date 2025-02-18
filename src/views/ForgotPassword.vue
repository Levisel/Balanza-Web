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
      <img
        draggable="false"
        src="../components/icons/cjpuce.png"
        class="h-25 mb-4"
      />
    </div>
  
    <!-- Tarjeta de Login más grande y centrada -->
    <div class="select-none w-full lg:w-[500px] bg-white rounded shadow-sm lg:p-[80px]">
      <!-- Título de la tarjeta -->
       <div class="mb-12 -mt-7">
        <h2 class="text-3xl font-medium text-center">Recuperar Contraseña</h2>
        <br>
        <p class="font-medium text-center text-gray-500 text-lg">Porfavor, ingresa tu correo electrónico para restablecer tu contraseña.</p>
       </div>
      
      <!-- Formulario -->
      <Form :resolver="resolver" @submit="onFormSubmit" v-slot="{ field }" class="flex flex-col gap-12 w-full">
        <FloatLabel name="email">
          <InputText id="email" type="email" size="large" class="w-full"/>
          <label for="email">Correo Electrónico</label>
        </FloatLabel>

        <div class="grid grid-cols-2 gap-y-18 gap-x-15">  
            <Button @click="$router.push('/login')" class="mt-3" severity="contrast" label="Cancelar" />   
            <Button type="submit" class="mt-3" severity="info" label="Enviar" />
      </div>


    
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
