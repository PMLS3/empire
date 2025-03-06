<template>
  <div 
    class="puzzle-preview space-y-6"
    :style="{
      color: settings.textColor,
      backgroundColor: settings.backgroundColor
    }"
  >
    <!-- Puzzle Header -->
    <div class="text-center">
      <h3 class="text-xl font-medium mb-2">UspellingUbee</h3>
      <p class="text-sm">TODO: Add puzzle instructions</p>
    </div>

    <!-- Puzzle Content -->
    <div class="space-y-4">
      <!-- TODO: Implement puzzle preview UI -->
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UspellingUbeeSettings, UspellingUbeePuzzle } from './types'

defineProps<{
  puzzle: UspellingUbeePuzzle
  settings: UspellingUbeeSettings
}>()
</script>
