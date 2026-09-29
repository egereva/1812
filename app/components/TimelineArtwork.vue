<script setup lang="ts">
import { getSourceById } from '#shared/content/index'
import type { MediaAsset } from '#shared/types/content'
import { normalizeMediaCaption } from '~/utils/mediaCaption'

const props = defineProps<{ image: MediaAsset }>()
const { locale } = useI18n()
const caption = computed(() =>
  normalizeMediaCaption(
    props.image,
    props.image.sourceId
      ? getSourceById(locale.value, props.image.sourceId)
      : undefined,
    props.image.sourceId
      ? getSourceById(locale.value === 'ru' ? 'en' : 'ru', props.image.sourceId)
      : undefined,
  ),
)
</script>

<template>
  <figure class="timeline-artwork">
    <MuseumImage :image="image" />
    <figcaption>
      <span v-if="caption.caption" class="timeline-artwork__caption">{{
        caption.caption
      }}</span>
      <span
        v-if="caption.attribution || caption.sourceLabel"
        class="timeline-artwork__attribution"
      >
        {{ caption.attribution
        }}<template v-if="caption.attribution && caption.sourceLabel">
          ·
        </template>
        <a v-if="caption.sourceUrl" :href="caption.sourceUrl">{{
          caption.sourceLabel
        }}</a
        ><template v-else>{{ caption.sourceLabel }}</template>
      </span>
    </figcaption>
  </figure>
</template>

<style scoped>
.timeline-artwork {
  margin: 0;
  min-width: 0;
  --museum-image-max-height: 42rem;
}
.timeline-artwork :deep(.museum-image) {
  margin-inline: auto;
}
figcaption {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-4);
  max-width: 65rem;
  overflow-wrap: anywhere;
  line-height: 1.5;
}
.timeline-artwork__caption {
  font-size: var(--text-body-sm);
}
.timeline-artwork__attribution {
  color: var(--artwork-muted, var(--color-muted));
  font-size: var(--text-caption);
}
figcaption a {
  color: inherit;
  text-underline-offset: 0.2em;
}
</style>
