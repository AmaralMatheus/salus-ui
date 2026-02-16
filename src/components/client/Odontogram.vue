<template>
  <v-card v-if="!loading" title="Odontograma">
    <v-card-text>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item
          :key="1"
          :value="1"
        >
          <div class="d-flex flex-column">
            <div class="d-flex justify-space-between align-baseline">
              <v-menu
                class="cursor-pointer"
                v-for="tooth in toothObjectUp" :key="tooth.id"
                :close-on-content-click="false"
                open-on-hover
              >
                <template v-slot:activator="{props}">
                  <div class="d-flex flex-column" v-bind="props">
                    <div class="text-disabled text-caption">{{ teethNumber[tooth.type] }}</div>
                    <div class="tooth d-flex">
                      <img style="position: absolute" class="tooth mx-auto cursor-pointer" :class="!tooth.status ? '' : 'tooth-extracted'" :src="require('../../assets/Vector-'+tooth.type+'.svg')"/>
                      <img v-if="tooth.status?.name === 'Extraído'" class="my-auto mx-auto cross" src="../../assets/cross.svg"/>
                    </div>
                  </div>
                </template>

                <v-list :class="this.currentUser ? '' : 'hidden'">
                  <v-list-item>
                    <div class="text-h6">Status do dente: {{ tooth.status ? tooth.status.name : 'Saudável' }}</div>
                  </v-list-item>
                  <v-list-item>
                    <v-select
                      density="compact"
                      label="Alterar estado do dente"
                      :items="teethStatuses"
                      item-title="name"
                      return-object
                      :loading="loadingTeeth"
                      @update:modelValue="updateToothStatus($event, tooth)"
                      item-value="id"
                    ></v-select>
                    <div class="text-h6">Evoluções relacionadas</div>
                    <div v-for="evolution in tooth.evolutions" class="d-flex justify-space-between" :key="evolution.id">
                      <div v-html="evolution.description"></div>
                      <div class="ml-3">{{ getDateTime(evolution.created_at) }}</div>
                    </div>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>
          <v-divider :content-offset="[20, -5.5]" variant="dashed" :thickness="2" class="my-3"></v-divider>
          <div class="d-flex flex-column ga-3">
            <div class="d-flex justify-space-between align-baseline">
              <v-menu
                class="cursor-pointer"
                v-for="tooth in toothObjectDown" :key="tooth.id"
                :close-on-content-click="false"
                open-on-hover
              >
                <template v-slot:activator="{props}">
                  <div class="d-flex flex-column" v-bind="props">
                    <div class="tooth d-flex">
                      <img style="position: absolute" class="tooth mx-auto cursor-pointer" :class="!tooth.status ? '' : 'tooth-extracted'" :src="require('../../assets/Vector-'+tooth.type+'.svg')"/>
                      <img v-if="tooth.status?.name === 'Extraído'" class="mx-auto cross" src="../../assets/cross.svg"/>
                    </div>
                    <div class="text-disabled text-caption">{{ teethNumber[tooth.type] }}</div>
                  </div>
                </template>

                <v-list>
                  <v-list-item>
                    <div class="text-h6">Status do dente: {{ tooth.status ? tooth.status.name : 'Saudável' }}</div>
                  </v-list-item>
                  <v-list-item>
                    <v-select
                      density="compact"
                      label="Alterar estado do dente"
                      :items="teethStatuses"
                      item-title="name"
                      return-object
                      @update:modelValue="updateToothStatus($event, tooth)"
                      item-value="id"
                    ></v-select>
                    <div class="text-h6">Evoluções relacionadas</div>
                    <div v-for="evolution in tooth.evolutions" class="d-flex justify-space-between" :key="evolution.id">
                      <div v-html="evolution.description"></div>
                      <div class="ml-3">{{ getDateTime(evolution.created_at) }}</div>
                    </div>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
      <!-- <v-tabs
        v-model="tab"
        color="primary"
        align-tabs="center"
        class="mt-2"
      >
        <v-tab :value="1">Permanentes</v-tab>
        <v-tab :value="2">Desiduos</v-tab>
      </v-tabs> -->
    </v-card-text>
  </v-card>
</template>

<script>
  import { format, parseISO, differenceInYears } from 'date-fns'
  import statusService from '../../services/company.service'

  export default {
    computed: {
      id() {
        return this.$route.params.id
      },
      currentUser() {
        return this.$store.state.auth.user
      },
      toothObjectUp() {
        return [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map((toothType) => {
          return this.client.teeth.filter((tooth) => tooth.type === toothType)[0] || {
            type: toothType,
            status: null
          }
        })
      },
      toothObjectDown() {
        return [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map((toothType) => {
          return this.client.teeth.filter((tooth) => tooth.type === toothType)[0] || {
            type: toothType,
            status: null
          }
        })
      }
    },
    props: ['loading', 'client'],
    data () {
      return {
        format,
        parseISO,
        tab: 1,
        teethStatuses: [],
        teethNumber: [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38],
        teeth: [],
        loadingTeeth: false,
      }
    },
    created() {
      statusService.getAllTeethStatus(this.currentUser ? this.currentUser.company_id : this.client.company_id).then((response) => {
        this.teethStatuses = response.data
      })
    },
    methods: {
      updateToothStatus(status, tooth) {
        this.loadingTeeth = true
        const createTooth = {
          status: status,
          type: tooth.type,
          id: tooth.id,
          client_id: this.client.id
        }
        if (this.client.teeth.filter((t) => t.type === tooth.type).length  === 0) {
          this.client.teeth.push(createTooth)
        } else {
          this.client.teeth.map((t) => {
            if (t.type === tooth.type) {
              t.status = status
            }
          })
        }
        clientService.updateToothStatus(createTooth).then((response) => {
          toast.success(response.data.message)
        },
        (error) => {
          this.loading = false
          toast.error((error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                  error.message ||
                  error.toString())
        }).finally(() => {
          this.loadingTeeth = false
        })
      },
      getDateTime(date) {
        return format(parseISO(date), 'dd/MM/yyyy kk:mm')
      },
    }
  }
</script>

<style>
.tooth-healthy {
  filter: invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%);
}

.tooth-sick {
  filter: invert(42%) sepia(93%) saturate(1352%) hue-rotate(16.4deg) brightness(119%) contrast(119%);
}

.tooth-extracted {
  filter: invert(42%) sepia(90%) saturate(1952%) hue-rotate(320.4deg) brightness(89%) contrast(119%);
}

.custom-height {
  height: 1000px !important;
}

.tooth {
  height: 60px;
  width: 25px;
}

.cross {
  z-index: 1;
}
</style>