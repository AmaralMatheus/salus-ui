export default function authHeader() {
    let user = JSON.parse(localStorage.getItem('user'))
    if (user && user.access_token) {
      return { 
        Authorization: 'Bearer ' + user.access_token,
        'ngrok-skip-browser-warning': '1231'
      }
    } else {
      return {}
    }
  }
  