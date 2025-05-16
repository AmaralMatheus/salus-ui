<template>
  <v-dialog
    v-model="dialog"
    max-width="700"
    width="auto"
  >
    <v-form ref="form" @submit.prevent="addTransaction" v-model="valid" >
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
              <CurrencyInput v-model="amount" :loading="loading"></CurrencyInput>
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
                label="Paciente"
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
          @click="$emit('close'); transactionDate = new Date(); description = ''; type = null; amount = null; formattedValue = null; client = null"
          ></v-btn>
          <v-btn
          text="Salvar"
          color="primary"
          :disabled="loading || !valid"
          :loading="loading"
          @click="addTransaction(); $emit('close'); transactionDate = new Date(); description = ''; type = null; amount = null; formattedValue = null; client = null"
          ></v-btn>
        </template>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
  import clientService from '../services/client.service'
  import transactionService from '../services/transaction.service'
  import { VDateInput } from 'vuetify/labs/VDateInput'
  import { vMaska } from "maska/vue"
  import { format, parseISO } from 'date-fns'
  import CurrencyInput from './CurrencyInput.vue'
  import { toast } from 'vue3-toastify'

  export default {
    name: "FinancePage",
    components: {
      VDateInput,
      CurrencyInput
    },
    props: {transactionDialog: Boolean},
    emits: ['reload', 'close'],
    directives: { maska: vMaska },
    data: () => ({
      format,
      parseISO,
      valid: false,
      clients: [],
      client: null,
      transactionDate: new Date(),
      description: '',
      type: null,
      method: 1,
      amount: 0.00,
      rules: [
        value => {
          if (value) return true
          return 'Este campo não pode estar vazio.'
        },
      ],
      loading: true,
    }),
    computed: {
      dialog(){
        return this.transactionDialog
      }
    },
    created() {
      console.log(this.$refs
      )
      clientService.getAllClients().then((response) => {
        this.clients = response.data
        this.loading = false
      })
    },
    methods: {
      setAmount(value) {
        const formatValue = value.replaceAll('R$ ', '').replaceAll('.', '').replaceAll(',', '')
        this.amount = parseFloat(formatValue.slice(0, formatValue.length-2).replaceAll('R$', '') + '.' + formatValue.slice(-2))
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
            client_id: this.client
          }
          transactionService.addTransaction(data).then(() => {
            this.$emit('reload')
            this.loading = false
          },
            (error) => {
              this.loading = false
              toast.error((error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                  error.message ||
                  error.toString())
            })
        }
      },
    },
  }
</script>