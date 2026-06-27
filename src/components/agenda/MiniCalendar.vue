<template>
  <div class="mini-calendar">
    <div class="mini-cal-header">
      <v-btn icon="mdi-chevron-left" size="small" variant="text" @click="prevMonth" />
      <span class="mini-cal-month">
        {{ format(displayMonth, 'MMMM yyyy', { locale: ptBR }) }}
      </span>
      <v-btn icon="mdi-chevron-right" size="small" variant="text" @click="nextMonth" />
    </div>

    <div class="mini-cal-weekdays">
      <span v-for="(label, i) in ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']" :key="i" class="mini-cal-wd">
        {{ label }}
      </span>
    </div>

    <div class="mini-cal-grid">
      <template v-for="(day, i) in calendarDays" :key="day ? day.toISOString() : 'p' + i">
        <div v-if="!day" class="mini-cal-day empty" />
        <div
          v-else
          class="mini-cal-day"
          :class="{
            'is-today': isToday(day),
            'is-selected': isSelected(day),
            'is-past': isPastDay(day),
          }"
          @click="$emit('update:modelValue', day)"
        >
          <span class="day-num">{{ format(day, 'd') }}</span>
          <div v-if="hasDot(day)" class="cal-dot" />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default {
  name: 'MiniCalendar',
  props: {
    modelValue: { type: Date, default: null },
    appointments: { type: Array, default: () => [] },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      displayMonth: this.modelValue ? new Date(this.modelValue) : new Date(),
      ptBR,
    }
  },
  computed: {
    monthDays() {
      return eachDayOfInterval({
        start: startOfMonth(this.displayMonth),
        end: endOfMonth(this.displayMonth),
      })
    },
    calendarDays() {
      const padding = (getDay(startOfMonth(this.displayMonth)) + 6) % 7
      return [...Array(padding).fill(null), ...this.monthDays]
    },
  },
  watch: {
    modelValue(val) {
      if (!val) return
      const d = new Date(val)
      if (
        d.getFullYear() !== this.displayMonth.getFullYear() ||
        d.getMonth() !== this.displayMonth.getMonth()
      ) {
        this.displayMonth = new Date(d.getFullYear(), d.getMonth(), 1)
      }
    },
  },
  methods: {
    format,
    isToday,
    prevMonth() {
      this.displayMonth = new Date(this.displayMonth.getFullYear(), this.displayMonth.getMonth() - 1, 1)
    },
    nextMonth() {
      this.displayMonth = new Date(this.displayMonth.getFullYear(), this.displayMonth.getMonth() + 1, 1)
    },
    isSelected(day) {
      return !!this.modelValue && isSameDay(day, this.modelValue)
    },
    isPastDay(day) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const d = new Date(day)
      d.setHours(0, 0, 0, 0)
      return d < today
    },
    hasDot(day) {
      return this.appointments.some(a => {
        try { return isSameDay(parseISO(a.date), day) } catch { return false }
      })
    },
  },
}
</script>

<style scoped>
.mini-calendar {
  width: 100%;
}

.mini-cal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.mini-cal-month {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  text-transform: capitalize;
}

.mini-cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.mini-cal-wd {
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 4px 0;
}

.mini-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.mini-cal-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
  position: relative;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
}

.mini-cal-day.empty {
  pointer-events: none;
}

.mini-cal-day:not(.empty):not(.is-selected):not(.is-today):hover {
  background: #FDF2F2;
  color: #C62424;
}

.mini-cal-day.is-past {
  color: #bbb;
}

.mini-cal-day.is-today {
  background: #C62424;
  color: white !important;
  font-weight: 700;
}

.mini-cal-day.is-selected:not(.is-today) {
  border: 1.5px solid #C62424;
  color: #C62424;
  font-weight: 700;
}

.cal-dot {
  position: absolute;
  bottom: 3px;
  width: 4px;
  height: 4px;
  background: #C62424;
  border-radius: 50%;
}

.mini-cal-day.is-today .cal-dot {
  background: rgba(255, 255, 255, 0.8);
}
</style>
