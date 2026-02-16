<template>
  <v-card-title>
    <div class="d-flex ga-2 align-center">
      <h4 class="text-h6">{{ client.name }}</h4>
      <div class="d-flex ga-2 ml-auto" v-if="this.currentUser">
        <v-btn size="small" icon="mdi-calendar-outline" @click="schedulerDialog = true" color="info" variant="tonal" density="comfortable"/>
        <v-btn size="small" icon="mdi-pencil" @click="$emit('update')" color="warning" variant="tonal" density="comfortable"/>
        <v-btn size="small" icon="mdi-delete" @click="dialog = true" color="error" variant="tonal" density="comfortable"/>
      </div>
    </div>
  </v-card-title>
  <v-card-subtitle v-if="client.status" class="text-medium-emphasis">
    {{ client.status.name }}
  </v-card-subtitle>
  <v-card-text>
    <div class="d-flex flex-column ga-6">
      <v-avatar color="surface-variant ma-auto" size="57">
        <v-img :src="client.avatar ?? 'https://ui-avatars.com/api/?name='+client.name.replaceAll(' ', '+') + '&background=random'" cover></v-img>
      </v-avatar>
      <div v-if="client.phone !== ''" class="ma-auto">
        <v-btn color="success" prepend-icon="mdi-whatsapp" density="comfortable" target="_blank" :href="'https://wa.me/' + (!!client.phone ? client.phone.replaceAll('(','').replaceAll(')','').replaceAll('-','').replaceAll(' ','') : '')">Enviar Mensagem</v-btn>
      </div>
      <div class="d-flex flex-column profile-card ga-2">
        <div class="d-flex ga-2 align-center" v-if="expanded">
          <v-icon>mdi-gender-male-female-variant</v-icon>
          <div>{{ client.gender === 1 ? 'Homem' : client.gender === 2 ? 'Mulher' : 'Gênero alternativo' }}</div>
        </div>
        <div class="d-flex ga-2 align-center" v-if="expanded">
          <v-icon>mdi-calendar-outline</v-icon>
          <div>{{ client.birthday ? getBirthday(client.birthday) : 'Nenhum aniversário cadastrado' }} {{ client.birthday ? '(' + getAge() + ' Anos)' : '' }}</div>
        </div>
        <div class="d-flex ga-2 align-center">
          <v-icon>mdi-phone-outline</v-icon>
          <div>{{ client.phone ?? 'Nenhum telefone cadastrado' }}</div>
        </div>
        <div class="d-flex ga-2 align-center" v-if="expanded">
          <v-icon>mdi-map-marker-outline</v-icon>
          <div>{{ client.address ?? 'Nenhum endereço cadastrado' }}</div>
        </div>
        <div class="d-flex ga-2 align-center" v-if="expanded">
          <v-icon>mdi-email-outline</v-icon>
          <div>{{ client.email ?? 'Nenhum e-mail cadastrado' }}</div>
        </div>
        <div class="d-flex ga-2 align-center">
          <v-icon>mdi-clock-outline</v-icon>
          <div>{{ client.next_appointment.length > 0 ? 'Próxima consulta dia ' + getDateTime(client.next_appointment[0].date) : 'Sem consultas agendadas' }}</div>
        </div>
        <div class="d-flex my-2 ga-2 align-center flex-column" v-for="answer in client.answers">
          <h4 class="mr-auto">{{ answer.question.title }}</h4>
          <div class="mr-auto">{{ answer.content }}</div>
        </div>
        <div @click="expanded = !expanded" class="cursor-pointer text-primary font-weight-bold">{{ !expanded ? 'Ver mais' : 'Ver menos' }}</div>
      </div>
    </div>
  </v-card-text>
  <v-alert v-if="client.comorbities" type="error" variant="tonal" density="comfortable" class="mx-4">{{ client.comorbities }}</v-alert>
</template>

<script>
  import { format, parseISO, differenceInYears } from 'date-fns'

  export default {
    computed: {
      id() {
        return this.$route.params.id
      },
      currentUser() {
        return this.$store.state.auth.user
      },
    },
    emits: ['update'],
    props: ['client'],
    data() {
      return {
        expanded: false
      }
    },
    methods: {
      getBirthday(date) {
        return format(date, 'dd/MM/yyyy')
      },
      getAge() {
        return differenceInYears(new Date(), this.client.birthday)
      },
    }
  }
</script>