<template>
  <div 
    class="space-y-6"
    :style="{
      fontSize: getFontSize(),
      color: settings.textColor,
      backgroundColor: settings.backgroundColor
    }"
  >
    <!-- Solution Container -->
    <div 
      class="p-6 rounded-lg shadow-sm"
      :style="{
        borderColor: settings.accentColor,
        borderWidth: '1px'
      }"
    >
      <!-- Question Recap -->
      <div class="space-y-4">
        <div class="text-lg font-medium opacity-75">
          {{ riddle.question }}
        </div>

        <!-- Answer -->
        <div class="mt-6">
          <div class="text-sm font-medium mb-2" :style="{ color: settings.accentColor }">
            Answer
          </div>
          <div 
            class="text-xl font-bold p-4 rounded-md"
            :style="{
              backgroundColor: `${settings.accentColor}10`,
              color: settings.accentColor
            }"
          >
            {{ riddle.answer }}
          </div>
        </div>

        <!-- Explanation -->
        <div v-if="riddle.explanation" class="mt-6">
          <div class="text-sm font-medium mb-2" :style="{ color: settings.accentColor }">
            Explanation
          </div>
          <div class="text-sm">
            {{ riddle.explanation }}
          </div>
        </div>

        <!-- Word Analysis -->
        <div v-if="riddle.type === 'wordplay' && riddle.relatedWords?.length" class="mt-6">
          <div class="text-sm font-medium mb-2" :style="{ color: settings.accentColor }">
            Word Analysis
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="word in riddle.relatedWords"
              :key="word"
              class="px-3 py-1 text-sm rounded-full"
              :style="{
                backgroundColor: settings.accentColor,
                color: settings.backgroundColor
              }"
            >
              {{ word }}
            </span>
          </div>
        </div>

        <!-- Solving Steps -->
        <div class="mt-6">
          <div class="text-sm font-medium mb-2" :style="{ color: settings.accentColor }">
            How to Solve
          </div>
          <ol class="list-decimal list-inside space-y-2 text-sm">
            <template v-if="riddle.type === 'wordplay'">
              <li>Look for words with multiple meanings</li>
              <li>Consider common phrases and idioms</li>
              <li>Think about word associations</li>
              <li>Check the word bank for clues</li>
            </template>
            <template v-else-if="riddle.type === 'math'">
              <li>Identify the mathematical operations</li>
              <li>Look for patterns in numbers</li>
              <li>Consider basic arithmetic</li>
              <li>Write out the equations</li>
            </template>
            <template v-else-if="riddle.type === 'logic'">
              <li>Break down the problem</li>
              <li>Consider all possibilities</li>
              <li>Look for logical connections</li>
              <li>Eliminate impossible answers</li>
            </template>
            <template v-else>
              <li>Read the riddle multiple times</li>
              <li>Look for hidden meanings</li>
              <li>Consider metaphors</li>
              <li>Think outside the box</li>
            </template>
          </ol>
        </div>
      </div>
    </div>

    <!-- Print Notes -->
    <div v-if="settings.printLayout === 'spacious'" class="text-sm space-y-4">
      <!-- Difficulty Analysis -->
      <div 
        class="p-4 rounded-md"
        :style="{
          backgroundColor: `${settings.accentColor}10`,
          borderColor: settings.accentColor,
          borderWidth: '1px'
        }"
      >
        <div class="font-medium mb-2" :style="{ color: settings.accentColor }">
          Difficulty Analysis
        </div>
        <div class="space-y-2">
          <div>
            <span class="font-medium">Level:</span> {{ riddle.difficulty }}
          </div>
          <div>
            <span class="font-medium">Type:</span> {{ riddle.type }}
          </div>
          <div>
            <span class="font-medium">Category:</span> {{ riddle.category }}
          </div>
        </div>
      </div>

      <!-- Learning Points -->
      <div 
        class="p-4 rounded-md"
        :style="{
          backgroundColor: `${settings.accentColor}10`,
          borderColor: settings.accentColor,
          borderWidth: '1px'
        }"
      >
        <div class="font-medium mb-2" :style="{ color: settings.accentColor }">
          Learning Points
        </div>
        <ul class="list-disc list-inside space-y-1">
          <li>Pattern recognition skills</li>
          <li>Critical thinking development</li>
          <li>Vocabulary enhancement</li>
          <li>Problem-solving strategies</li>
        </ul>
      </div>
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
