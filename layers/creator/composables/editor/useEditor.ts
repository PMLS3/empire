import { ref, computed } from 'vue'
import { useState } from '#imports'

interface Page {
  id: string
  type: 'cover' | 'content' | 'layout' | 'puzzle'
  name: string
  content?: string
  images?: string[]
  elements?: Array<Element>
}

interface Element {
  id: string
  type: 'puzzle' | 'image' | 'text' | 'drawing' | 'path' | 'shape' | 'text'
  puzzle?: {
    type: 'word-search'
    content: {
      grid: any
      words: any
      size: any
      showSolution?: boolean
      locations?: any
      textColor?: string
      backgroundColor?: string
      borderColor?: string
      locationsColor?: string
    }
  }
  path?: {
    points: Array<{ x: number; y: number }>
    brushSize: number
    color: string
    opacity: number
    type: 'pencil' | 'marker' | 'airbrush'
    originalWidth?: number
    originalHeight?: number
  }
  shape?: {
    type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'polygon'
    fill: string
    stroke: string
    strokeWidth: number
    opacity: number
    cornerRadius?: number
    isFilled: boolean
    hasStroke: boolean
  }
  text?: {
    content: string
    font: string
    size: number
    color: string
    alignment: 'left' | 'center' | 'right'
    bold: boolean
    italic: boolean
    underline: boolean
    lineHeight: number
    letterSpacing: number
    opacity: number
  }
  style: {
    width: string
    height: string
    top: string
    left: string
    transform: string
    zIndex?: string
  }
}

interface EditorState {
  zoom: number
  showGrid: boolean
  showGuides: boolean
  showMargins: boolean
  snapToGrid: boolean
  gridSize: number
  snapThreshold: number
  orientation: 'portrait' | 'landscape'
  isDraggingCanvas: boolean
  lastMousePosition: { x: number; y: number }
  selectedElements: Set<string>
  guideColor: string
  showMeasurements: boolean
  horizontalGuides: number[]
  verticalGuides: number[]
  selectedElement: string | null
  elements: Element[]
  selectedPage: Page | null
  drawing: {
    active: boolean
    currentTool: string | null
    isDrawing: boolean
  }
  shape: {
    active: boolean
    isDrawing: boolean
    startPoint: { x: number; y: number } | null
    endPoint: { x: number; y: number } | null
  }
  text: {
    active: boolean
    isEditing: boolean
  }
}

export const useEditor = () => {
  // Editor state
  const editorState = useState<EditorState>('editor', () => ({
    zoom: 100,
    showGrid: true,
    showGuides: true,
    showMargins: true,
    snapToGrid: true,
    gridSize: 20,
    snapThreshold: 10,
    orientation: 'portrait',
    isDraggingCanvas: false,
    lastMousePosition: { x: 0, y: 0 },
    selectedElements: new Set<string>(),
    guideColor: '#0066ff',
    showMeasurements: true,
    horizontalGuides: [],
    verticalGuides: [],
    selectedElement: null,
    elements: [],
    selectedPage: null,
    drawing: {
      active: false,
      currentTool: null,
      isDrawing: false
    },
    shape: {
      active: false,
      isDrawing: false,
      startPoint: null,
      endPoint: null
    },
    text: {
      active: false,
      isEditing: false
    }
  }))

  // Selected element
  const selectedElement = computed(() => {
    if (!editorState.value.selectedElement) return null
    return editorState.value.elements.find(
      element => element.id === editorState.value.selectedElement
    )
  })

  // Grid style
  const gridStyle = computed(() => {
    if (!editorState.value.showGrid) return {}

    return {
      backgroundImage: `linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
                       linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)`,
      backgroundSize: `${editorState.value.gridSize}px ${editorState.value.gridSize}px`,
      '--grid-color': 'rgba(0, 0, 0, 0.1)'
    }
  })

  // Element Management
  const selectElement = (elementId: string) => {
    editorState.value.selectedElement = elementId
    editorState.value.selectedElements.clear()
    editorState.value.selectedElements.add(elementId)
  }

  const orderElement = (action: 'front' | 'back') => {
    if (!selectedElement.value) return

    const elements = [...editorState.value.elements]
    const currentIndex = elements.findIndex(e => e.id === selectedElement.value?.id)

    if (currentIndex === -1) return

    if (action === 'front' && currentIndex < elements.length - 1) {
      // Move one level up
      const element = elements[currentIndex]
      const nextElement = elements[currentIndex + 1]

      // Swap elements
      elements[currentIndex] = nextElement
      elements[currentIndex + 1] = element

      // Update z-indices for the swapped elements
      const tempZIndex = element.style.zIndex || String(currentIndex + 1)
      element.style.zIndex = nextElement.style.zIndex || String(currentIndex + 2)
      nextElement.style.zIndex = tempZIndex
    } else if (action === 'back' && currentIndex > 0) {
      // Move one level down
      const element = elements[currentIndex]
      const prevElement = elements[currentIndex - 1]

      // Swap elements
      elements[currentIndex] = prevElement
      elements[currentIndex - 1] = element

      // Update z-indices for the swapped elements
      const tempZIndex = element.style.zIndex || String(currentIndex + 1)
      element.style.zIndex = prevElement.style.zIndex || String(currentIndex)
      prevElement.style.zIndex = tempZIndex
    }

    editorState.value.elements = elements
  }

  const updateElementStyle = (elementId: string, style: Partial<{ left: string; top: string; width: string; height: string; transform?: string }>) => {
    const element = editorState.value.elements.find(e => e.id === elementId)
    if (!element) return

    element.style = {
      ...element.style,
      ...style
    }
  }

  const updatePuzzleProperties = (elementId: string, properties: any) => {
    const element = editorState.value.elements.find(e => e.id === elementId)
    if (!element || element.type !== 'puzzle') return

    element.puzzle = {
      ...element.puzzle,
      content: {
        ...element.puzzle?.content,
        ...properties
      }
    }
  }

  const removeElement = (elementId: string) => {
    editorState.value.elements = editorState.value.elements.filter(e => e.id !== elementId)
    if (editorState.value.selectedElement === elementId) {
      editorState.value.selectedElement = null
      editorState.value.selectedElements.clear()
    }
  }

  // Grid and Guide Management
  const toggleGrid = () => {
    editorState.value.showGrid = !editorState.value.showGrid
  }

  const toggleGuides = () => {
    editorState.value.showGuides = !editorState.value.showGuides
  }

  const toggleSnapToGrid = () => {
    editorState.value.snapToGrid = !editorState.value.snapToGrid
  }

  const toggleMargins = () => {
    editorState.value.showMargins = !editorState.value.showMargins
  }

  const addGuide = (position: number, orientation: 'horizontal' | 'vertical') => {
    if (orientation === 'horizontal') {
      editorState.value.horizontalGuides.push(position)
    } else {
      editorState.value.verticalGuides.push(position)
    }
  }

  const removeGuide = (index: number, orientation: 'horizontal' | 'vertical') => {
    if (orientation === 'horizontal') {
      editorState.value.horizontalGuides.splice(index, 1)
    } else {
      editorState.value.verticalGuides.splice(index, 1)
    }
  }

  // Canvas Management
  const startCanvasDrag = (position: { x: number; y: number }) => {
    editorState.value.isDraggingCanvas = true
    editorState.value.lastMousePosition = position
  }

  const updateCanvasDrag = (position: { x: number; y: number }) => {
    if (!editorState.value.isDraggingCanvas) return
    editorState.value.lastMousePosition = position
  }

  const stopCanvasDrag = () => {
    editorState.value.isDraggingCanvas = false
  }

  // Zoom Management
  const zoomIn = () => {
    editorState.value.zoom = Math.min(200, editorState.value.zoom + 25)
  }

  const zoomOut = () => {
    editorState.value.zoom = Math.max(25, editorState.value.zoom - 25)
  }

  // Settings
  const updateOrientation = (orientation: 'portrait' | 'landscape') => {
    editorState.value.orientation = orientation
  }

  const updateSnapThreshold = (value: number) => {
    editorState.value.snapThreshold = value
  }

  const updateGuideColor = (color: string) => {
    editorState.value.guideColor = color
  }

  const toggleMeasurements = () => {
    editorState.value.showMeasurements = !editorState.value.showMeasurements
  }

  // Page Management
  const setSelectedPage = (page: Page) => {
    editorState.value.selectedPage = page
    // Sync elements when page changes
    editorState.value.elements = page.elements || []
  }

  // Editor State
  const getEditorState = () => {
    return {
      currentPage: {
        elements: editorState.value.elements
      },
      selectedElement: editorState.value.selectedElement
    }
  }

  // Add to existing methods
  const createPathElement = (
    points: Array<{ x: number; y: number }>,
    style: {
      brushSize: number
      color: string
      opacity: number
      type: 'pencil' | 'marker' | 'airbrush'
    }
  ) => {
    const padding = style.brushSize * 2

    const element: Element = {
      id: generateId(),
      type: 'path',
      path: {
        points: [...points],
        brushSize: style.brushSize,
        color: style.color,
        opacity: style.opacity,
        type: style.type
      },
      style: {
        width: '100%',
        height: '100%',
        top: '0px',
        left: '0px',
        transform: 'translate(0, 0)',
        zIndex: '1'
      }
    }

    editorState.value.elements.push(element)
    selectElement(element.id)
    return element
  }

  const updatePathElement = (elementId: string, points: Array<{ x: number; y: number }>) => {
    const element = editorState.value.elements.find(el => el.id === elementId)
    if (!element || !element.path) return

    const padding = element.path.brushSize * 2
    const minX = Math.min(...points.map(p => p.x))
    const minY = Math.min(...points.map(p => p.y))
    const maxX = Math.max(...points.map(p => p.x))
    const maxY = Math.max(...points.map(p => p.y))

    element.path.points = points
    element.style = {
      ...element.style,
      width: `${maxX - minX + padding * 2}px`,
      height: `${maxY - minY + padding * 2}px`,
      top: `${minY - padding}px`,
      left: `${minX - padding}px`,
    }
  }

  const updateDrawingCanvas = (elementId: string, canvasData: string) => {
    const element = editorState.value.elements.find(el => el.id === elementId)
    if (element?.drawing?.layers[0]) {
      element.drawing.layers[0].canvas = canvasData
    }
  }

  // Add the createShapeElement function
  const createShapeElement = (
    position: { x: number; y: number },
    size: { width: number; height: number },
    shapeProps: {
      type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'polygon'
      fill: string
      stroke: string
      strokeWidth: number
      opacity: number
      cornerRadius?: number
      isFilled: boolean
      hasStroke: boolean
    }
  ) => {
    const element: Element = {
      id: generateId(),
      type: 'shape',
      shape: {
        ...shapeProps
      },
      style: {
        width: `${size.width}px`,
        height: `${size.height}px`,
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translate(0, 0)',
        zIndex: '1'
      }
    }

    editorState.value.elements.push(element)
    selectElement(element.id)
    return element
  }

  // Add createTextElement function
  const createTextElement = (
    position: { x: number; y: number },
    textProps: {
      content: string
      font: string
      size: number
      color: string
      alignment: 'left' | 'center' | 'right'
      bold: boolean
      italic: boolean
      underline: boolean
      lineHeight: number
      letterSpacing: number
      opacity: number
    }
  ) => {
    const element: Element = {
      id: generateId(),
      type: 'text',
      text: {
        ...textProps
      },
      style: {
        width: '200px',
        height: 'auto',
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translate(0, 0)',
        zIndex: '1'
      }
    }

    editorState.value.elements.push(element)
    selectElement(element.id)
    return element
  }

  // Add updateElementText function
  const updateElementText = (elementId: string, content: string) => {
    const element = editorState.value.elements.find(el => el.id === elementId)
    if (element?.text) {
      element.text.content = content
    }
  }

  return {
    editorState,
    selectedElement,
    gridStyle,
    selectElement,
    orderElement,
    updateElementStyle,
    updatePuzzleProperties,
    toggleGrid,
    toggleGuides,
    toggleSnapToGrid,
    toggleMargins,
    addGuide,
    removeGuide,
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
    getEditorState,
    removeElement,
    createPathElement,
    updatePathElement,
    createShapeElement,
    createTextElement,
    updateElementText,
    updateDrawingCanvas,
  }
}
