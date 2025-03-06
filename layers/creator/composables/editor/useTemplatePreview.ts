import type { Template } from '../types/editor'

export const useTemplatePreview = () => {
  const generatePreview = (template: Template, width: number, height: number): string => {
    // Create canvas element
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Set background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Apply margins if defined
    const margins = template.settings.margins || { top: 0, right: 0, bottom: 0, left: 0 }
    const contentWidth = width - (margins.left + margins.right)
    const contentHeight = height - (margins.top + margins.bottom)
    const contentX = margins.left
    const contentY = margins.top

    // Draw template preview based on type
    switch (template.type) {
      case 'line':
        drawLineTemplate(ctx, template, contentX, contentY, contentWidth, contentHeight)
        break
      case 'grid':
        drawGridTemplate(ctx, template, contentX, contentY, contentWidth, contentHeight)
        break
      case 'specialized':
        drawSpecializedTemplate(ctx, template, contentX, contentY, contentWidth, contentHeight)
        break
    }

    // Return data URL
    return canvas.toDataURL('image/png')
  }

  const drawLineTemplate = (
    ctx: CanvasRenderingContext2D,
    template: Template,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const lineSpacing = template.settings.lineSpacing || 0.25
    const pixelSpacing = lineSpacing * 96 // Convert inches to pixels (96 DPI)

    ctx.beginPath()
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1

    for (let yPos = y; yPos < y + height; yPos += pixelSpacing) {
      ctx.moveTo(x, yPos)
      ctx.lineTo(x + width, yPos)
    }

    ctx.stroke()
  }

  const drawGridTemplate = (
    ctx: CanvasRenderingContext2D,
    template: Template,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const gridSize = template.settings.gridSize || 5
    const pixelSize = gridSize * (96 / 25.4) // Convert mm to pixels (96 DPI)

    ctx.beginPath()
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1

    // Draw vertical lines
    for (let xPos = x; xPos <= x + width; xPos += pixelSize) {
      ctx.moveTo(xPos, y)
      ctx.lineTo(xPos, y + height)
    }

    // Draw horizontal lines
    for (let yPos = y; yPos <= y + height; yPos += pixelSize) {
      ctx.moveTo(x, yPos)
      ctx.lineTo(x + width, yPos)
    }

    // For dot grid, clear lines and draw dots
    if (template.id === 'dot-grid') {
      ctx.clearRect(0, 0, width + x * 2, height + y * 2)
      ctx.fillStyle = '#cccccc'
      for (let xPos = x; xPos <= x + width; xPos += pixelSize) {
        for (let yPos = y; yPos <= y + height; yPos += pixelSize) {
          ctx.beginPath()
          ctx.arc(xPos, yPos, 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } else {
      ctx.stroke()
    }
  }

  const drawSpecializedTemplate = (
    ctx: CanvasRenderingContext2D,
    template: Template,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    // Handle different specialized templates
    if (template.settings.puzzleGrid) {
      drawPuzzleGrid(ctx, template, x, y, width, height)
    } else if (template.settings.recipeLayout) {
      drawRecipeLayout(ctx, template, x, y, width, height)
    } else if (template.settings.photoLayout) {
      drawPhotoLayout(ctx, template, x, y, width, height)
    } else if (template.settings.plannerLayout) {
      drawPlannerLayout(ctx, template, x, y, width, height)
    } else if (template.settings.childrenLayout) {
      drawChildrenLayout(ctx, template, x, y, width, height)
    } else if (template.settings.activityLayout) {
      drawActivityLayout(ctx, template, x, y, width, height)
    } else if (template.id === 'music-staff') {
      drawMusicStaff(ctx, template, x, y, width, height)
    } else if (template.id === 'cornell-notes') {
      drawCornellNotes(ctx, template, x, y, width, height)
    }
  }

  const drawPuzzleGrid = (
    ctx: CanvasRenderingContext2D,
    template: Template,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const grid = template.settings.puzzleGrid!
    const cellWidth = width / grid.cols
    const cellHeight = height / grid.rows

    ctx.beginPath()
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2

    // Draw grid
    for (let i = 0; i <= grid.rows; i++) {
      ctx.moveTo(x, y + i * cellHeight)
      ctx.lineTo(x + width, y + i * cellHeight)
    }
    for (let i = 0; i <= grid.cols; i++) {
      ctx.moveTo(x + i * cellWidth, y)
      ctx.lineTo(x + i * cellWidth, y + height)
    }
    ctx.stroke()
  }

  const drawRecipeLayout = (
    ctx: CanvasRenderingContext2D,
    template: Template,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const layout = template.settings.recipeLayout!
    const ingredientsWidth = width * (layout.ingredientsWidth / 100)

    // Draw sections
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1

    // Ingredients section
    ctx.strokeRect(x, y, ingredientsWidth, height)
    ctx.fillStyle = '#666666'
    ctx.font = '12px sans-serif'
    ctx.fillText('Ingredients', x + 10, y + 20)

    // Instructions section
    ctx.strokeRect(x + ingredientsWidth, y, width - ingredientsWidth, height)
    ctx.fillText('Instructions', x + ingredientsWidth + 10, y + 20)

    // Nutrition table if enabled
    if (layout.hasNutritionTable) {
      const tableHeight = height * 0.2
      ctx.strokeRect(x, y + height - tableHeight, width, tableHeight)
      ctx.fillText('Nutrition Information', x + 10, y + height - tableHeight + 20)
    }
  }

  const drawPhotoLayout = (
    ctx: CanvasRenderingContext2D,
    template: Template,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const layout = template.settings.photoLayout!
    const photoWidth = (width - (layout.columns - 1) * layout.spacing) / layout.columns
    const photoHeight = (height - layout.captionHeight - layout.spacing) / (layout.columns === 1 ? 1 : 2)

    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1

    // Draw photo placeholders
    for (let col = 0; col < layout.columns; col++) {
      for (let row = 0; row < (layout.columns === 1 ? 1 : 2); row++) {
        const photoX = x + col * (photoWidth + layout.spacing)
        const photoY = y + row * (photoHeight + layout.spacing)

        // Photo frame
        ctx.strokeRect(photoX, photoY, photoWidth, photoHeight)

        // Caption area
        ctx.strokeRect(
          photoX,
          photoY + photoHeight,
          photoWidth,
          layout.captionHeight
        )

        // Photo icon
        ctx.fillStyle = '#cccccc'
        ctx.beginPath()
        ctx.moveTo(photoX + photoWidth/2, photoY + photoHeight/2)
        ctx.arc(photoX + photoWidth/2, photoY + photoHeight/2, 20, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  const drawPlannerLayout = (
    ctx: CanvasRenderingContext2D,
    template: Template,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const layout = template.settings.plannerLayout!
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1
    ctx.fillStyle = '#666666'
    ctx.font = '12px sans-serif'

    if (layout.type === 'daily') {
      // Header
      ctx.strokeRect(x, y, width, height * 0.1)
      ctx.fillText('Daily Schedule', x + 10, y + 20)

      // Time slots if enabled
      if (layout.hasTimeSlots) {
        const slotHeight = height * 0.05
        for (let i = 0; i < 12; i++) {
          const slotY = y + height * 0.1 + i * slotHeight
          ctx.strokeRect(x, slotY, width * 0.2, slotHeight)
          ctx.strokeRect(x + width * 0.2, slotY, width * 0.8, slotHeight)
        }
      }

      // Trackers if enabled
      if (layout.hasTrackers) {
        const trackerY = y + height * 0.8
        ctx.strokeRect(x, trackerY, width, height * 0.2)
        ctx.fillText('Daily Trackers', x + 10, trackerY + 20)
      }
    } else if (layout.type === 'weekly') {
      // Draw 7 columns for days
      const colWidth = width / 7
      for (let i = 0; i < 7; i++) {
        ctx.strokeRect(x + i * colWidth, y, colWidth, height)
        ctx.fillText(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          x + i * colWidth + 10, y + 20)
      }
    }
  }

  const drawMusicStaff = (
    ctx: CanvasRenderingContext2D,
    template: Template,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const staffHeight = 40
    const lineSpacing = staffHeight / 4

    ctx.beginPath()
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1

    // Draw multiple staff systems
    for (let staffY = y; staffY < y + height; staffY += staffHeight * 2) {
      // Draw 5 lines per staff
      for (let line = 0; line < 5; line++) {
        ctx.moveTo(x, staffY + line * lineSpacing)
        ctx.lineTo(x + width, staffY + line * lineSpacing)
      }
    }
    ctx.stroke()
  }

  const drawCornellNotes = (
    ctx: CanvasRenderingContext2D,
    template: Template,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1
    ctx.fillStyle = '#666666'
    ctx.font = '12px sans-serif'

    // Cue column (left)
    const cueWidth = width * 0.25
    ctx.strokeRect(x, y, cueWidth, height * 0.8)
    ctx.fillText('Cues', x + 10, y + 20)

    // Notes area (right)
    ctx.strokeRect(x + cueWidth, y, width - cueWidth, height * 0.8)
    ctx.fillText('Notes', x + cueWidth + 10, y + 20)

    // Summary area (bottom)
    ctx.strokeRect(x, y + height * 0.8, width, height * 0.2)
    ctx.fillText('Summary', x + 10, y + height * 0.8 + 20)
  }

  const drawChildrenLayout = (
    ctx: CanvasRenderingContext2D,
    template: Template,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const layout = template.settings.childrenLayout!
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1
    ctx.fillStyle = '#666666'
    ctx.font = '12px sans-serif'

    if (layout.type === 'picture-book' || layout.type === 'chapter-book') {
      // Calculate areas based on text position
      const textAreaHeight = height * 0.3
      const illustrationHeight = height - textAreaHeight

      if (layout.hasIllustrationArea) {
        // Illustration area
        ctx.strokeRect(x, y, width, layout.textPosition === 'bottom' ? illustrationHeight : height)

        // Illustration placeholder
        ctx.fillStyle = '#cccccc'
        ctx.beginPath()
        ctx.moveTo(x + width/2, y + illustrationHeight/2)
        ctx.arc(x + width/2, y + illustrationHeight/2, 30, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#666666'
      }

      if (layout.hasTextArea && layout.textPosition === 'bottom') {
        // Text area at bottom
        ctx.strokeRect(x, y + illustrationHeight, width, textAreaHeight)
        ctx.fillText('Text Area', x + 10, y + illustrationHeight + 20)

        // Text lines
        const lineSpacing = 15
        for (let i = 0; i < 3; i++) {
          const lineY = y + illustrationHeight + 40 + i * lineSpacing
          ctx.beginPath()
          ctx.moveTo(x + 10, lineY)
          ctx.lineTo(x + width - 10, lineY)
          ctx.stroke()
        }
      }
    } else if (layout.type === 'early-reader') {
      // Split layout for early readers
      const textWidth = width * 0.5

      if (layout.hasIllustrationArea) {
        // Illustration area on left
        ctx.strokeRect(x, y, textWidth, height)

        // Illustration placeholder
        ctx.fillStyle = '#cccccc'
        ctx.beginPath()
        ctx.moveTo(x + textWidth/2, y + height/2)
        ctx.arc(x + textWidth/2, y + height/2, 30, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#666666'
      }

      if (layout.hasTextArea) {
        // Large text area on right
        ctx.strokeRect(x + textWidth, y, textWidth, height)
        ctx.fillText('Large Text Area', x + textWidth + 10, y + 20)

        // Text lines with large spacing
        const lineSpacing = 30
        for (let i = 0; i < 5; i++) {
          const lineY = y + 40 + i * lineSpacing
          ctx.beginPath()
          ctx.moveTo(x + textWidth + 10, lineY)
          ctx.lineTo(x + width - 10, lineY)
          ctx.stroke()
        }
      }
    }
  }

  const drawActivityLayout = (
    ctx: CanvasRenderingContext2D,
    template: Template,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const layout = template.settings.activityLayout!
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1
    ctx.fillStyle = '#666666'
    ctx.font = '12px sans-serif'

    // Instructions area if enabled
    if (layout.hasInstructions) {
      const instructionHeight = height * 0.15
      ctx.strokeRect(x, y, width, instructionHeight)
      ctx.fillText('Instructions', x + 10, y + 20)
    }

    const contentY = layout.hasInstructions ? y + height * 0.15 : y
    const contentHeight = layout.hasAnswerArea
      ? (height * (layout.hasInstructions ? 0.7 : 0.85))
      : (height * (layout.hasInstructions ? 0.85 : 1))

    // Activity area
    ctx.strokeRect(x, contentY, width, contentHeight)

    // Draw activity preview based on type
    switch (layout.type) {
      case 'maze':
        drawMazePreview(ctx, x, contentY, width, contentHeight, layout.difficulty)
        break
      case 'connect-dots':
        drawConnectDotsPreview(ctx, x, contentY, width, contentHeight, layout.difficulty)
        break
      case 'coloring':
        drawColoringPreview(ctx, x, contentY, width, contentHeight)
        break
      case 'worksheet':
        drawWorksheetPreview(ctx, x, contentY, width, contentHeight)
        break
    }

    // Answer area if enabled
    if (layout.hasAnswerArea) {
      const answerY = contentY + contentHeight
      const answerHeight = height * 0.15
      ctx.strokeRect(x, answerY, width, answerHeight)
      ctx.fillText('Answer Area', x + 10, answerY + 20)
    }
  }

  const drawMazePreview = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    difficulty: string
  ) => {
    const gridSize = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12
    const cellSize = Math.min(width, height) / gridSize

    ctx.beginPath()
    ctx.strokeStyle = '#999999'
    ctx.lineWidth = 2

    // Draw simplified maze pattern
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (Math.random() > 0.5) {
          ctx.moveTo(x + i * cellSize, y + j * cellSize)
          ctx.lineTo(x + (i + 1) * cellSize, y + j * cellSize)
        }
        if (Math.random() > 0.5) {
          ctx.moveTo(x + i * cellSize, y + j * cellSize)
          ctx.lineTo(x + i * cellSize, y + (j + 1) * cellSize)
        }
      }
    }
    ctx.stroke()
  }

  const drawConnectDotsPreview = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    difficulty: string
  ) => {
    const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30
    const radius = 3

    ctx.fillStyle = '#666666'

    // Draw random dots
    for (let i = 0; i < points; i++) {
      const dotX = x + Math.random() * width
      const dotY = y + Math.random() * height

      ctx.beginPath()
      ctx.arc(dotX, dotY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Add number
      ctx.fillText(String(i + 1), dotX + 5, dotY + 5)
    }
  }

  const drawColoringPreview = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = '#999999'
    ctx.lineWidth = 1

    // Draw simple shape outlines
    ctx.beginPath()
    ctx.moveTo(x + width * 0.2, y + height * 0.8)
    ctx.quadraticCurveTo(x + width * 0.5, y + height * 0.2, x + width * 0.8, y + height * 0.8)
    ctx.quadraticCurveTo(x + width * 0.5, y + height * 0.6, x + width * 0.2, y + height * 0.8)
    ctx.stroke()

    // Add some detail lines
    ctx.beginPath()
    ctx.moveTo(x + width * 0.3, y + height * 0.6)
    ctx.quadraticCurveTo(x + width * 0.5, y + height * 0.4, x + width * 0.7, y + height * 0.6)
    ctx.stroke()
  }

  const drawWorksheetPreview = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    // Split into quadrants
    const halfWidth = width / 2
    const halfHeight = height / 2

    // Draw grid in top left
    drawGridTemplate(ctx, { settings: { gridSize: 10 } } as Template, x, y, halfWidth, halfHeight)

    // Draw lines in top right
    drawLineTemplate(ctx, { settings: { lineSpacing: 0.25 } } as Template, x + halfWidth, y, halfWidth, halfHeight)

    // Draw dots in bottom left
    drawConnectDotsPreview(ctx, x, y + halfHeight, halfWidth, halfHeight, 'easy')

    // Draw shape in bottom right
    drawColoringPreview(ctx, x + halfWidth, y + halfHeight, halfWidth, halfHeight)
  }

  return {
    generatePreview
  }
}
