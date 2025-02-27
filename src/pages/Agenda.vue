<script>
import Calendar from '../components/Calendar.vue'
import Scheduler from '../components/Scheduler.vue'
import appointmentService from '../services/appointment.service'
import { format, parseISO } from 'date-fns'
import { toast } from 'vue3-toastify'

export default {
  name: "DefaultAgenda",
	components: {
      Calendar,
      Scheduler
	},
  data: () => ({
    format,
    parseISO,
    list: false,
    schedulerDialog: false,
    itemsPerPage: 5,
    dialog: false,
    selectedItem: null,
    search: '',
    headers: [
      { title: 'Participante', key: 'client.name', align: 'start', sortable: true },
      { title: 'Data', key: 'date', align: 'start', sortable: true },
      { title: 'Duração', key: 'duration', align: 'start', sortable: true },
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
    message: '',
  }),
  computed: {
    currentUser() {
      return this.$store.state.auth.user
    },
  },
  methods: {
    update(item) {
      this.selectedItem = item
      this.schedulerDialog = true
    },
    loadItems ({ page, itemsPerPage, sortBy }) {
      this.loading = true
      if (sortBy.length <= 1) {
        sortBy.push ({
          order: 'desc',
          key: 'id'
        })
      }
      appointmentService.getAppointments(`page=${page}&itemsPerPage=${itemsPerPage}&sort=${sortBy[0].key}&order=${sortBy[0].order}&search=${this.search}`).then((response) => {
        this.serverItems = response.data.data
        this.totalItems = response.data.total
        this.loading = false
      })
    },
    remove () {
      this.loading = true
      appointmentService.deleteAppointment(this.selectedItem.id).then(() => {
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

<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-title>
          <v-row class="mt-0">
            <v-col cols="12" sm="3" class="text-h6">Agenda</v-col>
            <v-col cols="12" sm="9">
              <v-row>
                <v-spacer/>
                <v-col cols="6" sm="4" md="3">
                  <v-btn block @click="list = !list" color="primary">Ver {{ !list ? 'Lista' : 'Agenda'}}</v-btn>
                </v-col>
                <v-col cols="6" sm="4" md="3">
                  <v-btn block append-icon="mdi-plus" @click="schedulerDialog = true" color="primary">Agendar</v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text v-if="!list" class="overflow-y-scroll">
          <Calendar :show-header="false" :limits="{
            start: '07:00',
            end: '23:59',
          }"/>
        </v-card-text>
        <v-card-text v-else>
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
            <template v-slot:[`item.client.name`]="{ item }">
              {{ item.client.name }}
            </template>
            <template v-slot:[`item.date`]="{ item }">
              {{ getDateTime(item.date) }}
            </template>
            <template v-slot:[`item.duration`]="{ item }">
              {{ item.duration }} Minutos
            </template>
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
            <template v-slot:[`item.status`]="{ item }">
              {{ getStatusType(item.status) }}
            </template>
          </v-data-table-server>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-dialog
    v-model="dialog"
    width="auto"
  >
    <v-card
      max-width="400"
      prepend-icon="mdi-alert-outline"
      text="Esses dados não podem ser restaurados"
      title="Deseja excluir esse appointmente?"
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
    <scheduler @cancel="schedulerDialog = false; selectedItem = null" :event="selectedItem" :client="selectedItem ? selectedItem.client : null" @reload="loadItems({page:1,
      itemsPerPage: 10,
      sortBy: []})"/>
  </v-dialog>
</template>
