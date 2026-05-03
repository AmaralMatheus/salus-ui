<template>
  <v-row>
    <v-col>
      <v-card :loading="loadingInfo" :title="!id ? 'Cadastrar usuário' : 'Editar Usuário'" :subtitle="user.name">
        <v-card-text>
          <v-form class="d-flex flex-column ga-6" @submit.prevent="save" v-model="valid" >
            <v-row>
              <v-col cols="12" sm="6" :md="user.type === 1 ? 3 : 4">
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
              <v-col cols="12" sm="6" :md="user.type === 1 ? 3 : 4">
                <v-text-field
                  v-model="user.email"
                  :loading="loadingInfo"
                  :disabled="loadingInfo"
                  :rules="rules"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  :error="!!errors.email"
                  :error-messages="errors.email"
                  label="E-mail">
                </v-text-field>
              </v-col>
              <v-col cols="12" sm="6" :md="user.type === 1 ? 3 : 4" v-if="user.type !== 2">
                <v-text-field
                  v-model="user.cro"
                  :loading="loadingInfo"
                  :disabled="loadingInfo"
                  :rules="rules"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  label="CRO">
                </v-text-field>
              </v-col>
              <v-col cols="12" sm="6" :md="user.type === 1 ? 3 : 4">
                <v-select
                :items="[
                    {label: 'Dentista', id: 3},
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
              <v-col cols="12" sm="6" :md="user.type === 1 ? 3 : 4">
                <v-text-field
                  v-model="user.password"
                  :loading="loadingInfo"
                  :disabled="loadingInfo"
                  :rules="passwordRules"
                  variant="outlined"
                  type="password"
                  density="compact"
                  hide-details="auto"
                  label="Senha">
                </v-text-field>
              </v-col>
              <v-col cols="12" sm="6" :md="user.type === 1 ? 3 : 4">
                <v-text-field
                  v-model="user.passwordConfirm"
                  :loading="loadingInfo"
                  :disabled="loadingInfo"
                  :rules="passwordConfirmRules"
                  variant="outlined"
                  type="password"
                  density="compact"
                  hide-details="auto"
                  label="Confirmação de Senha">
                </v-text-field>
              </v-col>
            </v-row>
            <div>
              <v-btn type="submit" class="text-none" color="primary" :disabled="loadingInfo || loadingRequest || !valid" :loading="loadingRequest">Salvar</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
  import userService from '../../services/user.service'
  import { vMaska } from 'maska/vue'
  import { toast } from 'vue3-toastify'

  export default {
    name: 'UserForm',
    directives: { maska: vMaska },
    computed: {
      id() {
        return this.$route.params.id
      },
      passwordConfirmRules() {
        return [
          v => !!v || 'Confirmação é obrigatória',
          v => v === this.user.password || 'As senhas não coincidem'
        ]
      }
    },
    data: () => ({
      valid: true,
      user: {
        name: '',
        email: '',
        type: 1,
        password: '',
      },
      errors: {},
      loadingRequest: false,
      loadingInfo: false,
      rules: [
        value => {
          if (value) return true
          return 'Este campo não pode estar vazio'
        },
      ],
      phoneRule: [
        value => {
          if (value.length < 15) return 'Informe o telefone completo'
        },
      ],
      dateRule: [
        value => {
          if (!isNaN(value)) return 'Informe uma data válida'
        },
      ],
      passwordRules: [
        v => !!v || 'Senha é obrigatória',
        v => v.length >= 8 || 'Mínimo de 8 caracteres',
        v => /[A-Z]/.test(v) || 'Precisa de uma letra maiúscula',
        v => /[a-z]/.test(v) || 'Precisa de uma letra minúscula',
        v => /[0-9]/.test(v) || 'Precisa de um número',
        // v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || 'Precisa de um caractere especial',
      ]
    }),
    watch: {
      'user.email'() {
        if (this.errors.email) {
          this.errors.email = null;
        }
      }
    },
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
          this.$store.dispatch('auth/updateEntityName', this.user.name)
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
            if (error.response?.status === 422) {
              this.errors = error.response.data.errors;
            } else {
              toast.error((error.response &&
                      error.response.data &&
                      error.response.data.message) ||
                    error.message ||
                    error.toString())
            }
          })
        } else {
          userService.saveUser(this.user).then(() => {
            this.loadingRequest = false
            this.$router.push('/ajustes')
          },
          (error) => {
            this.loadingRequest = false
            if (error.response?.status === 422) {
              this.errors = error.response.data.errors;
            } else {
              toast.error((error.response &&
                      error.response.data &&
                      error.response.data.message) ||
                    error.message ||
                    error.toString())
            }
          })
        }
      },
    },
  }
</script>
