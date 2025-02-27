import axios from 'axios'
import authHeader from './auth-header'

const API_URL = 'https://lizard-clean-singularly.ngrok-free.app/api/'

const G_CALENDAR_TOKEN = 'AIzaSyCSyrsKhMs7_iqHArtlN8ZKfF4FAm-7glA'

const G_CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3/calendars/'

class AppointmentService {
  getGoogleCalendarEvents(calendarId) {
    return axios.get(G_CALENDAR_API_URL + calendarId + '/events?key=' + G_CALENDAR_TOKEN)
  }
  schedule(data) {
    return axios.post(API_URL + 'appointments', data, { headers: authHeader() })
  }
  updateSchedule(id, data) {
    return axios.put(API_URL + 'appointments/' + id, data, { headers: authHeader() })
  }
  getAppointments() {
    return axios.get(API_URL + 'appointments', { headers: authHeader() })
  }
  getAllAppointments() {
    return axios.get(API_URL + 'appointments/all', { headers: authHeader() })
  }
  getNextAppointment() {
    return axios.get(API_URL + 'appointments/next', { headers: authHeader() })
  }
  deleteAppointment(id) {
    return axios.delete(API_URL + 'appointments/' + id, { headers: authHeader() })
  }
  deleteGoogleAppointment(calendarId, id) {
    return axios.delete(G_CALENDAR_API_URL + calendarId + '/events/' + id + '?key=' + G_CALENDAR_TOKEN)  
  }
  getEvents(params) {
    return axios.get(API_URL + 'events?' + params, { headers: authHeader() })
  }
  saveEvents(data) {
    return axios.post(API_URL + 'events', data, { headers: authHeader() })
  }
  getEvent(id) {
    return axios.get(API_URL + 'events/' + id, { headers: authHeader() })
  }
  updateEvents(id, data) {
    return axios.put(API_URL + 'events/' + id, data, { headers: authHeader() })
  }
  saveCalendar(data) {
    return axios.post(API_URL + 'users/calendar', data, { headers: authHeader() })
  }
}

export default new AppointmentService()
