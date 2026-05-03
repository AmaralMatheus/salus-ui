import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Configurar base URL para o proxy
if (process.env.NODE_ENV === 'development') {
  window.axios.defaults.baseURL = 'http://localhost:8080';
} else {
  window.axios.defaults.baseURL = window.location.origin;
}
