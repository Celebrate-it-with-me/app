<script setup>
/** Stationery panel: paper surface, soft offset shadow and a thin gold frame set inside it. */
</script>

<template>
  <div class="relative rounded-[1.75rem] bg-inv-surface p-7 text-left shadow-card ring-1 ring-inv-ink/10 sm:p-9">
    <span aria-hidden="true" class="pointer-events-none absolute inset-2 rounded-[1.3rem] border border-inv-accent/35" />
    <div class="relative"><slot /></div>
  </div>
</template>
