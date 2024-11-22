<template>
  <v-container max-width="1500" class="py-0">
    <v-toolbar class="bg-transparent" v-if="currentUser">
      <v-app-bar-nav-icon><img width="20" src="/favicon.svg" /></v-app-bar-nav-icon>
      <v-toolbar-title class="d-md-block">Dental Salus</v-toolbar-title>
      <v-spacer></v-spacer>
      <div class="d-flex ml-auto ga-3 mr-5">
        <div class="text-h6">Olá, {{ currentUser.user_name }}</div>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-avatar color="surface-variant" size="30" v-bind="props">
              <v-img :src="currentUser.avatar ?? 'https://ui-avatars.com/api/?name='+currentUser.user_name.replaceAll(' ', '+') + '&background=random'" cover></v-img>
            </v-avatar>
          </template>
    
          <v-list>
            <v-list-item prepend-icon="mdi-account-outline" density="comfortable" @click.prevent="$router.push('/profile')" title="Perfil"></v-list-item>
            <v-list-item prepend-icon="mdi-exit-to-app" density="comfortable" @click.prevent="logOut" title="Logout"></v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-toolbar>
    <v-layout>
      <v-bottom-navigation color="primary" v-if="currentUser" class="d-md-none align-center">
        <div class="d-flex justify-space-between ga-3">
          <v-icon :class="path === undefined ? 'bg-primary text-white' : ''" class="pa-5 rounded" @click="$router.push('/home')">mdi-home-outline</v-icon>
          <v-icon :class="path && path.toString().includes('client') ? 'bg-primary text-white' : ''" class="pa-5 rounded" @click="$router.push('/clientes')">mdi-account-multiple-outline</v-icon>
          <v-icon :class="path === 'agenda' ? 'bg-primary text-white' : ''" class="pa-5 rounded" @click="$router.push('/agenda')">mdi-calendar-outline</v-icon>
          <v-icon :class="path === 'financeiro' ? 'bg-primary text-white' : ''" class="pa-5 rounded" @click="$router.push('/financeiro')">mdi-finance</v-icon>
          <v-icon :class="path && path.toString().includes('user') ? 'bg-primary text-white' : ''" class="pa-5 rounded" @click="$router.push('/ajustes')" v-if="currentUser.type === 1">mdi-cog-outline</v-icon>
          <v-icon class="pa-5" @click="logOut">mdi-exit-to-app</v-icon>
        </div>
      </v-bottom-navigation>
      <v-main class="d-flex ga-5">
        <v-list class="bg-transparent custom-navbar" density="compact" nav>
          <v-list-item active-class="text-white bg-primary" value="home" :active="path === undefined" @click="$router.push('/home')" prepend-icon="mdi-home-outline" title="Home"></v-list-item>
          <v-list-item active-class="text-white bg-primary" value="clientes" :active="path && path.toString().includes('client')" @click="$router.push('/clientes')" prepend-icon="mdi-account-multiple-outline" title="Clientes"></v-list-item>
          <v-list-item active-class="text-white bg-primary" value="agenda" :active="path ==='agenda'" @click="$router.push('/agenda')" prepend-icon="mdi-calendar-outline" title="Agenda"></v-list-item>
          <v-list-item active-class="text-white bg-primary" value="financeiro" :active="path ==='financeiro'" @click="$router.push('/financeiro')" prepend-icon="mdi-finance" title="Financeiro"></v-list-item>
          <v-list-item v-if="currentUser.type === 1" active-class="text-white bg-primary" value="ajustes" :active="path && path.toString().includes('user')" @click="$router.push('/ajustes')" prepend-icon="mdi-cog-outline" title="Configurações"></v-list-item>
        </v-list>
        <router-view class="w-100" />
      </v-main>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      expanded: false
    }
  },
  created() {
    localStorage.setItem('dark', this.$vuetify.theme.current.dark);
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user
    },
    showAdminBoard() {
      if (this.currentUser && this.currentUser['roles']) {
        return this.currentUser['roles'].includes('ROLE_ADMIN')
      }

      return false
    },
    showModeratorBoard() {
      if (this.currentUser && this.currentUser['roles']) {
        return this.currentUser['roles'].includes('ROLE_MODERATOR')
      }

      return false
    },
    path() {
      return this.$route.name
    }
  },
  methods: {
    logOut() {
      this.$router.push('/login')
      this.$store.dispatch('auth/logout')
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
.v-card {
  -webkit-box-shadow: -1px 2px 19px -4px rgba(0,0,0,0.19) !important;
  -moz-box-shadow: -1px 2px 19px -4px rgba(0,0,0,0.19) !important;
  box-shadow: 0px 10px 19px 5px rgba(0,0,0,0.05) !important;
}
.v-btn {
  height: 40px !important;
}
.bg-app {
  background: linear-gradient(106.57deg, #FEF7F7 0.04%, #E4EEEE 51.26%, #F4E3E3 100.46%);
}
html {
  overflow: hidden;
}

.rounded {
  border-radius: 8px !important;
}

.v-card {
  border-radius: 8px !important;
}

html {
  font-family: 'montserrat' !important;
  color: #969696;
}

.v-card-title {
  font-family: 'montserrat' !important;
  color: #969696 !important;
}

td {
  color: #969696 !important;
}

.v-data-table-footer {
  color: #969696 !important;
}

.v-list {
  padding: 0;
}

.v-list-item {
  padding-bottom: 0;
  padding-top: 0;
}

.custom-navbar {
  width: 40px;
  overflow: hidden;
  transition: ease-in-out .2s;
}

.custom-navbar:hover {
  width: 200px;
}

.v-list-item__spacer {
  display: none;
}

.v-list-item__prepend {
  padding-right: 10px;
}
</style>
