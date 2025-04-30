import axios from 'axios'

class LocationService {
  getStates() {
    return axios.get(process.env.VUE_APP_IBGE_API_URL + 'estados')
  }
  getCities(uf) {
    return axios.get(process.env.VUE_APP_IBGE_API_URL + 'estados/'+uf+'/municipios')
  }
  getAddress(cep) {
    return axios.get(process.env.VUE_APP_API_CEP_URL + cep + '/json')
  }
}



export default new LocationService()
