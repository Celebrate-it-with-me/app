<script setup>
/**
 * The ordered, visible sections of an invitation. Order, activation and plan were already decided by the API,
 * so this only maps each section to its component, or to its package template when it has one.
 */
import { SECTION_COMPONENTS as COMPONENTS } from '../composables/sectionComponents'
import { PackageSection } from '../package'

const props = defineProps({
  sections: { type: Array, required: true },
  /** The usable template package (see usePackageTheme), or null for the built-in Clásica. */
  pkg: { type: Object, default: null }
})

/** Is this section drawn from the package AST? */
const fromPackage = section => !!props.pkg && section.render === 'package' && !!props.pkg.templates[section.type]
</script>

<template>
  <template v-for="(section, index) in sections" :key="section.type">
    <PackageSection
      v-if="fromPackage(section)"
      :ast="pkg.templates[section.type]"
      :section="section"
      :position="index + 1"
      :count="sections.length"
      :base="pkg.base"
      :strings="pkg.strings"
    />
    <!-- With a package active every section gets the same position hooks, so decoration follows the real order. -->
    <div
      v-else-if="pkg"
      :data-inv-section="section.type"
      :data-inv-position="index + 1"
      :data-inv-parity="(index + 1) % 2 === 0 ? 'even' : 'odd'"
    >
      <component :is="COMPONENTS[section.type]" :section="section" />
    </div>
    <component :is="COMPONENTS[section.type]" v-else :section="section" />
  </template>
</template>
