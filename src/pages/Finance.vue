<template>
  <div >
    <v-row>
      <v-col cols="12" sm="4">
        <v-card title="Saldo">
          <v-card-text :class="totalAmount >= 0 ? 'text-success' : 'text-error'">R$ {{ totalAmount.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card title="Entradas">
          <v-card-text class="text-success">R$ {{ incoming.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card title="Saídas">
          <v-card-text class="text-error">R$ {{ outcoming.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-row class="mt-0">
              <v-col cols="12" md="3" lg="2" class="text-h6">Financeiro</v-col>
              <v-col cols="12" md="9" lg="10">
                <v-row>
                  <v-col cols="12" sm="2" md="3" lg="3">
                    <v-text-field
                      v-model="search"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      append-inner-icon="mdi-magnify"
                      placeholder="Buscar Transação">
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" sm="2" md="3" lg="3">
                    <v-date-input
                      v-model="dateFilter"
                      multiple="range"
                      hide-details="auto"
                      variant="outlined"
                      density="compact"
                      prepend-icon=""
                      v-maska="'##/##/####'"
                      append-inner-icon="$calendar"
                      label="Selecione a data"
                      clearable
                    >
                      <template #dateIcon>
                        <v-icon>mdi mdi-calendar-outline</v-icon>
                      </template>
                    </v-date-input>
                  </v-col>
                  <v-col cols="12" sm="5" md="3" lg="4">
                    <v-btn block append-icon="mdi-plus" @click="transactionDialog = true" class="py-1" color="primary">Adicionar Transação</v-btn>
                  </v-col>
                  <v-col cols="12" sm="3" md="3" lg="2">
                    <v-btn block append-icon="mdi-table" @click="download" class="py-1" color="primary">Exportar</v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-title>
          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            :headers="headers"
            :items="serverItems"
            :items-length="totalItems"
            :loading="loading"
            :search="search"
            item-value="name"
            @update:options="loadItems"
          >
            <template v-slot:[`item.type`]="{ item }">
              {{ item.type === 1 ? 'Entrada' : 'Saída' }}
            </template>
            <template v-slot:[`item.method`]="{ item }">
              {{ getTransaction(item.method) }}
            </template>
            <template v-slot:[`item.date`]="{ item }">
              {{ getDateTime(item.date) }}
            </template>
            <template v-slot:[`item.amount`]="{ item }">
              <div :class="item.type === 1 ? 'text-success' : 'text-error'">
                R$ {{ item.amount.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") }}
              </div>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-icon :disabled="loading" v-bind="props">mdi-dots-vertical</v-icon>
                </template>
          
                <v-list>
                  <v-list-item prepend-icon="mdi-delete" density="comfortable" @click="selectedItem = item; dialog = true" title="Excluir"></v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-data-table-server>
        </v-card>
        <v-dialog
          v-model="dialog"
          width="auto"
        >
          <v-card
            max-width="400"
            prepend-icon="mdi-alert-outline"
            text="Esses dados não podem ser restaurados"
            title="Deseja excluir essa transação?"
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
        <Transaction :transactionDialog="transactionDialog" @reload="loadItems({ page:1, itemsPerPage: 10, sortBy: []})" @close="transactionDialog = false"></Transaction>
      </v-col>
    </v-row>
  </div>
</template>

<script>
  import transactionService from '../services/transaction.service'
  import { VDateInput } from 'vuetify/labs/VDateInput'
  import { vMaska } from "maska/vue"
  import { format, parseISO } from 'date-fns'
  import Transaction from '@/components/Transaction.vue'
  import { toast } from 'vue3-toastify'

  export default {
    name: "FinancePage",
    components: {
      VDateInput,
      Transaction
    },
    directives: { maska: vMaska },
    data: () => ({
      format,
      parseISO,
      dateFilter: [],
      dialog: false,
      incoming: 0.00,
      outcoming: 0.00,
      itemsPerPage: 5,
      transactionDialog: false,
      selectedItem: null,
      totalAmount: 0,
      search: '',
      headers: [
        {
          title: 'Tipo da Transação',
          align: 'start',
          sortable: true,
          key: 'type',
        },
        { title: 'Valor', key: 'amount', align: 'start' },
        { title: 'Data', key: 'date', align: 'start' },
        { title: 'Forma de Pagamento', key: 'method', align: 'start' },
        { title: 'Descrição', key: 'description', align: 'start' },
        { title: '', key: 'actions', align: 'start' },
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
    computed: {
      currentUser() {
        return this.$store.state.auth.user
      },
    },
    watch: {
      dateFilter() {
        this.loadItems ({ page:1, itemsPerPage: 10, sortBy: []})
      }
    },
    methods: {
      getTransaction(type) {
        const types = ['', 'Dinheiro', 'Cartão', 'Pix']
        return types[type]
      },
      loadItems ({ page, itemsPerPage, sortBy }) {
        this.loading = true
        if (sortBy.length <= 1) {
          sortBy.push ({
            order: 'desc',
            key: 'id'
          })
        }

        const dates = this.dateFilter.map((date) => date.toISOString())
        transactionService.getTransactions(`page=${page}&itemsPerPage=${itemsPerPage}&sort=${sortBy[0].key}&order=${sortBy[0].order}` + (this.dateFilter.length > 0 ? `&search=${this.search}&startDate=${dates[0]}&finishDate=${dates[dates.length-1]}` : '')).then((response) => {
          this.serverItems = response.data.list.data
          this.totalItems = response.data.list.total
          this.incoming = response.data.incoming
          this.outcoming = response.data.outcoming
          this.totalAmount = response.data.total
          this.loading = false
        })
      },
      remove () {
        this.loading = true
        transactionService.deleteTransaction(this.selectedItem.id).then(() => {
          this.dialog = false
          this.formattedValue = null
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
      getDateTime(date) {
        return format(parseISO(date), 'dd/MM/yyyy')
      },
      download() {
        this.loading = true

        const dates = this.dateFilter.map((date) => date.toISOString())
        transactionService.exportTransactions((this.dateFilter.length > 0 ? `startDate=${dates[0]}&finishDate=${dates[dates.length-1]}` : '')).then((response) => {
          const blob = new Blob([response.data], { type: 'text/csv' })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = 'Relatório'
          link.click()
          URL.revokeObjectURL(link.href)
          this.loading = false
        })
      }
    },
  }
</script>
