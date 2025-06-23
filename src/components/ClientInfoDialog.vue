<template>
  <v-card
    :title="'Adicionar ' +  (descriptionAction === 'evolutions' ? 'Evolução' : descriptionAction === 'plans' ? 'Plano' : 'Receita')"
  >
    <v-card-text  v-if="descriptionAction === 'evolutions' || descriptionAction === 'prescriptions'">
      <div class="d-flex flex-column ga-3 mb-3" v-if="descriptionAction === 'evolutions'">
        <div class="d-flex justify-space-between align-baseline">
          <div v-for="tooth in [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]" class="d-flex flex-column" :key="tooth">
            <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
            <img class="cursor-pointer" @click="teeth.push(tooth)" :class="teeth.includes(tooth) ? 'tooth-extracted': ''" :src="require('../assets/Vector-'+tooth+'.svg')"/>
          </div>
        </div>
        <div class="d-flex justify-space-between">
          <div v-for="tooth in [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]" class="d-flex flex-column" :key="tooth">
            <img class="cursor-pointer" @click="teeth.push(tooth)" :class="teeth.includes(tooth) ? 'tooth-extracted': ''" :src="require('../assets/Vector-'+tooth+'.svg')"/>
            <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
          </div>
        </div>
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
      </v-row>
    </v-card-text>
    <v-card-text v-else class="pb-0">
      <v-form v-model="planForm" class="d-flex flex-column ga-4">
        <v-text-field
          label="Título"
          :disabled="loading"
          variant="outlined"
          density="compact"
          hide-details
          v-model="title"
        ></v-text-field>
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
              <v-col cols="11" sm="5" md="3">
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
              <v-col cols="11" sm="5" md="6">
                <v-menu :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <v-combobox
                      readonly
                      clearable
                      :items="teethNumber"
                      v-bind="props"
                      item-title="name"
                      item-value="name"
                      multiple
                      @click:clear="element.quantity = []"
                      v-model="element.teethShow"
                      :loading="loading"
                      :disabled="loading"
                      variant="underlined"
                      density="compact"
                      hide-details="auto"
                      label="Dentes">
                    </v-combobox>
                  </template>

                  <v-list>
                    <v-list-item>
                      <div class="d-flex justify-space-between align-baseline">
                        <div v-for="tooth in [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]" class="d-flex flex-column" :key="tooth">
                          <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
                          <img class="cursor-pointer" @click="!element.quantity.includes(tooth) ? element.quantity.push(tooth) : element.quantity = element.quantity.filter((currentTooth) => currentTooth !== tooth)" :class="element.quantity.includes(tooth) ? 'tooth-extracted': ''" :src="require('../assets/Vector-'+tooth+'.svg')"/>
                        </div>
                      </div>
                      <div class="d-flex justify-space-between">
                        <div v-for="tooth in [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]" class="d-flex flex-column" :key="tooth">
                          <img class="cursor-pointer" @click="!element.quantity.includes(tooth) ? element.quantity.push(tooth) : element.quantity = element.quantity.filter((currentTooth) => currentTooth !== tooth)" :class="element.quantity.includes(tooth) ? 'tooth-extracted': ''" :src="require('../assets/Vector-'+tooth+'.svg')"/>
                          <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
                        </div>
                      </div>
                      <div class="d-flex">
                        <v-btn color="primary" class="mb-2 ml-auto" @click="element.teethShow = element.quantity.map(el => teethNumber[el]).sort((a, b) => b - a)">Salvar</v-btn>
                      </div>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-col>
              <v-col cols="11" sm="5" md="2">
                <CurrencyInput variant="underlined" v-model="element.price"></CurrencyInput>
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
        :loading="loading"
        @click="saveDescription"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>


<script>
  import clientService from '../services/client.service'
  import companyService from '../services/company.service'
  import { format, parseISO } from 'date-fns'
  import { QuillEditor } from '@vueup/vue-quill'
  import '@vueup/vue-quill/dist/vue-quill.snow.css'
  import CurrencyInput from './CurrencyInput.vue'
  import draggable from 'vuedraggable'
  import { toast } from 'vue3-toastify'

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
      draggable
    },
    data () {
      return {
        format,
        parseISO,
        tab: 1,
        procedures: [],
        expanded: false,
        actionSuggestions: [],
        planForm: false,
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
      this.getProcedures()
    },
    methods: {
      saveDescription() {
        this.loading = true
        const data = {
          client_id: this.id,
          description: this.description,
          title: this.title,
          name: this.title,
          actions: this.newPlan.actions,
          teeth: this.teeth
        }
        clientService.saveDescription(data, this.descriptionAction).then(() => {
          this.loading = false
          this.descriptionDialog = false
          this.description = ''
          this.title = ''
          this.$emit('save')
          this.newPlan.actions = []
        },
        (error) => {
          this.loading = false
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
          this.procedures = response.data
        })
      },
      setProcedure(event, element) {
        console.log(event)
        if(typeof event === 'object' && event?.price) {
          element.price = event.price
          element.description = event.name
        }
      },
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
</style>
