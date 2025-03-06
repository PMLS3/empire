import type { TextState } from './useTextTools'

export interface TextTemplate {
  id: string
  name: string
  category: 'heading' | 'body' | 'caption' | 'custom'
  styles: Partial<TextState>
  preview: string
}

export const useTextTemplates = () => {
  const templates = useState<TextTemplate[]>('textTemplates', () => [
    {
      id: 'heading-1',
      name: 'Heading 1',
      category: 'heading',
      preview: 'Main Heading',
      styles: {
        size: 32,
        font: 'Arial',
        bold: true,
        lineHeight: 1.2,
        letterSpacing: 0,
        color: '#000000'
      }
    },
    {
      id: 'heading-2',
      name: 'Heading 2',
      category: 'heading',
      preview: 'Subheading',
      styles: {
        size: 24,
        font: 'Arial',
        bold: true,
        lineHeight: 1.3,
        letterSpacing: 0,
        color: '#222222'
      }
    },
    {
      id: 'body-text',
      name: 'Body Text',
      category: 'body',
      preview: 'Regular paragraph text',
      styles: {
        size: 16,
        font: 'Georgia',
        lineHeight: 1.5,
        letterSpacing: 0,
        color: '#333333'
      }
    },
    {
      id: 'caption',
      name: 'Caption',
      category: 'caption',
      preview: 'Image caption text',
      styles: {
        size: 14,
        font: 'Arial',
        italic: true,
        lineHeight: 1.4,
        letterSpacing: 0,
        color: '#666666'
      }
    }
  ])

  const customTemplates = useState<TextTemplate[]>('customTextTemplates', () => [])

  const saveAsTemplate = (name: string, styles: Partial<TextState>) => {
    const newTemplate: TextTemplate = {
      id: `custom-${Date.now()}`,
      name,
      category: 'custom',
      preview: 'Custom template',
      styles
    }
    customTemplates.value.push(newTemplate)
  }

  const deleteTemplate = (templateId: string) => {
    const index = customTemplates.value.findIndex(t => t.id === templateId)
    if (index !== -1) {
      customTemplates.value.splice(index, 1)
    }
  }

  const applyTemplate = (template: TextTemplate) => {
    const { textState } = useTextTools()
    textState.value = {
      ...textState.value,
      ...template.styles
    }
  }

  return {
    templates,
    customTemplates,
    saveAsTemplate,
    deleteTemplate,
    applyTemplate
  }
}
