<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary'
    disabled?: boolean
  }>(),
  { variant: 'secondary', disabled: false },
)

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 2.75rem;
  padding: 0 var(--space-4);
  border: var(--border-width) solid transparent;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-instant) var(--ease-out);
}

.app-button:active:not(:disabled) {
  transform: scale(0.97);
}

.app-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.app-button--primary {
  min-width: 7.5rem;
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

.app-button--primary:active:not(:disabled) {
  background: var(--color-action-pressed);
}
</style>
