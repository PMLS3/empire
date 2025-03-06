export interface TextState {
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
  richText: {
    enabled: boolean
    content: string
    lists: {
      bullet: boolean
      ordered: boolean
      indent: number
    }
    links: {
      enabled: boolean
      url: string
      newTab: boolean
    }
  }
  effects: {
    shadow: {
      enabled: boolean
      color: string
      blur: number
      offsetX: number
      offsetY: number
    }
    outline: {
      enabled: boolean
      color: string
      width: number
    }
  }
  wrapping: {
    enabled: boolean
    mode: 'none' | 'around' | 'through'
    margin: number
    excludeElements: string[]
  }
  transform: {
    rotate: number
    skewX: number
    skewY: number
    flipX: boolean
    flipY: boolean
  }
}

export const useTextTools = () => {
  const textState = useState<TextState>('textTools', () => ({
    font: 'Arial',
    size: 16,
    color: '#000000',
    alignment: 'left',
    bold: false,
    italic: false,
    underline: false,
    lineHeight: 1.5,
    letterSpacing: 0,
    opacity: 1,
    richText: {
      enabled: false,
      content: '',
      lists: {
        bullet: false,
        ordered: false,
        indent: 0
      },
      links: {
        enabled: false,
        url: '',
        newTab: true
      }
    },
    effects: {
      shadow: {
        enabled: false,
        color: '#000000',
        blur: 4,
        offsetX: 2,
        offsetY: 2
      },
      outline: {
        enabled: false,
        color: '#000000',
        width: 1
      }
    },
    wrapping: {
      enabled: false,
      mode: 'around' as const,
      margin: 10,
      excludeElements: []
    },
    transform: {
      rotate: 0,
      skewX: 0,
      skewY: 0,
      flipX: false,
      flipY: false
    }
  }))

  return {
    textState
  }
}
