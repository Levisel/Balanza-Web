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
  <div class="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
  
    <!-- Logo y Título superior -->
    <div class="mb-3 flex flex-col items-center">
      <img
        src="../components/icons/cjpuce.png"
        class="h-25 mb-4"
      />
    </div>
  
    <!-- Tarjeta de Login más grande y centrada -->
    <div class="w-full lg:w-[500px] bg-white rounded shadow-sm p-10 lg:p-[80px] mb-20">
      <!-- Título de la tarjeta -->
       <div class="mb-15">
        <h2 class="text-3xl font-semibold text-center">Ingresar</h2>
       </div>
      
      <!-- Formulario -->
      <Form :resolver="resolver" @submit="onFormSubmit" v-slot="{ field }" class="flex flex-col gap-10 w-full">
        <FloatLabel name="email">
          <InputText id="over_label" type="text" size="large" class="w-full"/>
          <label for="over_label">Correo Electrónico</label>
        </FloatLabel>


        <FloatLabel>
          <Password id="over_label" type="text" :feedback="false" toggleMask fluid size="large" />
          <label for="over_label">Contraseña</label>
        </FloatLabel>

    <Button type="submit" class="mt-3" severity="primary" label="Iniciar Sesión" />
</Form>
      
      <!-- Botón de Iniciar sesión -->
     
    </div>
  </div>
</template>

<style scoped>
/* Puedes agregar estilos personalizados aquí si lo deseas */
</style>
