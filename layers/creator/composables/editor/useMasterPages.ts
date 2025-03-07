import { ref, computed } from 'vue'
import type { PageTemplate, StyleInheritanceRule } from '../../types/editor'

export const useMasterPages = () => {
  const masterTemplates = ref<PageTemplate[]>([])
  const styleInheritanceRules = ref<Record<string, StyleInheritanceRule[]>>({})
  
  // Add a new master template
  const addMasterTemplate = (template: PageTemplate) => {
    // Ensure unique ID
    if (!template.id) {
      template.id = `template-${Date.now()}`
    }
    
    // Check if template with same ID exists
    const existingIndex = masterTemplates.value.findIndex(t => t.id === template.id)
    if (existingIndex >= 0) {
      // Replace existing template
      masterTemplates.value[existingIndex] = template
    } else {
      // Add new template
      masterTemplates.value.push(template)
    }
  }
  
  // Get a master template by ID
  const getMasterTemplate = (templateId: string) => {
    return masterTemplates.value.find(t => t.id === templateId)
  }
  
  // Delete a master template
  const deleteMasterTemplate = (templateId: string) => {
    masterTemplates.value = masterTemplates.value.filter(t => t.id !== templateId)
    
    // Clean up style inheritance rules for this template
    delete styleInheritanceRules.value[templateId]
  }
  
  // Add a style inheritance rule
  const addStyleInheritanceRule = (templateId: string, rule: StyleInheritanceRule) => {
    if (!styleInheritanceRules.value[templateId]) {
      styleInheritanceRules.value[templateId] = []
    }
    
    styleInheritanceRules.value[templateId].push(rule)
  }
  
  // Remove a style inheritance rule
  const removeStyleInheritanceRule = (templateId: string, ruleId: string) => {
    if (styleInheritanceRules.value[templateId]) {
      styleInheritanceRules.value[templateId] = styleInheritanceRules.value[templateId].filter(r => r.id !== ruleId)
    }
  }
  
  // Apply master template to a page
  const applyTemplateToPage = (page: any, templateId: string) => {
    const template = getMasterTemplate(templateId)
    if (!template) return page
    
    // Apply page properties from template
    const newPage = { ...page }
    
    // Apply template elements (keeping original elements that don't conflict)
    if (template.elements && Array.isArray(template.elements)) {
      if (!newPage.elements) newPage.elements = []
      
      // First, filter out elements from the page that would be replaced by master template elements
      const nonConflictingElements = newPage.elements.filter(element => {
        return !template.elements.some(templateElement => templateElement.role === element.role)
      })
      
      // Then, add all template elements
      newPage.elements = [
        ...nonConflictingElements,
        ...JSON.parse(JSON.stringify(template.elements)) // Deep copy template elements
      ]
    }
    
    // Apply template properties and styles
    if (template.background) newPage.background = template.background
    if (template.margins) newPage.margins = template.margins
    if (template.grid) newPage.grid = template.grid
    
    return newPage
  }
  
  // Get all style inheritance rules for a template
  const getStyleInheritanceRules = (templateId: string) => {
    return styleInheritanceRules.value[templateId] || []
  }
  
  // Apply style inheritance rules to a page
  const applyInheritanceRules = (page: any, templateId: string) => {
    const rules = getStyleInheritanceRules(templateId)
    if (!rules.length) return page
    
    const updatedPage = { ...page }
    
    // Apply each rule
    rules.forEach(rule => {
      if (!updatedPage.elements) return
      
      // Find elements that match the selector
      const matchingElements = updatedPage.elements.filter(element => {
        if (rule.selector.type && element.type !== rule.selector.type) {
          return false
        }
        
        if (rule.selector.role && element.role !== rule.selector.role) {
          return false
        }
        
        if (rule.selector.id && element.id !== rule.selector.id) {
          return false
        }
        
        return true
      })
      
      // Apply styles to matching elements
      matchingElements.forEach(element => {
        if (!element.style) element.style = {}
        
        Object.keys(rule.styles).forEach(styleKey => {
          // Only apply if not overridden
          if (!rule.overrideLocal || element.style[styleKey] === undefined) {
            element.style[styleKey] = rule.styles[styleKey]
          }
        })
      })
    })
    
    return updatedPage
  }
  
  // Check if a page has template overrides
  const hasTemplateOverrides = (page: any, templateId: string) => {
    const template = getMasterTemplate(templateId)
    if (!template || !page.elements || !template.elements) return false
    
    // Check for elements that override template elements
    return page.elements.some(pageElement => {
      return template.elements.some(templateElement => 
        templateElement.role === pageElement.role && 
        JSON.stringify(templateElement) !== JSON.stringify(pageElement)
      )
    })
  }
  
  // Get override status for template elements
  const getElementOverrideStatus = (page: any, templateId: string) => {
    const template = getMasterTemplate(templateId)
    if (!template || !template.elements) return {}
    
    const result: Record<string, boolean> = {}
    
    template.elements.forEach(templateElement => {
      if (templateElement.role) {
        const pageElement = page.elements?.find(el => el.role === templateElement.role)
        result[templateElement.role] = pageElement ? 
          JSON.stringify(templateElement) !== JSON.stringify(pageElement) : 
          false
      }
    })
    
    return result
  }
  
  // Detect template changes and update pages using the template
  const propagateTemplateChanges = (templateId: string, pages: any[]) => {
    const template = getMasterTemplate(templateId)
    if (!template) return pages
    
    return pages.map(page => {
      if (page.templateId !== templateId) return page
      
      // Only update non-overridden elements
      const overrideStatus = getElementOverrideStatus(page, templateId)
      const newPage = { ...page }
      
      if (!newPage.elements) newPage.elements = []
      
      // Update elements that aren't overridden
      template.elements?.forEach(templateElement => {
        if (!templateElement.role || overrideStatus[templateElement.role] === false) {
          // Remove old element with this role
          newPage.elements = newPage.elements.filter(el => 
            el.role !== templateElement.role
          )
          
          // Add new element from template
          newPage.elements.push(JSON.parse(JSON.stringify(templateElement)))
        }
      })
      
      return newPage
    })
  }
  
  // Available master templates
  const availableTemplates = computed(() => masterTemplates.value)
  
  return {
    masterTemplates,
    styleInheritanceRules,
    availableTemplates,
    addMasterTemplate,
    getMasterTemplate,
    deleteMasterTemplate,
    addStyleInheritanceRule,
    removeStyleInheritanceRule,
    applyTemplateToPage,
    getStyleInheritanceRules,
    applyInheritanceRules,
    hasTemplateOverrides,
    getElementOverrideStatus,
    propagateTemplateChanges
  }
}
