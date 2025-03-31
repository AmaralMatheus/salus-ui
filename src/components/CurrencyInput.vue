<template>
  <v-text-field
    v-model="formattedValue"
    ref="inputRef"
    :rules="[
      value => {
        if (value) return true
        return 'Este campo não pode estar vazio.'
      },
    ]"
    :loading="loading"
    :disabled="loading"
    hide-details="auto"
    :variant="variant ?? 'outlined'"
    density="compact"
    label="Valor">
  </v-text-field>
</template>

<script setup>
  import { useCurrencyInput } from 'vue-currency-input'
  import { watchEffect, defineProps, watch } from 'vue'

  const props = defineProps({ modelValue: Number, loading: Boolean, variant: String })

  const { inputRef, formattedValue, setValue } = useCurrencyInput({
    currency: 'BRL',
    hideCurrencySymbolOnFocus: false,
    hideGroupingSeparatorOnFocus: false,
    precision: 2,
    narrowSymbol: 'R$ ',
    autoDecimalDigits: true,
    locale: 'pt-BR',
    valueRange: { min: 0 },
  })

  watchEffect(
    () => props.modelValue
  )

  watch(
    () => props.modelValue,
    async (newValue) => {
      setValue(newValue)
    }
  )
</script>