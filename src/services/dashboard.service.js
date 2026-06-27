import axios from 'axios'

class DashboardService {
  _headers() {
    return { 'X-Dashboard-Key': sessionStorage.getItem('dash_key') || '' }
  }

  getClients() {
    return axios.get(process.env.VUE_APP_API_URL + 'dashboard/clients', {
      headers: this._headers(),
    })
  }
}

export default new DashboardService()
