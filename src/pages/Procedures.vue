<template>
  <v-row>
    <v-col cols="12" class="d-flex flex-column ga-6">
      <v-expansion-panels>
        <v-expansion-panel>        
          <v-expansion-panel-title class="text-h6">Procedimentos</v-expansion-panel-title>
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
                      placeholder="Buscar Procedimentos">
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" sm="7" md="5" lg="4">
                    <v-btn block append-icon="mdi-plus" @click="procedureDialog = true" color="primary">Adicionar Procedimento</v-btn>
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
              <template v-slot:[`item.price`]="{ item }">
                {{ item.price.toFixed(2) }} R$
              </template>
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
        v-model="procedureDialog"
        width="auto"
      >
        <v-card
          width="700"
          title="Cadastrar Procedimento"
        >
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="8">
                <v-text-field
                  label="Nome"
                  :rules="rules"
                  hide-details="auto"
                  :disabled="loading"
                  variant="outlined"
                  density="compact"
                  v-model="procedure.name"
                ></v-text-field>  
              </v-col>
              <v-col cols="12" sm="4">
                <CurrencyInput v-model="procedure.price"></CurrencyInput>
              </v-col>
            </v-row>
          </v-card-text>
          <template v-slot:actions>
            <v-btn
              class="ms-auto"
              text="Cancelar"
              :disabled="loading"
              @click="procedureDialog = false; procedure = { name: '', price: 0 }"
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
          title="Deseja excluir esse Usuário?"
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
  import procedureService from '../services/company.service'
  import { format, parseISO } from 'date-fns'
  import CurrencyInput from '../components/CurrencyInput.vue'
  import { toast } from 'vue3-toastify'

  export default {
    name: 'ProcedureList',
    components: {
      CurrencyInput
    },
    data: () => ({
      format,
      parseISO,
      company: {
        name: ''
      },
      procedure: {
        name: '',
        price: ''
      },
      itemsPerPage: 5,
      dialog: false,
      procedureDialog: false,
      selectedItem: null,
      search: '',
      headers: [
        {
          title: 'Nome',
          align: 'start',
          sortable: true,
          key: 'name',
        },
        { title: 'Preço', key: 'price', align: 'start', sortable: true },
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
    }),
    methods: {
      viewRow (event, row) {
        this.procedureDialog = true
        this.procedure = row.item
      },
      loadItems ({ page, itemsPerPage, sortBy }) {
        this.loading = true
        if (sortBy.length <= 1) {
          sortBy.push ({
            order: 'desc',
            key: 'id'
          })
        }
        procedureService.getProcedures(`page=${page}&itemsPerPage=${itemsPerPage}&sort=${sortBy[0].key}&order=${sortBy[0].order}&search=${this.search}`).then((response) => {
          this.serverItems = response.data.data
          this.totalItems = response.data.total
          this.loading = false
        })
      },
      remove () {
        this.loading = true
        procedureService.deleteProcedure(this.selectedItem.id).then(() => {
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
      save() {
        this.loading = true
        if (this.procedure.id) {
          procedureService.updateProcedure(this.procedure.id, this.procedure).then(() => {
            this.loading = false
            this.procedureDialog = false
            this.procedure = { name: '', price: 0 }
            this.loadItems({
              page:1,
              itemsPerPage: 10,
              sortBy: []
            })
          })
        } else {
          procedureService.saveProcedure(this.procedure).then(() => {
            this.loading = false
            this.procedureDialog = false
            this.procedure = { name: '', price: 0 }
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
