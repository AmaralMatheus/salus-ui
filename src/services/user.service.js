import axios from 'axios'
import authHeader from './auth-header'

const API_URL = 'https://salus-682523916a3b.herokuapp.com/api/'

const G_CALENDAR_TOKEN = 'AIzaSyCSyrsKhMs7_iqHArtlN8ZKfF4FAm-7glA'

const G_CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3/calendars/'

class UserService {
  getGoogleCalendarEvents(calendarId) {
    return axios.get(G_CALENDAR_API_URL + calendarId + '/events?key=' + G_CALENDAR_TOKEN)
  }
  getTransactions(params) {
    return axios.get(API_URL + 'transactions?' + params, { headers: authHeader() })
  }
  addTransaction(data) {
    return axios.post(API_URL + 'transactions', data, { headers: authHeader() })
  }
  deleteTransaction(id) {
    return axios.delete(API_URL + 'transactions/' + id, { headers: authHeader() })
  }
  getUsers(params) {
    return axios.get(API_URL + 'users?' + params, { headers: authHeader() })
  }
  getProcedures(params) {
    return axios.get(API_URL + 'procedures?' + params, { headers: authHeader() })
  }
  saveProcedure(data) {
    return axios.post(API_URL + 'procedures', data, { headers: authHeader() })
  }
  getProcedure(id) {
    return axios.get(API_URL + 'procedures/' + id, { headers: authHeader() })
  }
  updateProcedure(id, data) {
    return axios.put(API_URL + 'procedures/' + id, data, { headers: authHeader() })
  }
  getAllProcedures() {
    return axios.get(API_URL + 'procedures/all', { headers: authHeader() })
  }
  getAllUsers() {
    return axios.get(API_URL + 'users/all', { headers: authHeader() })
  }
  getAllClients() {
    return axios.get(API_URL + 'clients/all', { headers: authHeader() })
  }
  saveUser(data) {
    return axios.post(API_URL + 'users', data, { headers: authHeader() })
  }
  getUser(id) {
    return axios.get(API_URL + 'users/' + id, { headers: authHeader() })
  }
  updateUser(id, data) {
    return axios.put(API_URL + 'users/' + id, data, { headers: authHeader() })
  }
  getClients(params) {
    return axios.get(API_URL + 'clients?' + params, { headers: authHeader() })
  }
  getClient(id) {
    return axios.get(API_URL + 'clients/' + id, { headers: authHeader() })
  }
  deleteClient(id) {
    return axios.delete(API_URL + 'clients/' + id, { headers: authHeader() })
  }
  deletePlan(id) {
    return axios.delete(API_URL + 'plans/' + id, { headers: authHeader() })
  }
  deletePrescription(id) {
    return axios.delete(API_URL + 'prescriptions/' + id, { headers: authHeader() })
  }
  deleteProceduer(id) {
    return axios.delete(API_URL + 'procedures/' + id, { headers: authHeader() })
  }
  deleteUsers(id) {
    return axios.delete(API_URL + 'users/' + id, { headers: authHeader() })
  }
  saveClient(data) {
    return axios.post(API_URL + 'clients', data, { headers: authHeader() })
  }
  updateClient(id, data) {
    return axios.put(API_URL + 'clients/' + id, data, { headers: authHeader() })
  }
  getAppointments() {
    return axios.get(API_URL + 'appointments', { headers: authHeader() })
  }
  getAllAppointments() {
    return axios.get(API_URL + 'appointments/all', { headers: authHeader() })
  }
  saveDescription(data, action) {
    return axios.post(API_URL + action, data, { headers: authHeader() })
  }
  updateToothStatus(data) {
    return axios.put(API_URL + 'teeth/' + data.id, data, { headers: authHeader() })
  }
  saveImage(data) {
    return axios.post(API_URL + 'images/', data, { headers: authHeader() })
  }
  saveProfileImage(data) {
    return axios.post(API_URL + 'users/image', data, { headers: authHeader() })
  }
  saveCalendar(data) {
    return axios.post(API_URL + 'users/calendar', data, { headers: authHeader() })
  }
  schedule(data) {
    return axios.post(API_URL + 'appointments', data, { headers: authHeader() })
  }
  updateSchedule(id, data) {
    return axios.put(API_URL + 'appointments/' + id, data, { headers: authHeader() })
  }
  getNextAppointment() {
    return axios.get(API_URL + 'appointments/next', { headers: authHeader() })
  }
  getCompany() {
    return axios.get(API_URL + 'companies', { headers: authHeader() })
  }
  saveCompany(data) {
    return axios.put(API_URL + 'companies', data, { headers: authHeader() })
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
}

export default new UserService()
