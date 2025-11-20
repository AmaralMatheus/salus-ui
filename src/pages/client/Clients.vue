<template>
  <v-row>
    <v-col cols="12">
      <v-card>
        <v-card-title>
          <v-row class="mt-0">
            <v-col cols="12" sm="3" class="text-h6">Pacientes</v-col>
            <v-col cols="12" sm="9">
              <v-row>
                <v-col cols="12" sm="5" md="7" lg="4">
                  <v-text-field
                    v-model="search"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    append-inner-icon="mdi-magnify"
                    placeholder="Buscar Paciente">
                  </v-text-field>
                </v-col>
                <v-col cols="12" sm="7" md="5" lg="4">
                  <v-btn block append-icon="mdi-plus" @click="create()" color="primary">Adicionar Paciente</v-btn>
                </v-col>
                <v-col cols="12" sm="7" md="5" lg="4">
                  <v-btn block append-icon="mdi-plus" @click="importFromFile()" color="primary">Importar Pacientes</v-btn>
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
          <template v-slot:[`item.name`]="{ item }">
            <v-avatar color="surface-variant mr-3" size="30">
              <v-img :src="item.avatar ?? 'https://ui-avatars.com/api/?name='+item.name.replaceAll(' ', '+') + '&background=random'" cover></v-img>
            </v-avatar>
            {{ item.name }}
          </template>
          <template v-slot:[`item.last_appointment`]="{ item }">
            {{ item.last_appointment.length > 0 ? getDateTime(item.last_appointment[0].date) : 'Sem consultas cadastradas' }}
          </template>
          <template v-slot:[`item.next_appointment`]="{ item }">
            {{ item.next_appointment.length > 0 ? getDateTime(item.next_appointment[0].date) : 'Sem consultas cadastradas' }}
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-icon :disabled="loading" v-bind="props">mdi-dots-vertical</v-icon>
              </template>
        
              <v-list>
                <v-list-item prepend-icon="mdi-whatsapp" density="comfortable" target="_blank" :disabled="!item.phone" :href="'https://wa.me/' + (!!item.phone ? item.phone.replaceAll('(','').replaceAll(')','').replaceAll('-','').replaceAll(' ','') : '')" title="Enviar Mensagem"></v-list-item>
                <v-list-item prepend-icon="mdi-calendar-edit-outline" density="comfortable" @click="selectedItem = item; schedulerDialog = true" title="Agendar"></v-list-item>
                <v-list-item prepend-icon="mdi-eye" density="comfortable" v-if="currentUser.type === 1" @click="view(item)" title="Visualizar"></v-list-item>
                <v-list-item prepend-icon="mdi-pencil" density="comfortable" @click="update(item)" title="Editar"></v-list-item>
                <v-list-item prepend-icon="mdi-delete" density="comfortable" @click="selectedItem = item; dialog = true" title="Excluir"></v-list-item>
              </v-list>
            </v-menu>
          </template>
          <template v-slot:[`item.status`]="{ item }">
            {{ item.status?.name }}
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
          title="Deseja excluir esse paciente?"
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
      >
        <scheduler :client="this.selectedItem" @cancel="schedulerDialog = false" @reload="loadItems({page:1,
          itemsPerPage: 10,
          sortBy: []})"/>
      </v-dialog>
      <v-dialog
        v-model="newClientDialog"
        max-width="800"
      >
        <client-register :selectedClient="this.selectedItem" @cancel="newClientDialog = false" @reload="newClientDialog = false; loadItems({page:1,
          itemsPerPage: 10,
          sortBy: []})"/>
      </v-dialog>
      <v-dialog
        v-model="importDialog"
        max-width="800"
      >
        <v-file-input @update:modelValue="onFileChange" />
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
  import Scheduler from '../../components/agenda/Scheduler.vue'
  import ClientRegister from '../../components/client/ClientRegister.vue'
  import clientService from '../../services/client.service'
  import { format, parseISO } from 'date-fns'
  import { toast } from 'vue3-toastify'

  export default {
    name: 'ClientList',
    components: {
      Scheduler,
      ClientRegister
    },
    data: () => ({
      format,
      parseISO,
      schedulerDialog: false,
      newClientDialog: false,
      importDialog: false,
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
        { title: 'Status', key: 'status', align: 'start', sortable: true },
        { title: 'Ultima Consulta', key: 'last_appointment', align: 'start', sortable: true },
        { title: 'Próxima Consulta', key: 'next_appointment', align: 'start', sortable: true },
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
        clientService.getClients(`page=${page}&itemsPerPage=${itemsPerPage}&sort=${sortBy[0].key}&order=${sortBy[0].order}&search=${this.search}`).then((response) => {
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
      viewRow (event, row) {
        this.$router.push({
          name: 'client-details',
          params: { id: row.item.id }
        })
      },
      create () {
        this.selectedItem = null
        this.newClientDialog = true
      },
      importFromFile () {
        this.importDialog = true
      },
      onFileChange(file) {
        var files = file;
        this.createInput(files)
      },
      createInput(file) {
        var reader = new FileReader()
        reader.onload = () => {
          this.loading = true
          const clients = reader.result.split(/\r\n|\n/);
          // Reading line by line
          clients.forEach((client) => {
            client = client.replaceAll('"','').split(',')
            const clientRequest = {
              name: client[0],
              register_id: client[1],
              cpf: client[2],
              rg: client[3],
              created_at: client[4],
              birthday: client[5],
              address: client[6] +', '+client[7],
              address2: client[8],
              city: '4115200',
              state: '41',
              cep: client[11],
              phone: client[12],
              email: client[13],
              status: 1,
              company_id: this.currentUser.company_id
            }
            clientService.saveClient(clientRequest).then(() => {
            },
            (error) => {
              this.loadingRequest = false
              toast.error((error.response &&
                      error.response.data &&
                      error.response.data.message) ||
                    error.message ||
                    error.toString())
            })
          })
          this.loading = false
        }
        reader.readAsText(file)

      },
      update (row) {
        this.selectedItem = row.id
        this.newClientDialog = true
      },
      remove () {
        this.loading = true
        clientService.deleteClient(this.selectedItem.id).then(() => {
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
    },
  }
</script>
