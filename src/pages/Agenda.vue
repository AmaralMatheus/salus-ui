<script>
import Calendar from '../components/Calendar.vue';

export default {
  name: "DefaultAgenda",
	components: {
      Calendar
	},
}
</script>

<template>
  <v-card title="Agenda" class="ma-md-9">
    <v-card-text>
      <Calendar :show-header="false"/>
    </v-card-text>
  </v-card>
</template>
