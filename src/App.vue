<template>
  <v-toolbar density="compact">
    <v-app-bar-nav-icon><v-img src="/favicon.svg" cover></v-img></v-app-bar-nav-icon>

    <v-toolbar-title>Dental Salus</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-btn icon>
      <v-icon>mdi-magnify</v-icon>
    </v-btn>

    <v-btn icon>
      <v-icon>mdi-heart</v-icon>
    </v-btn>

    <v-btn icon>
      <v-icon>mdi-dots-vertical</v-icon>
    </v-btn>
  </v-toolbar>
  <v-layout>
    <v-navigation-drawer mobile-breakpoint="md" class="bg-transparent mt-10" floating :width="expanded ? 250 : 55" v-if="currentUser">
      <v-list>
        <v-list-item
          class="pa-2"
          @click="$router.push('/profile')"
          :prepend-avatar="currentUser.avatar ?? 'https://ui-avatars.com/api/?name='+currentUser.user_name.replaceAll(' ', '+') + '&background=random'"
          :title="currentUser.user_name"
          :subtitle="currentUser.email"
        ></v-list-item>
      </v-list>
      <v-list density="compact" nav>
        <v-list-item active-class="text-white bg-primary" value="home" :active="path === undefined" @click="$router.push('/home')" prepend-icon="mdi-home-outline" title="Home"></v-list-item>
        <v-list-item active-class="text-white bg-primary" value="clientes" :active="path && path.toString().includes('client')" @click="$router.push('/clientes')" prepend-icon="mdi-account-multiple-outline" title="Clientes"></v-list-item>
        <v-list-item active-class="text-white bg-primary" value="agenda" :active="path ==='agenda'" @click="$router.push('/agenda')" prepend-icon="mdi-calendar-outline" title="Agenda"></v-list-item>
        <v-list-item active-class="text-white bg-primary" value="financeiro" :active="path ==='financeiro'" @click="$router.push('/financeiro')" prepend-icon="mdi-finance" title="Financeiro"></v-list-item>
        <v-list-item @click="expanded = !expanded" :prepend-icon="!expanded ? 'mdi-arrow-right' : 'mdi-arrow-left'" title=""></v-list-item>
      </v-list>
      <template v-slot:append>
        <v-list density="compact" nav>
          <v-list-item v-if="currentUser.type === 1" active-class="text-white bg-primary" value="ajustes" :active="path && path.toString().includes('user')" @click="$router.push('/ajustes')" prepend-icon="mdi-cog-outline" title="Configurações"></v-list-item>
          <v-list-item prepend-icon="mdi-exit-to-app" @click.prevent="logOut" title="Logout"></v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>
    <v-bottom-navigation color="primary" v-if="currentUser" class="d-md-none pa-2">
      <v-btn @click="$router.push('/profile')" class="ml-10">
        <v-avatar color="surface-variant ma-auto" size="30">
          <v-img :src="currentUser.avatar ?? 'https://ui-avatars.com/api/?name='+currentUser.user_name.replaceAll(' ', '+') + '&background=random'" cover></v-img>
        </v-avatar>
      </v-btn>
      <v-btn :class="path === undefined ? 'bg-primary text-white' : ''" class="rounded-lg" @click="$router.push('/home')">
        <v-icon>mdi-home-outline</v-icon>
      </v-btn>
      <v-btn :class="path === 'client' ? 'bg-primary text-white' : ''" class="rounded-lg" @click="$router.push('/clientes')">
        <v-icon>mdi-account-multiple-outline</v-icon>
      </v-btn>
      <v-btn :class="path === 'agenda' ? 'bg-primary text-white' : ''" class="rounded-lg" @click="$router.push('/agenda')">
        <v-icon>mdi-calendar-outline</v-icon>
      </v-btn>
      <v-btn :class="path === 'financeiro' ? 'bg-primary text-white' : ''" class="rounded-lg" @click="$router.push('/financeiro')">
        <v-icon>mdi-finance</v-icon>
      </v-btn>
      <v-btn @click="logOut" class="mr-9">
        <v-icon>mdi-exit-to-app</v-icon>
      </v-btn>
    </v-bottom-navigation>
    <v-main class="bg-app h-screen overflow-y-scroll">
      <v-container max-width="1200">
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
