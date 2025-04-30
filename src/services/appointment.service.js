import axios from 'axios'
import authHeader from './auth-header'

class AppointmentService {
  getGoogleCalendarEvents(calendarId) {
    return axios.get(process.env.G_CALENDAR_API_URL + calendarId + '/events?key=' + process.env.G_CALENDAR_TOKEN)
  }
  schedule(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'appointments', data, { headers: authHeader() })
  }
  updateSchedule(id, data) {
    return axios.put(process.env.VUE_APP_API_URL + 'appointments/' + id, data, { headers: authHeader() })
  }
  getAppointments() {
    return axios.get(process.env.VUE_APP_API_URL + 'appointments', { headers: authHeader() })
  }
  getAllAppointments() {
    return axios.get(process.env.VUE_APP_API_URL + 'appointments/all', { headers: authHeader() })
  }
  getNextAppointment() {
    return axios.get(process.env.VUE_APP_API_URL + 'appointments/next', { headers: authHeader() })
  }
  deleteAppointment(id) {
    return axios.delete(process.env.VUE_APP_API_URL + 'appointments/' + id, { headers: authHeader() })
  }
  deleteGoogleAppointment(calendarId, id) {
    return axios.delete(process.env.G_CALENDAR_API_URL + calendarId + '/events/' + id + '?key=' + process.env.G_CALENDAR_TOKEN)  
  }
  getEvents(params) {
    return axios.get(process.env.VUE_APP_API_URL + 'events?' + params, { headers: authHeader() })
  }
  saveEvents(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'events', data, { headers: authHeader() })
  }
  getEvent(id) {
    return axios.get(process.env.VUE_APP_API_URL + 'events/' + id, { headers: authHeader() })
  }
  updateEvents(id, data) {
    return axios.put(process.env.VUE_APP_API_URL + 'events/' + id, data, { headers: authHeader() })
  }
  saveCalendar(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'users/calendar', data, { headers: authHeader() })
  }
}

export default new AppointmentService()
