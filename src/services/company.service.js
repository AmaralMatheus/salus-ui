import axios from 'axios'
import authHeader from './auth-header'

class CompanyService {
  createCompany(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'companies', data,)
  }
  saveProfileImage(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'users/image', data, { headers: authHeader() })
  }
  getProcedures(params) {
    return axios.get(process.env.VUE_APP_API_URL + 'procedures?' + params, { headers: authHeader() })
  }
  saveProcedure(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'procedures', data, { headers: authHeader() })
  }
  getProcedure(id) {
    return axios.get(process.env.VUE_APP_API_URL + 'procedures/' + id, { headers: authHeader() })
  }
  updateProcedure(id, data) {
    return axios.put(process.env.VUE_APP_API_URL + 'procedures/' + id, data, { headers: authHeader() })
  }
  getAllProcedures() {
    return axios.get(process.env.VUE_APP_API_URL + 'procedures/all', { headers: authHeader() })
  }
  deleteProcedure(id) {
    return axios.delete(process.env.VUE_APP_API_URL + 'procedures/' + id, { headers: authHeader() })
  }
  getStatus(params) {
    return axios.get(process.env.VUE_APP_API_URL + 'status?' + params, { headers: authHeader() })
  }
  saveStatus(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'status', data, { headers: authHeader() })
  }
  getStatusById(id) {
    return axios.get(process.env.VUE_APP_API_URL + 'status/' + id, { headers: authHeader() })
  }
  updateStatus(id, data) {
    return axios.put(process.env.VUE_APP_API_URL + 'status/' + id, data, { headers: authHeader() })
  }
  getAllStatus(companyId) {
    if (companyId) {
      return axios.get(process.env.VUE_APP_API_URL + 'status/all?company_id='+companyId,  { headers: authHeader() })
    } else {
      return axios.get(process.env.VUE_APP_API_URL + 'status/all',  { headers: authHeader() })
    }
  }
  deleteStatus(id) {
    return axios.delete(process.env.VUE_APP_API_URL + 'status/' + id, { headers: authHeader() })
  }
  getCompany() {
    return axios.get(process.env.VUE_APP_API_URL + 'companies', { headers: authHeader() })
  }
  saveCompany(data) {
    return axios.put(process.env.VUE_APP_API_URL + 'companies', data, { headers: authHeader() })
  }
}

export default new CompanyService()
