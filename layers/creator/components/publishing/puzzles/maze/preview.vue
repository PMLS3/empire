<template>
  <div class="space-y-6">
    <!-- Maze Grid -->
    <div 
      class="relative"
      :style="{
        width: settings.printLayout === 'compact' ? 'auto' : '100%',
        maxWidth: '800px',
        margin: '0 auto'
      }"
    >
      <!-- Grid Container -->
      <div 
        class="grid"
        :style="{
          gridTemplateColumns: `repeat(${settings.width}, ${getCellSize()}px)`,
          backgroundColor: settings.wallColor,
          gap: `${getWallThickness()}px`,
          padding: `${getWallThickness()}px`,
          borderRadius: '0.5rem'
        }"
      >
        <template v-for="(row, y) in maze.grid" :key="`row-${y}`">
          <template v-for="(cell, x) in row" :key="`cell-${x}-${y}`">
            <div
              class="relative"
              :style="{
                backgroundColor: getCellBackground(cell),
                aspectRatio: '1',
                borderRadius: '2px'
              }"
            >
              <!-- Cell Content -->
              <div 
                class="absolute inset-0"
                :style="{
                  borderTop: !cell.walls.top ? 'none' : `${getWallThickness()}px solid ${settings.wallColor}`,
                  borderRight: !cell.walls.right ? 'none' : `${getWallThickness()}px solid ${settings.wallColor}`,
                  borderBottom: !cell.walls.bottom ? 'none' : `${getWallThickness()}px solid ${settings.wallColor}`,
                  borderLeft: !cell.walls.left ? 'none' : `${getWallThickness()}px solid ${settings.wallColor}`
                }"
              >
                <!-- Start/End Markers -->
                <template v-if="cell.isStart || cell.isEnd">
                  <div 
                    class="absolute inset-2 flex items-center justify-center rounded-full"
                    :style="{
                      backgroundColor: cell.isStart ? settings.startColor : settings.endColor,
                      color: settings.backgroundColor,
                      fontSize: `${getCellSize() * 0.4}px`,
                      fontWeight: 'bold'
                    }"
                  >
                    {{ cell.isStart ? 'S' : 'E' }}
                  </div>
                </template>
              </div>
            </div>
          </template>
        </template>
      </div>

      <!-- Instructions -->
      <div 
        class="mt-6 p-4 rounded-md"
        :style="{
          backgroundColor: settings.backgroundColor,
          borderColor: settings.wallColor,
          borderWidth: '1px',
          color: settings.wallColor
        }"
      >
        <h4 class="font-medium mb-2">How to Solve</h4>
        <div class="space-y-4">
          <!-- Basic Instructions -->
          <ol class="list-decimal list-inside space-y-1 text-sm">
            <li>Start from the cell marked 'S'</li>
            <li>Find a path to the cell marked 'E'</li>
            <li>You can only move through open passages</li>
            <li>Walls cannot be crossed</li>
          </ol>

          <!-- Difficulty Info -->
          <div class="text-sm">
            <div class="font-medium mb-1">Difficulty: {{ settings.difficulty }}</div>
            <div class="text-sm opacity-75">
              {{ getDifficultyDescription() }}
            </div>
          </div>

          <!-- Grid Info -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div class="p-3 rounded-md bg-opacity-10" :style="{ backgroundColor: settings.wallColor }">
              <div class="opacity-75">Grid Size</div>
              <div class="font-bold">{{ settings.width }}×{{ settings.height }}</div>
            </div>
            <div class="p-3 rounded-md bg-opacity-10" :style="{ backgroundColor: settings.startColor }">
              <div class="opacity-75">Start Point</div>
              <div class="font-bold">{{ getStartPosition() }}</div>
            </div>
            <div class="p-3 rounded-md bg-opacity-10" :style="{ backgroundColor: settings.endColor }">
              <div class="opacity-75">End Point</div>
              <div class="font-bold">{{ getEndPosition() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MazeSettings, Cell } from './generator'

const props = defineProps<{
  maze: {
    grid: Cell[][]
    solution: Cell[]
  }
  settings: MazeSettings
}>()

const getCellSize = (): number => {
  const sizes = {
    small: 20,
    medium: 30,
    large: 40
  }
  return sizes[props.settings.cellSize]
}

const getWallThickness = (): number => {
  const thicknesses = {
    thin: 1,
    medium: 2,
    thick: 3
  }
  return thicknesses[props.settings.wallThickness]
}

const getCellBackground = (cell: Cell): string => {
  if (cell.isStart) return props.settings.startColor
  if (cell.isEnd) return props.settings.endColor
  return props.settings.backgroundColor
}

const getDifficultyDescription = (): string => {
  switch (props.settings.difficulty) {
    case 'easy':
      return 'Simple paths with clear directions to the exit'
    case 'medium':
      return 'Multiple paths and moderate complexity'
    case 'hard':
      return 'Complex paths with many decision points'
    default:
      return ''
  }
}

const getStartPosition = (): string => {
  for (let y = 0; y < props.maze.grid.length; y++) {
    for (let x = 0; x < props.maze.grid[y].length; x++) {
      if (props.maze.grid[y][x].isStart) {
        return `(${x + 1}, ${y + 1})`
      }
    }
  }
  return '(1, 1)'
}

const getEndPosition = (): string => {
  for (let y = 0; y < props.maze.grid.length; y++) {
    for (let x = 0; x < props.maze.grid[y].length; x++) {
      if (props.maze.grid[y][x].isEnd) {
        return `(${x + 1}, ${y + 1})`
      }
    }
  }
  return `(${props.settings.width}, ${props.settings.height})`
}
</script>
