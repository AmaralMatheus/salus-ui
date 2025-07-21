<template>
  <v-container max-width="1500" class="py-0">
    <v-toolbar class="bg-transparent" v-if="currentUser">
      <v-app-bar-nav-icon><img width="20" src="/favicon.svg" /></v-app-bar-nav-icon>
      <v-toolbar-title class="d-md-block">Dental Salus</v-toolbar-title>
      <v-spacer></v-spacer>
      <div class="d-flex ml-auto ga-3">
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
          <v-icon :class="path === undefined ? 'bg-theme' : ''" class="pa-5 rounded" @click="$router.push('/home')"><img :class="path === undefined ? 'active' : ''" class="cursor-pointer" :src="require('./assets/home-6-line.svg')"/></v-icon>
          <v-icon :class="path && path.toString().includes('client') ? 'bg-theme' : ''" class="pa-5 rounded" @click="$router.push('/pacientes')"><img :class="path && path.toString().includes('client') ? 'active' : ''" class="cursor-pointer" :src="require('./assets/clientes.svg')"/></v-icon>
          <v-icon :class="path === 'agenda' ? 'bg-theme' : ''" class="pa-5 rounded" @click="$router.push('/agenda')"><img :class="path === 'agenda' ? 'active' : ''" class="cursor-pointer" :src="require('./assets/calendar-event-fill.svg')"/></v-icon>
          <v-icon :class="path === 'financeiro' ? 'bg-theme' : ''" class="pa-5 rounded" @click="$router.push('/financeiro')"><img :class="path === 'financeiro' ? 'active' : ''" class="cursor-pointer" :src="require('./assets/coins-line.svg')"/></v-icon>
          <v-icon :class="path && path.toString().includes('user') ? 'bg-theme' : ''" class="pa-5 rounded" @click="$router.push('/ajustes')" v-if="currentUser.type === 1"><img :class="path && path.toString().includes('user') ? 'active' : ''" class="cursor-pointer" :src="require('./assets/settings-3-line.svg')"/></v-icon>
        </div>
      </v-bottom-navigation>
      <v-main class="d-flex ga-5">
        <div class="custom-navbar">
          <v-breadcrumbs v-if="currentUser" style="color: transparent" :items="['s']">
            <template v-slot:divider>
              <v-icon icon="mdi-chevron-right"></v-icon>
            </template>
          </v-breadcrumbs>
          <v-list class="bg-transparent d-flex ga-3 flex-column" density="compact" nav v-if="currentUser">
            <v-list-item active-class="text-white bg-theme" value="home" :active="path === undefined" @click="$router.push('/home')">
              <div class="d-flex ga-3 align-center">
                <img class="cursor-pointer" :class="path === undefined ? 'active' : ''" :src="require('./assets/home-6-line.svg')"/>
                <div>Home</div>
              </div>
            </v-list-item>
            <v-list-item active-class="text-white bg-theme" value="pacientes" :active="path && path.toString().includes('client')" @click="$router.push('/pacientes')">
              <div class="d-flex ga-3 align-center">
                <img class="cursor-pointer" :class="path && path.toString().includes('client') ? 'active' : ''" :src="require('./assets/clientes.svg')"/>
                <div>Pacientes</div>
              </div>
            </v-list-item>
            <v-list-item active-class="text-white bg-theme" value="agenda" :active="path ==='agenda'" @click="$router.push('/agenda')">
              <div class="d-flex ga-3 align-center">
                <img class="cursor-pointer" :class="path ==='agenda' ? 'active' : ''" :src="require('./assets/calendar-event-fill.svg')"/>
                <div>Agenda</div>
              </div>
            </v-list-item>
            <v-list-item active-class="text-white bg-theme" value="financeiro" :active="path ==='financeiro'" @click="$router.push('/financeiro')">
              <div class="d-flex ga-3 align-center">
                <img class="cursor-pointer" :class="path ==='financeiro' ? 'active' : ''" :src="require('./assets/coins-line.svg')"/>
                <div>Financeiro</div>
              </div>
            </v-list-item>
            <v-list-item v-if="currentUser && currentUser.type === 1" active-class="text-white bg-theme" value="ajustes" :active="path && path.toString().includes('user')" @click="$router.push('/ajustes')">
              <div class="d-flex ga-3 align-center">
                <img class="cursor-pointer" :class="path && path.toString().includes('user') ? 'active' : ''" :src="require('./assets/settings-3-line.svg')"/>
                <div>Configurações</div>
              </div>
            </v-list-item>
          </v-list>
        </div>
        <div class="w-100">
          <v-breadcrumbs v-if="currentUser" :items="route.fullPath.split('/').map((link) => {
            if (link !== '') {
              return { href: '/'+link, title: link.length < 5 ? name : link, disabled: link.length < 5 || link === 'registro' }
            } else {
              return { href: '/home', title: 'Home', disabled: false }  
            }
          })">
            <template v-slot:divider>
              <v-icon icon="mdi-chevron-right"></v-icon>
            </template>  
          </v-breadcrumbs>   
          <router-view />
        </div>
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
    this.$store.dispatch('auth/updateEntityName', '')
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
    },
    route() {
      return this.$route
    },
    name() {
      return this.$store.state.auth.entityName
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
  -webkit-box-shadow: 0px 0px 0px -0px rgba(0,0,0,0) !important;
  -moz-box-shadow: 0px 0px 0px -0px rgba(0,0,0,0) !important;
  box-shadow:0px 0px 0px 0px rgba(0,0,0,0) !important;
}
.v-expansion-panel {
  -webkit-box-shadow: 0px 0px 0px -0px rgba(128, 128, 128, 0.575) !important;
  -moz-box-shadow: 0px 0px 0px -0px rgba(128, 128, 128, 0.486) !important;
  box-shadow:0px 0px 0px 0px rgba(128, 128, 128, 0.473) !important;
}

.v-expansion-panel-title {
  padding: 16px;
}

.bg-theme {
  background-color: #C62424;
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
.v-expansion-panel {
  border-radius: 8px !important;
}

html {
  font-family: 'montserrat' !important;
  color: #474747;
}

.v-card {
  color: #474747;
}
.v-expansion-panel {
  color: #474747;
}

.v-card-title {
  font-family: 'montserrat' !important;
}

.text-h6 {
  font-family: 'montserrat' !important;
}

td {
  color: #474747 !important;
}

.v-data-table-footer {
  color: #474747 !important;
}

.v-list {
  padding: 0;
}

.v-list-item {
  padding-bottom: 0;
  padding-top: 0;
}

.custom-navbar {
  width: 58px;
  height: calc(100vh - 80px);
  top: 0;
  position: sticky;
  transition: ease-in-out .2s;
}

@media (max-width: 959px) {
  .custom-navbar {
    display: none !important;
  }
}

.custom-navbar:hover {
  width: 220px;
}

.v-list-item__spacer {
  display: none;
}

.v-list-item__prepend {
  padding-right: 10px;
}

.active {
    filter: invert(0) sepia(100%) saturate(1000%) hue-rotate(180deg) brightness(300%) contrast(110%)
}

.v-app-bar-nav-icon {
  width: 15px !important;
}

.v-list-item--nav {
  padding-inline: 16px;
  padding-block: 8px;
  border-radius: 8px;
}

.v-main {
  --v-layout-bottom: 0px !important;
}

.v-expansion-panel__shadow{
  box-shadow: none;
}
</style>
