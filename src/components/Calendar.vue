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
import appointmentService from '../services/appointment.service'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { format, parseISO, add } from "date-fns"
import { ref, defineProps, defineComponent } from 'vue'
import { auth } from '../store/auth.module'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { toast } from 'vue3-toastify'

defineComponent({
  name: 'CalendarComponent'
})

const eventModal = createEventModalPlugin()

const props = defineProps({ showHeader: Boolean, gridHeight: Number, limits: Object })
const dialog = ref(false)
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
    dayBoundaries: props.limits,
    weekOptions: {
      /**
      * The total height in px of the week grid (week- and day views)
      * */
      gridHeight: props.gridHeight ?? 1200,

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

function remove () {
  loading.value = true
  if (selectedEvent.value.title === 'Agendamento Google') {
    appointmentService.deleteGoogleAppointment(auth.state.user.calendar, selectedEvent.value.id).then(() => {
      dialog.value = false
      selectedEvent.value = {}
      loading.value = false
      calendarApp.eventsService.remove(selectedEvent.value.id)
    },
      (error) => {
        loading.value = false
        toast.error((error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                  error.message ||
                  error.toString())
      })
  } else {
    appointmentService.deleteAppointment(selectedEvent.value.id).then(() => {
      dialog.value = false
      selectedEvent.value = {}
      loading.value = false
      calendarApp.eventsService.remove(selectedEvent.value.id)
    },
      (error) => {
        loading.value = false
        toast.error((error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                  error.message ||
                  error.toString())
      })
  }
}

function load() {
  appointmentService.getAllAppointments().then((response) => {
    response.data.forEach((event) => {
      calendarApp.eventsService.add({
        title: event.procedures,
        people: [event.client],
        client: event.client,
        date: event.date,
        user: event.user_id,
        procedures: event.procedures,
        duration: event.duration,
        description: event.description,
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
    appointmentService.getGoogleCalendarEvents(auth.state.user.calendar).then((response) => {
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


function getDateTime(date) {
  return format(parseISO(date), 'dd/MM/yyyy kk:mm')
}

load()

eventModal.close(); // close the modal
</script>

<template>
  <ScheduleXCalendar :calendar-app="calendarApp">
    <template v-if="showHeader" #headerContent="{ }">
    </template>
    <template #timeGridEvent="{ calendarEvent }">
      <div class="event px-3 py-1">
        <div class="d-flex ga-4">
          <div><v-icon>mdi-account</v-icon></div>
          <div v-for="people in calendarEvent.people" :key="people">
            <span class="cursor-pointer">{{ people.name + (calendarEvent.people.indexOf(people) === calendarEvent.people.length -1 ? '' : ', ') }}</span>
          </div>
        </div>

        <div class="d-flex ga-4">
          <div><v-icon>mdi-clock</v-icon></div>
          <div>{{ getDateTime(calendarEvent.start) }}</div>
        </div>

        <div class="mt-1 d-flex ga-2">
          <v-chip v-for="procedure in calendarEvent.title" :key="procedure" density="compact" color="primary" size="small">{{ procedure.name }}</v-chip>
        </div>
      </div>
    </template>
    <template #eventModal="{ calendarEvent }">
      <div class="event bg-grey rounded d-flex pa-3">
        <div class="d-flex flex-column ga-4">
          <div class="d-flex ga-4">
            <div><v-icon>mdi-account</v-icon></div>
            <div v-for="people in calendarEvent.people" :key="people">
              <span @click="$router.push('pacientes/'+people.id)" class="cursor-pointer link">{{ people.name + (calendarEvent.people.indexOf(people) === calendarEvent.people.length -1 ? '' : ', ') }}</span>
            </div>
          </div>
  
          <div class="d-flex ga-4">
            <div><v-icon>mdi-clock</v-icon></div>
            <div>{{ getDateTime(calendarEvent.start) }}</div>
          </div>

          <div class="d-flex ga-4" v-if="calendarEvent.description?.length > 0">
            <div><v-icon>mdi-text</v-icon></div>
            <div>{{ calendarEvent.description }}</div>
          </div>
          
          <div class="mt-1 d-flex ga-2">
            <v-chip v-for="procedure in calendarEvent.title" :key="procedure" density="compact" color="primary" size="small">{{ procedure.name }}</v-chip>
          </div>
        </div>
        <div class="ml-auto d-flex ga-3">
          <v-btn density="comfortable" size="small" icon="mdi-pencil" @click="$emit('update', calendarEvent)" color="warning"></v-btn>
          <v-btn density="comfortable" size="small" icon="mdi-delete" @click="$emit('delete', calendarEvent)" color="primary"></v-btn>
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

/*.sx__event:has(.event:hover) {
  height: fit-content !important;
}*/

.sx__event-modal.is-open {
  overflow: hidden;
}

.event {
  height: -webkit-fill-available;
  z-index: 3;
  -webkit-box-shadow: 6px 6px 26px -11px rgba(0,0,0,0.75) !important;
  -moz-box-shadow: 6px 6px 26px -11px rgba(0,0,0,0.75) !important;
  box-shadow: 6px 6px 26px -11px rgba(0,0,0,0.75) !important;
}
</style>
