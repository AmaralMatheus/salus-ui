<template>
  <v-row>
    <v-col cols="12" class="d-flex flex-column ga-6">
      <v-expansion-panels>
        <v-expansion-panel>        
          <v-expansion-panel-title class="text-h6">Tabelas de Preço</v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row class="mt-0">
              <v-col cols="12">
                <v-row>
                  <v-col cols="12" sm="5" md="7" lg="8">
                    <v-text-field
                      v-model="search"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      append-inner-icon="mdi-magnify"
                      placeholder="Buscar Planos">
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" sm="7" md="5" lg="4">
                    <v-btn block append-icon="mdi-plus" @click="healthcareDialog = true" color="primary">Adicionar Plano</v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              :headers="headers"
              :items="serverItems"
              :items-length="totalItems"
              :loading="loading"
              :search="search"
              item-value="name"
              @update:options="loadItems"
              @click:row="viewRow"
            >
              <template v-slot:[`item.actions`]="{ item }">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-icon :disabled="loading" v-bind="props">mdi-dots-vertical</v-icon>
                  </template>
            
                  <v-list>
                    <v-list-item prepend-icon="mdi-pencil" density="comfortable" @click="viewRow(null, {item})" title="Editar"></v-list-item>
                    <v-list-item prepend-icon="mdi-delete" density="comfortable" @click="selectedItem = item; dialog = true" title="Excluir"></v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-data-table-server>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-dialog
        v-model="healthcareDialog"
        width="auto"
      >
        <v-card
          width="700"
          title="Cadastrar Tabela de Preço"
        >
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Nome"
                  :rules="rules"
                  hide-details="auto"
                  :disabled="loading"
                  variant="outlined"
                  density="compact"
                  v-model="healthcare.name"
                ></v-text-field>  
              </v-col>
              <v-col cols="12">
                <div class="text-center" v-if="healthcare.procedures?.length === 0">Cadastre os procedimentos para este tabela de preço!</div>
                <draggable
                  v-else 
                  v-model="healthcare.procedures"
                  @start="drag=true" 
                  @end="drag=false" 
                  item-key="order">
                  <!-- the row will go here -->
                    
                  <template #item="{element}">
                    <v-row dense>
                      <v-col class="d-flex mx-auto align-center ga-2 mt-1" cols="1">
                        <v-btn size="comfortable" icon="mdi-reorder-horizontal" disabled variant="plain"/>
                        <v-btn size="comfortable" icon="mdi-delete" @click="healthcare.procedures = healthcare.procedures.filter((action) => action !== element)" color="error" variant="plain"/>
                      </v-col>
                      <v-col cols="11" md="6">
                        <v-combobox
                          :items="procedures"
                          item-title="name"
                          item-value="name"
                          :rules="rules"
                          v-model="element.procedure"
                          :loading="loading"
                          :disabled="loading"
                          variant="underlined"
                          density="compact"
                          hide-details="auto"
                          @update:modelValue="setProcedure($event, element)"
                          label="Procedimento">
                        </v-combobox>
                      </v-col>
                      <v-col cols="12" md="4">
                        <CurrencyInput variant="underlined" label="Valor Unitário" v-model="element.price"></CurrencyInput>
                      </v-col>
                    </v-row>
                  </template>
                </draggable>
              </v-col>
              <v-btn
                text="Adicionar Procedimento"
                variant="outlined"
                class="mx-auto"
                color="primary"
                @click="healthcare.procedures.push({price: 0, description: null, order: healthcare.procedures.length})"
              ></v-btn>
            </v-row>
          </v-card-text>
          <template v-slot:actions>
            <v-btn
              class="ms-auto"
              text="Cancelar"
              :disabled="loading"
              @click="healthcareDialog = false; healthcare = { name: '', procedures: [] }"
            ></v-btn>
            <v-btn
              text="Salvar"
              color="error"
              :disabled="loading"
              :loading="loading"
              @click="save"
            ></v-btn>
          </template>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="dialog"
        width="auto"
      >
        <v-card
          max-width="400"
          prepend-icon="mdi-alert-outline"
          text="Esses dados não podem ser restaurados"
          title="Deseja excluir esse plano?"
        >
          <template v-slot:actions>
            <v-btn
              class="ms-auto"
              text="Cancelar"
              :disabled="loading"
              @click="dialog = false"
            ></v-btn>
            <v-btn
              text="Excluir"
              color="error"
              :disabled="loading"
              :loading="loading"
              @click="remove"
            ></v-btn>
          </template>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
  import healthcareService from '../../services/company.service'
  import companyService from '../../services/company.service'
  import { format, parseISO } from 'date-fns'
  import CurrencyInput from '../CurrencyInput.vue'
  import { toast } from 'vue3-toastify'
  import draggable from 'vuedraggable'

  export default {
    name: 'HealthcareList',
    components: {
      CurrencyInput,
      draggable,
    },
    data: () => ({
      format,
      parseISO,
      company: {
        name: ''
      },
      healthcare: {
        name: '',
        procedures: []
      },
      itemsPerPage: 5,
      dialog: false,
      healthcareDialog: false,
      selectedItem: null,
      search: '',
      headers: [
        {
          title: 'Nome',
          align: 'start',
          sortable: true,
          key: 'name',
        },
        { title: '', key: 'actions', align: 'end', sortable: true },
      ],
      rules: [
        value => {
          if (value) return true
          return 'Este campo não pode estar vazio.'
        },
      ],
      serverItems: [],
      loading: true,
      totalItems: 0,
      procedures: []
    }),
    mounted() {
      this.getProcedures()
    },
    methods: {
      getProcedures() {
        companyService.getAllProcedures().then((response) => {
          this.procedures = response.data
        })
      },
      viewRow (event, row) {
        this.healthcareDialog = true
        this.healthcare = row.item
      },
      loadItems ({ page, itemsPerPage, sortBy }) {
        this.loading = true
        if (sortBy.length <= 1) {
          sortBy.push ({
            order: 'desc',
            key: 'id'
          })
        }
        healthcareService.getHealthcareList(`page=${page}&itemsPerPage=${itemsPerPage}&sort=${sortBy[0].key}&order=${sortBy[0].order}&search=${this.search}`).then((response) => {
          this.serverItems = response.data.data
          this.totalItems = response.data.total
          this.loading = false
        })
      },
      remove () {
        this.loading = true
        healthcareService.deleteHealthcare(this.selectedItem.id).then(() => {
          this.dialog = false
          this.loadItems({
            page:1,
            itemsPerPage: 10,
            sortBy: []
          })
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

      setProcedure(event, element) {
        if(typeof event === 'object' && event?.price) {
          element.price = event.price
          element.procedure_id = event.id
          if (this.healthcare.procedures.filter((procedure) => procedure.procedure_id === element.id).length > 0) {
            element.price = this.healthcare.procedures.filter((procedure) => procedure.procedure_id === element.id)[0].price
          }
          element.description = event.name
        }
      },
      save() {
        this.loading = true
        if (this.healthcare.id) {
          healthcareService.updateHealthcare(this.healthcare.id, this.healthcare).then(() => {
            this.loading = false
            this.healthcareDialog = false
            this.healthcare = { name: '', price: 0 }
            this.loadItems({
              page:1,
              itemsPerPage: 10,
              sortBy: []
            })
          })
        } else {
          healthcareService.saveHealthcare(this.healthcare).then(() => {
            this.loading = false
            this.healthcareDialog = false
            this.healthcare = { name: '', price: 0 }
            this.loadItems({
              page:1,
              itemsPerPage: 10,
              sortBy: []
            })
          })
        }
      }
    },
  }
</script>
