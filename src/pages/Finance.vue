<template>
  <div class="pa-md-9">
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
              <v-col cols="12" md="3" class="text-h6">Financeiro</v-col>
              <v-col cols="12" md="9">
                <v-row>
                  <v-col cols="12" sm="4" md="3" lg="3">
                    <v-text-field
                      v-model="search"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      append-inner-icon="mdi-magnify"
                      placeholder="Buscar Transação">
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="3" lg="3">
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
                  <v-col cols="12" sm="5" md="3" lg="3">
                    <v-btn block append-icon="mdi-plus" @click="transactionDialog = true" class="py-1" color="primary">Adicionar Transação</v-btn>
                  </v-col>
                  <v-col cols="12" sm="3" md="3" lg="3">
                    <v-btn block append-icon="mdi-table" @click="dialog = true" class="py-1" color="primary">Exportar</v-btn>
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
              {{ item.type === 1 ? 'Dinheiro' : item.type === 2 ? 'Cartão' : 'Pix' }}
            </template>
            <template v-slot:[`item.date`]="{ item }">
              {{ getDateTime(item.date) }}
            </template>
            <template v-slot:[`item.amount`]="{ item }">
              <div :class="item.type === 1 ? 'text-success' : 'text-error'">
                R$ {{ item.amount.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") }}
              </div>
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
        <v-dialog
          v-model="transactionDialog"
          max-width="700"
          width="auto"
        >
          <v-form @submit.prevent="addTransaction" v-model="valid" >
            <v-card
              prepend-icon="mdi-calendar-edit-outline"
              title="Nova transação"
            >
            <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-select
                      :items="[
                        {label: 'Entrada', id: 1},
                        {label: 'Saida', id: 2},
                      ]"
                      item-title="label"
                      item-value="id"
                      v-model="type"
                      :loading="loading"
                      :disabled="loading"
                      :rules="rules"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      label="Tipo de transação"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-select
                      :items="[
                        {label: 'Dinheiro', id: 1},
                        {label: 'Cartão', id: 2},
                        {label: 'Pix', id: 3},
                      ]"
                      item-title="label"
                      item-value="id"
                      v-model="method"
                      :loading="loading"
                      hide-details="auto"
                      :disabled="loading"
                      :rules="rules"
                      variant="outlined"
                      density="compact"
                      label="Método de execução"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="formattedValue"
                      @update:modelValue="setAmount"
                      ref="inputRef"
                      :rules="rules"
                      :loading="loading"
                      :disabled="loading"
                      hide-details="auto"
                      variant="outlined"
                      density="compact"
                      label="Valor">
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-date-input
                      v-model="transactionDate"
                      :rules="rules"
                      :loading="loading"
                      :disabled="loading"
                      hide-details="auto"
                      variant="outlined"
                      density="compact"
                      prepend-icon=""
                      v-maska="'##/##/####'"
                      append-inner-icon="$calendar"
                      label="Selecione a data"
                    >
                      <template #dateIcon>
                        <v-icon>mdi mdi-calendar-outline</v-icon>
                      </template>
                    </v-date-input>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      :items="clients"
                      item-title="name"
                      item-value="id"
                      hide-details="auto"
                      v-model="client"
                      :loading="loading"
                      :disabled="loading"
                      variant="outlined"
                      density="compact"
                      label="Cliente"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="description"
                      :loading="loading"
                      :disabled="loading"
                      hide-details="auto"
                      variant="outlined"
                      density="compact"
                      label="Descrição">
                    </v-textarea>
                  </v-col>
                </v-row>
              </v-card-text>
              <template v-slot:actions>
                <v-btn
                class="ms-auto"
                text="Cancelar"
                :disabled="loading"
                @click="transactionDialog = false; transactionDate = new Date(); description = ''; type = null; amount = null; formattedValue = null; client = null"
                ></v-btn>
                <v-btn
                text="Salvar"
                color="primary"
                :disabled="loading || !valid"
                :loading="loading"
                @click="addTransaction(); transactionDialog = false; transactionDate = new Date(); description = ''; type = null; amount = null; formattedValue = null; client = null"
                ></v-btn>
              </template>
            </v-card>
          </v-form>
        </v-dialog>
        <v-snackbar
          v-model="snackbar"
        >
          {{ message }}
          <template v-slot:actions>
            <v-btn
              color="red"
              variant="text"
              class="text-none"
              @click="snackbar = false"
            >
              Fechar
            </v-btn>
          </template>
        </v-snackbar>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import { useCurrencyInput } from 'vue-currency-input'
  import { watch, defineProps } from 'vue'

  const props = defineProps({ modelValue: Number })

  const { inputRef, formattedValue, setValue } = useCurrencyInput({
    currency: 'BRL',
    hideCurrencySymbolOnFocus: false,
    hideGroupingSeparatorOnFocus: false,
    precision: 2,
    narrowSymbol: 'R$ ',
    autoDecimalDigits: true,
    locale: 'pt-BR',
    valueRange: { min: 0 }
  })

  watch(
    () => props.modelValue,
    (value) => {
      setValue(value)
      this.amount = value
    }
  )
</script>

<script>
  import userService from '../services/user.service'
  import { VDateInput } from 'vuetify/labs/VDateInput'
  import { vMaska } from "maska/vue"
  import { format, parseISO } from 'date-fns'


  export default {
    name: "FinancePage",
    components: {
      VDateInput,
    },
    directives: { maska: vMaska },
    data: () => ({
      format,
      parseISO,
      dateFilter: [],
      valid: false,
      clients: [],
      client: null,
      transactionDate: new Date(),
      dialog: false,
      description: '',
      type: null,
      method: 1,
      amount: 0.00,
      incoming: 0.00,
      outcoming: 0.00,
      snackbar: false,
      message: false,
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
    created() {
      userService.getAllClients().then((response) => {
        this.clients = response.data
      })
    },
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
      setAmount(value) {
        const formatValue = value.replaceAll('R$ ', '').replaceAll('.', '').replaceAll(',', '')
        this.amount = parseFloat(formatValue.slice(0, formatValue.length-2).replaceAll('R$', '') + '.' + formatValue.slice(-2))
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
        userService.getTransactions(`page=${page}&itemsPerPage=${itemsPerPage}&sort=${sortBy[0].key}&order=${sortBy[0].order}` + (this.dateFilter.length > 0 ? `&search=${this.search}&startDate=${dates[0]}&finishDate=${dates[dates.length-1]}` : '')).then((response) => {
          this.serverItems = response.data.list.data
          this.totalItems = response.data.list.total
          this.incoming = response.data.incoming
          this.outcoming = response.data.outcoming
          this.totalAmount = response.data.total
          this.loading = false
        })
      },
      addTransaction () {
        if (this.valid) {
          this.loading = true
          const data = {
            date: this.transactionDate,
            description: this.description,
            type: this.type,
            amount: this.amount,
            method: this.method,
            client_id: this.client ? this.client.id : null
          }
          userService.addTransaction(data).then(() => {
            this.transactionDialog = false
            this.loadItems({
              page:1,
              itemsPerPage: 10,
              sortBy: []
            })
          },
            (error) => {
              this.loading = false
              this.snackbar = true
              this.message =
                (error.response &&
                  error.response.data &&
                  error.response.data.message) ||
                error.message ||
                error.toString()
            })
        }
      },
      remove () {
        this.loading = true
        userService.deleteTransaction(this.selectedItem.id).then(() => {
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
            this.snackbar = true
            this.message =
              (error.response &&
                error.response.data &&
                error.response.data.message) ||
              error.message ||
              error.toString()
          })
      },
      getDateTime(date) {
        return format(parseISO(date), 'dd/MM/yyyy')
      },
    },
  }
</script>
