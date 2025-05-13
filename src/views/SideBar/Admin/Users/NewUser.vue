<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { type Internal_User } from "@/ApiRoute";
import { useToast } from "primevue/usetoast";
import { API } from "@/ApiRoute";

import InputMask from "primevue/inputmask";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Password from "primevue/password";
import Button from "primevue/button";
import axios from "axios";
import type { boolean } from "zod";
import { useSubjects } from "@/useSubjects";
import { useNotificationStore } from "@/stores/notifications";

const toast = useToast();
const selectedIdType = ref<string>("");
const bandera = ref<boolean>(false);
const userRegistered = ref<boolean>(false);
const notificationStore = useNotificationStore();

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
});

const profileOptions = ref<{ name: string; value: string }[]>([]);
axios.get(`${API}/profile`).then((response) => {
  profileOptions.value = response.data.map((item: any) => ({
    name: item.Profile_Name,
    value: item.Profile_Name,
  }));
});

const { subjects: opcionesAreas, fetchSubjects } = useSubjects();

const status = ref([
  { label: "Activo", value: "Activo" },
  { label: "Inactivo", value: "Inactivo" },
]);

const idOptions = ref([
  { name: "C.I (Cédula)", value: "cedula" },
  { name: "PA (Pasaporte)", value: "pasaporte" },
]);

const resetLabels = () => {
  selectedIdType.value = "";
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
        detail:
          "Ha ocurrido un error en el servidor. Por favor intenta más tarde.",
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
        detail:
          "Ha ocurrido un error en el servidor. Por favor intenta más tarde.",
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
  if (
    selectedIdType.value === "cedula" &&
    internalUser.value.Internal_ID.length !== 10
  ) {
    bandera.value = false;
    toast.add({
      severity: "warn",
      summary: "Cédula incorrecta",
      detail: "La cédula debe tener exactamente 10 caracteres.",
      life: 8000,
    });
    internalUser.value.Internal_ID = "";
  } else {
    bandera.value = true;
  }
  return bandera.value;
};

const onFormSubmit = async () => {
  const restrictedWords = [
    "manzana", "pera", "uva", "fresa", "mango", "melon", "sandia", "platano", "cereza", "naranja",
    "limon", "papaya", "coco", "kiwi", "ciruela", "durazno", "guayaba", "mandarina", "toronja",
    "granada", "frambuesa", "zarzamora", "arandano", "mora", "higo", "chirimoya", "maracuya",
    "tamarindo", "zapote", "nispero", "caimito", "mamey", "guanabana", "guayabo", "anon", "pomelo",
    "pina", "carambola", "parcha", "mamon", "tuna", "pitahaya", "chayote", "jicama", "chirimoia",
    "nance", "naranjilla", "pepino", "calabaza", "calabacin", "berenjena", "tomate", "pimiento",
    "papa", "yuca", "batata", "boniato", "maiz", "arroz", "trigo", "cebada", "avena", "centeno",
    "sorgo", "mijo", "quinoa", "amaranto", "cafe", "cacao", "te", "mate", "manzanilla", "tilo",
    "menta", "albahaca", "oregano", "perejil", "cilantro", "romero", "tomillo", "salvia", "laurel",
    "hinojo", "eneldo", "anis", "comino", "curcuma", "pimienta", "mostaza", "nuez", "almendra",
    "cacahuate", "pistache", "avellana", "macadamia", "sesamo", "linaza", "girasol"
  ];

  // Check if the password contains restricted words
  const containsRestrictedWord = restrictedWords.some(word =>
    internalUser.value.Internal_Password?.toLowerCase().includes(word)
  );

  if (containsRestrictedWord) {
    // Add a notification to the notification store
    notificationStore.addNotification({
      id: Date.now(),
      mensaje: "La contraseña contiene palabras restringidas. Por favor, cámbiala.",
      fecha: new Date().toISOString(),
      leida: false,
      userId: internalUser.value.Internal_ID,
    });
  }
  // Make the API call
  try {
    const response = await axios.post<Internal_User>(`${API}/register`, {
      Internal_ID: internalUser.value.Internal_ID,
      Internal_Name: internalUser.value.Internal_Name,
      Internal_LastName: internalUser.value.Internal_LastName,
      Internal_Email: internalUser.value.Internal_Email,
      Internal_Password: internalUser.value.Internal_Password,
      Internal_Type: internalUser.value.Internal_Type,
      Internal_Area: internalUser.value.Internal_Area,
      Internal_Phone: internalUser.value.Internal_Phone.replace(/\D/g, ""),
      Internal_Status: internalUser.value.Internal_Status,
    });
    // If the API returns a success message
    if (response.data) {
      toast.add({
        severity: "success",
        summary: "Usuario creado",
        detail: "El usuario ha sido creado exitosamente.",
        life: 3000,
      });
      resetLabels();
    }
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 400) {
        toast.add({
          severity: "error",
          summary: "Campos Incompletos",
          detail: error.response.data.message,
          life: 3000,
        });
      } else if (error.response.status === 401) {
        toast.add({
          severity: "error",
          summary: "Datos Incorrectos",
          detail: error.response.data.message,
          life: 3000,
        });
      } else {
        toast.add({
          severity: "error",
          summary: "Error del servidor",
          detail:
            "Ha ocurrido un error en el servidor. Por favor intenta más tarde.",
          life: 3000,
        });
      }
    }
  }
};

const createPassword = () => {
  const words = [
    "manzana",
    "pera",
    "uva",
    "fresa",
    "mango",
    "melon",
    "sandia",
    "platano",
    "cereza",
    "naranja",
    "limon",
    "papaya",
    "coco",
    "kiwi",
    "ciruela",
    "durazno",
    "guayaba",
    "mandarina",
    "toronja",
    "granada",
    "frambuesa",
    "zarzamora",
    "arandano",
    "mora",
    "higo",
    "chirimoya",
    "maracuya",
    "tamarindo",
    "zapote",
    "nispero",
    "caimito",
    "mamey",
    "guanabana",
    "guayabo",
    "anon",
    "pomelo",
    "pina",
    "carambola",
    "parcha",
    "mamon",
    "tuna",
    "pitahaya",
    "chayote",
    "jicama",
    "chirimoia",
    "nance",
    "naranjilla",
    "pepino",
    "calabaza",
    "calabacin",
    "berenjena",
    "tomate",
    "pimiento",
    "papa",
    "yuca",
    "batata",
    "boniato",
    "maiz",
    "arroz",
    "trigo",
    "cebada",
    "avena",
    "centeno",
    "sorgo",
    "mijo",
    "quinoa",
    "amaranto",
    "cafe",
    "cacao",
    "te",
    "mate",
    "manzanilla",
    "tilo",
    "menta",
    "albahaca",
    "oregano",
    "perejil",
    "cilantro",
    "romero",
    "tomillo",
    "salvia",
    "laurel",
    "hinojo",
    "eneldo",
    "anis",
    "comino",
    "curcuma",
    "pimienta",
    "mostaza",
    "nuez",
    "almendra",
    "cacahuate",
    "nuez",
    "pistache",
    "avellana",
    "macadamia",
    "coco",
    "sesamo",
    "linaza",
    "girasol",
    "calabaza",
    "amaranto",
    "quinoa",
    "mijo",
    "sorgo",
    "trigo",
    "cebada",
    "arroz",
  ];
  const password =
    words[Math.floor(Math.random() * words.length)] +
    Math.floor(Math.random() * 100);
  internalUser.value.Internal_Password = password;
};

onMounted(() => {
  fetchSubjects();
});
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
                    option-label="name"
                    option-value="value"
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
            <FloatLabel variant="on" class="w-full md:w-80">
              <Select
                id="userStatus"
                v-model="internalUser.Internal_Status"
                :options="status"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                size="large"
              />
              <label for="userStatus"
                ><span class="text-red-500">*</span> Estado</label
              >
            </FloatLabel>
          </div>
          <!-- Fila 2: Nombre y Apellido -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 -mr-40">
            <FloatLabel variant="on" class="w-full md:w-80">
              <InputText
                id="name"
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
              <label for="telefono"
                ><span class="text-red-500">*</span> Teléfono</label
              >
            </FloatLabel>
            <FloatLabel variant="on" class="w-full md:w-80">
              <Select
                id="userArea"
                v-model="internalUser.Internal_Area"
                :options="opcionesAreas"
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
          <div>
            <FloatLabel variant="on" class="w-full md:w-80">
              <Select
                id="userType"
                v-model="internalUser.Internal_Type"
                :options="profileOptions"
                optionLabel="name"
                optionValue="value"
                class="w-full"
                size="large"
              />
              <label for="userType"
                ><span class="text-red-500">*</span> Tipo de Usuario</label
              >
            </FloatLabel>
          </div>
          <!-- Fila 2: Email -->
          <div>
            <FloatLabel variant="on" class="w-full md:w-80">
              <InputText
                id="email"
                v-model="internalUser.Internal_Email"
                size="large"
                class="w-full"
              />
              <label for="email"
                ><span class="text-red-500">*</span> Email</label
              >
            </FloatLabel>
          </div>
          <!-- Fila 3: Contraseña -->
          <div class="flex items-center gap-2">
            <FloatLabel variant="on" class="w-full md:w-80">
              <Password
                id="password"
                type="text"
                :feedback="false"
                toggleMask
                fluid
                size="large"
                v-model="internalUser.Internal_Password"
                class="w-full"
              />
              <label for="password"
                ><span class="text-red-500">*</span> Contraseña</label
              >
            </FloatLabel>
            <Button
              @click="createPassword"
              v-tooltip.bottom="'Generar contraseña'"
              placeholder="Bottom"
              icon="pi pi-key"
              class="p-2 bg-gray-300 text-black rounded-md text-sm"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 text-center mb-10">
      <Button
        @click="$router.push('/Usuarios')"
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
      />
    </div>
  </div>
</template>

<style scoped></style>
