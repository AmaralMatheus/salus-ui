<template>
    <client-register :external="true"></client-register>
</template>
<script>
import ClientRegister from '@/components/ClientRegister.vue'

export default {
  name: "AnonymousRegister",
  components: {ClientRegister},
}
</script>

<style scoped>
</style>
