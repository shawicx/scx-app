<script setup>
import { useSnackbar } from '@/composables/useSnackbar'

const { state, remove } = useSnackbar()
</script>

<template>
  <div class="snackbar-host">
    <v-snackbar
      v-for="snack in state.snackbars"
      :key="snack.id"
      v-model="snack.visible"
      :color="snack.color"
      :timeout="snack.timeout"
      location="top right"
      @update:model-value="(val) => { if (!val) remove(snack.id) }"
    >
      {{ snack.text }}
    </v-snackbar>
  </div>
</template>
