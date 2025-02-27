<template>
  <v-form @submit.prevent="schedule" v-model="valid" >
    <v-card
      prepend-icon="mdi-calendar-edit-outline"
      :subtitle="client ? getName(type) + ' para ' + client.name : customClient ? getName(type) + ' para ' + clients.filter((client) => customClient === client.id)[0].name : ''"
      :title="event ? 'Alterar agendamento' : 'Novo agendamento'"
    >
    <v-card-text>
        <v-row>
          <v-col cols="12" :md="currentUser.type === 1 && client ? '6' : currentUser.type === 1 && !client ? '4' : '3'">
            <v-select
              :items="[
                {label: 'Consulta', id: 1},
                {label: 'Extração', id: 2},
                {label: 'Manutenção', id: 3}
              ]"
              item-title="label"
              item-value="id"
              hide-details="auto"
              v-model="type"
              :loading="loading"
              :disabled="loading"
              :rules="rules"
              variant="outlined"
              density="compact"
              label="Tipo de agendamento"
            ></v-select>
          </v-col>
          <v-col cols="12" :md="client  ? '6' : '3'" v-if="currentUser.type !== 1">
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
            ></v-select>
          </v-col>
          <v-col cols="12" :md="currentUser.type === 1 && client ? '6' : currentUser.type === 1 && !client ? '4' : '3'" v-if="!client">
            <v-select
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
              label="Cliente"
            ></v-select>
          </v-col>
          <v-col cols="12" :md="currentUser.type === 1 && client ? '6' : currentUser.type === 1 && !client ? '4' : '3'">
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
          </v-col>
          <v-col cols="12">
            <div class="d-sm-flex justify-space-around border">
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
        @click="this.$emit('cancel'); scheduleDate = null; description = ''; type = 1; duration = 60;"
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
  import clientService from '../services/client.service'
  import appointmentService from '../services/appointment.service'
  import userService from '../services/user.service'
  import { vMaska } from "maska/vue"
  import { format, parseISO, setHours, setMinutes } from 'date-fns'
  import { VTimePicker } from 'vuetify/labs/VTimePicker'
  import { toast } from 'vue3-toastify'

  export default {
    name: 'ClientScheduler',
    components: {
      VTimePicker
    },
    directives: { maska: vMaska },
    props: {client: Object, event: Object},
    emits: ['cancel', 'reload'],
    data: () => ({
      format,
      parseISO,
      valid: false,
      users: [],
      user: null,
      clients: [],
      customClient: null,
      scheduleDate: null,
      scheduleTime: null,
      description: '',
      type: 1,
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
      if (this.event) {
        console.log(this.event)
        this.scheduleDate = parseISO(this.event.date)
        this.scheduleTime = parseISO(this.event.date)
        this.user = this.event.user_id
        this.type = this.event.type
        this.duration = this.event.duration
        this.description = this.event.description
      }
      userService.getAllUsers().then((response) => {
        this.users = response.data
      })
      clientService.getAllClients().then((response) => {
        this.clients = response.data
      })
    },
    methods: {
      schedule () {
        if (this.valid) {
          this.loading = true
          this.scheduleDate = setHours(this.scheduleDate,this.scheduleTime.split(':')[0])
          this.scheduleDate = setMinutes(this.scheduleDate,this.scheduleTime.split(':')[1])
          const data = {
            client_id: this.customClient ?? this.client.id,
            user_id: this.user,
            date: this.scheduleDate.toISOString(),
            description: this.description,
            type: this.type,
            duration: this.duration,
          }
          if (this.event) {
            appointmentService.updateSchedule(this.event.id, data).then(() => {
              this.$emit('reload')
              this.$emit('cancel')
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
      getName(type) {
        switch (type) {
          case 1:
            return 'Consulta'
          case 2:
            return 'Extração'
          case 3:
            return 'Manutenção'
          default:
            return 'Consulta'
        }
      },
    },
  }
</script>

<style>
.v-time-picker {
  padding-top:16px !important;
}

.v-time-picker-controls__time__btn.v-btn--density-default.v-btn {
  height: 80px !important;
}
</style>
