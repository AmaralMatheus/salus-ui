import axios from 'axios'
import authHeader from './auth-header'

class UserService {
  getUsers(params) {
    return axios.get(process.env.VUE_APP_API_URL + 'users?' + params, { headers: authHeader() })
  }
  getAllUsers() {
    return axios.get(process.env.VUE_APP_API_URL + 'users/all', { headers: authHeader() })
  }
  saveUser(data) {
    return axios.post(process.env.VUE_APP_API_URL + 'users', data, { headers: authHeader() })
  }
  getUser(id) {
    return axios.get(process.env.VUE_APP_API_URL + 'users/' + id, { headers: authHeader() })
  }
  updateUser(id, data) {
    return axios.put(process.env.VUE_APP_API_URL + 'users/' + id, data, { headers: authHeader() })
  }
  deleteUsers(id) {
    return axios.delete(process.env.VUE_APP_API_URL + 'users/' + id, { headers: authHeader() })
  }
}

export default new UserService()
