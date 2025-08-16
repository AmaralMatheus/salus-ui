<template>
  <v-row>
    <v-col cols="12" sm="6" md="7" lg="8">
      <v-card v-if="!loading" title="Odontograma">
        <v-card-text>
          <v-tabs-window v-model="tab">
            <v-tabs-window-item
              :key="1"
              :value="1"
            >
              <div class="d-flex flex-column ga-3">
                <div class="d-flex justify-space-between align-baseline">
                  <v-menu
                    class="cursor-pointer"
                    v-for="tooth in client.teeth.filter((t) => t.type < 16)" :key="tooth.id"
                    :close-on-content-click="false"
                    open-on-hover
                  >
                    <template v-slot:activator="{props}">
                      <div class="d-flex flex-column" v-bind="props">
                        <div class="text-disabled text-caption">{{ teethNumber[tooth.type] }}</div>
                        <img class="cursor-pointer" :class="!tooth.status ? '' : 'tooth-extracted'" :src="require('../../assets/Vector-'+tooth.type+'.svg')"/>
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
              <div class="d-flex flex-column ga-3">
                <div class="d-flex justify-space-between align-baseline">
                  <v-menu
                    class="cursor-pointer"
                    v-for="tooth in client.teeth.filter((t) => t.type < 32 && t.type > 15)" :key="tooth.id"
                    :close-on-content-click="false"
                    open-on-hover
                  >
                    <template v-slot:activator="{props}">
                      <div class="d-flex flex-column" v-bind="props">
                        <div class="text-disabled text-caption">{{ teethNumber[tooth.type] }}</div>
                        <img class="cursor-pointer" :class="!tooth.status ? '' : 'tooth-extracted'" :src="require('../../assets/Vector-'+tooth.type+'.svg')"/>
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
      <v-skeleton-loader
        v-if="loading"
        class="mx-auto border"
        type="article"
      ></v-skeleton-loader>
      <div class="d-flex mt-6">
        <v-btn v-if="!loading" @click="descriptionDialog = true; description = ''; descriptionAction = 'evolutions'" class="ma-auto mb-6">Adicionar Evolução</v-btn>
      </div>
      <div v-if="client.evolutions && client.evolutions.length < 1" class="d-flex ma-auto" style="width: max-content">
        Não há evoluções cadastradas!
      </div>
      <div v-if="!loading" class="d-flex flex-column ga-6">
        <v-card v-for="evolution in client.evolutions" :key="evolution.id">
          <v-card-text>
            <div class="mx-5" v-html="evolution.description"></div>
            <v-divider class="my-3"/>
            <div class="d-flex flex-column align-baseline">
              <div class="d-flex ml-auto ga-2 align-baseline">
                <div>Dr. {{evolution.user.name}}</div>
                <div class="text-medium-emphasis">CRO {{ evolution.user.cro }}</div>
              </div>
              <div class="ml-auto text-medium-emphasis">
                <div>{{ getDateTime(evolution.created_at) }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
      <v-dialog
        v-model="dialog"
        width="auto"
      >
        <v-card
          max-width="400"
          prepend-icon="mdi-alert"
          text="Esses dados não podem ser restaurados"
          title="Deseja excluir esse paciente?"
        >
          <template v-slot:actions>
            <v-btn
              class="ms-auto"
              text="Cancelar"
              :disabled="loading"
              @click="dialog = false"
            ></v-btn>
            <v-btn
              text="Excluir"
              color="error"
              :disabled="loading"
              :loading="loading"
              @click="remove"
            ></v-btn>
          </template>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="prescriptionDeleteDialog"
        width="auto"
      >
        <v-card
          max-width="400"
          prepend-icon="mdi-alert"
          text="Esses dados não podem ser restaurados"
          title="Deseja excluir essa receita?"
        >
          <template v-slot:actions>
            <v-btn
              class="ms-auto"
              text="Cancelar"
              :disabled="loading"
              @click="prescriptionDeleteDialog = false"
            ></v-btn>
            <v-btn
              text="Excluir"
              color="error"
              :disabled="loading"
              :loading="loading"
              @click="removePrescripiton"
            ></v-btn>
          </template>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="planDeleteDialog"
        width="auto"
      >
        <v-card
          max-width="400"
          prepend-icon="mdi-alert"
          text="Esses dados não podem ser restaurados"
          title="Deseja excluir esse plano?"
        >
          <template v-slot:actions>
            <v-btn
              class="ms-auto"
              text="Cancelar"
              :disabled="loading"
              @click="planDeleteDialog = false"
            ></v-btn>
            <v-btn
              text="Excluir"
              color="error"
              :disabled="loading"
              :loading="loading"
              @click="removePlan"
            ></v-btn>
          </template>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="imageDeleteDialog"
        width="auto"
      >
        <v-card
          max-width="400"
          prepend-icon="mdi-alert"
          text="Essa imagem não pode ser restaurada"
          title="Deseja excluir essa imagem?"
        >
          <template v-slot:actions>
            <v-btn
              class="ms-auto"
              text="Cancelar"
              :disabled="loading"
              @click="imageDeleteDialog = false"
            ></v-btn>
            <v-btn
              text="Excluir"
              color="error"
              :disabled="deleteImageLoading"
              :loading="deleteImageLoading"
              @click="removeImage"
            ></v-btn>
          </template>
        </v-card>
      </v-dialog>
      <v-dialog
        max-width="600"
        v-model="prescriptionDialog"
      >
        <v-card
          prepend-icon="mdi-text"
          title="Receitas"
        >
          <v-card-text>
            <v-data-table-virtual
              v-model:items-per-page="itemsPerPage"
              :headers="headers"
              :items="client.prescriptions"
              :items-length="client.prescriptions.length"
              item-value="id"
              @click:row="viewPrescription"
            >
              <template v-slot:[`item.created_at`]="{ item }">
                {{ getDateTime(item.created_at) }}
              </template>
            </v-data-table-virtual>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              text="Fechar"
              variant="plain"
              @click="prescriptionDialog = false;"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        max-width="600"
        v-model="planDialog"
      >
        <v-card
          prepend-icon="mdi-text"
          title="Planos"
        >
          <v-card-text>
            <v-data-table-virtual
              :headers="planHeaders"
              :items="client.plans"
              :items-length="client.plans.length"
              @click:row="viewRow"
              item-value="id"
            >
              <template v-slot:[`item.description`]="{ item }">
                <div v-html="item.description"></div>
              </template>
              <template v-slot:[`item.created_at`]="{ item }">
                {{ getDateTime(item.created_at) }}
              </template>
            </v-data-table-virtual>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              text="Fechar"
              variant="plain"
              @click="planDialog = false;"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        max-width="600"
        v-model="addImageDialog"
      >
        <v-card
          prepend-icon="mdi-image-outline"
          title="Adicionar Imagens"
        >
          <v-card-text>
            <v-file-input prepend-icon="" prepend-inner-icon="mdi-attachment" label="Imagem" density="compact" @update:modelValue="convertToBase64" variant="outlined"></v-file-input>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              text="Fechar"
              variant="plain"
              :disabled="imageLoading"
              @click="addImageDialog = false;"
            ></v-btn>
            <v-btn
              text="Salvar"
              variant="plain"
              color="primary"
              :disabled="imageLoading || !image"
              :loading="loading"
              @click="saveImage"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        max-width="1200"
        v-model="imageDialog"
      >
        <v-card
          prepend-icon="mdi-image-outline"
          title="Imagens"
        >
          <v-card-text>
            <v-carousel
              class="rounded"
              show-arrows="hover"
              cycle
              v-if="client.images.length > 0"
              hide-delimiter-background
            >
              <v-carousel-item
                v-for="image in client.images" :key="image"
              >
                <v-sheet class="h-100">
                  <div class="d-flex h-100">
                    <img :src="image.path" id="box" class="ma-auto" width="100%" height="100%" />
                  </div>
                  <v-btn
                    id="overlay"
                    text="tESTE"
                    icon="mdi-delete"
                    density="confortable"
                    color="primary"
                    variant="text"
                    @click="imageDeleteDialog = true; selectedImage = image.id"
                  ></v-btn>
                </v-sheet>
              </v-carousel-item>
            </v-carousel>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              text="Fechar"
              variant="plain"
              @click="imageDialog = false;"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
		<v-col cols="12" sm="6" md="5" lg="4">
      <v-card v-if="!loading" :loading="loading">
        <v-card-title>
          <div class="d-flex ga-2 align-center">
            <h4 class="text-h6">{{ client.name }}</h4>
            <div class="d-flex ga-2 ml-auto">
              <v-btn size="small" icon="mdi-calendar-outline" @click="schedulerDialog = true" color="info" variant="tonal" density="comfortable"/>
              <v-btn size="small" icon="mdi-pencil" @click="update" color="warning" variant="tonal" density="comfortable"/>
              <v-btn size="small" icon="mdi-delete" @click="dialog = true" color="error" variant="tonal" density="comfortable"/>
            </div>
          </div>
        </v-card-title>
        <v-card-subtitle v-if="client.status" class="text-medium-emphasis">
          {{ client.status.name }}
        </v-card-subtitle>
        <v-card-text>
          <div v-if="!loading" class="d-flex flex-column ga-6">
            <v-avatar color="surface-variant ma-auto" size="57">
              <v-img :src="client.avatar ?? 'https://ui-avatars.com/api/?name='+client.name.replaceAll(' ', '+') + '&background=random'" cover></v-img>
            </v-avatar>
            <div class="d-flex flex-column profile-card ga-2">
              <div class="d-flex ga-2 align-center" v-if="expanded">
                <v-icon>mdi-gender-male-female-variant</v-icon>
                <div>{{ client.gender === 1 ? 'Homem' : client.gender === 2 ? 'Mulher' : 'Gênero alternativo' }}</div>
              </div>
              <div class="d-flex ga-2 align-center" v-if="expanded">
                <v-icon>mdi-calendar-outline</v-icon>
                <div>{{ client.birthday ? getBirthday(client.birthday) : 'Nenhum aniversário cadastrado' }} {{ client.birthday ? '(' + getAge() + ' Anos)' : '' }}</div>
              </div>
              <div class="d-flex ga-2 align-center">
                <v-icon>mdi-phone-outline</v-icon>
                <div>{{ client.phone ?? 'Nenhum telefone cadastrado' }}</div>
              </div>
              <div class="d-flex ga-2 align-center" v-if="expanded">
                <v-icon>mdi-map-marker-outline</v-icon>
                <div>{{ client.address ?? 'Nenhum endereço cadastrado' }}</div>
              </div>
              <div class="d-flex ga-2 align-center" v-if="expanded">
                <v-icon>mdi-email-outline</v-icon>
                <div>{{ client.email ?? 'Nenhum e-mail cadastrado' }}</div>
              </div>
              <div class="d-flex ga-2 align-center">
                <v-icon>mdi-clock-outline</v-icon>
                <div>{{ client.next_appointment.length > 0 ? 'Próxima consulta dia ' + getDateTime(client.next_appointment[0].date) : 'Sem consultas agendadas' }}</div>
              </div>
              <div @click="expanded = !expanded" class="cursor-pointer text-primary font-weight-bold">{{ !expanded ? 'Ver mais' : 'Ver menos' }}</div>
            </div>
          </div>
        </v-card-text>
        <v-alert v-if="client.comorbities" type="error" variant="tonal" density="comfortable" class="mx-4">{{ client.comorbities }}</v-alert>
        <v-card-title>
          <div class="d-flex ga-2 align-center">
            <h4 class="text-h6">Receitas</h4>
            <div class="d-flex ga-2 ml-auto">
              <v-btn size="small" icon="mdi-plus" @click="descriptionDialog = true;  title = ''; description = ''; descriptionAction = 'prescriptions'" color="primary" variant="tonal" density="comfortable"/>
            </div>
          </div>
        </v-card-title>
        <v-card-text v-if="client.prescriptions && client.prescriptions.length > 0" class="d-flex flex-column ga-3">
          <div v-for="prescription in client.prescriptions" variant="tonal" color="disabled" class="px-3 py-2 d-flex ga-3 justify-space-between align-center text-none bg-surface" :key="prescription.id">
            <div @click="prescriptionView = true; currentPrescription = prescription" class="d-flex justify-space-between w-100">
              <div class="text-error">{{ getDateTime(prescription.created_at) }}</div>
            </div>
            <v-btn size="small" density="comfortable" icon="mdi-delete" @click="prescriptionDeleteDialog = true; selectedPrescription = prescription.id" color="error" variant="text"/>
          </div>
          <div @click="prescriptionDialog = true" class="text-none text-primary cursor-pointer d-flex align-center" >
            Ver todas as receitas
            <v-icon icon="mdi-chevron-right"></v-icon>
          </div>
        </v-card-text>
        <v-card-text v-else class="d-flex flex-column ga-3">
          Não existem receitas cadastradas!
        </v-card-text>
        <v-card-title>
          <div class="d-flex ga-2 align-center">
            <h4 class="text-h6">Planos de Tratamento</h4>
            <div class="d-flex ga-2 ml-auto">
              <v-btn size="small" icon="mdi-plus" @click="descriptionDialog = true; title = ''; newPlan = { name: '', actions: []};  descriptionAction = 'plans'; getProcedures()" color="primary" variant="tonal" density="comfortable"/>
            </div>
          </div>
        </v-card-title>
        <v-card-text v-if="client.plans && client.plans.length > 0" class="d-flex flex-column ga-3">
          <v-hover><div v-for="plan in client.plans" variant="tonal" density="comfortable" color="disabled" class="px-3 py-2 d-flex ga-3 justify-space-between text-none align-center bg-surface cursor-pointer" :key="plan.id">
            <div @click="planView = true; currentPlan = plan" class="d-flex justify-space-between w-100">
              <div class="text-error">{{ getDateTime(plan.created_at) }}</div>
              <div>{{plan.name}}</div>
            </div>
            <v-btn size="small" density="comfortable" icon="mdi-delete" @click="planDeleteDialog = true; selectedPlan = plan.id" color="error" variant="text"/>
          </div></v-hover>
          <div @click="planDialog = true" class="text-none text-primary cursor-pointer d-flex align-center" >
            Ver todos os planos
            <v-icon icon="mdi-chevron-right"></v-icon>
          </div>
        </v-card-text>
        <v-card-text v-else class="d-flex flex-column ga-3">
          Não existem planos cadastrados!
        </v-card-text>
        <v-card-title>
          <div class="d-flex ga-2 align-center">
            <h4 class="text-h6">Imagens</h4>
            <div class="d-flex ga-2 ml-auto">
              <v-btn size="small" icon="mdi-plus" @click="addImageDialog = true" color="primary" variant="tonal" density="comfortable"/>
            </div>
          </div>
        </v-card-title>
        <v-card-text class="d-flex flex-column ga-3">
          <v-carousel
            height="200"
            class="rounded"
            show-arrows="hover"
            cycle
            v-if="client.images.length > 0"
            hide-delimiter-background
          >
            <v-carousel-item
              v-for="image in client.images" :key="image"
            >
              <v-sheet
              >
                <div class="d-flex justify-center align-center">
                  <img width="500" :src="image.path" />
                </div>
              </v-sheet>
            </v-carousel-item>
          </v-carousel>
          <div v-else>Não existem imagens cadastradas</div>
          <div v-if="client.images.length > 0" @click="imageDialog = true" class="text-none text-primary cursor-pointer d-flex align-center">
            Ver todas as imagens
            <v-icon icon="mdi-chevron-right"></v-icon>
          </div>
        </v-card-text>
      </v-card>
      <v-skeleton-loader
        v-else
        class="mx-auto border"
        type="article"
      ></v-skeleton-loader>
    </v-col>
  </v-row>
  <v-dialog
    v-model="schedulerDialog"
    max-width="800"
    width="auto"
  >
    <scheduler :client="this.client" @cancel="schedulerDialog = false" @reload="getClient"/>
  </v-dialog>
  <v-dialog
    v-model="planView"
    width="auto"
  >
    <div>
      <v-card
        :title="'Plano de tratamento ' + (currentPlan.name ?? '')"
      >
        <v-card-text>
          <v-data-table-virtual
            :headers="planActionHeaders"
            :items="currentPlan.actions"
          >
            <template v-slot:[`item.price`]="{ item }">
              {{ item.price.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") }} R$
            </template>
            <template v-slot:[`item.quantity`]="{ item }">
              {{ item.teeth.length }}
            </template>
          </v-data-table-virtual>
        </v-card-text>
        <v-card-actions>
          <div class="ml-2">Total: R$ {{ getTotal().toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") }}</div>
          <v-spacer></v-spacer>
          <v-btn
            text="Fechar"
            variant="plain"
            @click="planView = false"
          ></v-btn>
          <v-btn
            text="Exportar"
            variant="plain"
            color="primary"
            @click="generatePDF"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
  <v-dialog
    v-model="prescriptionView"
    width="auto"
  >
    <v-card width="1000">
      <div ref="pdfContent" class="d-flex flex-column">
        <div class="pb-10" style="border-left: solid 8px rgb(var(--v-theme-primary)); padding: 50px; padding-bottom: 0;">
          <div class="mb-10 d-flex justify-space-between">
            <div>
              <h1>Receituário</h1>
              <p>{{ format(new Date(), 'dd/mm/yyyy') }}</p>
            </div>
            <img width="20" src="/favicon.svg" />
          </div>
          <div class="d-flex ga-3 align-center">
            <h3>Paciente:</h3>
            {{ client.name }}
          </div>
        </div>
        <div style="border-color: red; padding: 50px; padding-top: 0;" class="border-s-xl">
          <div style="height: 500px;" class="pt-10" v-html="currentPrescription.description" />
          <div style="height: 150px;" class="ma-auto text-center">
            ______________________________________________
            <br>
            <b>{{ currentUser.user_name }}</b>
            <br>
            <div class="text-sm">80252 - SP</div>
          </div>
          <div class="ma-auto text-center text-medium-emphasis">
            Rua Arlindo Luz, 825 - Centro - Ourinhos - SP
          </div>
          <div class="ma-auto text-center text-medium-emphasis">
            CEP 87005-005 (44) 99770-3577 
          </div>
          <div class="ma-auto text-center text-medium-emphasis text-caption">
            powered by Dental Salus 
          </div>
        </div>
      </div>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text="Fechar"
          variant="plain"
          @click="prescriptionView = false"
        ></v-btn>
        <v-btn
          text="Exportar"
          variant="plain"
          color="primary"
          @click="generatePDF"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog
    v-model="descriptionDialog"
    width="800"
  >
    <ClientInfoDialog :description-action="descriptionAction" :client="client" @cancel="descriptionDialog = false" @save="descriptionDialog = false;getClient()"/>
  </v-dialog>
  <v-dialog
    v-model="registeringDialog"
    max-width="800"
  >
    <client-register :selectedClient="this.client.id" @cancel="registeringDialog = false" @reload="registeringDialog = false; getClient()"/>
  </v-dialog>
</template>

<script>
  import clientService from '../../services/client.service'
  import companyService from '../../services/company.service'
  import statusService from '../../services/company.service'
  import planService from '../../services/plan.service'
  import { format, parseISO, differenceInYears } from 'date-fns'
  import Scheduler from '../../components/agenda/Scheduler.vue'
  import ClientInfoDialog from '../../components/client/ClientInfoDialog.vue'
  import ClientRegister from '../../components/client/ClientRegister.vue'
  import { toast } from 'vue3-toastify'
  import AWS from '../../services/aws.service'
  import html2pdf from 'html2pdf.js'

  export default {
    computed: {
      id() {
        return this.$route.params.id
      },
      currentUser() {
        return this.$store.state.auth.user
      },
    },
    components: {
      Scheduler,
      ClientInfoDialog,
      ClientRegister,
    },
    data () {
      return {
        format,
        parseISO,
        tab: 1,
        imageLoading: false,
        registeringDialog: false,
        procedures: [],
        expanded: false,
        actionSuggestions: [],
        planForm: false,
        planView: false,
        planDeleteDialog: false,
        imageDeleteDialog: false,
        selectedImage: null,
        deleteImageLoading: false,
        selectedPlan: null,
        selectedPrescription: null,
        prescriptionDeleteDialog: false,
        currentPlan: null,
        currentPrescription: null,
        prescriptionView: false,
        teethStatuses: [],
        newPlan: {
          actions: [],
          name: ''
        },
        teethNumber: [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38],
        schedulerDialog: false,
        addImageDialog: false,
        title: '',
        image: null,
        itemsPerPage: 5,
        teeth: [],
        headers: [
          { title: 'Data', key: 'created_at', align: 'start' },
        ],
        planHeaders: [
          {
            title: 'Título',
            align: 'start',
            sortable: true,
            key: 'name',
          },
          { title: 'Data', key: 'created_at', align: 'end' },
        ],
        planActionHeaders: [
          {
            title: 'Procedimento',
            align: 'start',
            sortable: true,
            key: 'description',
          },
          { title: 'Quantidade', key: 'quantity', align: 'end' },
          { title: 'Preço', key: 'price', align: 'end' },
        ],
        planDialog: false,
        prescriptionDialog: false,
        imageDialog: false,
        loadingTeeth: false,
        descriptionAction: '',
        dialog: false,
        descriptionDialog: false,
        description: '',
        loading: false,
        client: {},
        rules: [
          value => {
            if (value) return true
            return 'Este campo não pode estar vazio.'
          },
        ],
        colors: [
          'indigo',
          'warning',
          'pink darken-2',
          'red lighten-1',
          'deep-purple accent-4',
        ],
        slides: [
          'First',
          'Second',
          'Third',
          'Fourth',
          'Fifth',
        ],
      }
    },
    created() {
      this.getClient()
    },
    methods: {
      getTotal() {
        let total = 0
        this.currentPlan.actions.forEach((action) => {
          total += action.price * action.teeth.length
        })
        return total
      },
      async getClient() {
        this.loading = true
        await clientService.getClient(this.id).then((response) => {
          if (response.data.birthday) {
            response.data.birthday = new Date(response.data.birthday)
          }
          this.client = response.data
          this.$store.dispatch('auth/updateEntityName', this.client.name)
        })
        statusService.getAllTeethStatus(this.currentUser.company_id).then((response) => {
          this.teethStatuses = response.data
          this.loading = false
        })
      },
      remove () {
        this.loading = true
        clientService.deleteClient(this.id).then(() => {
          this.dialog = false
          this.$router.push('/pacientes')
        },
          (error) => {
            this.loading = false
            toast.error((error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                  error.message ||
                  error.toString())
          })
      },
      removePlan() {
        this.loading = true
        planService.deletePlan(this.selectedPlan).then(() => {
          this.planDeleteDialog = false
          this.getClient()
        },
          (error) => {
            this.loading = false
            toast.error((error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                  error.message ||
                  error.toString())
          })
      },
      removeImage() {
        this.deleteImageLoading = true
        clientService.deleteImage(this.selectedImage).then(() => {
          this.imageDeleteDialog = false
          this.deleteImageLoading = false
          this.getClient()
        },
          (error) => {
            this.deleteImageLoading = false
            toast.error((error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                  error.message ||
                  error.toString())
          })
      },
      removePrescripiton() {
        this.loading = true
        clientService.deletePrescription(this.selectedPrescription).then(() => {
          this.prescriptionDeleteDialog = false
          this.getClient()
        },
          (error) => {
            this.loading = false
            toast.error((error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                  error.message ||
                  error.toString())
          })
      },
      update () {
        this.registeringDialog = true
      },
      getToothStatus(status) {
        switch (status) {
          case 0:
            return 'Saudável'
          case 1:
            return 'Em tratamento'
          case 2:
            return 'Extraído'
        }
      },
      updateToothStatus(status, tooth) {
        this.loadingTeeth = true
        clientService.updateToothStatus(tooth.id, {status: status.id}).then((response) => {
          tooth.status = status
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
      getBirthday(date) {
        return format(date, 'dd/MM/yyyy')
      },
      viewRow (event, row) {
        this.planView = true
        this.currentPlan = row.item
      },
      viewPrescription (event, row) {
        this.prescriptionView = true
        this.currentPrescription = row.item
      },
      getAge() {
        return differenceInYears(new Date(), this.client.birthday)
      },
      getProcedures() {
        companyService.getAllProcedures().then((response) => {
          this.procedures = response.data
        })
      },
      setProcedure(event, element) {
        console.log(event)
        if(typeof event === 'object') {
          element.price = event.price
          element.description = event.name
        }
      },
      async convertToBase64(file) {
        this.imageLoading = true
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          this.image = file
        }
        console.log(file)
        this.file = file;
        const params = {
          Bucket: 'dental-salus',
          Key: this.file.name,
          Body: this.file,
          ContentType: this.file.type
        }
  
        const data = await AWS.upload(params).promise()
        this.client.images.push({path: data.Location})
        this.image = data.Location
        this.imageLoading = false
      },
      generatePDF() {
        const doc = this.$refs.pdfContent
        const options = {
          filename: `receita.pdf`,
          html2canvas: {
            dpi: 192,
            scale:4,
            letterRendering: true,
            useCORS: true
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }
        html2pdf(doc, options)
      },
      async saveImage() {
        this.imageLoading = true
        const data = {
          image: this.image,
          client: this.id
        }
        clientService.saveImage(data).then(() => {
          this.addImageDialog = false
          this.imageLoading = null
          this.image = null
          this.$emit('save')
        },
        (error) => {
          this.loading = false
          toast.error((error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                  error.message ||
                  error.toString())
        })
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

.profile-card {
  transition: ease-in-out 0.2s !important;
}

#box{
    position:relative;
    width: auto;
    height: auto;
    margin: auto;
}
#overlay{
    position:absolute;
    top:0px;
    width: 50px;
    height: 50px;
    color: white;
}
</style>
