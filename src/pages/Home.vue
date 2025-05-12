<template>
  <v-row>
    <v-col cols="12" md="8" class="d-flex flex-column ga-6">
      <div>
        <v-row>
          <v-col cols="12" md="6" class="d-flex flex-column ga-6">
            <v-card @click="newClientDialog = true" class="action-card cursor-pointer" title="Ações Rápidas">
              <v-card-text class="d-flex h-100">
                <span class="mx-auto mt-4 d-flex flex-column">
                  <img width="48" class="cursor-pointer mx-auto" :src="require('../assets/user-add-fill.svg')"/>
                  Adicionar Paciente
                </span>
              </v-card-text>
            </v-card>
            <div class="d-flex ga-6">
              <v-card @click="schedulerDialog = true" class="w-100 action-card cursor-pointer">
                <v-card-text class="d-flex h-100">
                <span class="ma-auto d-flex flex-column">
                  <img width="48" class="cursor-pointer ma-auto" :src="require('../assets/calendar-event-fill.svg')"/>
                  Adicionar Evento
                </span>
              </v-card-text>
              </v-card>
              <v-card @click="transactionDialog = true" class="w-100 action-card cursor-pointer">
                <v-card-text class="d-flex h-100">
                <span class="ma-auto d-flex flex-column">
                  <img width="48" class="cursor-pointer ma-auto" :src="require('../assets/currency-fill.svg')"/>
                  Adicionar Transação
                </span>
              </v-card-text>
              </v-card>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="h-100" :loading="loading" :title="transactions.length > 0 ? 'Ultimos 30 dias' : ''">
              <v-card-text v-if="!loading && transactions.length > 0" class="d-flex flex-column ga-1">
                <div v-for="transaction in transactions.slice(0,3)" :key="transaction.id">
                  <div :class="transaction.type === 1 ? 'text-success' : 'text-error'">
                    <v-icon>mdi-calendar-outline</v-icon> {{ transaction.type === 1 ? 'Entrada' : 'Saida' }} de R$ {{ transaction.amount.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") }}
                  </div>
                </div>
              </v-card-text>
              <v-card-text v-if="!loading && transactions.length > 0" class="d-flex pa-0 flex-column">
                <Line style="height: 225px;" :data="info" :options="options" :key="info.datasets[0].data.length" />
              </v-card-text>
              <v-card-text v-else-if="!loading && transactions.length === 0" style="height: 345px" class="w-100 d-flex">
                <div class="ma-auto d-flex flex-column">
                  <div class="mx-auto"><img src="../assets/no-finance.png" /></div>
                  <div>Sem transações cadastradas</div>
                </div>
              </v-card-text>
              <v-card-text v-else>
                <v-skeleton-loader
                  class="mx-auto border"
                  type="article"
                ></v-skeleton-loader>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
      <v-card :loading="loading" :title="appointment ? 'Próximo paciente na agenda' : ''" :class="appointment ? 'next-appointment' : ''">
        <v-card-text v-if="!loading && appointment?.client" class="d-flex flex-column next-appointment-height ga-6">
          <div class="d-flex ma-auto ga-6">
            <v-avatar color="surface-variant" size="120">
              <v-img :src="appointment.client.avatar ?? 'https://ui-avatars.com/api/?name='+appointment.client.name.replaceAll(' ', '+') + '&background=random'" cover></v-img>
            </v-avatar>
            <div class="d-flex flex-column ga-2">
              <div class="d-flex ga-2 align-center">
                <v-icon>mdi-calendar-outline</v-icon>
                <div>{{ getDateTime(appointment.date) }}</div>
              </div>
              <div class="d-flex ga-2 align-center">
                <v-icon>mdi-account-outline</v-icon>
                <div>{{ appointment.client.name }}</div>
              </div>
              <div class="d-flex ga-2 align-center">
                <v-icon>mdi-phone-outline</v-icon>
                <div>{{ appointment.client.phone ?? 'Nenhum telefone cadastrado'  }}</div>
              </div>
              <v-btn v-if="!loading && appointment?.client" color="primary" class="text-white" variant="tonal" @click="view()">Ver Odontograma</v-btn>
            </div>
          </div>
        </v-card-text>
        <v-card-text v-else-if="!loading && !appointment" style="height: 345px" class="w-100 d-flex">
          <div class="ma-auto d-flex flex-column">
            <div class="mx-auto"><img src="../assets/no-clients.png" /></div>
            <div>Sem pacientes marcados</div>
          </div>
        </v-card-text>
        <v-card-text v-else>
          <v-skeleton-loader
            class="mx-auto border"
            type="article"
          ></v-skeleton-loader>
        </v-card-text>
        <v-spacer></v-spacer>
      </v-card>
    </v-col>
    <v-col>
      <v-card :loading="loading">
        <v-card-title>
          <div class="text-h6">Agenda do dia</div>
        </v-card-title>
        <v-card-text>
          <calendar :show-header="true" :gridHeight="624" :limits="{
            start: '07:00',
            end: '19:00',
          }"/>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-dialog
    v-model="schedulerDialog"
    max-width="800"
    width="auto"
  >
    <scheduler @cancel="schedulerDialog = false" @reload="init"/>
  </v-dialog>

  <v-dialog
    v-model="newClientDialog"
    max-width="800"
  >
    <client-register :selectedClient="this.selectedItem" @cancel="newClientDialog = false" @reload="newClientDialog = false"/>
  </v-dialog>
  <Transaction :transactionDialog="transactionDialog" @reload="init" @close="transactionDialog = false"></Transaction>
</template>

<script>
  import transactionService from '../services/transaction.service'
  import appointmentService from '../services/appointment.service'
  import { format, parseISO } from 'date-fns'
  import Calendar from '../components/Calendar.vue'
  import Scheduler from '../components/Scheduler.vue'
  import Transaction from '../components/Transaction.vue'
  import ClientRegister from '../components/ClientRegister.vue'
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
  } from 'chart.js'
  import { Line } from 'vue-chartjs'

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend
  )

  export default {
    name: "HomePage",
    components: {
      Line,
      Calendar,
      Scheduler,
      Transaction,
      ClientRegister
    },
    data() {
      return {
        loading: true,
        schedulerDialog: false,
        transactionDialog: false,
        newClientDialog: false,
        appointment: {},
        transactions: [],
        info: {
          labels: [],
          datasets: [
            {
              label: 'Saldo',
              backgroundColor: (ctx) => {
                const canvas = ctx.chart.ctx;
                const gradient = canvas.createLinearGradient(0,0,0,540);

                gradient.addColorStop(0, '#ECDDFF')
                gradient.addColorStop(.5, '#FFFFFF')
                gradient.addColorStop(1, '#EADAFF')

                return gradient;
              },
              data: [],
              fill: 'start',
              cubicInterpolationMode: 'monotone',
              tension: 0.4,
              borderWidth: 1.5,
              borderColor: '#C62977'
            }
          ]
        },
        options: {    
          radius: 1,
          plugins: {
            legend: {
              display: false
            },
            filler: {
              propagate: true
            },
          },
          scales: {
            x: {
              ticks: {
                display: false,
              },
              grid: {
                display: false
              },
            },
            y: {
              ticks: {
                display: false
              },
              grid: {
                display: false
              },
            },
          },
          layout: {
            padding: {
              left: -10,
              right: 0,
              bottom: -10
            },
            autoPadding: false
          },
          responsive: true,
          maintainAspectRatio: false
        }
      }
    },
    mounted() {
      this.init()
    },
    methods: {
      init() {
        this.getFinancialResume()
        this.getNextAppointment()
      },
      getFinancialResume() {
        let balance = 0
        let values = []
        transactionService.getTransactions('page=1&itemsPerPage=10&sort=date&order=asc').then((response) => {
          this.transactions = response.data.list.data
          this.info.labels = response.data.list.data.map((transaction) => this.getDate(transaction.date))
          this.transactions.forEach((transaction) => {
            if (transaction.type === 1) {
              balance = balance + transaction.amount
            } else {
              balance = balance - transaction.amount
            }
            values.push(balance)
          })
          this.info.datasets[0].data = values
        })
      },
      getNextAppointment() {
        appointmentService.getNextAppointment().then((response) => {
          this.appointment = response.data
          this.loading = false
        })
      },
      getDateTime(date) {
        return format(parseISO(date), 'dd/MM/yyyy kk:mm')
      },
      getDate(date) {
        return format(parseISO(date), 'dd/MM/yyyy')
      },
      view () {
        this.$router.push({
          name: 'client-details',
          params: { id: this.appointment.client.id }
        })
      },
    }
  }
</script>

<style scoped>
.sx__calendar-header-content:last-of-type {
  display: none !important;
}

.sx__week-header-content {
  display: none !important;
}

.sx__calendar-header {
  padding-top: 0 !important;
}

.next-appointment {
  background: linear-gradient(134.56deg, #D6C3C3 -6.74%, #DBA5D5 105.74%);
  color: white !important;
}

.next-appointment-height {
  background: linear-gradient(134.56deg, #D6C3C3 -6.74%, #DBA5D5 105.74%);
  color: white;
  height: 365px !important;
}

.action-card {
  height: 170.5px;
}

.dashboard-card {
  height: 100% !important;
}
</style>
