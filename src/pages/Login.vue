<template>
  <div class="d-flex h-screen">
    <v-card class="pa-5 ma-auto d-flex flex-column" width="350">
      <div class="d-flex ga-3 align-center ma-auto mb-5">
        <v-app-bar-nav-icon><img width="20" src="/favicon.svg" /></v-app-bar-nav-icon>
        <v-toolbar-title class="d-md-block">Dental Salus</v-toolbar-title>
      </div>
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
      </v-form >
    </v-card>
  </div>
</template>

<script>
import { toast } from 'vue3-toastify'

export default {
  name: "LoginPage",
  data() {
    return {
      login: true,
      loading: false,
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
            toast.error((error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                  error.message ||
                  error.toString())
          }
        )
      }
    },
  },
}
</script>

<style scoped>
</style>
