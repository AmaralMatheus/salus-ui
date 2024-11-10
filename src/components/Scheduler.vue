<template>
  <v-form @submit.prevent="schedule" v-model="valid" >
    <v-card
      prepend-icon="mdi-calendar-edit-outline"
      :text="getName(type) + ' para ' + client.name"
      title="Novo agendamento"
    >
    <v-card-text>
        <v-row>
          <v-col cols="12" :md="currentUser.type === 1 ? '6' : '4'">
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
          <v-col cols="12" md="4" v-if="currentUser.type !== 1">
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
          <v-col cols="12" :md="currentUser.type === 1 ? '6' : '4'">
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
            <div class="d-md-flex border">
              <v-date-picker
                v-model="scheduleDate"
                :loading="loading"
                :disabled="loading"
                label="Selecione a data"
              >
              </v-date-picker>
              <v-time-picker
                v-model="scheduleTime"
                :loading="loading"
                :disabled="loading"
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
        :disabled="loading || !valid"
        :loading="loading"
        @click="schedule"
        ></v-btn>
      </template>
    </v-card>
  </v-form>
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
</template>

<script>
  import userService from '../services/user.service'
  import { VDateInput } from 'vuetify/labs/VDateInput'
  import { vMaska } from "maska/vue"
  import { format, parseISO, setHours, setMinutes } from 'date-fns'
  import { VTimePicker } from 'vuetify/labs/VTimePicker'

  export default {
    components: {
      VDateInput,
      VTimePicker
    },
    directives: { maska: vMaska },
    props: {client: Object},
    emits: ['cancel', 'reload'],
    data: () => ({
      format,
      parseISO,
      valid: false,
      users: [],
      user: null,
      scheduleDate: new Date(),
      scheduleTime: new Date(),
      description: '',
      type: 1,
      duration: 60,
      snackbar: false,
      message: false,
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
      userService.getAllUsers().then((response) => {
        this.users = response.data
      })
    },
    methods: {
      schedule () {
        if (this.valid) {
          this.loading = true
          this.scheduleDate = setHours(this.scheduleDate,this.scheduleTime.split(':')[0])
          this.scheduleDate = setMinutes(this.scheduleDate,this.scheduleTime.split(':')[1])
          const data = {
            client_id: this.client.id,
            user_id: this.user ? this.user.id : null,
            date: this.scheduleDate.toISOString(),
            description: this.description,
            type: this.type,
            duration: this.duration,
          }
          userService.schedule(data).then(() => {
            this.$emit('reload')
            this.$emit('cancel')
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

.v-time-picker-controls__time__btn.v-btn--density-default.v-btn.v-time-picker-controls__time--with-ampm__btn {
  height: 80px !important;
}
</style>
