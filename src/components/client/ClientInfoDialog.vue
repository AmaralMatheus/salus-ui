<template>
  <v-card
    :title="'Adicionar ' + (descriptionAction === 'evolutions' ? 'Evolução' : descriptionAction === 'plans' ? 'Plano de Tratamento' : 'Receita')"
    class="has-mobile-header"
  >
    <div class="mobile-modal-header d-flex d-md-none">
      <span class="mobile-modal-title">{{ 'Adicionar ' + (descriptionAction === 'evolutions' ? 'Evolução' : descriptionAction === 'plans' ? 'Plano de Tratamento' : 'Receita') }}</span>
      <v-btn icon="mdi-close" variant="text" size="small" density="compact" @click="$emit('cancel')" />
    </div>
    <!-- Evolutions / Prescriptions — unchanged -->
    <v-card-text v-if="descriptionAction === 'evolutions' || descriptionAction === 'prescriptions'">
      <div class="d-flex flex-column ga-3 mb-3" v-if="descriptionAction === 'evolutions'">
        <div class="d-flex justify-center ga-4">
          <span class="odonto-group-btn" :class="{ 'odonto-group-active': isGroupSelected('maxila') }" @click="toggleGroup('maxila')">Maxila</span>
          <span class="odonto-group-btn" :class="{ 'odonto-group-active': isGroupSelected('mandibula') }" @click="toggleGroup('mandibula')">Mandíbula</span>
          <span class="odonto-group-btn" :class="{ 'odonto-group-active': isGroupSelected('face') }" @click="toggleGroup('face')">Face</span>
        </div>
        <drag-select v-model="teeth" :multiple="true" background="rgba(255,82,82,0.28)">
          <div class="odontogram-area rounded-lg pa-3">
            <div class="d-flex justify-center align-end">
              <div class="d-flex align-end">
                <drag-select-option v-for="tooth in [0,1,2,3,4,5,6,7]" :value="tooth" :key="tooth">
                  <div class="d-flex flex-column align-center px-1">
                    <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
                    <img class="tooth-img cursor-pointer" :class="teeth.includes(tooth) ? 'tooth-extracted' : ''" :src="require('../../assets/teeth/'+teethNumber[tooth]+'.svg')"/>
                  </div>
                </drag-select-option>
              </div>
              <div class="odonto-v-sep mx-2"></div>
              <div class="d-flex align-end">
                <drag-select-option v-for="tooth in [8,9,10,11,12,13,14,15]" :value="tooth" :key="tooth">
                  <div class="d-flex flex-column align-center px-1">
                    <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
                    <img class="tooth-img cursor-pointer" :class="teeth.includes(tooth) ? 'tooth-extracted' : ''" :src="require('../../assets/teeth/'+teethNumber[tooth]+'.svg')"/>
                  </div>
                </drag-select-option>
              </div>
            </div>
            <div class="odonto-h-sep my-3"></div>
            <div class="d-flex justify-center align-start">
              <div class="d-flex align-start">
                <drag-select-option v-for="tooth in [16,17,18,19,20,21,22,23]" :value="tooth" :key="tooth">
                  <div class="d-flex flex-column align-center px-1">
                    <img class="tooth-img cursor-pointer" :class="teeth.includes(tooth) ? 'tooth-extracted' : ''" :src="require('../../assets/teeth/'+teethNumber[tooth]+'.svg')"/>
                    <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
                  </div>
                </drag-select-option>
              </div>
              <div class="odonto-v-sep mx-2"></div>
              <div class="d-flex align-start">
                <drag-select-option v-for="tooth in [24,25,26,27,28,29,30,31]" :value="tooth" :key="tooth">
                  <div class="d-flex flex-column align-center px-1">
                    <img class="tooth-img cursor-pointer" :class="teeth.includes(tooth) ? 'tooth-extracted' : ''" :src="require('../../assets/teeth/'+teethNumber[tooth]+'.svg')"/>
                    <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
                  </div>
                </drag-select-option>
              </div>
            </div>
          </div>
        </drag-select>
      </div>
      <v-row dense>
        <v-col cols="12">
          <v-text-field
            v-if="descriptionAction !== 'evolutions' && descriptionAction !== 'prescriptions'"
            label="Título"
            required
            :disabled="loading"
            variant="outlined"
            density="compact"
            v-model="title"
          ></v-text-field>
        </v-col>
        <v-col cols="12">
          <quill-editor style="height:200px" placeholder="Descrição" contentType="html" v-model:content="description" theme="snow"></quill-editor>
        </v-col>
        <div class="d-flex flex-wrap mt-2 ga-2" v-if="descriptionAction === 'prescriptions'">
          <v-chip variant="outlined" v-for="template in templates" :key="template.id" class="cursor-pointer" @click="description += template.description" color="primary">{{ template.name }}+</v-chip>
        </div>
      </v-row>
    </v-card-text>

    <!-- Plans — redesigned -->
    <v-card-text v-else class="pb-0">
      <v-form v-model="planForm" class="d-flex flex-column ga-3">
        <v-row dense>
          <v-col cols="8">
            <v-text-field
              label="Título do plano"
              :disabled="loading"
              variant="outlined"
              density="compact"
              hide-details
              v-model="title"
              placeholder="Título"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-select
              :items="healthcare"
              item-title="name"
              item-value="id"
              v-model="newPlan.healthcare_id"
              :loading="loading"
              :disabled="loading"
              variant="outlined"
              @update:modelValue="newPlan.actions = []"
              density="compact"
              hide-details="auto"
              label="Tabela de preço"
            ></v-select>
          </v-col>
        </v-row>

        <div v-if="newPlan.actions?.length === 0" class="text-center text-caption text-disabled py-2">
          Cadastre os procedimentos para este plano de tratamento!
        </div>

        <draggable
          v-model="newPlan.actions"
          v-if="!loading"
          @start="drag=true"
          @end="drag=false"
          item-key="order"
          handle=".plan-drag-handle"
        >
          <template #item="{element}">
            <div class="plan-item">

              <!-- Drag handle -->
              <div class="plan-drag-handle">
                <v-icon icon="mdi-reorder-horizontal" size="18" color="#ccc" />
              </div>

              <!-- Fields 2x2 grid -->
              <div class="plan-fields-wrap">
                <v-combobox
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  :rules="rules"
                  :loading="loading"
                  :disabled="loading"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  @update:modelValue="getProcedures"
                  label="Especialidade"
                ></v-combobox>
                <v-combobox
                  :items="procedures"
                  item-title="name"
                  item-value="name"
                  :rules="rules"
                  v-model="element.description"
                  :loading="loading"
                  :disabled="loading"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  @update:modelValue="setProcedure($event, element)"
                  label="Procedimento"
                ></v-combobox>
                <CurrencyInput
                  :hint="element.priceSource ? 'Preço para o plano ' + (healthcare.find(hc => hc.id === newPlan.healthcare_id)?.name || '') : ''"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  label="Valor unitário"
                  v-model="element.price"
                ></CurrencyInput>
                <CurrencyInput
                  label="Valor total"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  :value="'R$ ' + (element.price * element.quantity.length).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')"
                ></CurrencyInput>
              </div>

              <!-- Odontogram with tabs -->
              <div class="plan-teeth">
                <div class="plan-teeth-tabs">
                  <button
                    type="button"
                    class="plan-teeth-tab"
                    :class="{ 'plan-teeth-tab-active': element.tab !== 'deciduos' }"
                    @click="element.tab = 'permanentes'"
                  >Permanentes</button>
                  <button
                    type="button"
                    class="plan-teeth-tab"
                    :class="{ 'plan-teeth-tab-active': element.tab === 'deciduos' }"
                    @click="element.tab = 'deciduos'"
                  >Decíduos</button>
                </div>
                <div v-if="element.tab !== 'deciduos'" class="d-flex justify-center ga-2 mb-2">
                  <span class="odonto-group-btn" :class="{ 'odonto-group-active': isPlanGroupSelected(element, 'maxila') }" @click="togglePlanGroup(element, 'maxila')">Maxila</span>
                  <span class="odonto-group-btn" :class="{ 'odonto-group-active': isPlanGroupSelected(element, 'mandibula') }" @click="togglePlanGroup(element, 'mandibula')">Mandíbula</span>
                  <span class="odonto-group-btn" :class="{ 'odonto-group-active': isPlanGroupSelected(element, 'face') }" @click="togglePlanGroup(element, 'face')">Face</span>
                </div>

                <!-- Permanent -->
                <drag-select
                  v-if="element.tab !== 'deciduos'"
                  v-model="element.quantity"
                  :multiple="true"
                  background="rgba(255,82,82,0.28)"
                >
                  <div class="plan-odonto-grid">
                    <div class="d-flex justify-center align-end">
                      <div class="d-flex align-end">
                        <drag-select-option v-for="i in [0,1,2,3,4,5,6,7]" :value="teethNumber[i]" :key="teethNumber[i]">
                          <div class="d-flex flex-column align-center plan-tooth-cell">
                            <div class="plan-tooth-num">{{ teethNumber[i] }}</div>
                            <img class="plan-tooth-img" :class="element.quantity.includes(teethNumber[i]) ? 'tooth-extracted' : ''" :src="require('../../assets/teeth/'+teethNumber[i]+'.svg')"/>
                          </div>
                        </drag-select-option>
                      </div>
                      <div class="odonto-v-sep mx-2"></div>
                      <div class="d-flex align-end">
                        <drag-select-option v-for="i in [8,9,10,11,12,13,14,15]" :value="teethNumber[i]" :key="teethNumber[i]">
                          <div class="d-flex flex-column align-center plan-tooth-cell">
                            <div class="plan-tooth-num">{{ teethNumber[i] }}</div>
                            <img class="plan-tooth-img" :class="element.quantity.includes(teethNumber[i]) ? 'tooth-extracted' : ''" :src="require('../../assets/teeth/'+teethNumber[i]+'.svg')"/>
                          </div>
                        </drag-select-option>
                      </div>
                    </div>
                    <div class="odonto-h-sep my-2"></div>
                    <div class="d-flex justify-center align-start">
                      <div class="d-flex align-start">
                        <drag-select-option v-for="i in [16,17,18,19,20,21,22,23]" :value="teethNumber[i]" :key="teethNumber[i]">
                          <div class="d-flex flex-column align-center plan-tooth-cell">
                            <img class="plan-tooth-img" :class="element.quantity.includes(teethNumber[i]) ? 'tooth-extracted' : ''" :src="require('../../assets/teeth/'+teethNumber[i]+'.svg')"/>
                            <div class="plan-tooth-num">{{ teethNumber[i] }}</div>
                          </div>
                        </drag-select-option>
                      </div>
                      <div class="odonto-v-sep mx-2"></div>
                      <div class="d-flex align-start">
                        <drag-select-option v-for="i in [24,25,26,27,28,29,30,31]" :value="teethNumber[i]" :key="teethNumber[i]">
                          <div class="d-flex flex-column align-center plan-tooth-cell">
                            <img class="plan-tooth-img" :class="element.quantity.includes(teethNumber[i]) ? 'tooth-extracted' : ''" :src="require('../../assets/teeth/'+teethNumber[i]+'.svg')"/>
                            <div class="plan-tooth-num">{{ teethNumber[i] }}</div>
                          </div>
                        </drag-select-option>
                      </div>
                    </div>
                  </div>
                </drag-select>

                <!-- Deciduous -->
                <drag-select
                  v-else
                  v-model="element.quantity"
                  :multiple="true"
                  background="rgba(255,82,82,0.28)"
                >
                  <div class="plan-odonto-grid">
                    <div class="d-flex justify-center align-end">
                      <div class="d-flex align-end">
                        <drag-select-option v-for="n in [55,54,53,52,51]" :value="n" :key="n">
                          <div class="d-flex flex-column align-center plan-tooth-cell">
                            <div class="plan-tooth-num">{{ n }}</div>
                            <img class="plan-tooth-img" :class="element.quantity.includes(n) ? 'tooth-extracted' : ''" :src="require('../../assets/teeth/'+n+'.svg')"/>
                          </div>
                        </drag-select-option>
                      </div>
                      <div class="odonto-v-sep mx-2"></div>
                      <div class="d-flex align-end">
                        <drag-select-option v-for="n in [61,62,63,64,65]" :value="n" :key="n">
                          <div class="d-flex flex-column align-center plan-tooth-cell">
                            <div class="plan-tooth-num">{{ n }}</div>
                            <img class="plan-tooth-img" :class="element.quantity.includes(n) ? 'tooth-extracted' : ''" :src="require('../../assets/teeth/'+n+'.svg')"/>
                          </div>
                        </drag-select-option>
                      </div>
                    </div>
                    <div class="odonto-h-sep my-2"></div>
                    <div class="d-flex justify-center align-start">
                      <div class="d-flex align-start">
                        <drag-select-option v-for="n in [85,84,83,82,81]" :value="n" :key="n">
                          <div class="d-flex flex-column align-center plan-tooth-cell">
                            <img class="plan-tooth-img" :class="element.quantity.includes(n) ? 'tooth-extracted' : ''" :src="require('../../assets/teeth/'+n+'.svg')"/>
                            <div class="plan-tooth-num">{{ n }}</div>
                          </div>
                        </drag-select-option>
                      </div>
                      <div class="odonto-v-sep mx-2"></div>
                      <div class="d-flex align-start">
                        <drag-select-option v-for="n in [71,72,73,74,75]" :value="n" :key="n">
                          <div class="d-flex flex-column align-center plan-tooth-cell">
                            <img class="plan-tooth-img" :class="element.quantity.includes(n) ? 'tooth-extracted' : ''" :src="require('../../assets/teeth/'+n+'.svg')"/>
                            <div class="plan-tooth-num">{{ n }}</div>
                          </div>
                        </drag-select-option>
                      </div>
                    </div>
                  </div>
                </drag-select>
              </div>

              <!-- Delete -->
              <v-btn
                v-if="newPlan.actions.length > 1"
                icon="mdi-close"
                size="x-small"
                variant="plain"
                color="grey"
                class="plan-delete-btn"
                @click="newPlan.actions = newPlan.actions.filter(a => a !== element)"
              />
            </div>
          </template>
        </draggable>

        <v-textarea
          v-model="newPlan.additional_info"
          :loading="loading"
          :disabled="loading"
          class="h-auto"
          :rows="3"
          variant="outlined"
          density="compact"
          hide-details
          label="Observações"
        ></v-textarea>

        <v-btn
          text="Adicionar procedimento"
          variant="outlined"
          color="primary"
          block
          @click="newPlan.actions.push({price: 0, description: null, quantity: [], order: newPlan.actions.length, tab: 'permanentes'})"
        ></v-btn>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        text="Cancelar"
        variant="plain"
        @click="$emit('cancel')"
      ></v-btn>
      <v-btn
        color="primary"
        text="Salvar"
        variant="tonal"
        :disabled="loading || (descriptionAction === 'evolutions' && !description) || (descriptionAction === 'plans' && !planForm) || (descriptionAction === 'prescriptions' && !description)"
        :loading="saving"
        @click="saveDescription"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>


<script>
  import clientService from '../../services/client.service'
  import companyService from '../../services/company.service'
  import { format, parseISO } from 'date-fns'
  import { QuillEditor } from '@vueup/vue-quill'
  import '@vueup/vue-quill/dist/vue-quill.snow.css'
  import CurrencyInput from '../CurrencyInput.vue'
  import draggable from 'vuedraggable'
  import { toast } from 'vue3-toastify'
  import {DragSelect, DragSelectOption} from "@coleqiu/vue-drag-select"

  export default {
    computed: {
      id() {
        return this.$route.params.id
      }
    },
    props: ['descriptionAction', 'client'],
    components: {
      QuillEditor,
      CurrencyInput,
      draggable,
      DragSelect,
      DragSelectOption
    },
    data () {
      return {
        format,
        parseISO,
        tab: 1,
        procedures: [],
        healthcare: [],
        expanded: false,
        actionSuggestions: [],
        planForm: false,
        templates: [],
        categoryName: [
          'Sem Especialidade',
          'Ortodontia'
        ],
        currentPlan: null,
        newPlan: {
          actions: [
            {price: 0, description: null, quantity: [], order: 0, tab: 'permanentes'}
          ],
          name: ''
        },
        title: '',
        image: null,
        teeth: [],
        categories: [
          {id: 0, name: 'Ortodontia/Ortopedia Funcional dos Maxilares'},
          {id: 1, name: 'Implantodontia'},
          {id: 2, name: 'Dentística'},
          {id: 3, name: 'Endodontia'},
          {id: 4, name: 'Periodontia'},
          {id: 5, name: 'Prótese Dentária'},
          {id: 6, name: 'Odontopediatria'},
          {id: 7, name: 'Bucomaxilofacial'},
          {id: 8, name: 'Radiologia'},
          {id: 9, name: 'Odontologia para Pacientes com Necessidades Especiais'},
          {id: 10, name: 'Harmonização oro facial HOF'}
        ],
        teethNumber: [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38],
        toothGroups: {
          maxila:    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
          mandibula: [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
          face:      [5,6,7,8,9,10,21,22,23,24,25,26],
        },
        toothGroupsFdi: {
          maxila:    [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28],
          mandibula: [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38],
          face:      [13,12,11,21,22,23,43,42,41,31,32,33],
        },
        description: '',
        saving: false,
        loading: false,
        rules: [
          value => {
            if (value) return true
            return 'Este campo não pode estar vazio.'
          },
        ],
      }
    },
    mounted() {
      companyService.getAllHealthcare().then((response) => {
        this.healthcare = response.data
      })
      this.getProcedures()
      companyService.getAllTemplates().then((response) => {
        this.templates = response.data
      })
      this.loading = false
    },
    methods: {
      saveDescription() {
        this.saving = true
        const data = {
          client_id: this.id,
          description: this.description,
          healthcare_id: this.newPlan.healthcare_id,
          title: this.title + ' Teste',
          name: this.title,
          additional_info: this.newPlan.additional_info,
          actions: this.newPlan.actions.map((action) => {
            action.quantity = action.quantity.map((tooth) => this.teethNumber.indexOf(tooth))
            return action
          }),
          teeth: this.teeth
        }
        clientService.saveDescription(data, this.descriptionAction).then(() => {
          this.saving = false
          this.descriptionDialog = false
          this.description = ''
          this.title = ''
          this.$emit('save')
          this.newPlan.actions = []
        },
        (error) => {
          this.saving = false
          toast.error((error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                  error.message ||
                  error.toString())
        })
      },
      getToothStatus(status) {
        switch (status) {
          case 0:
            return 'Saudável'
          case 1:
            return 'Em tratamento'
          case 2:
            return 'Extraído'
        }
      },
      getDateTime(date) {
        return format(parseISO(date), 'dd/MM/yyyy kk:mm')
      },
      getProcedures(event) {
        companyService.getAllProcedures(event ? event.id : 0).then((response) => {
          this.procedures = response.data.map((procedure) => {
            procedure.name = this.categoryName[procedure.category_id]+' - '+procedure.name
            return procedure
          })
        })
      },
      isGroupSelected(group) {
        return this.toothGroups[group].every(i => this.teeth.includes(i))
      },
      toggleGroup(group) {
        const indices = this.toothGroups[group]
        if (this.isGroupSelected(group)) {
          this.teeth = this.teeth.filter(i => !indices.includes(i))
        } else {
          const next = [...this.teeth]
          indices.forEach(i => { if (!next.includes(i)) next.push(i) })
          this.teeth = next
        }
      },
      isPlanGroupSelected(element, group) {
        return this.toothGroupsFdi[group].every(n => element.quantity.includes(n))
      },
      togglePlanGroup(element, group) {
        const nums = this.toothGroupsFdi[group]
        if (this.isPlanGroupSelected(element, group)) {
          element.quantity = element.quantity.filter(n => !nums.includes(n))
        } else {
          const next = [...element.quantity]
          nums.forEach(n => { if (!next.includes(n)) next.push(n) })
          element.quantity = next
        }
      },
      setProcedure(event, element) {
        if(typeof event === 'object' && event?.price) {
          if (this.newPlan.healthcare_id && this.healthcare.filter((hc) => this.newPlan.healthcare_id === hc.id)[0].procedures?.filter((procedure) => procedure.procedure_id === event.id).length > 0) {
            element.price = this.healthcare.filter((hc) => this.newPlan.healthcare_id === hc.id)[0].procedures.filter((procedure) => procedure.procedure_id === event.id)[0].price
            element.priceSource = true
          } else {
            element.price = event.price
            element.priceSource = null
          }
          element.description = event.name.split(' - ')[1]
        }
      }
    }
  }
</script>

<style>
.tooth-healthy {
  filter: invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%);
}

.tooth-sick {
  filter: invert(42%) sepia(93%) saturate(1352%) hue-rotate(16.4deg) brightness(119%) contrast(119%);
}

.tooth-extracted {
  filter: invert(42%) sepia(90%) saturate(1952%) hue-rotate(320.4deg) brightness(89%) contrast(119%);
}

.profile-card {
  transition: ease-in-out 0.2s !important;
}

.no-select {
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;
}

.v-field__input{
  overflow: hidden;
  max-height: 32px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Plan item card ── */
.plan-item {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  background: #f5f5f7;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
  font-size: 16px;
}

.plan-drag-handle {
  display: flex;
  align-items: center;
  padding-top: 10px;
  cursor: grab;
  flex-shrink: 0;
}

.plan-drag-handle:active {
  cursor: grabbing;
}

.plan-fields-wrap {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.plan-fields-wrap .v-label {
  font-size: 16px;
}

.plan-fields-wrap .v-field__input {
  font-size: 16px;
  max-height: none;
}

/* ── Teeth section ── */
.plan-teeth {
  flex: 0 0 auto;
  width: fit-content;
  
}

.plan-teeth-tabs {
  display: flex;
  border-bottom: 1.5px solid #e0e0e0;
  margin-bottom: 8px;
  justify-content: center;
}

.plan-teeth-tab {
  background: none;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  color: #aaa;
  padding: 4px 12px 6px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1.5px;
  transition: color 0.15s, border-color 0.15s;
}

.plan-teeth-tab-active {
  color: #C62424;
  border-bottom-color: #C62424;
  font-weight: 600;
}

.plan-odonto-grid {
  padding: 2px 0;
}

.plan-tooth-cell {
  padding: 0 5px;
}

.plan-tooth-num {
  font-size: 12px;
  color: #bbb;
  line-height: 1.4;
  text-align: center;
}

.plan-tooth-img {
  height: 48px;
  width: auto;
  display: block;
}

.plan-delete-btn {
  position: absolute !important;
  top: 8px;
  right: 8px;
}

@media (min-width: 960px) {
  .plan-teeth {
    min-width: 540px;
  }
}

@media (max-width: 600px) {
  .plan-item {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px;
  }

  .plan-fields-wrap {
    width: 100%;
    grid-template-columns: 1fr;
  }

  .plan-teeth {
    width: 100%;
  }

  .plan-tooth-img {
    height: 22px;
  }

  .plan-tooth-cell {
    padding: 0 1px;
  }

  .plan-tooth-num {
    font-size: 12px;
  }
}

.odonto-v-sep {
  border-left: 2px dashed #DDDDDD;
  align-self: stretch;
  width: 0;
}

.odonto-h-sep {
  border-top: 2px dashed #DDDDDD;
}
</style>
