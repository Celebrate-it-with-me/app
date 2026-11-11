<script setup>
import { ref } from 'vue'
import { Plus, Search, Users, Wallet, Heart, Pencil, Trash2, Share2, Mail } from 'lucide-vue-next'
import {
  UiButton,
  UiField,
  UiInput,
  UiTextarea,
  UiSelect,
  UiCheckbox,
  UiRadioGroup,
  UiSwitch,
  UiModal,
  UiDropdown,
  UiTabs,
  UiCard,
  UiBadge,
  UiEmptyState,
  UiSkeleton,
  UiAvatar,
  UiPageHeader,
  UiStat,
  UiListRow,
  UiPagination,
  useToast
} from '@/ui'

const { toast, success, error } = useToast()

const name = ref('')
const notes = ref('')
const eventType = ref(undefined)
const whatsapp = ref(true)
const reminders = ref(false)
const template = ref('clasica')
const tab = ref('todos')
const page = ref(3)
const modalOpen = ref(false)

const eventTypes = [
  { value: 'quince', label: 'Quinceañera' },
  { value: 'boda', label: 'Boda' },
  { value: 'otro', label: 'Otro (próximamente)', disabled: true }
]

const templates = [
  { value: 'clasica', label: 'Clásica', description: 'Gratis. Sobria y elegante.' },
  { value: 'jardin', label: 'Jardín', description: 'Premium. Flores y animación.' }
]

const guests = [
  { name: 'Natalia Fonseca', phone: '+1 305 555 0123', status: 'confirmado' },
  { name: 'Esteban Roldán', phone: '+1 305 555 0122', status: 'pendiente' },
  { name: 'Claudia Ibarra', phone: '+1 305 555 0121', status: 'no-asiste' }
]

const STATUS = {
  confirmado: { tone: 'success', label: 'Confirmó' },
  pendiente: { tone: 'warning', label: 'Pendiente' },
  'no-asiste': { tone: 'danger', label: 'No asiste' }
}

const menu = [
  { label: 'Editar', icon: Pencil, onSelect: () => toast('Editar') },
  { label: 'Compartir', icon: Share2, onSelect: () => toast('Compartir') },
  { label: 'Eliminar', icon: Trash2, danger: true, separator: true, onSelect: () => error('Eliminado') }
]

// Full class names on purpose: Tailwind only generates classes it can see in the source.
const palette = [
  ['cream', ['bg-cream-50', 'bg-cream-100', 'bg-cream-200', 'bg-cream-300']],
  ['ink', ['bg-ink-900', 'bg-ink-700', 'bg-ink-500', 'bg-ink-400', 'bg-ink-300']],
  [
    'rose',
    [
      'bg-rose-50',
      'bg-rose-100',
      'bg-rose-200',
      'bg-rose-300',
      'bg-rose-400',
      'bg-rose-500',
      'bg-rose-600',
      'bg-rose-700',
      'bg-rose-800'
    ]
  ],
  ['gold', ['bg-gold-100', 'bg-gold-300', 'bg-gold-500', 'bg-gold-700']],
  [
    'feedback',
    ['bg-success-500', 'bg-warning-500', 'bg-danger-500', 'bg-info-500', 'bg-line', 'bg-line-strong']
  ]
]
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
    <UiPageHeader
      eyebrow="Quinvite · kit de interfaz"
      title="Componentes base"
      subtitle="Cálido y elegante, modo claro. Esta página solo existe en desarrollo."
    >
      <template #actions>
        <UiButton variant="secondary" @click="success('Guardado', 'Los cambios se guardaron.')">
          Toast
        </UiButton>
        <UiButton @click="modalOpen = true">
          <template #icon><Plus class="h-4 w-4" /></template>
          Nuevo evento
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
      <UiCard title="Tipografía" subtitle="Fraunces para títulos, Figtree para texto.">
        <h1 class="text-4xl">Los XV de Valentina</h1>
        <h2 class="mt-2 text-2xl">Sábado 25 de diciembre, 2026</h2>
        <p class="mt-3 text-base text-ink-700">
          Nos llena de alegría invitarte a celebrar con nosotros este día tan especial. Tu presencia
          es el mejor regalo.
        </p>
        <p class="mt-2 text-sm text-ink-500">Texto secundario para notas y ayudas.</p>
      </UiCard>

      <UiCard title="Paleta" subtitle="Tokens en src/style.css">
        <div v-for="[family, steps] in palette" :key="family" class="mb-3">
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">{{ family }}</p>
          <div class="flex gap-1">
            <div
              v-for="step in steps"
              :key="step"
              class="h-9 min-w-0 flex-1 rounded-md border border-line"
              :class="step"
              :title="step"
            />
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <UiBadge tone="success" dot>Confirmó</UiBadge>
          <UiBadge tone="warning" dot>Pendiente</UiBadge>
          <UiBadge tone="danger" dot>No asiste</UiBadge>
          <UiBadge tone="info">Padrino</UiBadge>
          <UiBadge tone="gold">Premium</UiBadge>
          <UiBadge tone="rose">Quince</UiBadge>
          <UiBadge size="sm">Borrador</UiBadge>
        </div>
      </UiCard>

      <UiCard title="Botones">
        <div class="flex flex-wrap items-center gap-2">
          <UiButton>Primario</UiButton>
          <UiButton variant="secondary">Secundario</UiButton>
          <UiButton variant="ghost">Fantasma</UiButton>
          <UiButton variant="danger">Eliminar</UiButton>
          <UiButton variant="link">Enlace</UiButton>
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <UiButton size="sm">Pequeño</UiButton>
          <UiButton size="lg">Grande</UiButton>
          <UiButton loading>Enviando</UiButton>
          <UiButton disabled>Deshabilitado</UiButton>
          <UiButton icon variant="secondary" aria-label="Buscar"><Search class="h-5 w-5" /></UiButton>
          <UiDropdown :items="menu">
            <template #trigger>
              <UiButton variant="secondary">Menú</UiButton>
            </template>
          </UiDropdown>
        </div>
        <UiButton class="mt-3" block>
          <template #icon><Mail class="h-4 w-4" /></template>
          Enviar invitaciones por WhatsApp
        </UiButton>
      </UiCard>

      <UiCard title="Formulario">
        <form class="flex flex-col gap-4" @submit.prevent>
          <UiField label="Nombre de la quinceañera" required hint="Así aparecerá en la invitación.">
            <UiInput v-model="name" placeholder="Valentina" />
          </UiField>
          <UiField label="Buscar invitado">
            <UiInput placeholder="Nombre o teléfono">
              <template #leading><Search class="h-4 w-4" /></template>
            </UiInput>
          </UiField>
          <UiField label="Correo" error="Escribe un correo válido.">
            <UiInput type="email" model-value="mama@" />
          </UiField>
          <UiField label="Tipo de evento" required>
            <UiSelect v-model="eventType" :options="eventTypes" />
          </UiField>
          <UiField label="Mensaje para tus invitados">
            <UiTextarea v-model="notes" :maxlength="160" placeholder="Nos encantaría contar contigo…" />
          </UiField>
          <UiRadioGroup v-model="template" :options="templates" cards />
          <UiCheckbox v-model="reminders" label="Enviar recordatorio a quien no responda" description="Tres días antes del evento." />
          <UiSwitch v-model="whatsapp" label="Confirmación por WhatsApp" description="Los invitados confirman con un toque." />
          <UiInput disabled model-value="Deshabilitado" />
        </form>
      </UiCard>

      <UiCard title="Resumen" padding="sm">
        <div class="grid grid-cols-2 gap-3">
          <UiStat label="Confirmados" value="86" hint="de 120 invitados" tone="success">
            <template #icon><Users class="h-5 w-5" /></template>
          </UiStat>
          <UiStat label="Pendientes" value="27" tone="warning">
            <template #icon><Users class="h-5 w-5" /></template>
          </UiStat>
          <UiStat label="Padrinos" value="$4,200" hint="$1,800 pendientes" tone="gold">
            <template #icon><Heart class="h-5 w-5" /></template>
          </UiStat>
          <UiStat label="Presupuesto" value="43%" hint="$7,730 de $18,000" tone="rose">
            <template #icon><Wallet class="h-5 w-5" /></template>
          </UiStat>
        </div>
      </UiCard>

      <UiCard title="Invitados" padding="none">
        <div class="px-5 pt-5">
          <UiTabs
            v-model="tab"
            fill
            :tabs="[
              { value: 'todos', label: 'Todos', count: 120 },
              { value: 'confirmados', label: 'Confirmaron', count: 86 },
              { value: 'pendientes', label: 'Pendientes', count: 27 }
            ]"
          >
            <template #todos>
              <div class="-mx-5 divide-y divide-line">
                <UiListRow
                  v-for="guest in guests"
                  :key="guest.name"
                  :title="guest.name"
                  :subtitle="guest.phone"
                  clickable
                  chevron
                >
                  <template #leading><UiAvatar :name="guest.name" /></template>
                  <template #trailing>
                    <UiBadge :tone="STATUS[guest.status].tone" size="sm" dot>
                      {{ STATUS[guest.status].label }}
                    </UiBadge>
                  </template>
                </UiListRow>
              </div>
              <div class="px-0 py-4">
                <UiPagination v-model:page="page" :pages="12" />
              </div>
            </template>
            <template #confirmados>
              <div class="flex flex-col gap-3 pb-5">
                <div class="flex items-center gap-3">
                  <UiSkeleton circle width="2.5rem" height="2.5rem" />
                  <div class="flex-1"><UiSkeleton :lines="2" /></div>
                </div>
                <div class="flex items-center gap-3">
                  <UiSkeleton circle width="2.5rem" height="2.5rem" />
                  <div class="flex-1"><UiSkeleton :lines="2" /></div>
                </div>
              </div>
            </template>
            <template #pendientes>
              <UiEmptyState
                compact
                title="Todos han respondido"
                description="No queda nadie pendiente. ¡Buen trabajo!"
              >
                <template #icon><Users class="h-6 w-6" /></template>
                <UiButton variant="secondary" size="sm">Ver confirmados</UiButton>
              </UiEmptyState>
            </template>
          </UiTabs>
        </div>
      </UiCard>

      <UiCard title="Estado vacío" flat class="lg:col-span-2">
        <UiEmptyState
          title="Aún no tienes invitados"
          description="Importa tu lista desde Excel o agrégalos uno a uno. Podrás enviar la invitación por WhatsApp en cuanto tengas sus teléfonos."
        >
          <template #icon><Users class="h-6 w-6" /></template>
          <UiButton>
            <template #icon><Plus class="h-4 w-4" /></template>
            Agregar invitado
          </UiButton>
          <UiButton variant="secondary">Importar desde Excel</UiButton>
        </UiEmptyState>
      </UiCard>
    </div>

    <UiModal
      v-model:open="modalOpen"
      title="Nuevo evento"
      description="En cinco minutos tendrás tu invitación lista para compartir."
    >
      <div class="flex flex-col gap-4">
        <UiField label="¿Qué celebramos?" required>
          <UiSelect v-model="eventType" :options="eventTypes" />
        </UiField>
        <UiField label="Nombre" required>
          <UiInput v-model="name" placeholder="Los XV de Valentina" />
        </UiField>
      </div>
      <template #footer>
        <UiButton variant="ghost" @click="modalOpen = false">Cancelar</UiButton>
        <UiButton @click="(modalOpen = false), success('Evento creado')">Continuar</UiButton>
      </template>
    </UiModal>
  </main>
</template>
