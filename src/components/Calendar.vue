<script setup>
import { ScheduleXCalendar } from '@schedule-x/vue'
import {
  createCalendar,
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import '@schedule-x/theme-default/dist/index.css'
import userService from '../services/user.service'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { format, parseISO, add } from "date-fns"
import { ref } from 'vue'
import { auth } from '../store/auth.module'

const dark = localStorage.getItem('dark')
const props = defineProps({ showHeader: Boolean })
const dialog = ref(false)
const snackbar = ref(false)
const message = ref('')
const loading = ref(false)
const selectedEvent = ref({})

const eventsServicePlugin = createEventsServicePlugin()

// Do not use a ref here, as the calendar instance is not reactive, and doing so might cause issues
// For updating events, use the events service plugin
const calendarApp = createCalendar(
  {
    locale: 'pt-BR',
    weekOptions: {
      /**
      * The total height in px of the week grid (week- and day views)
      * */
      gridHeight: 1500,

      /**
      * The number of days to display in week view
      */
      nDays: 5,

      /**
      * The width in percentage of the event element in the week grid
      * Defaults to 100, but can be used to leave a small margin to the right of the event
      */
      eventWidth: 100,

      /**
      * Intl.DateTimeFormatOptions used to format the hour labels on the time axis
      * Default: { hour: 'numeric' }
      */
      timeAxisFormatOptions: { hour: '2-digit', minute: '2-digit' },
    },
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    isDark: false,
    events: []
  },
  [eventsServicePlugin]
)

function getName(type) {
  switch (type) {
    case 1:
      return 'Consulta'
    case 2:
      return 'Extração'
    case 3:
      return 'Manutenção'
    default:
      return 'Consulta'
  }
}

function remove () {
  loading.value = true
  userService.deleteAppointment(selectedEvent.value.id).then(() => {
    dialog.value = false
    selectedEvent.value = {}
    loading.value = false
    calendarApp.eventsService.remove(selectedEvent.value.id)
  },
    (error) => {
      loading.value = false
      snackbar.value = true
      message.value =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
    })
}

function load() {
  userService.getAppointments().then((response) => {
    response.data.forEach((event) => {
      calendarApp.eventsService.add({
        title: getName(event.type),
        people: [event.client.name],
        start: format(parseISO(event.date), 'yyyy-MM-dd kk:mm'),
        end: format(add(parseISO(event.date), {
          minutes: event.duration,
        }), 'yyyy-MM-dd kk:mm'),
        id: event.id
      })
    })
  })

  if (auth.state.user.calendar) {
    userService.getGoogleCalendarEvents(auth.state.user.calendar).then((response) => {
      response.data.items.forEach((event) => {
        if (event.start && event.end) {
          calendarApp.eventsService.add({
            title: 'Agendamento Google',
            people: event.attendees ? event.attendees.map((people) => people.email) : 'Sem pacientes vinculadas',
            start: format(parseISO(event.start.dateTime), 'yyyy-MM-dd kk:mm'),
            end: format(parseISO(event.end.dateTime), 'yyyy-MM-dd kk:mm'),
            id: event.id
          })
        }
      })
    })
  }
}

load()
</script>

<template>
  <ScheduleXCalendar :calendar-app="calendarApp">
    <template v-if="!showHeader" style="display: none !important;" #headerContent="{ calendarEvent }">
    </template>
    <template class="h-fill" #timeGridEvent="{ calendarEvent }">
      <div :class="calendarEvent.title !== 'Agendamento Google' ? 'border-red ' : 'border-info'" class="d-flex pa-1 justify-space-between border-t-lg text-truncate">
        <div>
          {{ calendarEvent.title }}
          <div class="d-flex ga-2 mt-1 align-center">
            <v-icon>mdi-clock-outline</v-icon>
            <div>{{ format(parseISO(calendarEvent.start), 'dd/MM/yyyy kk:mm') }}</div>
          </div>
          <div class="d-flex ga-2 align-center">
            <v-icon>mdi-account-outline</v-icon>
            <div>{{ calendarEvent.people.toString() }}</div>
          </div>
        </div>
        <div class="d-flex ga-1 h-auto">
          <v-btn size="small" density="compact" icon="mdi-delete" @click="dialog = true; selectedEvent = calendarEvent" color="error" variant="text"/>
        </div>
      </div>
    </template>
  </ScheduleXCalendar>
  <v-dialog
    v-model="dialog"
    width="auto"
  >
    <v-card
      max-width="400"
      prepend-icon="mdi-alert"
      text="Esses dados não podem ser restaurados"
      title="Deseja excluir esse evento?"
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
</template>

<style>
.sx__calendar {
  --sx-color-background: rgb(var(--v-theme-surface)) !important;
  --sx-color-primary: rgb(var(--v-theme-primary)) !important;
  --sx-color-on-primary: rgb(var(--v-theme-on-surface)) !important;
  --sx-internal-color-text: rgb(var(--v-theme-on-surface)) !important;
  --sx-color-on-background: rgb(var(--v-theme-on-surface)) !important;
  --sx-color-primary-container: rgb(var(--v-theme-primary)) !important;
  --sx-color-on-primary-container: rgb(var(--v-theme-on-surface)) !important;
  --sx-color-surface-container-low: rgb(var(--v-theme-surface)) !important;
  border:none;
  background-color: rgb(var(--sx-color-background));
}

.sx__calendar-header .sx__date-input {
  padding: 9px;
}
.sx__view-selection-selected-item {
  padding: 9px;
}
.sx__today-button {
  padding: 9px;
}
.sx__calendar-header {
  padding-left: 0;
  padding-right: 0;
}

.sx__time-grid-event {
  background-color: rgb(var(--v-theme-surface-light)) !important;
}

.sx__month-grid-day__events {
  margin-left: 8px;
}
</style>
