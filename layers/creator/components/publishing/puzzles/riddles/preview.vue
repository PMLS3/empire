<template>
  <div 
    class="space-y-6"
    :style="{
      fontSize: getFontSize(),
      color: settings.textColor,
      backgroundColor: settings.backgroundColor
    }"
  >
    <!-- Riddle Container -->
    <div 
      class="p-6 rounded-lg shadow-sm"
      :style="{
        borderColor: settings.accentColor,
        borderWidth: '1px'
      }"
    >
      <!-- Question -->
      <div class="space-y-4">
        <div class="text-xl font-medium" :style="{ color: settings.accentColor }">
          {{ riddle.question }}
        </div>

        <!-- Word Bank -->
        <div v-if="settings.showWordBank && riddle.wordBank?.length" class="mt-4">
          <div class="text-sm font-medium mb-2" :style="{ color: settings.accentColor }">
            Word Bank
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="word in riddle.wordBank"
              :key="word"
              class="px-2 py-1 text-sm rounded-full"
              :style="{
                backgroundColor: settings.accentColor,
                color: settings.backgroundColor
              }"
            >
              {{ word }}
            </span>
          </div>
        </div>

        <!-- Hints -->
        <div v-if="settings.showHints && riddle.hints.length" class="mt-4">
          <div class="text-sm font-medium mb-2" :style="{ color: settings.accentColor }">
            Hints
          </div>
          <ol class="list-decimal list-inside space-y-1">
            <li 
              v-for="(hint, index) in riddle.hints"
              :key="index"
              class="text-sm"
            >
              {{ hint }}
            </li>
          </ol>
        </div>
      </div>
    </div>

    <!-- Metadata -->
    <div 
      class="p-4 rounded-md text-sm"
      :style="{
        backgroundColor: `${settings.accentColor}10`,
        borderColor: settings.accentColor,
        borderWidth: '1px'
      }"
    >
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <div class="font-medium" :style="{ color: settings.accentColor }">Category</div>
          <div>{{ riddle.category }}</div>
        </div>
        <div>
          <div class="font-medium" :style="{ color: settings.accentColor }">Difficulty</div>
          <div>{{ riddle.difficulty }}</div>
        </div>
        <div>
          <div class="font-medium" :style="{ color: settings.accentColor }">Type</div>
          <div>{{ riddle.type }}</div>
        </div>
      </div>
    </div>

    <!-- Print Instructions -->
    <div 
      v-if="settings.printLayout === 'spacious'"
      class="p-4 border-t text-sm space-y-2"
      :style="{ borderColor: settings.accentColor }"
    >
      <div class="font-medium">Solving Tips:</div>
      <ul class="list-disc list-inside space-y-1">
        <li>Read the riddle carefully multiple times</li>
        <li>Look for wordplay and hidden meanings</li>
        <li>Use the hints if you get stuck</li>
        <li>Write down your ideas as you solve</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RiddleSettings, Riddle } from './generator'

const props = defineProps<{
  riddle: Riddle
  settings: RiddleSettings
}>()

const getFontSize = (): string => {
  const sizes = {
    small: '0.875rem',
    medium: '1rem',
    large: '1.25rem'
  }
  return sizes[props.settings.fontSize]
}
</script>
