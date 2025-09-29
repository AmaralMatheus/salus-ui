<template>
  <v-card
    :title="'Adicionar ' +  (descriptionAction === 'evolutions' ? 'Evolução' : descriptionAction === 'plans' ? 'Plano' : 'Receita')"
  >
    <v-card-text  v-if="descriptionAction === 'evolutions' || descriptionAction === 'prescriptions'">
      <div class="d-flex flex-column ga-3 mb-3" v-if="descriptionAction === 'evolutions'">
        <drag-select v-model="teeth" :multiple="true" background="rgba(255,82,82,0.28)">
          <div class="d-flex justify-space-between align-baseline">
            <drag-select-option v-for="tooth in [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]" :value="tooth" :key="tooth">
              <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
              <img class="cursor-pointer" :class="teeth.includes(tooth) ? 'tooth-extracted': ''" :src="require('../../assets/Vector-'+tooth+'.svg')"/>
            </drag-select-option>
          </div>
          <div class="d-flex justify-space-between">
            <drag-select-option v-for="tooth in [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]" :value="tooth" :key="tooth">
              <img class="cursor-pointer" height="25" :class="teeth.includes(tooth) ? 'tooth-extracted': ''" :src="require('../../assets/Vector-'+tooth+'.svg')"/>
              <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
            </drag-select-option>
          </div>
        </drag-select>
      </div>
      <v-row dense >
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
        <div>
          <v-chip v-for="template in templates" :key="template.id" class="cursor-pointer" @click="description = template.description" color="primary">{{ template.name }}</v-chip>
        </div>
      </v-row>
    </v-card-text>
    <v-card-text v-else class="pb-0">
      <v-form v-model="planForm" class="d-flex flex-column ga-4">
        <v-row>
          <v-col cols="8">
            <v-text-field
              label="Título"
              :disabled="loading"
              variant="outlined"
              density="compact"
              hide-details
              v-model="title"
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
              label="Plano de saúde"
            ></v-select>
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="newPlan.additional_info"
              :loading="loading"
              :disabled="loading"
              rows="3"
              variant="outlined"
              density="compact"
              hide-details="auto"
              label="Observações">
            </v-textarea>
          </v-col>
        </v-row>
        <div class="text-center" v-if="newPlan.actions?.length === 0">Cadastre os procedimentos para este plano de tratamento!</div>
        <draggable 
          v-model="newPlan.actions"
          v-if="!loading && newPlan.actions?.length > 0"
          @start="drag=true" 
          @end="drag=false" 
          item-key="order">
          <!-- the row will go here -->
            
          <template #item="{element}">
            <v-row dense>
              <v-col class="d-flex mx-auto align-center ga-2 mt-1" cols="1">
                <v-btn size="comfortable" icon="mdi-reorder-horizontal" disabled variant="plain"/>
                <v-btn size="comfortable" icon="mdi-delete" @click="newPlan.actions = newPlan.actions.filter((action) => action !== element)" color="error" variant="plain"/>
              </v-col>
              <v-col cols="11" sm="3" md="2">
                <v-combobox
                  :items="procedures"
                  item-title="name"
                  item-value="name"
                  :rules="rules"
                  v-model="element.description"
                  :loading="loading"
                  :disabled="loading"
                  variant="underlined"
                  density="compact"
                  hide-details="auto"
                  @update:modelValue="setProcedure($event, element)"
                  label="Procedimento">
                </v-combobox>
              </v-col>
              <v-col cols="11" sm="5" md="5">
                <v-menu :close-on-content-click="false" @v-model="element.quantity">
                  <template v-slot:activator="{ props }">
                    <v-combobox
                      readonly
                      clearable
                      :single-line="true"
                      :items="teethNumber"
                      v-bind="props"
                      item-title="name"
                      item-value="name"
                      multiple
                      @click:clear="element.quantity = []"
                      v-model="element.quantity"
                      :loading="loading"
                      :disabled="loading"
                      variant="underlined"
                      density="compact"
                      hide-details="auto"
                      label="Dentes">
                    </v-combobox>
                  </template>

                  <v-list>
                    <v-list-item class="no-select">
                      <drag-select v-model="element.quantity" :multiple="true" background="rgba(255,82,82,0.28)">
                        <div class="d-flex justify-space-between align-baseline">
                          <drag-select-option v-for="tooth in [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]" :value="teethNumber[tooth]" :key="teethNumber[tooth]">
                            <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
                            <img class="cursor-pointer" :class="element.quantity.includes(teethNumber[tooth]) ? 'tooth-extracted': ''" :src="require('../../assets/Vector-'+tooth+'.svg')"/>
                          </drag-select-option>
                        </div>
                        <div class="d-flex justify-space-between">
                          <drag-select-option v-for="tooth in [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]" :value="teethNumber[tooth]" :key="teethNumber[tooth]">
                            <img class="cursor-pointer" height="25" :class="element.quantity.includes(teethNumber[tooth]) ? 'tooth-extracted': ''" :src="require('../../assets/Vector-'+tooth+'.svg')"/>
                            <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
                          </drag-select-option>
                        </div>
                      </drag-select>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-col>
              <v-col cols="11" sm="4" class="d-flex ga-2 align-center">
                <CurrencyInput variant="underlined" label="Valor Unitário" v-model="element.price"></CurrencyInput> {{ (element.price * element.quantity.length).toFixed(2).toString().replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") }}
              </v-col>
            </v-row>
          </template>
        </draggable>
        <v-btn
          text="Adicionar Procedimento"
          v-if="descriptionAction === 'plans'"
          variant="outlined"
          class="mx-auto"
          color="primary"
          @click="newPlan.actions.push({price: 0, description: null, quantity: [], order: newPlan.actions.length})"
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
          actions: [],
          name: ''
        },
        title: '',
        image: null,
        teeth: [],
        teethNumber: [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38],
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
      getProcedures() {
        companyService.getAllProcedures().then((response) => {
          this.procedures = response.data.map((procedure) => {
            procedure.name = this.categoryName[procedure.category_id]+' - '+procedure.name
            return procedure
          })
        })
      },
      setProcedure(event, element) {
        if(typeof event === 'object' && event?.price) {
          if (this.newPlan.healthcare_id && this.healthcare.filter((hc) => this.newPlan.healthcare_id === hc.id)[0].procedures?.filter((procedure) => procedure.procedure_id === event.id).length > 0) {
            element.price = this.healthcare.filter((hc) => this.newPlan.healthcare_id === hc.id)[0].procedures.filter((procedure) => procedure.procedure_id === event.id)[0].price
          } else {
            element.price = event.price
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
  white-space: nowrap; /* Prevents text from wrapping to the next line */
  overflow: hidden; /* Hides any text that overflows the container */
  text-overflow: ellipsis; 
}
</style>
