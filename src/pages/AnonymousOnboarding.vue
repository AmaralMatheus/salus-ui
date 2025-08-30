<template class="d-flex w-screen">
  <v-form v-model="valid">
    <v-card class="ma-auto mt-5">
      <v-card-title>
        Cadastro de Cliente
      </v-card-title>
      <v-card-text>
        <v-text-field 
          label="Nome da Clinica"
          required
          v-model="companyName"
          :rules="required"
          :disabled="loading"
          variant="outlined"
          density="compact"
        />
        <div class="v-card-title pa-0">
          Usuários
        </div>
        <div class="w-100" v-if="users.length === 0">
          Não há usuários para essa clinica!
        </div>
        <div v-else class="pt-5" v-for="user in users" :key="user">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="user.name"
                hide-details="auto"
                label="Nome do usuário"
                :rules="required"
                required
                :disabled="loading"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field
                v-model="user.email"
                :rules="required"
                hide-details="auto"
                label="E-mail do usuário"
                required
                :disabled="loading"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="user.password"
                :rules="required"
                hide-details="auto"
                label="Senha do usuário"
                required
                :disabled="loading"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="user.passwordConfirm"
                :error="user.passwordConfirm != user.password"
                :error-messages="user.passwordConfirm != user.password ? 'Confirme a senha' : ''"
                hide-details="auto"
                label="Confirmação da senha"
                required
                :disabled="loading"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="user.type"
                :rules="required"
                hide-details="auto"
                label="Tipo de acesso"
                item-title="label"
                item-value="id"
                :items="[
                  {label: 'Administrador', id: 1},
                  {label: 'Secretaria', id: 2},
                ]"
                required
                :disabled="loading"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="3" v-if="user.type === 1">
              <v-text-field
                v-model="user.cro"
                hide-details="auto"
                label="CRO"
                :rules="required"
                required
                :disabled="loading"
                variant="outlined"
                density="compact"
              />
            </v-col>
          </v-row>
          <v-divider v-if="user !== users[users.length -1]" class="mt-5 border-opacity-50"></v-divider>
        </div>
        <div class="d-flex mt-5 ga-5">
          <v-spacer></v-spacer>
          <v-btn @click="addUser" type="default">Adicionar Usuário</v-btn>
          <v-btn :loading="loading" :disabled="!valid" color="primary" @click="save">Salvar</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script>
import { toast } from 'vue3-toastify'
import companyService from '../services/company.service'

export default {
    name: 'AnonymousOnboarding',
    data: () => ({
      companyName: '',
      valid: true,
      users: [],
      required: [
        value => {
          if (value) return true
          return 'Este campo não pode estar vazio.'
        },
      ],
      loading: false,
    }),
    methods: {
      addUser() {
        this.users.push({})
        this.valid = true
      },
      async save() {
        if (!this.valid) return
        this.loading = true
        const company = {
          name: this.companyName,
          users: this.users
        }
        companyService.createCompany(company)
          .then((response) => toast.success(response.message))
          .catch((err) => toast.error(err)).finally(() => {
            this.loading = false
        })
      }
    },
  }
</script>

<style scoped>
</style>
