<template>
  <div class="pa-md-9">
    <v-card :loading="loadingInfo" class="ma-9 w-100" :title="!id ? 'Cadastrar usuário' : 'Editar Usere'" :subtitle="user.name">
      <v-card-text>
        <v-form class="d-flex flex-column ga-6" @submit.prevent="save" v-model="valid" >
          <v-row>
            <v-col cols="4">
              <v-text-field
                v-model="user.name"
                :loading="loadingInfo"
                :disabled="loadingInfo"
                :rules="rules"
                variant="outlined"
                density="compact"
                hide-details="auto"
                label="Nome">
              </v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="user.email"
                :loading="loadingInfo"
                :disabled="loadingInfo"
                variant="outlined"
                density="compact"
                hide-details="auto"
                label="E-mail">
              </v-text-field>
            </v-col>
            <v-col cols="4">
              <v-select
              :items="[
                  {label: 'Administrador', id: 1},
                  {label: 'Secretaria', id: 2},
                ]"
                item-title="label"
                item-value="id"
                v-model="user.type"
                :loading="loadingInfo"
                :disabled="loadingInfo"
                :rules="rules"
                variant="outlined"
                density="compact"
                hide-details="auto"
                label="Tipo de acesso">
              </v-select>
            </v-col>
          </v-row>
          <div>
            <v-btn type="submit" class="text-none" color="primary" :disabled="loadingInfo || loadingRequest || !valid" :loading="loadingRequest">Salvar</v-btn>
          </div>
        </v-form>
      </v-card-text>
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
    </v-card>
  </div>
</template>

<script>
  import userService from '../../services/user.service'
  import { VDateInput } from 'vuetify/labs/VDateInput'
  import { vMaska } from "maska/vue"

  export default {
    components: {
      VDateInput,
    },
    directives: { maska: vMaska },
    computed: {
      id() {
        return this.$route.params.id
      },
    },
    data: () => ({
      valid: true,
      snackbar: false,
      message: false,
      user: {
        name: '',
        email: '',
        type: 1,
      },
      loadingRequest: false,
      loadingInfo: false,
      rules: [
        value => {
          if (value) return true
          return 'Este campo não pode estar vazio.'
        },
      ],
      phoneRule: [
        value => {
          if (value.length < 15) return 'Informe o telefone completo.'
        },
      ],
      dateRule: [
        value => {
          if (!isNaN(value)) return 'Informe uma data válida.'
        },
      ],
    }),
    created() {
      if (this.id) {
        this.getUser()
      }
    },
    methods: {
      getUser() {
        this.loadingInfo = true
        userService.getUser(this.id).then((response) => {
          response.data.birthday = new Date(response.data.birthday);
          this.user = response.data
          this.loadingInfo = false
        })
      },
      save() {
        this.loadingRequest = true
        if (!this.valid) return
        if (this.id) {
          userService.updateUser(this.id, this.user).then(() => {
            this.loadingRequest = false
            this.$router.push('/ajustes')
          },
          (error) => {
            this.loadingRequest = false
            this.snackbar = true
            this.message =
              (error.response &&
                error.response.data &&
                error.response.data.message) ||
              error.message ||
              error.toString()
          })
        } else {
          userService.saveUser(this.user).then(() => {
            this.loadingRequest = false
            this.$router.push('/ajustes')
          },
          (error) => {
            this.loadingRequest = false
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
    },
  }
</script>
