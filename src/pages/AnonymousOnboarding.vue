<template>
  <div class="d-flex flex-column w-100 align-center">
    <div class="d-flex ga-3 align-center ma-auto my-4">
      <img width="20" src="/favicon.svg" />
      <v-toolbar-title class="d-md-block">Dental Salus</v-toolbar-title>
    </div>
    <v-form v-model="valid" class="w-100" style="max-width: 960px;">
      <v-card class="ma-auto mb-4">
        <v-card-title class="pt-4 px-4">Dados da Clínica</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                label="Nome da Clínica"
                v-model="company.name"
                :rules="required"
                :disabled="loading"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                label="CNPJ"
                v-model="company.cnpj"
                :rules="cnpjRules"
                :disabled="loading"
                v-maska="'##.###.###/####-##'"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                label="Telefone"
                v-model="company.phone"
                :rules="phoneRules"
                :disabled="loading"
                v-maska="phoneMask"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                label="E-mail"
                v-model="company.email"
                :rules="emailRules"
                :disabled="loading"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6" md="2">
              <v-text-field
                label="CEP"
                v-model="company.cep"
                :rules="cepRules"
                :disabled="loading"
                v-maska="'#####-###'"
                @change="getAddress"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="12" md="6">
              <v-text-field
                label="Endereço"
                v-model="company.address"
                :disabled="loading"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-autocomplete
                label="Estado"
                :items="states"
                item-title="sigla"
                item-value="id"
                v-model="company.state"
                :disabled="loading || blockState"
                :rules="required"
                variant="outlined"
                density="compact"
                hide-details="auto"
                @update:modelValue="getCities"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-autocomplete
                label="Cidade"
                :items="cities"
                item-title="nome"
                item-value="id"
                v-model="company.city"
                :disabled="loading || blockCity || !company.state"
                :rules="required"
                no-data-text="Selecione um estado antes"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card class="ma-auto mb-4">
        <v-card-title class="pt-4 px-4">Usuários</v-card-title>
        <v-card-text>
          <div class="w-100" v-if="users.length === 0">
            Não há usuários para essa clínica!
          </div>
          <div v-else v-for="(user, index) in users" :key="index">
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="user.name"
                  hide-details="auto"
                  label="Nome do usuário"
                  :rules="required"
                  :disabled="loading"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="user.email"
                  :rules="emailRules"
                  hide-details="auto"
                  label="E-mail do usuário"
                  :disabled="loading"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="user.password"
                  :rules="required"
                  hide-details="auto"
                  label="Senha do usuário"
                  type="password"
                  :disabled="loading"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="user.passwordConfirm"
                  :error="!!user.passwordConfirm && user.passwordConfirm !== user.password"
                  :error-messages="!!user.passwordConfirm && user.passwordConfirm !== user.password ? 'As senhas não conferem' : ''"
                  hide-details="auto"
                  label="Confirmação da senha"
                  type="password"
                  :disabled="loading"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="user.type"
                  :rules="required"
                  hide-details="auto"
                  label="Tipo de acesso"
                  item-title="label"
                  item-value="id"
                  :items="[
                    { label: 'Administrador', id: 1 },
                    { label: 'Secretaria', id: 2 },
                  ]"
                  :disabled="loading"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="3" v-if="user.type === 1">
                <v-text-field
                  v-model="user.cro"
                  hide-details="auto"
                  label="CRO"
                  :rules="required"
                  :disabled="loading"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
            </v-row>
            <v-divider v-if="index < users.length - 1" class="my-5 border-opacity-50" />
          </div>
          <div class="d-flex mt-5 ga-4 justify-end">
            <v-btn @click="addUser" variant="outlined">Adicionar Usuário</v-btn>
            <v-btn :loading="loading" :disabled="!valid || users.length === 0" color="primary" @click="save">Salvar</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-form>
  </div>
</template>

<script>
import { toast } from 'vue3-toastify'
import companyService from '../services/company.service'
import locationService from '../services/location.service'
import { vMaska } from 'maska/vue'

export default {
  name: 'AnonymousOnboarding',
  directives: { maska: vMaska },
  computed: {
    phoneMask() {
      return (this.company.phone?.length ?? 0) < 15 ? '(##) ####-#####' : '(##) #####-####'
    },
  },
  data: () => ({
    company: {
      name: '',
      cnpj: '',
      phone: '',
      email: '',
      cep: '',
      address: '',
      state: null,
      city: null,
    },
    states: [],
    cities: [],
    blockCity: false,
    blockState: false,
    valid: false,
    users: [],
    loading: false,
    required: [
      value => {
        if (value) return true
        return 'Este campo não pode estar vazio.'
      },
    ],
    phoneRules: [
      value => {
        if (!value) return 'Este campo não pode estar vazio.'
        if (value.length < 14) return 'Informe o telefone completo.'
        return true
      },
    ],
    cnpjRules: [
      value => {
        if (!value) return 'Este campo não pode estar vazio.'
        if (value.length < 18) return 'Informe o CNPJ completo.'
        return true
      },
    ],
    cepRules: [
      value => {
        if (!value) return 'Este campo não pode estar vazio.'
        if (value.length < 9) return 'Informe o CEP completo.'
        return true
      },
    ],
    emailRules: [
      v => !!v || 'Este campo não pode estar vazio.',
      v => /.+@.+\..+/.test(v) || 'Informe um e-mail válido.',
    ],
  }),
  created() {
    locationService.getStates().then((response) => {
      this.states = response.data
    })
  },
  methods: {
    addUser() {
      this.users.push({ name: '', email: '', password: '', passwordConfirm: '', type: null, cro: '' })
    },
    getAddress() {
      this.blockCity = false
      this.blockState = false
      if (this.company.cep?.length === 9) {
        locationService.getAddress(this.company.cep.replace('-', '')).then((response) => {
          if (response.data.uf) {
            this.company.state = this.states.filter((s) => s.sigla === response.data.uf)[0]?.id
            this.blockState = true
            const returnedCity = response.data.localidade
            locationService.getCities(this.company.state).then((response) => {
              this.cities = response.data
              if (returnedCity) {
                this.company.city = this.cities.find((c) => c.nome === returnedCity)?.id ?? null
                this.blockCity = true
              }
            })
          }
          this.company.address = response.data.logradouro + (response.data.complemento ? ', ' + response.data.complemento : '')
        })
      }
    },
    getCities() {
      this.company.city = null
      if (this.company.state) {
        locationService.getCities(this.company.state).then((response) => {
          this.cities = response.data
        })
      }
    },
    async save() {
      if (!this.valid) return
      const passwordMismatch = this.users.find((u) => u.password !== u.passwordConfirm)
      if (passwordMismatch) {
        toast.error('As senhas não conferem para o usuário ' + passwordMismatch.name)
        return
      }
      this.loading = true
      const payload = {
        ...this.company,
        users: this.users,
      }
      companyService.createCompany(payload)
        .then(() => toast.success('Clínica cadastrada com sucesso!'))
        .catch((err) => toast.error(
          (err.response?.data?.message) || err.message || err.toString()
        ))
        .finally(() => { this.loading = false })
    },
  },
}
</script>

<style scoped>
</style>
