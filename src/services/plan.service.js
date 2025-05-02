import axios from 'axios'
import authHeader from './auth-header'

class PlanService {
  deletePlan(id) {
    return axios.delete(process.env.VUE_APP_API_URL + 'plans/' + id, { headers: authHeader() })
  }
}

export default new PlanService()
