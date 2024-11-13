<template>
  <v-row class="pa-md-9">
    <v-col cols="12" md="8" class="d-flex flex-column ga-6">
      <v-card :loading="loading" title="Ultimos 30 dias">
        <v-card-text v-if="!loading" class="d-flex flex-column ga-1">
          <div v-for="transaction in transactions.slice(0,3)" :key="transaction.id">
            <div :class="transaction.type === 1 ? 'text-success' : 'text-error'">
              <v-icon>mdi-calendar-outline</v-icon> {{ transaction.type === 1 ? 'Entrada' : 'Saida' }} de R$ {{ transaction.amount.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") }}
            </div>
          </div>
        </v-card-text>
        <v-card-text v-if="!loading" class="d-flex flex-column">
          <Line :data="info" :options="options" :key="info.datasets[0].data.length" />
        </v-card-text>
        <v-card-text v-else>
          <v-skeleton-loader
            class="mx-auto border"
            type="article"
          ></v-skeleton-loader>
          </v-card-text>
      </v-card>
      <v-card v-if="appointment && appointment.client" :loading="loading" title="Próximo cliente na agenda" class="next-appointment">
        <v-card-text class="d-flex flex-column ga-6" v-if="!loading">
          <div class="d-flex ga-6 align-center">
            <v-avatar color="surface-variant" size="57">
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
            </div>
          </div>
          <v-btn color="primary" class="ml-auto text-white" variant="tonal" @click="view()">Ver Odontograma</v-btn>
        </v-card-text>
        <v-card-text v-else>
          <v-skeleton-loader
            class="mx-auto border"
            type="article"
          ></v-skeleton-loader>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col>
      <v-card :loading="loading" style="height: calc(100vh - 228px) !important" class="overflow-y-scroll">
        <v-card-title>
          <div class="text-h6">Agenda do dia</div>
        </v-card-title>
        <v-card-text>
          <calendar :show-header="true" :grid-height="1300"/>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
  import userService from '../services/user.service'
  import { format, parseISO } from 'date-fns'
  import Calendar from '../components/Calendar.vue'
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  } from 'chart.js'
  import { Line } from 'vue-chartjs'

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  )

  export default {
    name: "HomePage",
    components: {
      Line,
      Calendar
    },
    data() {
      return {
        loading: true,
        appointment: {},
        transactions: [],
        info: {
          labels: [],
          datasets: [
            {
              label: 'Saldo',
              backgroundColor: '#f87979',
              data: []
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      }
    },
    mounted() {
      this.getFinancialResume()
      this.getNextAppointment()
    },
    methods: {
      getFinancialResume() {
        let balance = 0
        let values = []
        userService.getTransactions('page=1&itemsPerPage=10&sort=date&order=asc').then((response) => {
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
        userService.getNextAppointment().then((response) => {
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
  color: white;
}
</style>
