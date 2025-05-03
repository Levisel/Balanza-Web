<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { type Internal_User } from "@/ApiRoute";
import { useToast } from "primevue/usetoast";
import { API } from "@/ApiRoute";

import InputMask from "primevue/inputmask";
import InputText from "primevue/inputtext";
import Select from 'primevue/select';
import Password from "primevue/password";
import Button from "primevue/button";
import axios from "axios";
import type { boolean } from "zod";


const toast = useToast();
const selectedIdType = ref<string>("");
const bandera = ref<boolean>(false);
const userRegistered = ref<boolean>(false);


const internalUser = ref<Internal_User>({
  Internal_ID: "",
  Internal_Name: "",
  Internal_LastName: "",
  Internal_Email: "",
  Internal_Password: "",
  Internal_Type: "",
  Internal_Area: "",
  Internal_Phone: "",
  Internal_Status: "",
  Internal_Picture: "",
});

const types = ref([
  { label: "Estudiante", value: "Estudiante" },
  { label: "Administrador", value: "Administrador"},
  { label: "Abogado", value: "Abogado"  },
  { label: "Secretaría", value: "Secretaría" },
  { label: "Conserje", value: "Conserje" },
  { label: "Otro", value: "Otro" },
]);

import { useSubjects } from '@/useSubjects';
const { subjects: areas } = useSubjects();


const status = ref([
  { label: "Activo", value: "Activo" },
  { label: "Inactivo", value: "Inactivo" },
]);

const idOptions = ref([
  { name: "C.I (Cédula)", value: "cedula" },
  { name: "PA (Pasaporte)", value: "pasaporte" },
]);

const resetLabels = () => {
  internalUser.value.Internal_ID = "";
  internalUser.value.Internal_Name = "";
  internalUser.value.Internal_LastName = "";
  internalUser.value.Internal_Email = "";
  internalUser.value.Internal_Password = "";
  internalUser.value.Internal_Type = "";
  internalUser.value.Internal_Area = "";
  internalUser.value.Internal_Phone = "";
  internalUser.value.Internal_Status = "";
};

const loading = ref<boolean>(false); // Variable para controlar el spinner


// Validar cédula

  const validateID = (ID: string): boolean => {
  if (!/^\d{10}$/.test(ID)) return false; // Solo permite 10 dígitos numéricos

  const digits = ID.split("").map(Number);
  const province = parseInt(ID.substring(0, 2), 10);
  if (province < 1 || province > 24) return false; // Verificar que la province sea válida

  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let valor = digits[i] * (i % 2 === 0 ? 2 : 1);
    if (valor > 9) valor -= 9;
    suma += valor;
  }

  const digitoVerificador = (10 - (suma % 10)) % 10;
  return digitoVerificador === digits[9];
};

const checkUserExists = async (): Promise<boolean> => {
  if (!internalUser.value.Internal_ID) {
    return false;
  }
  
  try {
    const response = await axios.get<Internal_User>(
      `${API}/internal-user/${internalUser.value.Internal_ID}`
    );
    
    if (response.data) {
      internalUser.value.Internal_ID = "";
      return true;
    }
  } catch (error: any) {
    if (error.response && error.response.status !== 404) {
      toast.add({
        severity: "error",
        summary: "Error del servidor",
        detail: "Ha ocurrido un error en el servidor. Por favor intenta más tarde.",
        life: 3000,
      });
    }
  }

  return false;
};

const checkEmailExists = async (): Promise<boolean> => {
  if (!internalUser.value.Internal_Email) {
    return false;
  }
  
  try {
    const response = await axios.get<Internal_User>(
      `${API}/internal-user/email/${internalUser.value.Internal_Email}`
    );
    
    if (response.data) {
      internalUser.value.Internal_Email = "";
      return true;
    }
  } catch (error: any) {
    if (error.response && error.response.status !== 404) {
      toast.add({
        severity: "error",
        summary: "Error del servidor",
        detail: "Ha ocurrido un error en el servidor. Por favor intenta más tarde.",
        life: 3000,
      });
    }
  }

  return false;
};

watch(
  () => internalUser.value.Internal_ID,
  (nuevoValor) => {
    if (selectedIdType.value === "cedula" && nuevoValor.length === 10) {
      if (validateID(nuevoValor)) {
        checkUserExists().then((existe) => {
        if (existe) {
            toast.add({
            severity: "warn",
            summary: "Usuario ya existe",
            detail: "Ya existe un usuario con la cédula ingresada.",
            life: 3000,
          });
        } else {
          toast.add({
          severity: "success",
          summary: "Cédula válida",
          detail: "La cédula ingresada es correcta.",
          life: 3000,
           });
        }
        });
        
      } else {
        toast.add({
          severity: "error",
          summary: "Cédula no válida",
          detail: "La cédula ingresada no es válida.",
          life: 3000,
        });
        internalUser.value.Internal_ID = "";
      }
    }
  }
);

watch(
  () => internalUser.value.Internal_Email,
  (nuevoValor) => {
    if (nuevoValor) {
      checkEmailExists().then((existe) => {
        if (existe) {
            toast.add({
            severity: "warn",
            summary: "Correo ya existe",
            detail: "Ya existe un usuario con ese correo ingresado.",
            life: 3000,
          });
        } 
        });
    }
  }
);

const checkIdSize = (shouldShowToast: boolean = true): boolean => {
  if (selectedIdType.value === "cedula" && internalUser.value.Internal_ID.length !== 10) {
    bandera.value = false;
    toast.add({
      severity: "warn",
      summary: "Cédula incorrecta",
      detail: "La cédula debe tener exactamente 10 caracteres.",
      life: 8000,
    });
    internalUser.value.Internal_ID = "";
  }
  else {
    bandera.value = true;
  }
  return bandera.value;
};

const onFormSubmit = async () => {
  // Validar campos obligatorios (el teléfono puede quedar vacío)
  if (
    !internalUser.value.Internal_ID ||
    !internalUser.value.Internal_Name ||
    !internalUser.value.Internal_LastName ||
    !internalUser.value.Internal_Email ||
    !internalUser.value.Internal_Area
  ) {
    toast.add({
      severity: "error",
      summary: "Campos Incompletos",
      detail: "Por favor, complete todos los campos obligatorios.",
      life: 3000,
    });
    return;
  }

  loading.value = true; // Mostrar loading

  try {
    const periodId = "sin-periodo";

    const payload = {
      Internal_ID: internalUser.value.Internal_ID,
      Internal_Name: internalUser.value.Internal_Name,
      Internal_LastName: internalUser.value.Internal_LastName,
      Internal_Email: internalUser.value.Internal_Email,
      Internal_Password: internalUser.value.Internal_Password,
      Internal_Type: "Estudiante",
      Internal_Area: internalUser.value.Internal_Area,
      Internal_Phone: internalUser.value.Internal_Phone.replace(/\D/g, ""),
      Internal_Status: "Activo",
    };

    const { data } = await axios.post(`${API}/usuariointernoBulk/${periodId}`, payload);

    toast.add({
      severity: "success",
      summary: "Usuario creado",
      detail: "El usuario ha sido creado exitosamente.",
      life: 3000,
    });

    resetLabels(); // Limpiar formulario
  } catch (error: any) {
    console.error("Error en la creación del usuario:", error);
    const mensajeError = error.response?.data?.message || "Ha ocurrido un error en el servidor. Por favor intenta más tarde.";
    toast.add({
      severity: "error",
      summary: "Error",
      detail: mensajeError,
      life: 4000,
    });
  } finally {
    loading.value = false; // Ocultar loading
  }
};



</script>

<template>
  <Toast />
  <div class="card">
    <h3 class="text-2xl font-semibold mb-8">Crear nuevo usuario</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-80">
      <!-- Datos Personales -->
      <div>
        <h4 class="text-lg font-semibold mb-6">Datos Personales</h4>
        <div class="grid gap-7">
          <!-- Fila 1: Cédula -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 -mr-40">
            <div class="flex flex-col sm:flex-row gap-4">
              <!-- Select para Tipo ID -->
              <div class="w-full sm:w-1/3">
                <FloatLabel variant="on" class="w-full">
                  <Select
                    id="tipoID"
                    v-model="selectedIdType"
                    :options="idOptions"
                    size="large"
                    optionLabel="name"
                    optionValue="value" 
                    class="w-full"
                    @change="internalUser.Internal_ID = ''"
                  />
                  <label for="tipoID">Tipo ID</label>
                </FloatLabel>
              </div>
              <!-- Input para Número de ID -->
              <div class="w-full sm:w-2/3">
                <FloatLabel variant="on" class="w-full">
                  <InputText
                    id="idNumber"
                    v-model="internalUser.Internal_ID"
                    size="large"
                    class="w-full"
                    :maxlength="selectedIdType === 'cedula' ? 10 : 15"
                    @blur="() => checkIdSize()"
                    :disabled="!selectedIdType"
                    autocomplete="off"
                  />
                  <label for="idNumber">Número de ID</label>
                </FloatLabel>
              </div>
            </div>
           
          </div>
          <!-- Fila 2: Nombre y Apellido -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 -mr-40">
            <FloatLabel variant="on" class="w-full md:w-80">
              <InputText
                id="name"
                 maxlength="50"
                v-model="internalUser.Internal_Name"
                size="large"
                class="w-full"
              />
              <label for="name"
                ><span class="text-red-500">*</span> Nombre</label
              >
            </FloatLabel>
            <FloatLabel variant="on" class="w-full md:w-80">
              <InputText
                id="lastName"
                 maxlength="50"
                v-model="internalUser.Internal_LastName"
                size="large"
                class="w-full"
              />
              <label for="lastName"
                ><span class="text-red-500">*</span> Apellido</label
              >
            </FloatLabel>
          </div>
          <!-- Fila 3: Teléfono y Área -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 -mr-40">
            <FloatLabel variant="on" class="w-full">
  <InputMask
    id="telefono"
    v-model="internalUser.Internal_Phone"
    size="large"
    class="w-full md:w-80"
    mask="(999)-999-9999"
  />
  <label for="telefono">Teléfono</label>
</FloatLabel>

            <FloatLabel variant="on" class="w-full md:w-80">
              <Select
                id="userArea"
                v-model="internalUser.Internal_Area"
                :options="areas"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                size="large"
              />
              <label for="userArea"
                ><span class="text-red-500">*</span> Área</label
              >
            </FloatLabel>
          </div>
        </div>
      </div>

      <!-- Credenciales -->
      <div>
        <h4 class="text-lg font-semibold mb-6">Credenciales</h4>
        <div class="grid gap-7">
          <!-- Fila 1: Tipo de Usuario -->
     
          <!-- Fila 2: Email -->
          <div>
            <FloatLabel variant="on" class="w-full md:w-80">
              <InputText
                id="email"
                 maxlength="50"
                v-model="internalUser.Internal_Email"
                size="large"
                class="w-full"
              />
              <label for="email"
                ><span class="text-red-500">*</span> Email</label
              >
            </FloatLabel>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 text-center mb-10">
      <Button
      @click="$router.push('/ListadoEstudiantes')"
      label="Regresar"
      severity="contrast"
       class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white mt-10 mr-10"
       icon="pi pi-arrow-circle-left"
      />
      
      <Button
        type="submit"
        label="Crear Usuario"
        icon="pi pi-user-plus"
        class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white mt-10 mr-35"
        @click="onFormSubmit"
        :disabled="loading"
        :loading="loading"
      />
    </div>
  </div>
</template>

<style scoped></style>
