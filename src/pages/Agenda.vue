<script>
import Scheduler from '../components/agenda/Scheduler.vue'
import MiniCalendar from '../components/agenda/MiniCalendar.vue'
import appointmentService from '../services/appointment.service'
import { format, parseISO, startOfWeek, addDays, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay, differenceInMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'vue3-toastify'

export default {
  name: "DefaultAgenda",
  components: {
    Scheduler,
    MiniCalendar,
  },
  data: () => ({
    ptBR,
    format,
    parseISO,
    list: false,
    reload: false,
    schedulerDialog: false,
    preselectedDate: null,
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
    selectedDate: new Date(),
    viewMode: 'monthly', // 'daily', 'weekly', or 'monthly'
    dailyViewMode: 'cards', // 'cards' or 'timeline'
    weekDays: [],
    monthDays: [],
    currentMonth: new Date(),
    appointments: [],
    appointmentDetailsDialog: false,
    selectedAppointment: null,
  }),
  computed: {
    currentUser() {
      return this.$store.state.auth.user
    },
    currentWeekDays() {
      const start = startOfWeek(this.selectedDate, { weekStartsOn: 1 })
      return Array.from({ length: 7 }, (_, i) => addDays(start, i))
    },
    currentMonthDays() {
      const start = startOfMonth(this.currentMonth)
      const end = endOfMonth(this.currentMonth)
      return eachDayOfInterval({ start, end })
    },
    appointmentsForSelectedDate() {
      return this.appointments.filter(appointment => {
        try {
          return isSameDay(parseISO(appointment.date), this.selectedDate)
        } catch (error) {
          console.error('Error parsing date:', appointment.date, error)
          return false
        }
      }).sort((a, b) => new Date(a.date) - new Date(b.date))
    },
    appointmentsForWeek() {
      return this.currentWeekDays.map(day => ({
        date: day,
        appointments: this.appointments.filter(appointment => {
          try {
            return isSameDay(parseISO(appointment.date), day)
          } catch (error) {
            console.error('Error parsing date:', appointment.date, error)
            return false
          }
        }).sort((a, b) => new Date(a.date) - new Date(b.date))
      }))
    },
    appointmentsForMonth() {
      return this.currentMonthDays.map(day => ({
        date: day,
        appointments: this.appointments.filter(appointment => {
          try {
            return isSameDay(parseISO(appointment.date), day)
          } catch (error) {
            console.error('Error parsing date:', appointment.date, error)
            return false
          }
        }).sort((a, b) => new Date(a.date) - new Date(b.date))
      }))
    },
    monthCalendarDays() {
      const firstDay = startOfMonth(this.currentMonth)
      const padding = (getDay(firstDay) + 6) % 7
      return [...Array(padding).fill(null), ...this.appointmentsForMonth]
    },
    sidebarCalendarDays() {
      const firstDay = startOfMonth(this.currentMonth)
      const padding = (getDay(firstDay) + 6) % 7
      return [...Array(padding).fill(null), ...this.monthDays]
    },
    viewModeOptions() {
      return [
        { value: 'daily', label: 'Diário', icon: 'mdi-calendar-day' },
        { value: 'weekly', label: 'Semanal', icon: 'mdi-calendar-week' },
        { value: 'monthly', label: 'Mensal', icon: 'mdi-calendar-month' }
      ]
    }
  },
  mounted() {
    this.loadAppointments()
    this.generateWeekDays()
    this.generateMonthDays()
  },
  methods: {
    update(item) {
      this.selectedItem = item
      this.schedulerDialog = true
    },
    deleteEvent(item) {
      this.loading = false
      this.selectedItem = item
      this.dialog = true
    },
    loadItems ({ page, itemsPerPage, sortBy }) {
      this.loading = true
      this.reload = Math.random()
      if (sortBy.length <= 1) {
        sortBy.push ({
          order: 'desc',
          key: 'id'
        })
      }
      appointmentService.getAppointments(`page=${page}&itemsPerPage=${itemsPerPage}&sort=${sortBy[0].key}&order=${sortBy[0].order}&search=${this.search}`).then((response) => {
        this.serverItems = response.data.data
        this.totalItems = response.data.total
      })
      this.loading = false
    },
    loadAppointments() {
      appointmentService.getAllAppointments().then((response) => {
        this.appointments = response.data
        // appointmentService.getGoogleCalendarEvents(this.currentUser.calendar).then((response) => {
        //   response.data.items.forEach((event) => {
        //     if (event.start && event.end) {
        //       this.appointments.push({
        //         title: 'Agendamento Google',
        //         people: event.attendees ? event.attendees.map((people) => people.email) : ['Sem pacientes vinculados'],
        //         date: parseISO(event.start.dateTime).toISOString().replace('.000Z', '.000000Z'),
        //         duration: differenceInMinutes(parseISO(event.end.dateTime), parseISO(event.start.dateTime)),
        //         id: event.id,
        //         calendarId: "google"
        //       })
        //     }
        //   })
        // })
        this.loading = false
      }).catch((error) => {
        console.error('Error loading appointments:', error)
        this.loading = false
        toast.error('Erro ao carregar agendamentos')
      })
    },
    remove () {
      this.loading = true
      appointmentService.deleteAppointment(this.selectedItem.id).then(() => {
        this.dialog = false
        this.loadAppointments()
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
    schedule(date) {
      this.preselectedDate = date
      this.schedulerDialog = true
    },
    getDateTime(date) {
      try {
        return format(parseISO(date), 'dd/MM/yyyy kk:mm')
      } catch (error) {
        console.error('Error parsing date:', date, error)
        return '--/--/---- --:--'
      }
    },
    getTimeOnly(date) {
      try {
        return format(parseISO(date), 'HH:mm')
      } catch (error) {
        console.error('Error parsing time:', date, error)
        return '--:--'
      }
    },
    getDayName(date) {
      return format(date, 'EEE', { locale: ptBR })
    },
    getDayNumber(date) {
      return format(date, 'dd')
    },
    isCurrentDay(date) {
      return isToday(date)
    },
    isSelectedDay(date) {
      return isSameDay(date, this.selectedDate)
    },
    isPastDay(date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)
      return checkDate < today
    },
    formatHour(hour) {
      return `${hour.toString().padStart(2, '0')}:00`
    },
    isCurrentHour(hour) {
      const now = new Date()
      return now.getHours() === hour && isToday(this.selectedDate)
    },
    getAppointmentsForHour(hour) {
      return this.appointmentsForSelectedDate.filter(appointment => {
        try {
          const appointmentHour = new Date(appointment.date).getHours()
          return appointmentHour === hour
        } catch (error) {
          return false
        }
      })
    },
    handleDayClick(date) {
      const appointments = this.getAppointmentsForDate(date)
      if (appointments.length === 0) {
        // Se não há agendamentos, abre o modal de criação
        this.selectedDate = date
        this.schedulerDialog = true
      } else {
        // Se há agendamentos, seleciona a data
        this.selectDate(date)
      }
    },
    showAppointmentDetails(appointment) {
      this.selectedAppointment = appointment
      this.appointmentDetailsDialog = true
    },
    showDayAppointments(date) {
      this.selectDate(date)
      // Aqui você pode implementar uma visualização específica para o dia
      // Por enquanto, apenas seleciona a data
    },
    editAppointment() {
      this.selectedItem = this.selectedAppointment
      this.appointmentDetailsDialog = false
      this.schedulerDialog = true
    },
    deleteAppointmentFromDetails() {
      this.selectedItem = this.selectedAppointment
      this.appointmentDetailsDialog = false
      this.dialog = true
    },
    selectDate(date) {
      this.selectedDate = date
    },
    previousMonth() {
      this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1)
      this.generateMonthDays()
    },
    nextMonth() {
      this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1)
      this.generateMonthDays()
    },
    generateWeekDays() {
      const start = startOfWeek(this.selectedDate, { weekStartsOn: 1 })
      this.weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i))
    },
    generateMonthDays() {
      const start = startOfMonth(this.currentMonth)
      const end = endOfMonth(this.currentMonth)
      this.monthDays = eachDayOfInterval({ start, end })
    },
    getProcedureColor(procedure) {
      const colors = {
        'Extração': '#FFD700', // Amarelo
        'Consulta': '#2196F3', // Azul
        'Limpeza': '#4CAF50', // Verde
        'Clareamento': '#FF9800', // Laranja
        'Ortodontia': '#9C27B0', // Roxo
        'default': '#E91E63' // Rosa
      }
      
      // Se procedure for um array, pegar o primeiro item
      if (Array.isArray(procedure)) {
        return colors[procedure[0]?.name] || colors.default
      }
      
      // Se procedure for um objeto com propriedade name
      if (procedure && typeof procedure === 'object' && procedure.name) {
        return colors[procedure.name] || colors.default
      }
      
      // Se procedure for uma string
      if (typeof procedure === 'string') {
        return colors[procedure] || colors.default
      }
      
      return colors.default
    },
    getProcedureName(procedure) {
      // Se procedure for um array, pegar o primeiro item
      if (Array.isArray(procedure)) {
        return procedure[0]?.name || 'Procedimento'
      }
      
      // Se procedure for um objeto com propriedade name
      if (procedure && typeof procedure === 'object' && procedure.name) {
        return procedure.name
      }
      
      // Se procedure for uma string
      if (typeof procedure === 'string') {
        return procedure
      }
      
      return 'Procedimento'
    },
    getAppointmentsForDate(date) {
      return this.appointments.filter(appointment => {
        try {
          return isSameDay(parseISO(appointment.date), date)
        } catch (error) {
          console.error('Error parsing date:', appointment.date, error)
          return false
        }
      })
    },
    onAppointmentReload() {
      this.loadAppointments()
    },
    changeViewMode(mode) {
      this.viewMode = mode
      if (mode === 'monthly') {
        this.currentMonth = new Date(this.selectedDate)
        this.generateMonthDays()
      }
    },
    previousWeek() {
      this.selectedDate = addDays(this.selectedDate, -7)
      this.currentMonth = new Date(this.selectedDate)
      this.generateMonthDays()
    },
    nextWeek() {
      this.selectedDate = addDays(this.selectedDate, 7)
      this.currentMonth = new Date(this.selectedDate)
      this.generateMonthDays()
    },
    previousDay() {
      this.selectedDate = addDays(this.selectedDate, -1)
      this.currentMonth = new Date(this.selectedDate)
      this.generateMonthDays()
    },
    nextDay() {
      this.selectedDate = addDays(this.selectedDate, 1)
      this.currentMonth = new Date(this.selectedDate)
      this.generateMonthDays()
    }
  },
  watch: {
    selectedDate() {
      this.generateWeekDays()
    }
  }
}
</script>

<template>
  <div class="agenda-container">
    <!-- Header com navegação do calendário -->
    <div class="agenda-header">
      <div class="header-content">
        <!-- Navegação do calendário -->
        <div class="calendar-navigation">
          <!-- Título do mês (apenas no modo mensal) -->
          <div v-if="viewMode === 'monthly'" class="month-title">
            <v-btn 
              icon="mdi-chevron-left" 
              size="small" 
              variant="text"
              @click="previousMonth"
            ></v-btn>
            <h2>{{ format(currentMonth, 'MMMM yyyy', { locale: ptBR }) }}</h2>
            <v-btn 
              icon="mdi-chevron-right" 
              size="small" 
              variant="text"
              @click="nextMonth"
            ></v-btn>
          </div>
          
          <!-- Título do dia (apenas no modo diário) -->
          <div v-else-if="viewMode === 'daily'" class="day-title">
            <v-btn icon="mdi-chevron-left" size="small" variant="text" @click="previousDay"></v-btn>
            <h2>{{ format(selectedDate, 'EEEE, dd \'de\' MMMM', { locale: ptBR }) }}</h2>
            <v-btn icon="mdi-chevron-right" size="small" variant="text" @click="nextDay"></v-btn>
          </div>

          <!-- Título da semana (apenas no modo semanal) -->
          <div v-else-if="viewMode === 'weekly'" class="week-title">
            <v-btn icon="mdi-chevron-left" size="small" variant="text" @click="previousWeek"></v-btn>
            <h2>{{ format(currentWeekDays[0], 'dd \'de\' MMMM', { locale: ptBR }) }} - {{ format(currentWeekDays[6], 'dd \'de\' MMMM', { locale: ptBR }) }}</h2>
            <v-btn icon="mdi-chevron-right" size="small" variant="text" @click="nextWeek"></v-btn>
          </div>
        </div>
        
        <div class="header-actions">
          <!-- Select de modo de visualização -->
          <v-select
            v-model="viewMode"
            :items="viewModeOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            class="view-mode-select"
            @update:model-value="changeViewMode"
          >
            <template v-slot:prepend-inner>
              <v-icon :icon="viewModeOptions.find(opt => opt.value === viewMode)?.icon"></v-icon>
            </template>
          </v-select>
          
          <v-btn 
            @click="schedulerDialog = true"
            color="primary"
            prepend-icon="mdi-plus"
            class="schedule-btn"
          >
            Agendar
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Abas dos dias da semana (apenas no modo diário) -->
    <div v-if="viewMode === 'daily'" class="week-tabs-container">
      <div class="week-tabs">
        <div 
          v-for="day in currentWeekDays" 
          :key="day"
          class="day-tab"
          :class="{
            'current-day': isCurrentDay(day),
            'selected-day': isSelectedDay(day)
          }"
          @click="selectDate(day)"
        >
          <div class="day-name">{{ getDayName(day) }}</div>
          <div class="day-number">{{ getDayNumber(day) }}</div>
          <div class="appointment-count" v-if="getAppointmentsForDate(day).length > 0">
            {{ getAppointmentsForDate(day).length }}
          </div>
        </div>
      </div>
    </div>

    <!-- Conteúdo principal -->
    <div class="agenda-content" :class="{ 'monthly-layout': viewMode === 'monthly' }">
      <!-- Área principal da agenda -->
      <div class="main-agenda-area">
        <!-- Visualização Diária -->
        <div v-if="viewMode === 'daily'" class="daily-view">
          <div class="daily-view-toggle-container">
            <div class="daily-view-toggle">
              <v-switch
                v-model="dailyViewMode"
                :true-value="'timeline'"
                :false-value="'cards'"
                color="primary"
                hide-details
                density="compact"
                inset
              >
                <template v-slot:label>
                  <span class="switch-label">{{ dailyViewMode === 'timeline' ? 'Timeline' : 'Cards' }}</span>
                </template>
              </v-switch>
            </div>
          </div>
          
          <!-- Visualização Cards -->
          <div v-if="dailyViewMode === 'cards'" class="appointments-container">
            <div v-if="appointmentsForSelectedDate.length === 0" class="no-appointments">
              <v-icon size="64" color="grey-lighten-1">mdi-calendar-blank</v-icon>
              <p>Nenhum agendamento para este dia</p>
            </div>
            
            <div v-else class="appointment-cards">
              <div 
                v-for="appointment in appointmentsForSelectedDate" 
                :key="appointment.id"
                class="appointment-card"
                :style="{ borderLeftColor: getProcedureColor(appointment.procedures) }"
              >
                <div class="card-header">
                  <div class="patient-info">
                    <v-icon size="20" color="primary">mdi-account</v-icon>
                    <span class="patient-name">{{ appointment.client?.name || 'Cliente não informado' }}</span>
                  </div>
                  <div class="time-info">
                    <v-icon size="16" color="grey">mdi-clock</v-icon>
                    <span class="time">{{ getTimeOnly(appointment.date) }}</span>
                  </div>
                </div>
                
                <div class="card-content">
                  <div class="procedure-info">
                    <v-chip 
                      :color="getProcedureColor(procedure)"
                      size="small"
                      variant="outlined"
                      v-for="procedure in appointment.procedures" :key="procedure"
                    >
                      {{ getProcedureName(procedure) }}
                    </v-chip>
                  </div>
                  
                  <div v-if="appointment.description" class="description">
                    {{ appointment.description }}
                  </div>
                  
                  <div class="duration">
                    <v-icon size="14" color="grey">mdi-timer</v-icon>
                    <span>{{ appointment.duration }} min</span>
                  </div>
                </div>
                
                <div class="card-actions">
                  <v-btn 
                    icon="mdi-pencil" 
                    size="small" 
                    variant="text"
                    @click="update(appointment)"
                    color="primary"
                  ></v-btn>
                  <v-btn 
                    icon="mdi-delete" 
                    size="small" 
                    variant="text"
                    @click="deleteEvent(appointment)"
                    color="error"
                  ></v-btn>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Visualização Timeline -->
          <div v-else class="daily-timeline">
            <div 
              v-for="hour in 24" 
              :key="hour - 1"
              class="time-slot"
              :class="{ 'current-hour': isCurrentHour(hour - 1) }"
            >
              <div class="time-label">
                {{ formatHour(hour - 1) }}
              </div>
              <div class="time-content">
                <div 
                  v-for="appointment in getAppointmentsForHour(hour - 1)" 
                  :key="appointment.id"
                  class="timeline-appointment"
                  :style="{ borderLeftColor: getProcedureColor(appointment.procedures) }"
                >
                  <div class="appointment-time">{{ getTimeOnly(appointment.date) }}</div>
                  <div class="appointment-patient">{{ appointment.client?.name || 'Cliente não informado' }}</div>
                  <div class="appointment-procedure">
                    <v-chip 
                      :color="getProcedureColor(procedure)"
                      size="small"
                      variant="outlined"
                      v-for="procedure in appointment.procedures" :key="procedure"
                    >
                      {{ getProcedureName(procedure) }}
                    </v-chip>
                  </div>
                  <div class="appointment-actions">
                    <v-btn 
                      icon="mdi-pencil" 
                      size="x-small" 
                      variant="text"
                      @click="update(appointment)"
                      color="primary"
                    ></v-btn>
                    <v-btn 
                      icon="mdi-delete" 
                      size="x-small" 
                      variant="text"
                      @click="deleteEvent(appointment)"
                      color="error"
                    ></v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Visualização Semanal -->
        <div v-else-if="viewMode === 'weekly'" class="weekly-view">
          <div class="week-grid">
            <div
              v-for="dayData in appointmentsForWeek"
              :key="dayData.date"
              class="day-column"
              :class="{
                'current-day': isCurrentDay(dayData.date),
                'selected-day': isSelectedDay(dayData.date)
              }"
            >
              <div class="day-header" @click="selectDate(dayData.date)">
                <div class="day-name">{{ getDayName(dayData.date) }}</div>
                <div class="day-number">{{ getDayNumber(dayData.date) }}</div>
                <div v-if="getAppointmentsForDate(dayData.date).length > 0" class="week-appt-count">
                  {{ getAppointmentsForDate(dayData.date).length }}
                </div>
              </div>
              
              <div class="day-appointments">
                <div 
                  v-for="appointment in dayData.appointments" 
                  :key="appointment.id"
                  class="mini-appointment-card"
                  :style="{ borderLeftColor: getProcedureColor(appointment.procedures) }"
                  @click="selectDate(dayData.date)"
                >
                  <div class="mini-time">{{ getTimeOnly(appointment.date) }}</div>
                  <div class="mini-patient">{{ appointment.client?.name || 'Cliente não informado' }}</div>
                  <div class="mini-procedure">
                    <v-chip 
                      :color="getProcedureColor(procedure)"
                      size="small"
                      variant="outlined"
                      v-for="procedure in appointment.procedures" :key="procedure"
                    >
                      {{ getProcedureName(procedure) }}
                    </v-chip>
                  </div>
                  <div class="d-flex">
                    <v-spacer></v-spacer>
                    <v-btn
                      color="primary"
                      icon="mdi-pencil"
                      desnsity="compact"
                      variant="text"
                      @click="selectedAppointment = appointment;editAppointment()"
                    ></v-btn>
                    <v-btn
                      color="error"
                      icon="mdi-delete"
                      desnsity="compact"
                      variant="text"
                      @click="selectedAppointment = appointment;deleteAppointmentFromDetails()"
                    ></v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Visualização Mensal -->
        <div v-else-if="viewMode === 'monthly'" class="monthly-view">
          
          <div class="month-calendar">
            <div class="weekdays-header">
              <div v-for="day in ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']" :key="day" class="weekday">
                {{ day }}
              </div>
            </div>
            
            <div class="month-grid">
              <template v-for="(dayData, index) in monthCalendarDays" :key="dayData ? dayData.date : 'pad-' + index">
                <div v-if="dayData === null" class="month-day empty-day" />
                <div
                  v-else
                  class="month-day"
                  :class="{
                    'current-day': isCurrentDay(dayData.date),
                    'selected-day': isSelectedDay(dayData.date),
                    'has-appointments': dayData.appointments.length > 0
                  }"
                  @click="handleDayClick(dayData.date)"
                >
                  <div class="day-number">{{ getDayNumber(dayData.date) }}</div>
                  <div v-if="dayData.appointments.length > 0" class="month-appointments">
                    <div
                      v-for="appointment in dayData.appointments.slice(0, 2)"
                      :key="appointment.id"
                      class="month-appointment-item"
                      :style="{ borderLeftColor: getProcedureColor(appointment.procedures) }"
                      @click.stop="showAppointmentDetails(appointment)"
                    >
                      <div class="appointment-time-small">{{ getTimeOnly(appointment.date) }}</div>
                      <div class="appointment-patient-small">{{ appointment.client?.name || 'Cliente não informado' }}</div>
                    </div>
                    <div v-if="dayData.appointments.length > 2" class="more-appointments" @click.stop="showDayAppointments(dayData.date)">
                      +{{ dayData.appointments.length - 2 }}
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Mini calendário lateral (apenas nos modos diário e semanal) -->
      <div v-if="viewMode !== 'monthly'" class="sidebar-calendar">
        <mini-calendar
          v-model="selectedDate"
          :appointments="appointments"
        />
      </div>
    </div>
  </div>

  <!-- Diálogos -->
  <v-dialog
    v-model="dialog"
    width="auto"
  >
    <v-card
      max-width="400"
      prepend-icon="mdi-alert-outline"
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
  
  <v-dialog
    v-model="schedulerDialog"
    width="auto"
  >
    <scheduler
      @cancel="schedulerDialog = false; selectedItem = null; preselectedDate = null"
      :event="selectedItem"
      :client="selectedItem ? selectedItem.client : null"
      :preselectedDate="preselectedDate ? preselectedDate.toISOString() : null"
      @reload="onAppointmentReload"
    />
  </v-dialog>

  <!-- Modal de detalhes do agendamento -->
  <v-dialog
    v-model="appointmentDetailsDialog"
    max-width="500"
  >
    <v-card v-if="selectedAppointment">
      <v-card-title class="d-flex align-center">
        <v-icon size="24" color="primary" class="me-3">mdi-calendar-clock</v-icon>
        Detalhes do Agendamento
      </v-card-title>
      
      <v-card-text>
        <div class="appointment-details">
          <div class="detail-row">
            <div class="detail-label">
              <v-icon size="16" color="grey">mdi-account</v-icon>
              <span>Paciente:</span>
            </div>
            <div class="detail-value cursor-pointer" @click="$router.push('/pacientes/'+selectedAppointment.client?.id)">{{ selectedAppointment.client?.name || 'Cliente não informado' }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">
              <v-icon size="16" color="grey">mdi-clock</v-icon>
              <span>Data e Hora:</span>
            </div>
            <div class="detail-value">{{ getDateTime(selectedAppointment.date) }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">
              <v-icon size="16" color="grey">mdi-medical-bag</v-icon>
              <span>Procedimento:</span>
            </div>
            <div class="detail-value">
              <v-chip 
                :color="getProcedureColor(procedure)"
                size="small"
                variant="outlined"
                v-for="procedure in selectedAppointment.procedures" :key="procedure"
              >
                {{ getProcedureName(procedure) }}
              </v-chip>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">
              <v-icon size="16" color="grey">mdi-timer</v-icon>
              <span>Duração:</span>
            </div>
            <div class="detail-value">{{ selectedAppointment.duration }} minutos</div>
          </div>
          
          <div v-if="selectedAppointment.description" class="detail-row">
            <div class="detail-label">
              <v-icon size="16" color="grey">mdi-text</v-icon>
              <span>Descrição:</span>
            </div>
            <div class="detail-value">{{ selectedAppointment.description }}</div>
          </div>
        </div>
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          text="Cancelar"
          variant="outlined"
          @click="appointmentDetailsDialog = false"
        ></v-btn>
        <v-btn
          text="Editar"
          color="primary"
          prepend-icon="mdi-pencil"
          @click="editAppointment"
        ></v-btn>
        <v-btn
          text="Excluir"
          color="error"
          prepend-icon="mdi-delete"
          @click="deleteAppointmentFromDetails"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.agenda-container {
  min-height: 100vh;
}

.agenda-header {
 
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.calendar-navigation {
  display: flex;
  align-items: center;
  flex: 1;
}

.day-title,
.week-title {
  display: flex;
  align-items: center;
  gap: 4px;
}

.day-title h2,
.week-title h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  text-transform: capitalize;
}

.daily-view-toggle-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  padding: 0 16px;
}

.month-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.month-title h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  text-transform: capitalize;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.view-mode-select {
  min-width: 140px;
}

.schedule-btn {
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.week-tabs-container {
  border-radius: 8px;
  padding-top: 16px;
  padding-bottom: 16px;
}

.week-tabs {
  display: flex;
  gap: 8px;
}

.day-tab {
  flex: 1;
  padding: 16px 12px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: #f8f9fa;
  border: 2px solid transparent;
}

.day-tab:hover {
  background: #FDF2F2;
  transform: translateY(-2px);
}

.day-tab.current-day {
  background: #C62424;
  color: white;
  font-weight: 700;
}

.day-tab.selected-day {
  background: #FDF2F2;
  border-color: #C62424;
  color: #C62424;
  font-weight: 600;
}

.day-name {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.day-number {
  font-size: 16px;
  font-weight: 500;
}

.appointment-count {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #C62424;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.agenda-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  margin-top: 16px;
}

.agenda-content.monthly-layout {
  grid-template-columns: 1fr;
}

.main-agenda-area {
  border-radius: 8px;
}

.date-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.date-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  text-transform: capitalize;
}

.daily-view-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.switch-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.daily-timeline {
  display: flex;
  flex-direction: column;
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.time-slot {
  display: flex;
  min-height: 60px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.time-slot:hover {
  background-color: #f8f9fa;
}

.time-slot.current-hour {
  background-color: #e3f2fd;
  border-left: 3px solid #C62424;
}

.time-label {
  width: 80px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
}

.time-content {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-appointment {
  background: white;
  border-radius: 6px;
  padding: 8px 12px;
  border-left: 3px solid;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
}

.timeline-appointment:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.appointment-time {
  font-size: 12px;
  font-weight: 600;
  color: #C62424;
  min-width: 50px;
}

.appointment-patient {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  flex: 1;
}

.appointment-procedure {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
}

.appointment-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.timeline-appointment:hover .appointment-actions {
  opacity: 1;
}

/* Estilos para Cards */
.appointments-container {
  min-height: 400px;
}

.no-appointments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #9e9e9e;
}

.no-appointments p {
  margin-top: 16px;
  font-size: 16px;
}

.appointment-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.appointment-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid;
  transition: all 0.3s ease;
  position: relative;
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.patient-name {
  font-weight: 600;
  font-size: 16px;
  color: #1a1a1a;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time {
  font-weight: 600;
  color: #C62424;
}

.card-content {
  margin-bottom: 16px;
}

.procedure-info {
  margin-bottom: 8px;
}

.description {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.duration {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #9e9e9e;
  font-size: 14px;
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Estilos para o modal de detalhes */
.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 120px;
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.detail-value {
  flex: 1;
  color: #1a1a1a;
  font-size: 14px;
  line-height: 1.4;
}



.weekly-view {
  padding: 0;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-column {
  border-radius: 8px;
  min-height: 420px;
  background: white;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.day-column.current-day .day-header {
  background: #C62424;
}

.day-column.current-day .day-header .day-name,
.day-column.current-day .day-header .day-number {
  color: white;
}

.day-column.selected-day .day-header {
  background: #FDF2F2;
  border-bottom-color: #C62424;
}

.day-column.selected-day .day-header .day-name,
.day-column.selected-day .day-header .day-number {
  color: #C62424;
}

.day-header {
  text-align: center;
  padding: 14px 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #efefef;
  cursor: pointer;
  transition: background 0.2s ease;
  position: relative;
}

.day-header:hover {
  background: #FDF2F2;
}

.day-column.current-day .day-header:hover,
.day-column.selected-day .day-header:hover {
  filter: brightness(0.97);
}

.day-header .day-name {
  font-size: 11px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
}

.day-header .day-number {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.week-appt-count {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #C62424;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.day-column.current-day .week-appt-count {
  background: white;
  color: #C62424;
}

.day-appointments {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 8px;
  flex: 1;
}

.mini-appointment-card {
  background: #fafafa;
  border-radius: 6px;
  padding: 8px 10px;
  border-left: 3px solid;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mini-appointment-card:hover {
  background: #FFF0F0;
  transform: translateX(2px);
}

.mini-time {
  font-size: 11px;
  font-weight: 700;
  color: #C62424;
  margin-bottom: 3px;
}

.mini-patient {
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-procedure {
  font-size: 11px;
  color: #888;
}

/* Visualização Mensal */
.monthly-view {
  padding: 0;
}

.month-calendar {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8e8e8;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
}

.weekday {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: #aaa;
  padding: 10px 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e8e8e8;
}

.month-day {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  cursor: pointer;
  transition: background 0.15s ease;
  position: relative;
  padding: 6px 8px;
  min-height: 90px;
  overflow: hidden;
  width: 100%;
  background: #ffffff;
}

.month-day.empty-day {
  pointer-events: none;
  background: #f9f9f9;
}

.month-day:not(.empty-day):not(.selected-day):hover {
  background: #f5f5f5;
}

.month-day.current-day {
  background: #FFF5F5;
}

.month-day.current-day .day-number {
  color: #C62424;
  font-weight: 700;
}

.month-day.selected-day {
  background: #C62424;
}

.month-day.selected-day .day-number {
  color: white;
  font-weight: 700;
}

.month-day .day-number {
  font-size: 13px;
  font-weight: 400;
  margin-bottom: 4px;
  align-self: flex-end;
  color: #444;
  line-height: 1;
}

.month-appointments {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

.month-appointment-item {
  background: white;
  border-radius: 3px;
  padding: 3px 6px;
  cursor: pointer;
  transition: background 0.15s ease;
  border-left: 3px solid;
  overflow: hidden;
}

.month-appointment-item:hover {
  background: #FFF0F0;
}

.month-day.selected-day .month-appointment-item {
  background: rgba(255, 255, 255, 0.18);
}

.month-day.selected-day .month-appointment-item:hover {
  background: rgba(255, 255, 255, 0.28);
}

.appointment-time-small {
  font-size: 10px;
  font-weight: 700;
  color: #C62424;
  line-height: 1.2;
}

.month-day.selected-day .appointment-time-small {
  color: rgba(255, 255, 255, 0.85);
}

.appointment-patient-small {
  font-size: 11px;
  color: #333;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.month-day.selected-day .appointment-patient-small {
  color: white;
}

.more-appointments {
  font-size: 10px;
  color: #888;
  font-weight: 600;
  padding: 2px 0 0 2px;
}

.month-day.selected-day .more-appointments {
  color: rgba(255, 255, 255, 0.7);
}

.sidebar-calendar {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8e8e8;
  height: fit-content;
}

/* Responsividade */
@media (max-width: 1200px) {
  .agenda-content:not(.monthly-layout) {
    grid-template-columns: 1fr;
  }
  
  .sidebar-calendar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .agenda-container {
    padding: 12px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .calendar-navigation {
    justify-content: center;
  }
  
  .header-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .view-mode-select {
    min-width: 120px;
  }
  
  .date-header-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .daily-view-toggle {
    justify-content: center;
  }
  
  .week-tabs {
    flex-wrap: wrap;
  }
  
  .day-tab {
    flex: 1 1 calc(50% - 4px);
  }
  
  .week-grid {
    grid-template-columns: 1fr;
  }
  
  .day-column {
    min-height: auto;
  }
  
  .month-grid {
    gap: 1px;
  }
  
  .month-day {
    min-height: 40px;
    padding: 1px;
  }
  
  .month-day .day-number {
    font-size: 10px;
  }
  
  .more-appointments {
    font-size: 7px;
  }
}
</style>

