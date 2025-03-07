import { ref, computed } from 'vue';
import { useAuth } from '../../auth/composables/auth';
import { useToaster } from '../../shared/composables/toaster';
import type { Book, Page, Element } from '../types/book';

/**
 * Types for interactive elements
 */
export interface InteractiveElement {
  id: string;
  type: 'quiz' | 'slideshow' | 'audio_player' | 'video_player' | 'animation' | 'interactive_map' | 'form';
  title: string;
  description?: string;
  content: any; // Specific content based on type
  settings: {
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
    responsive?: boolean;
    width?: number;
    height?: number;
  };
}

/**
 * Quiz element type
 */
export interface QuizElement extends InteractiveElement {
  type: 'quiz';
  content: {
    questions: Array<{
      id: string;
      text: string;
      type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching';
      options?: string[];
      correctAnswer: string | string[];
      explanation?: string;
      points?: number;
    }>;
    settings: {
      showResults: boolean;
      passingScore?: number;
      randomizeQuestions?: boolean;
      timeLimit?: number; // in seconds
    };
  };
}

/**
 * Slideshow element type
 */
export interface SlideshowElement extends InteractiveElement {
  type: 'slideshow';
  content: {
    slides: Array<{
      id: string;
      image: string;
      caption?: string;
      description?: string;
    }>;
    settings: {
      transition: 'fade' | 'slide' | 'zoom';
      autoplay: boolean;
      interval?: number; // in milliseconds
      showControls: boolean;
      showCaptions: boolean;
    };
  };
}

/**
 * Composable for managing interactive elements in digital books
 */
export const useInteractiveElements = () => {
  const { user, currentWorkspace } = useAuth();
  const { show: showToast } = useToaster();
  
  // State
  const loading = ref(false);
  const error = ref<string | null>(null);
  const interactiveElements = ref<InteractiveElement[]>([]);
  
  // Computed
  const workspaceId = computed(() => currentWorkspace.value?.id);
  
  /**
   * Create a new interactive element
   */
  const createInteractiveElement = async (bookId: string, pageId: string, element: Partial<InteractiveElement>) => {
    if (!workspaceId.value) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/interactive-elements', {
        method: 'POST',
        body: {
          book_id: bookId,
          page_id: pageId,
          element,
          workspace_id: workspaceId.value
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      const createdElement = response.data.value as InteractiveElement;
      interactiveElements.value.push(createdElement);
      
      showToast({
        type: 'success',
        message: 'Interactive element created successfully'
      });
      
      return createdElement;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to create interactive element: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Update an existing interactive element
   */
  const updateInteractiveElement = async (elementId: string, updates: Partial<InteractiveElement>) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/interactive-elements/${elementId}`, {
        method: 'PUT',
        body: updates
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      const updatedElement = response.data.value as InteractiveElement;
      
      // Update local state
      const index = interactiveElements.value.findIndex(el => el.id === elementId);
      if (index !== -1) {
        interactiveElements.value[index] = updatedElement;
      }
      
      showToast({
        type: 'success',
        message: 'Interactive element updated successfully'
      });
      
      return updatedElement;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to update interactive element: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Delete an interactive element
   */
  const deleteInteractiveElement = async (elementId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/interactive-elements/${elementId}`, {
        method: 'DELETE'
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Update local state
      interactiveElements.value = interactiveElements.value.filter(el => el.id !== elementId);
      
      showToast({
        type: 'success',
        message: 'Interactive element deleted successfully'
      });
      
      return true;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to delete interactive element: ${err.message}`
      });
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Get all interactive elements for a page
   */
  const getPageInteractiveElements = async (bookId: string, pageId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/interactive-elements?bookId=${bookId}&pageId=${pageId}`);
      if (response.error.value) throw new Error(response.error.value.message);
      
      interactiveElements.value = response.data.value as InteractiveElement[];
      return interactiveElements.value;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to fetch interactive elements: ${err.message}`
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Create a quiz element
   */
  const createQuizElement = async (bookId: string, pageId: string, quizData: Partial<QuizElement>) => {
    return createInteractiveElement(bookId, pageId, {
      ...quizData,
      type: 'quiz'
    });
  };
  
  /**
   * Create a slideshow element
   */
  const createSlideshowElement = async (bookId: string, pageId: string, slideshowData: Partial<SlideshowElement>) => {
    return createInteractiveElement(bookId, pageId, {
      ...slideshowData,
      type: 'slideshow'
    });
  };
  
  /**
   * Create an audio player element
   */
  const createAudioPlayerElement = async (bookId: string, pageId: string, audioData: Partial<InteractiveElement>) => {
    return createInteractiveElement(bookId, pageId, {
      ...audioData,
      type: 'audio_player'
    });
  };
  
  /**
   * Create a video player element
   */
  const createVideoPlayerElement = async (bookId: string, pageId: string, videoData: Partial<InteractiveElement>) => {
    return createInteractiveElement(bookId, pageId, {
      ...videoData,
      type: 'video_player'
    });
  };
  
  /**
   * Create an animation element
   */
  const createAnimationElement = async (bookId: string, pageId: string, animationData: Partial<InteractiveElement>) => {
    return createInteractiveElement(bookId, pageId, {
      ...animationData,
      type: 'animation'
    });
  };
  
  /**
   * Create an interactive map element
   */
  const createInteractiveMapElement = async (bookId: string, pageId: string, mapData: Partial<InteractiveElement>) => {
    return createInteractiveElement(bookId, pageId, {
      ...mapData,
      type: 'interactive_map'
    });
  };
  
  /**
   * Create a form element
   */
  const createFormElement = async (bookId: string, pageId: string, formData: Partial<InteractiveElement>) => {
    return createInteractiveElement(bookId, pageId, {
      ...formData,
      type: 'form'
    });
  };
  
  /**
   * Convert a standard page element to an interactive element
   */
  const convertToInteractiveElement = async (bookId: string, pageId: string, element: Element, interactiveType: InteractiveElement['type']) => {
    // Create a new interactive element based on the existing element
    const interactiveData: Partial<InteractiveElement> = {
      type: interactiveType,
      title: `Interactive ${interactiveType}`,
      settings: {
        width: parseInt(element.style.width) || 300,
        height: parseInt(element.style.height) || 200,
        responsive: true
      }
    };
    
    // Add type-specific default content
    switch (interactiveType) {
      case 'quiz':
        interactiveData.content = {
          questions: [
            {
              id: `q-${Date.now()}`,
              text: 'Sample question',
              type: 'multiple_choice',
              options: ['Option 1', 'Option 2', 'Option 3'],
              correctAnswer: 'Option 1'
            }
          ],
          settings: {
            showResults: true,
            randomizeQuestions: false
          }
        };
        break;
      case 'slideshow':
        interactiveData.content = {
          slides: [
            {
              id: `slide-${Date.now()}`,
              image: element.type === 'image' ? element.image?.src || '' : '',
              caption: 'Slide 1'
            }
          ],
          settings: {
            transition: 'fade',
            autoplay: true,
            interval: 3000,
            showControls: true,
            showCaptions: true
          }
        };
        break;
      // Add other type-specific defaults as needed
    }
    
    return createInteractiveElement(bookId, pageId, interactiveData);
  };
  
  return {
    // State
    loading,
    error,
    interactiveElements,
    
    // Methods
    createInteractiveElement,
    updateInteractiveElement,
    deleteInteractiveElement,
    getPageInteractiveElements,
    
    // Type-specific creation methods
    createQuizElement,
    createSlideshowElement,
    createAudioPlayerElement,
    createVideoPlayerElement,
    createAnimationElement,
    createInteractiveMapElement,
    createFormElement,
    convertToInteractiveElement
  };
};