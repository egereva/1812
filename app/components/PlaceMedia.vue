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
  <figure class="place-media">
    <MuseumImage :image="image" />
    <figcaption>
      <span v-if="caption.caption">{{ caption.caption }}</span>
      <span
        v-if="caption.attribution || caption.sourceLabel"
        class="place-media__attribution"
      >
        {{ caption.attribution
        }}<template v-if="caption.attribution && caption.sourceLabel">
          ·
        </template>
        <WebsiteLink v-if="caption.sourceUrl" :href="caption.sourceUrl">{{
          caption.sourceLabel
        }}</WebsiteLink
        ><template v-else>{{ caption.sourceLabel }}</template>
      </span>
    </figcaption>
  </figure>
</template>
<style scoped>
.place-media {
  margin: 0;
  min-width: 0;
}
.place-media :deep(.museum-image) {
  margin-inline: auto;
}
figcaption {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-4);
  font-size: var(--text-body-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.place-media__attribution {
  color: var(--color-muted);
}
figcaption a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: inherit;
  text-underline-offset: 0.2em;
}
</style>
