<script setup lang="ts">
import type { MediaAsset } from '#shared/types/content'

const props = defineProps<{
  image: MediaAsset
  images?: MediaAsset[]
  index?: number
}>()
const { t } = useI18n()
const config = useRuntimeConfig()
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const { open, loading, error } = useMuseumImageViewer()
const src = computed(
  () => `${config.app.baseURL.replace(/\/$/, '')}${props.image.src}`,
)
</script>

<template>
  <button
    ref="trigger"
    class="museum-image"
    type="button"
    aria-haspopup="dialog"
    :aria-label="t('imageViewer.open', { title: image.alt })"
    :aria-busy="loading"
    @click="open(images ?? [image], index ?? 0, trigger!)"
  >
    <!-- eslint-disable vue/html-self-closing -->
    <img :src="src" :alt="image.alt" />
    <!-- eslint-enable vue/html-self-closing -->
    <span class="museum-image__zoom" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5M7 10h6M10 7v6" />
      </svg>
    </span>
  </button>
  <p v-if="error" class="museum-image__error" role="alert">{{ error }}</p>
</template>

<style scoped>
.museum-image {
  position: relative;
  display: block;
  width: fit-content;
  max-width: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: zoom-in;
}

.museum-image img {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: var(--museum-image-max-height, 28rem);
  object-fit: contain;
}

.museum-image__zoom {
  position: absolute;
  right: var(--space-3);
  bottom: var(--space-3);
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  color: var(--color-footer-text);
  background: var(--color-footer);
  opacity: 0;
  transition: opacity var(--duration-short) ease;
}

.museum-image__zoom svg {
  width: 1.25rem;
  height: 1.25rem;
}

.museum-image:hover .museum-image__zoom,
.museum-image:focus-visible .museum-image__zoom {
  opacity: 1;
}

.museum-image__error {
  margin-top: var(--space-3);
  color: var(--color-accent);
  font-size: var(--text-body-sm);
}
</style>
