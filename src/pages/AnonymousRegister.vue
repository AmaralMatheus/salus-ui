<template>
  <div class="d-flex flex-column w-100 align-center">
    <div class="d-flex ga-3 align-center ma-auto my-4">
      <img width="20" src="/favicon.svg" />
      <v-toolbar-title class="d-md-block">Dental Salus</v-toolbar-title>
    </div>
    <client-register :external="true"></client-register>
  </div>
</template>
<script>
import ClientRegister from '@/components/client/ClientRegister.vue'

export default {
  name: "AnonymousRegister",
  components: {ClientRegister},
}
</script>

<style scoped>
</style>
