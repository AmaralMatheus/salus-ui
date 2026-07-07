<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="440"
    persistent
  >
    <v-card class="feedback-card" rounded="xl">
      <transition name="fb-fade" mode="out-in">

        <!-- Estado de sucesso -->
        <div v-if="submitted" key="success" class="success-state">
          <div class="success-icon-wrap">
            <v-icon icon="mdi-check" color="white" size="32" />
          </div>
          <div class="success-title">Obrigado pelo feedback!</div>
          <div class="success-subtitle">Sua opinião nos ajuda a melhorar o Dental Salus.</div>
          <v-btn color="primary" variant="tonal" rounded="lg" @click="handleClose" class="mt-6">
            Fechar
          </v-btn>
        </div>

        <!-- Formulário -->
        <div v-else key="form">
          <div class="fb-header">
            <div class="fb-icon-wrap">
              <v-icon v-if="module" icon="mdi-creation" size="20" color="#C62424" />
              <img v-else :src="require('../assets/feedback-line.svg')" class="fb-icon" />
            </div>
            <span class="fb-title">{{ module ? 'Módulo em breve' : 'Feedback' }}</span>
            <v-spacer />
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              density="compact"
              @click="handleClose"
            />
          </div>

          <div class="fb-body">
            <p class="fb-question">{{ module ? 'Você tem interesse nesse módulo?' : 'Como você avalia o Dental Salus?' }}</p>

            <!-- Estrelas (apenas no feedback normal) -->
            <template v-if="!module">
              <div class="stars-row">
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  class="star-btn"
                  :class="{ filled: n <= (hoverRating || rating) }"
                  @mouseenter="hoverRating = n"
                  @mouseleave="hoverRating = 0"
                  @click="rating = n"
                >
                  <v-icon
                    :icon="n <= (hoverRating || rating) ? 'mdi-star' : 'mdi-star-outline'"
                    size="40"
                  />
                </button>
              </div>

              <transition name="label-fade">
                <div v-if="rating || hoverRating" class="star-label">
                  {{ ratingLabel }}
                </div>
                <div v-else class="star-label placeholder">Selecione uma avaliação</div>
              </transition>

              <!-- Tipo -->
              <div class="fb-section">
                <span class="fb-label">
                  Tipo
                  <span class="optional">— opcional</span>
                </span>
                <div class="chips-row">
                  <button
                    v-for="cat in categories"
                    :key="cat.value"
                    type="button"
                    class="fb-chip"
                    :class="{ selected: category === cat.value }"
                    @click="category = category === cat.value ? null : cat.value"
                  >
                    <v-icon :icon="cat.icon" size="13" />
                    {{ cat.label }}
                  </button>
                </div>
              </div>
            </template>

            <!-- Contato -->
            <div class="fb-section">
              <v-text-field
                v-model="contact"
                variant="outlined"
                density="compact"
                placeholder="email@exemplo.com ou (11) 99999-9999"
                hide-details="auto"
                hint="Deixe seu email ou celular caso possamos entrar em contato para saber mais"
                persistent-hint
                class="fb-contact"
              >
                <template #label>
                  Contato <span class="optional">— opcional</span>
                </template>
              </v-text-field>
            </div>

            <!-- Mensagem -->
            <div class="fb-section">
              <v-textarea
                v-model="message"
                variant="outlined"
                density="compact"
                placeholder="Descreva sua experiência ou reporte algo..."
                rows="3"
                auto-grow
                hide-details
                class="fb-textarea"
              />
            </div>
          </div>

          <div v-if="submitError" class="fb-error">{{ submitError }}</div>

          <div class="fb-actions">
            <v-btn variant="text" color="grey" :disabled="loading" @click="handleClose">Cancelar</v-btn>
            <v-btn
              color="primary"
              rounded="lg"
              :disabled="(!module && !rating) || loading"
              :loading="loading"
              @click="submit"
              class="submit-btn"
            >
              {{ module ? 'Enviar interesse' : 'Enviar feedback' }}
            </v-btn>
          </div>
        </div>

      </transition>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'FeedbackDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    module: { type: String, default: null },
  },
  emits: ['update:modelValue'],
  data: () => ({
    rating: 0,
    hoverRating: 0,
    category: null,
    message: '',
    contact: '',
    submitted: false,
    loading: false,
    submitError: null,
    categories: [
      { value: 'bug',      label: 'Bug',      icon: 'mdi-bug-outline' },
      { value: 'sugestao', label: 'Sugestão', icon: 'mdi-lightbulb-outline' },
      { value: 'elogio',   label: 'Elogio',   icon: 'mdi-thumb-up-outline' },
      { value: 'outro',    label: 'Outro',    icon: 'mdi-dots-horizontal' },
    ],
  }),
  computed: {
    currentUser() {
      return this.$store.state.auth.user
    },
    ratingLabel() {
      const active = this.hoverRating || this.rating
      return ['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente'][active] || ''
    },
  },
  methods: {
    async submit() {
      if (!this.rating) return
      this.loading = true
      this.submitError = null
      try {
        const payload = {
          email: this.currentUser?.email || this.currentUser?.user_name || 'desconhecido',
          contato: this.contact || 'não informado',
          rating: this.rating || 'não avaliado',
          category: this.category || 'não informado',
          message: this.message || '(sem mensagem)',
        }
        if (this.module) {
          payload.modulo_interesse = this.module
          payload.message = `[Interesse no módulo: ${this.module}]${this.message ? ' ' + this.message : ''}`
        }
        const res = await fetch('https://formspree.io/f/xbdeyjwj', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Erro ao enviar')
        this.submitted = true
      } catch {
        this.submitError = 'Não foi possível enviar. Tente novamente.'
      } finally {
        this.loading = false
      }
    },
    handleClose() {
      this.$emit('update:modelValue', false)
      setTimeout(() => {
        this.rating = 0
        this.hoverRating = 0
        this.category = null
        this.message = ''
        this.contact = ''
        this.submitted = false
        this.submitError = null
      }, 300)
    },
  },
}
</script>

<style scoped>
.feedback-card {
  overflow: hidden;
}

/* ───── Header ───── */
.fb-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 0;
}

.fb-icon-wrap {
  width: 36px;
  height: 36px;
  background: #FFF0F0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fb-icon {
  width: 20px;
  height: 20px;
  filter: invert(15%) sepia(90%) saturate(2200%) hue-rotate(345deg) brightness(82%) contrast(100%);
}

.fb-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}

/* ───── Body ───── */
.fb-body {
  padding: 16px 20px 0;
}

.fb-question {
  font-size: 14px;
  font-weight: 500;
  color: #444;
  margin: 0 0 16px;
  text-align: center;
}

/* ───── Stars ───── */
.stars-row {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
}

.star-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 8px;
  transition: transform 0.15s ease;
  color: #D1D5DB;
  line-height: 1;
  outline: none;
}

.star-btn:hover,
.star-btn.filled {
  transform: scale(1.12);
}

.star-btn .v-icon {
  transition: color 0.15s ease;
}

.star-btn.filled .v-icon,
.star-btn:hover .v-icon {
  color: #FBBF24 !important;
}

/* row-hover: fill stars up to hovered */
.stars-row:hover .star-btn:not(:hover) ~ .star-btn .v-icon {
  color: #D1D5DB !important;
}

.star-label {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #C62424;
  min-height: 20px;
  margin-bottom: 16px;
  transition: opacity 0.2s;
}

.star-label.placeholder {
  color: #bbb;
  font-weight: 400;
}

/* ───── Section ───── */
.fb-section {
  margin-bottom: 14px;
}

.fb-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
}

.optional {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  font-size: 11px;
  color: #bbb;
}

/* ───── Chips ───── */
.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fb-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f5f5f5;
  border: 1.5px solid transparent;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
  font-family: inherit;
}

.fb-chip:hover {
  background: #FFF0F0;
  color: #C62424;
  border-color: #FAC5C5;
}

.fb-chip.selected {
  background: #FFF0F0;
  border-color: #C62424;
  color: #C62424;
  font-weight: 600;
}

/* ───── Contact ───── */
.fb-contact :deep(.v-field) {
  border-radius: 10px;
  font-size: 13px;
}

.fb-contact :deep(.v-messages) {
  font-size: 11px;
  color: #aaa;
  padding-top: 3px;
}

/* ───── Textarea ───── */
.fb-textarea :deep(.v-field) {
  border-radius: 10px;
  font-size: 13px;
}

/* ───── Error ───── */
.fb-error {
  margin: 0 20px 4px;
  font-size: 12px;
  color: #C62424;
  text-align: right;
}

/* ───── Actions ───── */
.fb-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 12px 20px 20px;
}

.submit-btn {
  font-weight: 600;
}

/* ───── Success ───── */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  text-align: center;
}

.success-icon-wrap {
  width: 72px;
  height: 72px;
  background: #22C55E;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
}

.success-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.success-subtitle {
  font-size: 14px;
  color: #888;
  line-height: 1.5;
  max-width: 260px;
}

/* ───── Transitions ───── */
.fb-fade-enter-active,
.fb-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fb-fade-enter-from {
  opacity: 0;
  transform: scale(0.97);
}

.fb-fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

.label-fade-enter-active,
.label-fade-leave-active {
  transition: opacity 0.15s ease;
}

.label-fade-enter-from,
.label-fade-leave-to {
  opacity: 0;
}
</style>
