export const useApiRoute = (postfix: string) => {
    const { isDesktop } = useDevice()
  
    const config: any = useRuntimeConfig()
    const appConfig: any = useAppConfig()
    let returnUrl = (isDesktop && config.public.baseURL) 
      ? `${config.public.baseURL}${postfix}`
      : postfix
    if (appConfig.tairo.apiRoute) returnUrl += appConfig.tairo.apiRoute
    return returnUrl
  }
  
  export const useWebsocketRoute = (postfix: string) => {
    const { isDesktop } = useDevice()
  
    const config: any = useRuntimeConfig()
    const appConfig: any = useAppConfig()
    let returnUrl = isDesktop
      ? `ws${location.origin.replace(/^http/, "")}${postfix}`
      : `${config.public.baseURLPython.replace(/^http/, "ws")}${postfix}`
    if (appConfig.tairo.apiRoute) returnUrl += appConfig.tairo.apiRoute
  
    returnUrl = `${config.public.baseURLPython.replace(/^http/, "ws")}${postfix}`
  
    console.log('-----useWebsocketRoute-----', returnUrl)
  
    returnUrl.replace("http://", "ws://")
    return returnUrl
  }
  
  export const useApiRoutePython = (postfix: string) => {
    const { isDesktop } = useDevice()
  
    console.log('useApiRoutePython', postfix)
  
    const config: any = useRuntimeConfig()
    const appConfig: any = useAppConfig()
    let returnUrl = isDesktop ? postfix : config.public.baseURLPython + postfix
    console.log('Return URL', returnUrl)
    if (appConfig.tairo.apiRoutePython) returnUrl += appConfig.tairo.apiRoutePython
    console.log('Return URL', returnUrl)
    return returnUrl
  }
  
  export const useWebsocketRoutePyton = (postfix: string) => {
    const { isDesktop } = useDevice()
  
    const config: any = useRuntimeConfig()
    const appConfig: any = useAppConfig()
    let returnUrl = isDesktop
      ? `ws${location.origin.replace(/^http/, "")}${postfix}`
      : `${config.public.baseURLPython.replace(/^http/, "ws")}${postfix}`
    if (appConfig.tairo.apiRoutePython) returnUrl += appConfig.tairo.apiRoutePython
  returnUrl = `${config.public.baseURLPython.replace(/^http/, "ws")}${postfix}`
  
    console.log('Return URL', returnUrl)
    returnUrl.replace("http://", "ws://")
    return returnUrl
  }
  
  
  export const useBrowserUrl = () => {
    const location = useBrowserLocation()
  
    return location.value ? location.value.origin : ""
  }
  
  
  export const useRouting = () => {
    const fromTo = useState('fromTo', () => {
      return {
        from: '',
        to: '',
        navigate: true,
      }
    })
    return {
      fromTo,
    }
  }