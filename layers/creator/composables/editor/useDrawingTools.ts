export interface DrawingState {
  brushType: 'pencil' | 'marker' | 'airbrush'
  brushSize: number
  color: string
  opacity: number
  pressure: boolean
  symmetry: boolean
  layers: Array<{
    id: string
    name: string
    visible: boolean
    locked: boolean
  }>
  activeLayer: string | null
}

export const useDrawingTools = () => {
  const { editorState } = useEditor()

  // Initialize drawing state
  const drawingState = useState<DrawingState>('drawingTools', () => ({
    brushType: 'pencil',
    brushSize: 2,
    color: '#000000',
    opacity: 1,
    pressure: false,
    symmetry: false,
    layers: [],
    activeLayer: null
  }))

  // History for undo/redo
  const history = useState<string[]>('drawingHistory', () => [])
  const historyIndex = useState<number>('drawingHistoryIndex', () => -1)

  // Methods
  const setBrushType = (type: DrawingState['brushType']) => {
    drawingState.value.brushType = type
  }

  const setBrushSize = (size: number) => {
    drawingState.value.brushSize = Math.max(0.5, Math.min(50, size))
  }

  const setColor = (color: string) => {
    drawingState.value.color = color
  }

  const togglePressure = () => {
    drawingState.value.pressure = !drawingState.value.pressure
  }

  const toggleSymmetry = () => {
    drawingState.value.symmetry = !drawingState.value.symmetry
  }

  // Layer management
  const addLayer = (name: string) => {
    const layer = {
      id: `layer-${Date.now()}`,
      name,
      visible: true,
      locked: false
    }
    drawingState.value.layers.push(layer)
    drawingState.value.activeLayer = layer.id
  }

  // Undo/Redo
  const saveState = (canvasData: string) => {
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(canvasData)
    historyIndex.value++
  }

  const undo = () => {
    if (historyIndex.value > 0) {
      historyIndex.value--
      // Implement canvas state restoration
    }
  }

  const redo = () => {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      // Implement canvas state restoration
    }
  }

  return {
    drawingState,
    setBrushType,
    setBrushSize,
    setColor,
    togglePressure,
    toggleSymmetry,
    addLayer,
    undo,
    redo,
    saveState
  }
}
