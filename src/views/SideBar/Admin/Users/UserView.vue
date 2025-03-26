<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import router from '@/router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { type Internal_User } from "@/ApiRoute";
import { API } from "@/ApiRoute";

// PrimeVue Toast para notificaciones
const toast = useToast();

// Usuarios cargados desde la API
const internalUser = ref<Internal_User[]>([]);
// Usuario seleccionado para edición (se inicializa como objeto vacío)
const selectedInternalUser = ref<Internal_User>({} as Internal_User);


const viewDialogVisible = ref(false);
const editDialogVisible = ref(false);


// Inicializamos filtros con la estructura esperada
const filters = ref<any>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS  },
    Internal_ID: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    Internal_Name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    Internal_LastName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    Internal_Email: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    Internal_Area: { value: null, matchMode: FilterMatchMode.EQUALS },
    Internal_Type: { value: null, matchMode: FilterMatchMode.EQUALS },
    Internal_Status: { value: null, matchMode: FilterMatchMode.EQUALS }
});

// Estados disponibles para filtro
const statuses = ref(["Activo", "Inactivo"]);

const areas = ref([
    "Civil",
    "Penal",
    "Familia, Niñez y Adolescencia",
    "Movilidad Humana",
    "Trabajo Social",
]);

const types = ref([
  "Administrador",
  "Estudiante",
  "SuperAdmin",
]);

// Función para obtener usuarios de la API
const fetchUsers = async () => {
    try {
        const { data } = await axios.get(`${API}/internal-user`);
        // Excluimos la contraseña
        internalUser.value = data.map((user: Internal_User) => {
            const { Internal_Password, ...rest } = user;
            return rest;
        });
    } catch (error) {
        console.error("Error al cargar los usuarios:", error);
    }
};

// Guardar cambios en la API
const saveUser = async () => {
    if (selectedInternalUser.value) {
        try {
            selectedInternalUser.value.Internal_Phone = selectedInternalUser.value.Internal_Phone.replace(/\D/g,""); // Eliminar caracteres no numéricos
            await axios.put(`${API}/internal-user/${selectedInternalUser.value.Internal_ID}`, selectedInternalUser.value);
            toast.add({ severity: "info", summary: "Usuario Actualizado", detail: "El usuario ha sido actualizado con éxito.", life: 4000 });
            // Recargar usuarios después de la actualización
            await fetchUsers();
            editDialogVisible.value = false;
            console.log(selectedInternalUser.value);
        } catch (error) {
            toast.add({ severity: "error", summary: "Error", detail: "No se ha podido actualizar al usuario.", life: 3000 });
        }
    }
};

// Abre el diálogo de información
const openViewDialog = (user: Internal_User) => {
    selectedInternalUser.value = { ...user };
    viewDialogVisible.value = true;
};

// Abre el diálogo de edición
const openEditDialog = (user: Internal_User) => {
    selectedInternalUser.value = { ...user };
    editDialogVisible.value = true;
};


// Configurar filtros para la tabla (se puede reiniciar si es necesario)
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS  },
        Internal_ID: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        Internal_Name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        Internal_LastName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        Internal_Email: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        Internal_Area: { value: null, matchMode: FilterMatchMode.EQUALS },
        Internal_Type: { value: null, matchMode: FilterMatchMode.EQUALS },
        Internal_Status: { value: null, matchMode: FilterMatchMode.EQUALS }
    };
};

const clearFilter = () => {
    initFilters();
    // Reasignamos el objeto para que PrimeVue detecte el cambio
    filters.value = { ...filters.value };
};

// Función para asignar la clase de color al Tag según el estado
const getSeverity = (status: string) => {
    switch (status) {
        case 'Activo':
            return 'success';
        case 'Inactivo':
            return 'danger';
        default:
            return 'secondary';
    }
};

onMounted(() => {
    fetchUsers();
    initFilters();
});
</script>

<template>
    <Toast />
    <div class="card">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
        </div>

        <DataTable 
            v-model:filters="filters" 
            v-model="selectedInternalUser" 
            :value="internalUser" 
            paginator 
            :rows="10" 
            dataKey="Internal_ID" 
            filterDisplay="menu"
            size="large"
            removableSort
            :globalFilterFields="['Internal_ID','Internal_Name', 'Internal_Email', 'Internal_Area', 'Internal_Status']"
        >
            <template #header>
                <div class="flex justify-between">
                    <Button 
                        type="button" 
                        icon="pi pi-filter-slash" 
                        label="Limpiar" 
                        outlined 
                        @click="clearFilter()" 
                    />
                    <Button 
                        @click="router.push('/NuevoUsuario')" 
                        icon="pi pi-user-plus" 
                        v-tooltip="'Nuevo Usuario'" 
                        rounded 
                        aria-label="Nuevo Usuario" 
                        size="large" 
                        class="mr-220"
                    />
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Buscar" />
                    </IconField>
                </div>
            </template>
            <template #empty> No hay usuarios registrados </template>

            <Column field="Internal_ID" header="Cédula/Pasaporte" sortable style="min-width: 14rem">
                <template #body="{ data }">
                    {{ data.Internal_ID }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText 
                        v-model="filterModel.value" 
                        type="text" 
                        placeholder="Buscar por ID" 
                    />
                </template>
            </Column>
            

            
            <Column field="Internal_Name" header="Nombre" sortable style="min-width: 14rem">
                <template #body="{ data }">
                    {{ data.Internal_Name + ' ' + data.Internal_LastName }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText 
                        v-model="filterModel.value" 
                        type="text" 
                        placeholder="Buscar por nombre" 
                    />
                </template>
            </Column>
            
            <Column field="Internal_Email" header="Correo Electrónico" sortable style="min-width: 14rem">
                <template #body="{ data }">
                    {{ data.Internal_Email }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText 
                        v-model="filterModel.value" 
                        type="text" 
                        placeholder="Buscar por correo" 
                    />
                </template>
            </Column>

            <Column field="Internal_Type" header="Tipo" sortable style="min-width: 14rem">
                <template #body="{ data }">
                    {{ data.Internal_Type }}
                </template>
                <template #filter="{ filterModel }">
                    <Dropdown 
                        v-model="filterModel.value" 
                        :options="types" 
                        placeholder="Seleccionar uno" 
                        showClear
                    />
                </template>
            </Column>

            <Column field="Internal_Status" header="Estado" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    <Tag 
                        :value="data.Internal_Status" 
                        :severity="getSeverity(data.Internal_Status)" 
                    />
                </template>
                <template #filter="{ filterModel }">
                    <Dropdown 
                        v-model="filterModel.value" 
                        :options="statuses" 
                        placeholder="Seleccionar uno" 
                        showClear
                    >
                        <template #option="slotProps">
                            <Tag 
                                :value="slotProps.option" 
                                :severity="getSeverity(slotProps.option)" 
                            />
                        </template>
                    </Dropdown>
                </template>
            </Column>
            
            <Column header="Acciones" headerStyle="width: 5rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
                <template #body="{ data }">
                      <div class="flex justify-center items-center gap-2">
                         <Button @click="openViewDialog(data)" v-tooltip.bottom="'Ver Usuario'" icon="pi pi-user" severity="secondary" rounded variant="outlined" aria-label="User" />
                         <Button @click="openEditDialog(data)" v-tooltip.bottom="'Editar Usuario'" icon="pi pi-pencil" severity="info" rounded variant="outlined" aria-label="User" />
                      </div>
                       
                </template>
            </Column>
        </DataTable>

        
 <!-- Modal de información -->
<Dialog v-model:visible="viewDialogVisible" header="Información de Usuario" modal class="p-6"  appendTo="body" :blockScroll="true">
    <div class="space-y-4">
        <div>
        <label for="id" class="block text-sm font-semibold ">Cédula/Pasaporte</label>
        <InputText
          id="id"
          v-model="selectedInternalUser.Internal_ID"
          class=" w-full md:w-51 rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="name" class="block text-sm font-semibold ">Nombre</label>
        <InputText
          id="name"
          v-model="selectedInternalUser.Internal_Name"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
           size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="lastname" class="block text-sm font-semibold ">Apellido</label>
        <InputText
          id="lastname"
          v-model="selectedInternalUser.Internal_LastName"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
         :disabled="true"
        />
      </div>
    </div>

    <div>
      <label for="email" class="block text-sm font-semibold ">Email</label>
      <InputText
        id="email"
        v-model="selectedInternalUser.Internal_Email"
        class="w-full rounded border-gray-300 focus:ring-blue-500"
        size="large"
        :disabled="true"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
            <label for="telefono" class="block text-sm font-semibold ">Teléfono</label>
        <InputMask
        id="telefono"
        v-model="selectedInternalUser.Internal_Phone"
        size="large"
        class="w-full rounded border-gray-300 focus:ring-blue-500 bg-gray-100"
        mask="(999)-999-9999"
        :disabled="true"
        />
      </div>

      <div>
        <label for="area" class="block text-sm font-semibold ">Área</label>
        <Dropdown
          id="area"
          v-model="selectedInternalUser.Internal_Area"
          :options="areas"
          class="w-full rounded border-gray-300 focus:ring-blue-500 bg-gray-100"
          readonly
          size="large"
          :disabled="true"
        />
      </div>

    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
        <label for="type" class="block text-sm font-semibold ">Tipo</label>
        <Dropdown
          id="type"
          v-model="selectedInternalUser.Internal_Type"
          :options="types"
          class="w-full rounded border-gray-300 focus:ring-blue-500 bg-gray-100"
          readonly
          size="large"
          :disabled="true"
        />
      </div>
      <div>
        <label for="status" class="block text-sm font-semibold ">Estado</label>
        <Dropdown
          id="status"
          v-model="selectedInternalUser.Internal_Status"
          :options="statuses"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
    </div>
  </div>
</Dialog>

<!-- Modal de edición -->
<Dialog v-model:visible="editDialogVisible" header="Editar Usuario" modal class="p-6"  appendTo="body" :blockScroll="true">
  <div class="space-y-4">
    <div>
        <label for="id" class="block text-sm font-semibold ">Cédula/Pasaporte</label>
        <InputText
          id="id"
          v-model="selectedInternalUser.Internal_ID"
          class=" w-full md:w-51 rounded border-gray-300 focus:ring-blue-500"
          size="large"
          :disabled="true"
        />
      </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="name" class="block text-sm font-semibold ">Nombre</label>
        <InputText
          id="name"
          v-model="selectedInternalUser.Internal_Name"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
        />
      </div>
      <div>
        <label for="lastname" class="block text-sm font-semibold ">Apellido</label>
        <InputText
          id="lastname"
          v-model="selectedInternalUser.Internal_LastName"
          class="w-full rounded border-gray-300 focus:ring-blue-500"
          size="large"
        />
      </div>
    </div>

    <div>
      <label for="email" class="block text-sm font-semibold ">Email</label>
      <InputText
        id="email"
        v-model="selectedInternalUser.Internal_Email"
        class="w-full rounded border-gray-300 focus:ring-blue-500"
        size="large"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label for="telefono" class="block text-sm font-semibold ">Teléfono</label>
        <InputMask
        id="telefono"
        v-model="selectedInternalUser.Internal_Phone"
        size="large"
        class="w-full rounded border-gray-300 focus:ring-blue-500 bg-gray-100"
        mask="(999)-999-9999"
        />


      </div>
      <div>
        <label for="area" class="block text-sm font-semibold ">Área</label>
        <Dropdown
          id="area"
          v-model="selectedInternalUser.Internal_Area"
          :options="areas"
          class="w-full rounded border-gray-300 focus:ring-blue-500 bg-gray-100"
          size="large"
          readonly
        />
      </div>

    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
        <label for="type" class="block text-sm font-semibold ">Tipo</label>
        <Dropdown
          id="type"
          v-model="selectedInternalUser.Internal_Type"
          :options="types"
          class="w-full rounded border-gray-300 focus:ring-blue-500 bg-gray-100"
          size="large"
          readonly
        />
      </div>
      <div>
        <label for="status" class="block text-sm font-semibold ">Estado</label>
        <Dropdown
          id="status"
          v-model="selectedInternalUser.Internal_Status"
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
        @click="editDialogVisible = false"
      />
      <Button label="Guardar" icon="pi pi-check" class="p-button-info" @click="saveUser()" />
    </div>
  </template>
</Dialog>

    </div>
</template>

<style scoped>

</style>
