<template>
  <v-form @submit.prevent="schedule" v-model="valid">
    <v-card
      max-width="620"
      prepend-icon="mdi-calendar-edit-outline"
      :subtitle="client ? ' para ' + client.name : customClient ? ' para ' + clients.filter((c) => customClient === c.id)[0]?.name : ''"
      :title="event ? 'Alterar agendamento' : 'Novo agendamento'"
    >
      <v-card-text>
        <v-row dense class="ga-1">

          <!-- Tipo de agendamento -->
          <v-col cols="12" :sm="currentUser.type !== 1 ? 7 : 12">
            <v-select
              :items="allProcedures"
              item-title="name"
              item-value="id"
              hide-details="auto"
              multiple
              v-model="procedures"
              :loading="loading"
              :disabled="loading"
              :rules="rules"
              variant="outlined"
              density="compact"
              label="Tipo de agendamento"
            />
          </v-col>

          <!-- Doutor (apenas para não-médicos) -->
          <v-col v-if="currentUser.type !== 1" cols="12" sm="5">
            <v-select
              :items="users"
              item-title="name"
              item-value="id"
              hide-details="auto"
              v-model="user"
              :loading="loading"
              :disabled="loading"
              :rules="rules"
              variant="outlined"
              density="compact"
              label="Doutor"
            />
          </v-col>

          <!-- Paciente -->
          <v-col v-if="!client" cols="12">
            <v-autocomplete
              :items="clients"
              item-title="name"
              item-value="id"
              hide-details="auto"
              v-model="customClient"
              :loading="loading"
              :disabled="loading"
              :rules="rules"
              variant="outlined"
              density="compact"
              label="Paciente"
            />
          </v-col>

          <!-- Duração + Horário na mesma linha -->
          <v-col cols="6">
            <v-text-field
              v-model="duration"
              :rules="rules"
              hide-details="auto"
              :loading="loading"
              :disabled="loading"
              type="number"
              variant="outlined"
              density="compact"
              label="Duração (min)"
              prepend-inner-icon="mdi-timer-outline"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="scheduleTime"
              :rules="rules"
              :loading="loading"
              :disabled="loading"
              type="time"
              variant="outlined"
              density="compact"
              label="Horário"
              hide-details="auto"
              prepend-inner-icon="mdi-clock-outline"
            />
          </v-col>

          <!-- Observação ocupa linha inteira -->
          <v-col cols="12">
            <v-textarea
              v-model="description"
              :loading="loading"
              :disabled="loading"
              hide-details="auto"
              variant="outlined"
              auto-grow
              rows="2"
              density="compact"
              label="Observação"
            />
          </v-col>

          <!-- Separador -->
          <v-col cols="12" class="pt-2 pb-1">
            <v-divider />
          </v-col>

          <!-- Calendário centralizado -->
          <v-col cols="12">
            <div class="scheduler-calendar">
              <mini-calendar v-model="scheduleDate" />
            </div>
          </v-col>

        </v-row>
      </v-card-text>

      <template v-slot:actions>
        <v-btn
          class="ms-auto"
          text="Cancelar"
          :disabled="loading"
          @click="$emit('cancel'); clear()"
        />
        <v-btn
          text="Agendar"
          color="primary"
          :disabled="loading || !valid || !scheduleDate || !scheduleTime"
          :loading="loading"
          @click="schedule"
        />
      </template>
    </v-card>
  </v-form>
</template>

<script>
import clientService from '../../services/client.service'
import appointmentService from '../../services/appointment.service'
import procedureService from '../../services/company.service'
import userService from '../../services/user.service'
import MiniCalendar from './MiniCalendar.vue'
import { vMaska } from 'maska/vue'
import { format, parseISO, setHours, setMinutes } from 'date-fns'
import { toast } from 'vue3-toastify'

export default {
  name: 'ClientScheduler',
  components: { MiniCalendar },
  directives: { maska: vMaska },
  props: { client: Object, event: Object, preselectedDate: String },
  emits: ['cancel', 'reload'],
  data: () => ({
    format,
    parseISO,
    valid: false,
    users: [],
    user: null,
    clients: [],
    allProcedures: [],
    customClient: null,
    scheduleDate: null,
    scheduleTime: null,
    description: '',
    procedures: [],
    duration: 60,
    rules: [
      value => {
        if (value) return true
        return 'Este campo não pode estar vazio.'
      },
    ],
    loading: false,
  }),
  computed: {
    currentUser() {
      return this.$store.state.auth.user
    },
  },
  created() {
    this.loading = true
    this.clear()
    if (this.preselectedDate) {
      const d = parseISO(this.preselectedDate)
      this.scheduleDate = d
      this.scheduleTime = format(d, 'HH:mm')
    }
    if (this.event) {
      const d = parseISO(this.event.date)
      this.scheduleDate = d
      this.scheduleTime = format(d, 'HH:mm')
      this.user = this.event.user_id
      this.procedures = this.event.procedures
      this.duration = this.event.duration
      this.description = this.event.description
    }
    userService.getAllUsers().then((response) => {
      this.users = response.data
    })
    clientService.getAllClients().then((response) => {
      this.clients = response.data
    })
    procedureService.getAllProcedures().then((response) => {
      this.allProcedures = response.data
      this.loading = false
    }).catch(() => {
      this.loading = false
    })
  },
  methods: {
    clear() {
      this.users = []
      this.user = null
      this.clients = []
      this.allProcedures = []
      this.customClient = null
      this.scheduleDate = null
      this.scheduleTime = null
      this.description = ''
      this.procedures = []
      this.duration = 60
    },
    schedule() {
      if (this.valid) {
        this.loading = true
        if (typeof this.scheduleTime === 'string') {
          this.scheduleDate = setHours(this.scheduleDate, this.scheduleTime.split(':')[0])
          this.scheduleDate = setMinutes(this.scheduleDate, this.scheduleTime.split(':')[1])
        }
        const data = {
          client_id: this.customClient ?? this.client?.id,
          user_id: this.user,
          date: this.scheduleDate.toISOString(),
          description: this.description,
          procedures: this.procedures,
          duration: this.duration,
        }
        if (this.event) {
          appointmentService.updateSchedule(this.event.id, data).then(() => {
            this.$emit('reload')
            this.$emit('cancel')
            this.clear()
          }, (error) => {
            this.loading = false
            toast.error((error.response?.data?.message) || error.message || error.toString())
          })
        } else {
          appointmentService.schedule(data).then(() => {
            this.$emit('reload')
            this.$emit('cancel')
            this.clear()
          }, (error) => {
            this.loading = false
            toast.error((error.response?.data?.message) || error.message || error.toString())
          })
        }
      }
    },
  },
}
</script>

<style scoped>
.scheduler-calendar {
  max-width: 340px;
  margin: 0 auto;
  padding: 4px 0 8px;
}
</style>
