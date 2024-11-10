<script>
import Calendar from '../components/Calendar.vue';

export default {
	components: {
      Calendar
	},
}
</script>

<template>
  <v-card title="Agenda" class="ma-9">
    <v-card-text>
      <Calendar :show-header="true"/>
    </v-card-text>
  </v-card>
</template>
