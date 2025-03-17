import axios from 'axios'

const API_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/'
const API_CEP_URL = 'https://viacep.com.br/ws/'
class LocationService {
  getStates() {
    return axios.get(API_URL + 'estados')
  }
  getCities(uf) {
    return axios.get(API_URL + 'estados/'+uf+'/municipios')
  }
  getAddress(cep) {
    return axios.get(API_CEP_URL + cep + '/json')
  }
}



export default new LocationService()
