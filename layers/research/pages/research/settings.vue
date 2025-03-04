<script setup lang="ts">
definePageMeta({
  title: 'Research Settings',
});
useHead({
  title: 'Research Settings',
});

const { isAuthenticated } = useAuth();
const toaster = useToaster();

// Form state
const embeddings = ref({
  provider: 'openai',
  model: 'text-embedding-ada-002',
  dimensions: 1536,
  apiKey: '',
  enableAuto: true,
  fields: ['description', 'title']
});

const apiCredentials = ref({
  openaiKey: '',
  perplexityKey: '',
  googleApiKey: '',
  amazonApiKey: '',
});

const dataSettings = ref({
  retentionPeriod: 90,
  autoBackup: true,
  backupFrequency: 'weekly',
  shareAnonymousData: false,
  storeFullText: true
});

const uiSettings = ref({
  defaultView: 'grid',
  resultsPerPage: 20,
  showThumbnails: true,
  enableAnimations: true,
  darkMode: false
});

// Provider options
const providerOptions = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'cohere', label: 'Cohere' },
  { value: 'vertexai', label: 'Google Vertex AI' },
  { value: 'huggingface', label: 'HuggingFace' },
];

// Model options
const modelOptions = computed(() => {
  switch (embeddings.value.provider) {
    case 'openai':
      return [
        { value: 'text-embedding-ada-002', label: 'Ada 002' },
        { value: 'text-embedding-3-small', label: 'Embedding V3 Small' },
        { value: 'text-embedding-3-large', label: 'Embedding V3 Large' },
      ];
    case 'cohere':
      return [
        { value: 'embed-english-v2.0', label: 'English V2' },
        { value: 'embed-multilingual-v2.0', label: 'Multilingual V2' },
      ];
    case 'vertexai':
      return [
        { value: 'textembedding-gecko', label: 'Gecko' },
        { value: 'textembedding-gecko-multilingual', label: 'Gecko Multilingual' },
      ];
    case 'huggingface':
      return [
        { value: 'sentence-transformers/all-mpnet-base-v2', label: 'MPNet Base V2' },
        { value: 'sentence-transformers/all-MiniLM-L6-v2', label: 'MiniLM L6 V2' },
      ];
    default:
      return [];
  }
});

// Fields options
const fieldOptions = [
  { value: 'description', label: 'Book Description' },
  { value: 'title', label: 'Book Title' },
  { value: 'content', label: 'Book Content' },
];

// Save settings
const saveEmbeddingSettings = () => {
  toaster.show({
    title: 'Settings Saved',
    message: 'Embedding settings have been updated',
    color: 'success',
    icon: 'ph:check-circle-duotone',
    closable: true,
  });
};

const saveApiCredentials = () => {
  toaster.show({
    title: 'API Keys Updated',
    message: 'Your API credentials have been securely saved',
    color: 'success',
    icon: 'ph:check-circle-duotone',
    closable: true,
  });
};

const saveDataSettings = () => {
  toaster.show({
    title: 'Data Settings Saved',
    message: 'Your data settings have been updated',
    color: 'success',
    icon: 'ph:check-circle-duotone',
    closable: true,
  });
};

const saveUiSettings = () => {
  toaster.show({
    title: 'UI Settings Saved',
    message: 'Your interface preferences have been updated',
    color: 'success',
    icon: 'ph:check-circle-duotone',
    closable: true,
  });
};

</script>

<template>
  <div class="space-y-6 pb-20 pt-4">
    <BaseHeading tag="h1" size="xl" weight="semibold" class="text-muted-800 dark:text-white">
      Research Settings
    </BaseHeading>
    
    <!-- Settings tabs -->
    <BaseTabs :tabs="[
      { label: 'Embeddings', value: 'embeddings', icon: 'ph:cube-duotone' },
      { label: 'API Keys', value: 'api', icon: 'ph:key-duotone' },
      { label: 'Data', value: 'data', icon: 'ph:database-duotone' },
      { label: 'Interface', value: 'ui', icon: 'ph:layout-duotone' },
    ]">
      
      <!-- Embeddings tab -->
      <template #tab-embeddings>
        <BaseCard class="p-6">
          <form @submit.prevent="saveEmbeddingSettings">
            <div class="space-y-6">
              <!-- Provider selection -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Vector Embedding Provider
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Select which provider to use for generating vector embeddings
                </BaseParagraph>
                <BaseSelect
                  v-model="embeddings.provider"
                  :items="providerOptions"
                  placeholder="Select embedding provider"
                  shape="rounded"
                />
              </div>
              
              <!-- Model selection -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Embedding Model
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Select which model to use for the selected provider
                </BaseParagraph>
                <BaseSelect
                  v-model="embeddings.model"
                  :items="modelOptions"
                  placeholder="Select embedding model"
                  shape="rounded"
                />
              </div>
              
              <!-- Vector dimensions -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Embedding Dimensions
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  The number of dimensions for vector embeddings (auto-determined by model)
                </BaseParagraph>
                <BaseInput
                  v-model="embeddings.dimensions"
                  type="number"
                  placeholder="Vector dimensions"
                  shape="rounded"
                  disabled
                />
                <BaseParagraph size="2xs" class="text-muted-400 mt-1">
                  Dimensions are determined by the model and cannot be changed manually
                </BaseParagraph>
              </div>
              
              <!-- Auto generation -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Automatic Embedding Generation
                </BaseHeading>
                <FormSwitch
                  v-model="embeddings.enableAuto"
                  label="Automatically generate embeddings when books are added"
                  color="primary"
                />
              </div>
              
              <!-- Fields to embed -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Fields to Embed
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Select which fields should have vector embeddings generated
                </BaseParagraph>
                <BaseCheckboxGroup 
                  v-model="embeddings.fields"
                  :options="fieldOptions"
                  color="primary"
                />
              </div>
              
              <!-- Submit button -->
              <div class="flex justify-end pt-4">
                <BaseButton
                  type="submit"
                  color="primary"
                >
                  <Icon name="ph:floppy-disk-duotone" class="me-2 size-4" />
                  <span>Save Embedding Settings</span>
                </BaseButton>
              </div>
            </div>
          </form>
        </BaseCard>
      </template>
      
      <!-- API Keys tab -->
      <template #tab-api>
        <BaseCard class="p-6">
          <form @submit.prevent="saveApiCredentials">
            <div class="space-y-6">
              <!-- OpenAI API Key -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  OpenAI API Key
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Used for embeddings and AI research capabilities
                </BaseParagraph>
                <BaseInput
                  v-model="apiCredentials.openaiKey"
                  type="password"
                  placeholder="sk-..."
                  shape="rounded"
                />
              </div>
              
              <!-- Perplexity API Key -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Perplexity API Key
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Used for deep research and advanced insights
                </BaseParagraph>
                <BaseInput
                  v-model="apiCredentials.perplexityKey"
                  type="password"
                  placeholder="pplx-..."
                  shape="rounded"
                />
              </div>
              
              <!-- Google API Key -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Google API Key
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Used for VertexAI embeddings and document processing
                </BaseParagraph>
                <BaseInput
                  v-model="apiCredentials.googleApiKey"
                  type="password"
                  placeholder="AIza..."
                  shape="rounded"
                />
              </div>
              
              <!-- Amazon API Key -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Amazon Product API Key
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Used for Amazon scraping and product data (optional)
                </BaseParagraph>
                <BaseInput
                  v-model="apiCredentials.amazonApiKey"
                  type="password"
                  placeholder="AKIA..."
                  shape="rounded"
                />
              </div>
              
              <!-- Submit button -->
              <div class="flex justify-end pt-4">
                <BaseButton
                  type="submit"
                  color="primary"
                >
                  <Icon name="ph:floppy-disk-duotone" class="me-2 size-4" />
                  <span>Save API Keys</span>
                </BaseButton>
              </div>
            </div>
          </form>
        </BaseCard>
      </template>
      
      <!-- Data tab -->
      <template #tab-data>
        <BaseCard class="p-6">
          <form @submit.prevent="saveDataSettings">
            <div class="space-y-6">
              <!-- Data Retention Period -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Data Retention Period
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Set how long to keep unused research data and files
                </BaseParagraph>
                <BaseSelect
                  v-model="dataSettings.retentionPeriod"
                  :items="[
                    { value: 30, label: '30 days' },
                    { value: 60, label: '60 days' },
                    { value: 90, label: '90 days' },
                    { value: 180, label: '6 months' },
                    { value: 365, label: '1 year' },
                    { value: 0, label: 'Forever' },
                  ]"
                  placeholder="Select retention period"
                  shape="rounded"
                />
              </div>
              
              <!-- Automatic Backup -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Automatic Backup
                </BaseHeading>
                <div class="space-y-4">
                  <FormSwitch
                    v-model="dataSettings.autoBackup"
                    label="Enable automatic backup of research data"
                    color="primary"
                  />
                  
                  <div v-if="dataSettings.autoBackup">
                    <BaseSelect
                      v-model="dataSettings.backupFrequency"
                      :items="[
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                        { value: 'monthly', label: 'Monthly' },
                      ]"
                      placeholder="Backup frequency"
                      shape="rounded"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Full Text Storage -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Full Text Storage
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Store full text content of scraped books for deeper analysis
                </BaseParagraph>
                <FormSwitch
                  v-model="dataSettings.storeFullText"
                  label="Store full text content when available"
                  color="primary"
                />
                <BaseParagraph size="2xs" class="text-muted-400 mt-2 ps-8">
                  Disabling this will save storage but limit some analysis capabilities
                </BaseParagraph>
              </div>
              
              <!-- Anonymous Data Sharing -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Anonymous Data Sharing
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Help improve our system by sharing anonymous usage statistics
                </BaseParagraph>
                <FormSwitch
                  v-model="dataSettings.shareAnonymousData"
                  label="Share anonymous usage data to improve the platform"
                  color="primary"
                />
              </div>
              
              <!-- Submit button -->
              <div class="flex justify-end pt-4">
                <BaseButton
                  type="submit"
                  color="primary"
                >
                  <Icon name="ph:floppy-disk-duotone" class="me-2 size-4" />
                  <span>Save Data Settings</span>
                </BaseButton>
              </div>
            </div>
          </form>
        </BaseCard>
      </template>
      
      <!-- UI tab -->
      <template #tab-ui>
        <BaseCard class="p-6">
          <form @submit.prevent="saveUiSettings">
            <div class="space-y-6">
              <!-- Default View -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Default View
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Choose how books and projects are displayed by default
                </BaseParagraph>
                <div class="flex gap-4">
                  <BaseRadio
                    v-model="uiSettings.defaultView"
                    name="default-view"
                    label="Grid View"
                    value="grid"
                    color="primary"
                  />
                  <BaseRadio
                    v-model="uiSettings.defaultView"
                    name="default-view"
                    label="List View"
                    value="list"
                    color="primary"
                  />
                </div>
              </div>
              
              <!-- Results Per Page -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Results Per Page
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Set the default number of items to show per page
                </BaseParagraph>
                <BaseSelect
                  v-model="uiSettings.resultsPerPage"
                  :items="[
                    { value: 10, label: '10 items' },
                    { value: 20, label: '20 items' },
                    { value: 50, label: '50 items' },
                    { value: 100, label: '100 items' },
                  ]"
                  placeholder="Select items per page"
                  shape="rounded"
                />
              </div>
              
              <!-- UI Options -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="mb-2 text-muted-800 dark:text-white">
                  Interface Options
                </BaseHeading>
                <div class="space-y-3">
                  <FormSwitch
                    v-model="uiSettings.showThumbnails"
                    label="Show book thumbnails in list view"
                    color="primary"
                  />
                  
                  <FormSwitch
                    v-model="uiSettings.enableAnimations"
                    label="Enable animations and transitions"
                    color="primary"
                  />
                  
                  <FormSwitch
                    v-model="uiSettings.darkMode"
                    label="Use dark mode by default"
                    color="primary"
                  />
                </div>
              </div>
              
              <!-- Submit button -->
              <div class="flex justify-end pt-4">
                <BaseButton
                  type="submit"
                  color="primary"
                >
                  <Icon name="ph:floppy-disk-duotone" class="me-2 size-4" />
                  <span>Save UI Settings</span>
                </BaseButton>
              </div>
            </div>
          </form>
        </BaseCard>
      </template>
    </BaseTabs>
  </div>
</template>
