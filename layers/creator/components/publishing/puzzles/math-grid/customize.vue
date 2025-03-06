<template>
  <div class="space-y-6">
    <!-- Grid Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Grid Settings</h3>
      
      <!-- Grid Size -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Grid Size</label>
        <select
          v-model="settings.gridSize"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option v-for="size in [4, 5, 6, 7, 8, 9]" :key="size" :value="size">
            {{ size }}×{{ size }}
          </option>
        </select>
      </div>

      <!-- Difficulty -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Difficulty Level</label>
        <select
          v-model="settings.difficulty"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="easy">Easy - Simple operations with smaller numbers</option>
          <option value="medium">Medium - Mixed operations with moderate numbers</option>
          <option value="hard">Hard - Complex operations with larger numbers</option>
        </select>
      </div>

      <!-- Operations -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Mathematical Operations</label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div 
            v-for="op in availableOperations"
            :key="op.operator"
            class="flex items-center gap-2"
          >
            <input
              type="checkbox"
              :checked="isOperationSelected(op)"
              @change="toggleOperation(op)"
              class="rounded dark:bg-gray-800"
              :disabled="settings.operations.length === 1 && isOperationSelected(op)"
            />
            <label class="text-sm">{{ getOperationLabel(op) }}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Print Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Print Settings</h3>
      
      <!-- Layout Style -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Layout</label>
        <select
          v-model="settings.printLayout"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="compact">Compact - Save space</option>
          <option value="spacious">Spacious - More room for writing</option>
        </select>
      </div>

      <!-- Font Size -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Font Size</label>
        <select
          v-model="settings.fontSize"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <!-- Show Hints -->
      <div class="flex items-center gap-2">
        <input
          v-model="settings.showHints"
          type="checkbox"
          class="rounded dark:bg-gray-800"
        />
        <label class="text-sm">Show operation hints</label>
      </div>
    </div>

    <!-- Colors -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Colors</h3>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Text Color</label>
          <input
            v-model="settings.textColor"
            type="color"
            class="w-full h-10 rounded-md"
          />
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">Background Color</label>
          <input
            v-model="settings.backgroundColor"
            type="color"
            class="w-full h-10 rounded-md"
          />
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">Border Color</label>
          <input
            v-model="settings.borderColor"
            type="color"
            class="w-full h-10 rounded-md"
          />
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div 
      class="p-4 rounded-md"
      :style="{
        backgroundColor: settings.backgroundColor,
        borderColor: settings.borderColor,
        borderWidth: '1px',
        color: settings.textColor
      }"
    >
      <h4 class="font-medium mb-2">Preview Settings</h4>
      <div class="text-sm space-y-1">
        <div>Grid: {{ settings.gridSize }}×{{ settings.gridSize }}</div>
        <div>Difficulty: {{ settings.difficulty }}</div>
        <div>Operations: {{ getSelectedOperationsText() }}</div>
        <div>Layout: {{ settings.printLayout }}</div>
        <div>Hints: {{ settings.showHints ? 'Shown' : 'Hidden' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

interface MathOperation {
  operator: '+' | '-' | '×' | '÷'
  difficulty: 'easy' | 'medium' | 'hard'
}

interface MathGridSettings {
  gridSize: 4 | 5 | 6 | 7 | 8 | 9
  operations: MathOperation[]
  difficulty: 'easy' | 'medium' | 'hard'
  textColor: string
  backgroundColor: string
  borderColor: string
  fontSize: 'small' | 'medium' | 'large'
  showHints: boolean
  printLayout: 'compact' | 'spacious'
}

const emit = defineEmits<{
  (e: 'update', settings: MathGridSettings): void
}>()

const settings = reactive<MathGridSettings>({
  gridSize: 6,
  operations: [
    { operator: '+', difficulty: 'medium' },
    { operator: '-', difficulty: 'medium' }
  ],
  difficulty: 'medium',
  textColor: '#000000',
  backgroundColor: '#ffffff',
  borderColor: '#cccccc',
  fontSize: 'medium',
  showHints: true,
  printLayout: 'spacious'
})

const availableOperations: MathOperation[] = [
  { operator: '+', difficulty: 'medium' },
  { operator: '-', difficulty: 'medium' },
  { operator: '×', difficulty: 'medium' },
  { operator: '÷', difficulty: 'medium' }
]

const getOperationLabel = (op: MathOperation): string => {
  const labels = {
    '+': 'Addition',
    '-': 'Subtraction',
    '×': 'Multiplication',
    '÷': 'Division'
  }
  return labels[op.operator]
}

const isOperationSelected = (op: MathOperation): boolean => {
  return settings.operations.some(o => o.operator === op.operator)
}

const toggleOperation = (op: MathOperation): void => {
  if (isOperationSelected(op)) {
    if (settings.operations.length > 1) {
      settings.operations = settings.operations.filter(o => o.operator !== op.operator)
    }
  } else {
    settings.operations.push({ ...op, difficulty: settings.difficulty })
  }
}

const getSelectedOperationsText = (): string => {
  return settings.operations
    .map(op => getOperationLabel(op))
    .join(', ')
}

// Update operation difficulties when main difficulty changes
watch(() => settings.difficulty, (newDifficulty) => {
  settings.operations = settings.operations.map(op => ({
    ...op,
    difficulty: newDifficulty
  }))
})

// Emit settings changes
watch(settings, (newSettings) => {
  emit('update', { ...newSettings })
}, { deep: true })
</script>
