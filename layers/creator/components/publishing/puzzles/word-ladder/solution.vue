<template>
  <div class="space-y-6">
    <!-- Word Ladder Steps -->
    <div class="flex flex-col items-center gap-2">
      <div 
        class="text-2xl font-mono px-6 py-3 rounded-lg"
        :style="{
          backgroundColor: `${settings.highlightColor}20`,
          color: settings.textColor,
          borderColor: settings.highlightColor,
          borderWidth: '1px'
        }"
      >
        {{ puzzle.startWord }}
      </div>
      
      <template v-for="(step, index) in puzzle.solution.slice(1)" :key="index">
        <div class="h-6 border-l-2" :style="{ borderColor: settings.accentColor }" />
        <div class="relative">
          <div 
            class="text-2xl font-mono px-6 py-3 rounded-lg"
            :style="{
              backgroundColor: index === puzzle.solution.length - 2 
                ? `${settings.highlightColor}20` 
                : `${settings.accentColor}20`,
              color: settings.textColor,
              borderColor: index === puzzle.solution.length - 2 
                ? settings.highlightColor 
                : settings.accentColor,
              borderWidth: '1px'
            }"
          >
            {{ step.word }}
          </div>
          <!-- Change Description -->
          <div 
            class="absolute -left-24 top-1/2 -translate-y-1/2 flex items-center gap-2"
          >
            <div 
              v-if="settings.showStepNumbers"
              class="w-6 h-6 flex items-center justify-center rounded-full text-sm"
              :style="{
                backgroundColor: settings.accentColor,
                color: settings.backgroundColor
              }"
            >
              {{ index + 1 }}
            </div>
            <div 
              class="text-sm"
              :style="{ color: settings.textColor }"
            >
              Changed '{{ getChangedLetter(index + 1) }}'
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Statistics -->
    <div 
      class="p-4 rounded-lg grid grid-cols-3 gap-4"
      :style="{
        backgroundColor: `${settings.accentColor}10`,
        borderColor: settings.accentColor,
        borderWidth: '1px'
      }"
    >
      <div>
        <div 
          class="text-sm"
          :style="{ color: settings.textColor }"
        >
          Steps
        </div>
        <div 
          class="mt-1 text-2xl font-semibold"
          :style="{ color: settings.textColor }"
        >
          {{ puzzle.stats.minSteps }}
        </div>
      </div>
      <div>
        <div 
          class="text-sm"
          :style="{ color: settings.textColor }"
        >
          Word Length
        </div>
        <div 
          class="mt-1 text-2xl font-semibold"
          :style="{ color: settings.textColor }"
        >
          {{ puzzle.startWord.length }}
        </div>
      </div>
      <div>
        <div 
          class="text-sm"
          :style="{ color: settings.textColor }"
        >
          Difficulty
        </div>
        <div 
          class="mt-1 text-2xl font-semibold capitalize"
          :style="{ color: settings.textColor }"
        >
          {{ puzzle.difficulty }}
        </div>
      </div>
    </div>

    <!-- Solution Summary -->
    <div 
      class="space-y-2 p-4 rounded-lg"
      :style="{
        backgroundColor: `${settings.accentColor}10`,
        borderColor: settings.accentColor,
        borderWidth: '1px'
      }"
    >
      <h3 
        class="font-medium"
        :style="{ color: settings.textColor }"
      >
        Solution Summary:
      </h3>
      <div class="space-y-2">
        <div
          v-for="(step, index) in puzzle.solution.slice(1)"
          :key="index"
          class="flex items-start gap-2 text-sm"
          :style="{ color: settings.textColor }"
        >
          <span>
            Step {{ index + 1 }}: Changed '{{ getChangedLetter(index + 1) }}' in 
            <span class="font-mono">{{ getPreviousWord(index + 1) }}</span> to get 
            <span 
              class="font-mono"
              :style="{ color: settings.accentColor }"
            >
              {{ step.word }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- Tips -->
    <div 
      class="p-4 rounded-lg space-y-2"
      :style="{
        backgroundColor: `${settings.highlightColor}10`,
        borderColor: settings.highlightColor,
        borderWidth: '1px'
      }"
    >
      <div 
        class="font-medium"
        :style="{ color: settings.textColor }"
      >
        Word Ladder Strategy:
      </div>
      <ul class="ml-6 list-disc space-y-1 text-sm">
        <li :style="{ color: settings.textColor }">Change one letter at a time</li>
        <li :style="{ color: settings.textColor }">Each step must create a valid word</li>
        <li :style="{ color: settings.textColor }">Try to get closer to target word's letters</li>
        <li :style="{ color: settings.textColor }">Consider multiple paths if stuck</li>
        <li :style="{ color: settings.textColor }">Use common word patterns</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WordLadderSettings, WordLadderPuzzle } from './types'

const props = defineProps<{
  settings: WordLadderSettings
  puzzle: WordLadderPuzzle
}>()

const getChangedLetter = (index: number): string => {
  const currentWord = props.puzzle.solution[index].word
  const previousWord = getPreviousWord(index)
  
  for (let i = 0; i < currentWord.length; i++) {
    if (currentWord[i] !== previousWord[i]) {
      return previousWord[i]
    }
  }
  return ''
}

const getPreviousWord = (index: number): string => {
  return index === 0 ? props.puzzle.startWord : props.puzzle.solution[index - 1].word
}
</script>
