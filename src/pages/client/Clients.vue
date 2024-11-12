<template>
  <v-row class="pa-md-9">
    <v-col cols="12">
      <v-card>
        <v-card-title>
          <v-row class="mt-0">
            <v-col cols="12" sm="3" class="text-h6">Clientes</v-col>
            <v-col cols="12" sm="9">
              <v-row>
                <v-col cols="12" sm="5" md="7" lg="8">
                  <v-text-field
                    v-model="search"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    append-inner-icon="mdi-magnify"
                    placeholder="Buscar Cliente">
                  </v-text-field>
                </v-col>
                <v-col cols="12" sm="7" md="5" lg="4">
                  <v-btn block append-icon="mdi-plus" @click="create()" color="primary">Adicionar Cliente</v-btn>
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
        >
          <template v-slot:[`item.avatar`]="{ item }">
            <v-avatar color="surface-variant ma-auto" size="30">
              <v-img :src="item.avatar ?? 'https://ui-avatars.com/api/?name='+item.name.replaceAll(' ', '+') + '&background=random'" cover></v-img>
            </v-avatar>
          </template>
          <template v-slot:[`item.last_appointment`]="{ item }">
            {{ item.last_appointment.length > 0 ? getDateTime(item.last_appointment[0].date) : 'Sem consultas cadastradas' }}
          </template>
          <template v-slot:[`item.next_appointment`]="{ item }">
            {{ item.next_appointment.length > 0 ? getDateTime(item.next_appointment[0].date) : 'Sem consultas cadastradas' }}
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex ga-3">
              <v-icon :disabled="loading" class="ml-auto" color="info" @click="selectedItem = item; schedulerDialog = true">mdi-calendar-edit-outline</v-icon>
              <v-icon :disabled="loading" color="info" v-if="currentUser.type === 1" @click="view(item)">mdi-eye</v-icon>
              <v-icon :disabled="loading" color="warning" @click="update(item)">mdi-pencil</v-icon>
              <v-icon :disabled="loading" color="error" @click="selectedItem = item; dialog = true">mdi-delete</v-icon>
            </div>
          </template>
          <template v-slot:[`item.status`]="{ item }">
            {{ getStatusType(item.status) }}
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
          title="Deseja excluir esse cliente?"
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
      <v-dialog
        v-model="schedulerDialog"
        max-width="800"
      >
        <scheduler :client="this.selectedItem" @cancel="schedulerDialog = false" @reload="loadItems({page:1,
          itemsPerPage: 10,
          sortBy: []})"/>
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
  import Scheduler from '../../components/Scheduler.vue'
  import userService from '../../services/user.service'
  import { format, parseISO } from 'date-fns'

  export default {
    name: 'ClientList',
    components: {
      Scheduler
    },
    data: () => ({
      format,
      parseISO,
      schedulerDialog: false,
      itemsPerPage: 5,
      dialog: false,
      selectedItem: null,
      search: '',
      headers: [
        {
          title: '',
          align: 'start',
          sortable: true,
          key: 'avatar',
        },
        {
          title: 'Nome Completo',
          align: 'start',
          sortable: true,
          key: 'name',
        },
        { title: 'Ultima Consulta', key: 'last_appointment', align: 'end', sortable: true },
        { title: 'Próxima Consulta', key: 'next_appointment', align: 'end', sortable: true },
        { title: 'Status', key: 'status', align: 'end', sortable: true },
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
      snackbar: false,
      message: '',
    }),
    computed: {
      currentUser() {
        return this.$store.state.auth.user
      },
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
        userService.getClients(`page=${page}&itemsPerPage=${itemsPerPage}&sort=${sortBy[0].key}&order=${sortBy[0].order}&search=${this.search}`).then((response) => {
          this.serverItems = response.data.data
          this.totalItems = response.data.total
          this.loading = false
        })
      },
      view (row) {
        this.$router.push({
          name: 'client-details',
          params: { id: row.id }
        })
      },
      create () {
        this.$router.push({
          name: 'client-register'
        })
      },
      update (row) {
        this.$router.push({
          name: 'client-register',
          params: { id: row.id }
        })
      },
      remove () {
        this.loading = true
        userService.deleteClient(this.selectedItem.id).then(() => {
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
