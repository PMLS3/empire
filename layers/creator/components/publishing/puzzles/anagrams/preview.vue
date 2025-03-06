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
      <h3 class="text-xl font-medium mb-2">Anagrams</h3>
      <p class="text-sm">Unscramble the letters to find the hidden words</p>
    </div>

    <!-- Puzzle Content -->
    <div class="space-y-4">
      <div 
        v-for="(word, index) in puzzle.scrambledWords" 
        :key="index"
        class="flex flex-col items-center gap-2"
      >
        <div 
          class="text-2xl font-mono px-6 py-3 rounded-lg"
          :style="{
            backgroundColor: `${settings.accentColor}20`,
            borderColor: settings.accentColor,
            borderWidth: '1px'
          }"
        >
          {{ word }}
        </div>
        
        <div v-if="puzzle.hints && puzzle.hints[index]" class="text-sm">
          Hint: {{ puzzle.hints[index] }}
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
