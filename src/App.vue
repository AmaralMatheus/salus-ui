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
          <v-icon :class="path === undefined ? 'bg-primary text-white' : ''" class="pa-5 rounded" @click="$router.push('/home')"><img class="cursor-pointer" :src="require('./assets/home-6-line.svg')"/></v-icon>
          <v-icon :class="path && path.toString().includes('client') ? 'bg-primary text-white' : ''" class="pa-5 rounded" @click="$router.push('/clientes')"><img class="cursor-pointer" :src="require('./assets/clientes.svg')"/></v-icon>
          <v-icon :class="path === 'agenda' ? 'bg-primary text-white' : ''" class="pa-5 rounded" @click="$router.push('/agenda')"><img class="cursor-pointer" :src="require('./assets/calendar-event-fill.svg')"/></v-icon>
          <v-icon :class="path === 'financeiro' ? 'bg-primary text-white' : ''" class="pa-5 rounded" @click="$router.push('/financeiro')"><img class="cursor-pointer" :src="require('./assets/coins-line.svg')"/></v-icon>
          <v-icon :class="path && path.toString().includes('user') ? 'bg-primary text-white' : ''" class="pa-5 rounded" @click="$router.push('/ajustes')" v-if="currentUser.type === 1"><img class="cursor-pointer" :src="require('./assets/settings-3-line.svg')"/></v-icon>
          <v-icon class="pa-5" @click="logOut">mdi-exit-to-app</v-icon>
        </div>
      </v-bottom-navigation>
      <v-main class="d-flex ga-5">
        <v-list class="bg-transparent custom-navbar" density="compact" nav v-if="currentUser">
          <v-breadcrumbs v-if="currentUser" divider=">" style="color: transparent" :items="['s']"></v-breadcrumbs>
          <v-list-item active-class="text-white bg-primary" value="home" :active="path === undefined" @click="$router.push('/home')">
            <div class="d-flex ga-3 align-center">
              <img class="cursor-pointer" :class="path === undefined ? 'active' : ''" :src="require('./assets/home-6-line.svg')"/>
              <div>Home</div>
            </div>
          </v-list-item>
          <v-list-item active-class="text-white bg-primary" value="clientes" :active="path && path.toString().includes('client')" @click="$router.push('/clientes')">
            <div class="d-flex ga-3 align-center">
              <img class="cursor-pointer" :class="path && path.toString().includes('client') ? 'active' : ''" :src="require('./assets/clientes.svg')"/>
              <div>Clientes</div>
            </div>
          </v-list-item>
          <v-list-item active-class="text-white bg-primary" value="agenda" :active="path ==='agenda'" @click="$router.push('/agenda')">
            <div class="d-flex ga-3 align-center">
              <img class="cursor-pointer" :class="path ==='agenda' ? 'active' : ''" :src="require('./assets/calendar-event-fill.svg')"/>
              <div>Agenda</div>
            </div>
          </v-list-item>
          <v-list-item active-class="text-white bg-primary" value="financeiro" :active="path ==='financeiro'" @click="$router.push('/financeiro')">
            <div class="d-flex ga-3 align-center">
              <img class="cursor-pointer" :class="path ==='financeiro' ? 'active' : ''" :src="require('./assets/coins-line.svg')"/>
              <div>Financeiro</div>
            </div>
          </v-list-item>
          <div class="my-2">
            <v-divider></v-divider>
          </div>
          <v-list-item class="mt-auto" v-if="currentUser && currentUser.type === 1" active-class="text-white bg-primary" value="ajustes" :active="path && path.toString().includes('user')" @click="$router.push('/ajustes')">
            <div class="d-flex ga-3 align-center">
              <img class="cursor-pointer" :class="path && path.toString().includes('user') ? 'active' : ''" :src="require('./assets/settings-3-line.svg')"/>
              <div>Configurações</div>
            </div>
          </v-list-item>
        </v-list>
        <div class="w-100">
          <v-breadcrumbs v-if="currentUser" divider=">" :items="route.fullPath.split('/').map((link) => {
            if (link !== '') {
              return { href: '/'+link, title: link.length < 5 ? name : link, disabled: link.length < 5 || link === 'registro' }
            } else {
              return { href: '/home', title: 'Home', disabled: false }  
            }
          })"></v-breadcrumbs>   
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

.v-card {
  color: #969696;
}

.v-card-title {
  font-family: 'montserrat' !important;
}

.text-h6 {
  font-family: 'montserrat' !important;
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
  height: -webkit-fill-;
  overflow: hidden;
  transition: ease-in-out .2s;
}

@media (max-width: 959px) {
  .custom-navbar {
    display: none;
  }
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

.active {
  filter: invert(0%) sepia(100%) saturate(1000%) hue-rotate(180deg) brightness(300%) contrast(110%);
}

.v-app-bar-nav-icon {
  width: 15px !important;
}
</style>
