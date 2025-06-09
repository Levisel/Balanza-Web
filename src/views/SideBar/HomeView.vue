<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Message } from 'primevue';
import Card from 'primevue/card';


const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const showAccessDeniedMessage = ref(false);
const accessDeniedMessage = ref('');

onMounted(() => {
  if (route.query.error === 'access_denied') {
    showAccessDeniedMessage.value = true;
    accessDeniedMessage.value = 'No tienes permisos para acceder a la página solicitada';
    
    // Limpiar la query después de 5 segundos
    setTimeout(() => {
      showAccessDeniedMessage.value = false;
      router.replace({ name: 'home' });
    }, 5000);
  }
});

const closeMessage = () => {
  showAccessDeniedMessage.value = false;
  router.replace({ name: 'home' });
};
</script>

<template>
  <main>
    <Message 
      v-if="showAccessDeniedMessage" 
      severity="warn" 
      :closable="true" 
      @close="closeMessage"
      class="mb-1"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-xl"></i>
        <div>
          <strong>Acceso Denegado</strong>
          <p class="mt-1">{{ accessDeniedMessage }}</p>
        </div>
      </div>
    </Message>

    <div class="flex flex-row flex-wrap">
      <!-- MISIÓN -->
      <div
        v-animateonscroll="{
          enterClass: 'animate-fadein',
          leaveClass: 'animate-fadeout',
        }"
        class="flex align-items-center justify-content-center w-4rem h-4rem bg-primary border-round m-2"
      >
        <Card style="width: 25.5rem; overflow: hidden" class="m-4 mt-12 -ml-1">
          <template #header>
            <img alt="user header" src="/src/components/icons/mision.jpg" />
          </template>
          <template #title>
            <h1 class="text-2xl">Misión</h1>
          </template>
          <template #content>
            <p class="m-0 text-justify text-lg">
              El Consultorio Jurídico Gratuito es parte de la Facultad de
              Jurisprudencia de la PUCE, encargada de la formación práctica y
              humanística de sus estudiantes a través de la atención integral
              jurídica y psicosocial en proyección y promoción de derechos,
              enfocados a grupos de atención prioritaria y en situación de
              vulnerabilidad, para incidir en procesos de cambio en la sociedad
              a nivel local con personal calificado y comprometido con el
              ejercicio de sus funciones.
            </p>
          </template>
        </Card>
      </div>

      <!-- VISIÓN -->
      <div
        v-animateonscroll="{
          enterClass: 'animate-fadein',
          leaveClass: 'animate-fadeout',
        }"
        class="flex align-items-center justify-content-center w-4rem h-4rem bg-primary border-round m-2"
      >
        <Card style="width: 25.5rem; overflow: hidden" class="m-4 mt-12">
          <template #header>
            <img alt="user header" src="/src/components/icons/vision.jpg" />
          </template>
          <template #title>
            <h1 class="text-2xl">Visión</h1>
          </template>
          <template #content>
            <p class="m-0 text-justify text-lg">
              Al 2025 el Consultorio Jurídico Gratuito será el referente a nivel
              nacional por su modelo de servicio integral en asesorías,
              patrocinio legal y acompañamiento a grupos de atención prioritaria
              y personas en situación de vulnerabilidad y por la formación de
              los estudiantes de varias carreras de la PUCE, aplicando sus
              conocimientos de forma humanitaria y ética, a través del contacto
              con casos reales, para la transformación personal y social, al
              servicio de un mundo fraterno, justo y sostenible.
            </p>
          </template>
        </Card>
      </div>

      <!-- OBJETIVOS ESTRATÉGICOS -->
      <div
        v-animateonscroll="{
          enterClass: 'animate-fadein',
          leaveClass: 'animate-fadeout',
        }"
        class="flex align-items-center justify-content-center w-4rem h-4rem bg-primary border-round m-2"
      >
        <Card style="width: 25.5rem; overflow: hidden" class="m-4 mt-12">
          <template #header>
            <img alt="user header" src="/src/components/icons/objetivos.jpg" />
          </template>
          <template #title>
            <h1 class="text-2xl">Objetivos Estratégicos</h1>
          </template>
          <template #content>
            <ol class="text-justify text-lg">
              <li>1. Acompañar integralmente a nuestros estudiantes</li>
              <li>2. Realizar investigación pertinente.</li>
              <li>3. Fomentar la vinculación social transformadora.</li>
            </ol>
          </template>
        </Card>
      </div>
    </div>

    <!-- CONTACTO: Solo se le aplica la animación fade in -->
    <div
      v-animateonscroll="{
        enterClass: 'animate-fadein',
        leaveClass: 'animate-fadeout',
      }"
      class="animate-duration-1000 animate-ease-in-out"
    >
      <div class="mt-20 card">
        <Fieldset legend="Contacto" class="p-4">
          <p class="mb-5 mt-5">
            <i class="pi pi-phone mr-2"></i>
            <strong>Teléfono:</strong> +593 (2) 2991783
            <br />
            <br />
            <i class="pi pi-envelope mr-2"></i>
            <strong>Correo:</strong> cjg@puce.edu.ec
          </p>
        </Fieldset>
      </div>
    </div>
  </main>
</template>

<style scoped>
@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeout {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.animate-fadein {
  animation: fadein 1s ease-in-out forwards;
}

.animate-fadeout {
  animation: fadeout 1s ease-in-out forwards;
}
</style>
