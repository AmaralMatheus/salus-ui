<template>
  <div class="page-bg">

    <!-- Password Gate -->
    <div v-if="!authenticated" class="auth-overlay">
      <v-card class="auth-card" elevation="3">
        <div class="d-flex align-center mb-6" style="gap: 10px;">
          <img width="28" src="/favicon.svg" alt="logo" style="display:block;" />
          <span class="brand">Dental Salus</span>
        </div>
        <h2 class="gate-title">Acesso ao Painel</h2>
        <p class="gate-sub">Informe a senha para visualizar as métricas</p>
        <v-text-field
          v-model="passwordInput"
          label="Senha"
          :type="showPass ? 'text' : 'password'"
          :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPass = !showPass"
          variant="outlined"
          density="compact"
          :error-messages="wrongPassword ? 'Senha incorreta' : ''"
          @keydown.enter="checkPassword"
          class="mt-4"
        />
        <v-btn block color="primary" class="mt-3 text-none" height="44" @click="checkPassword">
          Entrar
        </v-btn>
      </v-card>
    </div>

    <!-- Dashboard -->
    <template v-else>
      <!-- Top Bar -->
      <div class="topbar">
        <div class="d-flex align-center" style="gap: 10px;">
          <img width="26" src="/favicon.svg" alt="logo" style="display:block;" />
          <span class="brand">Dental Salus</span>
        </div>
        <span class="topbar-title">Painel de Métricas</span>
        <button class="logout-btn" @click="logout">Sair</button>
      </div>

      <div v-if="loading" class="loading-bar"></div>

      <div class="dash-body">

        <!-- ═══════════════════════════════════════════════
             SEÇÃO 1 — VISÃO GERAL
        ═══════════════════════════════════════════════ -->
        <section class="dash-section">
          <h2 class="section-heading">Visão Geral</h2>

          <!-- KPIs -->
          <div class="kpi-row">
            <div class="kpi-card">
              <span class="kpi-label">Total de Clientes</span>
              <span class="kpi-value">{{ allClients.length }}</span>
              <span class="kpi-sub">Clínicas cadastradas</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Estados Ativos</span>
              <span class="kpi-value">{{ activeStatesCount }}</span>
              <span class="kpi-sub">Com ao menos 1 clínica</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Total de Pacientes</span>
              <span class="kpi-value">{{ totalPatients.toLocaleString('pt-BR') }}</span>
              <span class="kpi-sub">Em todas as clínicas</span>
            </div>
          </div>

          <!-- Filtros -->
          <div class="filter-row">
            <button
              v-for="f in filterOptions"
              :key="f.value"
              :class="['filter-tag', { 'tag-selected': activeFilter === f.value }]"
              @click="setFilter(f.value)"
            >{{ f.label }}</button>
            <template v-if="activeFilter === 'custom'">
              <input type="date" v-model="customStart" class="date-input" />
              <span class="date-sep">até</span>
              <input type="date" v-model="customEnd" class="date-input" />
            </template>
          </div>

          <!-- Gráfico + Mapa -->
          <div class="charts-grid">
            <!-- Crescimento -->
            <div class="chart-card">
              <h3 class="chart-heading">Crescimento de Clientes</h3>
              <Line :data="growthChartData" :options="lineOptions" style="max-height: 280px;" />
            </div>

            <!-- Mapa do Brasil -->
            <div class="chart-card">
              <h3 class="chart-heading">Distribuição por Estado</h3>
              <div class="map-wrapper" @mousemove="onMapMouseMove" @mouseleave="hoveredState = null">
                <svg :viewBox="mapViewBox" class="brazil-svg">
                  <path
                    v-for="loc in mapLocations"
                    :key="loc.id"
                    :d="loc.path"
                    :fill="getStateColor(loc.id)"
                    stroke="#fff"
                    stroke-width="1"
                    stroke-linejoin="round"
                    class="state-path"
                    @mouseenter="hoveredState = loc.id"
                  />
                </svg>
                <div
                  v-if="hoveredState"
                  class="map-tooltip"
                  :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
                >
                  <div class="tooltip-state">{{ getStateName(hoveredState) }}</div>
                  <div class="tooltip-count">
                    <strong>{{ getStateCount(hoveredState) }}</strong>
                    cliente{{ getStateCount(hoveredState) !== 1 ? 's' : '' }}
                  </div>
                </div>
              </div>
              <div class="map-legend">
                <span class="legend-label">0</span>
                <div class="legend-gradient"></div>
                <span class="legend-label">{{ maxStateCount }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════
             SEÇÃO 2 — NOVOS CLIENTES
        ═══════════════════════════════════════════════ -->
        <section class="dash-section">
          <h2 class="section-heading">Novos Clientes</h2>

          <div class="kpi-row">
            <div class="kpi-card highlight">
              <span class="kpi-label">Novos no Período</span>
              <span class="kpi-value">{{ newClientsInPeriod }}</span>
              <span class="kpi-sub">{{ filterLabel }}</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Média por Período</span>
              <span class="kpi-value">{{ avgNewPerPeriod }}</span>
              <span class="kpi-sub">{{ filterUnit }}</span>
            </div>
          </div>

          <div class="chart-card" style="max-width: 800px;">
            <h3 class="chart-heading">Novos Clientes por Período</h3>
            <Bar :data="newClientsChartData" :options="barOptions" style="max-height: 280px;" />
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════
             SEÇÃO 3 — TABELA DE CLIENTES
        ═══════════════════════════════════════════════ -->
        <section class="dash-section">
          <div class="section-header-row">
            <h2 class="section-heading" style="margin-bottom: 0;">Clientes Cadastrados</h2>
            <span class="table-count">{{ allClients.length }} clientes</span>
          </div>

          <div class="table-card">
            <table class="clients-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Data de Entrada</th>
                  <th>Estado</th>
                  <th>Cidade</th>
                  <th>E-mail</th>
                  <th class="text-center">Pacientes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="client in paginatedClients" :key="client.id">
                  <td class="client-name">{{ client.name }}</td>
                  <td>{{ formatDate(client.entryDate) }}</td>
                  <td><span class="state-badge">{{ client.state }}</span></td>
                  <td>{{ client.city }}</td>
                  <td class="client-email">{{ client.email }}</td>
                  <td class="text-center">{{ client.patients }}</td>
                </tr>
              </tbody>
            </table>

            <div class="pagination-row">
              <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
              <div class="page-controls">
                <button class="page-btn" :disabled="currentPage === 1" @click="currentPage = 1">«</button>
                <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
                <button
                  v-for="p in pageNumbers"
                  :key="p"
                  :class="['page-btn', { 'page-active': p === currentPage }]"
                  @click="currentPage = p"
                >{{ p }}</button>
                <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
                <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage = totalPages">»</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script>
import { Line, Bar } from 'vue-chartjs'
import dashboardService from '../services/dashboard.service'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import Brazil from '@svg-maps/brazil'
import {
  format,
  subWeeks,
  subMonths,
  addMonths,
  parseISO,
  isAfter,
  isBefore,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  min as minDate,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler)

const DASH_PASSWORD = 'salus2025'

const mockClients = [
  // SP — 14
  { id: 1,  name: 'Clínica OralTech',       email: 'contato@oraltech.com.br',     state: 'SP', city: 'São Paulo',          entryDate: '2025-01-10', patients: 142 },
  { id: 2,  name: 'Odonto Saúde SP',         email: 'admin@odontosaude.com.br',    state: 'SP', city: 'Campinas',            entryDate: '2025-01-22', patients: 89  },
  { id: 3,  name: 'Sorriso Paulistano',      email: 'sorriso@paulistano.com.br',   state: 'SP', city: 'Santo André',         entryDate: '2025-02-05', patients: 76  },
  { id: 4,  name: 'Clínica Bella Vita',      email: 'bellavita@clinica.com.br',    state: 'SP', city: 'Guarulhos',           entryDate: '2025-02-18', patients: 103 },
  { id: 5,  name: 'DentalPrime SP',          email: 'prime@dentalsp.com.br',       state: 'SP', city: 'Osasco',              entryDate: '2025-03-07', patients: 55  },
  { id: 6,  name: 'Studio Oral',             email: 'studio@oral.com.br',          state: 'SP', city: 'Ribeirão Preto',      entryDate: '2025-03-20', patients: 88  },
  { id: 7,  name: 'Odonto Center',           email: 'contato@odontocenter.com.br', state: 'SP', city: 'São Bernardo',        entryDate: '2025-04-12', patients: 67  },
  { id: 8,  name: 'Clínica Maxilar',         email: 'maxilar@clinica.com.br',      state: 'SP', city: 'Sorocaba',            entryDate: '2025-05-08', patients: 91  },
  { id: 9,  name: 'Dentes Brilhantes',       email: 'info@dentesbrilhantes.com.br',state: 'SP', city: 'Jundiaí',             entryDate: '2025-06-15', patients: 44  },
  { id: 10, name: 'Oral Solutions',          email: 'oral@solutions.com.br',       state: 'SP', city: 'São José dos Campos', entryDate: '2025-07-22', patients: 72  },
  { id: 11, name: 'Implant Clinic',          email: 'implant@clinic.com.br',       state: 'SP', city: 'Bauru',               entryDate: '2025-08-10', patients: 38  },
  { id: 12, name: 'ProOdonto SP',            email: 'pro@odontosp.com.br',         state: 'SP', city: 'Piracicaba',           entryDate: '2025-09-18', patients: 61  },
  { id: 13, name: 'Sorrisos SP',             email: 'sorrisos@sp.com.br',          state: 'SP', city: 'Santos',              entryDate: '2025-11-05', patients: 83  },
  { id: 14, name: 'OdontoPrime Capital',     email: 'capital@odontoprime.com.br',  state: 'SP', city: 'São Paulo',           entryDate: '2026-01-14', patients: 127 },
  // MG — 8
  { id: 15, name: 'BH Dental',              email: 'bhdental@clinica.com.br',     state: 'MG', city: 'Belo Horizonte',      entryDate: '2025-01-15', patients: 94  },
  { id: 16, name: 'Clínica Mineira',        email: 'mineira@clinica.com.br',      state: 'MG', city: 'Uberlândia',          entryDate: '2025-02-28', patients: 61  },
  { id: 17, name: 'Oral Minas',             email: 'oral@minas.com.br',           state: 'MG', city: 'Contagem',            entryDate: '2025-04-10', patients: 45  },
  { id: 18, name: 'Sorri Minas',            email: 'sorri@minas.com.br',          state: 'MG', city: 'Juiz de Fora',        entryDate: '2025-06-01', patients: 72  },
  { id: 19, name: 'Dental Excellence MG',   email: 'excellence@mg.com.br',        state: 'MG', city: 'Montes Claros',       entryDate: '2025-07-20', patients: 39  },
  { id: 20, name: 'Clínica Horizonte',      email: 'horizonte@clinica.com.br',    state: 'MG', city: 'Belo Horizonte',      entryDate: '2025-09-05', patients: 108 },
  { id: 21, name: 'OralCare MG',            email: 'oralcare@mg.com.br',          state: 'MG', city: 'Betim',               entryDate: '2025-11-12', patients: 54  },
  { id: 22, name: 'Sorriso Mineiro',        email: 'sorriso@mineiro.com.br',      state: 'MG', city: 'Uberaba',             entryDate: '2026-02-08', patients: 67  },
  // RJ — 7
  { id: 23, name: 'Clínica Carioca',        email: 'carioca@clinica.com.br',      state: 'RJ', city: 'Rio de Janeiro',      entryDate: '2025-01-20', patients: 156 },
  { id: 24, name: 'OdontoBay',              email: 'bay@odonto.com.br',           state: 'RJ', city: 'Niterói',             entryDate: '2025-03-15', patients: 88  },
  { id: 25, name: 'Dental Rio',             email: 'dentalrio@clinica.com.br',    state: 'RJ', city: 'Nova Iguaçu',         entryDate: '2025-05-22', patients: 63  },
  { id: 26, name: 'Ipanema Dental',         email: 'ipanema@dental.com.br',       state: 'RJ', city: 'Rio de Janeiro',      entryDate: '2025-08-10', patients: 201 },
  { id: 27, name: 'Clínica Guanabara',      email: 'guanabara@clinica.com.br',    state: 'RJ', city: 'Duque de Caxias',     entryDate: '2025-10-05', patients: 44  },
  { id: 28, name: 'Rio Oral',               email: 'oral@rio.com.br',             state: 'RJ', city: 'São Gonçalo',         entryDate: '2025-12-18', patients: 77  },
  { id: 29, name: 'Sorrisos Cariocas',      email: 'sorrisos@cariocas.com.br',    state: 'RJ', city: 'Petrópolis',          entryDate: '2026-03-07', patients: 52  },
  // RS — 5
  { id: 30, name: 'Gaucho Dental',          email: 'gaucho@dental.com.br',        state: 'RS', city: 'Porto Alegre',        entryDate: '2025-02-10', patients: 83  },
  { id: 31, name: 'Sul Oral',               email: 'oral@sul.com.br',             state: 'RS', city: 'Caxias do Sul',       entryDate: '2025-05-08', patients: 47  },
  { id: 32, name: 'Clínica Serra Gaúcha',   email: 'serra@gaucha.com.br',         state: 'RS', city: 'Gramado',             entryDate: '2025-08-22', patients: 31  },
  { id: 33, name: 'Pampas Dental',          email: 'pampas@dental.com.br',        state: 'RS', city: 'Pelotas',             entryDate: '2025-11-05', patients: 59  },
  { id: 34, name: 'OdontoPoa',              email: 'odonto@poa.com.br',           state: 'RS', city: 'Porto Alegre',        entryDate: '2026-02-15', patients: 72  },
  // PR — 5
  { id: 35, name: 'Curitiba Dental',        email: 'dental@curitiba.com.br',      state: 'PR', city: 'Curitiba',            entryDate: '2025-01-30', patients: 98  },
  { id: 36, name: 'Paraná Oral',            email: 'oral@parana.com.br',          state: 'PR', city: 'Londrina',            entryDate: '2025-04-18', patients: 65  },
  { id: 37, name: 'Araucária Dental',       email: 'araucaria@dental.com.br',     state: 'PR', city: 'Maringá',             entryDate: '2025-07-10', patients: 44  },
  { id: 38, name: 'Clínica Iguaçu',         email: 'iguacu@clinica.com.br',       state: 'PR', city: 'Foz do Iguaçu',      entryDate: '2025-10-22', patients: 38  },
  { id: 39, name: 'OdontoPR',               email: 'odonto@pr.com.br',            state: 'PR', city: 'Ponta Grossa',        entryDate: '2026-01-15', patients: 51  },
  // BA — 4
  { id: 40, name: 'Bahia Dental',           email: 'dental@bahia.com.br',         state: 'BA', city: 'Salvador',            entryDate: '2025-03-05', patients: 87  },
  { id: 41, name: 'Axé Oral',               email: 'axe@oral.com.br',             state: 'BA', city: 'Feira de Santana',    entryDate: '2025-07-28', patients: 43  },
  { id: 42, name: 'Nordeste Dental BA',     email: 'nordeste@ba.com.br',          state: 'BA', city: 'Vitória da Conquista', entryDate: '2025-11-14', patients: 55  },
  { id: 43, name: 'Sorriso Baiano',         email: 'sorriso@baiano.com.br',       state: 'BA', city: 'Camaçari',            entryDate: '2026-03-28', patients: 62  },
  // GO — 3
  { id: 44, name: 'Goiás Dental',           email: 'dental@goias.com.br',         state: 'GO', city: 'Goiânia',             entryDate: '2025-04-05', patients: 76  },
  { id: 45, name: 'Centro-Oeste Oral',      email: 'oral@centrooeste.com.br',     state: 'GO', city: 'Aparecida de Goiânia',entryDate: '2025-09-18', patients: 41  },
  { id: 46, name: 'OdontoCerrado',          email: 'cerrado@odonto.com.br',       state: 'GO', city: 'Anápolis',            entryDate: '2026-04-02', patients: 33  },
  // CE — 3
  { id: 47, name: 'Fortaleza Dental',       email: 'dental@fortaleza.com.br',     state: 'CE', city: 'Fortaleza',           entryDate: '2025-05-12', patients: 69  },
  { id: 48, name: 'Nordeste Oral CE',       email: 'oral@ce.com.br',              state: 'CE', city: 'Caucaia',             entryDate: '2025-10-08', patients: 37  },
  { id: 49, name: 'Ceará Sorrindo',         email: 'sorrindo@ceara.com.br',       state: 'CE', city: 'Juazeiro do Norte',   entryDate: '2026-04-15', patients: 48  },
  // PE — 3
  { id: 50, name: 'Recife Dental',          email: 'dental@recife.com.br',        state: 'PE', city: 'Recife',              entryDate: '2025-06-20', patients: 91  },
  { id: 51, name: 'Pernambuco Oral',        email: 'oral@pernambuco.com.br',      state: 'PE', city: 'Caruaru',             entryDate: '2025-11-30', patients: 44  },
  { id: 52, name: 'OdontoPE',               email: 'odonto@pe.com.br',            state: 'PE', city: 'Olinda',              entryDate: '2026-04-08', patients: 58  },
  // SC — 2
  { id: 53, name: 'Santa Catarina Dental',  email: 'dental@sc.com.br',            state: 'SC', city: 'Florianópolis',       entryDate: '2025-07-15', patients: 74  },
  { id: 54, name: 'Blumenau Oral',          email: 'oral@blumenau.com.br',        state: 'SC', city: 'Blumenau',            entryDate: '2026-01-28', patients: 49  },
  // DF — 2
  { id: 55, name: 'Brasília Dental',        email: 'dental@brasilia.com.br',      state: 'DF', city: 'Brasília',            entryDate: '2025-08-05', patients: 112 },
  { id: 56, name: 'Plano Piloto Oral',      email: 'oral@planopiloto.com.br',     state: 'DF', city: 'Brasília',            entryDate: '2026-05-10', patients: 67  },
  // MT — 2
  { id: 57, name: 'Pantanal Dental',        email: 'dental@pantanal.com.br',      state: 'MT', city: 'Cuiabá',             entryDate: '2025-09-12', patients: 43  },
  { id: 58, name: 'MatoGrosso Oral',        email: 'oral@mt.com.br',              state: 'MT', city: 'Várzea Grande',       entryDate: '2026-02-20', patients: 31  },
  // ES — 2
  { id: 59, name: 'Espírito Santo Dental',  email: 'dental@es.com.br',            state: 'ES', city: 'Vitória',             entryDate: '2025-10-18', patients: 57  },
  { id: 60, name: 'Capixaba Oral',          email: 'oral@capixaba.com.br',        state: 'ES', city: 'Serra',               entryDate: '2026-05-25', patients: 38  },
]

export default {
  name: 'DashboardPage',
  components: { Line, Bar },

  data() {
    return {
      authenticated: !!sessionStorage.getItem('dash_auth'),
      passwordInput: '',
      showPass: false,
      wrongPassword: false,

      activeFilter: 'month',
      customStart: '',
      customEnd: '',

      hoveredState: null,
      tooltipX: 0,
      tooltipY: 0,

      currentPage: 1,
      perPage: 10,

      loading: false,
      allClients: mockClients,

      filterOptions: [
        { label: 'Semana', value: 'week' },
        { label: 'Mês',    value: 'month' },
        { label: 'Personalizado', value: 'custom' },
      ],

      mapViewBox: Brazil.viewBox,
      mapLocations: Brazil.locations,

      lineOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Montserrat', size: 11 } } },
          y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { font: { family: 'Montserrat', size: 11 } } },
        },
      },

      barOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Montserrat', size: 11 } } },
          y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { font: { family: 'Montserrat', size: 11 } } },
        },
      },
    }
  },

  created() {
    if (this.authenticated) this.fetchData()
  },

  computed: {
    /* ── Períodos (fonte de verdade para ambos os gráficos) ── */
    computedPeriods() {
      const now = new Date()
      const periods = []
      const labels = []

      if (this.activeFilter === 'week') {
        for (let i = 11; i >= 0; i--) {
          const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 })
          const weekEnd   = i === 0 ? now : endOfWeek(subWeeks(now, i), { weekStartsOn: 1 })
          periods.push({ start: weekStart, end: weekEnd })
          labels.push(format(weekStart, 'dd/MM', { locale: ptBR }))
        }
      } else if (this.activeFilter === 'month') {
        for (let i = 11; i >= 0; i--) {
          const d = subMonths(now, i)
          const monthStart = startOfMonth(d)
          const monthEnd   = i === 0 ? now : endOfMonth(d)
          periods.push({ start: monthStart, end: monthEnd })
          labels.push(format(d, 'MMM/yy', { locale: ptBR }))
        }
      } else {
        // Personalizado
        if (!this.customStart || !this.customEnd) {
          return { labels: [], periods: [], cumulativeData: [], newData: [] }
        }
        let current = startOfMonth(parseISO(this.customStart))
        const rangeEnd = parseISO(this.customEnd)
        while (!isAfter(current, rangeEnd)) {
          const mEnd = minDate([endOfMonth(current), rangeEnd])
          const mStart = isAfter(startOfMonth(current), parseISO(this.customStart))
            ? startOfMonth(current)
            : parseISO(this.customStart)
          periods.push({ start: mStart, end: mEnd })
          labels.push(format(current, 'MMM/yy', { locale: ptBR }))
          current = startOfMonth(addMonths(current, 1))
        }
      }

      const cumulativeData = periods.map(p =>
        this.allClients.filter(c => !isAfter(parseISO(c.entryDate), p.end)).length
      )
      const newData = periods.map(p =>
        this.allClients.filter(c => {
          const d = parseISO(c.entryDate)
          return !isBefore(d, p.start) && !isAfter(d, p.end)
        }).length
      )

      return { labels, periods, cumulativeData, newData }
    },

    growthChartData() {
      const { labels, cumulativeData } = this.computedPeriods
      return {
        labels,
        datasets: [{
          label: 'Total de Clientes',
          data: cumulativeData,
          borderColor: '#C62424',
          backgroundColor: 'rgba(198,36,36,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#C62424',
          borderWidth: 2,
        }],
      }
    },

    newClientsChartData() {
      const { labels, newData } = this.computedPeriods
      return {
        labels,
        datasets: [{
          label: 'Novos Clientes',
          data: newData,
          backgroundColor: 'rgba(198,36,36,0.75)',
          borderColor: '#C62424',
          borderRadius: 6,
          borderWidth: 0,
        }],
      }
    },

    newClientsInPeriod() {
      const { newData } = this.computedPeriods
      return newData.reduce((s, n) => s + n, 0)
    },

    avgNewPerPeriod() {
      const { newData } = this.computedPeriods
      if (!newData.length) return 0
      return Math.round(newData.reduce((s, n) => s + n, 0) / newData.length)
    },

    filterLabel() {
      const map = { week: 'Últimas 12 semanas', month: 'Últimos 12 meses', custom: 'Período personalizado' }
      return map[this.activeFilter] || ''
    },

    filterUnit() {
      const map = { week: 'por semana', month: 'por mês', custom: 'por mês' }
      return map[this.activeFilter] || 'por período'
    },

    totalPatients() {
      return this.allClients.reduce((s, c) => s + c.patients, 0)
    },

    activeStatesCount() {
      return new Set(this.allClients.map(c => c.state)).size
    },

    stateClientCounts() {
      const counts = {}
      this.allClients.forEach(c => { counts[c.state] = (counts[c.state] || 0) + 1 })
      return counts
    },

    maxStateCount() {
      const vals = Object.values(this.stateClientCounts)
      return vals.length ? Math.max(...vals) : 1
    },

    /* ── Tabela ── */
    paginatedClients() {
      const start = (this.currentPage - 1) * this.perPage
      return this.allClients.slice(start, start + this.perPage)
    },

    totalPages() {
      return Math.ceil(this.allClients.length / this.perPage)
    },

    pageNumbers() {
      const pages = []
      for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(this.totalPages, this.currentPage + 2); i++) {
        pages.push(i)
      }
      return pages
    },
  },

  methods: {
    checkPassword() {
      if (this.passwordInput === DASH_PASSWORD) {
        sessionStorage.setItem('dash_auth', '1')
        sessionStorage.setItem('dash_key', this.passwordInput)
        this.authenticated = true
        this.wrongPassword = false
        this.fetchData()
      } else {
        this.wrongPassword = true
      }
    },

    async fetchData() {
      this.loading = true
      try {
        const { data } = await dashboardService.getClients()
        this.allClients = data.map(c => ({
          id:        c.id,
          name:      c.name,
          email:     c.email,
          state:     c.state,
          city:      c.city,
          entryDate: c.entry_date,
          patients:  c.patients_count,
        }))
      } catch {
        // API indisponível — mantém mock data
      } finally {
        this.loading = false
      }
    },

    logout() {
      sessionStorage.removeItem('dash_auth')
      this.authenticated = false
      this.passwordInput = ''
    },

    setFilter(val) {
      this.activeFilter = val
      this.currentPage = 1
    },

    getStateCount(id) {
      return this.stateClientCounts[id] || 0
    },

    getStateName(id) {
      const loc = this.mapLocations.find(l => l.id === id)
      return loc ? loc.title : id
    },

    getStateColor(id) {
      const count = this.getStateCount(id)
      if (count === 0) return '#ebebeb'
      const ratio = count / this.maxStateCount
      // Light pink → brand red: (255,213,213) → (198,36,36)
      const r = Math.round(255 - (255 - 198) * ratio)
      const g = Math.round(213 - (213 - 36)  * ratio)
      const b = Math.round(213 - (213 - 36)  * ratio)
      return `rgb(${r},${g},${b})`
    },

    onMapMouseMove(e) {
      const rect = e.currentTarget.getBoundingClientRect()
      this.tooltipX = e.clientX - rect.left + 14
      this.tooltipY = e.clientY - rect.top  - 14
    },

    formatDate(dateStr) {
      return format(parseISO(dateStr), 'dd/MM/yyyy')
    },
  },
}
</script>

<style scoped>
/* ── Base ─────────────────────────────────────────── */
.page-bg {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: 'Montserrat', sans-serif;
}

/* ── Auth Gate ────────────────────────────────────── */
.auth-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1.5rem;
}
.auth-card {
  padding: 2.25rem 2rem;
  border-radius: 16px !important;
  width: 100%;
  max-width: 360px;
}
.gate-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}
.gate-sub {
  font-size: 0.85rem;
  color: #777;
}

/* ── Top Bar ──────────────────────────────────────── */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 2rem;
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 20;
}
.topbar-title {
  font-size: 0.875rem;
  color: #888;
  font-weight: 500;
}
.logout-btn {
  font-size: 0.8125rem;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: color 0.15s;
}
.logout-btn:hover { color: #C62424; }

/* ── Dashboard Body ───────────────────────────────── */
.dash-body {
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem 2rem 4rem;
}
.dash-section { margin-bottom: 3rem; }

.section-heading {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
}
.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}
.table-count {
  font-size: 0.8125rem;
  color: #aaa;
}

/* ── KPIs ─────────────────────────────────────────── */
.kpi-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.kpi-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  flex: 1;
  min-width: 160px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.kpi-card.highlight { border-left: 4px solid #C62424; }

.kpi-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}
.kpi-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
  margin-bottom: 0.3rem;
}
.kpi-sub {
  display: block;
  font-size: 0.75rem;
  color: #bbb;
}

/* ── Filters ──────────────────────────────────────── */
.filter-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.filter-tag {
  padding: 0.375rem 1.125rem;
  border-radius: 20px;
  border: 1.5px solid #e0e0e0;
  background: #fff;
  color: #555;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'Montserrat', sans-serif;
}
.filter-tag:hover { border-color: #C62424; color: #C62424; }
.filter-tag.tag-selected { background: #C62424; border-color: #C62424; color: #fff; }

.date-input {
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  border: 1.5px solid #e0e0e0;
  font-size: 0.8125rem;
  font-family: 'Montserrat', sans-serif;
  color: #333;
  background: #fff;
}
.date-sep { font-size: 0.8125rem; color: #888; }

/* ── Charts ───────────────────────────────────────── */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}
.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.chart-heading {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.25rem;
}

/* ── Brazil Map ───────────────────────────────────── */
.map-wrapper {
  position: relative;
  user-select: none;
}
.brazil-svg {
  width: 100%;
  height: auto;
  display: block;
}
.state-path {
  cursor: pointer;
  transition: opacity 0.12s;
}
.state-path:hover { opacity: 0.75; }

.map-tooltip {
  position: absolute;
  background: #1a1a1a;
  color: #fff;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  pointer-events: none;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.tooltip-state { font-weight: 600; margin-bottom: 0.1rem; }
.tooltip-count { color: #ccc; }

.map-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.875rem;
  font-size: 0.75rem;
  color: #999;
}
.legend-gradient {
  flex: 1;
  height: 7px;
  border-radius: 4px;
  background: linear-gradient(to right, #ffd5d5, #C62424);
}
.legend-label { min-width: 20px; }

/* ── Table ────────────────────────────────────────── */
.table-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  overflow: hidden;
}
.clients-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.clients-table thead th {
  padding: 0.875rem 1.25rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}
.clients-table tbody tr { border-bottom: 1px solid #f5f5f5; transition: background 0.1s; }
.clients-table tbody tr:last-child { border-bottom: none; }
.clients-table tbody tr:hover { background: #fafafa; }
.clients-table tbody td { padding: 0.875rem 1.25rem; color: #333; }

.client-name  { font-weight: 500; }
.client-email { color: #999; font-size: 0.8125rem; }
.text-center  { text-align: center; }

.state-badge {
  display: inline-block;
  background: #f2f2f2;
  color: #555;
  border-radius: 4px;
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
}

/* ── Pagination ───────────────────────────────────── */
.pagination-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  border-top: 1px solid #f0f0f0;
}
.page-info { font-size: 0.8125rem; color: #aaa; }
.page-controls { display: flex; gap: 0.25rem; }

.page-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #555;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.1s;
  font-family: 'Montserrat', sans-serif;
}
.page-btn:hover:not(:disabled) { border-color: #C62424; color: #C62424; }
.page-btn.page-active { background: #C62424; border-color: #C62424; color: #fff; }
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── Loading bar ──────────────────────────────────── */
.loading-bar {
  height: 3px;
  background: linear-gradient(90deg, #C62424 0%, #ff6b6b 50%, #C62424 100%);
  background-size: 200% 100%;
  animation: loading-slide 1.2s ease-in-out infinite;
  position: sticky;
  top: 49px;
  z-index: 19;
}
@keyframes loading-slide {
  0%   { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* ── Misc ─────────────────────────────────────────── */
.brand {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
}

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 900px) {
  .charts-grid { grid-template-columns: 1fr; }
  .kpi-row { flex-direction: column; }
  .dash-body { padding: 1.25rem 1rem 3rem; }
}
</style>
