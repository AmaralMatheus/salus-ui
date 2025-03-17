<template>
  <div >
    <v-card :loading="loadingInfo" :title="!id ? 'Cadastrar cliente' : 'Editar Cliente'" :subtitle="client.name">
      <v-card-text>
        <v-form class="d-flex flex-column ga-6" @submit.prevent="save" v-model="valid" >
          <v-row>
            <v-col cols="12" sm="6" md="3">
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
              <v-text-field
                v-model="client.cpf"
                :loading="loadingInfo"
                :disabled="loadingInfo"
                :rules="cpfRules"
                variant="outlined"
                density="compact"
                v-maska="'###.###.###-##'"
                hide-details="auto"
                label="CPF">
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="1">
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
            <v-col cols="12" sm="6" md="2">
              <v-text-field
                v-model="client.cep"
                :loading="loadingInfo"
                :disabled="loadingInfo"
                :rules="cepRules"
                @change="getAddress"
                v-maska="'#####-###'"
                variant="outlined"
                density="compact"
                hide-details="auto"
                label="CEP">
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="5">
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
            <v-col cols="12" sm="6" md="2">
              <v-autocomplete
              :items="states"
                item-title="sigla"
                item-value="id"
                v-model="client.state"
                :loading="loadingInfo"
                :disabled="loadingInfo || blockState"
                variant="outlined"
                density="compact"
                hide-details="auto"
                @update:modelValue="getCities"
                label="Estado">
              </v-autocomplete>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-autocomplete
              :items="cities"
                item-title="nome"
                item-value="id"
                v-model="client.city"
                :loading="loadingInfo"
                :disabled="loadingInfo || blockCity"
                variant="outlined"
                density="compact"
                hide-details="auto"
                no-data-text="Selecione um estado"
                label="Cidade">
              </v-autocomplete>
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
              :items="statuses"
                item-title="name"
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
          <div class="d-flex">
            <v-btn class="ml-auto" @click="$emit('cancel')" variant="plain">Cancelar</v-btn>
            <v-btn type="submit" variant="plain" color="primary" :disabled="loadingInfo || loadingRequest || !valid" :loading="loadingRequest">SALVAR</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
  import clientService from '../services/client.service'
  import statusService from '../services/company.service'
  import locationService from '../services/location.service'
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
        return this.selectedClient
      },
    },
    props: ['selectedClient'],
    data: () => ({
      valid: true,
      client: {
        name: '',
        email: '',
        phone: '',
        address: '',
        birthday: null,
      },
      statuses: [],
      cities: [],
      states: [],
      blockCity: false,
      blockState: false,
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
      cpfRules: [
        value => {
          if (value) {
            if (value.length < 14) return 'Informe o CPF completo.'
            if (value.length === 0) return true
            return true
          } else {
            return true
          }
        },
      ],
      cepRules: [
        value => {
          if (value) {
            if (value.length < 9) return 'Informe o CEP completo.'
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
      console.log(this.id)
      if (this.id) {
        this.getClient()
      }
      this.loading = true
      this.getStates()
      statusService.getAllStatus().then((response) => {
        this.statuses = response.data
        this.loading = false
      })
    },
    methods: {
      getAddress() {
        this.blockCity = false
        this.blockState = false
        if(this.client.cep.length === 9) {
          locationService.getAddress(this.client.cep.replace('-', '')).then((response) => {
            if (response.data.uf) {
              this.client.state = this.states.filter((state) => state.sigla === response.data.uf)[0].id
              this.blockState = true
              const returnedCity = response.data.localidade 
              locationService.getCities(this.client.state).then((response) => {
                this.cities = response.data
                if (returnedCity) {
                  this.client.city = this.cities.filter((city) => {
                    return city.nome === returnedCity
                  })[0]
                  this.blockCity = true
                }
              })
            }

            this.client.address = response.data.logradouro + (response.data.complemento ? ', ' + response.data.complemento : '')
          })
        }
      },
      getCities(){
        locationService.getCities(this.client.state).then((response) => {
          this.cities = response.data
        })
      },
      getStates(){
        locationService.getStates().then((response) => {
          this.states = response.data
        })
      },
      getClient() {
        this.loadingInfo = true
        clientService.getClient(this.id).then((response) => {
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
          clientService.updateClient(this.id, this.client).then(() => {
            this.loadingRequest = false
            this.$emit('reload')
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
          clientService.saveClient(this.client).then(() => {
            this.loadingRequest = false
            this.$emit('reload')
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
