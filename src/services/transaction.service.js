import axios from 'axios'
import authHeader from './auth-header'

const API_URL = 'https://lizard-clean-singularly.ngrok-free.app/api/'

class UserService {
  getTransactions(params) {
    return axios.get(API_URL + 'transactions?' + params, { headers: authHeader() })
  }
  exportTransactions(params) {
    return axios.get(API_URL + 'transactions/download?' + params, { headers: authHeader() })
  }
  addTransaction(data) {
    return axios.post(API_URL + 'transactions', data, { headers: authHeader() })
  }
  deleteTransaction(id) {
    return axios.delete(API_URL + 'transactions/' + id, { headers: authHeader() })
  }
}

export default new UserService()
