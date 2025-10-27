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
  getAllProcedures(id = 0) {
    return axios.get(process.env.VUE_APP_API_URL + 'procedures/all/'+id, { headers: authHeader() })
  }
  deleteProcedure(id) {
    return axios.delete(process.env.VUE_APP_API_URL + 'procedures/' + id, { headers: authHeader() })
  }
  getCategories(params) {
    return axios.get(process.env.VUE_APP_API_URL + 'categories?' + params, { headers: authHeader() })
  }
  saveCategory(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'categories', data, { headers: authHeader() })
  }
  getCategory(id) {
    return axios.get(process.env.VUE_APP_API_URL + 'categories/' + id, { headers: authHeader() })
  }
  updateCategory(id, data) {
    return axios.put(process.env.VUE_APP_API_URL + 'categories/' + id, data, { headers: authHeader() })
  }
  getAllCategories() {
    return axios.get(process.env.VUE_APP_API_URL + 'categories/all', { headers: authHeader() })
  }
  deleteCategory(id) {
    return axios.delete(process.env.VUE_APP_API_URL + 'categories/' + id, { headers: authHeader() })
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
  getTeethStatus(params) {
    return axios.get(process.env.VUE_APP_API_URL + 'teeth-status?' + params, { headers: authHeader() })
  }
  saveTeethStatus(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'teeth-status', data, { headers: authHeader() })
  }
  getTeethStatusById(id) {
    return axios.get(process.env.VUE_APP_API_URL + 'teeth-status/' + id, { headers: authHeader() })
  }
  updateTeethStatus(id, data) {
    return axios.put(process.env.VUE_APP_API_URL + 'teeth-status/' + id, data, { headers: authHeader() })
  }
  getAllTeethStatus(companyId) {
    if (companyId) {
      return axios.get(process.env.VUE_APP_API_URL + 'teeth-status/all?company_id='+companyId,  { headers: authHeader() })
    } else {
      return axios.get(process.env.VUE_APP_API_URL + 'teeth-status/all',  { headers: authHeader() })
    }
  }
  deleteTeethStatus(id) {
    return axios.delete(process.env.VUE_APP_API_URL + 'teeth-status/' + id, { headers: authHeader() })
  }
  getCompany(id) {
    return axios.get(process.env.VUE_APP_API_URL + 'companies/'+id, { headers: authHeader() })
  }
  saveCompany(id, data) {
    return axios.put(process.env.VUE_APP_API_URL + 'companies/'+id, data, { headers: authHeader() })
  }
  getHealthcareList(params) {
    return axios.get(process.env.VUE_APP_API_URL + 'healthcare?' + params, { headers: authHeader() })
  }
  saveHealthcare(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'healthcare', data, { headers: authHeader() })
  }
  getHealthcare(id) {
    return axios.get(process.env.VUE_APP_API_URL + 'healthcare/' + id, { headers: authHeader() })
  }
  updateHealthcare(id, data) {
    return axios.put(process.env.VUE_APP_API_URL + 'healthcare/' + id, data, { headers: authHeader() })
  }
  getAllHealthcare() {
    return axios.get(process.env.VUE_APP_API_URL + 'healthcare/all', { headers: authHeader() })
  }
  deleteHealthcare(id) {
    return axios.delete(process.env.VUE_APP_API_URL + 'healthcare/' + id, { headers: authHeader() })
  }
  
  getTemplates(params) {
    return axios.get(process.env.VUE_APP_API_URL + 'templates?' + params, { headers: authHeader() })
  }
  saveTemplate(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'templates', data, { headers: authHeader() })
  }
  getTemplatesById(id) {
    return axios.get(process.env.VUE_APP_API_URL + 'templates/' + id, { headers: authHeader() })
  }
  updateTemplates(id, data) {
    return axios.put(process.env.VUE_APP_API_URL + 'templates/' + id, data, { headers: authHeader() })
  }
  getAllTemplates() {
    return axios.get(process.env.VUE_APP_API_URL + 'templates/all',  { headers: authHeader() })
  }
  deleteTemplates(id) {
    return axios.delete(process.env.VUE_APP_API_URL + 'templates/' + id, { headers: authHeader() })
  }
}

export default new CompanyService()
