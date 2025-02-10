<script setup>
import { ref } from 'vue';
import InputNumber from 'primevue/inputnumber';
import InputMask from 'primevue/inputmask';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Select from 'primevue/select';
import Dropdown from 'primevue/dropdown';
import DatePicker from 'primevue/datepicker';
import FloatLabel from 'primevue/floatlabel';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import FileUpload from 'primevue/fileupload';

const discapacidad = ref(false);
const nombres = ref('');
const apellidos = ref('');
const sexo = ref(null);
const sexoOptions = ref([
  { name: 'Masculino', value: 'Masculino' },
  { name: 'Femenino', value: 'Femenino' },
  { name: 'Otro', value: 'Otro' }
]);

const fechaNacimiento = ref('');
const etnia = ref(null);
const etniaOptions = ref([
  { name: 'Mestizo', value: 'Mestizo' },
  { name: 'Afroecuatoriano', value: 'Afroecuatoriano' },
  { name: 'Indígena', value: 'Indígena' },
  { name: 'Blanco', value: 'Blanco' },
  { name: 'Montubio', value: 'Montubio' },
  { name: 'Mulato', value: 'Mulato' },
  { name: 'Otro', value: 'Otro' }
]);

const telefono = ref('');
const email = ref('');
const direccion = ref('');
const sector = ref('');
const zona = ref(null);
const zonaOptions = ref([
  { name: 'Urbana', code: 'Urbana' },
  { name: 'Rural', code: 'Rural' }
]);

const recibeBono = ref(false);
const casaPropia = ref(false);
const vehiculoPropio = ref(false);

const instruccion = ref(null);
const instruccionOptions = ref([
  { name: 'Primaria', code: 'Primaria' },
  { name: 'Secundaria', code: 'Secundaria' },
  { name: 'Superior', code: 'Superior' }
]);

const ocupacion = ref(null);
const ocupacionOptions = ref([
  { name: 'Empleado', code: 'Empleado' },
  { name: 'Desempleado', code: 'Desempleado' },
  { name: 'Estudiante', code: 'Estudiante' },
  { name: 'Otro', code: 'Otro' }
]);

const estadoCivil = ref(null);
const estadoCivilOptions = ref([
  { name: 'Soltero/a', code: 'Soltero/a' },
  { name: 'Casado/a', code: 'Casado/a' },
  { name: 'Divorciado/a', code: 'Divorciado/a' },
  { name: 'Viudo/a', code: 'Viudo/a' }
]);

const cargasFamiliares = ref(null);

const nivelIngresos = ref(null);
const ingresosOptions = ref([
  { name: '1 SBU', code: 'Bajo' },
  { name: '2 SBU', code: 'Medio' },
  { name: '3 SBU', code: 'Alto' }
]);

const ingresosFamiliares = ref('');
const nombreReferencia = ref('');
const telefonoReferencia = ref('');

const items = [
  { label: 'Cédula', value: 'Cédula' },
  { label: 'Pasaporte', value: 'Pasaporte' }
];

const selectedCountry = ref(null);
const countries = ref([
  // América del Sur
  { name: 'Ecuador', code: 'EC' },
  { name: 'Colombia', code: 'CO' },
  { name: 'Venezuela', code: 'VE' },
  { name: 'Perú', code: 'PE' },
  { name: 'Argentina', code: 'AR' },
  { name: 'Bolivia', code: 'BO' },
  { name: 'Brasil', code: 'BR' },
  { name: 'Chile', code: 'CL' },
  { name: 'Guyana', code: 'GY' },
  { name: 'Paraguay', code: 'PY' },
  { name: 'Surinam', code: 'SR' },
  { name: 'Uruguay', code: 'UY' },
  // América del Norte
  { name: 'Estados Unidos', code: 'US' },
  { name: 'Canadá', code: 'CA' },
  { name: 'México', code: 'MX' },
  // América Central
  { name: 'Belice', code: 'BZ' },
  { name: 'Costa Rica', code: 'CR' },
  { name: 'El Salvador', code: 'SV' },
  { name: 'Guatemala', code: 'GT' },
  { name: 'Honduras', code: 'HN' },
  { name: 'Nicaragua', code: 'NI' },
  { name: 'Panamá', code: 'PA' },
  // Caribe
  { name: 'Antigua y Barbuda', code: 'AG' },
  { name: 'Bahamas', code: 'BS' },
  { name: 'Barbados', code: 'BB' },
  { name: 'Cuba', code: 'CU' },
  { name: 'Dominica', code: 'DM' },
  { name: 'República Dominicana', code: 'DO' },
  { name: 'Granada', code: 'GD' },
  { name: 'Haití', code: 'HT' },
  { name: 'Jamaica', code: 'JM' },
  { name: 'San Kitts y Nevis', code: 'KN' },
  { name: 'Santa Lucía', code: 'LC' },
  { name: 'San Vicente y las Granadinas', code: 'VC' },
  { name: 'Trinidad y Tobago', code: 'TT' },
  // Europa (países clave)
  { name: 'Reino Unido', code: 'GB' },
  { name: 'Alemania', code: 'DE' },
  { name: 'Francia', code: 'FR' },
  { name: 'Italia', code: 'IT' },
  { name: 'España', code: 'ES' },
  { name: 'Países Bajos', code: 'NL' },
  // Asia (países clave)
  { name: 'China', code: 'CN' },
  { name: 'India', code: 'IN' },
  { name: 'Japón', code: 'JP' },
  { name: 'Corea del Sur', code: 'KR' },
  { name: 'Indonesia', code: 'ID' },
  { name: 'Arabia Saudita', code: 'SA' },
  // África (países clave)
  { name: 'Egipto', code: 'EG' },
  { name: 'Nigeria', code: 'NG' },
  { name: 'Sudáfrica', code: 'ZA' },
  // Oceanía
  { name: 'Australia', code: 'AU' },
  { name: 'Nueva Zelanda', code: 'NZ' }
]);

const selectedIdType = ref(null);
const idOptions = ref([
  { name: 'C.I (Cédula)', value: 'cedula' },
  { name: 'PA (Pasaporte)', value: 'pasaporte' }
]);
const idNumber = ref('');

const numDoc = ref('');
const tipoCliente = ref('');
const fecha = ref(null);
const consultorio = ref(null);
const materia = ref(null);
const tema = ref(null);
const abogado = ref(null);
const servicio = ref(null);
const derivadoPor = ref(null);
const observacion = ref('');
const evidencias = ref('');

// Opciones de los select
const consultorioOptions = ref([{ name: "Consultorio A" }, { name: "Consultorio B" }]);
const materiaOptions = ref([{ name: "Materia 1" }, { name: "Materia 2" }]);
const temaOptions = ref([{ name: "Tema 1" }, { name: "Tema 2" }]);
const abogadoOptions = ref([{ name: "Abogado 1" }, { name: "Abogado 2" }]);
const servicioOptions = ref([{ name: "Servicio 1" }, { name: "Servicio 2" }]);
const derivadoPorOptions = ref([{ name: "Referencia A" }, { name: "Referencia B" }]);
</script>

<template>
  <!--FORMULARIO-->
  <div class="p-6">
    <!-- Datos Personales -->
    <div class="grid grid-cols-2 gap-4 border-b pb-4">
      <div class="mb-8">
        <h3 class="text-2xl font-semibold text-gray-800 mb-8">Datos Personales</h3>
        <div class="input-spacing grid grid-cols-2 gap-4 mt-4">
          <!-- Grupo de Identificación -->
          <div class="w-full max-w-md mx-auto">
            <div class="flex flex-col sm:flex-row gap-4">
              <!-- Select para Tipo ID -->
              <div class="w-full sm:w-1/3">
                <FloatLabel variant="on" class="w-full">
                  <Select
                    v-model="selectedIdType"
                    inputId="tipoID"
                    :options="idOptions"
                    size="large"
                    optionLabel="name"
                    class="w-full"
                  />
                  <label for="tipoID" >Tipo ID</label>
                </FloatLabel>
              </div>
              <!-- Input para Número de ID -->
              <div class="w-full sm:w-2/3">
                <FloatLabel variant="on" class="w-full">
                  <InputText
                    id="idNumber"
                    v-model="idNumber"
                    size="large"
                    class="w-full"
                  />
                  <label for="idNumber" >Número de ID</label>
                </FloatLabel>
              </div>
            </div>
          </div>
          <!-- Checkbox de Discapacidad -->
          <div class="flex items-center gap-2 ml-10">
            <Checkbox v-model="discapacidad" binary />
            <label class="text-gray-600">¿Discapacidad?</label>
          </div>
          <!-- Nombres -->
          <FloatLabel variant="on" class="w-full">
            <InputText id="nombres" v-model="nombres" size="large" class="w-full" />
            <label for="nombres" >Nombres</label>
          </FloatLabel>
          <!-- Apellidos -->
          <FloatLabel variant="on" class="w-full">
            <InputText id="apellidos" v-model="apellidos" size="large" class="w-full" />
            <label for="apellidos" >Apellidos</label>
          </FloatLabel>
          <!-- Sexo -->
          <FloatLabel variant="on" class="w-full">
            <Select
              v-model="sexo"
              inputId="sexo"
              :options="sexoOptions"
              size="large"
              optionLabel="name"
              class="w-full"
            />
            <label for="sexo" >Sexo</label>
          </FloatLabel>
          <!-- Fecha de Nacimiento -->
          <FloatLabel variant="on" class="w-full">
            <DatePicker
              v-model="fechaNacimiento"
              inputId="fechaNacimiento"
              showIcon
              iconDisplay="input"
              size="large"
              class="w-full"
            />
            <label for="fechaNacimiento" >Fecha de Nacimiento</label>
          </FloatLabel>
          <!-- Nacionalidad (sin modificar íconos) -->
          <FloatLabel variant="on" class="w-full">
            <Select
              v-model="selectedCountry"
              inputId="nacionalidad"
              :options="countries"
              filter
              optionLabel="name"
              size="large"
              placeholder="ㅤ"
              class="w-full"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center">
                  <img :alt="slotProps.value.label" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`mr-2 flag flag-${slotProps.value.code.toLowerCase()}`" style="width: 18px" />
                  <div>{{ slotProps.value.name }}</div>
                </div>
                <span v-else>
                  {{ slotProps.placeholder }}
                </span>
              </template>
              <template #option="slotProps">
                <div class="flex items-center">
                  <img :alt="slotProps.option.label" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`mr-2 flag flag-${slotProps.option.code.toLowerCase()}`" style="width: 18px" />
                  <div>{{ slotProps.option.name }}</div>
                </div>
              </template>
            </Select>
            <label for="nacionalidad" >Nacionalidad</label>
          </FloatLabel>
          <!-- Etnia -->
          <FloatLabel variant="on" class="w-full">
            <Select
              v-model="etnia"
              inputId="etnia"
              :options="etniaOptions"
              size="large"
              optionLabel="name"
              class="w-full"
            />
            <label for="etnia" >Etnia</label>
          </FloatLabel>
        </div>
      </div>
      <!-- Sección de Contacto centrada -->
      <div>
        <h3 class="text-2xl font-semibold text-gray-800 ml-25 mb-8">Contacto</h3>
        <div class="input-spacing grid grid-cols-1 gap-4 mx-auto" style="max-width: 400px;">
          <FloatLabel variant="on" class="w-full">
            <InputMask
              id="telefono"
              v-model="telefono"
              size="large"
              class="w-full md:w-120"
              mask="(999)-999-9999"
            />
            <label for="telefono" >Teléfono</label>
          </FloatLabel>
          <FloatLabel variant="on" class="w-full">
            <InputText
              id="email"
              v-model="email"
              size="large"
              class="w-full md:w-120"
            />
            <label for="email" >Email</label>
          </FloatLabel>
          <FloatLabel variant="on" class="w-full">
            <InputText
              id="direccion"
              v-model="direccion"
              size="large"
              class="w-full md:w-120"
            />
            <label for="direccion" >Dirección</label>
          </FloatLabel>
          <!-- Grid para Sector y Zona con ligero margin-right -->
          <div class="grid grid-cols-2 gap-y-15 gap-x-15 mx-auto" style="max-width: 400px;">
            <FloatLabel variant="on" class="w-full">
              <InputText
                id="sector"
                v-model="sector"
                size="large"
                class="w-full md:w-55"
              />
              <label for="sector">Sector</label>
            </FloatLabel>
            <FloatLabel variant="on" class="w-full">
              <Select
                v-model="zona"
                inputId="zona"
                :options="zonaOptions"
                size="large"
                optionLabel="name"
                class="w-full md:w-55"
              />
              <label for="zona">Zona</label>
            </FloatLabel>
          </div>

        </div>
      </div>
    </div>
    <!-- Datos Demográficos y Contacto de Referencia -->
    <div class="grid grid-cols-2 gap-4 border-b py-4 mb-3">
      <!-- Datos Demográficos -->
      <div>
        <h3 class="text-2xl font-semibold text-gray-800 mb-8">Datos Demográficos</h3>
        <div class="input-spacing grid grid-cols-3 gap-4">
          <div class="flex items-center gap-2">
            <Checkbox v-model="recibeBono" binary />
            <label class="text-gray-600">¿Recibe bono?</label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox v-model="casaPropia" binary />
            <label class="text-gray-600">¿Casa Propia?</label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox v-model="vehiculoPropio" binary />
            <label class="text-gray-600">¿Vehículo Propio?</label>
          </div>
        </div>
        <div class="input-spacing grid grid-cols-2 gap-4 mt-4">
  <!-- Instrucción -->
  <FloatLabel variant="on" class="w-full">
    <Select
      v-model="instruccion"
      inputId="instruccion"
      :options="instruccionOptions"

      size="large"
      optionLabel="name"
      class="w-full"
    />
    <label for="instruccion">Instrucción</label>
  </FloatLabel>

  <!-- Ocupación -->
  <FloatLabel variant="on" class="w-full">
    <Select
      v-model="ocupacion"
      inputId="ocupacion"
      :options="ocupacionOptions"
      size="large"
      optionLabel="name"
      class="w-full"
    />
    <label for="ocupacion">Ocupación</label>
  </FloatLabel>

  <!-- Estado Civil -->
  <FloatLabel variant="on" class="w-full">
    <Select
      v-model="estadoCivil"
      inputId="estadoCivil"
      :options="estadoCivilOptions"
      size="large"
      optionLabel="name"
      class="w-full"
    />
    <label for="estadoCivil">Estado Civil</label>
  </FloatLabel>

  <!-- Cargas Familiares -->
  <FloatLabel variant="on">
    <InputNumber v-model="cargasFamiliares" inputId="on_label" mode="decimal"  showButtons :min="0" :max="12" fluid size="large" class="w-full"/>
    <label for="on_label">Cargas Familiares</label>
  </FloatLabel>

  <!-- Nivel de Ingresos -->
  <FloatLabel variant="on" class="w-full">
    <Select
      v-model="nivelIngresos"
      inputId="nivelIngresos"
      :options="ingresosOptions"
      size="large"
      optionLabel="name"
      class="w-full"
    />
    <label for="nivelIngresos">Nivel de Ingresos</label>
  </FloatLabel>

  <!-- Ingresos Familiares -->
  <FloatLabel variant="on">
    <InputNumber v-model="value3" inputId="on_label" mode="currency" currency="USD" locale="en-US" size="large" class="w-full" />
    <label for="on_label">Ingresos Familiares</label>
  </FloatLabel>
</div>

      </div>
      <!-- Contacto de Referencia -->
      <div>
        <h3 class="text-2xl font-semibold text-gray-800 ml-25 mb-18">Contacto de Referencia</h3>
        <div class="input-spacing grid grid-cols-1 gap-4 mx-auto" style="max-width: 400px;">
          <FloatLabel variant="on">
            <InputText id="nombres" v-model="nombres" size="large" class="md:w-120" />
            <label for="nombres" >Nombre de Referencia</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <InputMask
              id="telefono"
              v-model="telefono"
              size="large"
              class="w-full md:w-120"
              mask="(999)-999-9999"
            />
            <label for="telefono" >Teléfono de Referencia</label>
          </FloatLabel>
          </div>
      </div>
    </div>
  </div>

  <!--TABS -->
    <div class="card">
        <Tabs value="0">
            <TabList>
                <Tab value="0">Asesorias</Tab>
                <Tab value="1">Patrocinios</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                  <div class="p-6">
                          <div class="grid grid-cols-3 gap-4">
                            <!-- Número de Doc. Asignado -->
                            <FloatLabel variant="on" class="w-full">
                              <InputText id="numDoc" v-model="numDoc" class="w-full" size="large"/>
                              <label for="numDoc">Número de Doc. Asignado</label>
                            </FloatLabel>

                            <!-- Tipo de Cliente -->
                            <FloatLabel variant="on" class="w-full">
                              <InputText id="tipoCliente" v-model="tipoCliente" class="w-full" size="large"/>
                              <label for="tipoCliente">Tipo de Cliente</label>
                            </FloatLabel>

                            <!-- Fecha -->
                            <FloatLabel variant="on" class="w-full">
                              <Calendar id="fecha" v-model="fecha" showIcon class="w-full" size="large" />
                              <label for="fecha">Fecha</label>
                            </FloatLabel>
                            
                            <!-- Consultorio -->
                            <FloatLabel variant="on" class="w-full">
                              <Dropdown v-model="consultorio" :options="consultorioOptions" optionLabel="name" class="w-full" size="large" />
                              <label for="consultorio">Consultorio</label>
                            </FloatLabel>

                            <!-- Materia -->
                            <FloatLabel variant="on" class="w-full">
                              <Dropdown v-model="materia" :options="materiaOptions" optionLabel="name" class="w-full" size="large"/>
                              <label for="materia">Materia</label>
                            </FloatLabel>

                            <!-- Tema -->
                            <FloatLabel variant="on" class="w-full">
                              <Dropdown v-model="tema" :options="temaOptions" optionLabel="name" class="w-full" size="large"/>
                              <label for="tema">Tema</label>
                            </FloatLabel>

                            <!-- Abogado -->
                            <FloatLabel variant="on" class="w-full">
                              <Dropdown v-model="abogado" :options="abogadoOptions" optionLabel="name" class="w-full" size="large"/>
                              <label for="abogado">Abogado</label>
                            </FloatLabel>

                            <!-- Servicio -->
                            <FloatLabel variant="on" class="w-full">
                              <Dropdown v-model="servicio" :options="servicioOptions" optionLabel="name" class="w-full" size="large"/>
                              <label for="servicio">Servicio</label>
                            </FloatLabel>

                            <!-- Derivado por -->
                            <FloatLabel variant="on" class="w-full">
                              <Dropdown v-model="derivadoPor" :options="derivadoPorOptions" optionLabel="name" class="w-full" size="large"/>
                              <label for="derivadoPor">Derivado por</label>
                            </FloatLabel>
                          </div>

                          <!-- Observación y Evidencias -->
                          <div class="grid grid-cols-2 gap-4 mt-6">
                            <!-- Observación -->
                            <div>
                              <label for="observacion" class="text-gray-600">Observación</label>
                              <Textarea id="observacion" v-model="observacion" size="large" class="w-full h-80" />
                            </div>

                            <!-- Evidencias -->
                            <div>
                              <label for="archivo" class="text-gray-600">Evidencias</label>
                                                                    <FileUpload id="archivo" name="demo[]" class="w-full h-80" url="/api/upload" @upload="onTemplatedUpload($event)" :multiple="true" accept="image/*" :maxFileSize="1000000" @select="onSelectedFiles">
                                          <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
                                              <div class="flex flex-wrap justify-between items-center flex-1 gap-4">
                                                  <div class="flex gap-2">
                                                      <Button @click="chooseCallback()" icon="pi pi-images" rounded outlined severity="secondary"></Button>
                                                      <Button @click="uploadEvent(uploadCallback)" icon="pi pi-cloud-upload" rounded outlined severity="success" :disabled="!files || files.length === 0"></Button>
                                                      <Button @click="clearCallback()" icon="pi pi-times" rounded outlined severity="danger" :disabled="!files || files.length === 0"></Button>
                                                  </div>
                                                  <ProgressBar :value="totalSizePercent" :showValue="false" class="md:w-20rem h-1 w-full md:ml-auto">
                                                      <span class="whitespace-nowrap">{{ totalSize }}B / 1Mb</span>
                                                  </ProgressBar>
                                              </div>
                                          </template>
                                          <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback, messages }">
                                              <div class="flex flex-col gap-8 pt-4">
                                                  <Message v-for="message of messages" :key="message" :class="{ 'mb-8': !files.length && !uploadedFiles.length}" severity="error">
                                                      {{ message }}
                                                  </Message>

                                                  <div v-if="files.length > 0">
                                                      <h5>Pending</h5>
                                                      <div class="flex flex-wrap gap-4">
                                                          <div v-for="(file, index) of files" :key="file.name + file.type + file.size" class="p-8 rounded-border flex flex-col border border-surface items-center gap-4">
                                                              <div>
                                                                  <img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" />
                                                              </div>
                                                              <span class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">{{ file.name }}</span>
                                                              <div>{{ formatSize(file.size) }}</div>
                                                              <Badge value="Pending" severity="warn" />
                                                              <Button icon="pi pi-times" @click="onRemoveTemplatingFile(file, removeFileCallback, index)" outlined rounded severity="danger" />
                                                          </div>
                                                      </div>
                                                  </div>

                                                  <div v-if="uploadedFiles.length > 0">
                                                      <h5>Completed</h5>
                                                      <div class="flex flex-wrap gap-4">
                                                          <div v-for="(file, index) of uploadedFiles" :key="file.name + file.type + file.size" class="p-8 rounded-border flex flex-col border border-surface items-center gap-4">
                                                              <div>
                                                                  <img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" />
                                                              </div>
                                                              <span class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">{{ file.name }}</span>
                                                              <div>{{ formatSize(file.size) }}</div>
                                                              <Badge value="Completed" class="mt-4" severity="success" />
                                                              <Button icon="pi pi-times" @click="removeUploadedFileCallback(index)" outlined rounded severity="danger" />
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          </template>
                                          <template #empty>
                                              <div class="flex items-center justify-center flex-col">
                                                  <i class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl !text-muted-color" />
                                                  <p class="mt-6 mb-0">Arrastra y suelta los archivos aquí para subirlos.</p>
                                              </div>
                                          </template>
                                      </FileUpload>
                            </div>
                          </div>
                        </div>
                </TabPanel>
                <TabPanel value="1">
                    <p class="m-0">
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
                        ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
                    </p>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>

    <div class="flex justify-center mt-8 mr-40">
      <Button label="Crear Caso" icon="pi pi-check" iconPos="right" />
    </div>
    


</template>

<style scoped>
.border-b {
  border-bottom: 1px solid #E5E7EB;
}

.input-spacing > :not(:last-child) {
  margin-bottom: 4px;
}
</style>
