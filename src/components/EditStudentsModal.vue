<script setup lang="ts">
import { ref, watch, computed, defineProps, defineEmits } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import axios from 'axios';
import { API, type Internal_User } from '@/ApiRoute';

import { useSubjects } from '@/useSubjects';
const { subjects: areas } = useSubjects();


const props = defineProps<{
  visible: boolean;
  user: Internal_User | null;
}>();

const emits = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'updated'): void;
}>();

// Usamos una propiedad computada para sincronizar la visibilidad
const modelVisible = computed({
  get: () => props.visible,
  set: (value) => emits('update:visible', value)
});

const editedUser = ref<Internal_User>({} as Internal_User);



const statuses = ref([
  "Activo",
  "Inactivo"
]);

// Cada vez que se abra el modal, clonamos el usuario recibido
watch(() => props.visible, (newVal) => {
  if (newVal && props.user) {
    editedUser.value = { ...props.user };
  }
});

const cancel = () => {
  modelVisible.value = false;
};

const saveChanges = async () => {
  if (!editedUser.value) return;
  // Limpiar el formato del teléfono
  if (editedUser.value.Internal_Phone) {
    editedUser.value.Internal_Phone = editedUser.value.Internal_Phone.replace(/\D/g, "");
  }
  try {
    await axios.put(`${API}/internal-user/${editedUser.value.Internal_ID}`, editedUser.value);
    emits('updated');
    modelVisible.value = false;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    // Aquí podrías agregar una notificación para el usuario si es necesario
  }
};
</script>

<template>
  <Dialog
    v-model:visible="modelVisible"
    header="Editar Usuario"
    modal
    class="p-6"
    appendTo="body"
    :blockScroll="true"
  >
    <div class="space-y-4">
      <div>
        <label for="Internal_ID" class="block text-sm font-semibold">Cédula/Pasaporte</label>
        <InputText
          id="Internal_ID"
          v-model="editedUser.Internal_ID"
          class="w-full md:w-51 rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="Internal_Name" class="block text-sm font-semibold">Nombre</label>
          <InputText
            id="Internal_Name"
            v-model="editedUser.Internal_Name"
            class="w-full rounded border-gray-300 focus:ring-blue-500"
            size="large"
          />
        </div>
        <div>
          <label for="Internal_LastName" class="block text-sm font-semibold">Apellido</label>
          <InputText
            id="Internal_LastName"
            v-model="editedUser.Internal_LastName"
            class="w-full rounded border-gray-300 focus:ring-blue-500"
            size="large"
          />
        </div>
      </div>
      <div>
        <label for="Internal_Email" class="block text-sm font-semibold">Email</label>
        <InputText
          id="Internal_Email"
          v-model="editedUser.Internal_Email"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
        />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="Internal_Phone" class="block text-sm font-semibold">Teléfono</label>
          <InputMask
            id="Internal_Phone"
            v-model="editedUser.Internal_Phone"
            size="large"
            class="w-full rounded border-gray-300 focus:ring-blue-500 bg-gray-100"
            mask="(999)-999-9999"
          />
        </div>
        <div>
          <label for="Internal_Area" class="block text-sm font-semibold">Área</label>
          <Dropdown
  id="Internal_Area"
  v-model="editedUser.Internal_Area"
  :options="areas"
  optionLabel="label"
  optionValue="label"
  class="w-full rounded border-gray-300 focus:ring-blue-500 bg-gray-100"
  size="large"
/>


        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="Internal_Status" class="block text-sm font-semibold">Estado</label>
          <Dropdown
            id="Internal_Status"
            v-model="editedUser.Internal_Status"
            :options="statuses"
            class="w-full rounded border-gray-300 focus:ring-blue-500"
            size="large"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-3 pt-4">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          class="p-button-text text-gray-600 hover:text-gray-800"
          severity="contrast"
          @click="cancel"
        />
        <Button
          label="Guardar"
          icon="pi pi-check"
          class="p-button-info"
          @click="saveChanges"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
/* Puedes agregar estilos adicionales si lo requieres */
</style>
