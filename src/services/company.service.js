import axios from 'axios'
import authHeader from './auth-header'

const API_URL = 'https://salus-682523916a3b.herokuapp.com/api/'

class CompanyService {
  saveProfileImage(data) {
    return axios.post(API_URL + 'users/image', data, { headers: authHeader() })
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
  deleteProcedure(id) {
    return axios.delete(API_URL + 'procedures/' + id, { headers: authHeader() })
  }
  getCompany() {
    return axios.get(API_URL + 'companies', { headers: authHeader() })
  }
  saveCompany(data) {
    return axios.put(API_URL + 'companies', data, { headers: authHeader() })
  }
}

export default new CompanyService()
