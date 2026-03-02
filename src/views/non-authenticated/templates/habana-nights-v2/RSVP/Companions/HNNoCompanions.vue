<script setup>
const emit = defineEmits(['goToPrevious', 'goToNext'])

const goToPrevious = () => {
  emit('goToPrevious')
}

const goToNext = () => {
  emit('goToNext')
}
</script>

<template>
  <div>
    <div class="w-full">
      <div class="hn-info-box px-6 py-8 rounded-xl text-center mb-8">
        <p class="text-[#F8F1E7]/90 font-['Montserrat',sans-serif] text-sm leading-relaxed">
          No tiene ningún acompañante asignado, por favor haga clic en continuar para terminar su
          RSVP.
        </p>
      </div>
    </div>

    <div class="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
      <button class="hn-btn-secondary order-2 sm:order-1" @click="goToPrevious()">Atrás</button>

      <button class="hn-btn-primary order-1 sm:order-2" @click="goToNext()">Siguiente Paso</button>
    </div>
  </div>
</template>

<style scoped>
.hn-info-box {
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.hn-btn-primary {
  width: 100%;
  padding: 0.875rem 2.5rem;
  background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
  color: #0b1220;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
}

.hn-btn-primary:hover {
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.35);
  transform: translateY(-1px);
}

.hn-btn-secondary {
  width: 100%;
  padding: 0.875rem 2.5rem;
  background: transparent;
  color: #f8f1e7;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
}

.hn-btn-secondary:hover {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

@media (min-width: 640px) {
  .hn-btn-primary,
  .hn-btn-secondary {
    width: auto;
  }
}
</style>
