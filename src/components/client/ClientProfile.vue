<template>
  <!-- Name -->
  <v-card-text class="pb-2">
    <div class="font-weight-bold" style="font-size: 24px; line-height: 1.3">{{ client.name }}</div>
    <div v-if="client.status" class="text-medium-emphasis mt-1" style="font-size: 12px">{{ client.status.name }}</div>
  </v-card-text>

  <!-- Photo + action buttons -->
  <v-card-text class="d-flex ga-4 align-start pt-0">
    <v-avatar color="surface-variant" size="80">
      <v-img :src="client.avatar ?? 'https://ui-avatars.com/api/?name='+client.name.replaceAll(' ', '+') + '&background=random'" cover></v-img>
    </v-avatar>
    <div class="d-flex flex-column ga-3 align-end" style="flex: 1">
      <div class="d-flex ga-2" v-if="currentUser">
        <v-btn size="small" icon="mdi-pencil" @click="$emit('update')" variant="tonal" density="comfortable"/>
        <v-btn size="small" icon="mdi-delete" @click="$emit('delete')" variant="tonal" density="comfortable"/>
        <v-btn size="small" icon="mdi-calendar-outline" @click="$emit('schedule')" variant="tonal" density="comfortable"/>
      </div>
      <a
        v-if="client.phone"
        target="_blank"
        :href="'https://wa.me/' + client.phone.replaceAll('(','').replaceAll(')','').replaceAll('-','').replaceAll(' ','')"
        class="whatsapp-btn"
      >
        <v-icon size="16">mdi-whatsapp</v-icon>
        Enviar mensagem
      </a>
    </div>
  </v-card-text>

  <!-- Info fields -->
  <v-card-text class="pt-0 d-flex flex-column ga-2">
    <div v-if="client.birthday" class="d-flex ga-2 align-center" style="font-size: 12px">
      <v-icon size="18">mdi-calendar-outline</v-icon>
      <span>{{ getBirthday(client.birthday) }} ({{ getAge() }})</span>
    </div>
    <div class="d-flex ga-2 align-center" style="font-size: 12px">
      <v-icon size="18">mdi-phone-outline</v-icon>
      <span>{{ client.phone ?? 'Sem telefone cadastrado' }}</span>
    </div>

    <template v-if="expanded">
      <div class="d-flex ga-2 align-center" style="font-size: 12px">
        <v-icon size="18">mdi-gender-male-female-variant</v-icon>
        <span>{{ client.gender === 1 ? 'Homem' : client.gender === 2 ? 'Mulher' : 'Gênero alternativo' }}</span>
      </div>
      <div class="d-flex ga-2 align-center" style="font-size: 12px">
        <v-icon size="18">mdi-map-marker-outline</v-icon>
        <span>{{ client.address ?? 'Sem endereço cadastrado' }}</span>
      </div>
      <div class="d-flex ga-2 align-center" style="font-size: 12px">
        <v-icon size="18">mdi-email-outline</v-icon>
        <span>{{ client.email ?? 'Sem e-mail cadastrado' }}</span>
      </div>
      <div class="d-flex ga-2 align-center" style="font-size: 12px">
        <v-icon size="18">mdi-clock-outline</v-icon>
        <span>{{ client.next_appointment?.length > 0 ? 'Próxima consulta: ' + formatDate(client.next_appointment[0].date) : 'Sem consultas agendadas' }}</span>
      </div>
      <div class="d-flex flex-column ga-1" v-for="answer in client.answers" :key="answer.id">
        <span class="font-weight-medium" style="font-size: 12px">{{ answer.question.title }}</span>
        <span class="text-medium-emphasis" style="font-size: 12px">{{ answer.content }}</span>
      </div>
    </template>

    <div @click="expanded = !expanded" class="cursor-pointer text-primary d-flex align-center ga-1 mt-1" style="font-size: 12px">
      <v-icon size="14">{{ expanded ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
      <span>{{ expanded ? 'ver menos' : 'ver mais' }}</span>
    </div>
  </v-card-text>

  <v-divider/>

  <!-- Alerts -->
  <v-card-text class="py-3">
    <div class="d-flex align-center ga-2 cursor-pointer" @click="alertsExpanded = !alertsExpanded">
      <v-icon size="20" color="warning">mdi-alert-outline</v-icon>
      <span style="font-size: 12px">alertas ({{ client.comorbities ? 1 : 0 }})</span>
      <v-icon class="ml-auto" size="18">{{ alertsExpanded ? 'mdi-menu-up' : 'mdi-menu-down' }}</v-icon>
    </div>
    <div v-if="alertsExpanded && client.comorbities" class="mt-2">
      <v-alert type="warning" variant="tonal" density="compact" style="font-size: 12px">{{ client.comorbities }}</v-alert>
    </div>
  </v-card-text>
</template>

<script>
  import { format, parseISO, differenceInYears } from 'date-fns'

  export default {
    computed: {
      currentUser() {
        return this.$store.state.auth.user
      },
    },
    emits: ['update', 'delete', 'schedule'],
    props: ['client'],
    data() {
      return {
        expanded: false,
        alertsExpanded: false,
      }
    },
    methods: {
      getBirthday(date) {
        return format(date, 'dd/MM/yyyy')
      },
      getAge() {
        return differenceInYears(new Date(), this.client.birthday)
      },
      formatDate(date) {
        try { return format(parseISO(date), 'dd/MM/yyyy') } catch { return date }
      },
    }
  }
</script>

<style scoped>
.whatsapp-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  background-color: #4caf50;
  text-decoration: none;
  white-space: nowrap;
}
.whatsapp-btn:hover {
  background-color: #43a047;
}
</style>
