<script setup lang="ts">
import { ref } from 'vue';

const loading = ref(false);
const scriptContent = ref('');
const prompt = ref('');
const error = ref<string | null>(null);

// Available templates for different video styles
const templates = ref([
  {
    id: 'educational',
    name: 'Educational',
    description: 'Create an informative script that explains a concept clearly',
    icon: 'ph:graduation-cap-duotone',
    prompt: 'Write an educational script that clearly explains [TOPIC]. Include an engaging introduction, 3-5 main points, and a conclusion that summarizes the key takeaways.'
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    description: 'Create an engaging narrative with a beginning, middle, and end',
    icon: 'ph:book-open-text-duotone',
    prompt: 'Write a storytelling script about [TOPIC]. Include a compelling hook, character development, conflict, and resolution.'
  },
  {
    id: 'product',
    name: 'Product Review',
    description: 'Create a balanced product review with pros and cons',
    icon: 'ph:shopping-bag-duotone',
    prompt: 'Write a script for a product review video about [PRODUCT]. Include an introduction about the product, detailed features, pros and cons, and your final recommendation.'
  },
  {
    id: 'tutorial',
    name: 'Tutorial',
    description: 'Create a step-by-step guide for completing a task',
    icon: 'ph:list-checks-duotone',
    prompt: 'Write a tutorial script teaching viewers how to [TASK]. Include a brief introduction explaining the benefits, a list of necessary materials or prerequisites, step-by-step instructions, and tips for success.'
  },
  {
    id: 'entertaining',
    name: 'Entertainment',
    description: 'Create a fun, engaging script designed to entertain viewers',
    icon: 'ph:popcorn-duotone',
    prompt: 'Write an entertaining script about [TOPIC]. Focus on humor, interesting facts, and engaging storytelling to keep viewers entertained throughout.'
  }
]);

const selectedTemplate = ref(templates.value[0]);

// Use a template
const useTemplate = (template) => {
  selectedTemplate.value = template;
  prompt.value = template.prompt;
};

// Generate script based on the prompt
const generateScript = async () => {
  if (!prompt.value.trim()) {
    error.value = 'Please enter a prompt to generate a script.';
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    // Call the AI API to generate a script
    const response = await $fetch('/api/ai/text/generate', {
      method: 'POST',
      body: {
        prompt: prompt.value,
        system: 'You are a professional video script writer. Create well-structured, engaging scripts with natural dialogue, clear sections, and proper formatting.',
        max_tokens: 1500
      }
    });
    
    if (response.text) {
      scriptContent.value = response.text;
    } else {
      error.value = 'Failed to generate script. Please try again.';
    }
  } catch (err) {
    console.error('Error generating script:', err);
    error.value = err.message || 'Failed to generate script. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Export script to project
const exportToProject = async () => {
  // Logic to save the script to a project
  // This would typically open a modal or redirect to project creation page
};

// Refine the script with specific instructions
const refineScript = async (instruction: string) => {
  if (!scriptContent.value) {
    error.value = 'Please generate a script first before refining.';
    return;
  }
  
  loading.value = true;
  
  try {
    // Call the AI API to refine the existing script
    const response = await $fetch('/api/ai/text/generate', {
      method: 'POST',
      body: {
        prompt: `Please ${instruction} for the following script:\n\n${scriptContent.value}`,
        system: 'You are a professional video script editor. Improve scripts while maintaining their original structure and intent.',
        max_tokens: 1500
      }
    });
    
    if (response.text) {
      scriptContent.value = response.text;
    } else {
      error.value = 'Failed to refine script. Please try again.';
    }
  } catch (err) {
    console.error('Error refining script:', err);
    error.value = err.message || 'Failed to refine script. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <BasePageTitle title="Script Generator" subtitle="Create engaging video scripts with AI assistance" />
    
    <div class="grid grid-cols-12 gap-6">
      <!-- Templates panel -->
      <div class="col-span-12 lg:col-span-4 space-y-4">
        <BaseCard class="p-6">
          <BaseHeading size="sm" weight="medium" class="mb-4">Script Templates</BaseHeading>
          
          <div class="space-y-3">
            <div 
              v-for="template in templates" 
              :key="template.id"
              class="p-3 border rounded-lg cursor-pointer transition-colors"
              :class="selectedTemplate.id === template.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-muted-200 dark:border-muted-700 hover:border-primary-300 dark:hover:border-primary-700/50'"
              @click="useTemplate(template)"
            >
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-primary-100 dark:bg-primary-500/20 p-2">
                  <Icon :name="template.icon" class="size-5 text-primary-500" />
                </div>
                <div>
                  <div class="font-medium text-muted-900 dark:text-muted-100">{{ template.name }}</div>
                  <div class="text-xs text-muted-500 mt-0.5">{{ template.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
        
        <!-- Export Options -->
        <BaseCard class="p-6">
          <BaseHeading size="sm" weight="medium" class="mb-4">Export Options</BaseHeading>
          
          <div class="space-y-4">
            <BaseButton 
              color="primary" 
              block
              :disabled="!scriptContent"
              @click="exportToProject"
            >
              <Icon name="ph:folder-plus-duotone" class="me-2" />
              Save to Project
            </BaseButton>
            
            <BaseButton 
              color="default" 
              block
              :disabled="!scriptContent"
              @click="() => {
                navigator.clipboard.writeText(scriptContent);
                toaster.show({
                  title: 'Success',
                  message: 'Script copied to clipboard',
                  color: 'success'
                });
              }"
            >
              <Icon name="ph:copy-duotone" class="me-2" />
              Copy to Clipboard
            </BaseButton>
            
            <BaseButton 
              color="default" 
              block
              :disabled="!scriptContent"
              as="a" 
              :href="`data:text/plain;charset=utf-8,${encodeURIComponent(scriptContent)}`"
              download="video-script.txt"
            >
              <Icon name="ph:download-simple-duotone" class="me-2" />
              Download as Text
            </BaseButton>
          </div>
        </BaseCard>
      </div>
      
      <div class="col-span-12 lg:col-span-8 space-y-4">
        <!-- Prompt Input -->
        <BaseCard class="p-6">
          <BaseHeading size="sm" weight="medium" class="mb-4">Your Script Prompt</BaseHeading>
          
          <div class="space-y-4">
            <BaseTextarea
              v-model="prompt"
              :rows="5"
              placeholder="Describe the script you want to generate. Be specific about the topic, style, length, and any key points to include."
            />
            
            <div class="flex justify-end">
              <BaseButton 
                color="primary" 
                :loading="loading"
                :disabled="loading || !prompt.trim()"
                @click="generateScript"
              >
                <Icon name="ph:magic-wand-duotone" class="me-2" />
                Generate Script
              </BaseButton>
            </div>
          </div>
        </BaseCard>
        
        <!-- Generated Script -->
        <BaseCard class="p-6">
          <div class="flex justify-between items-center mb-4">
            <BaseHeading size="sm" weight="medium">Generated Script</BaseHeading>
            
            <div class="flex gap-2">
              <BaseButton 
                v-if="scriptContent" 
                color="default" 
                size="sm" 
                @click="scriptContent = ''"
              >
                Clear
              </BaseButton>
            </div>
          </div>
          
          <div v-if="loading" class="py-12 flex items-center justify-center">
            <div class="animate-pulse text-center">
              <Icon name="ph:brain-duotone" class="size-12 text-primary-500 opacity-50 mb-3" />
              <div class="text-muted-500">Generating your script...</div>
            </div>
          </div>
          
          <BaseMessage v-else-if="error" type="danger" class="mb-4">
            {{ error }}
          </BaseMessage>
          
          <div v-else-if="!scriptContent" class="py-12 text-center">
            <Icon name="ph:text-t-duotone" class="size-12 mx-auto text-muted-300 mb-3" />
            <BaseText class="text-muted-500">Your generated script will appear here</BaseText>
          </div>
          
          <div v-else>
            <div class="whitespace-pre-wrap bg-muted-50 dark:bg-muted-800 rounded-lg p-4 mb-4 font-mono text-sm">
              {{ scriptContent }}
            </div>
            
            <!-- Refinement Options -->
            <div class="pt-4 border-t border-muted-200 dark:border-muted-700">
              <BaseHeading size="xs" weight="medium" class="mb-3">Refine your script</BaseHeading>
              
              <div class="flex flex-wrap gap-2">
                <BaseButton 
                  size="sm" 
                  color="default" 
                  :disabled="loading" 
                  @click="refineScript('make it shorter and more concise')"
                >
                  Make it Shorter
                </BaseButton>
                <BaseButton 
                  size="sm" 
                  color="default" 
                  :disabled="loading" 
                  @click="refineScript('add more detail and make it longer')"
                >
                  Make it Longer
                </BaseButton>
                <BaseButton 
                  size="sm" 
                  color="default" 
                  :disabled="loading" 
                  @click="refineScript('use simpler language and make it easier to understand')"
                >
                  Simplify Language
                </BaseButton>
                <BaseButton 
                  size="sm" 
                  color="default" 
                  :disabled="loading" 
                  @click="refineScript('make it more conversational and engaging')"
                >
                  More Conversational
                </BaseButton>
                <BaseButton 
                  size="sm" 
                  color="default" 
                  :disabled="loading" 
                  @click="refineScript('add more humor and make it entertaining')"
                >
                  Add Humor
                </BaseButton>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
