<script lang="ts" setup>
import type{ Page, Element, Book } from '../../../types/editor'
import { useDrawingTools } from '../../../composables/useDrawingTools'
import { useShapeTools } from '../../../composables/useShapeTools'
import PreviewMode from './PreviewMode.vue'

interface Guide {
  orientation: 'horizontal' | 'vertical'
  position: number
  index: number
  style: {
    position: 'absolute'
    top?: string
    left?: string
    right?: string
    bottom?: string
    height?: string
    width?: string
    backgroundColor: string
    pointerEvents: 'none'
    zIndex: number
  }
}

const { drawingState } = useDrawingTools()
const { shapeState } = useShapeTools()

const { book, BookSizeOptions } = usePublishing()
const toaster = useToaster()

const {
  editorState,
  selectedElement,
  gridStyle,
  selectElement,
  orderElement,
  updateElementStyle,
  updatePuzzleProperties,
  createDrawingElement,
  toggleGrid,
  toggleGuides,
  toggleSnapToGrid,
  toggleMargins,
  startCanvasDrag,
  updateCanvasDrag,
  stopCanvasDrag,
  zoomIn,
  zoomOut,
  updateOrientation,
  updateSnapThreshold,
  updateGuideColor,
  toggleMeasurements,
  setSelectedPage,
  createPathElement,
  updatePathElement,
  createShapeElement,
  createTextElement,
  updateElementText,
} = useEditor()

const generateId = () => {
  return Math.random().toString(36).substring(2, 9)
}

// Pages state
const pages = computed({
  get() {
    return (book.value as Book).pages || []
  },
  set(newPages: Page[]) {
    ;(book.value as Book).pages = newPages
  }
})

// Initialize pages if they don't exist
if (!book.value.pages) {
  book.value.pages = [
    {
      id: generateId(),
      type: 'cover',
      name: 'Cover',
      content: '',
      images: [],
      elements: []
    }
  ]
}

// Initialize selected page if not set
if (!editorState.value.selectedPage && pages.value.length > 0) {
  setSelectedPage(pages.value[0])
}

// Selected page with type
const selectedPage = computed(() => editorState.value.selectedPage)

// Convert cm to pixels (assuming 96 DPI)
const cmToPixels = (cm: number) => Math.round((cm || 0) * 37.795275591)

// Default size (A4)
const defaultSize = { width: 21, height: 29.7, label: 'A4' }

// Page state
const selectedSize = ref(BookSizeOptions.value[0] || defaultSize)

// Add these computed properties for section widths
const coverSectionWidths = computed(() => {
  const baseWidth = cmToPixels(selectedSize.value?.width || defaultSize.width)
  const pageCount = pages.value?.length || 1
  const spineWidth = cmToPixels(pageCount * 0.002 * 2.54)
  return {
    backCover: baseWidth,
    spine: spineWidth,
    frontCover: baseWidth
  }
})

// Page dimensions in pixels
const canvasDimensions = computed(() => {
  const size = selectedSize.value || defaultSize
  const width = cmToPixels(size.width || defaultSize.width)
  const height = cmToPixels(size.length || defaultSize.height)

  // If this is a cover page, calculate spine width and total width
  if (selectedPage.value?.type === 'cover') {
    // Calculate spine width based on page count (approximately 0.002 inches per page)
    const pageCount = pages.value?.length || 1 // Ensure at least 1 page
    const spineWidthInches = pageCount * 0.002
    const spineWidthCm = spineWidthInches * 2.54
    const spineWidth = cmToPixels(spineWidthCm)

    // For cover pages, we need space for front cover + spine + back cover
    const totalWidth = (width * 2) + spineWidth

    return editorState.value.orientation === 'landscape'
      ? { width: height, height: totalWidth }
      : { width: totalWidth, height }
  }

  // For regular pages, return normal dimensions
  return editorState.value.orientation === 'landscape'
    ? { width: height, height: width }
    : { width, height }
})

// Margins in pixels
const margins = computed(() => ({
  top: cmToPixels(2),
  right: cmToPixels(2),
  bottom: cmToPixels(2),
  left: cmToPixels(2)
}))

// Toolbar actions
const toolbarActions = ref([
  {
    id: 'drawing',
    icon: 'ph:pencil-line-duotone',
    label: 'Draw',
    isActive: computed(() => editorState.value?.drawing?.active || false)
  },
  {
    id: 'shape',
    icon: 'ph:shapes-duotone',
    label: 'Shape',
    isActive: computed(() => editorState.value?.shape?.active || false)
  },
  {
    id: 'text',
    icon: 'ph:text-t-duotone',
    label: 'Text',
    isActive: computed(() => editorState.value?.text?.active || false)
  },
  {
    id: 'puzzle',
    icon: 'ph:puzzle-piece-duotone',
    label: 'Puzzle',
    isActive: computed(() => isPuzzleGeneratorOpen.value || false)
  },
  {
    id: 'image',
    icon: 'ph:image-duotone',
    label: 'Image',
    isActive: computed(() => isImagePickerOpen.value || false)
  },
  {
    id: 'template',
    icon: 'ph:layout-duotone',
    label: 'Template',
    isActive: computed(() => isLayoutPickerOpen.value || false)
  },
  {
    id: 'preview',
    icon: 'ph:eye-duotone',
    label: 'Preview',
    isActive: computed(() => isPreviewMode.value || false)
  }
])

// Modal state
const isLayoutPickerOpen = ref(false)
const isPuzzleGeneratorOpen = ref(false)
const isImagePickerOpen = ref(false)
const isPreviewMode = ref(false)

// Add missing state
const fonts = ref([
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Courier New', value: 'Courier New' }
])

const selectedFont = ref(fonts.value[0])

const colors = ref([
  { label: 'Black', value: '#000000' },
  { label: 'White', value: '#FFFFFF' },
  { label: 'Red', value: '#FF0000' },
  { label: 'Blue', value: '#0000FF' }
])

const selectedColor = ref(colors.value[0])

// Update the guide handling in the editor component
const horizontalGuides = ref<number[]>([])
const verticalGuides = ref<number[]>([])

// Replace the drawGuides computed property with this:
const drawGuides = computed(() => {
  const hGuides = horizontalGuides.value.map((position, index) => ({
    orientation: 'horizontal' as const,
    position,
    index,
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: `${position}px`,
      height: '1px',
      backgroundColor: editorState.value.guideColor,
      pointerEvents: 'none',
      zIndex: 1000
    }
  }))

  const vGuides = verticalGuides.value.map((position, index) => ({
    orientation: 'vertical' as const,
    position,
    index,
    style: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: `${position}px`,
      width: '1px',
      backgroundColor: editorState.value.guideColor,
      pointerEvents: 'none',
      zIndex: 1000
    }
  }))

  return [...hGuides, ...vGuides]
})

// Handle layout selection
const handleLayoutSelect = (layout: { id: string; name: string }) => {
  if (!selectedPage.value) return

  selectedPage.value.type = 'layout'
  selectedPage.value.content = layout.id

  isLayoutPickerOpen.value = false

  toaster.show({
    title: 'Layout Selected',
    message: `Layout "${layout.name}" has been applied to the page.`,
    color: 'success'
  })
}

// Handle puzzle creation
const handlePuzzleCreate = (puzzle: any) => {
  console.log('handlePuzzleCreate', puzzle)
  if (!selectedPage.value) return

  const puzzleElement: Element = {
    id: generateId(),
    type: 'puzzle',
    puzzle: {
      type: 'word-search',
      content: {
        ...puzzle.content,
        showSolution: false
      }
    },
    style: {
      width: '400px',
      height: '400px',
      top: '50px',
      left: '50px',
      transform: 'rotate(0deg)',
      zIndex: '1'
    }
  }

  // Add solution on next page
  const solutionElement: Element = {
    id: generateId(),
    linkId: puzzleElement.id,
    type: 'puzzle',
    puzzle: {
      type: 'word-search',
      content: {
        ...puzzle.content,
        showSolution: true
      }
    },
    style: {
      width: '400px',
      height: '400px',
      top: '50px',
      left: '50px',
      transform: 'rotate(0deg)',
      zIndex: '1'
    }
  }

  // Add puzzle to current page
  if (!selectedPage.value.elements) {
    selectedPage.value.elements = []
  }
  selectedPage.value.elements.push(puzzleElement)

  // Create solution page if it doesn't exist
  const nextPageIndex = pages.value.findIndex((p: Page) => p.id === selectedPage.value.id) + 1
  if (!pages.value[nextPageIndex]) {
    pages.value.push({
      id: generateId(),
      type: 'content',
      name: 'Solution',
      elements: []
    })
  }

  // Add solution to next page
  const nextPage = pages.value[nextPageIndex]
  if (!nextPage.elements) {
    nextPage.elements = []
  }
  nextPage.elements.push(solutionElement)

  // Select the puzzle element on current page
  selectElement(puzzleElement.id)
  isPuzzleGeneratorOpen.value = false

  toaster.show({
    title: 'Puzzle Created',
    message: 'Word search puzzle has been added to the page.',
    color: 'success'
  })
}

// Handle image upload
const setImage = (images: Array<{ src: string }>) => {
  console.log('IMG', images)
  if (!selectedPage.value || !images?.length) return



  if (!selectedPage.value.elements) {
    selectedPage.value.elements = []
  }

  for (const image of images) {
  const imageElement: Element = {
    id: generateId(),
    type: 'image',
    content: image.src,
    style: {
      width: '200px',
      height: '200px',
      top: '50px',
      left: '50px',
      transform: 'rotate(0deg)',
      zIndex: '1'
    }
  }

  selectedPage.value.elements.push(imageElement)

selectElement(imageElement.id)
isImagePickerOpen.value = false

toaster.show({
  title: 'Image Added',
  message: 'Image has been added to the page.',
  color: 'success'
})
  }

}

// Canvas handlers
const currentPath = ref<Array<{ x: number; y: number }>>([])
const currentPathId = ref<string | null>(null)
const currentShapeId = ref<string | null>(null)

// Default drawing settings if drawingState is not initialized
const defaultDrawingSettings = {
  color: '#000000',
  brushSize: 2,
  opacity: 1,
  brushType: 'pencil'
}

const handleCanvasMouseDown = (e: MouseEvent) => {
  if (editorState.value.drawing.active) {
    const rect = e.currentTarget.getBoundingClientRect()
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    currentPath.value = [point]
    // Create initial path element
    const element = createPathElement(currentPath.value, {
      brushSize: drawingState?.value?.brushSize ?? defaultDrawingSettings.brushSize,
      color: drawingState?.value?.color ?? defaultDrawingSettings.color,
      opacity: drawingState?.value?.opacity ?? defaultDrawingSettings.opacity,
      type: drawingState?.value?.brushType ?? defaultDrawingSettings.brushType
    })
    currentPathId.value = element.id
    editorState.value.drawing.isDrawing = true
  } else if (editorState.value.shape.active) {
    const rect = e.currentTarget.getBoundingClientRect()
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    editorState.value.shape.startPoint = point
    editorState.value.shape.isDrawing = true

    // Create initial shape element
    const element = createShapeElement(
      point,
      { width: 1, height: 1 },
      {
        type: shapeState.value.type,
        fill: shapeState.value.fill,
        stroke: shapeState.value.stroke,
        strokeWidth: shapeState.value.strokeWidth,
        opacity: shapeState.value.opacity,
        cornerRadius: shapeState.value.cornerRadius,
        isFilled: shapeState.value.isFilled,
        hasStroke: shapeState.value.hasStroke
      }
    )
    currentShapeId.value = element.id
  } else {
    startCanvasDrag({ x: e.clientX, y: e.clientY })
  }
}

const handleCanvasMouseMove = (e: MouseEvent) => {
  if (editorState.value.drawing.active && editorState.value.drawing.isDrawing) {
    const rect = e.currentTarget.getBoundingClientRect()
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    currentPath.value.push(point)
    // Update the existing path element
    if (currentPathId.value) {
      const element = editorState.value.elements.find(el => el.id === currentPathId.value)
      if (element && element.path) {
        element.path.points = [...currentPath.value]
      }
    }
  } else if (editorState.value.shape.active && editorState.value.shape.isDrawing) {
    const rect = e.currentTarget.getBoundingClientRect()
    const currentPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    editorState.value.shape.endPoint = currentPoint

    // Update shape size
    if (currentShapeId.value) {
      const startPoint = editorState.value.shape.startPoint!
      let width = Math.abs(currentPoint.x - startPoint.x)
      let height = Math.abs(currentPoint.y - startPoint.y)

      // Maintain aspect ratio if shift is held
      if (e.shiftKey) {
        const size = Math.max(width, height)
        width = size
        height = size
      }

      const left = Math.min(currentPoint.x, startPoint.x)
      const top = Math.min(currentPoint.y, startPoint.y)

      updateElementStyle(currentShapeId.value, {
        width: `${width}px`,
        height: `${height}px`,
        left: `${left}px`,
        top: `${top}px`
      })
    }
  } else {
    updateCanvasDrag({ x: e.clientX, y: e.clientY })
  }
}

const handleCanvasMouseUp = () => {
  if (editorState.value.drawing.active && editorState.value.drawing.isDrawing) {
    // Update the path element with final dimensions
    if (currentPathId.value && currentPath.value.length > 1) {
      updatePathElement(currentPathId.value, currentPath.value)
    }
    currentPath.value = []
    currentPathId.value = null
    editorState.value.drawing.isDrawing = false
    editorState.value.drawing.active = false
  } else if (editorState.value.shape.active && editorState.value.shape.isDrawing) {
    currentShapeId.value = null
    editorState.value.shape.isDrawing = false
    editorState.value.shape.startPoint = null
    editorState.value.shape.endPoint = null
    editorState.value.shape.active = false
  } else {
    stopCanvasDrag()
  }
}

// Prevent element selection while in drawing mode
const handleElementSelect = (elementId: string, event: MouseEvent) => {
  if (editorState.value.drawing.active) return
  event.stopPropagation()
  selectElement(elementId)
}

// Update handleElementMove to handle cover sections
const handleElementMove = (elementId: string, position: { x: number; y: number }) => {
  if (selectedPage.value?.type === 'cover') {
    const { x } = position
    const { backCover, spine, frontCover } = coverSectionWidths.value

    // Determine which section the element is in based on x position
    if (x < backCover) {
      // Element is in back cover
      position.x = Math.min(Math.max(0, x), backCover - 20) // Keep within back cover bounds
    } else if (x < backCover + spine) {
      // Element is in spine
      position.x = backCover + (spine / 2) - 10 // Center in spine
    } else {
      // Element is in front cover
      position.x = Math.min(Math.max(backCover + spine, x), backCover + spine + frontCover - 20) // Keep within front cover bounds
    }
  }

  const snappedPosition = snapToNearestPoint(position)
  updateElementStyle(elementId, {
    left: `${snappedPosition.x}px`,
    top: `${snappedPosition.y}px`
  })
}

const handleElementRotate = (elementId: string, rotation: number) => {
  updateElementStyle(elementId, {
    transform: `rotate(${rotation}deg)`
  })
}

const handleElementResize = (elementId: string, size: { width: number; height: number }) => {
  updateElementStyle(elementId, {
    width: `${size.width}px`,
    height: `${size.height}px`
  })
}

// Update snapToNearestPoint to consider cover sections
const snapToNearestPoint = (position: { x: number, y: number }) => {
  if (!editorState.value.snapToGrid) return position

  const { x, y } = position
  const gridSize = editorState.value.gridSize
  const threshold = editorState.value.snapThreshold

  let snappedX = Math.round(x / gridSize) * gridSize
  const snappedY = Math.round(y / gridSize) * gridSize

  // For cover pages, add snapping to section boundaries
  if (selectedPage.value?.type === 'cover') {
    const { backCover, spine } = coverSectionWidths.value
    const sectionBoundaries = [0, backCover, backCover + spine]

    // Find nearest section boundary
    sectionBoundaries.forEach(boundary => {
      if (Math.abs(x - boundary) < threshold) {
        snappedX = boundary
      }
    })
  }

  // Return snapped position if within threshold
  return {
    x: Math.abs(x - snappedX) < threshold ? snappedX : x,
    y: Math.abs(y - snappedY) < threshold ? snappedY : y
  }
}

// Page management
const addPage = () => {
  const newPage: Page = {
    id: generateId(),
    type: 'content',
    name: `Page ${pages.value.length + 1}`,
    elements: []
  }
  pages.value.push(newPage)
  setSelectedPage(newPage)
}

const removePage = (pageId: string) => {
  const index = pages.value.findIndex((p: Page) => p.id === pageId)
  if (index === -1) return

  pages.value.splice(index, 1)
  if (selectedPage.value?.id === pageId) {
    setSelectedPage(pages.value[Math.max(0, index - 1)])
  }
}

const onPageSelect = (page: Page) => {
  setSelectedPage(page)
}

// Watch for page changes to sync elements with editor state
watch(() => selectedPage.value?.elements, (newElements) => {
  if (newElements) {
    editorState.value.elements = newElements
  }
}, { immediate: true })

// Watch editor state elements to sync back to page
watch(() => editorState.value.elements, (newElements) => {
  if (selectedPage.value && newElements) {
    selectedPage.value.elements = newElements
  }
}, { deep: true })

// Computed property for sorted elements
const sortedElements = computed(() => {
  if (!selectedPage.value?.elements) return []

  return [...selectedPage.value.elements].sort((a: Element, b: Element) => {
    const aZ = parseInt(a.style?.zIndex || '1')
    const bZ = parseInt(b.style?.zIndex || '1')
    return aZ - bZ
  })
})

// Selected element data
const selectedElementData = computed(() => {
  if (!selectedElement.value) return null
  return selectedPage.value?.elements?.find((el: Element) => el.id === selectedElement.value?.id)
})

// Guide calculations
const calculateGuideMeasurements = (position: number, orientation: 'horizontal' | 'vertical') => {
  const measurements = []
  const canvasSize = orientation === 'horizontal' ? canvasDimensions.value.width : canvasDimensions.value.height

  // Add start measurement
  measurements.push({
    label: orientation === 'horizontal' ? 'Top' : 'Left',
    value: `${position}px`,
    position: {
      top: orientation === 'vertical' ? 0 : undefined,
      left: orientation === 'horizontal' ? 0 : undefined
    }
  })

  // Add end measurement
  measurements.push({
    label: orientation === 'horizontal' ? 'Bottom' : 'Right',
    value: `${canvasSize - position}px`,
    position: {
      bottom: orientation === 'vertical' ? 0 : undefined,
      right: orientation === 'horizontal' ? 0 : undefined
    }
  })

  return measurements
}

// Handle puzzle customization update
const handlePuzzleCustomization = (elementId: string, customization: any) => {
  updatePuzzleProperties(elementId, customization)
}

// AI Integration
const { sendContextInfo } = useChatGemini()

// Watch for context changes to inform AI
watch([selectedPage, selectedElement], () => {
  const elements = sortedElements.value.map((element: Element) => ({
    id: element.id,
    type: element.type,
    isSelected: element.id === selectedElement.value?.id,
    style: {
      position: {
        left: element.style.left,
        top: element.style.top
      },
      size: {
        width: element.style.width,
        height: element.style.height
      },
      transform: element.style.transform,
      zIndex: element.style.zIndex
    },
    content: element.type === 'puzzle' ? element.puzzle : element.content
  }))

  sendContextInfo({
    type: 'editor',
    context: {
      page: {
        id: selectedPage.value?.id,
        type: selectedPage.value?.type,
        name: selectedPage.value?.name,
        elements
      },
      selectedElement: selectedElement.value?.id,
      availableActions: {
        element: {
          select: 'Select an element by ID',
          order: 'Move element to front or back',
          style: 'Update element style',
          puzzle: 'Update puzzle properties'
        }
      }
    }
  })
})

// AI function handlers
const handleAIElementSelect = (elementId: string) => {
  selectElement(elementId)
}

const handleAIElementOrder = (action: 'front' | 'back') => {
  orderElement(action)
}

const handleAIStyleUpdate = (elementId: string, style: Partial<{ left: string; top: string; width: string; height: string }>) => {
  updateElementStyle(elementId, style)
}

const handleAIPuzzleUpdate = (elementId: string, properties: any) => {
  updatePuzzleProperties(elementId, properties)
}

// Register AI functions
onMounted(() => {
  if (typeof window !== 'undefined') {
    window.AIFunctions = {
      selectElement: handleAIElementSelect,
      orderElement: handleAIElementOrder,
      updateElementStyle: handleAIStyleUpdate,
      updatePuzzleProperties: handleAIPuzzleUpdate
    }
  }
})

const removeElement = (elementId: string) => {
  if (!selectedPage.value) return

  const index = selectedPage.value.elements.findIndex((el: Element) => el.id === elementId)
  if (index === -1) return

  selectedPage.value.elements.splice(index, 1)
  selectElement(null)
}

// Add to your existing state
const guides = ref<Array<{
  id: string
  position: number
  orientation: 'horizontal' | 'vertical'
}>>([])

// Handle guide creation
const handleGuideCreated = (guideData: {
  position: number
  orientation: 'horizontal' | 'vertical'
  id: string
}) => {
  guides.value.push(guideData)
}

// Handle guide updates during drag
const handleGuideUpdated = (update: { id: string; position: number }) => {
  const guide = guides.value.find(g => g.id === update.id)
  if (guide) {
    guide.position = update.position
  }
}

// Handle guide drag end
const handleGuideDragEnd = (guideId: string) => {
  // Optional: Add any cleanup or final position adjustment here
}

// If you don't already have a removeGuide function, uncomment this:
/*
const removeGuide = (guideId: string) => {
  guides.value = guides.value.filter(g => g.id !== guideId)
}
*/

// Update the handleGuideDrag function
const handleGuideDrag = (position: number, orientation: 'horizontal' | 'vertical') => {
  if (orientation === 'horizontal') {
    horizontalGuides.value = [...horizontalGuides.value.filter(pos => pos !== position), position]
  } else {
    verticalGuides.value = [...verticalGuides.value.filter(pos => pos !== position), position]
  }
}

// Remove ALL existing addGuide declarations and replace with this single implementation
const addGuide = (position: number, orientation: 'horizontal' | 'vertical') => {
  // Convert to pixel position relative to canvas
  const canvasPosition = position * (editorState.value.zoom / 100)

  if (orientation === 'horizontal') {
    if (!horizontalGuides.value.includes(canvasPosition)) {
      horizontalGuides.value = [...horizontalGuides.value, canvasPosition]
    }
  } else {
    if (!verticalGuides.value.includes(canvasPosition)) {
      verticalGuides.value = [...verticalGuides.value, canvasPosition]
    }
  }
}

// Update the removeGuide function
const removeGuide = (index: number, orientation: 'horizontal' | 'vertical') => {
  if (orientation === 'horizontal') {
    horizontalGuides.value = horizontalGuides.value.filter((_, i) => i !== index)
  } else {
    verticalGuides.value = verticalGuides.value.filter((_, i) => i !== index)
  }
}

const handleToolSelect = (tool: any) => {
  switch (tool.id) {
    case 'drawing':
      editorState.value.drawing.active = !editorState.value.drawing.active
      break
    case 'shape':
      editorState.value.shape.active = !editorState.value.shape.active
      break
    case 'text':
      editorState.value.text.active = !editorState.value.text.active
      break
    case 'puzzle':
      isPuzzleGeneratorOpen.value = !isPuzzleGeneratorOpen.value
      break
    case 'image':
      isImagePickerOpen.value = !isImagePickerOpen.value
      break
    case 'template':
      isLayoutPickerOpen.value = !isLayoutPickerOpen.value
      break
    case 'preview':
      isPreviewMode.value = !isPreviewMode.value
      break
  }
}

// Add this helper function
const getPathData = (points: Array<{ x: number; y: number }>) => {
  if (points.length < 2) return ''
  const commands: string[] = []
  commands.push(`M ${points[0].x} ${points[0].y}`)
  for (let i = 1; i < points.length; i++) {
    commands.push(`L ${points[i].x} ${points[i].y}`)
  }
  return commands.join(' ')
}

// Preview shape while drawing
const getShapePreviewPath = computed(() => {
  if (!editorState.value.shape.startPoint || !editorState.value.shape.endPoint) return ''

  const startPoint = editorState.value.shape.startPoint
  const endPoint = editorState.value.shape.endPoint
  const width = Math.abs(endPoint.x - startPoint.x)
  const height = Math.abs(endPoint.y - startPoint.y)
  const left = Math.min(endPoint.x, startPoint.x)
  const top = Math.min(endPoint.y, startPoint.y)

  switch (shapeState.value.type) {
    case 'rectangle':
      const cornerRadius = shapeState.value.cornerRadius
      return `M${left + cornerRadius},${top}
              h${width - 2 * cornerRadius}
              a${cornerRadius},${cornerRadius} 0 0 1 ${cornerRadius},${cornerRadius}
              v${height - 2 * cornerRadius}
              a${cornerRadius},${cornerRadius} 0 0 1 -${cornerRadius},${cornerRadius}
              h-${width - 2 * cornerRadius}
              a${cornerRadius},${cornerRadius} 0 0 1 -${cornerRadius},-${cornerRadius}
              v-${height - 2 * cornerRadius}
              a${cornerRadius},${cornerRadius} 0 0 1 ${cornerRadius},-${cornerRadius}`
    case 'circle':
      const rx = width / 2
      const ry = height / 2
      const cx = left + rx
      const cy = top + ry
      return `M${cx + rx},${cy}
              a${rx},${ry} 0 1,1 -${width},0
              a${rx},${ry} 0 1,1 ${width},0`
    case 'triangle':
      return `M${left + width/2},${top} L${left + width},${top + height} L${left},${top + height} Z`
    case 'line':
      return `M${startPoint.x},${startPoint.y} L${endPoint.x},${endPoint.y}`
    case 'polygon':
      const points = []
      const sides = 5
      const centerX = left + width/2
      const centerY = top + height/2
      const polygonRadius = Math.min(width, height) / 2
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
        const x = centerX + polygonRadius * Math.cos(angle)
        const y = centerY + polygonRadius * Math.sin(angle)
        points.push(`${x},${y}`)
      }
      return `M${points.join(' L')} Z`
    default:
      return ''
  }
})

// Add text element creation on canvas click
const handleCanvasClick = (e: MouseEvent) => {
  if (editorState.value.text.active) {
    const rect = e.currentTarget.getBoundingClientRect()
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }

    const { textState } = useTextTools()
    createTextElement(
      point,
      {
        content: 'Double click to edit',
        ...textState.value
      }
    )
    editorState.value.text.active = false
  }
}

const updateElementTextProperties = (elementId: string, updates: any) => {
  const element = editorState.value.elements.find(el => el.id === elementId)
  if (element?.text) {
    element.text = {
      ...element.text,
      ...updates
    }
  }
}

const showElementList = ref(false)
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Top Navigation -->
    <div class="bg-gray-800 dark:bg-gray-900 border-b border-gray-700 w-full">
      <!-- Main toolbar -->
      <div class="flex items-center gap-2 p-2">
        <!-- Font selector -->
        <FormSelect
          v-model="selectedFont"
          placeholder="Select a font"
          class="bg-gray-900 text-white border border-gray-700 rounded px-3 py-1.5 text-sm min-w-[120px]"
        >
        <option v-for="font in fonts" :key="font.value" :value="font.value">
          {{ font.label }}
        </option>
      </FormSelect>

        <!-- Color selector -->
        <FormSelect
          v-model="selectedColor"
          :options="colors"
          placeholder="Select a color"
          class="bg-gray-900 text-white border border-gray-700 rounded px-3 py-1.5 text-sm min-w-[100px]"
        >
          <option v-for="color in colors" :key="color.value" :value="color.value">
            {{ color.label }}
          </option>
        </FormSelect>

        <div class="h-6 border-r border-gray-700 mx-2"></div>

        <!-- Text alignment -->
        <BaseButtonIcon
          v-for="align in ['left', 'center', 'right']"
          :key="align"
          class="p-1.5 rounded hover:bg-gray-700"
          :data-nui-tooltip="`Align ${align}`"
          data-nui-tooltip-position="down"
        >
          <Icon :name="`ic:baseline-align-horizontal-${align}`" class="w-4 h-4 text-white" />
        </BaseButtonIcon>

        <div class="h-6 border-r border-gray-700 mx-2"></div>

        <!-- Text style -->
        <BaseButtonIcon
          v-for="style in ['bold', 'italic', 'underline']"
          :key="style"
          class="p-1.5 rounded hover:bg-gray-700"
          :data-nui-tooltip="`Toggle ${style}`"
          data-nui-tooltip-position="down"
        >
          <Icon :name="`i-heroicons-${style}`" class="w-4 h-4 text-white" />
        </BaseButtonIcon>

        <div class="h-6 border-r border-gray-700 mx-2"></div>

        <!-- Move Element to front/back -->
        <BaseButtonIcon
          v-for="style in ['front', 'back']"
          :key="style"
          class="p-1.5 rounded hover:bg-gray-700"
          :data-nui-tooltip="`Bring to the ${style}`"
          data-nui-tooltip-position="down"
          @click="orderElement(style as 'front' | 'back')"
          :disabled="!selectedElement"
        >
          <Icon :name="`material-symbols:flip-to-${style}`" class="w-4 h-4" :class="selectedElement ? 'text-white' : 'text-gray-500'" />
        </BaseButtonIcon>
      </div>

      <!-- Editor controls -->
      <div class="flex items-center gap-2 p-2 border-t border-gray-700">
        <!-- Book size -->
        <FormSelect
          v-model="selectedSize"
          :options="BookSizeOptions"
          placeholder="Select a size"
          class="bg-gray-900 text-white border border-gray-700 rounded px-3 py-1.5 text-sm min-w-[120px]"
        >
          <option
            v-for="size in BookSizeOptions"
            :key="size.label"
            :value="size"
          >
            {{ size.label }}
          </option>
        </FormSelect>

        <!-- Orientation -->
        <div class="flex items-center gap-2">
          <BaseButtonIcon
            v-for="orientation in ['portrait', 'landscape']"
            :key="orientation"
            class="p-1.5 rounded hover:bg-gray-700"
            :class="{ 'bg-primary-500': editorState.orientation === orientation }"
            @click="updateOrientation(orientation)"
            :data-nui-tooltip="`Change to ${orientation} mode`"
            data-nui-tooltip-position="down"
          >
            <Icon :name="`i-heroicons-${orientation === 'portrait' ? 'rectangle-group' : 'rectangle-stack'}`" class="w-4 h-4 text-white" />
          </BaseButtonIcon>
        </div>

        <div class="h-6 border-r border-gray-700 mx-2"></div>

        <!-- Tools -->
        <div class="flex items-center gap-2">
          <BaseButtonIcon
            v-for="tool in toolbarActions"
            :key="tool.id"
            class="p-1.5 rounded hover:bg-gray-700"
            :class="{ 'bg-primary-500': tool.isActive }"
            @click="handleToolSelect(tool)"
            :data-nui-tooltip="tool.label"
            data-nui-tooltip-position="down"
          >
            <Icon :name="tool.icon" class="w-4 h-4 text-white" />
          </BaseButtonIcon>
        </div>

        <div class="h-6 border-r border-gray-700 mx-2"></div>

        <!-- Guide Settings -->
        <div class="flex items-center gap-2">
          <FormInput
            v-model="editorState.snapThreshold"
            type="number"
            min="1"
            max="20"
            class="w-16"
            data-nui-tooltip="Guide Sensitivity"
            data-nui-tooltip-position="down"
            @update:model-value="updateSnapThreshold"
          />

          <FormInput
            v-model="editorState.guideColor"
            type="color"
            class="h-8 w-8 p-0 border-0"
            data-nui-tooltip="Guide Color"
            data-nui-tooltip-position="down"
            @update:model-value="updateGuideColor"
          />

          <FormCheckbox
            v-model="editorState.showMeasurements"
            class="h-8"
            data-nui-tooltip="Show Measurements"
            data-nui-tooltip-position="down"
            @update:model-value="toggleMeasurements"
          />
        </div>

        <div class="h-6 border-r border-gray-700 mx-2"></div>

        <!-- Zoom -->
        <div class="flex items-center gap-2">
          <BaseButtonIcon
            class="p-1.5 rounded hover:bg-gray-700"
            @click="zoomOut"
            data-nui-tooltip="Zoom Out"
            data-nui-tooltip-position="down"
          >
            <Icon name="ph:minus-bold" class="w-4 h-4 text-white" />
          </BaseButtonIcon>

          <span class="text-white text-sm">{{ editorState.zoom }}%</span>

          <BaseButtonIcon
            class="p-1.5 rounded hover:bg-gray-700"
            @click="zoomIn"
            data-nui-tooltip="Zoom In"
            data-nui-tooltip-position="down"
          >
            <Icon name="ph:plus-bold" class="w-4 h-4 text-white" />
          </BaseButtonIcon>
        </div>

        <div class="h-6 border-r border-gray-700 mx-2"></div>
        <BaseButtonIcon
            class="p-1.5 rounded hover:bg-gray-700 float-right"
            @click="showElementList = !showElementList"
            data-nui-tooltip="Element List"
            data-nui-tooltip-position="down"
          >
            <Icon :name="showElementList ? 'ph:caret-up-bold' : 'ph:caret-down-bold'" class="w-4 h-4 text-white" />
          </BaseButtonIcon>
      </div>

    </div>

    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left Sidebar -->
      <div class="w-64 bg-gray-800 p-2">

            <PublishingBookPagesList
              :pages="pages"
              :selected-page="selectedPage || pages.value[0]"
              @select="onPageSelect"
              @remove="removePage"
              @add="addPage"
            />

        <!-- Guide Settings -->
        <div v-if="editorState.showGuides" class="mt-4">
          <h3 class="text-sm font-medium text-gray-200 mb-2">Guide Settings</h3>
          <PublishingBookElementsGuideSettings
            :snap-threshold="editorState.snapThreshold"
            :guide-color="editorState.guideColor"
            :show-measurements="editorState.showMeasurements"
            @update:snap-threshold="updateSnapThreshold"
            @update:guide-color="updateGuideColor"
            @update:show-measurements="toggleMeasurements"
          />
        </div>
      </div>
      <!-- Canvas Area -->
      <div
        ref="canvasContainerRef"
        class="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto relative"
        :class="{ 'cursor-grab': !editorState.isDraggingCanvas, 'cursor-grabbing': editorState.isDraggingCanvas, 'cursor-crosshair': editorState.drawing.active }"
        @mousedown="handleCanvasMouseDown"
        @mousemove="handleCanvasMouseMove"
        @mouseup="handleCanvasMouseUp"
        @mouseleave="handleCanvasMouseUp"
        @click="handleCanvasClick"
      >
        <!-- Rulers -->
        <PublishingBookElementsRuler
          v-if="editorState.showGuides"
          orientation="horizontal"
          :length="canvasDimensions.width"
          :scale="editorState.zoom / 100"
          unit="px"
          @guide-created="pos => { addGuide(pos, 'vertical'); handleGuideDrag(pos, 'vertical') }"
        />
        <PublishingBookElementsRuler
          v-if="editorState.showGuides"
          orientation="vertical"
          :length="canvasDimensions.width"
          :scale="editorState.zoom / 100"
          unit="px"
          @guide-created="pos => { addGuide(pos, 'horizontal'); handleGuideDrag(pos, 'horizontal') }"
        />

        <!-- Canvas Content -->
        <div class="min-h-full p-8 flex justify-center items-start">
          <div
            ref="canvasRef"
            class="relative bg-white shadow-lg canvas-container"
            :style="{
              width: `${canvasDimensions.width}px`,
              height: `${canvasDimensions.height}px`,
              transform: `scale(${editorState.zoom / 100})`,
              transformOrigin: 'top center',
              margin: '0 auto',
              ...gridStyle
            }"
            @click.self="selectedElement = null"
          >
            <!-- Cover Layout (Back Cover + Spine + Front Cover) -->
            <template v-if="selectedPage?.type === 'cover'">
              <div class="absolute inset-0 flex">
                <!-- Back Cover -->
                <div
                  class="relative"
                  :style="{
                    width: `${cmToPixels((selectedSize.value?.width || defaultSize.width))}px`,
                    height: '100%',
                    borderRight: '1px dashed #ccc'
                  }"
                >
                  <div class="absolute top-4 left-4 text-xs text-gray-400">Back Cover</div>
                </div>

                <!-- Spine -->
                <div
                  class="relative"
                  :style="{
                    width: `${cmToPixels((pages.value?.length || 1) * 0.002 * 2.54)}px`,
                    height: '100%',
                    borderRight: '1px dashed #ccc',
                    backgroundColor: 'rgba(0,0,0,0.02)'
                  }"
                >
                  <div
                    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-xs text-gray-400"
                  >
                    Spine ({{ ((pages.value?.length || 1) * 0.002 * 2.54).toFixed(2) }}cm)
                  </div>
                </div>

                <!-- Front Cover -->
                <div
                  class="relative"
                  :style="{
                    width: `${cmToPixels((selectedSize.value?.width || defaultSize.width))}px`,
                    height: '100%'
                  }"
                >
                  <div class="absolute top-4 left-4 text-xs text-gray-400">Front Cover</div>
                </div>
              </div>
            </template>

            <!-- Margins visualization -->
            <div
              v-if="editorState.showMargins"
              class="absolute inset-0 pointer-events-none border-gray-200 dark:border-gray-700"
              :style="{
                borderWidth: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
                borderStyle: 'dashed',
                zIndex: '-10'
              }"
            />

            <!-- Guides -->
            <template v-if="editorState.showGuides">
              <!-- Horizontal Guides -->
              <div
                v-for="(guide, index) in drawGuides"
                :key="`h-${index}`"
                class="absolute w-full h-px cursor-row-resize"
                :style="guide.style"
                @dblclick="removeGuide(index, guide.orientation)"
              >
                <!-- Guide Measurements -->
                <template v-if="editorState.showMeasurements">
                  <div
                    v-for="(measurement, mIndex) in calculateGuideMeasurements(guide.position, guide.orientation)"
                    :key="`h-${index}-${mIndex}`"
                    class="absolute px-1 py-0.5 bg-gray-800 text-white text-xs rounded"
                    :style="{
                      top: guide.orientation === 'horizontal' ? '-20px' : '4px',
                      left: measurement.position.left === 0 ? '4px' : 'auto',
                      right: measurement.position.right === 0 ? '4px' : 'auto'
                    }"
                  >
                    {{ measurement.label }}: {{ measurement.value }}
                  </div>
                </template>
              </div>

              <!-- Vertical Guides -->
              <div
                v-for="(guide, index) in drawGuides"
                :key="`v-${index}`"
                class="absolute h-full w-px cursor-col-resize"
                :style="guide.style"
                @dblclick="removeGuide(index, guide.orientation)"
              >
                <!-- Guide Measurements -->
                <template v-if="editorState.showMeasurements">
                  <div
                    v-for="(measurement, mIndex) in calculateGuideMeasurements(guide.position, guide.orientation)"
                    :key="`v-${index}-${mIndex}`"
                    class="absolute px-1 py-0.5 bg-gray-800 text-white text-xs rounded"
                    :style="{
                      left: guide.orientation === 'vertical' ? '-20px' : '4px',
                      top: measurement.position.top === 0 ? '4px' : 'auto',
                      bottom: measurement.position.bottom === 0 ? '4px' : 'auto',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'right center'
                    }"
                  >
                    {{ measurement.label }}: {{ measurement.value }}
                  </div>
                </template>
              </div>
            </template>

            <!-- Center Indicators -->
            <div
              v-if="editorState.showGuides"
                 class="absolute left-1/2 top-0 bottom-0 w-px bg-primary-500 opacity-25"
            />
            <div
              v-if="editorState.showGuides"
              class="absolute top-1/2 left-0 right-0 h-px bg-primary-500 opacity-25"
            />
            <!-- <PublishingBookElements :selectedPage="selectedPage"/> -->
            <!-- Page elements -->
            <template v-if="selectedPage?.elements">
              <template v-for="element in selectedPage.elements" :key="element.id">
                <!-- Add section classes based on position for cover elements -->
                <div
                  v-if="selectedPage.type === 'cover'"
                  :class="{
                    'cover-back': parseInt(element.style.left) < coverSectionWidths.backCover,
                    'cover-spine': parseInt(element.style.left) >= coverSectionWidths.backCover &&
                                  parseInt(element.style.left) < (coverSectionWidths.backCover + coverSectionWidths.spine),
                    'cover-front': parseInt(element.style.left) >= (coverSectionWidths.backCover + coverSectionWidths.spine)
                  }"
                >
                  <PublishingBookElementsPuzzleElement
                    v-if="element?.type === 'puzzle'"
                    :puzzle="element?.puzzle"
                    :style="element?.style"
                    :selected="editorState.selectedElements.has(element.id)"
                    :canvas-width="canvasDimensions.width"
                    :canvas-height="canvasDimensions.height"
                    :grid-size="editorState.gridSize"
                    :snap-to-grid="editorState.snapToGrid"
                    @select="handleElementSelect(element.id, $event)"
                    @resize="size => handleElementResize(element.id, size)"
                    @move="pos => handleElementMove(element.id, pos)"
                    @rotate="angle => handleElementRotate(element.id, angle)"
                  />
                  <PublishingBookElementsImageElement
                    v-else-if="element?.type === 'image'"
                    :image="element?.content"
                    :style="element?.style"
                    :selected="editorState.selectedElements.has(element.id)"
                    :canvas-width="canvasDimensions.width"
                    :canvas-height="canvasDimensions.height"
                    :grid-size="editorState.gridSize"
                    :snap-to-grid="editorState.snapToGrid"
                    @select="handleElementSelect(element.id, $event)"
                    @resize="(id: string, size: any) => handleElementResize(id, size)"
                    @move="(id: string, pos: any) => handleElementMove(id, pos)"
                    @rotate="(id: string, angle: any) => handleElementRotate(id, angle)"
                  />
                  <template v-else-if="element.type === 'path'">
                    <PublishingBookElementsPathElement
                      :element="element"
                      :selected="selectedElement?.id === element.id"
                      :canvas-width="canvasDimensions.width"
                      :canvas-height="canvasDimensions.height"
                      :grid-size="editorState.gridSize"
                      :snap-to-grid="editorState.snapToGrid"
                      @select="selectElement(element.id)"
                      @move="pos => handleElementMove(element.id, pos)"
                      @resize="size => handleElementResize(element.id, size)"
                      @rotate="angle => handleElementRotate(element.id, angle)"
                    />
                  </template>
                  <template v-else-if="element.type === 'shape'">
                    <PublishingBookElementsShapeElement
                      :element="element"
                      :selected="selectedElement?.id === element.id"
                      :canvas-width="canvasDimensions.width"
                      :canvas-height="canvasDimensions.height"
                      :grid-size="editorState.gridSize"
                      :snap-to-grid="editorState.snapToGrid"
                      @select="selectElement(element.id)"
                      @move="pos => handleElementMove(element.id, pos)"
                      @resize="size => handleElementResize(element.id, size)"
                      @rotate="angle => handleElementRotate(element.id, angle)"
                    />
                  </template>
                  <template v-else-if="element.type === 'text'">
                    <PublishingBookElementsTextElement
                      :element="element"
                      :selected="selectedElement?.id === element.id"
                      :canvas-width="canvasDimensions.width"
                      :canvas-height="canvasDimensions.height"
                      :grid-size="editorState.gridSize"
                      :snap-to-grid="editorState.snapToGrid"
                      @select="selectElement(element.id)"
                      @move="pos => handleElementMove(element.id, pos)"
                      @resize="size => handleElementResize(element.id, size)"
                      @rotate="angle => handleElementRotate(element.id, angle)"
                      @textChange="content => updateElementText(element.id, content)"
                      @update="updates => updateElementTextProperties(element.id, updates)"
                    />
                  </template>
                </div>
                <!-- Regular page elements -->
                <template v-else>
                  <PublishingBookElementsPuzzleElement
                    v-if="element?.type === 'puzzle'"
                    :puzzle="element?.puzzle"
                    :style="element?.style"
                    :selected="editorState.selectedElements.has(element.id)"
                    :canvas-width="canvasDimensions.width"
                    :canvas-height="canvasDimensions.height"
                    :grid-size="editorState.gridSize"
                    :snap-to-grid="editorState.snapToGrid"
                    @select="handleElementSelect(element.id, $event)"
                    @resize="size => handleElementResize(element.id, size)"
                    @move="pos => handleElementMove(element.id, pos)"
                    @rotate="angle => handleElementRotate(element.id, angle)"
                  />
                  <PublishingBookElementsImageElement
                    v-else-if="element?.type === 'image'"
                    :image="element?.content"
                    :style="element?.style"
                    :selected="editorState.selectedElements.has(element.id)"
                    :canvas-width="canvasDimensions.width"
                    :canvas-height="canvasDimensions.height"
                    :grid-size="editorState.gridSize"
                    :snap-to-grid="editorState.snapToGrid"
                    @select="handleElementSelect(element.id, $event)"
                    @resize="(id: string, size: any) => handleElementResize(id, size)"
                    @move="(id: string, pos: any) => handleElementMove(id, pos)"
                    @rotate="(id: string, angle: any) => handleElementRotate(id, angle)"
                  />
                  <template v-else-if="element.type === 'path'">
                    <PublishingBookElementsPathElement
                      :element="element"
                      :selected="selectedElement?.id === element.id"
                      :canvas-width="canvasDimensions.width"
                      :canvas-height="canvasDimensions.height"
                      :grid-size="editorState.gridSize"
                      :snap-to-grid="editorState.snapToGrid"
                      @select="selectElement(element.id)"
                      @move="pos => handleElementMove(element.id, pos)"
                      @resize="size => handleElementResize(element.id, size)"
                      @rotate="angle => handleElementRotate(element.id, angle)"
                    />
                  </template>
                  <template v-else-if="element.type === 'shape'">
                    <PublishingBookElementsShapeElement
                      :element="element"
                      :selected="selectedElement?.id === element.id"
                      :canvas-width="canvasDimensions.width"
                      :canvas-height="canvasDimensions.height"
                      :grid-size="editorState.gridSize"
                      :snap-to-grid="editorState.snapToGrid"
                      @select="selectElement(element.id)"
                      @move="pos => handleElementMove(element.id, pos)"
                      @resize="size => handleElementResize(element.id, size)"
                      @rotate="angle => handleElementRotate(element.id, angle)"
                    />
                  </template>
                  <template v-else-if="element.type === 'text'">
                    <PublishingBookElementsTextElement
                      :element="element"
                      :selected="selectedElement?.id === element.id"
                      :canvas-width="canvasDimensions.width"
                      :canvas-height="canvasDimensions.height"
                      :grid-size="editorState.gridSize"
                      :snap-to-grid="editorState.snapToGrid"
                      @select="selectElement(element.id)"
                      @move="pos => handleElementMove(element.id, pos)"
                      @resize="size => handleElementResize(element.id, size)"
                      @rotate="angle => handleElementRotate(element.id, angle)"
                      @textChange="content => updateElementText(element.id, content)"
                      @update="updates => updateElementTextProperties(element.id, updates)"
                    />
                  </template>
                </template>
              </template>
            </template>

            <!-- Preview path while drawing -->
            <svg
              v-if="editorState.drawing.isDrawing"
              class="absolute inset-0 pointer-events-none"
              style="z-index: 9999;"
              :width="canvasDimensions.width"
              :height="canvasDimensions.height"
            >
              <path
                :d="getPathData(currentPath)"
                :stroke="drawingState?.value?.color ?? defaultDrawingSettings.color"
                :stroke-width="drawingState?.value?.brushSize ?? defaultDrawingSettings.brushSize"
                :opacity="drawingState?.value?.opacity ?? defaultDrawingSettings.opacity"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            <!-- Preview shape while drawing -->
            <svg
              v-if="editorState.shape.isDrawing"
              class="absolute inset-0 pointer-events-none"
              style="z-index: 9999;"
              :width="canvasDimensions.width"
              :height="canvasDimensions.height"
            >
              <path
                :d="getShapePreviewPath"
                :fill="shapeState.isFilled ? shapeState.fill : 'none'"
                :stroke="shapeState.hasStroke ? shapeState.stroke : 'none'"
                :stroke-width="shapeState.strokeWidth"
                :opacity="shapeState.opacity"
              />
            </svg>
          </div>
        </div>
      </div>
      <!-- Right Sidebar - Elements Tree -->
      <div class="w-64 bg-gray-800 border-l border-gray-700 overflow-y-auto flex flex-col">
        <!-- Shape Tools Panel -->
        <PublishingBookToolsShapePanel
          v-if="editorState.shape.active"
          class="border-b border-gray-700"
        />

        <!-- Drawing Tools Panel -->
        <PublishingBookToolsDrawingPanel
          v-if="editorState.drawing.active"
          class="border-b border-gray-700"
        />

        <!-- Text Tools Panel -->
        <PublishingBookToolsTextPanel
          v-if="editorState.text.active"
          class="border-b border-gray-700"
        />

        <!-- Elements Tree -->
        <div class="p-4 border-b border-gray-700" v-if="showElementList">
          <h3 class="text-white text-sm font-semibold mb-3">Elements</h3>
          <div class="space-y-2">
            <div
              v-for="element in sortedElements"
              :key="element.id"
              class="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-700"
              :class="{ 'bg-gray-700': selectedElement === element.id }"
              @click="handleElementSelect(element.id, $event)"
            >
              <!-- Element Icon -->
              <Icon
                :name="element.type === 'puzzle' ? 'ph:puzzle-piece-duotone' : 'ph:image-duotone'"
                class="w-4 h-4 text-gray-400"
              />

              <!-- Element Name -->
              <span class="text-sm text-gray-300">
                {{ element.type.charAt(0).toUpperCase() + element.type.slice(1) }} {{ element.id }}
              </span>

              <!-- Z-Index Badge -->
              <span class="ml-auto text-xs text-gray-500">
                z: {{ element.style.zIndex || '1' }}
              </span>
            </div>
          </div>
        </div>
        <!-- Properties Panel -->
        <div v-if="selectedElementData" class="p-4 flex-1 overflow-y-auto" :class="{ 'h-96': !showElementList }">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-white text-sm font-semibold">Properties</h3>
            <BaseButtonIcon
              class="p-1.5 rounded hover:bg-red-500 hover:bg-opacity-20"
              data-nui-tooltip="Remove Element"
              data-nui-tooltip-position="left"
              @click="removeElement(selectedElementData.id)"
            >
              <Icon name="ph:trash-bold" class="w-4 h-4 text-red-500" />
            </BaseButtonIcon>
          </div>

          <!-- Element Type -->
          <div class="mb-4">
            <span class="text-xs text-gray-400">Type</span>
            <p class="text-sm text-gray-200 capitalize">{{ selectedElementData.type }}</p>
          </div>

          <!-- Text Properties -->
          <template v-if="selectedElementData.type === 'text'">
            <div class="space-y-4">
              <!-- Text Content -->
              <div>
                <label class="block text-xs text-gray-400 mb-1">Content</label>
                <textarea
                  v-model="selectedElementData.text.content"
                  class="w-full bg-gray-700 rounded p-2 text-white text-sm"
                  rows="3"
                  @input="updateElementText(selectedElementData.id, $event.target.value)"
                />
              </div>

              <!-- Font -->
              <div>
                <label class="block text-xs text-gray-400 mb-1">Font</label>
                <select
                  v-model="selectedElementData.text.font"
                  class="w-full bg-gray-700 rounded p-2 text-white text-sm"
                  @change="updateElementTextProperties(selectedElementData.id, { font: $event.target.value })"
                >
                  <option v-for="font in fonts" :key="font.value" :value="font.value">
                    {{ font.label }}
                  </option>
                </select>
              </div>

              <!-- Font Size -->
              <div>
                <label class="block text-xs text-gray-400 mb-1">Size</label>
                <input
                  v-model.number="selectedElementData.text.size"
                  type="number"
                  min="8"
                  max="72"
                  class="w-full bg-gray-700 rounded p-2 text-white text-sm"
                  @input="updateElementTextProperties(selectedElementData.id, { size: Number($event.target.value) })"
                />
              </div>

              <!-- Text Color -->
              <div>
                <label class="block text-xs text-gray-400 mb-1">Color</label>
                <input
                  v-model="selectedElementData.text.color"
                  type="color"
                  class="w-full h-8 bg-gray-700 rounded"
                  @input="updateElementTextProperties(selectedElementData.id, { color: $event.target.value })"
                />
              </div>

              <!-- Text Style -->
              <div>
                <label class="block text-xs text-gray-400 mb-2">Style</label>
                <div class="flex gap-2">
                  <button
                    v-for="(label, prop) in { bold: 'B', italic: 'I', underline: 'U' }"
                    :key="prop"
                    class="p-2 rounded hover:bg-gray-700"
                    :class="{ 'bg-gray-700': selectedElementData.text[prop] }"
                    @click="updateElementTextProperties(selectedElementData.id, { [prop]: !selectedElementData.text[prop] })"
                  >
                    {{ label }}
                  </button>
                </div>
              </div>

              <!-- Text Alignment -->
              <div>
                <label class="block text-xs text-gray-400 mb-2">Alignment</label>
                <div class="flex gap-2">
                  <button
                    v-for="align in ['left', 'center', 'right']"
                    :key="align"
                    class="p-2 rounded hover:bg-gray-700"
                    :class="{ 'bg-gray-700': selectedElementData.text.alignment === align }"
                    @click="updateElementTextProperties(selectedElementData.id, { alignment: align })"
                  >
                    <Icon :name="`ph:text-align-${align}`" class="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <!-- Line Height -->
              <div>
                <label class="block text-xs text-gray-400 mb-1">Line Height</label>
                <input
                  v-model.number="selectedElementData.text.lineHeight"
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  class="w-full"
                  @input="updateElementTextProperties(selectedElementData.id, { lineHeight: Number($event.target.value) })"
                />
              </div>

              <!-- Letter Spacing -->
              <div>
                <label class="block text-xs text-gray-400 mb-1">Letter Spacing</label>
                <input
                  v-model.number="selectedElementData.text.letterSpacing"
                  type="range"
                  min="-2"
                  max="10"
                  step="0.5"
                  class="w-full"
                  @input="updateElementTextProperties(selectedElementData.id, { letterSpacing: Number($event.target.value) })"
                />
              </div>

              <!-- Opacity -->
              <div>
                <label class="block text-xs text-gray-400 mb-1">Opacity</label>
                <input
                  v-model.number="selectedElementData.text.opacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  class="w-full"
                  @input="updateElementTextProperties(selectedElementData.id, { opacity: Number($event.target.value) })"
                />
              </div>

              <!-- Text Effects -->
              <div class="space-y-4">
                <h4 class="text-sm text-gray-300 font-medium">Effects</h4>

                <!-- Shadow Effect -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="text-xs text-gray-400">Shadow</label>
                    <BaseButtonIcon
                      class="p-1.5 rounded hover:bg-gray-700"
                      :class="{ 'bg-gray-700': selectedElementData.text.effects.shadow.enabled }"
                      @click="updateElementTextProperties(selectedElementData.id, {
                        effects: {
                          ...selectedElementData.text.effects,
                          shadow: {
                            ...selectedElementData.text.effects.shadow,
                            enabled: !selectedElementData.text.effects.shadow.enabled
                          }
                        }
                      })"
                    >
                      <Icon name="ph:drop-half-bottom-bold" class="w-4 h-4 text-white" />
                    </BaseButtonIcon>
                  </div>

                  <template v-if="selectedElementData.text.effects.shadow.enabled">
                    <input
                      v-model="selectedElementData.text.effects.shadow.color"
                      type="color"
                      class="w-full h-8 bg-gray-700 rounded"
                      @input="updateElementTextProperties(selectedElementData.id, {
                        effects: {
                          ...selectedElementData.text.effects,
                          shadow: {
                            ...selectedElementData.text.effects.shadow,
                            color: $event.target.value
                          }
                        }
                      })"
                    />

                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <label class="block text-xs text-gray-400 mb-1">Offset X</label>
                        <input
                          v-model.number="selectedElementData.text.effects.shadow.offsetX"
                          type="range"
                          min="-10"
                          max="10"
                          step="1"
                          class="w-full"
                          @input="updateElementTextProperties(selectedElementData.id, {
                            effects: {
                              ...selectedElementData.text.effects,
                              shadow: {
                                ...selectedElementData.text.effects.shadow,
                                offsetX: Number($event.target.value)
                              }
                            }
                          })"
                        />
                      </div>
                      <div>
                        <label class="block text-xs text-gray-400 mb-1">Offset Y</label>
                        <input
                          v-model.number="selectedElementData.text.effects.shadow.offsetY"
                          type="range"
                          min="-10"
                          max="10"
                          step="1"
                          class="w-full"
                          @input="updateElementTextProperties(selectedElementData.id, {
                            effects: {
                              ...selectedElementData.text.effects,
                              shadow: {
                                ...selectedElementData.text.effects.shadow,
                                offsetY: Number($event.target.value)
                              }
                            }
                          })"
                        />
                      </div>
                    </div>

                    <div>
                      <label class="block text-xs text-gray-400 mb-1">Blur</label>
                      <input
                        v-model.number="selectedElementData.text.effects.shadow.blur"
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        class="w-full"
                        @input="updateElementTextProperties(selectedElementData.id, {
                          effects: {
                            ...selectedElementData.text.effects,
                            shadow: {
                              ...selectedElementData.text.effects.shadow,
                              blur: Number($event.target.value)
                            }
                          }
                        })"
                      />
                    </div>
                  </template>
                </div>

                <!-- Outline Effect -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="text-xs text-gray-400">Outline</label>
                    <BaseButtonIcon
                      class="p-1.5 rounded hover:bg-gray-700"
                      :class="{ 'bg-gray-700': selectedElementData.text.effects.outline.enabled }"
                      @click="updateElementTextProperties(selectedElementData.id, {
                        effects: {
                          ...selectedElementData.text.effects,
                          outline: {
                            ...selectedElementData.text.effects.outline,
                            enabled: !selectedElementData.text.effects.outline.enabled
                          }
                        }
                      })"
                    >
                      <Icon name="ph:text-outline-bold" class="w-4 h-4 text-white" />
                    </BaseButtonIcon>
                  </div>

                  <template v-if="selectedElementData.text.effects.outline.enabled">
                    <input
                      v-model="selectedElementData.text.effects.outline.color"
                      type="color"
                      class="w-full h-8 bg-gray-700 rounded"
                      @input="updateElementTextProperties(selectedElementData.id, {
                        effects: {
                          ...selectedElementData.text.effects,
                          outline: {
                            ...selectedElementData.text.effects.outline,
                            color: $event.target.value
                          }
                        }
                      })"
                    />

                    <div>
                      <label class="block text-xs text-gray-400 mb-1">Width</label>
                      <input
                        v-model.number="selectedElementData.text.effects.outline.width"
                        type="range"
                        min="0.5"
                        max="5"
                        step="0.5"
                        class="w-full"
                        @input="updateElementTextProperties(selectedElementData.id, {
                          effects: {
                            ...selectedElementData.text.effects,
                            outline: {
                              ...selectedElementData.text.effects.outline,
                              width: Number($event.target.value)
                            }
                          }
                        })"
                      />
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>

          <!-- Puzzle Properties -->
          <template v-if="selectedElementData.type === 'puzzle'">
            <div v-if="selectedElementData.puzzle?.type === 'word-search'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Text Color</label>
                <FormInput
                  v-model="selectedElementData.puzzle.content.textColor"
                  type="color"
                  class="w-full"
                  @change="handlePuzzleCustomization(selectedElementData.id, { textColor: selectedElementData.puzzle.content.textColor })"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Background Color</label>
                <FormInput
                  v-model="selectedElementData.puzzle.content.backgroundColor"
                  type="color"
                  class="w-full"
                  @change="handlePuzzleCustomization(selectedElementData.id, { backgroundColor: selectedElementData.puzzle.content.backgroundColor })"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Border Color</label>
                <FormInput
                  v-model="selectedElementData.puzzle.content.borderColor"
                  type="color"
                  class="w-full"
                  @change="handlePuzzleCustomization(selectedElementData.id, { borderColor: selectedElementData.puzzle.content.borderColor })"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Solution Color</label>
                <FormInput
                  v-model="selectedElementData.puzzle.content.locationsColor"
                  type="color"
                  class="w-full"
                  @change="handlePuzzleCustomization(selectedElementData.id, { locationsColor: selectedElementData.puzzle.content.locationsColor })"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Show Solution</label>
                <FormSwitchBall
                  v-model="selectedElementData.puzzle.content.showSolution"
                  @update:model-value="handlePuzzleCustomization(selectedElementData.id, { showSolution: $event })"
                />
              </div>
            </div>
          </template>

          <!-- Image Properties -->
          <template v-else-if="selectedElementData.type === 'image'">
            <!-- Add image properties here when needed -->
          </template>

          <!-- Common Properties -->
          <div class="mt-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Position</label>
              <div class="grid grid-cols-2 gap-2">
                <FormInput
                  v-model="selectedElementData.style.left"
                  type="text"
                  placeholder="Left"
                  class="text-sm"
                />
                <FormInput
                  v-model="selectedElementData.style.top"
                  type="text"
                  placeholder="Top"
                  class="text-sm"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Size</label>
              <div class="grid grid-cols-2 gap-2">
                <FormInput
                  v-model="selectedElementData.style.width"
                  type="text"
                  placeholder="Width"
                  class="text-sm"
                />
                <FormInput
                  v-model="selectedElementData.style.height"
                  type="text"
                  placeholder="Height"
                  class="text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <PublishingBookModalsLayoutPicker
    v-if="isLayoutPickerOpen"
      :open="isLayoutPickerOpen"
      @close="isLayoutPickerOpen = false"
      @select="handleLayoutSelect"
    />

    <PublishingBookModalsPuzzleGenerator
    v-if="isPuzzleGeneratorOpen"
      :open="isPuzzleGeneratorOpen"
      @close="isPuzzleGeneratorOpen = false"
      @create="handlePuzzleCreate"
    />

    <PublishingBookImageUploader
    v-if="isImagePickerOpen"
      :is-open="isImagePickerOpen"
      @close="isImagePickerOpen = false"
      @upload="setImage"
    />

    <!-- Add drawing tools panel when active -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-4"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-4"
    >
      <div
        v-if="editorState.drawing.active"
        class="fixed right-20 top-20 z-50 w-64"
      >
        <PublishingBookToolsDrawingPanel />
      </div>
    </Transition>

    <!-- Update the tools panel -->
    <!-- <PublishingBookToolsPanel
      :tools="toolbarActions"
      @select="handleToolSelect"
    /> -->

    <PreviewMode
      v-if="isPreviewMode"
      :open="isPreviewMode"
      :pages="pages"
      @close="isPreviewMode = false"
    />
  </div>
</template>

<style scoped>
.canvas-container {
  will-change: transform;
}

/* Add spacing for rulers */
.canvas-container {
  margin-top: 20px !important;
  margin-left: 20px !important;
}

/* Cover section styles */
.cover-back {
  position: absolute;
  z-index: 1;
}

.cover-spine {
  position: absolute;
  z-index: 2;
}

.cover-front {
  position: absolute;
  z-index: 3;
}
</style>
