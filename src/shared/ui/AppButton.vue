<script setup lang="ts">
/**
 * A tactile, physical-feeling button: the key has visible depth and travels down
 * when pressed. Hover, focus-visible, pressed and disabled states are all defined.
 */
import { useTemplateRef } from 'vue'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary'
    disabled?: boolean
  }>(),
  { variant: 'secondary', disabled: false },
)

defineEmits<{ click: [event: MouseEvent] }>()

const element = useTemplateRef<HTMLButtonElement>('element')

/** The native button, for parents that manage focus. */
defineExpose({ element })
</script>

<template>
  <button
    ref="element"
    type="button"
    class="app-button"
    :class="`app-button--${variant}`"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  --depth-color: var(--color-secondary-depth);
  --primary-min-width: 7.5rem;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: var(--control-min-size);
  padding: 0 var(--space-5);
  border: var(--border-width) solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  box-shadow: 0 var(--button-depth) 0 var(--depth-color);
  transform: translateY(0);
  transition:
    transform var(--duration-instant) var(--ease-out),
    box-shadow var(--duration-instant) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}

.app-button--primary {
  --depth-color: var(--color-action-depth);

  min-width: var(--primary-min-width);
  background: var(--color-action);
  color: var(--color-ink-inverse);
}

.app-button--secondary {
  background: var(--color-surface);
  border-color: var(--color-line-strong);
  color: var(--color-ink);
}

@media (hover: hover) {
  .app-button--primary:hover:not(:disabled) {
    background: var(--color-action-hover);
  }

  .app-button--secondary:hover:not(:disabled) {
    background: var(--color-surface-sunken);
  }
}

/* Pressed: the key travels down and its edge disappears. */
.app-button:active:not(:disabled) {
  box-shadow: 0 calc(var(--button-depth) - var(--button-press)) 0 var(--depth-color);
  transform: translateY(var(--button-press));
}

.app-button--primary:active:not(:disabled) {
  background: var(--color-action-pressed);
}

/* Disabled: flat, as if pushed into the surface, so it reads as unavailable. */
.app-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
  transform: translateY(var(--button-press));
}
</style>
