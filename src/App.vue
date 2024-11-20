<template>
  <v-toolbar class="bg-transparent" v-if="currentUser">
    <v-app-bar-nav-icon disabled><img width="20"/></v-app-bar-nav-icon>
    <v-toolbar-title class="d-md-block">Dental Salus</v-toolbar-title>
    <v-spacer></v-spacer>
    <div class="d-flex ml-auto ga-3 mr-10">
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
    <v-navigation-drawer mobile-breakpoint="md" class="bg-transparent" floating :width="expanded ? 250 : 55" v-if="currentUser">
      <v-list density="compact" nav>
        <v-list-item value="" @click="$router.push('/home')">    
          <v-app-bar-nav-icon><img width="20" src="/favicon.svg" /></v-app-bar-nav-icon>
        </v-list-item>
        <v-list-item active-class="text-white bg-primary" value="home" :active="path === undefined" @click="$router.push('/home')" prepend-icon="mdi-home-outline" title="Home"></v-list-item>
        <v-list-item active-class="text-white bg-primary" value="clientes" :active="path && path.toString().includes('client')" @click="$router.push('/clientes')" prepend-icon="mdi-account-multiple-outline" title="Clientes"></v-list-item>
        <v-list-item active-class="text-white bg-primary" value="agenda" :active="path ==='agenda'" @click="$router.push('/agenda')" prepend-icon="mdi-calendar-outline" title="Agenda"></v-list-item>
        <v-list-item active-class="text-white bg-primary" value="financeiro" :active="path ==='financeiro'" @click="$router.push('/financeiro')" prepend-icon="mdi-finance" title="Financeiro"></v-list-item>
        <v-list-item v-if="currentUser.type === 1" active-class="text-white bg-primary" value="ajustes" :active="path && path.toString().includes('user')" @click="$router.push('/ajustes')" prepend-icon="mdi-cog-outline" title="Configurações"></v-list-item>
        <v-list-item @click="expanded = !expanded" :prepend-icon="!expanded ? 'mdi-arrow-right' : 'mdi-arrow-left'" title=""></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-bottom-navigation color="primary" v-if="currentUser" class="d-md-none align-center">
      <div class="d-flex justify-space-between ga-3">
        <v-icon :class="path === undefined ? 'bg-primary text-white' : ''" class="pa-5 rounded-lg" @click="$router.push('/home')">mdi-home-outline</v-icon>
        <v-icon :class="path && path.toString().includes('client') ? 'bg-primary text-white' : ''" class="pa-5 rounded-lg" @click="$router.push('/clientes')">mdi-account-multiple-outline</v-icon>
        <v-icon :class="path === 'agenda' ? 'bg-primary text-white' : ''" class="pa-5 rounded-lg" @click="$router.push('/agenda')">mdi-calendar-outline</v-icon>
        <v-icon :class="path === 'financeiro' ? 'bg-primary text-white' : ''" class="pa-5 rounded-lg" @click="$router.push('/financeiro')">mdi-finance</v-icon>
        <v-icon :class="path && path.toString().includes('user') ? 'bg-primary text-white' : ''" class="pa-5 rounded-lg" @click="$router.push('/ajustes')" v-if="currentUser.type === 1">mdi-cog-outline</v-icon>
        <v-icon class="pa-5" @click="logOut">mdi-exit-to-app</v-icon>
      </div>
    </v-bottom-navigation>
    <v-main>
      <v-container max-width="1500">
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
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
</style>
