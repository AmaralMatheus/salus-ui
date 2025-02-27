import axios from 'axios'
import authHeader from './auth-header'

const API_URL = 'https://salus-682523916a3b.herokuapp.com//api/'

class PlanService {
  deletePlan(id) {
    return axios.delete(API_URL + 'plans/' + id, { headers: authHeader() })
  }
}

export default new PlanService()
