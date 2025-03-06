<template>
  <div 
    class="puzzle-solution space-y-6"
    :style="{
      color: settings.textColor,
      backgroundColor: settings.backgroundColor
    }"
  >
    <!-- Solution Header -->
    <div class="text-center">
      <h3 class="text-xl font-medium mb-2">Anagrams - Solution</h3>
    </div>

    <!-- Solution Content -->
    <div class="space-y-4">
      <div 
        v-for="(word, index) in puzzle.words" 
        :key="index"
        class="flex items-center justify-between gap-4"
      >
        <div 
          class="text-2xl font-mono px-6 py-3 rounded-lg"
          :style="{
            backgroundColor: `${settings.accentColor}20`,
            borderColor: settings.accentColor,
            borderWidth: '1px'
          }"
        >
          {{ puzzle.scrambledWords[index] }}
        </div>

        <div class="text-2xl">→</div>

        <div 
          class="text-2xl font-mono px-6 py-3 rounded-lg"
          :style="{
            backgroundColor: `${settings.highlightColor}20`,
            borderColor: settings.highlightColor,
            borderWidth: '1px'
          }"
        >
          {{ word }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnagramsSettings, AnagramsPuzzle } from './types'

defineProps<{
  puzzle: AnagramsPuzzle
  settings: AnagramsSettings
}>()
</script>
