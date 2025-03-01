interface Route {
  name: string
  description: string
  className: string
  props: {
    default: boolean
  },
  route: string
}

const defaultRoutes: Route[] = [
  {
    name: 'publishingDashboard',
    description: 'Dashboard for publishing',
    className: '',
    props: {
      default: true,
    },
    route: '/publishing-dashboard',
  },
  {
    name: 'publishingBookEditor',
    description: 'Editor for publishing books',
    className: '',
    props: {
      default: true,
    },
    route: '/publishing-book-editor',
  },
  {
    name: 'publishingBookCreateStep1',
    description: 'Create a new publishing book step 1',
    className: '',
    props: {
      default: true,
    },
    route: '/publishing-book-create-step-1',
  },
  {
    name: 'publishingBookCreateStep2',
    description: 'Create a new publishing book step 2',
    className: '',
    props: {
      default: true,
    },
    route: '/publishing-book-create-step-2',
  },
  {
    name: 'publishingBookCreateStep3',
    description: 'Create a new publishing book step 3',
    className: '',
    props: {
      default: true,
    },
    route: '/publishing-book-create-step-3',
  }
]

export const useRouting = () => {
  // Move useState inside the composable
  const routes = useState<Route[]>('routes', () => defaultRoutes)
  const goToRoute = useState('goToRoute', () => false)
  const chatCanvasElements = useState<any>('chatCanvasElements')
  const chatCanvasMainElement = useState<any>('chatCanvasMainElement')

  const setCanvasElements = (elements: Route[]) => {
    chatCanvasElements.value = elements
  }

  const addCanvasElement = (element: Route) => {
    chatCanvasElements.value.push(element)
  }

  const setRoute = (element: Route) => {
    console.log('setRoute ----', element)
    console.log('chatCanvasMainElement ----', chatCanvasMainElement.value)
    chatCanvasMainElement.value = element
    if (goToRoute.value) {
      useRouter().push(element.route)
    }
  }

  const getCanvasMainElement = () => {
    return chatCanvasMainElement.value
  }

  const getCanvasElements = () => {
    return chatCanvasElements.value
  }

  const getRoutingOptions = () => {
    const config = useRuntimeConfig()
    const geminiChat = useChatGemini(config.public.geminiApiKey)
    const { sendContextInfo } = geminiChat
    console.log('getRoutingOptions ----', routes.value)
    sendContextInfo(JSON.stringify(routes.value))
    return routes.value
  }

  return {
    routes,
    chatCanvasElements,
    chatCanvasMainElement,
    setCanvasElements,
    setRoute,
    addCanvasElement,
    getCanvasMainElement,
    getCanvasElements,
    getRoutingOptions,
  }
}

export const routingFunctions = () => {
  return useRouting()
}

export const systemInstructionRouting = () => {
  return `- getRoutingOptions: Get information about where the user can navigate
          Parameters:
            requestType (string) - Type of information to retrieve
          Returns: Object containing:
            - routes: Array of routes
            - mainRoute: The main route
            - elements: Array of elements
            - mainElement: The main element
            - requestType: The request type

          - setRoute: Navigate to a specific route
          Parameters:
            name (string) - The name of the route to navigate to
            description (string) - The description of the route to navigate to
            className (string) - The class name of the route to navigate to
            props (object) - The props of the route to navigate to
            route (string) - The route to navigate to
          Returns: Object containing:
            - route: The route to navigate to
            - requestType: The request type`
}

export const functionDeclarationsRouting = [
  {
    name: 'getRoutingOptions',
    description: 'Get information about where the user can navigate',
    parameters: {
      type: 'object',
      properties: {
        requestType: {
          type: 'string',
          description: 'Type of information to retrieve'
        }
      },
      required: ['requestType']
    }
  },
  {
    name: 'setRoute',
    description: 'Navigate to a specific route',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the route'
        },
        description: {
          type: 'string',
          description: 'Description of the route'
        },
        className: {
          type: 'string',
          description: 'CSS class name for styling'
        },
        props: {
          type: 'object',
          properties: {
            default: {
              type: 'boolean',
              description: 'Whether this is the default route'
            }
          },
          description: 'Route properties'
        },
        route: {
          type: 'string',
          description: 'The URL path for the route'
        }
      },
      required: ['name', 'description', 'className', 'props', 'route']
    }
  }
]