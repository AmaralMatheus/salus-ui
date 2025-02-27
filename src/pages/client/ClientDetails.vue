<template>
  <v-row>
    <v-col cols="12" sm="6" md="7" lg="8">
      <v-card v-if="!descriptionDialog && !loading" title="Odontograma">
        <v-card-text>
          <div class="d-flex flex-column ga-3">
            <div class="d-flex justify-space-between align-baseline">
              <div v-for="tooth in [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]" class="d-flex flex-column" :key="tooth">
                  <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
                  <img class="cursor-pointer" @click="updateToothStatus(tooth)" :class="client.teeth[tooth].status === 1 ? 'tooth-extracted' : ''" :src="require('../../assets/Vector-'+tooth+'.svg')"/>
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    :width="client.teeth[tooth].evolutions.length > 0 ? '600' : ''"
                  >{{ getToothStatus(client.teeth[tooth].status) }}
                    <div v-for="evolution in client.teeth[tooth].evolutions" class="d-flex justify-space-between" :key="evolution.id">
                      <div>{{ evolution.description }}</div>
                      <div>{{ getDateTime(evolution.created_at) }}</div>
                    </div>
                  </v-tooltip>
              </div>
            </div>
            <div class="d-flex justify-space-between">
              <div v-for="tooth in [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]" class="d-flex flex-column" :key="tooth">
                  <img class="cursor-pointer" @click="updateToothStatus(tooth)" :class="client.teeth[tooth].status === 1 ? 'tooth-extracted' : ''" :src="require('../../assets/Vector-'+tooth+'.svg')"/>
                  <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
                  <v-tooltip
                    activator="parent"
                    location="bottom"
                    :width="client.teeth[tooth].evolutions.length > 0 ? '600' : ''"
                  >{{ getToothStatus(client.teeth[tooth].status) }}
                    <div v-for="evolution in client.teeth[tooth].evolutions" class="d-flex justify-space-between" :key="evolution.id">
                      <div>{{ evolution.description }}</div>
                      <div>{{ getDateTime(evolution.created_at) }}</div>
                    </div>
                  </v-tooltip>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
      <v-card
        v-else-if="descriptionDialog && !loading"
        :title="'Adicionar ' +  (descriptionAction === 'evolutions' ? 'Evolução' : descriptionAction === 'plans' ? 'Plano' : 'Receita')"
      >
        <v-card-text  v-if="descriptionAction === 'evolutions' || descriptionAction === 'prescriptions'">
          <div class="d-flex flex-column ga-3 mb-3" v-if="descriptionAction === 'evolutions'">
            <div class="d-flex justify-space-between align-baseline">
              <div v-for="tooth in [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]" class="d-flex flex-column" :key="tooth">
                <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
                <img class="cursor-pointer" @click="teeth.push(tooth)" :class="teeth.includes(tooth) ? 'tooth-extracted': ''" :src="require('../../assets/Vector-'+tooth+'.svg')"/>
              </div>
            </div>
            <div class="d-flex justify-space-between">
              <div v-for="tooth in [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]" class="d-flex flex-column" :key="tooth">
                <img class="cursor-pointer" @click="teeth.push(tooth)" :class="teeth.includes(tooth) ? 'tooth-extracted': ''" :src="require('../../assets/Vector-'+tooth+'.svg')"/>
                <div class="text-disabled text-caption">{{ teethNumber[tooth] }}</div>
              </div>
            </div>
          </div>
          <v-row dense >
            <v-col cols="12">
              <v-text-field
                v-if="descriptionAction !== 'evolutions'"
                label="Título"
                required
                :disabled="loading"
                variant="outlined"
                density="compact"
                v-model="title"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <quill-editor style="height:200px" placeholder="Descrição" contentType="html" v-model:content="description" theme="snow"></quill-editor>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text v-else :class="newPlan.actions.length === 0 ? 'pb-0' : ''">
          <v-form v-model="planForm">
            <v-text-field
              label="Título"
              :rules="rules"
              :disabled="loading"
              variant="outlined"
              density="compact"
              v-model="title"
            ></v-text-field>
            <div class="text-center" v-if="newPlan.actions.length === 0">Cadastre os procedimentos para este plano de tratamento!</div>
            <draggable 
              v-model="newPlan.actions"
              v-if="!loading"
              @start="drag=true" 
              @end="drag=false" 
              item-key="order">
              <!-- the row will go here -->
               
              <template #item="{element}">
                <v-row dense>
                  <v-col class="d-flex ga-2" cols="12" sm="6" md="6">
                    <v-btn size="small" icon="mdi-delete" @click="newPlan.actions = newPlan.actions.filter((action) => action !== element)" color="error" variant="plain"/>
                    <v-combobox
                      :items="procedures"
                      item-title="name"
                      item-value="name"
                      :rules="rules"
                      v-model="element.description"
                      :loading="loading"
                      :disabled="loading"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      @update:modelValue="setProcedure($event, element)"
                      label="Peocedimento">
                    </v-combobox>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <CurrencyInput v-model="element.price"></CurrencyInput>
                  </v-col>
                  <v-col cols="12" sm="6" md="2">
                    <v-text-field
                      label="Quantidade"
                      :rules="rules"
                      hide-details="auto"
                      :disabled="loading"
                      variant="outlined"
                      density="compact"
                      type="number"
                      v-model="element.quantity"
                    ></v-text-field>  
                  </v-col>
                </v-row>
              </template>
            </draggable>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn
            text="Adicionar Procedimento"
            v-if="descriptionAction === 'plans'"
            variant="plain"
            @click="newPlan.actions.push({price: 0, description: '', quantity: null, order: newPlan.actions.length})"
          ></v-btn>
          <v-spacer></v-spacer>
          <v-btn
            text="Cancelar"
            variant="plain"
            @click="descriptionDialog = false; description = '', teeth = []"
          ></v-btn>

          <v-btn
            color="primary"
            text="Salvar"
            variant="tonal"
            :disabled="loading || (descriptionAction === 'evolutions' && !description) || (descriptionAction === 'plans' && !planForm) || (descriptionAction === 'prescriptions' && (!description || title === '' || (!description && title === '')))"
            :loading="loading"
            @click="saveDescription"
          ></v-btn>
        </v-card-actions>
      </v-card>
      <v-skeleton-loader
        v-if="loading"
        class="mx-auto border"
        type="article"
      ></v-skeleton-loader>
      <div class="d-flex mt-6">
        <v-btn v-if="!loading && !descriptionDialog" @click="descriptionDialog = true; description = ''; descriptionAction = 'evolutions'" class="ma-auto mb-6">Adicionar Evolução</v-btn>
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
          title="Deseja excluir esse cliente?"
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
        max-width="600"
        v-model="prescriptionDialog"
      >
        <v-card
          prepend-icon="mdi-text"
          title="Receitas"
        >
          <v-card-text>
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              :headers="headers"
              :items="client.prescriptions"
              :items-length="client.prescriptions.length"
              item-value="id"
            >
              <template v-slot:[`item.description`]="{ item }">
                <div v-html="item.description"></div>
              </template>
              <template v-slot:[`item.created_at`]="{ item }">
                {{ getDateTime(item.created_at) }}
              </template>
            </v-data-table-server>
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
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
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
            </v-data-table-server>
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
              :disabled="loading"
              @click="addImageDialog = false;"
            ></v-btn>
            <v-btn
              text="Salvar"
              variant="plain"
              color="primary"
              :disabled="loading || !image"
              :loading="loading"
              @click="saveImage"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        max-width="600"
        v-model="imageDialog"
      >
        <v-card
          prepend-icon="mdi-image-outline"
          title="Imagens"
        >
          <v-card-text>
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
                  height="100%"
                >
                  <div class="d-flex fill-height justify-center align-center">
                    <div class="text-h2">
                      <img :src="image.path" />
                    </div>
                  </div>
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
              <v-btn size="small" icon="mdi-calendar-outline" @click="schedulerDialog = true" color="info" variant="tonal"/>
              <v-btn size="small" icon="mdi-pencil" @click="update" color="warning" variant="tonal"/>
              <v-btn size="small" icon="mdi-delete" @click="dialog = true" color="error" variant="tonal"/>
            </div>
          </div>
        </v-card-title>
        <v-card-subtitle class="text-medium-emphasis">
          {{ getStatusType(client.status) }}
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
              <div class="d-flex ga-2 align-center" v-if="expanded">
                <v-icon>mdi-alert-outline</v-icon>
                <div>{{ client.comorbities ?? 'Nenhum alerta de segurança de saúde' }}</div>
              </div>
              <div class="d-flex ga-2 align-center">
                <v-icon>mdi-clock-outline</v-icon>
                <div>{{ client.next_appointment.length > 0 ? 'Próxima consulta dia ' + getDateTime(client.next_appointment[0].date) : 'Sem consultas agendadas' }}</div>
              </div>
              <div @click="expanded = !expanded" class="cursor-pointer text-primary font-weight-bold">{{ !expanded ? 'Ver mais' : 'Ver menos' }}</div>
            </div>
          </div>
        </v-card-text>

        <v-card-title>
          <div class="d-flex ga-2 align-center">
            <h4 class="text-h6">Receitas</h4>
            <div class="d-flex ga-2 ml-auto">
              <v-btn size="small" icon="mdi-plus" @click="descriptionDialog = true;  title = ''; description = ''; descriptionAction = 'prescriptions'" color="primary" variant="tonal"/>
            </div>
          </div>
        </v-card-title>
        <v-card-text v-if="client.prescriptions && client.prescriptions.length > 0" class="d-flex flex-column ga-3">
          <div v-for="prescription in client.prescriptions" variant="tonal" color="disabled" class="px-3 py-2 d-flex ga-3 justify-space-between align-center text-none bg-surface" :key="prescription.id">
            <div class="text-error">{{ getDateTime(prescription.created_at) }}</div>
            <div>{{prescription.title}}</div>
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
              <v-btn size="small" icon="mdi-plus" @click="descriptionDialog = true; title = ''; newPlan = { name: '', actions: []};  descriptionAction = 'plans'; getProcedures()" color="primary" variant="tonal"/>
            </div>
          </div>
        </v-card-title>
        <v-card-text v-if="client.plans && client.plans.length > 0" class="d-flex flex-column ga-3">
          <div v-for="plan in client.plans" variant="tonal" color="disabled" class="px-3 py-2 d-flex ga-3 justify-space-between text-none align-center bg-surface cursor-pointer" :key="plan.id">
            <div @click="planView = true; currentPlan = plan" class="d-flex justify-space-between w-100">
              <div class="text-error">{{ getDateTime(plan.created_at) }}</div>
              <div>{{plan.name}}</div>
            </div>
            <v-btn size="small" density="comfortable" icon="mdi-delete" @click="planDeleteDialog = true; selectedPlan = plan.id" color="error" variant="text"/>
          </div>
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
              <v-btn size="small" icon="mdi-plus" @click="addImageDialog = true" color="primary" variant="tonal"/>
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
                height="100%"
              >
                <div class="d-flex fill-height justify-center align-center">
                  <div class="text-h2">
                    <img :src="image.path" />
                  </div>
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
    <v-card
      width="600"
      :title="'Plano de tratamento ' + currentPlan.name"
    >
      <v-card-text>
        <v-row>
          <v-col class="pa-1" cols="6"><div class="px-2 ma-0">Atividade</div></v-col>
          <v-col class="pa-1" cols="3"><div class="px-2 ma-0">Quantidade</div></v-col>
          <v-col class="pa-1" cols="3"><div class="px-2 ma-0">Preço</div></v-col>
        </v-row>
        <v-row v-for="action in currentPlan.actions" :key="action">
          <v-col class="pa-1" cols="6"><div class="bg-grey-lighten-3 pa-2 ma-0">{{ action.description }}</div></v-col>
          <v-col class="pa-1" cols="3"><div class="bg-grey-lighten-3 pa-2 ma-0">{{ action.quantity }}</div></v-col>
          <v-col class="pa-1" cols="3"><div class="bg-grey-lighten-3 pa-2 ma-0">{{ action.price.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") }} R$</div></v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <div class="ml-2">Total: R$ {{ getTotal().toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") }}</div>
        <v-spacer></v-spacer>
        <v-btn
          text="Fechar"
          variant="plain"
          @click="planView = false"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import clientService from '../../services/client.service'
  import companyService from '../../services/company.service'
  import { format, parseISO, differenceInYears } from 'date-fns'
  import Scheduler from '../../components/Scheduler.vue'
  import { QuillEditor } from '@vueup/vue-quill'
  import '@vueup/vue-quill/dist/vue-quill.snow.css'
  import CurrencyInput from '../../components/CurrencyInput.vue'
  import draggable from 'vuedraggable'
  import { toast } from 'vue3-toastify'

  export default {
    computed: {
      id() {
        return this.$route.params.id
      },
    },
    components: {
      Scheduler,
      QuillEditor,
      CurrencyInput,
      draggable
    },
    data () {
      return {
        format,
        parseISO,
        procedures: [],
        expanded: false,
        actionSuggestions: [],
        planForm: false,
        planView: false,
        planDeleteDialog: false,
        selectedPlan: null,
        selectedPrescription: null,
        prescriptionDeleteDialog: false,
        currentPlan: null,
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
          {
            title: 'Receita',
            align: 'start',
            sortable: true,
            key: 'description',
          },
          { title: 'Data', key: 'created_at', align: 'end' },
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
        planDialog: false,
        prescriptionDialog: false,
        imageDialog: false,
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
          total += action.price * action.quantity
        })
        return total
      },
      getClient() {
        this.loading = true
        clientService.getClient(this.id).then((response) => {
          if (response.data.birthday) {
            response.data.birthday = new Date(response.data.birthday)
          }
          this.client = response.data
          this.$store.dispatch('auth/updateEntityName', this.client.name)
          this.loading = false
        })
      },
      remove () {
        this.loading = true
        clientService.deleteClient(this.id).then(() => {
          this.dialog = false
          this.$router.push('/clientes')
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
        clientService.deletePlan(this.selectedPlan).then(() => {
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
        this.$router.push({
          name: 'client-register',
          params: { id: this.id }
        })
      },
      saveDescription() {
        this.loading = true
        const data = {
          client_id: this.id,
          description: this.description,
          title: this.title,
          name: this.title,
          actions: this.newPlan.actions,
          teeth: this.teeth
        }
        clientService.saveDescription(data, this.descriptionAction).then(() => {
          this.loading = false
          this.descriptionDialog = false
          this.description = ''
          this.title = ''
          this.getClient()
          this.newPlan.actions = []
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
      updateToothStatus(tooth) {
        if (this.client.teeth[tooth].status < 1) {
          this.client.teeth[tooth].status = this.client.teeth[tooth].status + 1
        } else {
          this.client.teeth[tooth].status = 0
        }

        clientService.updateToothStatus(this.client.teeth[tooth]).then(() => {
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
      getDateTime(date) {
        return format(parseISO(date), 'dd/MM/yyyy kk:mm')
      },
      getBirthday(date) {
        return format(date, 'dd/MM/yyyy')
      },
      saveImage() {
        this.loading = true
        const data = {
          image: this.image,
          client: this.id
        }
        clientService.saveImage(data).then(() => {
          this.addImageDialog = false
          this.image = null
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
      convertToBase64(file) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          this.image = reader.result
        }
      },
      viewRow (event, row) {
        this.planView = true
        this.currentPlan = row.item
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
      getStatusType(status) {
        switch(status) {
          case 1:
            return 'Em Tratamento'
          case 2:
            return 'Orçando'
          case 3:
            return 'Inativo'
          case 4:
            return 'Plano de Tratamento enviado'
        }
      }
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
</style>
