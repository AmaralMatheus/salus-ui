import axios from 'axios'
import authHeader from './auth-header'

const API_URL = 'https://lizard-clean-singularly.ngrok-free.app/api/'

class ClientService {
  getAllClients() {
    return axios.get(API_URL + 'clients/all', { headers: authHeader() })
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
  saveClient(data) {
    return axios.post(API_URL + 'clients', data, { headers: authHeader() })
  }
  updateClient(id, data) {
    return axios.put(API_URL + 'clients/' + id, data, { headers: authHeader() })
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
  deletePrescription(id) {
    return axios.delete(API_URL + 'prescriptions/' + id, { headers: authHeader() })
  }
}

export default new ClientService()
