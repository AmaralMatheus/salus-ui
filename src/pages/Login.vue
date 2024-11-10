<template>
  <div class="d-flex">
    <v-card class="pa-5 ma-auto w-25">
      <v-form @submit.prevent="handleLogin" v-model="valid" class="d-flex flex-column ga-3">
        <v-text-field
          variant="outlined"
          density="compact"
          hide-details="auto"
          label="E-mail"
          v-model="username"
          :rules="rules"
        ></v-text-field>
        <v-text-field
          v-if="login"
          variant="outlined"
          density="compact"
          hide-details="auto"
          label="Senha"
          v-model="password"
          :type="show ? 'text' : 'password'"
          :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="rules"
          @click:append-inner="show = !show"
        ></v-text-field>

        <div class="form-group">
          <v-btn block type="submit"
            :disabled:="!valid || loading"
            :loading="loading" color="primary"
          class="text-none">{{ login ? 'Login' : 'Recuperar Senha' }}</v-btn>
          <v-btn block @click="login = !login"
            variant="plain"
            :disabled:="loading" color="primary"
          class="mt-2 text-none">{{ login ? 'Esqueci minha senha' : 'Voltar' }}</v-btn>
        </div>

        <v-snackbar
          v-model="snackbar"
        >
          {{ message }}
          <template v-slot:actions>
            <v-btn
              color="red"
              variant="text"
              class="text-none"
              @click="snackbar = false"
            >
              Fechar
            </v-btn>
          </template>
        </v-snackbar>
      </v-form >
    </v-card>
  </div>
</template>

<script>

export default {
  name: "Login",
  data() {
    return {
      login: true,
      snackbar: false,
      loading: false,
      message: '',
      username: '',
      password: '',
      show: false,
      valid: true,
      rules: [
        value => {
          if (value) return true
          return 'Este campo não pode estar vazio.'
        },
      ],
    }
  },
  computed: {
    loggedIn() {
      return this.$store.state.auth.status.loggedIn
    },
  },
  created() {
    if (this.loggedIn) {
      this.$router.push("/profile")
    }
  },
  methods: {
    handleLogin(user) {
      if (this.valid) {
        this.loading = true
        user.username = this.username
        user.password = this.password
        this.$store.dispatch("auth/login", user).then(
          () => {
            this.$router.push("/profile")
          },
          (error) => {
            this.loading = false
            this.snackbar = true
            this.message =
              (error.response &&
                error.response.data &&
                error.response.data.message) ||
              error.message ||
              error.toString()
          }
        )
      }
    },
  },
}
</script>

<style scoped>
</style>
