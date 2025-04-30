import axios from 'axios'
import authHeader from './auth-header'

class UserService {
  getTransactions(params) {
    return axios.get(process.env.VUE_APP_API_URL + 'transactions?' + params, { headers: authHeader() })
  }
  exportTransactions(params) {
    return axios.get(process.env.VUE_APP_API_URL + 'transactions/download?' + params, { headers: authHeader() })
  }
  addTransaction(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'transactions', data, { headers: authHeader() })
  }
  deleteTransaction(id) {
    return axios.delete(process.env.VUE_APP_API_URL + 'transactions/' + id, { headers: authHeader() })
  }
}

export default new UserService()
