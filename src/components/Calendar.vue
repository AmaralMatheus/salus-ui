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
import { ref, defineProps, defineComponent } from 'vue'
import { auth } from '../store/auth.module'
import { createEventModalPlugin } from '@schedule-x/event-modal'

defineComponent({
  name: 'CalendarComponent'
})

const eventModal = createEventModalPlugin()

const props = defineProps({ showHeader: Boolean, gridHeight: Number })
props
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
    calendars: {
      salus: {
        colorName: 'personal',
        lightColors: {
          main: '#C62424',
          container: '#eeeeee',
          onContainer: '#111111',
        },
        darkColors: {
          main: '#C62424',
          onContainer: '#ffdee6',
          container: '#a24258',
        },
      },
      google: {
        colorName: 'work',
        lightColors: {
          main: '#2196F3',
          container: '#eeeeee',
          onContainer: '#111111',
        },
        darkColors: {
          main: '#2196F3',
          onContainer: '#fff5de',
          container: '#a29742',
        },
      },
    },
    weekOptions: {
      /**
      * The total height in px of the week grid (week- and day views)
      * */
      gridHeight: props.gridHeight,

      /**
      * The number of days to display in week view
      */
      nDays: 5,

      /**
      * The width in percentage of the event element in the week grid
      * Defaults to 100, but can be used to leave a small margin to the right of the event
      */
      eventWidth: 100,
      
      isResponsive: true,

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
  [eventsServicePlugin, eventModal]
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
  if (selectedEvent.value.title === 'Agendamento Google') {
    userService.deleteGoogleAppointment(auth.state.user.calendar, selectedEvent.value.id).then(() => {
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
  } else {
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
}

function load() {
  userService.getAllAppointments().then((response) => {
    response.data.forEach((event) => {
      calendarApp.eventsService.add({
        title: getName(event.type),
        people: [event.client.name],
        start: format(parseISO(event.date), 'yyyy-MM-dd kk:mm'),
        end: format(add(parseISO(event.date), {
          minutes: event.duration,
        }), 'yyyy-MM-dd kk:mm'),
        id: event.id,
        calendarId: "salus"
      })
    })
  })

  if (auth.state.user.calendar) {
    userService.getGoogleCalendarEvents(auth.state.user.calendar).then((response) => {
      response.data.items.forEach((event) => {
        if (event.start && event.end) {
          calendarApp.eventsService.add({
            title: 'Agendamento Google',
            people: event.attendees ? event.attendees.map((people) => people.email) : ['Sem pacientes vinculados'],
            start: format(parseISO(event.start.dateTime), 'yyyy-MM-dd kk:mm'),
            end: format(parseISO(event.end.dateTime), 'yyyy-MM-dd kk:mm'),
            id: event.id,
            calendarId: "google"
          })
        }
      })
    })
  }
}

load()

eventModal.close(); // close the modal
</script>

<template>
  <ScheduleXCalendar :calendar-app="calendarApp">
    <template v-if="showHeader" #headerContent="{ }">
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
  border: none;
  border-radius: 0;
  background-color: rgb(var(--sx-color-background));
}

.sx__view-container {
  border: solid 1px var(--sx-color-outline-variant) !important;
  border-radius: var(--sx-rounding-extra-small);
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

.sx__week-grid__date-number {
  color: white !important;
}

.sx__event {
  transition: ease-in-out .3s;
}

.sx__event:has(.event:hover) {
  height: fit-content !important;
}

.sx__event-modal.is-open {
  overflow: hidden;
}
</style>
