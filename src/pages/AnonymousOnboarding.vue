<template>
  <div class="page-wrapper">
  <div class="onboarding-container">
    <!-- Left Panel -->
    <div class="left-panel">
      <div class="logo-area">
        <img width="28" src="/favicon.svg" />
        <span class="logo-text">Dental Salus</span>
      </div>

      <div class="form-content">
        <!-- Step 1: Dados da Clínica -->
        <v-form v-if="step === 1" v-model="validStep1" class="step-form">
          <h2 class="form-title">Dados da Clínica</h2>
          <p class="form-subtitle">Preencha os dados da sua clinica, eles são necessários para criar uma conta.</p>

          <div class="fields-grid">
            <v-text-field
              label="Nome da clínica"
              v-model="company.name"
              :rules="required"
              :disabled="loading"
              variant="outlined"
              density="compact"
              hide-details="auto"
              class="field-full"
            />
            <v-text-field
              label="CNPJ"
              v-model="company.cnpj"
              :rules="cnpjRules"
              :disabled="loading"
              v-maska="'##.###.###/####-##'"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
            <v-text-field
              label="Telefone"
              v-model="company.phone"
              :rules="phoneRules"
              :disabled="loading"
              v-maska="phoneMask"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
            <v-text-field
              label="E-mail"
              v-model="company.email"
              :rules="emailRules"
              :disabled="loading"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
            <v-text-field
              label="CEP"
              v-model="company.cep"
              :rules="cepRules"
              :disabled="loading"
              v-maska="'#####-###'"
              @change="getAddress"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
            <v-text-field
              label="Endereço"
              v-model="company.address"
              :disabled="loading"
              variant="outlined"
              density="compact"
              hide-details="auto"
              class="field-full"
            />
            <v-autocomplete
              label="Estado"
              :items="states"
              item-title="sigla"
              item-value="sigla"
              v-model="company.state"
              :disabled="loading || blockState"
              :rules="required"
              variant="outlined"
              density="compact"
              hide-details="auto"
              @update:modelValue="getCities"
            />
            <v-autocomplete
              label="Cidade"
              :items="cities"
              item-title="nome"
              item-value="nome"
              v-model="company.city"
              :disabled="loading || blockCity || !company.state"
              :rules="required"
              no-data-text="Selecione um estado antes"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </div>

          <div class="checkboxes-area">
            <label class="checkbox-label">
              <input type="checkbox" v-model="termsAccepted" />
              <span>Aceito os <a href="#" class="terms-link">termos de uso</a></span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="emailsAccepted" />
              <span>Aceito receber e-mails com novidades do sistema</span>
            </label>
          </div>

          <v-btn
            block
            color="primary"
            class="continue-btn text-none"
            :disabled="!validStep1 || !termsAccepted"
            @click="step = 2"
          >
            Continuar
          </v-btn>
        </v-form>

        <!-- Step 2: Cadastre usuários -->
        <v-form v-else-if="step === 2" v-model="validStep2" class="step-form">
          <h2 class="form-title">Cadastre usuários</h2>

          <div v-for="(user, index) in users" :key="index">
            <p class="user-label">Usuário {{ index + 1 }}</p>
            <div class="fields-grid">
              <v-text-field
                v-model="user.name"
                label="Nome do usuário"
                :rules="required"
                :disabled="loading"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="field-full"
              />
              <v-text-field
                v-model="user.email"
                :rules="emailRules"
                label="E-mail do usuário"
                :disabled="loading"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="field-full"
              />
              <v-text-field
                v-model="user.password"
                :rules="required"
                label="Senha"
                type="password"
                :disabled="loading"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="field-full"
              />
              <v-text-field
                v-model="user.passwordConfirm"
                :error="!!user.passwordConfirm && user.passwordConfirm !== user.password"
                :error-messages="!!user.passwordConfirm && user.passwordConfirm !== user.password ? 'As senhas não conferem' : ''"
                hide-details="auto"
                label="Confirmar senha"
                type="password"
                :disabled="loading"
                variant="outlined"
                density="compact"
                class="field-full"
              />
              <v-select
                v-model="user.type"
                :rules="required"
                hide-details="auto"
                label="Tipo de acesso"
                item-title="label"
                item-value="id"
                :items="[
                  { label: 'Administrador', id: 1 },
                  { label: 'Secretaria', id: 2 },
                ]"
                :disabled="loading"
                variant="outlined"
                density="compact"
                class="field-full"
              />
              <v-text-field
                v-if="user.type === 1"
                v-model="user.cro"
                hide-details="auto"
                label="CRO"
                :rules="required"
                :disabled="loading"
                variant="outlined"
                density="compact"
                class="field-full"
              />
            </div>
            <v-divider v-if="index < users.length - 1" class="my-4 border-opacity-50" />
          </div>

          <v-btn
            block
            color="primary"
            class="continue-btn text-none"
            :loading="loading"
            :disabled="!validStep2"
            @click="save"
          >
            Continuar
          </v-btn>
        </v-form>

        <!-- Step 3: Sucesso -->
        <div v-else class="step-form success-step">
          <DotLottieVue :src="lottieAnimation" autoplay class="success-lottie" />
          <h2 class="form-title">Tudo certo</h2>
          <p class="form-subtitle">
            Mandamos no seu e-mail os dados para seu primeiro acesso.<br />
            Obrigado...
          </p>
          <v-btn
            block
            color="primary"
            class="continue-btn text-none"
            @click="$router.push('/login')"
          >
            Ir para login
          </v-btn>
        </div>
      </div>

      <div class="step-dots">
        <span :style="{ backgroundColor: step === 1 ? '#C62424' : '#d0ccc8' }"></span>
        <span :style="{ backgroundColor: step === 2 ? '#C62424' : '#d0ccc8' }"></span>
        <span :style="{ backgroundColor: step === 3 ? '#C62424' : '#d0ccc8' }"></span>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <div class="right-inner">
        <img src="../assets/Imagem.svg" class="hero-image" alt="" />
        <div class="right-text">
          <p class="tagline">Sitema para dentistas</p>
          <h2 class="headline">Mais eficiência e tecnologia<br />para sua clínica</h2>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { toast } from 'vue3-toastify'
import companyService from '../services/company.service'
import locationService from '../services/location.service'
import { vMaska } from 'maska/vue'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
// eslint-disable-next-line import/no-webpack-loader-syntax
import lottieAnimation from '../assets/Untitled file.lottie'

export default {
  name: 'AnonymousOnboarding',
  components: { DotLottieVue },
  directives: { maska: vMaska },
  computed: {
    phoneMask() {
      return (this.company.phone?.length ?? 0) < 15 ? '(##) ####-#####' : '(##) #####-####'
    },
  },
  data: () => ({
    lottieAnimation,
    step: 1,
    validStep1: false,
    validStep2: false,
    termsAccepted: false,
    emailsAccepted: false,
    company: {
      name: '',
      cnpj: '',
      phone: '',
      email: '',
      cep: '',
      address: '',
      state: null,
      city: null,
    },
    states: [],
    cities: [],
    blockCity: false,
    blockState: false,
    users: [{ name: '', email: '', password: '', passwordConfirm: '', type: null, cro: '' }],
    loading: false,
    required: [
      value => {
        if (value) return true
        return 'Este campo não pode estar vazio.'
      },
    ],
    phoneRules: [
      value => {
        if (!value) return 'Este campo não pode estar vazio.'
        if (value.length < 14) return 'Informe o telefone completo.'
        return true
      },
    ],
    cnpjRules: [
      value => {
        if (!value) return 'Este campo não pode estar vazio.'
        if (value.length < 18) return 'Informe o CNPJ completo.'
        return true
      },
    ],
    cepRules: [
      value => {
        if (!value) return 'Este campo não pode estar vazio.'
        if (value.length < 9) return 'Informe o CEP completo.'
        return true
      },
    ],
    emailRules: [
      v => !!v || 'Este campo não pode estar vazio.',
      v => /.+@.+\..+/.test(v) || 'Informe um e-mail válido.',
    ],
  }),
  created() {
    locationService.getStates().then((response) => {
      this.states = response.data
    })
  },
  methods: {
    getAddress() {
      this.blockCity = false
      this.blockState = false
      if (this.company.cep?.length === 9) {
        locationService.getAddress(this.company.cep.replace('-', '')).then((response) => {
          if (response.data.uf) {
            this.company.state = response.data.uf
            this.blockState = true
            const returnedCity = response.data.localidade
            locationService.getCities(this.company.state).then((response) => {
              this.cities = response.data
              if (returnedCity) {
                this.company.city = this.cities.find((c) => c.nome === returnedCity)?.nome ?? null
                this.blockCity = true
              }
            })
          }
          this.company.address = response.data.logradouro + (response.data.complemento ? ', ' + response.data.complemento : '')
        })
      }
    },
    getCities() {
      this.company.city = null
      if (this.company.state) {
        locationService.getCities(this.company.state).then((response) => {
          this.cities = response.data
        })
      }
    },
    async save() {
      if (!this.validStep2) return
      const passwordMismatch = this.users.find((u) => u.password !== u.passwordConfirm)
      if (passwordMismatch) {
        toast.error('As senhas não conferem para o usuário ' + passwordMismatch.name)
        return
      }
      this.loading = true
      const payload = {
        ...this.company,
        users: this.users,
      }
      companyService.createCompany(payload)
        .then(() => {
          this.step = 3
          window.dataLayer = window.dataLayer || []
          window.dataLayer.push({ event: 'cadastro_concluido' })
        })
        .catch((err) => toast.error(
          (err.response?.data?.message) || err.message || err.toString()
        ))
        .finally(() => { this.loading = false })
    },
  },
}
</script>

<style scoped>
/* Page wrapper — full viewport, centers the card */
.page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  box-sizing: border-box;
}

/* The card — max 1362px, rounded corners, shadow */
.onboarding-container {
  display: flex;
  width: 100%;
  max-width: 1362px;
  height: min(90vh, 820px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
}

/* Left panel: fixed width, never shrinks */
.left-panel {
  width: 500px;
  flex-shrink: 0;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 2.5rem 3rem;
  overflow-y: auto;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2rem;
}

.logo-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.step-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.form-subtitle {
  font-size: 0.875rem;
  color: #555;
  margin-bottom: 0.5rem;
}

.fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.field-full {
  grid-column: 1 / -1;
}

.checkboxes-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #333;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #C62424;
  cursor: pointer;
}

.terms-link {
  color: #C62424;
  font-weight: 600;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.continue-btn {
  margin-top: 0.5rem;
  height: 48px !important;
  font-size: 1rem !important;
  border-radius: 8px !important;
}

.user-label {
  font-size: 0.875rem;
  color: #555;
  margin-bottom: 0.25rem;
}

.success-step {
  align-items: flex-start;
  gap: 1.25rem;
}

.success-lottie {
  width: 120px;
  height: 120px;
}

.step-dots {
  display: flex;
  gap: 8px;
  margin-top: 2rem;
  padding-top: 1rem;
}

.step-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #d0ccc8;
  transition: background-color 0.2s;
}

/* Right panel: flexible — shrinks on smaller screens */
.right-panel {
  flex: 1;
  min-width: 0;
  background: linear-gradient(145deg, #fff5f5 0%, #fde8e8 50%, #fad4d4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.right-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  width: 100%;
  padding: 2rem 2.5rem 3rem;
  gap: 1.5rem;
}

.hero-image {
  flex: 1;
  max-height: 75%;
  width: auto;
  object-fit: contain;
}

.right-text {
  text-align: center;
}

.tagline {
  font-size: 0.875rem;
  font-weight: 600;
  color: #C62424;
  margin-bottom: 0.5rem;
}

.headline {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}

/* On screens narrower than the left panel + some right content, hide the right panel */
@media (max-width: 700px) {
  .right-panel {
    display: none;
  }
  .left-panel {
    width: 100%;
    border-radius: 20px;
  }
}
</style>
