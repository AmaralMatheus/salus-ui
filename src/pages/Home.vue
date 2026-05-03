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
        </v-row>
      </div>
      <!-- <v-card class="h-100" :loading="loading" title="Últimos 30 dias">
        <v-card-text v-if="!loading && transactions.length > 0" class="d-flex flex-column ga-2">
          <div v-for="transaction in transactions.slice(0, 2)" :key="transaction.id" class="transaction-item">
            <div class="transaction-icon" :class="transaction.type === 1 ? 'income' : 'expense'">
              <v-icon :color="transaction.type === 1 ? 'success' : 'grey'" size="16">
                {{ transaction.type === 1 ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </div>
            <div class="transaction-details">
              <div class="transaction-description">{{ transaction.description || (transaction.type === 1 ? 'Entrada de dinheiro' : 'Saída de dinheiro') }}</div>
              <div class="transaction-amount" :class="transaction.type === 1 ? 'text-success' : 'text-error'">
                {{ transaction.type === 1 ? '+' : '-' }}R$ {{ transaction.amount.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") }}
              </div>
            </div>
          </div>
          <div class="mt-2">
            <v-btn variant="text" size="small" color="primary" @click="$router.push('/financeiro')">
              ver mais
            </v-btn>
          </div>
        </v-card-text>
        <v-card-text v-if="!loading && transactions.length > 0" class="chart-container">
          <div class="chart-wrapper">
            <Line :data="chartData" :options="chartOptions" />
          </div>
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
      </v-card> -->
    </v-col>
    <v-col>
      <v-card :loading="loading" title="Agenda do dia">
        <v-card-text v-if="!loading && todayAppointments.length > 0" class="d-flex flex-column ga-1">
          <div v-for="appointment in todayAppointments.slice(0, 5)" :key="appointment.id" class="appointment-item">
            <div class="appointment-time">{{ getTimeOnly(appointment.date) }}</div>
            <div class="appointment-info">
              <div class="appointment-patient">{{ appointment.client?.name || 'Cliente nFão informado' }}</div>
              <div class="appointment-procedure">{{ getProcedureName(appointment.procedures) }}</div>
            </div>
            <div class="appointment-status" :style="{ backgroundColor: getProcedureColor(appointment.procedures) }"></div>
          </div>
          <div v-if="todayAppointments.length > 5" class="mt-2 ">
            <v-btn variant="text" size="small" color="primary" @click="$router.push('/agenda')">
              Ver mais ({{ todayAppointments.length - 5 }})
            </v-btn>
          </div>
        </v-card-text>
        <v-card-text v-else-if="!loading && todayAppointments.length === 0" style="height: 200px" class="w-100 d-flex">
          <div class="ma-auto d-flex flex-column">
            <div class="mx-auto"><img src="../assets/no-clients.png" width="64" /></div>
            <div>Sem agendamentos hoje</div>
          </div>
        </v-card-text>
        <v-card-text v-else>
          <v-skeleton-loader
            class="mx-auto border"
            type="list-item-three-line"
          ></v-skeleton-loader>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-dialog
    v-model="schedulerDialog"
    width="auto"
  >
    <scheduler @cancel="schedulerDialog = false" @reload="init"/>
  </v-dialog>

  <v-dialog
    v-model="newClientDialog"
    max-width="1300"
  >
    <client-register :selectedClient="this.selectedItem" @cancel="newClientDialog = false" @reload="newClientDialog = false"/>
  </v-dialog>
  <Transaction :transactionDialog="transactionDialog" @reload="init" @close="transactionDialog = false"></Transaction>
</template>

<script>
  import transactionService from '../services/transaction.service'
  import appointmentService from '../services/appointment.service'
  import { format, parseISO } from 'date-fns'
  // import Calendar from '../components/agenda/Calendar.vue'
  import Scheduler from '../components/agenda/Scheduler.vue'
  import Transaction from '../components/Transaction.vue'
  import ClientRegister from '../components/client/ClientRegister.vue'
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
      // Calendar,
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
        todayAppointments: [],
        chartData: {
          labels: [],
          datasets: [
            {
              label: 'Entradas',
              backgroundColor: 'rgba(236, 72, 153, 0.2)',
              borderColor: '#EC4899',
              data: [],
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4
            },
            {
              label: 'Saídas',
              backgroundColor: 'rgba(75, 85, 99, 0.2)',
              borderColor: '#4B5563',
              data: [],
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4
            }
          ]
        },
        chartOptions: {    
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              align: 'center',
              labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                  size: 11,
                  weight: '500'
                },
                boxWidth: 12,
                boxHeight: 12
              }
            },
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: false
            }
          },
          scales: {
            x: {
              display: false,
              grid: {
                display: false
              }
            },
            y: {
              display: false,
              grid: {
                display: false
              }
            }
          },
          interaction: {
            mode: 'index',
            intersect: false
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
        this.getTodayAppointments()
      },
      getFinancialResume() {
        transactionService.getTransactions('page=1&itemsPerPage=30&sort=date&order=asc').then((response) => {
          this.transactions = response.data.list.data
          this.prepareChartData()
        })
      },
      prepareChartData() {
        // Agrupar transações por data e calcular entradas e saídas
        const transactionsByDate = {}
        
        this.transactions.forEach(transaction => {
          const date = this.getDate(transaction.date)
          if (!transactionsByDate[date]) {
            transactionsByDate[date] = { income: 0, expense: 0 }
          }
          
          if (transaction.type === 1) {
            transactionsByDate[date].income += transaction.amount
          } else {
            transactionsByDate[date].expense += transaction.amount
          }
        })
        
        // Ordenar por data
        const sortedDates = Object.keys(transactionsByDate).sort()
        
        this.chartData.labels = sortedDates
        this.chartData.datasets[0].data = sortedDates.map(date => transactionsByDate[date].income)
        this.chartData.datasets[1].data = sortedDates.map(date => transactionsByDate[date].expense)
      },
      getTodayAppointments() {
        appointmentService.getAllAppointments().then((response) => {
          const today = new Date()
          this.todayAppointments = response.data.filter(appointment => {
            try {
              const appointmentDate = new Date(appointment.date)
              return appointmentDate.toDateString() === today.toDateString()
            } catch (error) {
              return false
            }
          }).sort((a, b) => new Date(a.date) - new Date(b.date))
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
      getTimeOnly(date) {
        return format(parseISO(date), 'HH:mm')
      },
      getProcedureName(procedure) {
        if (Array.isArray(procedure)) {
          return procedure[0]?.name || 'Procedimento'
        }
        if (procedure && typeof procedure === 'object' && procedure.name) {
          return procedure.name
        }
        if (typeof procedure === 'string') {
          return procedure
        }
        return 'Procedimento'
      },
      getProcedureColor(procedure) {
        const colors = {
          'Extração': '#FFD700',
          'Consulta': '#2196F3',
          'Limpeza': '#4CAF50',
          'Clareamento': '#FF9800',
          'Ortodontia': '#9C27B0',
          'default': '#E91E63'
        }
        
        if (Array.isArray(procedure)) {
          return colors[procedure[0]?.name] || colors.default
        }
        if (procedure && typeof procedure === 'object' && procedure.name) {
          return colors[procedure.name] || colors.default
        }
        if (typeof procedure === 'string') {
          return colors[procedure] || colors.default
        }
        return colors.default
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
  height: 312.5px !important;
}

.action-card {
  height: 170.5px;
}

.dashboard-card {
  height: 100% !important;
}

/* Estilos para lista de agendamentos */
.appointment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.appointment-item:last-child {
  border-bottom: none;
}

.appointment-time {
  font-size: 14px;
  font-weight: 600;
  color: #C62424;
  min-width: 50px;
}

.appointment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.appointment-patient {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.appointment-procedure {
  font-size: 12px;
  color: #666;
}

.appointment-status {
  width: 4px;
  height: 24px;
  border-radius: 2px;
}

/* Estilos para lista de transações */
.transaction-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.transaction-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.transaction-icon.income {
  background: rgba(76, 175, 80, 0.1);
}

.transaction-icon.expense {
  background: rgba(158, 158, 158, 0.1);
}

.transaction-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.transaction-description {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.transaction-amount {
  font-size: 14px;
  font-weight: 600;
}

/* Estilos para o gráfico com legenda interna */
.chart-container {
  padding: 0;
  position: relative;
  height: 225px;
  overflow: hidden;
}

.chart-wrapper {
  position: relative;
  height: 100%;
}

.chart-wrapper canvas {
  margin-bottom: -40px !important;
}

/* Ajustar a legenda para ficar sobreposta */
.chart-wrapper :deep(.chartjs-render-monitor) {
  margin-bottom: -40px !important;
}


</style>
