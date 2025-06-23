import axios from 'axios'
import authHeader from './auth-header'

class ClientService {
  getAllClients() {
    return axios.get(process.env.VUE_APP_API_URL + 'clients/all', { headers: authHeader() })
  }
  getClients(params) {
    return axios.get(process.env.VUE_APP_API_URL + 'clients?' + params, { headers: authHeader() })
  }
  getClient(id) {
    return axios.get(process.env.VUE_APP_API_URL + 'clients/' + id, { headers: authHeader() })
  }
  deleteClient(id) {
    return axios.delete(process.env.VUE_APP_API_URL + 'clients/' + id, { headers: authHeader() })
  }
  saveClient(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'clients', data, { headers: authHeader() })
  }
  updateClient(id, data) {
    return axios.put(process.env.VUE_APP_API_URL + 'clients/' + id, data, { headers: authHeader() })
  }
  saveDescription(data, action) {
    return axios.post(process.env.VUE_APP_API_URL + action, data, { headers: authHeader() })
  }
  updateToothStatus(data) {
    return axios.put(process.env.VUE_APP_API_URL + 'teeth/' + data.id, data, { headers: authHeader() })
  }
  deleteImage(id) {
    return axios.delete(process.env.VUE_APP_API_URL + 'image/' + id, { headers: authHeader() })
  }
  saveImage(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'images/save', data, { headers: authHeader() })
  }
  deletePrescription(id) {
    return axios.delete(process.env.VUE_APP_API_URL + 'prescriptions/' + id, { headers: authHeader() })
  }
}

export default new ClientService()
