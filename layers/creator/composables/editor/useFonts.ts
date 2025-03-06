import { GoogleFonts } from '../types/fonts'

export const useFonts = () => {
  const fonts = useState<GoogleFonts[]>('fonts', () => [])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const favoriteFonts = useState<string[]>('favoriteFonts', () => [])
  const loadedFonts = ref(new Set<string>())

  // Fallback system fonts
  const systemFonts = [
    { family: 'Arial', category: 'sans-serif' },
    { family: 'Times New Roman', category: 'serif' },
    { family: 'Helvetica', category: 'sans-serif' },
    { family: 'Georgia', category: 'serif' },
    { family: 'Courier New', category: 'monospace' },
    { family: 'Verdana', category: 'sans-serif' },
    { family: 'Impact', category: 'display' },
    { family: 'Trebuchet MS', category: 'sans-serif' },
    { family: 'Comic Sans MS', category: 'handwriting' },
    { family: 'Tahoma', category: 'sans-serif' }
  ].map(font => ({
    ...font,
    variants: ['regular'],
    subsets: ['latin'],
    version: '1',
    lastModified: '',
    files: {},
  }))

  const loadGoogleFonts = async () => {
    try {
      isLoading.value = true
      const API_KEY = useRuntimeConfig().public.googleFontsApiKey

      if (API_KEY) {
        try {
          const response = await $fetch(
            `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`
          )
          fonts.value = response.items
        } catch (e) {
          console.warn('Failed to load Google Fonts, falling back to system fonts')
          fonts.value = systemFonts
        }
      } else {
        console.warn('No Google Fonts API key provided, using system fonts')
        fonts.value = systemFonts
      }

      // Load only favorite fonts and first 10 popular fonts initially
      const initialFonts = new Set([
        ...favoriteFonts.value,
        ...fonts.value.slice(0, 10).map(f => f.family)
      ])

      for (const fontFamily of initialFonts) {
        await loadFont(fontFamily)
      }
    } catch (e) {
      error.value = 'Failed to load fonts'
      console.error(e)
      fonts.value = systemFonts
    } finally {
      isLoading.value = false
    }
  }

  const loadFont = async (fontFamily: string) => {
    if (loadedFonts.value.has(fontFamily)) return

    // Skip loading system fonts
    if (systemFonts.some(f => f.family === fontFamily)) {
      loadedFonts.value.add(fontFamily)
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}&display=swap`
    document.head.appendChild(link)
    loadedFonts.value.add(fontFamily)
  }

  const toggleFavorite = (fontFamily: string) => {
    const index = favoriteFonts.value.indexOf(fontFamily)
    if (index === -1) {
      favoriteFonts.value.push(fontFamily)
      loadFont(fontFamily)
    } else {
      favoriteFonts.value.splice(index, 1)
    }
  }

  const isFavorite = (fontFamily: string) => {
    return favoriteFonts.value.includes(fontFamily)
  }

  return {
    fonts,
    isLoading,
    error,
    loadGoogleFonts,
    loadFont,
    toggleFavorite,
    isFavorite,
    favoriteFonts
  }
}
