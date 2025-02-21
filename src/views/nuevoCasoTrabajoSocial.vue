<script setup lang="ts">

</script>

<template>
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <div class="bg-white shadow-lg rounded-lg">
        <!-- Encabezado -->
        <div class="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
          <h1 class="text-2xl font-bold text-center">ÁREA DE TRABAJO SOCIAL</h1>
          <h2 class="text-xl text-center mt-2">Ficha de Ingreso y Registro de Caso</h2>
        </div>
  
        <div class="p-6">
          <form @submit.prevent="guardarCaso">
            <!-- Información inicial del caso -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Número de proceso</label>
                <input 
                  type="text" 
                  v-model="caso.numeroProceso" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Área de remisión del caso</label>
                <input 
                  type="text" 
                  v-model="caso.areaRemision" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Fecha de ingreso trabajo social</label>
                <input 
                  type="date" 
                  v-model="caso.fechaIngreso" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
  
            <!-- Pedidos -->
            <div class="grid grid-cols-1 gap-6 mb-8">
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Pedido del usuario</label>
                <textarea 
                  v-model="caso.pedidoUsuario" 
                  rows="3"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Pedido del área de remisión</label>
                <textarea 
                  v-model="caso.pedidoRemision" 
                  rows="3"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
  
            <!-- Datos del usuario -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-4">Datos del usuario</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Nombres y apellidos</label>
                  <input 
                    type="text" 
                    v-model="caso.usuario.nombres" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Edad</label>
                  <input 
                    type="number" 
                    v-model="caso.usuario.edad" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Estado Civil</label>
                  <select 
                    v-model="caso.usuario.estadoCivil" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione</option>
                    <option value="Soltero/a">Soltero/a</option>
                    <option value="Casado/a">Casado/a</option>
                    <option value="Unión libre">Unión libre</option>
                    <option value="Divorciado/a">Divorciado/a</option>
                    <option value="Viudo/a">Viudo/a</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Ocupación</label>
                  <input 
                    type="text" 
                    v-model="caso.usuario.ocupacion" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Dirección del trabajo</label>
                  <input 
                    type="text" 
                    v-model="caso.usuario.direccionTrabajo" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Teléfono</label>
                  <input 
                    type="tel" 
                    v-model="caso.usuario.telefono" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Dirección domiciliaria</label>
                  <input 
                    type="text" 
                    v-model="caso.usuario.direccionDomicilio" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Teléfono de referencia</label>
                  <input 
                    type="tel" 
                    v-model="caso.usuario.telefonoReferencia" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">No. Documento</label>
                  <input 
                    type="text" 
                    v-model="caso.usuario.documento" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
  
            <!-- Composición de grupo de convivencia -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-4">Composición de grupo de convivencia</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th class="py-2 px-4 border-b border-r">Nombre</th>
                      <th class="py-2 px-4 border-b border-r">Edad</th>
                      <th class="py-2 px-4 border-b border-r">Parentesco</th>
                      <th class="py-2 px-4 border-b border-r">Ocupación</th>
                      <th class="py-2 px-4 border-b">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(miembro, index) in caso.grupoConvivencia" :key="index" class="hover:bg-gray-50">
                      <td class="py-2 px-4 border-b border-r">
                        <input 
                          type="text" 
                          v-model="miembro.nombre" 
                          class="w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td class="py-2 px-4 border-b border-r">
                        <input 
                          type="number" 
                          v-model="miembro.edad" 
                          class="w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td class="py-2 px-4 border-b border-r">
                        <input 
                          type="text" 
                          v-model="miembro.parentesco" 
                          class="w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td class="py-2 px-4 border-b border-r">
                        <input 
                          type="text" 
                          v-model="miembro.ocupacion" 
                          class="w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td class="py-2 px-4 border-b text-center">
                        <button 
                          type="button"
                          @click="eliminarMiembro(index)"
                          class="text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button 
                type="button"
                @click="agregarMiembro"
                class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
              >
                Agregar persona
              </button>
            </div>
  
            <!-- Discapacidad -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-4">Miembros del círculo familiar con discapacidad</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Tipo</label>
                  <input 
                    type="text" 
                    v-model="caso.discapacidad.tipo" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Porcentaje</label>
                  <input 
                    type="number" 
                    v-model="caso.discapacidad.porcentaje" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group flex items-center">
                  <label class="block text-gray-700 font-medium mr-4">Carnet:</label>
                  <div class="flex items-center space-x-4">
                    <label class="inline-flex items-center">
                      <input 
                        type="radio" 
                        v-model="caso.discapacidad.carnet" 
                        :value="true"
                        class="form-radio h-5 w-5 text-blue-600"
                      />
                      <span class="ml-2">Sí</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input 
                        type="radio" 
                        v-model="caso.discapacidad.carnet" 
                        :value="false"
                        class="form-radio h-5 w-5 text-blue-600"
                      />
                      <span class="ml-2">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Violencia y consumo -->
            <div class="mb-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Episodios de Violencia</label>
                  <textarea 
                    v-model="caso.episodiosViolencia" 
                    rows="3"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Denuncias</label>
                  <textarea 
                    v-model="caso.denuncias" 
                    rows="3"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
              <h4 class="text-md font-medium mt-4 mb-2">Consumo de:</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Alcohol</label>
                  <textarea 
                    v-model="caso.consumoAlcohol" 
                    rows="2"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Drogas</label>
                  <textarea 
                    v-model="caso.consumoDrogas" 
                    rows="2"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
            </div>
  
            <!-- Situación económica -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-4">Situación económica</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Ingresos</label>
                  <input 
                    type="number" 
                    step="0.01"
                    v-model="caso.ingresos" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <h4 class="text-md font-medium mb-2">Vivienda</h4>
                  <div class="space-y-2">
                    <label class="inline-flex items-center">
                      <input 
                        type="radio" 
                        v-model="caso.tipoVivienda" 
                        value="propia"
                        class="form-radio h-5 w-5 text-blue-600"
                      />
                      <span class="ml-2">Vivienda propia</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input 
                        type="radio" 
                        v-model="caso.tipoVivienda" 
                        value="arrendada"
                        class="form-radio h-5 w-5 text-blue-600"
                      />
                      <span class="ml-2">Vivienda arrendada</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input 
                        type="radio" 
                        v-model="caso.tipoVivienda" 
                        value="familiar"
                        class="form-radio h-5 w-5 text-blue-600"
                      />
                      <span class="ml-2">Vivienda familiar</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Datos de la contraparte -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-4">Datos de la contraparte</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Nombres y apellidos</label>
                  <input 
                    type="text" 
                    v-model="caso.contraparte.nombres" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Edad</label>
                  <input 
                    type="number" 
                    v-model="caso.contraparte.edad" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Estado Civil</label>
                  <select 
                    v-model="caso.contraparte.estadoCivil" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione</option>
                    <option value="Soltero/a">Soltero/a</option>
                    <option value="Casado/a">Casado/a</option>
                    <option value="Unión libre">Unión libre</option>
                    <option value="Divorciado/a">Divorciado/a</option>
                    <option value="Viudo/a">Viudo/a</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Ocupación</label>
                  <input 
                    type="text" 
                    v-model="caso.contraparte.ocupacion" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Dirección domiciliaria</label>
                  <input 
                    type="text" 
                    v-model="caso.contraparte.direccionDomicilio" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Teléfono</label>
                  <input 
                    type="tel" 
                    v-model="caso.contraparte.telefono" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">C.I.</label>
                  <input 
                    type="text" 
                    v-model="caso.contraparte.ci" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="form-group">
                  <label class="block text-gray-700 font-medium mb-2">Relación con el usuario</label>
                  <input 
                    type="text" 
                    v-model="caso.contraparte.relacion" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div class="form-group mt-4">
                <label class="block text-gray-700 font-medium mb-2">¿El caso ha sido conocido anteriormente por esta u otra institución?</label>
                <textarea 
                  v-model="caso.casoConocidoAnteriormente" 
                  rows="3"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
  
            <!-- Relato de los hechos -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-4">Relato de los hechos</h3>
              <div class="form-group">
                <textarea 
                  v-model="caso.relatoHechos" 
                  rows="6"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
  
            <!-- Botones de acción -->
            <div class="flex justify-end gap-4">
              <button 
                type="button"
                @click="limpiarFormulario"
                class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
              >
                Guardar caso
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  
  interface Miembro {
    nombre: string;
    edad: number | null;
    parentesco: string;
    ocupacion: string;
  }
  
  interface Persona {
    nombres: string;
    edad: number | null;
    estadoCivil: string;
    ocupacion: string;
    direccionTrabajo?: string;
    telefono: string;
    direccionDomicilio: string;
    telefonoReferencia?: string;
    documento?: string;
    ci?: string;
    relacion?: string;
  }
  
  interface Discapacidad {
    tipo: string;
    porcentaje: number | null;
    carnet: boolean | null;
  }
  
  interface Caso {
    numeroProceso: string;
    areaRemision: string;
    fechaIngreso: string;
    pedidoUsuario: string;
    pedidoRemision: string;
    usuario: Persona;
    grupoConvivencia: Miembro[];
    discapacidad: Discapacidad;
    episodiosViolencia: string;
    denuncias: string;
    consumoAlcohol: string;
    consumoDrogas: string;
    ingresos: number | null;
    tipoVivienda: string;
    contraparte: Persona;
    casoConocidoAnteriormente: string;
    relatoHechos: string;
  }
  
  export default defineComponent({
    name: 'FormularioNuevoCaso',
    setup() {
      const casoInicial = (): Caso => {
        return {
          numeroProceso: '',
          areaRemision: '',
          fechaIngreso: '',
          pedidoUsuario: '',
          pedidoRemision: '',
          usuario: {
            nombres: '',
            edad: null,
            estadoCivil: '',
            ocupacion: '',
            direccionTrabajo: '',
            telefono: '',
            direccionDomicilio: '',
            telefonoReferencia: '',
            documento: ''
          },
          grupoConvivencia: [
            {
              nombre: '',
              edad: null,
              parentesco: '',
              ocupacion: ''
            }
          ],
          discapacidad: {
            tipo: '',
            porcentaje: null,
            carnet: null
          },
          episodiosViolencia: '',
          denuncias: '',
          consumoAlcohol: '',
          consumoDrogas: '',
          ingresos: null,
          tipoVivienda: '',
          contraparte: {
            nombres: '',
            edad: null,
            estadoCivil: '',
            ocupacion: '',
            direccionDomicilio: '',
            telefono: '',
            ci: '',
            relacion: ''
          },
          casoConocidoAnteriormente: '',
          relatoHechos: ''
        };
      };
  
      const caso = ref<Caso>(casoInicial());
  
      const agregarMiembro = () => {
        caso.value.grupoConvivencia.push({
          nombre: '',
          edad: null,
          parentesco: '',
          ocupacion: ''
        });
      };
  
      const eliminarMiembro = (index: number) => {
        caso.value.grupoConvivencia.splice(index, 1);
        // Asegurarse de que siempre haya al menos un registro
        if (caso.value.grupoConvivencia.length === 0) {
          agregarMiembro();
        }
      };
  
      const guardarCaso = () => {
        // Aquí iría la lógica para guardar el caso
        console.log('Caso guardado:', caso.value);
        // Normalmente aquí harías una llamada a la API
  
        // Mostrar mensaje de éxito
        alert('Caso guardado correctamente');
      };
  
      const limpiarFormulario = () => {
        caso.value = casoInicial();
      };
  
      return {
        caso,
        agregarMiembro,
        eliminarMiembro,
        guardarCaso,
        limpiarFormulario
      };
    }
  });
</script>

<style scoped>

</style>