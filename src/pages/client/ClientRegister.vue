<template>
  <div >
    <v-card :loading="loadingInfo" :title="!id ? 'Cadastrar cliente' : 'Editar Cliente'" :subtitle="client.name">
      <v-card-text>
        <v-form class="d-flex flex-column ga-6" @submit.prevent="save" v-model="valid" >
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="client.name"
                :loading="loadingInfo"
                :disabled="loadingInfo"
                :rules="rules"
                variant="outlined"
                density="compact"
                hide-details="auto"
                label="Nome">
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="2">
              <v-select
              :items="[
                  {label: 'Masculino', id: 1},
                  {label: 'Feminino', id: 2},
                  {label: 'Outros', id: 3},
                ]"
                item-title="label"
                item-value="id"
                v-model="client.gender"
                :loading="loadingInfo"
                :disabled="loadingInfo"
                variant="outlined"
                density="compact"
                hide-details="auto"
                label="Gênero">
              </v-select>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-file-input prepend-icon="" hide-details="auto" prepend-inner-icon="mdi-attachment" label="Foto de perfil" density="compact" @update:modelValue="convertToBase64" variant="outlined"></v-file-input>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-date-input
                v-model="client.birthday"
                :rules="dateRule"
                :loading="loadingInfo"
                :disabled="loadingInfo"
                prepend-icon=""
                v-maska="'##/##/####'"
                append-inner-icon="$calendar"
                variant="outlined"
                density="compact"
                hide-details="auto"
                label="Data de nascimento">
              </v-date-input>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="client.address"
                :loading="loadingInfo"
                :disabled="loadingInfo"
                variant="outlined"
                density="compact"
                hide-details="auto"
                label="Endereço">
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="client.phone"
                :loading="loadingInfo"
                :disabled="loadingInfo"
                v-maska="'(##) #####-####'"
                :rules="phoneRule"
                variant="outlined"
                density="compact"
                hide-details="auto"
                label="Telefone">
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="client.email"
                :loading="loadingInfo"
                :disabled="loadingInfo"
                variant="outlined"
                density="compact"
                hide-details="auto"
                label="E-mail">
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="2">
              <v-select
              :items="[
                  {label: 'Em Tratamento', id: 1},
                  {label: 'Orçando', id: 2},
                  {label: 'Inativo', id: 3},
                  {label: 'Plano de Tratamento enviado', id: 4},
                ]"
                item-title="label"
                item-value="id"
                v-model="client.status"
                :loading="loadingInfo"
                :disabled="loadingInfo"
                variant="outlined"
                density="compact"
                hide-details="auto"
                label="Status">
              </v-select>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="client.comorbities"
                :loading="loadingInfo"
                :disabled="loadingInfo"
                variant="outlined"
                density="compact"
                hide-details="auto"
                label="Alerta de Segurance de Saude">
              </v-textarea>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="client.description"
                :loading="loadingInfo"
                :disabled="loadingInfo"
                variant="outlined"
                density="compact"
                hide-details="auto"
                label="Anaminese">
              </v-textarea>
            </v-col>
          </v-row>
          <div>
            <v-btn type="submit" class="text-none" color="primary" :disabled="loadingInfo || loadingRequest || !valid" :loading="loadingRequest">Salvar</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
  import userService from '../../services/user.service'
  import { VDateInput } from 'vuetify/labs/VDateInput'
  import { vMaska } from "maska/vue"
  import { toast } from 'vue3-toastify'

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
      client: {
        name: '',
        email: '',
        phone: '',
        address: '',
        birthday: null,
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
          if (value) {
            if (value.length < 15) return 'Informe o telefone completo.'
            if (value.length === 0) return true
            return true
          } else {
            return true
          }
        },
      ],
      dateRule: [
        value => {
          if (!value) return true
          if (!isNaN(value)) {
            return 'Informe uma data válida.'
          } else {
            return true
          }
        },
      ],
    }),
    created() {
      if (this.id) {
        this.getClient()
      }
    },
    methods: {
      getClient() {
        this.loadingInfo = true
        userService.getClient(this.id).then((response) => {
          if (response.data.birthday) {
            response.data.birthday = new Date(response.data.birthday);
          }
          this.client = response.data
          this.loadingInfo = false
        })
      },
      save() {
        this.loadingRequest = true
        if (!this.valid) return
        if (this.id) {
          userService.updateClient(this.id, this.client).then(() => {
            this.loadingRequest = false
            this.$router.go(-1)
          },
          (error) => {
            this.loadingRequest = false
            toast.error((error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                  error.message ||
                  error.toString())
          })
        } else {
          userService.saveClient(this.client).then(() => {
            this.loadingRequest = false
            this.$router.push('/clientes')
          },
          (error) => {
            this.loadingRequest = false
            toast.error((error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                  error.message ||
                  error.toString())
          })
        }
      },
      convertToBase64(file) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          this.client.avatar = reader.result
        };
      },
      getStatusType(status) {
        switch(status) {
          case 1:
            return 'Em Tratamento'
          case 2:
            return 'Orçando'
          case 3:
            return 'Inativo'
          case 4:
            return 'Plano de Tratamento enviado'
        }
      }
    },
  }
</script>
