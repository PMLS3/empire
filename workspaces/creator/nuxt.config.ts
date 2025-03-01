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
    vertexProjectId: 'one-person-empire-e8a1e',
    vertexLocation:  'us-central1',
    geminiApiKey: 'AIzaSyC11AjMVdyiy6j3mB-EoLbWuIdBJQSt3xE',
    geminiKey: 'AIzaSyCoJjFuiGqUd80ShFKqx9-Aqb9ozQKiu80',
    openaiKey: 'sk-proj-NzVR8wYPPIb7833OmxQqT3BlbkFJkMKRrVerOdj1XfYX2rtu',
    openOrgId: 'org-Crv0VWIHGavD436Ft4SHrDjT',
    claudeKey: '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',
    firecrawlApiKey: 'fc-bc2f04657587434e90b2476346e3d23f',
    perplexity: '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',
    wolfRamApiKey: 'JJ65XV-W67GVRT9YE',
    grokApiKey: '',
    searchXNG: '',
    ollama: '',
    googleFontsApiKey: 'AIzaSyDCiR__yLDYdb7rNIqpB7Jkx59Nk9Nv15U',
    googleMapsKey: 'AIzaSyBiIVwA0U4oLG1CsrA3-O7Q3l34SCjvhe4',
    tavilyKey: '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',
    functionsUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : 'https://us-central1-omni-connect-9b23d.cloudfunctions.net',
    baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://one-person-empire-agency-179403013840.us-central1.run.app',
    baseURLPython: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://one-person-empire-app-179403013840.us-central1.run.app',
    twilio: {
      accountSid: 'ACa7d817bdb793e0dff6a8d779141c8b9c',
      authToken: 'bb3e4e6b19b75b16fdf2437432c83b7c',
      phoneNumber: '7622487373',
      messagingServiceSid: '',
    },
    firebaseConfig: {
      apiKey: "AIzaSyDCiR__yLDYdb7rNIqpB7Jkx59Nk9Nv15U",
      authDomain: "one-person-empire-e8a1e.firebaseapp.com",
      projectId: "one-person-empire-e8a1e",
      storageBucket: "one-person-empire-e8a1e.firebasestorage.app",
      messagingSenderId: "179403013840",
      appId: "1:179403013840:web:28f4b10a8b5fd106b128d5",
      measurementId: "G-DGPEKGS8W7"
    },
    cloudMessaging: {
      keypair: 'BE0puyEYO0MuWDcBH0TNQMA7oCiZht1qsacAvd40p-05av1Sd3fHj2QzJh6lD8S8KgRcQWFYjaQfdCdZcjzLcA0',
    },
    firebaseAdmin: {
      type: 'service_account',
      project_id: 'omni-connect-9b23d',
      private_key_id: 'a23dcc8107c7a7d568e79de9e55eb2f8a64cc9ee',
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDdNT8rQcT+0jyR\n/1wAo797otnMoIhjv8ZIKFJwcdUPUXRQFEJGpbxgCpqboCIrYSG1heQ78LVQRAlF\nx6M5YD8kL9XU8v/F8pcOILhE6NvDXhjTK5nwnlmNE7nuyJy2beuzTTBKqpAE4qYT\nQI4ixvIwy2R3hiDNV2AUcaNOILUMk3dBTV4Mxnh4KELrJoFv+p1yraXjMNqubx5N\nYopGrxMW4DzUJAOmk/wczG9O5MZnybV/6BU48eoTeY95BSiRjajOl6J9Mcqt5Aug\ntnx1gdcHIZ7CWn7s4BMCmSwyhJZQ/DDCASAS4Bzg9Auq7NlDg1DVOK+MUaxdBjxG\nIetQ80mtAgMBAAECggEAMhgJEFlyTFedVl2q/s0WQ6AfLP8Mq/QlqbkR5DtvCatD\nSRAxaxDEvkYgeY4ztrmmGdaylx1dXgouRGJflRJ18hKwHKuT3wafDRi9SgOmotFI\nE2g8Efi2JGPbdxbwoEJ3vjDEdyA1gZm3DMSRe5Asj/67Z3LVMlMvY6nRVtPC1FAU\nBUviHpkpu0yTdC3iZtn9qXWZuU+JnwCdlvvlcLdrhSmLVkSUMyWzFkMIaNZp5PDX\ndla3k47usQHMDSMprmp7yk/GF1ZVkZBx4xN8LgDKHn1DveqHeNfVuwiI5Yt0/8mp\nocLmn3YIa52k3iwTjELZf6uNO9GCXFqlVhxE1ML2uQKBgQDyJIp5e4X2nnCHFpP/\nEEiKTj+oaq/1bZ3hfKqIMQ2vOM+QlJToNA1uokQgK1rIcLfM/sFNcWo+aqZihbnC\nDaCcWJAIQdsKCRKfYw6GZNqDiQNWnSzmcX7Qhs+hschJaPF3wy3rSfY4cLOxaH6G\nnUZhfgnsOGk2wL6zIfKWgJ4xVQKBgQDp3gGH0HhFx9wFjsjlCQh2hBOMnoVE9bXL\n+TdD/M12S/wTySCXjlDaDqZCa3VZb5lgbBq2Mpzr7ULqP67ufDrfpHn3azYISTCh\nd564RjRQmlgmIqERctllGuGBdoFF18ttkfgMV5Mv1im4zSQ6tdMQN5yFfdYyscjn\n6JDBg3gW+QKBgEnIvLFb5GxLxzpCtQIp8hDC2z70k32T02IcXNJ3MBZOl2EVBXLk\nOZuWsm+jBlzBjCBZGIoCnz85vE2VNg9dm61Ih0sc1iPus9ABnTFylesy2uOPrVjj\nCKN+ENLSm5dS9RFrVhi2RuLX5MmQb82RKxsWDuv+HIFkpjdrhsI5mvqpAoGARP1F\nzE/WOxeTM1yErPP2OCgMME5PGCG3yH0zLW41GjGeIiQR5kOIXFs39p4GlySRxVz+\noELcAckTFVFGBHpHT9QQWsmYvecBXpCQFOI46pItcMqEY0ZTFT1RysQvrG/VRfRq\njRGEjPcLhcWWa29Z3Q3asZKGjpvdnXQAx+VFltkCgYEAywFyk2uezUPwXIMvDQxK\nlOn79LkSAWPXdPfcNDzzqa7QXtUPhkumPGKy0mrmsik04GP4keZ1CSKKC+PvX+dX\noag5o+Lb5OJ6AfPKvMtreGXcQPV0JRSv3TRpdIQhXpJiear5pwAmGQfQO1k9viRR\nFAc36WM8rLxiMoizdhehMTQ=\n-----END PRIVATE KEY-----\n',
      client_email: 'firebase-adminsdk-pnxkl@omni-connect-9b23d.iam.gserviceaccount.com',
      client_id: '113231083550305624589',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-pnxkl%40omni-connect-9b23d.iam.gserviceaccount.com',
      universe_domain: 'googleapis.com',
    },
    public: {
      vertexProjectId: 'one-person-empire-e8a1e',
      vertexLocation:  'us-central1',
      geminiApiKey: 'AIzaSyC11AjMVdyiy6j3mB-EoLbWuIdBJQSt3xE',
      geminiKey: 'AIzaSyCoJjFuiGqUd80ShFKqx9-Aqb9ozQKiu80',
      openaiKey: 'sk-proj-NzVR8wYPPIb7833OmxQqT3BlbkFJkMKRrVerOdj1XfYX2rtu',
      openOrgId: 'org-Crv0VWIHGavD436Ft4SHrDjT',
      claudeKey: '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',
    firecrawlApiKey: 'fc-bc2f04657587434e90b2476346e3d23f',
    perplexity: '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',
    wolfRamApiKey: 'JJ65XV-W67GVRT9YE',

      grokApiKey: '',
      searchXNG: '',
      ollama: '',
      googleFontsApiKey: 'AIzaSyDCiR__yLDYdb7rNIqpB7Jkx59Nk9Nv15U',
      googleMapsKey: 'AIzaSyBiIVwA0U4oLG1CsrA3-O7Q3l34SCjvhe4',
      tavilyKey: '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',
      functionsUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : 'https://us-central1-omni-connect-9b23d.cloudfunctions.net',
      baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://omni-connect-ai-wkn5kwcztq-uc.a.run.app',
      baseURLPython: process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://one-person-empire-app-179403013840.us-central1.run.app',
  
  
      twilio: {
        accountSid: 'ACa7d817bdb793e0dff6a8d779141c8b9c',
        authToken: 'bb3e4e6b19b75b16fdf2437432c83b7c',
        phoneNumber: '7622487373',
        messagingServiceSid: '',
      },
      firebaseConfig: {
        apiKey: "AIzaSyDCiR__yLDYdb7rNIqpB7Jkx59Nk9Nv15U",
    authDomain: "one-person-empire-e8a1e.firebaseapp.com",
    projectId: "one-person-empire-e8a1e",
    storageBucket: "one-person-empire-e8a1e.firebasestorage.app",
    messagingSenderId: "179403013840",
    appId: "1:179403013840:web:28f4b10a8b5fd106b128d5",
    measurementId: "G-DGPEKGS8W7"
      },
      cloudMessaging: {
        keypair: 'BE0puyEYO0MuWDcBH0TNQMA7oCiZht1qsacAvd40p-05av1Sd3fHj2QzJh6lD8S8KgRcQWFYjaQfdCdZcjzLcA0',
      },
      firebaseAdmin: {
        type: 'service_account',
        project_id: 'omni-connect-9b23d',
        private_key_id: 'a23dcc8107c7a7d568e79de9e55eb2f8a64cc9ee',
        private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDdNT8rQcT+0jyR\n/1wAo797otnMoIhjv8ZIKFJwcdUPUXRQFEJGpbxgCpqboCIrYSG1heQ78LVQRAlF\nx6M5YD8kL9XU8v/F8pcOILhE6NvDXhjTK5nwnlmNE7nuyJy2beuzTTBKqpAE4qYT\nQI4ixvIwy2R3hiDNV2AUcaNOILUMk3dBTV4Mxnh4KELrJoFv+p1yraXjMNqubx5N\nYopGrxMW4DzUJAOmk/wczG9O5MZnybV/6BU48eoTeY95BSiRjajOl6J9Mcqt5Aug\ntnx1gdcHIZ7CWn7s4BMCmSwyhJZQ/DDCASAS4Bzg9Auq7NlDg1DVOK+MUaxdBjxG\nIetQ80mtAgMBAAECggEAMhgJEFlyTFedVl2q/s0WQ6AfLP8Mq/QlqbkR5DtvCatD\nSRAxaxDEvkYgeY4ztrmmGdaylx1dXgouRGJflRJ18hKwHKuT3wafDRi9SgOmotFI\nE2g8Efi2JGPbdxbwoEJ3vjDEdyA1gZm3DMSRe5Asj/67Z3LVMlMvY6nRVtPC1FAU\nBUviHpkpu0yTdC3iZtn9qXWZuU+JnwCdlvvlcLdrhSmLVkSUMyWzFkMIaNZp5PDX\ndla3k47usQHMDSMprmp7yk/GF1ZVkZBx4xN8LgDKHn1DveqHeNfVuwiI5Yt0/8mp\nocLmn3YIa52k3iwTjELZf6uNO9GCXFqlVhxE1ML2uQKBgQDyJIp5e4X2nnCHFpP/\nEEiKTj+oaq/1bZ3hfKqIMQ2vOM+QlJToNA1uokQgK1rIcLfM/sFNcWo+aqZihbnC\nDaCcWJAIQdsKCRKfYw6GZNqDiQNWnSzmcX7Qhs+hschJaPF3wy3rSfY4cLOxaH6G\nnUZhfgnsOGk2wL6zIfKWgJ4xVQKBgQDp3gGH0HhFx9wFjsjlCQh2hBOMnoVE9bXL\n+TdD/M12S/wTySCXjlDaDqZCa3VZb5lgbBq2Mpzr7ULqP67ufDrfpHn3azYISTCh\nd564RjRQmlgmIqERctllGuGBdoFF18ttkfgMV5Mv1im4zSQ6tdMQN5yFfdYyscjn\n6JDBg3gW+QKBgEnIvLFb5GxLxzpCtQIp8hDC2z70k32T02IcXNJ3MBZOl2EVBXLk\nOZuWsm+jBlzBjCBZGIoCnz85vE2VNg9dm61Ih0sc1iPus9ABnTFylesy2uOPrVjj\nCKN+ENLSm5dS9RFrVhi2RuLX5MmQb82RKxsWDuv+HIFkpjdrhsI5mvqpAoGARP1F\nzE/WOxeTM1yErPP2OCgMME5PGCG3yH0zLW41GjGeIiQR5kOIXFs39p4GlySRxVz+\noELcAckTFVFGBHpHT9QQWsmYvecBXpCQFOI46pItcMqEY0ZTFT1RysQvrG/VRfRq\njRGEjPcLhcWWa29Z3Q3asZKGjpvdnXQAx+VFltkCgYEAywFyk2uezUPwXIMvDQxK\nlOn79LkSAWPXdPfcNDzzqa7QXtUPhkumPGKy0mrmsik04GP4keZ1CSKKC+PvX+dX\noag5o+Lb5OJ6AfPKvMtreGXcQPV0JRSv3TRpdIQhXpJiear5pwAmGQfQO1k9viRR\nFAc36WM8rLxiMoizdhehMTQ=\n-----END PRIVATE KEY-----\n',
        client_email: 'firebase-adminsdk-pnxkl@omni-connect-9b23d.iam.gserviceaccount.com',
        client_id: '113231083550305624589',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-pnxkl%40omni-connect-9b23d.iam.gserviceaccount.com',
        universe_domain: 'googleapis.com',
      },
  
    },
    plotlyKey: 'your-plotly-key',
    googleTrendsKey: 'your-google-trends-key',
    AI21_API_KEY: 'xxx',
    ALEPHALPHA_API_KEY: 'xxx',
    ARCJET_API_KEY: 'xxx',
    AWS_ACCESS_KEY_ID: 'xxx',
    AWS_SECRET_ACCESS_KEY: 'xxx',
    AWS_REGION: 'us-east-1',
    AZURE_OPENAI_API_KEY: 'xxx',
    AZURE_OPENAI_API_INSTANCE_NAME: 'xxx',
    AZURE_OPENAI_API_DEPLOYMENT_NAME: 'xxx',
    AZURE_OPENAI_API_VERSION: '2024-02-01',
    COHERE_API_KEY: 'xxx',
    DEEPINFRA_API_KEY: 'xxx',
    FIREWORKS_API_KEY: 'xxx',
    FRIENDLI_TOKEN: 'xxx',
    GRADIENT_ACCESS_KEY: 'xxx',
    HUGGINGFACE_API_KEY: 'xxx',
    MISTRAL_API_KEY: 'xxx',
    RAYCAST_API_KEY: 'xxx',
    SERPAPI_API_KEY: 'xxx',
    WOLFRAM_ALPHA_APPID: 'xxx',
    ZAPIER_NLA_API_KEY: 'xxx',
    BROWSERLESS_API_KEY: 'xxx',
    TAVILY_API_KEY: 'xxx',
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