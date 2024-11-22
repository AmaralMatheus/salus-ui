<template>
    <v-row>
      <v-col cols="12" class="d-flex flex-column ga-6">
        <v-card title="Empresa">
          <v-card-text>
            <v-row>
              <v-col cols="8" sm="9" md="10">
                <v-text-field
                  v-model="company.name"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  :loading="loading"
                  :disabled="loading"
                  placeholder="Nome da Empresa">
                </v-text-field>
              </v-col>
              <v-col cols="4" sm="3" md="2">
                <v-btn block @click="saveCompany()" :loading="loading" :disabled="loading" color="primary">Salvar</v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-title>
            <v-row class="mt-0">
              <v-col cols="12" sm="3" class="text-h6">Usuários</v-col>
              <v-col cols="12" sm="9">
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
          </v-card-title>
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
        </v-card>
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
                :disabled="loading"
                :loading="loading"
                @click="remove"
              ></v-btn>
            </template>
          </v-card>
        </v-dialog>
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
      </v-col>
    </v-row>
  </template>

  <script>
    import userService from '../../services/user.service'
    import { format, parseISO } from 'date-fns'

    export default {
      name: 'UserList',
      data: () => ({
        format,
        parseISO,
        company: {
          name: ''
        },
        snackbar: false,
        message: false,
        itemsPerPage: 5,
        dialog: false,
        selectedItem: null,
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
        serverItems: [],
        loading: true,
        totalItems: 0,
      }),
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
          })
          userService.getCompany().then((response) => {
            this.company = response.data
            this.loading = false
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
          userService.deleteUser(this.selectedItem.id).then(() => {
            this.dialog = false
            this.loadItems({
              page:1,
              itemsPerPage: 10,
              sortBy: []
            })
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
        },
        getDateTime(date) {
          return format(parseISO(date), 'dd/MM/yyyy kk:mm')
        },
        saveCompany() {
          this.loading = true
          const data = {
            name: this.company.name
          }
          userService.saveCompany(data).then(() => {
            this.loading = false
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
