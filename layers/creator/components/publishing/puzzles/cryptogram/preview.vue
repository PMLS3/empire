<template>
  <div class="space-y-6">
    <div class="space-y-4">
      <div 
        v-for="(line, lineIndex) in encryptedLines" 
        :key="lineIndex"
        class="space-y-2"
      >
        <!-- Encrypted text -->
        <div class="font-mono text-lg tracking-wider">
          <template v-for="(char, charIndex) in line" :key="charIndex">
            <span 
              :class="{
                'text-primary-600 dark:text-primary-400': /[A-Z]/.test(char),
                'mx-1': char === ' '
              }"
            >{{ char }}</span>
          </template>
        </div>

        <!-- Original text (when showing answers) -->
        <div v-if="showAnswers" class="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {{ originalLines[lineIndex] }}
        </div>
      </div>
    </div>

    <div v-if="!showAnswers" class="space-y-2">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        Each letter has been replaced with a different letter. Decode the message to reveal the original text.
      </div>
      
      <div v-if="hint" class="text-sm">
        <span class="font-medium">Hint:</span> {{ hint }}
      </div>

      <div v-if="author" class="text-sm italic">
        — {{ author }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  encryptedLines: string[]
  originalLines: string[]
  hint?: string
  author?: string
  showAnswers?: boolean
}>()
</script>
