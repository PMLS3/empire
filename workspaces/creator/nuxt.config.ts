import {
  demoRules,
  documentationRules,
  landingRules,
} from './config/routes-rules'

export default defineNuxtConfig({
  devtools: { enabled: true },

  extends: [
    /**
     * App layers: these are the layers that contains specific features
     * - landing: contains landing pages
     * - documentation: contains all /documentation pages
     */
    '../../layers/landing',
    import.meta.env.ENABLE_DOCUMENTATION && '../../layers/documentation',

    /**
     * This extends the base Tairo layer.
     *
     * Alternatively you can use the following:
     * ["gh:cssninjaStudio/tairo/layers/tairo#v1.4.0", {
     *    install: true,
     *    giget: { auth: import.meta.env.GITHUB_TOKEN },
     * }]
     *
     * @see https://github.com/unjs/c12#extending-config-layer-from-remote-sources
     *
     * This would allows you to create an empty git repository
     * with only your source code and no demo.
     */
    '../../layers/auth',
    '../../layers/layout-sidebar',
    '../../layers/layout-collapse',
    '../../layers/layout-topnav',
    '../../layers/layout-iconnav',
    '../../layers/shared',
  ],
  // nuxt behavior configuration
  runtimeConfig: {
    vertexProjectId: process.env.NUXT_VERTEX_PROJECT_ID,
    vertexLocation: process.env.NUXT_VERTEX_LOCATION,
    geminiApiKey: process.env.NUXT_GEMINI_API_KEY,
    geminiKey: process.env.NUXT_GEMINI_KEY,
    openaiKey: process.env.NUXT_OPENAI_KEY,
    openOrgId: process.env.NUXT_OPEN_ORG_ID,
    claudeKey: process.env.NUXT_CLAUDE_KEY,
    firecrawlApiKey: process.env.NUXT_FIRECRAWL_API_KEY,
    perplexity: process.env.NUXT_PERPLEXITY,
    wolfRamApiKey: process.env.NUXT_WOLFRAM_API_KEY,
    grokApiKey: process.env.NUXT_GROK_API_KEY || '',
    searchXNG: process.env.NUXT_SEARCH_XNG || '',
    ollama: process.env.NUXT_OLLAMA || '',
    googleFontsApiKey: process.env.NUXT_GOOGLE_FONTS_API_KEY,
    googleMapsKey: process.env.NUXT_GOOGLE_MAPS_KEY,
    tavilyKey: process.env.NUXT_TAVILY_KEY,
    functionsUrl: process.env.NODE_ENV === 'development' 
      ? process.env.NUXT_FUNCTIONS_URL_DEV 
      : process.env.NUXT_FUNCTIONS_URL_PROD,
    baseURL: process.env.NODE_ENV === 'development' 
      ? process.env.NUXT_BASE_URL_DEV 
      : process.env.NUXT_BASE_URL_PROD,
    baseURLPython: process.env.NODE_ENV === 'development' 
      ? process.env.NUXT_BASE_URL_PYTHON_DEV 
      : process.env.NUXT_BASE_URL_PYTHON_PROD,
    twilio: {
      accountSid: process.env.NUXT_TWILIO_ACCOUNT_SID,
      authToken: process.env.NUXT_TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.NUXT_TWILIO_PHONE_NUMBER,
      messagingServiceSid: process.env.NUXT_TWILIO_MESSAGING_SERVICE_SID || '',
    },
    firebaseConfig: {
      apiKey: process.env.NUXT_FIREBASE_API_KEY,
      authDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NUXT_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NUXT_FIREBASE_APP_ID,
      measurementId: process.env.NUXT_FIREBASE_MEASUREMENT_ID,
    },
    cloudMessaging: {
      keypair: process.env.NUXT_CLOUD_MESSAGING_KEYPAIR,
    },
    firebaseAdmin: {
      type: process.env.NUXT_FIREBASE_ADMIN_TYPE,
      project_id: process.env.NUXT_FIREBASE_ADMIN_PROJECT_ID,
      private_key_id: process.env.NUXT_FIREBASE_ADMIN_PRIVATE_KEY_ID,
      private_key: process.env.NUXT_FIREBASE_ADMIN_PRIVATE_KEY,
      client_email: process.env.NUXT_FIREBASE_ADMIN_CLIENT_EMAIL,
      client_id: process.env.NUXT_FIREBASE_ADMIN_CLIENT_ID,
      auth_uri: process.env.NUXT_FIREBASE_ADMIN_AUTH_URI,
      token_uri: process.env.NUXT_FIREBASE_ADMIN_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.NUXT_FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.NUXT_FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
      universe_domain: process.env.NUXT_FIREBASE_ADMIN_UNIVERSE_DOMAIN,
    },
    public: {
      vertexProjectId: process.env.NUXT_VERTEX_PROJECT_ID,
      vertexLocation: process.env.NUXT_VERTEX_LOCATION,
      geminiApiKey: process.env.NUXT_GEMINI_API_KEY,
      geminiKey: process.env.NUXT_GEMINI_KEY,
      openaiKey: process.env.NUXT_OPENAI_KEY,
      openOrgId: process.env.NUXT_OPEN_ORG_ID,
      claudeKey: process.env.NUXT_CLAUDE_KEY,
      firecrawlApiKey: process.env.NUXT_FIRECRAWL_API_KEY,
      perplexity: process.env.NUXT_PERPLEXITY,
      wolfRamApiKey: process.env.NUXT_WOLFRAM_API_KEY,
      grokApiKey: process.env.NUXT_GROK_API_KEY || '',
      searchXNG: process.env.NUXT_SEARCH_XNG || '',
      ollama: process.env.NUXT_OLLAMA || '',
      googleFontsApiKey: process.env.NUXT_GOOGLE_FONTS_API_KEY,
      googleMapsKey: process.env.NUXT_GOOGLE_MAPS_KEY,
      tavilyKey: process.env.NUXT_TAVILY_KEY,
      functionsUrl: process.env.NODE_ENV === 'development' 
        ? process.env.NUXT_FUNCTIONS_URL_DEV 
        : process.env.NUXT_FUNCTIONS_URL_PROD,
      baseURL: process.env.NODE_ENV === 'development' 
        ? process.env.NUXT_BASE_URL_DEV 
        : process.env.NUXT_BASE_URL_PROD,
      baseURLPython: process.env.NODE_ENV === 'development' 
        ? process.env.NUXT_BASE_URL_PYTHON_DEV 
        : process.env.NUXT_BASE_URL_PYTHON_PROD,
      twilio: {
        accountSid: process.env.NUXT_TWILIO_ACCOUNT_SID,
        authToken: process.env.NUXT_TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.NUXT_TWILIO_PHONE_NUMBER,
        messagingServiceSid: process.env.NUXT_TWILIO_MESSAGING_SERVICE_SID || '',
      },
      firebaseConfig: {
        apiKey: process.env.NUXT_FIREBASE_API_KEY,
        authDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NUXT_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NUXT_FIREBASE_APP_ID,
        measurementId: process.env.NUXT_FIREBASE_MEASUREMENT_ID,
      },
      cloudMessaging: {
        keypair: process.env.NUXT_CLOUD_MESSAGING_KEYPAIR,
      },
      firebaseAdmin: {
        type: process.env.NUXT_FIREBASE_ADMIN_TYPE,
        project_id: process.env.NUXT_FIREBASE_ADMIN_PROJECT_ID,
        private_key_id: process.env.NUXT_FIREBASE_ADMIN_PRIVATE_KEY_ID,
        private_key: process.env.NUXT_FIREBASE_ADMIN_PRIVATE_KEY,
        client_email: process.env.NUXT_FIREBASE_ADMIN_CLIENT_EMAIL,
        client_id: process.env.NUXT_FIREBASE_ADMIN_CLIENT_ID,
        auth_uri: process.env.NUXT_FIREBASE_ADMIN_AUTH_URI,
        token_uri: process.env.NUXT_FIREBASE_ADMIN_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.NUXT_FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.NUXT_FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
        universe_domain: process.env.NUXT_FIREBASE_ADMIN_UNIVERSE_DOMAIN,
      },
    },
    plotlyKey: process.env.NUXT_PLOTLY_KEY,
    googleTrendsKey: process.env.NUXT_GOOGLE_TRENDS_KEY,
    AI21_API_KEY: process.env.NUXT_AI21_API_KEY,
    ALEPHALPHA_API_KEY: process.env.NUXT_ALEPHALPHA_API_KEY,
    ARCJET_API_KEY: process.env.NUXT_ARCJET_API_KEY,
    AWS_ACCESS_KEY_ID: process.env.NUXT_AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.NUXT_AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.NUXT_AWS_REGION,
    AZURE_OPENAI_API_KEY: process.env.NUXT_AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_API_INSTANCE_NAME: process.env.NUXT_AZURE_OPENAI_API_INSTANCE_NAME,
    AZURE_OPENAI_API_DEPLOYMENT_NAME: process.env.NUXT_AZURE_OPENAI_API_DEPLOYMENT_NAME,
    AZURE_OPENAI_API_VERSION: process.env.NUXT_AZURE_OPENAI_API_VERSION,
    COHERE_API_KEY: process.env.NUXT_COHERE_API_KEY,
    DEEPINFRA_API_KEY: process.env.NUXT_DEEPINFRA_API_KEY,
    FIREWORKS_API_KEY: process.env.NUXT_FIREWORKS_API_KEY,
    FRIENDLI_TOKEN: process.env.NUXT_FRIENDLI_TOKEN,
    GRADIENT_ACCESS_KEY: process.env.NUXT_GRADIENT_ACCESS_KEY,
    HUGGINGFACE_API_KEY: process.env.NUXT_HUGGINGFACE_API_KEY,
    MISTRAL_API_KEY: process.env.NUXT_MISTRAL_API_KEY,
    RAYCAST_API_KEY: process.env.NUXT_RAYCAST_API_KEY,
    SERPAPI_API_KEY: process.env.NUXT_SERPAPI_API_KEY,
    WOLFRAM_ALPHA_APPID: process.env.NUXT_WOLFRAM_ALPHA_APPID,
    ZAPIER_NLA_API_KEY: process.env.NUXT_ZAPIER_NLA_API_KEY,
    BROWSERLESS_API_KEY: process.env.NUXT_BROWSERLESS_API_KEY,
    TAVILY_API_KEY: process.env.NUXT_TAVILY_KEY,
  },
  modules: [
    /**
     * Swiper is a nuxt module that allows us to use swiper in nuxt
     * wich is a carousel component used in the demo
     * @see https://github.com/cpreston321/nuxt-swiper
     */
    'nuxt-swiper',
  ],

  css: [
    '~/assets/css/colors.css',
    '@fontsource-variable/fira-code/index.css',
    '@fontsource-variable/inter/index.css',
    '@fontsource-variable/karla/index.css',
  ],

  app: {
    // pageTransition: {
    //   mode: 'out-in',
    //   enterActiveClass: 'transition-opacity duration-200 ease-out',
    //   enterFromClass: 'opacity-0',
    //   enterToClass: 'opacity-100',
    //   leaveActiveClass: 'transition-opacity duration-75 ease-in',
    //   leaveFromClass: 'opacity-100',
    //   leaveToClass: 'opacity-0',
    // },
    // layoutTransition: {
    //   mode: 'out-in',
    //   enterActiveClass: 'transition-opacity duration-200 ease-out',
    //   enterFromClass: 'opacity-0',
    //   enterToClass: 'opacity-100',
    //   leaveActiveClass: 'transition-opacity duration-200 ease-in',
    //   leaveFromClass: 'opacity-100',
    //   leaveToClass: 'opacity-0',
    // },
  },

  features: {
    inlineStyles: false,
  },

  experimental: {
    // Write early hints when using node server.
    writeEarlyHints: true,
    // Render JSON payloads with support for revivifying complex types.
    renderJsonPayloads: true,
    // Render tags in of the head in a more performant way
    headNext: true,
    // Use the new View Transitions API
    viewTransition: true,

    defaults: {
      useAsyncData: {
        // Use shallowRef in asyncData/fetch data
        deep: false,
      },
    },
  },

  typescript: {
    tsConfig: {
      // Here you can customize the generated tsconfig.json file
      vueCompilerOptions: {
        target: 3.4,
      },
    },
  },


  routeRules: {
    ...demoRules,
    ...landingRules,
    ...(import.meta.env.ENABLE_DOCUMENTATION ? documentationRules : {}),
  },

  // nuxt build configuration
  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },

  vite: {
    define: {
      // This enables vue-axe to work (used to check a11y - see .demo/plugins/vue-axe.ts)
      'import.meta.env.ENABLE_A11Y_AXE': import.meta.env.ENABLE_A11Y_AXE,

      // Enable / disable Options API support. Disabling this will result in smaller bundles,
      // but may affect compatibility with 3rd party libraries if they rely on Options API.
      // Splitplane uses Options API, so we need to enable it.
      '__VUE_OPTIONS_API__': true,
    },
    build: {
      target: 'esnext',
    },
    // Defining the optimizeDeps.include option prebuilds the dependencies, this avoid
    // some reloads when navigating between pages during development.
    // It's also useful to track them usage.
    optimizeDeps: {
      include: [
        '@headlessui-float/vue',
        'scule',
        'klona',
        '@vueform/slider',
        'v-calendar',
        // AddonCarouselIcon
        // AddonCarouselTeam
        'vue3-carousel',
        // AddonApexcharts
        'vue3-apexcharts',
        // AddonInputPhone
        'libphonenumber-js/max',
        'country-codes-list',
        // AddonInputPassword
        '@zxcvbn-ts/core',
        '@zxcvbn-ts/language-common',
        '@zxcvbn-ts/language-en',
        '@zxcvbn-ts/language-fr',
        // AddonMarkdownRemark
        'rehype-external-links',
        'rehype-raw',
        'rehype-sanitize',
        'rehype-stringify',
        '@shikijs/rehype',
        'remark-gfm',
        'remark-parse',
        'remark-rehype',
        'unified',
        // useMultiStepForm
        'vue3-smooth-dnd',
        'splitpanes',
        'mapbox-gl',
        '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.min.js',
        // DocComponentMeta
        // useDocumentationMeta
        // 'scule',
        // form validation
        '@vee-validate/zod',
        'vee-validate',
        'zod',
        // calendar app
        'date-fns',
        'date-fns/locale',
        // profile edit page
        'imask',
      ],
    },
  },

  compatibilityDate: '2025-03-01',
})