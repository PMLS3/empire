import { ref } from 'vue'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { Book, Page, ExportConfig } from '../types/book'

/**
 * Composable for exporting books to various formats
 */
export const useBookExport = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  /**
   * Export a book to PDF format
   */
  const exportToPdf = async (
    book: Book,
    canvasElements: HTMLElement[], 
    config: Partial<ExportConfig> = {}
  ) => {
    loading.value = true
    error.value = null
    
    try {
      // Default configuration
      const exportConfig: ExportConfig = {
        format: 'pdf',
        quality: config.quality || 'standard',
        includeBleed: config.includeBleed !== undefined ? config.includeBleed : false,
        includeTrimMarks: config.includeTrimMarks !== undefined ? config.includeTrimMarks : false,
        coverType: config.coverType || 'front-only',
        pageRange: config.pageRange || 'all',
        customPageRange: config.customPageRange || '',
        resolution: config.resolution || 300,
        colorSpace: config.colorSpace || 'rgb',
        embedFonts: config.embedFonts !== undefined ? config.embedFonts : true
      }
      
      // Get canvas elements and convert to images
      const pageImages = []
      
      for (let i = 0; i < canvasElements.length; i++) {
        // Skip pages not in the page range
        if (exportConfig.pageRange === 'custom' && exportConfig.customPageRange) {
          const pageRanges = exportConfig.customPageRange.split(',').map(r => r.trim())
          let inRange = false
          
          for (const range of pageRanges) {
            if (range.includes('-')) {
              const [start, end] = range.split('-').map(Number)
              if (i + 1 >= start && i + 1 <= end) {
                inRange = true
                break
              }
            } else {
              if (i + 1 === Number(range)) {
                inRange = true
                break
              }
            }
          }
          
          if (!inRange) continue
        }
        
        // Convert canvas to image
        const canvas = await html2canvas(canvasElements[i], {
          scale: exportConfig.resolution / 96, // Convert DPI to scale (96 is standard screen DPI)
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#FFFFFF'
        })
        
        pageImages.push(canvas)
      }
      
      // Create PDF
      const pdfWidth = canvasElements[0].offsetWidth / 96 * 72 // Convert to PDF points (72 points per inch)
      const pdfHeight = canvasElements[0].offsetHeight / 96 * 72
      
      // Add bleed if requested
      const bleedMargin = exportConfig.includeBleed ? 36 : 0 // 0.5 inch bleed
      const pdfWidthWithBleed = pdfWidth + (bleedMargin * 2)
      const pdfHeightWithBleed = pdfHeight + (bleedMargin * 2)
      
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'pt',
        format: [pdfWidthWithBleed, pdfHeightWithBleed]
      })
      
      // Add each page to the PDF
      for (let i = 0; i < pageImages.length; i++) {
        if (i > 0) {
          pdf.addPage([pdfWidthWithBleed, pdfHeightWithBleed])
        }
        
        const img = pageImages[i].toDataURL(`image/${exportConfig.colorSpace === 'cmyk' ? 'jpeg' : 'png'}`, 
          exportConfig.quality === 'high' ? 1.0 : exportConfig.quality === 'standard' ? 0.9 : 0.8)
        
        // Add the image to the PDF
        pdf.addImage(
          img, 
          exportConfig.colorSpace === 'cmyk' ? 'JPEG' : 'PNG',
          bleedMargin, 
          bleedMargin, 
          pdfWidth, 
          pdfHeight
        )
        
        // Add trim marks if requested
        if (exportConfig.includeTrimMarks) {
          addTrimMarks(pdf, bleedMargin, pdfWidth, pdfHeight)
        }
        
        // Add page number if not cover
        if (i > 0 || book.pages?.[i]?.type !== 'cover') {
          pdf.setFontSize(8)
          pdf.text(`${i + 1}`, pdfWidthWithBleed / 2, pdfHeightWithBleed - 10, { align: 'center' })
        }
      }
      
      // Save the PDF
      pdf.save(`${book.title || 'book'}.pdf`)
      
      loading.value = false
      return true
    } catch (err) {
      console.error('Error exporting PDF:', err)
      error.value = err.message || 'Error exporting to PDF'
      loading.value = false
      return false
    }
  }
  
  /**
   * Export a book to EPUB format
   */
  const exportToEpub = async (
    book: Book,
    canvasElements: HTMLElement[],
    config: Partial<ExportConfig> = {}
  ) => {
    loading.value = true
    error.value = null
    
    try {
      // Default configuration
      const exportConfig: ExportConfig = {
        format: 'epub',
        quality: config.quality || 'standard',
        includeBleed: false,
        includeTrimMarks: false,
        coverType: config.coverType || 'front-only',
        pageRange: config.pageRange || 'all',
        customPageRange: config.customPageRange || '',
        resolution: config.resolution || 150,
        colorSpace: config.colorSpace || 'rgb',
        embedFonts: config.embedFonts !== undefined ? config.embedFonts : true
      }
      
      // EPUB export would need to be implemented using a library like epub-gen
      // This is a placeholder for future implementation
      
      loading.value = false
      error.value = 'EPUB export is not yet implemented'
      return false
    } catch (err) {
      console.error('Error exporting EPUB:', err)
      error.value = err.message || 'Error exporting to EPUB'
      loading.value = false
      return false
    }
  }
  
  /**
   * Helper function to add trim marks to PDF
   */
  const addTrimMarks = (pdf: jsPDF, bleedMargin: number, width: number, height: number) => {
    const markLength = 18 // 0.25 inch trim marks
    
    pdf.setLineWidth(0.5)
    pdf.setDrawColor(0, 0, 0)
    
    // Top-left marks
    pdf.line(bleedMargin - markLength, bleedMargin, bleedMargin, bleedMargin)
    pdf.line(bleedMargin, bleedMargin - markLength, bleedMargin, bleedMargin)
    
    // Top-right marks
    pdf.line(bleedMargin + width, bleedMargin, bleedMargin + width + markLength, bleedMargin)
    pdf.line(bleedMargin + width, bleedMargin - markLength, bleedMargin + width, bleedMargin)
    
    // Bottom-left marks
    pdf.line(bleedMargin - markLength, bleedMargin + height, bleedMargin, bleedMargin + height)
    pdf.line(bleedMargin, bleedMargin + height, bleedMargin, bleedMargin + height + markLength)
    
    // Bottom-right marks
    pdf.line(bleedMargin + width, bleedMargin + height, bleedMargin + width + markLength, bleedMargin + height)
    pdf.line(bleedMargin + width, bleedMargin + height, bleedMargin + width, bleedMargin + height + markLength)
  }
  
  return {
    loading,
    error,
    exportToPdf,
    exportToEpub
  }
}