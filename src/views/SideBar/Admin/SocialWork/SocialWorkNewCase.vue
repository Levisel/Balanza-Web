<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="bg-white shadow-2xl rounded-xl overflow-hidden">
      <!-- Encabezado mejorado -->
      <div class="bg-gradient-to-r from-[#164284] to-[#1e5a96] text-white px-8 py-6">
        <div class="flex items-center justify-center space-x-3">
          <div class="bg-white/20 p-2 rounded-lg">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold">ÁREA DE TRABAJO SOCIAL</h1>
            <h2 class="text-xl font-light opacity-90">Ficha de Ingreso y Registro de Caso</h2>
          </div>
        </div>
      </div>

      <div class="p-8">
         <!-- Notification for archived cases -->
         <div v-if="isFormLocked" class="bg-red-50 border-l-4 border-red-400 text-red-800 px-6 py-4 mb-8 rounded-r-lg shadow-sm">
          <div class="flex items-center">
            <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <div>
              <p class="font-bold text-lg">Caso Archivado</p>
              <p class="text-sm">Este caso ha sido archivado y no se pueden realizar cambios.</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="actualizarCaso" class="space-y-10">
          <!-- Información inicial del caso -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div class="bg-blue-500 p-2 rounded-lg mr-3">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h2v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm8 5a1 1 0 100-2H8a1 1 0 100 2h4zm0 2a1 1 0 100-2H8a1 1 0 100 2h4z" clip-rule="evenodd"/>
                </svg>
              </div>
              Información del Caso
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Número de proceso</label>
                <input 
                  type="text" 
                  v-model="caso.numeroProceso" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed transition-all duration-200"
                  disabled
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Área de remisión del caso</label>
                <input 
                  type="text" 
                  v-model="caso.areaRemision" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed transition-all duration-200"
                  disabled
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group md:col-span-2">
                <label class="block text-gray-700 font-medium mb-2">Fecha de ingreso trabajo social</label>
                <input 
                  type="date" 
                  v-model="caso.fechaIngreso" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled
                  :disabled="isFormLocked"
                />
              </div>
            </div>
          </div>

          <!-- Pedidos -->
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div class="bg-green-500 p-2 rounded-lg mr-3">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
              </div>
              Solicitudes
            </h3>
            <div class="space-y-6">
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Pedido del usuario</label>
                <textarea 
                  v-model="caso.pedidoUsuario" 
                  rows="3"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  required
                  :disabled="isFormLocked"
                  placeholder="Describe la solicitud del usuario..."
                ></textarea>
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Pedido del área de remisión</label>
                <textarea 
                  v-model="caso.pedidoRemision" 
                  rows="3"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  required
                  :disabled="isFormLocked"
                  placeholder="Describe la solicitud del área de remisión..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Datos del usuario -->
          <div class="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div class="bg-purple-500 p-2 rounded-lg mr-3">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
              </div>
              Datos del Usuario
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Nombres y apellidos</label>
                <input 
                  type="text" 
                  v-model="caso.usuario.nombres" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed transition-all duration-200"
                  disabled
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Edad</label>
                <input 
                  type="number" 
                  v-model="caso.usuario.edad" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed transition-all duration-200"
                  disabled
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Estado Civil</label>
                <input 
                  type="text"
                  v-model="caso.usuario.estadoCivil" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed transition-all duration-200"
                  disabled
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Ocupación</label>
                <input 
                  type="text" 
                  v-model="caso.usuario.ocupacion" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed transition-all duration-200"
                  disabled
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Lugar del Trabajo</label>
                <input 
                  type="text" 
                  v-model="caso.usuario.direccionTrabajo" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Teléfono</label>
                <input 
                  type="tel" 
                  v-model="caso.usuario.telefono" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed transition-all duration-200"
                  disabled
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Dirección domiciliaria</label>
                <input 
                  type="text" 
                  v-model="caso.usuario.direccionDomicilio" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Teléfono de referencia</label>
                <input 
                  type="tel" 
                  v-model="caso.usuario.telefonoReferencia" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                  :disabled="isFormLocked"
                />
              </div>
              <div class="form-group md:col-span-2">
                <label class="block text-gray-700 font-medium mb-2">No. Documento</label>
                <input 
                  type="text" 
                  v-model="caso.usuario.documento" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed transition-all duration-200"
                  disabled
                  :disabled="isFormLocked"
                />
              </div>
            </div>
          </div>

          <!-- Composición de grupo de convivencia -->
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div class="bg-amber-500 p-2 rounded-lg mr-3">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
              Composición de grupo de convivencia
            </h3>
            <div class="overflow-x-auto rounded-xl border border-amber-200">
              <table class="min-w-full bg-white">
                <thead class="bg-amber-100">
                  <tr>
                    <th class="py-4 px-6 text-left font-semibold text-gray-700">Nombre</th>
                    <th class="py-4 px-6 text-left font-semibold text-gray-700">Edad</th>
                    <th class="py-4 px-6 text-left font-semibold text-gray-700">Parentesco</th>
                    <th class="py-4 px-6 text-left font-semibold text-gray-700">Ocupación</th>
                    <th class="py-4 px-6 text-center font-semibold text-gray-700">Notas</th>
                    <th class="py-4 px-6 text-center font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(miembro, index) in caso.grupoConvivencia" :key="index" class="hover:bg-amber-50 transition-colors duration-200 border-b border-amber-100">
                    <td class="py-4 px-6">
                      <input 
                        type="text" 
                        v-model="miembro.nombre" 
                        class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200"
                        :disabled="isFormLocked"
                      />
                    </td>
                    <td class="py-4 px-6">
                      <input 
                        type="number" 
                        v-model="miembro.edad" 
                        class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200"
                        :disabled="isFormLocked"
                      />
                    </td>
                    <td class="py-4 px-6">
                      <input 
                        type="text" 
                        v-model="miembro.parentesco" 
                        class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200"
                        :disabled="isFormLocked"
                      />
                    </td>
                    <td class="py-4 px-6">
                      <input 
                        type="text" 
                        v-model="miembro.ocupacion" 
                        class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200"
                        :disabled="isFormLocked"
                      />
                    </td>
                    <td class="py-4 px-6 text-center">
                      <button 
                        type="button"
                        @click="openNotasModal(index)"
                        class="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        {{ miembro.notas ? 'Ver Notas' : 'Agregar Notas' }}
                      </button>
                    </td>
                    <td class="py-4 px-6 text-center">
                      <button 
                        type="button"
                        @click="eliminarMiembro(index)"
                        class="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                        :disabled="isFormLocked"
                      >
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button 
              type="button"
              @click="agregarMiembro"
              class="mt-6 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 focus:outline-none transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
              :disabled="isFormLocked"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
              </svg>
              <span>Agregar persona</span>
            </button>
          </div>

          <!-- Modal de Notas -->
          <teleport to="body">
            <div 
              v-if="notasModalVisible" 
              class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm"
              @click.self="closeNotasModal"
            >
              <div 
                class="bg-white rounded-2xl shadow-2xl w-11/12 max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300"
                @click.stop
              >
                <div class="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                  <h2 class="text-xl font-semibold text-gray-800">
                    Notas para {{ caso.grupoConvivencia[selectedMemberIndex]?.nombre }}
                  </h2>
                  <button 
                    @click="closeNotasModal"
                    class="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-white transition-all duration-200"
                  >
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </div>
                
                <div class="p-6 flex-grow">
                  <textarea 
                    v-model="caso.grupoConvivencia[selectedMemberIndex].notas"
                    rows="10"
                    class="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Escriba aquí sus notas o transcripción de entrevista..."
                    :disabled="isFormLocked"
                  ></textarea>
                </div>
                
                <div class="p-6 border-t border-gray-200 flex justify-end space-x-4 bg-gray-50 rounded-b-2xl">
                  <button 
                    @click="closeNotasModal"
                    class="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button 
                    @click="saveNotasModal"
                    class="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg"
                    :disabled="isFormLocked"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </teleport>

          <!-- Discapacidad con Knob -->
          <div class="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-100">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div class="bg-pink-500 p-2 rounded-lg mr-3">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                </svg>
              </div>
              Miembros del círculo familiar con discapacidad
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
              <div class="form-group">
                <select 
                  v-model="caso.discapacidad.tipo" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 bg-white"
                  :disabled="isFormLocked"
                >
                  <option value="">Seleccione tipo de discapacidad</option>
                  <option 
                    v-for="type in disabilities" 
                    :key="type.id" 
                    :value="type.name"
                  >
                    {{ type.name }}
                  </option>
                </select>
              </div>
              
              <!-- Knob para porcentaje con animación y botones -->
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Porcentaje</label>
                <div class="flex items-center justify-center">
                  <div class="min-h-[120px] flex flex-col items-center gap-3">
                    <!-- Simulación del componente Knob -->
                    <div 
                      class="relative"
                      :style="{
                        visibility: hasDisability ? 'visible' : 'hidden',
                        opacity: hasDisability ? 1 : 0,
                        transform: hasDisability ? 'translateY(0)' : 'translateY(-8px)',
                        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out, visibility 0.5s',
                      }"
                    >
                      <!-- Simulación visual del Knob -->
                      <div class="relative w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full shadow-lg flex items-center justify-center border-4 border-white">
                        <svg class="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                          <circle 
                            cx="32" 
                            cy="32" 
                            r="28" 
                            fill="none" 
                            stroke="rgba(255,255,255,0.3)" 
                            stroke-width="4"
                          />
                          <circle 
                            cx="32" 
                            cy="32" 
                            r="28" 
                            fill="none" 
                            stroke="white" 
                            stroke-width="4"
                            stroke-dasharray="175.93"
                            :stroke-dashoffset="175.93 - (175.93 * (caso.discapacidad.porcentaje || 0) / 100)"
                            class="transition-all duration-300"
                          />
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center">
                          <span class="text-white font-bold text-sm">{{ caso.discapacidad.porcentaje || 0 }}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Botones de incremento y decremento -->
                    <div class="flex gap-2 items-center">
                      <!-- Botón de incremento -->
                      <button
                        type="button"
                        class="knobBtn w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                        :class="{
                          'bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600': (caso.discapacidad.porcentaje || 0) < 100,
                          'bg-gray-300 cursor-not-allowed': (caso.discapacidad.porcentaje || 0) >= 100
                        }"
                        @click="incrementPercentage"
                        @mousedown="startIncrement"
                        @mouseup="stopIncrement"
                        @mouseleave="stopIncrement"
                        :disabled="(caso.discapacidad.porcentaje || 0) >= 100 || isFormLocked"
                        :style="{
                          visibility: hasDisability ? 'visible' : 'hidden',
                          opacity: hasDisability ? 1 : 0,
                          transform: hasDisability ? 'translateY(0)' : 'translateY(-8px)',
                          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out, visibility 0.5s',
                        }"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                        </svg>
                      </button>

                      <!-- Input tradicional como fallback -->
                      <input 
                        type="number" 
                        v-model="caso.discapacidad.porcentaje" 
                        class="w-16 px-2 py-1 border border-gray-200 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                        max="100" 
                        min="0"
                        step="5"
                        @input="validatePercentage"
                        :disabled="isFormLocked"
                        placeholder="0"
                      />

                      <!-- Botón de decremento -->
                      <button
                        type="button"
                        class="knobBtn w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                        :class="{
                          'bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600': (caso.discapacidad.porcentaje || 0) > 0,
                          'bg-gray-300 cursor-not-allowed': (caso.discapacidad.porcentaje || 0) <= 0
                        }"
                        @click="decrementPercentage"
                        @mousedown="startDecrement"
                        @mouseup="stopDecrement"
                        @mouseleave="stopDecrement"
                        :disabled="(caso.discapacidad.porcentaje || 0) <= 0 || isFormLocked"
                        :style="{
                          visibility: hasDisability ? 'visible' : 'hidden',
                          opacity: hasDisability ? 1 : 0,
                          transform: hasDisability ? 'translateY(0)' : 'translateY(-8px)',
                          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out, visibility 0.5s',
                        }"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-4">Carnet:</label>
                <div class="flex items-center space-x-6">
                  <label class="inline-flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      v-model="caso.discapacidad.carnet" 
                      :value="true"
                      class="form-radio h-5 w-5 text-pink-600 focus:ring-pink-500"
                      :disabled="isFormLocked"
                    />
                    <span class="ml-2 text-gray-700">Sí</span>
                  </label>
                  <label class="inline-flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      v-model="caso.discapacidad.carnet" 
                      :value="false"
                      class="form-radio h-5 w-5 text-pink-600 focus:ring-pink-500"
                      :disabled="isFormLocked"
                    />
                    <span class="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Violencia y consumo -->
          <div class="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-100">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div class="bg-red-500 p-2 rounded-lg mr-3">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              </div>
              Episodios de Violencia y Consumo
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Episodios de Violencia</label>
                <textarea 
                  v-model="caso.episodiosViolencia" 
                  rows="3"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  :disabled="isFormLocked"
                  placeholder="Describe los episodios de violencia..."
                ></textarea>
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Denuncias</label>
                <textarea 
                  v-model="caso.denuncias" 
                  rows="3"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  :disabled="isFormLocked"
                  placeholder="Información sobre denuncias..."
                ></textarea>
              </div>
            </div>
            
            <h4 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd"/>
              </svg>
              Consumo de:
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Alcohol</label>
                <textarea 
                  v-model="caso.consumoAlcohol" 
                  rows="2"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  :disabled="isFormLocked"
                  placeholder="Información sobre consumo de alcohol..."
                ></textarea>
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Drogas</label>
                <textarea 
                  v-model="caso.consumoDrogas" 
                  rows="2"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  :disabled="isFormLocked"
                  placeholder="Información sobre consumo de drogas..."
                ></textarea>
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Tipo de enfermedad</label>
                <textarea 
                  v-model="caso.tipodeEnfermedad" 
                  rows="2"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  :disabled="isFormLocked"
                  placeholder="Información sobre enfermedades..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Situación económica -->
          <div class="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-100">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div class="bg-emerald-500 p-2 rounded-lg mr-3">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clip-rule="evenodd"/>
                </svg>
              </div>
              Situación Económica
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Ingresos ($)</label>
                <div class="relative">
                  <span class="absolute left-3 top-3 text-gray-500">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    v-model="caso.ingresos" 
                    class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    :disabled="isFormLocked"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Vivienda</label>
                <select 
                  v-model="caso.tipoVivienda" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white"
                  :disabled="isFormLocked"
                >
                  <option value="">Seleccione tipo de vivienda</option>
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
          <div class="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div class="bg-indigo-500 p-2 rounded-lg mr-3">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
                </svg>
              </div>
              Datos de la Contraparte
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Nombres y apellidos</label>
                <input 
                  type="text" 
                  v-model="caso.contraparte.nombres" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  :disabled="isFormLocked"
                  placeholder="Nombres y apellidos completos"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Edad</label>
                <input 
                  type="number" 
                  v-model="caso.contraparte.edad" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  :disabled="isFormLocked"
                  placeholder="Edad"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Estado Civil</label>
                <select 
                  v-model="caso.contraparte.estadoCivil" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                  :disabled="isFormLocked"
                >
                  <option value="">Seleccione estado civil</option>
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
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  :disabled="isFormLocked"
                  placeholder="Ocupación actual"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Dirección domiciliaria</label>
                <input 
                  type="text" 
                  v-model="caso.contraparte.direccionDomicilio" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  :disabled="isFormLocked"
                  placeholder="Dirección completa"
                />
              </div>
              <div class="form-group">
                <label class="block text-gray-700 font-medium mb-2">Teléfono</label>
                <input 
                  type="tel" 
                  v-model="caso.contraparte.telefono" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  :disabled="isFormLocked"
                  placeholder="Número de teléfono"
                />
              </div>
              <div class="form-group md:col-span-2">
                <label class="block text-gray-700 font-medium mb-2">Documento de identidad</label>
                <div class="space-y-3">
                  <div class="flex items-center gap-6">
                    <label class="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="CI"
                        v-model="caso.contraparte.tipoDocumento"
                        :disabled="isFormLocked"
                        class="form-radio h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span class="ml-2 text-gray-700">C.I.</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Pasaporte"
                        v-model="caso.contraparte.tipoDocumento"
                        :disabled="isFormLocked"
                        class="form-radio h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span class="ml-2 text-gray-700">Pasaporte</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    v-model="caso.contraparte.ci"
                    :placeholder="caso.contraparte.tipoDocumento === 'Pasaporte' ? 'Número de pasaporte' : 'Número de C.I.'"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    :disabled="isFormLocked"
                    :maxlength="caso.contraparte.tipoDocumento === 'Pasaporte' ? 20 : 10"
                    @input="onCIInput"
                  />
                </div>
              </div>
              <div class="form-group md:col-span-2">
                <label class="block text-gray-700 font-medium mb-2">Relación con el usuario</label>
                <input 
                  type="text" 
                  v-model="caso.contraparte.relacion" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  :disabled="isFormLocked"
                  placeholder="Tipo de relación (ej: cónyuge, familiar, etc.)"
                />
              </div>
            </div>
            <div class="form-group mt-6">
              <label class="block text-gray-700 font-medium mb-2">¿El caso ha sido conocido anteriormente por esta u otra institución?</label>
              <textarea 
                v-model="caso.casoConocidoAnteriormente" 
                rows="3"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                :disabled="isFormLocked"
                placeholder="Proporcione detalles sobre casos anteriores..."
              ></textarea>
            </div>
          </div>

          <!-- Relato de los hechos -->
          <div class="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-xl border border-slate-100">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div class="bg-slate-500 p-2 rounded-lg mr-3">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                </svg>
              </div>
              Relato de los Hechos
            </h3>
            <div class="form-group">
              <textarea 
                v-model="caso.relatoHechos" 
                rows="6"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 resize-none"
                :disabled="isFormLocked"
                placeholder="Describa de manera detallada los hechos relevantes del caso..."
              ></textarea>
            </div>
          </div>

          <!-- Observaciones -->
          <div class="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border border-yellow-100">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div class="bg-yellow-500 p-2 rounded-lg mr-3">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
              </div>
              Observaciones
            </h3>
            <div class="form-group">
              <textarea 
                v-model="caso.observaciones" 
                rows="4"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none"
                :disabled="isFormLocked"
                placeholder="Escriba aquí sus observaciones adicionales..."
              ></textarea>
            </div>
          </div>
          
          <!-- Botones de acción -->
          <div class="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
            <button 
              type="button"
              @click="irATrabajoSocialCasos"
              class="px-8 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 focus:outline-none transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="generarWord"
              class="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 focus:outline-none transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              :disabled="isFormLocked"
            >
              Generar Documento Word
            </button>
            <button 
              type="submit"
              class="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 focus:outline-none transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
import { API } from "@/ApiRoute";

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
          tipoDocumento: 'CI', // Default to C.I.
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
      disabilities: [],
      toast
    };
  },
  computed: {
    isFormLocked() {
      return this.caso.SW_Status === 'Archivado';
    },
    hasDisability() {
    return this.caso.discapacidad.tipo && this.caso.discapacidad.tipo.trim() !== '';
    }
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
    await this.fetchDisabilities();
  },
  methods: {
    // Métodos para los botones de incremento/decremento del knob
    incrementPercentage() {
      if ((this.caso.discapacidad.porcentaje || 0) < 100 && !this.isFormLocked) {
        this.caso.discapacidad.porcentaje = Math.min((this.caso.discapacidad.porcentaje || 0) + 5, 100);
      }
    },
    decrementPercentage() {
      if ((this.caso.discapacidad.porcentaje || 0) > 0 && !this.isFormLocked) {
        this.caso.discapacidad.porcentaje = Math.max((this.caso.discapacidad.porcentaje || 0) - 5, 0);
      }
    },
    startIncrement() {
      if (this.isFormLocked) return;
      this.incrementInterval = setInterval(() => {
        this.incrementPercentage();
      }, 150); // Incrementa cada 150ms mientras se mantenga presionado
    },
    stopIncrement() {
      if (this.incrementInterval) {
        clearInterval(this.incrementInterval);
        this.incrementInterval = null;
      }
    },
    startDecrement() {
      if (this.isFormLocked) return;
      this.decrementInterval = setInterval(() => {
        this.decrementPercentage();
      }, 150); // Decrementa cada 150ms mientras se mantenga presionado
    },
    stopDecrement() {
      if (this.decrementInterval) {
        clearInterval(this.decrementInterval);
        this.decrementInterval = null;
      }
    },
    async fetchHousingTypes() {
      try {
        const response = await fetch(`${API}/type-of-housing`
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
        const response = await fetch(`${API}/civil-statuses`
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
    async fetchDisabilities() {
      try {
        const response = await fetch(`${API}/disability`
          , {credentials: 'include',}
        );
        if (!response.ok) throw new Error('Error fetching disabilities');
        
        const data = await response.json();
        console.log('Raw disability response:', data);
        
        // Filter to only include items where Disability_Status is true
        // AND map the API properties to what the template expects
        this.disabilities = data
          .filter(item => item.Disability_Status === true)
          .map(item => ({
            id: item.Disability_Status,
            name: item.Disability_Name
          }));
        
        console.log('Transformed housing types:', this.dasability);
      } catch (error) {
        console.error('Error in fetchDisabilities:', error);
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
    onCIInput(e) {
      if (this.caso.contraparte.tipoDocumento === 'CI') {
        // Only allow numbers, max 10 digits
        let value = e.target.value.replace(/\D/g, '').slice(0, 10);
        this.caso.contraparte.ci = value;
      } else {
        // Allow alphanumeric, max 15 chars
        let value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
        this.caso.contraparte.ci = value;
      }
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
      const response = await fetch(`${API}/social-work/${casoId}`
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
        const livingGroupResponse = await fetch(`${API}/living-groups/process/${casoId}`
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
        tipodeEnfermedad: data.SW_TypeOfDisease || '',
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
          tipoDocumento: data.SW_TypeOfID || 'CI', // Default to C.I.
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
  async generarWord() {
    try {
      this.isLoading = true;
      // You can use the current case's process number as ID
      const processNumber = this.caso.numeroProceso;
      if (!processNumber) {
        this.toast.add({
          severity: "error",
          summary: "Error",
          detail: "No se encontró el número de proceso.",
          life: 3000,
        });
        return;
      }

      // Optionally, you can send date range or just the process number
      const response = await fetch(
        `${API}/social-work/report/word?processNumber=${encodeURIComponent(processNumber)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo generar el documento Word.");
      }

      const blob = await response.blob();
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_TrabajoSocial_${processNumber}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      this.toast.add({
        severity: "success",
        summary: "Documento generado",
        detail: "El documento Word ha sido generado y descargado.",
        life: 3000,
      });
    } catch (error) {
      this.toast.add({
        severity: "error",
        summary: "Error",
        detail: error.message || "No se pudo generar el documento Word.",
        life: 3000,
      });
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
      SW_TypeOfDisease: this.caso.tipodeEnfermedad,
      SW_Income: this.caso.ingresos,
      SW_HousingType: this.caso.tipoVivienda,
      SW_CounterpartName: this.caso.contraparte.nombres,
      SW_CounterpartAge: this.caso.contraparte.edad,
      SW_CounterpartMaritalStatus: this.caso.contraparte.estadoCivil,
      SW_CounterpartOccupation: this.caso.contraparte.ocupacion,
      SW_CounterpartAddress: this.caso.contraparte.direccionDomicilio,
      SW_CounterpartPhone: this.caso.contraparte.telefono,
      SW_CounterpartID: this.caso.contraparte.ci,
      SW_TypeOfID: this.caso.contraparte.tipoDocumento,
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
      const response = await fetch(`${API}/social-work/${this.caso.numeroProceso}`, {
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
      const livingGroupResponse = await fetch(`${API}/living-groups/process/${this.caso.numeroProceso}`
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
          const updatePromise = fetch(`${API}/living-groups/${member.id}`, {
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
              return fetch(`${API}/living-groups`, {
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
          const createPromise = fetch(`${API}/living-groups`, {
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
        const deletePromise = fetch(`${API}/living-groups/${memberId}`, {
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
      if (this.caso.contraparte.tipoDocumento === 'CI' && 
      newValue &&
      newValue.length === 10) {
        if (!this.validateID(newValue)) {
          this.caso.contraparte.ci = ''; // Reset the C.I. if it's invalid
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
