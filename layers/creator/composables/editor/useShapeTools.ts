export interface ShapeState {
  type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'polygon'
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  cornerRadius: number
  isFilled: boolean
  hasStroke: boolean
}

export const useShapeTools = () => {
  const shapeState = useState<ShapeState>('shapeTools', () => ({
    type: 'rectangle',
    fill: '#000000',
    stroke: '#000000',
    strokeWidth: 2,
    opacity: 1,
    cornerRadius: 0,
    isFilled: true,
    hasStroke: true
  }))

  const setShapeType = (type: ShapeState['type']) => {
    shapeState.value.type = type
  }

  const setFill = (color: string) => {
    shapeState.value.fill = color
  }

  const setStroke = (color: string) => {
    shapeState.value.stroke = color
  }

  const setStrokeWidth = (width: number) => {
    shapeState.value.strokeWidth = Math.max(0.5, Math.min(50, width))
  }

  const setOpacity = (opacity: number) => {
    shapeState.value.opacity = Math.max(0, Math.min(1, opacity))
  }

  const setCornerRadius = (radius: number) => {
    shapeState.value.cornerRadius = Math.max(0, radius)
  }

  const toggleFill = () => {
    shapeState.value.isFilled = !shapeState.value.isFilled
  }

  const toggleStroke = () => {
    shapeState.value.hasStroke = !shapeState.value.hasStroke
  }

  return {
    shapeState,
    setShapeType,
    setFill,
    setStroke,
    setStrokeWidth,
    setOpacity,
    setCornerRadius,
    toggleFill,
    toggleStroke
  }
}
