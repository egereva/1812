<script setup lang="ts">
import { externalLinkAttributes } from '~/utils/linkAttributes'

const props = defineProps<{ href: string }>()
const siteUrl = useRequestURL()
const attributes = computed(() =>
  externalLinkAttributes(props.href, siteUrl.href),
)
</script>

<template>
  <a :href="href" v-bind="attributes"><slot /></a>
</template>
