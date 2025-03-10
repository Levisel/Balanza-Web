<script setup lang="ts">
import { ref } from "vue";
import { type IUsuario_Interno } from "@/ApiRoute";
import { useToast } from "primevue/usetoast";
import { API } from "@/ApiRoute";

import InputMask from "primevue/inputmask";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Password from "primevue/password";
import Button from "primevue/button";
import axios from "axios";

const toast = useToast();

const usuarioInterno = ref<IUsuario_Interno>({
  Interno_Cedula: "",
  Interno_Nombre: "",
  Interno_Apellido: "",
  Interno_Correo: "",
  Interno_Password: "",
  Interno_Tipo: "",
  Interno_Area: "",
  Interno_Telefono: "",
});

const tipos = ref([
  { label: "Estudiante", value: "Estudiante" },
  { label: "Administrador", value: "Administrador" },
]);

const areas = ref([
  { label: "Civil", value: "Civil" },
  { label: "Penal", value: "Penal" },
  {
    label: "Familia, Niñez y Adolescencia",
    value: "Familia, Niñez y Adolescencia",
  },
  { label: "Movilidad Humana", value: "Movilidad Humana" },
  { label: "Trabajo Social", value: "Trabajo Social" },
]);

const onFormSubmit = async () => {
  // Make the API call
  try {
    const response = await axios.post<IUsuario_Interno>(`${API}/register`, {
      Interno_Cedula: usuarioInterno.value.Interno_Cedula,
      Interno_Nombre: usuarioInterno.value.Interno_Nombre,
      Interno_Apellido: usuarioInterno.value.Interno_Apellido,
      Interno_Correo: usuarioInterno.value.Interno_Correo,
      Interno_Password: usuarioInterno.value.Interno_Password,
      Interno_Tipo: usuarioInterno.value.Interno_Tipo,
      Interno_Area: usuarioInterno.value.Interno_Area,
      Interno_Telefono: usuarioInterno.value.Interno_Telefono.replace(
        /\D/g,
        ""
      ),
    });
    // If the API returns a success message
    if (response.data) {
      toast.add({
        severity: "success",
        summary: "Usuario creado",
        detail: "El usuario ha sido creado exitosamente.",
        life: 3000,
      });
      usuarioInterno.value = {
        Interno_Cedula: "",
        Interno_Nombre: "",
        Interno_Apellido: "",
        Interno_Correo: "",
        Interno_Password: "",
        Interno_Tipo: "",
        Interno_Area: "",
        Interno_Telefono: "",
      };
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
  usuarioInterno.value.Interno_Password = password;
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
          <div>
            <FloatLabel variant="on" class="w-full md:w-80">
              <InputText
                id="idNumber"
                v-model="usuarioInterno.Interno_Cedula"
                size="large"
                class="w-full"
              />
              <label for="idNumber"
                >Cédula <span class="text-red-500">*</span></label
              >
            </FloatLabel>
          </div>
          <!-- Fila 2: Nombre y Apellido -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 -mr-40">
            <FloatLabel variant="on" class="w-full md:w-80">
              <InputText
                id="name"
                v-model="usuarioInterno.Interno_Nombre"
                size="large"
                class="w-full"
              />
              <label for="name"
                >Nombre <span class="text-red-500">*</span></label
              >
            </FloatLabel>
            <FloatLabel variant="on" class="w-full md:w-80">
              <InputText
                id="lastName"
                v-model="usuarioInterno.Interno_Apellido"
                size="large"
                class="w-full"
              />
              <label for="lastName"
                >Apellido <span class="text-red-500">*</span></label
              >
            </FloatLabel>
          </div>
          <!-- Fila 3: Teléfono y Área -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 -mr-40">
            <FloatLabel variant="on" class="w-full">
              <InputMask
                id="telefono"
                v-model="usuarioInterno.Interno_Telefono"
                size="large"
                class="w-full md:w-80"
                mask="(999)-999-9999"
              />
              <label for="telefono">Teléfono</label>
            </FloatLabel>
            <FloatLabel variant="on" class="w-full md:w-80">
              <Dropdown
                id="userArea"
                v-model="usuarioInterno.Interno_Area"
                :options="areas"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                size="large"
              />
              <label for="userArea"
                >Área <span class="text-red-500">*</span></label
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
              <Dropdown
                id="userType"
                v-model="usuarioInterno.Interno_Tipo"
                :options="tipos"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                size="large"
              />
              <label for="userType"
                >Tipo de Usuario <span class="text-red-500">*</span></label
              >
            </FloatLabel>
          </div>
          <!-- Fila 2: Email -->
          <div>
            <FloatLabel variant="on" class="w-full md:w-80">
              <InputText
                id="email"
                v-model="usuarioInterno.Interno_Correo"
                size="large"
                class="w-full"
              />
              <label for="email"
                >Email <span class="text-red-500">*</span></label
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
                v-model="usuarioInterno.Interno_Password"
                class="w-full"
              />
              <label for="password"
                >Contraseña <span class="text-red-500">*</span></label
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
