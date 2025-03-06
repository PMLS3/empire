<template>
  <div class="space-y-6">
    <!-- Original and Encrypted Text -->
    <div class="space-y-4">
      <div 
        v-for="(line, lineIndex) in encryptedLines" 
        :key="lineIndex"
        class="space-y-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
      >
        <!-- Encrypted text -->
        <div class="font-mono text-lg tracking-wider text-gray-500 dark:text-gray-400 line-through">
          {{ line }}
        </div>

        <!-- Decrypted text -->
        <div class="font-mono text-lg tracking-wider text-primary-600 dark:text-primary-400">
          {{ originalLines[lineIndex] }}
        </div>

        <!-- Letter mapping -->
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ getLetterMappings(line, originalLines[lineIndex]) }}
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Encryption Type</div>
          <div class="mt-1 text-2xl font-semibold capitalize">{{ encryptionType }}</div>
        </div>
        <div v-if="encryptionType === 'caesar'">
          <div class="text-sm text-gray-500 dark:text-gray-400">Shift Amount</div>
          <div class="mt-1 text-2xl font-semibold">{{ shift }}</div>
        </div>
        <div v-if="encryptionType === 'keyword'">
          <div class="text-sm text-gray-500 dark:text-gray-400">Keyword</div>
          <div class="mt-1 text-2xl font-semibold font-mono">{{ keyword }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Unique Letters</div>
          <div class="mt-1 text-2xl font-semibold">{{ countUniqueLetters() }}</div>
        </div>
      </div>
    </div>

    <!-- Letter Substitution Table -->
    <div class="overflow-hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div class="p-4">
        <h3 class="font-medium text-gray-900 dark:text-gray-100">Letter Substitution Table:</h3>
      </div>
      <div class="border-t border-gray-200 dark:border-gray-700">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                v-for="letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"
                :key="letter"
                class="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {{ letter }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr>
              <td
                v-for="letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"
                :key="letter"
                class="px-2 py-3 text-center text-sm font-mono text-primary-600 dark:text-primary-400"
              >
                {{ getSubstitutionLetter(letter) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tips -->
    <div class="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 p-4 rounded-lg">
      <div class="flex items-center gap-2">
        <span class="material-icons">lightbulb</span>
        <span class="font-medium">Cryptogram Solving Tips:</span>
      </div>
      <ul class="mt-2 ml-8 list-disc space-y-1 text-sm">
        <li>Look for patterns in letter frequency</li>
        <li>Start with common short words (THE, AND, IS)</li>
        <li>Identify repeated letters within words</li>
        <li>Use letter patterns at word endings (-ING, -ED)</li>
        <li>Consider the context and possible themes</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  encryptedLines: string[]
  originalLines: string[]
  encryptionType: 'substitution' | 'caesar' | 'keyword'
  shift?: number
  keyword?: string
}>()

const getLetterMappings = (encrypted: string, original: string): string => {
  const mappings = new Map<string, string>()
  for (let i = 0; i < encrypted.length; i++) {
    if (/[A-Z]/.test(encrypted[i])) {
      mappings.set(encrypted[i], original[i])
    }
  }
  return Array.from(mappings.entries())
    .map(([from, to]) => `${from}→${to}`)
    .join(', ')
}

const countUniqueLetters = (): number => {
  const letters = new Set()
  props.encryptedLines.forEach(line => {
    line.split('').forEach(char => {
      if (/[A-Z]/.test(char)) {
        letters.add(char)
      }
    })
  })
  return letters.size
}

const getSubstitutionLetter = (letter: string): string => {
  if (props.encryptionType === 'caesar' && props.shift) {
    const code = letter.charCodeAt(0) - 65
    const shifted = ((code + props.shift) % 26 + 26) % 26
    return String.fromCharCode(shifted + 65)
  }
  
  // Find the substitution in the encrypted text
  for (let i = 0; i < props.encryptedLines.length; i++) {
    const encrypted = props.encryptedLines[i]
    const original = props.originalLines[i]
    for (let j = 0; j < encrypted.length; j++) {
      if (encrypted[j] === letter) {
        return original[j]
      }
    }
  }
  
  return '?'
}
</script>
