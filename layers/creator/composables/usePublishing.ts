import { useAuth } from '~/composables/auth'
import type { Book, BookPage, ResearchExampleBook } from '~/types/book'
import { ref, computed } from 'vue'
import type { FunctionContext } from "./functions/index";
import type { ChatMessage } from "~/types/chat";
import type { CategoryResearch } from '~/types/publishing';



export interface BookAction {
  title: string
  description: string
  prompt?: string
  expectedResponse: string
  tools: { type: string; link: string }[]
}

export interface BookStructure {
  topic: {
    title: string
    description: string
    actions: BookAction[]
  }
  plan: {
    title: string
    description: string
    actions: BookAction[]
  }
  writing: {
    title: string
    description: string
    actions: BookAction[]
  }
  publish: {
    title: string
    description: string
    actions: BookAction[]
  }
}

export function usePublishing() {
  const { user, currentWorkspace } = useAuth()
  const { show: showToast } = useToaster()
  const book = useState<Book>('book', () => {
    return {
      keywords: [],
      criteriaPassed: false,
      bundlePossible: false,
      bsrCriteria: {
        kindle: { amount: 0, less: 30000, condition: false },
        paperback: { amount: 0, less: 80000, condition: false },
        audible: { amount: 0, less: 20000, condition: false },
      },
      search: { amount: 0, condition: false },
      topic: '',
      topicOptions: [],
      category: '',
      categoryOptions: [],
      subCategory: '',
      subCategoryOptions: [],
      categoryAnalysis: '',
      reviewsAnalysis: '',
      bookStructure: '',
      bookStructureBreakdown: [],
      chapters: [],
      language: 'en',
      languageOptions: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh'],
      format: 'ebook',
      formatOptions: ['ebook', 'paperback', 'hardback', 'audiobook'],
      size: { label: "6 x 9 in", dimensions: "15.24 x 22.86 cm", width: 15.24, length: 22.86 },
      bookPlan: '',
      cover: '',
      examples: []  // Start with empty array
    }
  })
  const books = useState<Book[]>('books', () => [])
  const research = useState<CategoryResearch>('research', () => {
    return {
      id: '',
      name: '',
      description: '',
      workspace_id: '',
      owner_id: '',
      main_category: '',
      sub_category: '',
      category_analysis: '',
      reviews_analysis: '',
      status: 'in_progress',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: new Date(),
      research_files: [],
      research_conversations: [],
      research_example_books: [],
      research_example_conversations: [],
      research_example_files: [],
      research_example_folders: [],
      research_example_uploads: [],
      research_example_research_files: [],
      research_example_research_conversations: [],
      research_example_research_folders: [],
      research_example_research_uploads: [],
      research_example_research_research_files: [],
      research_example_research_research_conversations: [],
      research_example_research_research_folders: [],
      research_example_research_research_uploads: [],
    }
  })

  const researchExamplesBooks = useState<ResearchExampleBook[]>('researchExamplesBooks', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const workspaceId = computed(() => currentWorkspace.value?.id)

  async function fetchBooks() {
    if (!workspaceId.value) return

    loading.value = true
    error.value = null

    try {
      const response = await useFetch(`/api/books?workspaceId=${workspaceId.value}`)
      if (response.error.value) throw new Error(response.error.value.message)
      books.value = response.data.value as Book[]
    } catch (err: any) {
      error.value = err.message
      showToast({
        type: 'error',
        message: `Failed to fetch books: ${err.message}`
      })
    } finally {
      loading.value = false
    }
  }

  async function createBook(data: Partial<Book>) {
    if (!workspaceId.value) return

    loading.value = true
    error.value = null

    try {
      const response = await useFetch('/api/books', {
        method: 'POST',
        body: {
          ...data,
          workspace_id: workspaceId.value,
          owner_id: user.value?.id
        }
      })

      if (response.error.value) throw new Error(response.error.value.message)

      await fetchBooks()
      showToast({
        type: 'success',
        message: 'Book created successfully'
      })

      return response.data.value as Book
    } catch (err: any) {
      error.value = err.message
      showToast({
        type: 'error',
        message: `Failed to create book: ${err.message}`
      })
    } finally {
      loading.value = false
    }
  }

  const createExampleBook = async (params: Partial<ExampleBook>) => {

    const data = {
      ...params,
      collection: 'research_example_books',
      research_id: research.value?.id,
      sub_category: research.value?.sub_category,

    }
    let res = await $fetch<ExampleBook>(`/api/data/write`, {
      method: 'POST',
      body: data
    })
    console.log('res', res)
    if (res.statusCode !== 200) throw new Error('Failed to create example book')
    //set research example id 
    console.log('parmats', params.title)
    let find = researchExamplesBooks.value.find(b => b.title === params.title)
    if (!find) throw new Error('Failed to find example book')
    console.log('find', find)
    find.id = res.data
    return res
  }

  const updateExampleBook = async (params: Partial<ExampleBook>) => {

    const data = {
      ...params,
      collection: 'research_example_books',
      research_id: research.value?.id,
      sub_category: research.value?.sub_category,

    }
    let res = await $fetch<ExampleBook>(`/api/data/update`, {
      method: 'POST',
      body: data
    })
    console.log('res', res)
    if (res.statusCode !== 200) throw new Error('Failed to update example book')
    //set research example id 
    console.log('parmats', params.title)
    let find = researchExamplesBooks.value.find(b => b.title === params.title)
    if (!find) throw new Error('Failed to find example book')
    console.log('find', find)
    find.id = res.data
    return res
  }

  const deleteExampleBook = async (id: string) => {
    let res = await $fetch<ExampleBook>(`/api/data/delete`, {
      method: 'POST',
      body: {
        collection: 'research_example_books',
        id: id
      }
    })
    console.log('res', res)
    if (res.statusCode !== 200) throw new Error('Failed to delete example book')
    const find = researchExamplesBooks.value.find(b => b.id === id)
    //remove from array
    researchExamplesBooks.value = researchExamplesBooks.value.filter(b => b.id !== id)
    if (!find) throw new Error('Failed to find example book')
    find.id = null
    return res
  }

  const bookStructure: BookStructure = {
    topic: {
      title: 'Topic Research',
      description: 'Research and validate your book topic',
      actions: [
        {
          title: 'Market Research',
          description: 'Analyze market demand and competition',
          prompt: 'What is the current market demand for this topic?',
          expectedResponse: 'Market analysis with key metrics',
          tools: [{ type: 'link', link: '/tools/market-research' }]
        },
        {
          title: 'Competitor Analysis',
          description: 'Research competing books in your niche',
          prompt: 'Who are the main competitors and what are their strengths/weaknesses?',
          expectedResponse: 'Detailed competitor analysis',
          tools: [{ type: 'link', link: '/tools/competitor-analysis' }]
        },
        {
          title: 'Keyword Research',
          description: 'Find profitable keywords and search terms',
          prompt: 'What keywords are readers searching for?',
          expectedResponse: 'List of high-value keywords',
          tools: [{ type: 'link', link: '/tools/keyword-research' }]
        },
        {
          title: 'Audience Research',
          description: 'Understand your target readers',
          prompt: 'Who is your ideal reader and what do they want?',
          expectedResponse: 'Reader persona and needs analysis',
          tools: [{ type: 'link', link: '/tools/audience-research' }]
        }
      ]
    },
    plan: {
      title: 'Book Planning',
      description: 'Plan your book structure and content',
      actions: [
        {
          title: 'Outline Creation',
          description: 'Create detailed book outline',
          prompt: 'What are the main chapters and sections?',
          expectedResponse: 'Structured book outline',
          tools: [{ type: 'link', link: '/tools/outline' }]
        },
        {
          title: 'Chapter Planning',
          description: 'Plan individual chapter content',
          prompt: 'What key points should each chapter cover?',
          expectedResponse: 'Detailed chapter plans',
          tools: [{ type: 'link', link: '/tools/chapter-planner' }]
        },
        {
          title: 'Research Planning',
          description: 'Plan required research and sources',
          prompt: 'What research is needed for each topic?',
          expectedResponse: 'Research plan with sources',
          tools: [{ type: 'link', link: '/tools/research-planner' }]
        },
        {
          title: 'Timeline Creation',
          description: 'Create writing and publishing timeline',
          prompt: 'What is your target completion date?',
          expectedResponse: 'Detailed project timeline',
          tools: [{ type: 'link', link: '/tools/timeline' }]
        }
      ]
    },
    writing: {
      title: 'Writing Process',
      description: 'Write and refine your book content',
      actions: [
        {
          title: 'Content Creation',
          description: 'Write your book content',
          prompt: 'Start writing based on your outline',
          expectedResponse: 'Chapter drafts',
          tools: [{ type: 'link', link: '/tools/editor' }]
        },
        {
          title: 'Editing',
          description: 'Edit and refine your content',
          prompt: 'Review and improve your writing',
          expectedResponse: 'Edited content',
          tools: [{ type: 'link', link: '/tools/editor' }]
        }
      ]
    },
    publish: {
      title: 'Publishing',
      description: 'Prepare and publish your book',
      actions: [
        {
          title: 'Format Book',
          description: 'Format your book for publication',
          prompt: 'Format content for chosen platforms',
          expectedResponse: 'Formatted book files',
          tools: [{ type: 'link', link: '/tools/formatter' }]
        },
        {
          title: 'Create Cover',
          description: 'Design your book cover',
          prompt: 'Design an attractive cover',
          expectedResponse: 'Book cover design',
          tools: [{ type: 'link', link: '/tools/cover-designer' }]
        }
      ]
    }
  }


  const BookSizeOptions = useState('BookSizeOptions', () => [
    { label: "5 x 8 in", dimensions: "12.7 x 20.32 cm", width: 12.7, length: 20.32 },
    { label: "5.06 x 7.81 in", dimensions: "12.85 x 19.84 cm", width: 12.85, length: 19.84 },
    { label: "5.25 x 8 in", dimensions: "13.34 x 20.32 cm", width: 13.34, length: 20.32 },
    { label: "5.5 x 8.5 in", dimensions: "13.97 x 21.59 cm", width: 13.97, length: 21.59 },
    { label: "6 x 9 in", dimensions: "15.24 x 22.86 cm", width: 15.24, length: 22.86 },
    { label: "6.14 x 9.21 in", dimensions: "15.6 x 23.39 cm", width: 15.6, length: 23.39 },
    { label: "6.69 x 9.61 in", dimensions: "16.99 x 24.41 cm", width: 16.99, length: 24.41 },
    { label: "7 x 10 in", dimensions: "17.78 x 25.4 cm", width: 17.78, length: 25.4 },
    { label: "7.44 x 9.69 in", dimensions: "18.9 x 24.61 cm", width: 18.9, length: 24.61 },
    { label: "7.5 x 9.25 in", dimensions: "19.05 x 23.5 cm", width: 19.05, length: 23.5 },
    { label: "8 x 10 in", dimensions: "20.32 x 25.4 cm", width: 20.32, length: 25.4 },
    { label: "8.25 x 6 in", dimensions: "20.96 x 15.24 cm", width: 20.96, length: 15.24 },
    { label: "8.25 x 8.25 in", dimensions: "20.96 x 20.96 cm", width: 20.96, length: 20.96 },
    { label: "8.5 x 8.5 in", dimensions: "21.59 x 21.59 cm", width: 21.59, length: 21.59 },
    { label: "8.5 x 11 in", dimensions: "21.59 x 27.94 cm", width: 21.59, length: 27.94 },
    { label: "8.27 x 11.69 in", dimensions: "21 x 29.7 cm", width: 21, length: 29.7 },
    { label: "Custom Size", dimensions: null, width: null, length: null }
  ])

  const BookFormats = useState<any[]>('BookFormats', () => [
    {
      name: 'Hardcover',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'tabler:book',
    },
    {
      name: 'Paperback',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'tabler:book',
    },
    {
      name: 'Ebook',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'tabler:book',
    },
  ])

  const BookTypes = useState<any[]>('BookTypes', () => [
    {
      name: 'Hardcover',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'tabler:book',
    },
    {
      name: 'Paperback',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'tabler:book',
    },
    {
      name: 'Ebook',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'tabler:book',
    },
  ])

  const bookCategories = useState<any[]>('bookCategories', () => [
    {
      name: 'Arts & Photography',
      date: 'Oct 31, 2022',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'tabler:trekking',
    },
    {
      name: 'Biographies & Memoirs',
      date: 'Nov 14, 2022',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'map:rafting',
    },
    {
      name: 'Business & Money',
      date: 'Dec 3, 2022',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'map:climbing',
    },
    {
      name: 'Children\'s Books',
      date: 'Dec 17, 2022',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'map:bicycle-store',
    },
    {
      name: 'Computers & Technology',
      date: 'Jan 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Cookbooks, Food & Wine',
      date: 'Jan 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'History',
      date: 'Feb 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Health, Fitness & Dieting',
      date: 'Feb 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Literature & Fiction',
      date: 'Mar 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Mystery, Thriller & Suspense',
      date: 'Mar 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Parenting & Relationships',
      date: 'Apr 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Reference',
      date: 'Apr 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Religion & Spirituality',
      date: 'May 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Romance',
      date: 'May 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Science Fiction & Fantasy',
      date: 'Jun 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Sports & Outdoors',
      date: 'Jun 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Travel',
      date: 'Jul 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Teens',
      date: 'Jul 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Deals in Books',
      date: 'Aug 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Crafts, Hobbies & Home',
      date: 'Aug 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Science & Math',
      date: 'Sep 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Humor & Entertainment',
      date: 'Sep 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Engineering & Transportation',
      date: 'Oct 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Christian Books & Bibles',
      date: 'Oct 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Lesbian, Gay, Bisexual & Transgender Books',
      date: 'Nov 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'LGBTQ+ Books',
      date: 'Nov 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Law',
      date: 'Dec 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Teen & Young Adult',
      date: 'Dec 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Comics & Graphic Novels',
      date: 'Jan 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Politics & Social Sciences',
      date: 'Jan 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Self-Help',
      date: 'Feb 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Education & Teaching',
      date: 'Feb 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Test Preparation',
      date: 'Mar 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Medical Books',
      date: 'Mar 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Calendars',
      date: 'Apr 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Books on CD',
      date: 'Apr 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Textbooks',
      date: 'May 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Nonfiction',
      date: 'May 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Sports',
      date: 'Jun 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Children\'s eBooks',
      date: 'Jun 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Comics, Manga & Graphic Novels',
      date: 'Jul 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Children\'s Nonfiction',
      date: 'Jul 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Cooking, Food & Wine',
      date: 'Aug 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'LGBTQ+ eBooks',
      date: 'Aug 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Medical eBooks',
      date: 'Sept 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Science',
      date: 'Sept 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Literary Criticism & Theory',
      date: 'Oct 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Education & Reference',
      date: 'Oct 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'General',
      date: 'Nov 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Classics',
      date: 'Nov 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Foreign Languages',
      date: 'Dec 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Libros en español',
      date: 'Dec 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Arts & Entertainment',
      date: 'Jan 2, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Home & Garden',
      date: 'Jan 17, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Health & Wellness',
      date: 'Feb 2, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Business & Careers',
      date: 'Feb 17, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Children\'s Audiobooks',
      date: 'Mar 2, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Education & Learning',
      date: 'Mar 17, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Erotica',
      date: 'Apr 2, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Relationships, Parenting & Personal Development',
      date: 'Apr 17, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'LGBTQ+',
      date: 'May 2, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Money & Finance',
      date: 'May 17, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Science & Engineering',
      date: 'Jun 2, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Teen',
      date: 'Jun 17, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Travel & Tourism',
      date: 'Jul 20, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
  ])

  const router = useRouter()

  const selectBookCategory = (category: any) => {
    console.log(category)
    research.value.main_category = category.name
    router.push(`/publishing/research`)
  }


  const useFireCrawlBook = async (
    urls: string[]
  ) => {


    console.log("[functionHandlers:useFireCrawlBook] Starting book extraction", urls);
    try {
      const { useFireCrawl } = useTools();

      const schema = `Extract comprehensive book information including:
  
            Basic Information:
            - Title and subtitle
            - Author(s) and their credentials
            - Publisher name
            - Publication date (exact date)
            - ISBN-10 and ISBN-13
            - Language
            - Price and formats available
            
            Physical Details:
            - Dimensions
            - Weight
            - Cover image URL
            
            Content:
            - Book description/summary
            - Table of contents
            - Sample content/preview
            - Reviews and ratings
            
            Sales & Performance:
            - Best Sellers Rank (BSR)
            - Estimated daily sales
            - Estimated daily royalties
            - Product age
            - Price information
            
            Additional Information:
            - Categories
            - Related books
            - Promotional content
            
            Please ensure all data is extracted exactly as shown on the page and format it according to the provided schema.`;

      const result: any = await useFireCrawl("book", schema, urls);
      if (result.error == undefined) {
        for (let i = 0; i < result.data.books.length; i++) {
          const book = result.data.books[i];
          researchExamplesBooks.value.push(book)
        }
      } else {
        console.log("[functionHandlers:useFireCrawlBook] Error:", result.error);
      }
    } catch (err: any) {
      console.log("[functionHandlers:useFireCrawlBook] Error:", err);
    }
  };

  const fetchBookCategories = async () => {
    return bookCategories.value
  }


  return {
    books,
    loading,
    error,
    fetchBooks,
    createBook,
    createExampleBook,
    deleteExampleBook,
    updateExampleBook,
    bookStructure,
    workspaceId,
    bookCategories,
    book,
    researchExamplesBooks,
    research,
    BookTypes,
    BookFormats,
    BookSizeOptions,
    useFireCrawlBook,
    selectBookCategory,
    fetchBookCategories,
  }
}


