<template>
  <v-form @submit.prevent="schedule" v-model="valid" >
    <v-card
      width="1100"
      prepend-icon="mdi-calendar-edit-outline"
      :subtitle="client ?  ' para ' + client.name : customClient ? ' para ' + clients.filter((client) => customClient === client.id)[0].name : ''"
      :title="event ? 'Alterar agendamento' : 'Novo agendamento'"
    >
    <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <div class=" d-flex flex-column ga-6 mb-4">
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
              ></v-select>
              <v-select 
                v-if="currentUser.type !== 1"
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
              ></v-select>
              <v-autocomplete
                v-if="!client"
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
              ></v-autocomplete>
              <v-text-field
                v-model="duration"
                :rules="rules"
                hide-details="auto"
                :loading="loading"
                :disabled="loading"
                type="number"
                variant="outlined"
                density="compact"
                hint="Em minutos"
                label="Duração">
              </v-text-field>
              <v-textarea     
                rows="10"
                row-height="30"
                class="h-fill"
                v-model="description"
                :loading="loading"
                :disabled="loading"
                hide-details="auto"
                variant="outlined"
                auto-grow
                density="compact"
                label="Observação">
              </v-textarea>
            </div>
          </v-col>
          <v-col cols="12" md="8">
            <div class="d-sm-flex justify-space-around border rounded">
              <v-date-picker
                v-model="scheduleDate"
                :rules="rules"
                :loading="loading"
                :disabled="loading"
                label="Selecione a data"
              >
              </v-date-picker>
              <v-time-picker
                v-model="scheduleTime"
                :rules="rules"
                :loading="loading"
                :disabled="loading"
                format="24hr"
                title="Selecione o horário"
              >
              </v-time-picker>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <template v-slot:actions>
        <v-btn
        class="ms-auto"
        text="Cancelar"
        :disabled="loading"
        @click="this.$emit('cancel'); clear()"
        ></v-btn>
        <v-btn
        text="Agendar"
        color="primary"
        :disabled="loading || !valid || !scheduleDate || !scheduleTime"
        :loading="loading"
        @click="schedule"
        ></v-btn>
      </template>
    </v-card>
  </v-form>
</template>

<script>
  import clientService from '../../services/client.service'
  import appointmentService from '../../services/appointment.service'
  import procedureService from '../../services/company.service'
  import userService from '../../services/user.service'
  import { vMaska } from "maska/vue"
  import { format, parseISO, setHours, setMinutes } from 'date-fns'
  // import { VTimePicker } from 'vuetify/labs/VTimePicker'
  import { toast } from 'vue3-toastify'

  export default {
    name: 'ClientScheduler',
    components: {
      // VTimePicker
    },
    directives: { maska: vMaska },
    props: {client: Object, event: Object, preselectedDate: Date},
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
      }
    },
    created() {
      this.loading = true
      this.clear()
      if (this.preselectedDate) {
        this.scheduleDate = parseISO(this.preselectedDate)
        this.scheduleTime = parseISO(this.preselectedDate)
      }
      if (this.event) {
        this.scheduleDate = parseISO(this.event.date)
        this.scheduleTime = parseISO(this.event.date)
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
      schedule () {
        if (this.valid) {
          this.loading = true
          if (typeof this.scheduleTime === 'string' || this.scheduleTime instanceof String) {
            this.scheduleDate = setHours(this.scheduleDate,this.scheduleTime.split(':')[0])
            this.scheduleDate = setMinutes(this.scheduleDate,this.scheduleTime.split(':')[1])
          } 
          const data = {
            client_id: this.customClient ?? this.client.id,
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
            },
              (error) => {
                this.loading = false
                toast.error((error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                  error.message ||
                  error.toString())
              })
          } else {
            appointmentService.schedule(data).then(() => {
              this.$emit('reload')
              this.$emit('cancel')
              this.clear()
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
        }
      },
    },
  }
</script>

<style>
.v-time-picker {
  padding-top:16px !important;
}

.v-picker {
  background: transparent;
}

.v-time-picker-controls__time__btn.v-btn--density-default.v-btn {
  height: 80px !important;
}
</style>
