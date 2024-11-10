<template>
  <div class="pa-9">
    <v-card title="Meu perfil" :subtitle="currentUser.user_name + ' | ' + (currentUser.type === 1 ? 'Administrador' : 'Secretaria')" class="ma-9">
      <v-card-text>
        <div v-if="currentUser.type === 1" class="d-flex flex-column ga-4 mb-4">
          <div class="d-flex ga-3">
            <v-text-field
              v-model="calendar"
              :loading="loading"
              :disabled="loading"
              variant="outlined"
              density="compact"
              hide-details="auto"
              label="Google Calendar id">
            </v-text-field>
            <v-btn color="primary" density="compact" @click="saveCalendar">Salvar Calendário</v-btn>
          </div>
          <v-alert type="info" variant="tonal">
            Adicione o id do google calendar para sincronizar os eventos com a sua agenda Google.
          </v-alert>
        </div>
        <v-btn color="primary" density="compact" @click="addImageDialog=true">Atualizar foto do perfil</v-btn>
      </v-card-text>
    </v-card>
    <v-dialog
      max-width="300"
      v-model="addImageDialog"
    >
      <v-card
        prepend-icon="mdi-image-outline"
        title="Adicionar Foto de Perfil"
      >
        <v-card-text class="d-flex flex-column ga-6 align-center">
          <v-avatar color="surface-variant" size="100">
            <v-img :src="image ?? currentUser.avatar" cover></v-img>
          </v-avatar>
          <v-file-input width="100%" prepend-icon="" prepend-inner-icon="mdi-attachment" label="Foto do perfil" density="compact" @update:modelValue="convertToBase64" variant="outlined"></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text="Fechar"
            variant="plain"
            :disabled="loading"
            @click="addImageDialog = false;"
          ></v-btn>
          <v-btn
            text="Salvar"
            variant="plain"
            color="primary"
            :disabled="loading || !image"
            :loading="loading"
            @click="saveImage"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
</template>

<script>
import userService from '../services/user.service'

export default {
  name: 'Profile',
  data() {
    return {
      image: null,
      calendar: '',
      loading: false,
      addImageDialog: false,
      snackbar: false
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user
    }
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push('/login')
    }
    this.calendar = this.currentUser.calendar
  },
  methods: {
    convertToBase64(file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        this.image = reader.result
      };
    },
    saveImage() {
      this.loading = true
      const data = {
        image: this.image
      }
      userService.saveProfileImage(data).then(() => {
        this.addImageDialog = false
        this.$store.dispatch('auth/updateProfilePicture', this.image)
        this.image = null
        this.loading = false
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
      })
    },
    saveCalendar() {
      this.loading = true
      const data = {
        calendar: this.calendar
      }
      userService.saveCalendar(data).then(() => {
        this.$store.dispatch('auth/updateCalendar', this.calendar)
        this.loading = false
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
      })
    }
  }
}
</script>
