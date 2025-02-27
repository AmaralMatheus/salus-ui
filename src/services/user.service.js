import axios from 'axios'
import authHeader from './auth-header'

const API_URL = 'https://lizard-clean-singularly.ngrok-free.app/api/'

class UserService {
  getUsers(params) {
    return axios.get(API_URL + 'users?' + params, { headers: authHeader() })
  }
  getAllUsers() {
    return axios.get(API_URL + 'users/all', { headers: authHeader() })
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
  deleteUsers(id) {
    return axios.delete(API_URL + 'users/' + id, { headers: authHeader() })
  }
}

export default new UserService()
