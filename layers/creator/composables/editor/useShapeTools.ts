export interface ShapeState {
  type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'polygon'
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  cornerRadius: number
  isFilled: boolean
  hasStroke: boolean
  useGradient: boolean
  gradient: {
    type: 'linear' | 'radial'
    startColor: string
    endColor: string
    angle: number // for linear gradients
    position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' // for radial gradients
  }
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
    hasStroke: true,
    useGradient: false,
    gradient: {
      type: 'linear',
      startColor: '#ffffff',
      endColor: '#000000',
      angle: 90,
      position: 'center'
    }
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

  const toggleGradient = () => {
    shapeState.value.useGradient = !shapeState.value.useGradient
  }

  const setGradientType = (type: 'linear' | 'radial') => {
    shapeState.value.gradient.type = type
  }

  const setGradientColors = (startColor: string, endColor: string) => {
    shapeState.value.gradient.startColor = startColor
    shapeState.value.gradient.endColor = endColor
  }

  const setGradientAngle = (angle: number) => {
    shapeState.value.gradient.angle = angle % 360
  }

  const setGradientPosition = (position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    shapeState.value.gradient.position = position
  }

  const getGradientCSS = () => {
    const { gradient } = shapeState.value
    
    if (gradient.type === 'linear') {
      return `linear-gradient(${gradient.angle}deg, ${gradient.startColor}, ${gradient.endColor})`
    } else {
      // Map position to CSS background position
      const positionMap = {
        'center': 'center center',
        'top-left': 'left top',
        'top-right': 'right top',
        'bottom-left': 'left bottom',
        'bottom-right': 'right bottom'
      }
      
      return `radial-gradient(circle at ${positionMap[gradient.position]}, ${gradient.startColor}, ${gradient.endColor})`
    }
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
    toggleStroke,
    toggleGradient,
    setGradientType,
    setGradientColors,
    setGradientAngle,
    setGradientPosition,
    getGradientCSS
  }
}
