import axios from 'axios'

class AuthService {
  login(user) {
    return axios
      .post(process.env.VUE_APP_API_URL + 'login', {
        username: user.username,
        password: user.password
      })
      .then(response => {
        if (response.data.access_token) {
          localStorage.setItem('user', JSON.stringify(response.data))
        }

        return response.data
      })
  }

  logout() {
    localStorage.removeItem('user')
  }

  register(user) {
    return axios.post(process.env.VUE_APP_API_URL + 'register', {
      username: user.username,
      email: user.email,
      password: user.password,
    })
  }
}

export default new AuthService()
