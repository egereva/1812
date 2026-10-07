<script setup lang="ts">
import { getSourceById } from '#shared/content/index'
import type { BeforeAfterPair } from '#shared/types/content'
import { normalizeMediaCaption } from '~/utils/mediaCaption'

const props = defineProps<{ pair: BeforeAfterPair }>()
const { locale, t } = useI18n()
const config = useRuntimeConfig()
const frame = useTemplateRef<HTMLDivElement>('frame')
const handle = useTemplateRef<HTMLDivElement>('handle')
const position = ref(50)
let activePointer: number | null = null
const instructionId = useId()
const media = computed(() =>
  [
    { image: props.pair.before, date: props.pair.beforeDate },
    { image: props.pair.after, date: props.pair.afterDate },
  ].map(({ image, date }) => ({
    image,
    date,
    src: `${config.app.baseURL.replace(/\/$/, '')}${image.src}`,
    // Both creators remain visible: no full caption is repeated below the frame.
    attribution: normalizeMediaCaption(
      { ...image, caption: undefined, description: undefined },
      image.sourceId ? getSourceById(locale.value, image.sourceId) : undefined,
    ),
  })),
)
const valueText = computed(() =>
  t('place.comparison.value', { value: position.value }),
)

function setPosition(value: number) {
  position.value = Math.max(0, Math.min(100, Math.round(value)))
}
function movePointer(event: PointerEvent) {
  const bounds = frame.value?.getBoundingClientRect()
  if (bounds?.width)
    setPosition(((event.clientX - bounds.left) / bounds.width) * 100)
}
function startPointer(event: PointerEvent) {
  if (!event.isPrimary || event.button !== 0 || activePointer !== null) return
  activePointer = event.pointerId
  frame.value?.setPointerCapture(event.pointerId)
  handle.value?.focus({ preventScroll: true })
  movePointer(event)
}
function dragPointer(event: PointerEvent) {
  if (event.pointerId === activePointer) movePointer(event)
}
function stopPointer(event?: PointerEvent) {
  if (event && event.pointerId !== activePointer) return
  const pointer = activePointer
  activePointer = null
  if (pointer !== null && frame.value?.hasPointerCapture(pointer))
    frame.value.releasePointerCapture(pointer)
}
function moveKeyboard(event: KeyboardEvent) {
  const values: Record<string, number | undefined> = {
    ArrowLeft: position.value - 5,
    ArrowRight: position.value + 5,
    Home: 0,
    End: 100,
  }
  const next = values[event.key]
  if (next === undefined) return
  event.preventDefault()
  setPosition(next)
}
watch(
  () => props.pair.id,
  () => {
    stopPointer()
    position.value = 50
  },
)
onBeforeUnmount(() => stopPointer())
</script>

<template>
  <figure class="place-comparison">
    <div
      ref="frame"
      class="place-comparison__frame"
      :style="{ aspectRatio: pair.aspectRatio ?? 4 / 3 }"
      @pointerdown="startPointer"
      @pointermove="dragPointer"
      @pointerup="stopPointer"
      @pointercancel="stopPointer"
      @lostpointercapture="stopPointer"
      @dragstart.prevent
    >
      <div
        class="place-comparison__layer place-comparison__layer--later"
        :style="{ clipPath: `inset(0 0 0 ${position}%)` }"
      >
        <!-- eslint-disable vue/html-self-closing -->
        <img
          class="place-comparison__image"
          :src="media[1]!.src"
          :alt="pair.after.alt"
          :style="{ objectPosition: pair.afterPosition ?? '50% 50%' }"
          :draggable="false"
        />
        <!-- eslint-enable vue/html-self-closing -->
        <span class="place-comparison__date place-comparison__date--later">{{
          pair.afterDate
        }}</span>
      </div>
      <div
        class="place-comparison__layer place-comparison__layer--earlier"
        :style="{ clipPath: `inset(0 ${100 - position}% 0 0)` }"
      >
        <!-- eslint-disable vue/html-self-closing -->
        <img
          class="place-comparison__image place-comparison__earlier"
          :src="media[0]!.src"
          :alt="pair.before.alt"
          :style="{ objectPosition: pair.beforePosition ?? '50% 50%' }"
          :draggable="false"
        />
        <!-- eslint-enable vue/html-self-closing -->
        <span class="place-comparison__date place-comparison__date--earlier">{{
          pair.beforeDate
        }}</span>
      </div>
      <span
        class="place-comparison__divider"
        :style="{ left: `${position}%` }"
        aria-hidden="true"
      />
      <div
        ref="handle"
        class="place-comparison__handle"
        :style="{ left: `clamp(1.5rem, ${position}%, calc(100% - 1.5rem))` }"
        role="slider"
        tabindex="0"
        aria-orientation="horizontal"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="position"
        :aria-valuetext="valueText"
        :aria-label="
          t('place.comparison.label', {
            earlier: pair.beforeDate,
            later: pair.afterDate,
          })
        "
        :aria-describedby="instructionId"
        @keydown="moveKeyboard"
      >
        <span class="place-comparison__grip" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
          </svg>
        </span>
      </div>
    </div>
    <p :id="instructionId" class="place-comparison__instructions">
      {{ t('place.comparison.instructions') }}
    </p>
    <figcaption class="place-comparison__credits">
      <p v-for="item in media" :key="item.image.src">
        <span class="place-comparison__credit-date">{{ item.date }}</span>
        <span v-if="item.attribution.attribution">{{
          item.attribution.attribution
        }}</span>
        <span>
          <WebsiteLink
            v-if="item.attribution.sourceUrl"
            :href="item.attribution.sourceUrl"
            >{{ item.attribution.sourceLabel }}</WebsiteLink
          ><template v-else>{{ item.attribution.sourceLabel }}</template>
        </span>
      </p>
    </figcaption>
    <p v-if="pair.caption" class="place-comparison__note">{{ pair.caption }}</p>
  </figure>
</template>

<style scoped>
.place-comparison {
  margin: 0;
  min-width: 0;
}
.place-comparison + .place-comparison {
  margin-top: var(--space-12);
}
.place-comparison__frame {
  position: relative;
  overflow: hidden;
  width: 100%;
  background: var(--color-bg);
  cursor: col-resize;
  touch-action: pan-y;
  user-select: none;
}
.place-comparison__layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.place-comparison__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-height: none;
  object-fit: cover;
  pointer-events: none;
}
.place-comparison__date {
  position: absolute;
  top: var(--space-4);
  color: var(--color-bg);
  text-shadow:
    0 1px 3px var(--color-ink),
    0 0 2px var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(1.125rem, 2vw, 1.75rem);
  line-height: 1.2;
  pointer-events: none;
}
.place-comparison__date--earlier {
  left: var(--space-4);
}
.place-comparison__date--later {
  right: var(--space-4);
}
.place-comparison__divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  border-right: 1px solid var(--color-ink);
  background: var(--color-bg);
  pointer-events: none;
}
.place-comparison__handle {
  position: absolute;
  top: 50%;
  display: grid;
  width: 48px;
  height: 48px;
  transform: translate(-50%, -50%);
  place-items: center;
  touch-action: none;
}
.place-comparison__grip {
  display: grid;
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-ink);
  border-radius: 50%;
  color: var(--color-ink);
  background: var(--color-bg);
  place-items: center;
}
.place-comparison__grip svg {
  width: 24px;
  height: 24px;
}
.place-comparison__instructions {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.place-comparison__credits {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4) var(--grid-gap);
  margin-top: var(--space-4);
  color: var(--color-muted);
  font-size: var(--text-caption);
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.place-comparison__credits p {
  display: grid;
  align-content: start;
  gap: var(--space-1);
  min-width: 0;
  margin: 0;
}
.place-comparison__credit-date {
  color: var(--color-ink);
  font-size: var(--text-body-sm);
  font-weight: 500;
}
.place-comparison__credits a {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  color: inherit;
}
.place-comparison__note {
  max-width: 60rem;
  margin: var(--space-6) 0 0;
  border-left: 2px solid var(--color-accent);
  padding-left: var(--space-4);
  color: var(--color-muted);
  font-size: var(--text-body-sm);
  line-height: 1.65;
}
@media (max-width: 37.5rem) {
  .place-comparison__credits {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
