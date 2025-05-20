<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="bg-white shadow-lg rounded-lg">
      <!-- Encabezado -->
      <div class="bg-[#164284] text-white px-6 py-4 rounded-t-lg">
        <h1 class="text-2xl font-bold text-center">ÁREA DE TRABAJO SOCIAL</h1>
        <h2 class="text-xl text-center mt-2">Ficha de Ingreso y Registro de Caso</h2>
      </div>

      <div class="p-6">
         <!-- Notification for archived cases -->
         <div v-if="isFormLocked" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6 rounded">
          <p class="font-bold">Caso Archivado</p>
          <p>Este caso ha sido archivado y no se pueden realizar cambios.</p>
        </div>
        <form @submit.prevent="actualizarCaso">
          <!-- Información inicial del caso -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="form-group">
              <label class="block text-gray-700 font-medium mb-2">Número de proceso</label>
              <input 
                type="text" 
                v-model="caso.numeroProceso" 
                class="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                disabled
                :disabled="isFormLocked"
              />
            </div>
            <div class="form-group">
              <label class="block text-gray-700 font-medium mb-2">Área de remisión del caso</label>
              <input 
                type="text" 
                v-model="caso.areaRemision" 
                class="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                disabled
                :disabled="isFormLocked"
              />
            </div>
            <div class="form-group">
              <label class="block text-gray-700 font-medium mb-2">Fecha de ingreso trabajo social</label>
              <input 
                type="date" 
                v-model="caso.fechaIngreso" 
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="isFormLocked"
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
                required
                :disabled="isFormLocked"
              ></textarea>
            </div>
            <div class="form-group">
              <label class="block text-gray-700 font-medium mb-2">Pedido del área de remisión</label>
              <textarea 
                v-model="caso.pedidoRemision" 
                rows="3"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                :disabled="isFormLocked"
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
                  class="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                  disabled
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Edad</label>
                <input 
                  type="number" 
                  v-model="caso.usuario.edad" 
                  class="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                  disabled
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Estado Civil</label>
                <input 
                  type="text"
                  v-model="caso.usuario.estadoCivil" 
                  class="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                  disabled
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Ocupación</label>
                <input 
                  type="text" 
                  v-model="caso.usuario.ocupacion" 
                  class="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                  disabled
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Lugar del Trabajo</label>
                <input 
                  type="text" 
                  v-model="caso.usuario.direccionTrabajo" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Teléfono</label>
                <input 
                  type="tel" 
                  v-model="caso.usuario.telefono" 
                  class="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                  disabled
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Dirección domiciliaria</label>
                <input 
                  type="text" 
                  v-model="caso.usuario.direccionDomicilio" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Teléfono de referencia</label>
                <input 
                  type="tel" 
                  v-model="caso.usuario.telefonoReferencia" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">No. Documento</label>
                <input 
                  type="text" 
                  v-model="caso.usuario.documento" 
                  class="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                  disabled
                  :disabled="isFormLocked"
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
                    <th class="py-2 px-4 border-b border-r">Notas</th>
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
                        :disabled="isFormLocked"
                      />
                    </td>
                    <td class="py-2 px-4 border-b border-r">
                      <input 
                        type="number" 
                        v-model="miembro.edad" 
                        class="w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        :disabled="isFormLocked"
                      />
                    </td>
                    <td class="py-2 px-4 border-b border-r">
                      <input 
                        type="text" 
                        v-model="miembro.parentesco" 
                        class="w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        :disabled="isFormLocked"
                      />
                    </td>
                    <td class="py-2 px-4 border-b border-r">
                      <input 
                        type="text" 
                        v-model="miembro.ocupacion" 
                        class="w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        :disabled="isFormLocked"
                      />
                    </td>
                    <td class="py-2 px-4 border-b border-r text-center">
                      <button 
                      type="button"
                      @click="openNotasModal(index)"
                      class="px-3 py-1 bg-[#164284] text-white rounded hover:bg-blue-500"
                    >
                      {{ miembro.notas ? 'Ver Notas' : 'Agregar Notas' }}
                    </button>
                    </td>
                    <td class="py-2 px-4 border-b text-center">
                      <button 
                        type="button"
                        @click="eliminarMiembro(index)"
                        class="text-red-500 hover:text-red-700"
                        :disabled="isFormLocked"
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
              class="mt-4 px-4 py-2 bg-[#164284] text-white rounded-lg hover:bg-blue-500 focus:outline-none"
              :disabled="isFormLocked"
            >
              Agregar persona
            </button>
          </div>

          <!-- Notas Modal -->
          <teleport to="body">
            <div 
              v-if="notasModalVisible" 
              class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
              @click.self="closeNotasModal"
            >
              <div 
                class="bg-white rounded-lg shadow-xl w-11/12 max-w-2xl max-h-[90vh] flex flex-col"
                @click.stop
              >
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 class="text-xl font-semibold">
                    Notas para {{ caso.grupoConvivencia[selectedMemberIndex]?.nombre }}
                  </h2>
                  <button 
                    @click="closeNotasModal"
                    class="text-gray-600 hover:text-gray-900"
                  >
                    ✕
                  </button>
                </div>
                
                <div class="p-6 flex-grow">
                  <textarea 
                    v-model="caso.grupoConvivencia[selectedMemberIndex].notas"
                    rows="10"
                    class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Escriba aquí sus notas o transcripción de entrevista..."
                    :disabled="isFormLocked"
                  ></textarea>
                </div>
                
                <div class="p-6 border-t border-gray-200 flex justify-end space-x-4">
                  <button 
                    @click="closeNotasModal"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button 
                    @click="saveNotasModal"
                    class="px-4 py-2 bg-[#164284] text-white rounded-lg hover:bg-blue-500"
                    :disabled="isFormLocked"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </teleport>

          <!-- Rest of the form remains the same with editable fields -->
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
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Porcentaje</label>
                <input 
                  type="number" 
                  v-model="caso.discapacidad.porcentaje" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  max="100" 
                  @input="validatePercentage"
                  :disabled="isFormLocked"
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
                      :disabled="isFormLocked"
                    />
                    <span class="ml-2">Sí</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input 
                      type="radio" 
                      v-model="caso.discapacidad.carnet" 
                      :value="false"
                      class="form-radio h-5 w-5 text-blue-600"
                      :disabled="isFormLocked"
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
                  :disabled="isFormLocked"
                ></textarea>
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Denuncias</label>
                <textarea 
                  v-model="caso.denuncias" 
                  rows="3"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isFormLocked"
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
                  :disabled="isFormLocked"
                ></textarea>
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Drogas</label>
                <textarea 
                  v-model="caso.consumoDrogas" 
                  rows="2"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isFormLocked"
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
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Vivienda</label>
                <select 
                  v-model="caso.tipoVivienda" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isFormLocked"
                >
                  <option value="">Seleccione</option>
                  <option 
                    v-for="type in housingTypes" 
                    :key="type.id" 
                    :value="type.name"
                  >
                    {{ type.name }}
                  </option>
                </select>
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
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Edad</label>
                <input 
                  type="number" 
                  v-model="caso.contraparte.edad" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Estado Civil</label>
                <select 
                  v-model="caso.contraparte.estadoCivil" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isFormLocked"
                >
                  <option value="">Seleccione</option>
                  <option 
                    v-for="status in civilStatuses" 
                    :key="status.id" 
                    :value="status.name"
                  >
                    {{ status.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Ocupación</label>
                <input 
                  type="text" 
                  v-model="caso.contraparte.ocupacion" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Dirección domiciliaria</label>
                <input 
                  type="text" 
                  v-model="caso.contraparte.direccionDomicilio" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Teléfono</label>
                <input 
                  type="tel" 
                  v-model="caso.contraparte.telefono" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">C.I.</label>
                <input 
                  type="text" 
                  v-model="caso.contraparte.ci" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Relación con el usuario</label>
                <input 
                  type="text" 
                  v-model="caso.contraparte.relacion" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isFormLocked"
                />
              </div>
            </div>
            <div class="form-group mt-4">
              <label class="block text-gray-700 font-medium mb-2">¿El caso ha sido conocido anteriormente por esta u otra institución?</label>
              <textarea 
                v-model="caso.casoConocidoAnteriormente" 
                rows="3"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="isFormLocked"
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
                :disabled="isFormLocked"
              ></textarea>
            </div>
          </div>
          <div class="mb-8">
            <h3 class="text-lg font-semibold border-b-2 border-gray-300 pb-2 mb-4">Observaciones</h3>
            <div class="form-group">
              <textarea 
                v-model="caso.observaciones" 
                rows="4"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="isFormLocked"
                placeholder="Escriba aquí sus observaciones..."
              ></textarea>
            </div>
          </div>
          
          <!-- Botones de acción -->
          <div class="flex justify-end gap-4">
            <button 
              type="button"
              @click="irATrabajoSocialCasos"
              class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
            >
              Cancelar
            </button>
            <button 
            type="submit"
            class="px-6 py-2 bg-[#164284] text-white rounded-lg hover:bg-blue-700 focus:outline-none"
            :disabled="isFormLocked"
            v-if="!isFormLocked"
          >
            Guardar caso
          </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

  
<script>
import { useToast } from "primevue/usetoast";

export default {
  name: 'SocialWorkCaseForm',
  data() {
    
    const toast = useToast();
    return {
      caso: {
        numeroProceso: '',
        areaRemision: '',
        fechaIngreso: '',
        pedidoUsuario: '',
        pedidoRemision: '',
        usuario: {
          nombres: '',
          edad: '',
          estadoCivil: '',
          ocupacion: '',
          direccionTrabajo: '',
          telefono: '',
          direccionDomicilio: '',
          telefonoReferencia: '',
          documento: ''
        },
        grupoConvivencia: [],
        discapacidad: {
          tipo: '',
          porcentaje: null,
          carnet: false
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
        relatoHechos: '',
        observaciones: ''
      },
      isLoading: false,
      error: null,
      notasModalVisible: false, 
      selectedMemberIndex: null,  
      housingTypes: [],
      civilStatuses: [],
      toast
    };
  },
  computed: {
    isFormLocked() {
      return this.caso.SW_Status === 'Archivado';
    },
  },
  async created() {
    const { casoId, userId, internalId } = this.$route.query;

    if (casoId && userId && internalId) {
      await this.cargarCaso(casoId, userId, internalId);
    } else {
      this.error = 'Faltan parámetros en la URL.';
    }

    //Fetch dropdown options from the API
    await this.fetchHousingTypes();
    await this.fetchCivilStatuses();
  },
  methods: {
    async fetchHousingTypes() {
      try {
        const response = await fetch('http://localhost:3000/type-of-housing'
          , {credentials: 'include',}
        );
        if (!response.ok) throw new Error('Error fetching housing types');
        
        const data = await response.json();
        console.log('Raw housing types response:', data);
        
        // Filter to only include items where Type_Of_Housing_Status is true
        // AND map the API properties to what the template expects
        this.housingTypes = data
          .filter(item => item.Type_Of_Housing_Status === true)
          .map(item => ({
            id: item.Type_Of_Housing_ID,
            name: item.Type_Of_Housing_Name
          }));
        
        console.log('Transformed housing types:', this.housingTypes);
      } catch (error) {
        console.error('Error in fetchHousingTypes:', error);
      }
    },
    async fetchCivilStatuses() {
      try {
        const response = await fetch('http://localhost:3000/civil-statuses'
          , {credentials:'include'}
        );
        if (!response.ok) throw new Error('Error fetching civil statuses');
        
        const data = await response.json();
        console.log('Raw civil statuses response:', data);
        
        // Filter to only include items where Civil_Status_Status is true
        // AND map the API properties to what the template expects
        this.civilStatuses = data
          .filter(item => item.Civil_Status_Status === true)
          .map(item => ({
            id: item.Civil_Status_ID,
            name: item.Civil_Status_Name
          }));
        
        console.log('Transformed civil statuses:', this.civilStatuses);
      } catch (error) {
        console.error('Error in fetchCivilStatuses:', error);
      }
    },
    validatePercentage() {
      if (this.caso.discapacidad.porcentaje > 100) {
        this.caso.discapacidad.porcentaje = 100; // Cap the value at 100
        this.toast.add({
          severity: "warn",
          summary: "Porcentaje ajustado",
          detail: "El porcentaje no puede ser mayor a 100.",
          life: 3000,
        });
      } else if (this.caso.discapacidad.porcentaje < 0) {
        this.caso.discapacidad.porcentaje = 0; // Ensure the value is not negative
        this.toast.add({
          severity: "warn",
          summary: "Porcentaje ajustado",
          detail: "El porcentaje no puede ser negativo.",
          life: 3000,
        });
      }
    },
    validateID(ID) {
      if (!/^\d{10}$/.test(ID)) {
        this.toast.add({
          severity: "error",
          summary: "C.I. inválido",
          detail: "El C.I. debe tener exactamente 10 dígitos numéricos.",
          life: 3000,
        });
        return false;
      }

      const digits = ID.split("").map(Number);
      const province = parseInt(ID.substring(0, 2), 10);
      if (province < 1 || province > 24) {
        this.toast.add({
          severity: "error",
          summary: "C.I. inválido",
          detail: "El código de provincia en el C.I. no es válido.",
          life: 3000,
        });
        return false;
      }

      let suma = 0;
      for (let i = 0; i < 9; i++) {
        let valor = digits[i] * (i % 2 === 0 ? 2 : 1);
        if (valor > 9) valor -= 9;
        suma += valor;
      }

      const digitoVerificador = (10 - (suma % 10)) % 10;
      const isValid = digitoVerificador === digits[9];

      if (isValid) {
        this.toast.add({
          severity: "success",
          summary: "C.I. válido",
          detail: "El número de C.I. es válido.",
          life: 3000,
        });
      } else {
        this.toast.add({
          severity: "error",
          summary: "C.I. inválido",
          detail: "El número de C.I. no es válido.",
          life: 3000,
        });
      }

      return isValid;
    },
    openNotasModal(index) {
    this.selectedMemberIndex = index; // Set the selected member index
    this.notasModalVisible = true;    // Changed false to true to correctly show the modal
    },
    saveNotasModal() {
      // Save the notes (already bound to the model via v-model)
      this.notasModalVisible = false; // Close the modal
    },
    closeNotasModal() {
      this.notasModalVisible = false; // Close the modal without saving
    },
    agregarMiembro() {
    // Add a new member with default values to the grupoConvivencia array
    this.caso.grupoConvivencia.push({
      nombre: "",
      edad: null,
      parentesco: "",
      ocupacion: "",
      notas: "",
    });
    },
    eliminarMiembro(index) {
      if (confirm("¿Está seguro de que desea eliminar este miembro?")) {
        this.caso.grupoConvivencia.splice(index, 1);
        this.toast.add({
          severity: "info",
          summary: "Miembro eliminado",
          detail: "El miembro ha sido eliminado del grupo de convivencia.",
          life: 3000,
        });
      }
    },
    irATrabajoSocialCasos() {
      this.$router.push('/TrabajoSocialCasos');
    },
    async cargarCaso(casoId, userId, internalId) {
    try {
      this.isLoading = true;
      this.error = null;

      // Fetch case details from the API using the query parameters
      const response = await fetch(`http://localhost:3000/social-work/${casoId}`
        , {credentials: 'include'}
      );

      if (!response.ok) {
        throw new Error('Error al cargar el caso');
      }

      const data = await response.json();
      console.log("Datos recibidos del backend:", data); 

      // Fetch living group members
      let grupoConvivencia = [];
      try {
        const livingGroupResponse = await fetch(`http://localhost:3000/living-groups/process/${casoId}`
          , {credentials: 'include'}
        );
        if (livingGroupResponse.ok) {
          const livingGroupData = await livingGroupResponse.json();
          grupoConvivencia = livingGroupData.map(member => ({
            id: member.LG_LivingGroup_ID, 
            nombre: member.LG_Name,
            edad: member.LG_Age,
            parentesco: member.LG_Relationship,
            ocupacion: member.LG_Occupation,
            notas: member.LG_Notes
          }));
        } else {
          console.warn("No members found for the living group.");
        }
      } catch (error) {
        console.error("Error fetching living group members:", error);
      }

      // Initialize default values for the form
      this.caso = {
        numeroProceso: data.SW_ProcessNumber || '',
        areaRemision: data.Initial_Consultation.Init_Subject || '',
        fechaIngreso: data.SW_EntryDate ? new Date(data.SW_EntryDate).toISOString().substr(0, 10) : new Date().toISOString().substr(0, 10),
        pedidoUsuario: data.SW_UserRequests || '',
        pedidoRemision: data.SW_ReferralAreaRequests || '',
        usuario: {
          nombres: `${data.Initial_Consultation.User.User_FirstName || ''} ${data.Initial_Consultation.User.User_LastName || ''}`.trim(),
          edad: data.Initial_Consultation.User.User_Age || '',
          estadoCivil: data.Initial_Consultation.User.User_MaritalStatus || '',
          ocupacion: data.Initial_Consultation.User.User_Profession || '',
          direccionTrabajo: data.SW_WorkAdress || '',
          telefono: data.Initial_Consultation.User.User_Phone || '',
          direccionDomicilio: data.SW_HomeAdress || '',
          telefonoReferencia: data.SW_ReferencePhone || '',
          documento: data.Initial_Consultation.User.User_ID || ''
        },
        grupoConvivencia: grupoConvivencia.length > 0 ? grupoConvivencia : [], // Use fetched living group data or empty array
        discapacidad: {
          tipo: data.SW_DisabilityType || '',
          porcentaje: data.SW_DisabilityPercentage || null,
          carnet: data.SW_DisabilityCard || false
        },
        episodiosViolencia: data.SW_ViolenceEpisodes || '',
        denuncias: data.SW_Complaints || '',
        consumoAlcohol: data.SW_AlcoholConsumption || '',
        consumoDrogas: data.SW_DrugConsumption || '',
        ingresos: data.SW_Income || null,
        tipoVivienda: data.SW_HousingType || '',
        contraparte: {
          nombres: data.SW_CounterpartName || '',
          edad: data.SW_CounterpartAge || null,
          estadoCivil: data.SW_CounterpartMaritalStatus || '',
          ocupacion: data.SW_CounterpartOccupation || '',
          direccionDomicilio: data.SW_CounterpartAddress || '',
          telefono: data.SW_CounterpartPhone || '',
          ci: data.SW_CounterpartID || '',
          relacion: data.SW_CounterpartRelation || ''
        },
        casoConocidoAnteriormente: data.SW_PreviouslyKnownCase || '',
        relatoHechos: data.SW_Notes || '',
        observaciones: data.SW_Observations || '',
        Internal_ID: internalId,
        SW_Status: data.SW_Status || ''
      };

      console.log("Formulario inicializado:", this.caso); // Add logging for debugging
    } catch (error) {
      console.error('Error al cargar el caso:', error);
      this.error = 'No se pudo cargar la información del caso. Por favor intente de nuevo.';
    } finally {
      this.isLoading = false;
    }
  },

  async actualizarCaso() {
  if (this.isFormLocked) {
        this.toast.add({
          severity: "warn",
          summary: "Caso archivado",
          detail: "No se pueden realizar cambios en un caso archivado.",
          life: 3000,
        });
        return;
    }

  try {
    this.isLoading = true;
    this.error = null;

    const currentTime = new Date().toISOString(); // Get the current time in ISO format

    // Transform the case data to match the backend model structure
    const socialWorkData = {
      SW_UserRequests: this.caso.pedidoUsuario,
      SW_ReferralAreaRequests: this.caso.pedidoRemision,
      SW_ViolenceEpisodes: this.caso.episodiosViolencia,
      SW_Complaints: this.caso.denuncias,
      SW_DisabilityType: this.caso.discapacidad.tipo,
      SW_DisabilityPercentage: this.caso.discapacidad.porcentaje,
      SW_HasDisabilityCard: this.caso.discapacidad.carnet, 
      SW_EntryDate: this.caso.fechaIngreso,
      SW_AlcoholConsumption: this.caso.consumoAlcohol,
      SW_DrugConsumption: this.caso.consumoDrogas,
      SW_Income: this.caso.ingresos,
      SW_HousingType: this.caso.tipoVivienda,
      SW_CounterpartName: this.caso.contraparte.nombres,
      SW_CounterpartAge: this.caso.contraparte.edad,
      SW_CounterpartMaritalStatus: this.caso.contraparte.estadoCivil,
      SW_CounterpartOccupation: this.caso.contraparte.ocupacion,
      SW_CounterpartAddress: this.caso.contraparte.direccionDomicilio,
      SW_CounterpartPhone: this.caso.contraparte.telefono,
      SW_CounterpartID: this.caso.contraparte.ci,
      SW_CounterpartRelation: this.caso.contraparte.relacion,
      SW_PreviouslyKnownCase: this.caso.casoConocidoAnteriormente,
      SW_FactsReport: this.caso.relatoHechos,
      SW_WorkAdress: this.caso.usuario.direccionTrabajo,
      SW_HomeAdress: this.caso.usuario.direccionDomicilio,
      SW_ReferencePhone: this.caso.usuario.telefonoReferencia,
      SW_Notes: this.caso.relatoHechos,
      SW_Observations: this.caso.observaciones,
      SW_LastTimeUpdated: currentTime,
      // Maintain the existing status, don't change it
      SW_Status: this.caso.SW_Status
    };

      // Update main social work case data first
      console.log("Updating social work case:", this.caso.numeroProceso);
      const response = await fetch(`http://localhost:3000/social-work/${this.caso.numeroProceso}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(socialWorkData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el caso");
      }

      await response.json();
      console.log("Social work case updated successfully");

      // Now handle the living group members
      console.log("Fetching existing living group members...");
      // First, fetch the existing living group members for this process
      const livingGroupResponse = await fetch(`http://localhost:3000/living-groups/process/${this.caso.numeroProceso}`
        , {credential: 'include'}
      );
      let existingMembers = [];
      
      if (livingGroupResponse.ok) {
        existingMembers = await livingGroupResponse.json();
        console.log("Found existing members:", existingMembers.length);
      } else {
        console.error("Failed to fetch existing living group members");
      }
      
      // Create a map of existing members by ID for easy lookup
      const existingMembersMap = new Map();
      existingMembers.forEach(member => {
        existingMembersMap.set(member.LG_LivingGroup_ID, member);
      });

      // Process each living group member in the current form
      const updatePromises = [];
      for (const member of this.caso.grupoConvivencia) {
        // Prepare data for API - Only include fields that exist in the model
        const livingGroupData = {
          LG_Name: member.nombre || "",
          LG_Age: member.edad || null,
          LG_Relationship: member.parentesco || "",
          LG_Occupation: member.ocupacion || "",
          LG_Notes: member.notas || "",
          SW_ProcessNumber: this.caso.numeroProceso
        };

        // If the member has an ID, it means it's an existing member that needs to be updated
        if (member.id) {
          console.log(`Updating existing member: ${member.nombre} (ID: ${member.id})`);
          const updatePromise = fetch(`http://localhost:3000/living-groups/${member.id}`, {
            credentials: 'include',
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...livingGroupData,
              Internal_ID: this.caso.Internal_ID // Make sure to include Internal_ID
            }),
          }).then(async response => {
            // Handle 404 (record not found) gracefully by creating a new record
            if (response.status === 404) {
              console.warn(`Member ${member.id} not found, will be created instead`);
              // Create a new record instead
              return fetch(`http://localhost:3000/living-groups`, {
                credentials: 'include',
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  ...livingGroupData,
                  Internal_ID: this.caso.Internal_ID
                }),
              }).then(async newResponse => {
                if (!newResponse.ok) {
                  const errorText = await newResponse.text();
                  throw new Error(`Error creating replacement for member ${member.nombre}: ${errorText}`);
                }
                return newResponse;
              });
            } else if (!response.ok) {
              const errorText = await response.text();
              console.error(`Error updating member ${member.id}:`, errorText);
              throw new Error(`Error updating member ${member.nombre}: ${errorText}`);
            }
            
            // Remove this member from the map as it's been processed
            existingMembersMap.delete(member.id);
            return response;
          });
          
          updatePromises.push(updatePromise);
        } else {
          // This is a new member, so create it
          console.log(`Creating new member: ${member.nombre}`);
          const createPromise = fetch(`http://localhost:3000/living-groups`, {
            credentials: 'include',
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...livingGroupData,
              Internal_ID: this.caso.Internal_ID
            }),
          }).then(async response => {
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Error creating member:`, errorText);
              throw new Error(`Error creating member ${member.nombre}: ${errorText}`);
            }
            return response;
          });
          
          updatePromises.push(createPromise);
        }
      }

      // Wait for all the member update/create operations to complete
      await Promise.all(updatePromises);
      console.log("All member updates completed");

      // Handle deleted members
      const deletePromises = [];
      for (const [memberId, member] of existingMembersMap.entries()) {
        console.log(`Deleting removed member: ${member.LG_Name} (ID: ${memberId})`);
        const deletePromise = fetch(`http://localhost:3000/living-groups/${memberId}`, {
          credential: 'include',
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          // The backend expects Internal_ID in the body for auditing purposes
          body: JSON.stringify({
            Internal_ID: this.caso.Internal_ID
          }),
        }).then(async response => {
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error deleting member ${memberId}:`, errorText);
            throw new Error(`Error deleting member: ${errorText}`);
          }
          return response;
        });
        
        deletePromises.push(deletePromise);
      }

      // Wait for all delete operations to complete
      await Promise.all(deletePromises);
      console.log("All deleted members processed");

      // Perform the update logic here...

      this.toast.add({
          severity: "success",
          summary: "Caso actualizado",
          detail: "El caso ha sido actualizado correctamente.",
          life: 3000,
        });

      // Navigate back to the cases list
      this.$router.push("/TrabajoSocialCasos");
    } catch (error) {
      console.error("Error al actualizar el caso:", error);

      this.toast.add({
          severity: "error",
          summary: "Error al actualizar",
          detail: error.message || "No se pudo actualizar el caso. Por favor intente de nuevo.",
          life: 3000,
        });
    } finally {
      this.isLoading = false;
    }
}},
watch: {
    // Watch for changes in caso.contraparte.ci
    'caso.contraparte.ci'(newValue) {
      if (newValue.length === 10) {
        if (this.validateID(newValue)) {
          alert("C.I. válido");
        } else {
          alert("C.I. no válido");
          this.caso.contraparte.ci = ''; // Reset the field if invalid
        }
      }
    },
  },
};
</script>
  

<style scoped>
.form-locked {
  opacity: 0.85;
  background-color: #f9f9f9;
  position: relative;
}

.form-locked::before {
  content: "CASO ARCHIVADO";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 6rem;
  opacity: 0.1;
  color: #ff0000;
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
}

.form-locked input,
.form-locked textarea,
.form-locked select {
  background-color: #f0f0f0 !important;
  border-color: #ddd !important;
  color: #666 !important;
}
</style>
