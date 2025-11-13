<template>
    <v-row>
      <v-col cols="12" class="d-flex flex-column ga-6">
        <v-card title="Empresa">
          <v-card-text>
            <v-form ref="myForm" @submit.prevent="saveCompany" v-model="valid">
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="company.name"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    :rules="rules"
                    :loading="pageLoading"
                    :disabled="pageLoading"
                    placeholder="Nome da Clinica">
                  </v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="company.cnpj"
                    variant="outlined"
                    density="compact"
                    :rules="cnpjRules"
                    hide-details="auto"
                    :loading="pageLoading"
                    :disabled="pageLoading"
                    v-maska="'##.###.###/####-##'"
                    placeholder="CNPJ da Clinica">
                  </v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="company.phone"
                    :loading="pageLoading"
                    :disabled="pageLoading"
                    v-maska="phoneMask"
                    :rules="phoneRule"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    label="Telefone">
                  </v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="company.email"
                    :loading="pageLoading"
                    :disabled="pageLoading"
                    :rules="emailRules"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    label="E-mail">
                  </v-text-field>
                </v-col>
                <v-divider class="mx-3"></v-divider>
                <v-col cols="12" sm="6" md="2">
                  <v-text-field
                    v-model="company.cep"
                    :loading="pageLoading"
                    :disabled="pageLoading"
                    :rules="cepRules"
                    @change="getAddress"
                    v-maska="'#####-###'"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    label="CEP">
                  </v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="company.address"
                    :loading="pageLoading"
                    :disabled="pageLoading"
                    :rules="rules"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    label="Endereço">
                  </v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-autocomplete
                  :items="states"
                    item-title="nome"
                    item-value="id"
                    v-model="company.state"
                    :loading="pageLoading"
                    :return-object="false"
                    :disabled="pageLoading || blockState"
                    variant="outlined"
                    :rules="rules"
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
                    v-model="company.city"
                    :return-object="false"
                    :loading="pageLoading"
                    :disabled="pageLoading || blockCity"
                    :rules="rules"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    :no-data-text="states.length > 0 ? 'Selecione um estado antes' : 'Selecione uma cidade'"
                    label="Cidade">
                  </v-autocomplete>
                </v-col>
                <v-col cols="12" class="d-flex">
                  <v-btn class="ml-auto" @click="saveCompany()" :loading="pageLoading" :disabled="pageLoading || !valid" color="primary">Salvar</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title class="text-h6">Usuários</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row class="mt-0">
                <v-col cols="12">
                  <v-row>
                    <v-col cols="12" sm="5" md="7" lg="8">
                      <v-text-field
                        v-model="search"
                        variant="outlined"
                        density="compact"
                        hide-details="auto"
                        append-inner-icon="mdi-magnify"
                        placeholder="Buscar Usuário">
                      </v-text-field>
                    </v-col>
                    <v-col cols="12" sm="7" md="5" lg="4">
                      <v-btn block append-icon="mdi-plus" @click="create()" color="primary">Adicionar Usuário</v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-data-table-server
                v-model:items-per-page="itemsPerPage"
                :headers="headers"
                :items="serverItems"
                :items-length="totalItems"
                :loading="loading"
                :search="search"
                item-value="name"
                @update:options="loadItems"
                @click:row="viewRow"
              >
                <template v-slot:[`item.actions`]="{ item }">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-icon :disabled="loading" v-bind="props">mdi-dots-vertical</v-icon>
                    </template>
              
                    <v-list>
                      <v-list-item prepend-icon="mdi-pencil" density="comfortable" @click="update(item)" title="Editar"></v-list-item>
                      <v-list-item prepend-icon="mdi-delete" density="comfortable" @click="selectedItem = item; dialog = true" title="Excluir"></v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table-server>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <Procedures/>
        <Statuses/>
        <HealthCare/>
        <TeethStatuses/>
        <PrescriptionTemplate/>
        <v-dialog
          v-model="dialog"
          width="auto" 
        >
          <v-card
            max-width="400"
            prepend-icon="mdi-alert-outline"
            text="Esses dados não podem ser restaurados"
            title="Deseja excluir esse Usuário?"
          >
            <template v-slot:actions>
              <v-btn
                class="ms-auto"
                text="Cancelar"
                :disabled="loading"
                @click="dialog = false"
              ></v-btn>
              <v-btn
                text="Excluir"
                color="error"
                :disabled="pageLoading"
                :loading="loading"
                @click="remove"
              ></v-btn>
            </template>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </template>

  <script>
    import userService from '../services/user.service'
    import companyService from '../services/company.service'
    import Procedures from '../components/company/Procedures.vue'
    import Statuses from '../components/company/Status.vue'
    import { format, parseISO } from 'date-fns'
    import { toast } from 'vue3-toastify'
    import TeethStatuses from '@/components/company/TeethStatuses.vue'
    import locationService from '../services/location.service'
    import { vMaska } from "maska/vue"
    import HealthCare from '@/components/company/HealthCare.vue'
    import PrescriptionTemplate from '@/components/company/PrescriptionTemplate.vue'

    export default {
      name: 'UserList',
      components: {
        Procedures,
        Statuses,
        TeethStatuses,
        HealthCare,
        PrescriptionTemplate
      },
      directives: { maska: vMaska },
      computed: {
        phoneMask() {
          return this.company.phone?.length < 15 ? '(##) ####-#####' : '(##) #####-####'
        },
        currentUser() {
          return this.$store.state.auth.user
        },
      },
      data: () => ({
        format,
        parseISO,
        valid: false,
        company: {
          cnpj: null,
          name: null,
          phone: null,
          address: null,
          state: null,
          city: null,
          cep: null,
          email: null
        },
        cities: [],
        states: [],
        blockCity: false,
        blockState: false,
        message: false,
        itemsPerPage: 5,
        dialog: false,
        selectedItem: null,
        usersExpanded: false,
        search: '',
        headers: [
          {
            title: 'Nome Completo',
            align: 'start',
            sortable: true,
            key: 'name',
          },
          { title: 'E-mail', key: 'email', align: 'start', sortable: true },
          { title: '', key: 'actions', align: 'end', sortable: true },
        ],
        rules: [
          value => {
            if (value) return true
            return 'Este campo não pode estar vazio.'
          },
        ],
        phoneRule: [
          value => {
            if (value) {
              if (value.length < 14) return 'Informe o telefone completo.'
              if (value.length === 0) return 'Este campo não pode estar vazio.'
              return true
            } else {
              return 'Este campo não pode estar vazio.'
            }
          },
        ],
        cnpjRules: [
          value => {
            if (value) {
              if (value.length < '##.###.###/####-##'.length) return 'Informe o CNPJ completo.'
              if (value.length === 0) return 'Este campo não pode estar vazio.'
              return true
            } else {
              return 'Este campo não pode estar vazio.'
            }
          },
        ],
        cepRules: [
          value => {
            if (value) {
              if (value.length < 9) return 'Informe o CEP completo.'
              if (value.length === 0) return 'Este campo não pode estar vazio.'
              return true
            } else {
              return 'Este campo não pode estar vazio.'
            }
          },
        ],
        emailRules: [
          v => !!v || 'Este campo não pode estar vazio.',
          v => /.+@.+\..+/.test(v) || 'Informe um e-mail valido',
        ],
        serverItems: [],
        loading: true,
        pageLoading: true,
        totalItems: 0,
      }),
      async created() {
        this.pageLoading = true
        await this.getStates()
        companyService.getCompany(this.currentUser.company_id).then((response) => {
          this.company = response.data
          console.log(this.company)
          this.company.state = Number(this.company.state)
          if (this.company.state) {
            locationService.getCities(this.company.state).then((response) => {
              this.cities = response.data
              this.company.city = Number(this.company.city) 
            })
          }
          this.pageLoading = false
        })
      },
      methods: {
        loadItems ({ page, itemsPerPage, sortBy }) {
          this.loading = true
          if (sortBy.length <= 1) {
            sortBy.push ({
              order: 'desc',
              key: 'id'
            })
          }
          userService.getUsers(`page=${page}&itemsPerPage=${itemsPerPage}&sort=${sortBy[0].key}&order=${sortBy[0].order}&search=${this.search}`).then((response) => {
            this.serverItems = response.data.data
            this.totalItems = response.data.total
            this.loading = false
          })
        },
        getAddress() {
          this.blockCity = false
          this.blockState = false
          if(this.company.cep.length === 9) {
            locationService.getAddress(this.company.cep.replace('-', '')).then((response) => {
              if (response.data.uf) {
                this.company.state = this.states.filter((state) => state.sigla === response.data.uf)[0].id
                this.blockState = true
                const returnedCity = response.data.localidade 
                locationService.getCities(this.company.state).then((response) => {
                  this.cities = response.data
                  if (returnedCity) {
                    this.company.city = this.cities.filter((city) => {
                      return city.nome === returnedCity
                    })[0].id
                    this.blockCity = true
                  }
                })
              }

              this.company.address = response.data.logradouro + (response.data.complemento ? ', ' + response.data.complemento : '')
            })
          }
        },
        getCities(){
          this.company.city = null
          locationService.getCities(this.company.state).then((response) => {
            if (this.company.city) {
              this.company.city = parseInt(this.company.city)
              this.cities = response.data
            } else {
              this.cities = response.data
            }
          })
        },
        getStates(){
          locationService.getStates().then((response) => {
            this.states = response.data
          })
        },
        view (row) {
          this.$router.push({
            name: 'user-register',
            params: { id: row.id }
          })
        },
        viewRow (event, row) {
          console.log(row)
          this.$router.push({
            name: 'user-register',
            params: { id: row.item.id }
          })
        },
        create () {
          this.$router.push({
            name: 'user-register'
          })
        },
        update (row) {
          this.$router.push({
            name: 'user-register',
            params: { id: row.id }
          })
        },
        remove () {
          this.loading = true
          userService.deleteUsers(this.selectedItem.id).then(() => {
            this.dialog = false
            this.loadItems({
              page:1,
              itemsPerPage: 10,
              sortBy: []
            })
          },
            (error) => {
              this.loading = false
              toast.error((error.response &&
                  error.response.data &&
                  error.response.data.message) ||
                error.message ||
                error.toString())  
            })
        },
        getDateTime(date) {
          return format(parseISO(date), 'dd/MM/yyyy kk:mm')
        },
        async saveCompany() {
          const { valid } = await this.$refs.myForm.validate();
          if (!valid) return
          this.pageLoading = true
          companyService.saveCompany(this.currentUser.company_id, this.company).then((response) => {
            toast.success(response.data.message)
            this.pageLoading = false
          }).catch((error) => {
            toast.error((error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString())
          })
        }
      },
    }
  </script>

  <style>
  .v-time-picker {
    padding-top:16px !important;
  }
  </style>
