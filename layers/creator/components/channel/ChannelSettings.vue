<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';
import { z } from 'zod';
import { useCreatorData } from '../../composables/useCreatorData';

const props = defineProps<{
  channelId: string;
}>();

const { getDataById, updateData } = useCreatorData();

// Validation schema for channel settings
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Channel name is required'),
    description: z.string().optional(),
    branding: z.object({
      logo: z.string().optional(),
      banner: z.string().optional(),
      color: z.string().optional(),
    }),
    social: z.object({
      youtube: z.string().optional(),
      tiktok: z.string().optional(),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
    }),
    team: z.array(
      z.object({
        id: z.string(),
        role: z.enum(['admin', 'editor', 'viewer']),
      })
    ),
    settings: z.object({
      autoPublish: z.boolean(),
      notifications: z.boolean(),
      commentApproval: z.boolean(),
    }),
  })
);

const { loading, currentData, error } = ref({
  loading: true,
  currentData: null,
  error: null
});

// Fetch channel data
onMounted(async () => {
  loading.value = true;
  try {
    currentData.value = await getDataById('channels', props.channelId);
  } catch (err) {
    error.value = 'Failed to load channel settings';
  } finally {
    loading.value = false;
  }
});

const initialValues = computed(() => {
  return currentData.value || {
    name: '',
    description: '',
    branding: {
      logo: '',
      banner: '',
      color: '#4f46e5',
    },
    social: {
      youtube: '',
      tiktok: '',
      instagram: '',
      twitter: '',
    },
    team: [],
    settings: {
      autoPublish: false,
      notifications: true,
      commentApproval: false,
    },
  };
});

const {
  handleSubmit,
  isSubmitting,
  values,
  errors,
  resetForm,
  meta,
  setFieldValue,
} = useForm({
  validationSchema,
  initialValues,
});

// Team members management
const teamMembers = ref([]);
const newTeamMember = ref({
  email: '',
  role: 'editor'
});

const addTeamMember = () => {
  if (!newTeamMember.value.email) return;
  
  // In a real implementation, you would verify the email and get the user ID
  const id = `temp-${Date.now()}`;
  
  teamMembers.value.push({
    id,
    email: newTeamMember.value.email,
    role: newTeamMember.value.role
  });
  
  setFieldValue('team', teamMembers.value);
  newTeamMember.value.email = '';
};

const removeTeamMember = (index) => {
  teamMembers.value.splice(index, 1);
  setFieldValue('team', teamMembers.value);
};

// OAuth connections
const oauthStatus = ref({
  youtube: false,
  tiktok: false,
  instagram: false,
  twitter: false,
});

const connectOAuth = async (platform) => {
  // In a real implementation, you would initiate OAuth flow for the platform
  try {
    // Mock OAuth connection
    oauthStatus.value[platform] = true;
  } catch (err) {
    console.error(`Error connecting to ${platform}:`, err);
  }
};

const disconnectOAuth = async (platform) => {
  // In a real implementation, you would disconnect the OAuth token
  oauthStatus.value[platform] = false;
  setFieldValue(`social.${platform}`, '');
};

// Form submission
const onSubmit = handleSubmit(async (formValues) => {
  try {
    await updateData('channels', props.channelId, formValues);
  } catch (err) {
    console.error('Error updating channel:', err);
  }
});

// File uploads
const handleFileUpload = async (field, file) => {
  if (!file) return;
  
  // In a real implementation, you would upload the file to storage
  // and get back the URL to store in the form
  const mockUrl = `https://storage.example.com/${field}-${Date.now()}`;
  setFieldValue(`branding.${field}`, mockUrl);
};

const logoFile = ref(null);
const bannerFile = ref(null);

watch(logoFile, (files) => {
  if (files && files.length > 0) {
    handleFileUpload('logo', files[0]);
  }
});

watch(bannerFile, (files) => {
  if (files && files.length > 0) {
    handleFileUpload('banner', files[0]);
  }
});
</script>

<template>
  <div class="divide-muted-200 dark:divide-muted-800 space-y-20 py-6">
    <BaseMessage v-if="error" type="danger" @close="error = null">
      {{ error }}
    </BaseMessage>
    
    <div v-if="loading">
      <BasePlaceholderPage
        title="Loading settings"
        subtitle="Please wait while we load your channel settings"
      />
    </div>
    
    <form v-else @submit.prevent="onSubmit" class="space-y-12">
      <!-- Channel Information -->
      <div class="grid gap-8 md:grid-cols-12">
        <div class="md:col-span-4">
          <BaseHeading
            as="h3"
            size="md"
            weight="medium"
            class="text-muted-800 dark:text-muted-100 mb-1"
          >
            Channel Information
          </BaseHeading>
          <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
            Edit your channel's basic details and description.
          </BaseParagraph>
        </div>
        
        <div class="md:col-span-8">
          <BaseCard class="p-6">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="name">
                  <BaseInput
                    label="Channel Name"
                    placeholder="My Awesome Channel"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="description">
                  <BaseTextarea
                    label="Channel Description"
                    placeholder="Describe what your channel is about..."
                    rows="4"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
      
      <!-- Branding -->
      <div class="grid gap-8 md:grid-cols-12">
        <div class="md:col-span-4">
          <BaseHeading
            as="h3"
            size="md"
            weight="medium"
            class="text-muted-800 dark:text-muted-100 mb-1"
          >
            Branding
          </BaseHeading>
          <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
            Customize your channel's visual identity.
          </BaseParagraph>
        </div>
        
        <div class="md:col-span-8">
          <BaseCard class="p-6">
            <div class="grid grid-cols-12 gap-6">
              <div class="col-span-12">
                <label class="nui-label pb-2 text-[0.825rem]">Channel Logo</label>
                <div class="flex items-center gap-4">
                  <div class="relative size-20">
                    <img
                      v-if="values.branding?.logo"
                      :src="values.branding.logo"
                      alt="Channel logo"
                      class="bg-muted-200 dark:bg-muted-700/60 size-20 rounded-full object-cover object-center"
                    >
                    <div v-else class="bg-muted-200 dark:bg-muted-700/60 size-20 rounded-full flex items-center justify-center">
                      <Icon name="ph:camera-duotone" class="size-8 text-muted-400" />
                    </div>
                    
                    <BaseInputFileHeadless
                      v-slot="{ open }"
                      v-model="logoFile"
                      accept="image/*"
                    >
                      <div class="absolute bottom-0 end-0 z-20">
                        <BaseButtonIcon
                          size="sm"
                          rounded="full"
                          @click="open"
                        >
                          <Icon name="lucide:plus" class="size-4" />
                        </BaseButtonIcon>
                      </div>
                    </BaseInputFileHeadless>
                  </div>
                  <BaseParagraph size="xs" class="text-muted-400">
                    Upload a square logo image (recommended size: 400x400px)
                  </BaseParagraph>
                </div>
              </div>
              
              <div class="col-span-12">
                <label class="nui-label pb-2 text-[0.825rem]">Channel Banner</label>
                <div class="mb-2 bg-muted-200 dark:bg-muted-700/60 rounded-lg overflow-hidden h-40 relative">
                  <img
                    v-if="values.branding?.banner"
                    :src="values.branding.banner"
                    alt="Channel banner"
                    class="w-full h-full object-cover object-center"
                  >
                  <div v-else class="h-full w-full flex items-center justify-center">
                    <Icon name="ph:image-duotone" class="size-12 text-muted-400" />
                  </div>
                  
                  <BaseInputFileHeadless
                    v-slot="{ open }"
                    v-model="bannerFile"
                    accept="image/*"
                  >
                    <div class="absolute bottom-4 end-4 z-20">
                      <BaseButton
                        size="sm"
                        rounded="lg"
                        @click="open"
                      >
                        <Icon name="lucide:upload" class="size-4 me-1" />
                        <span>Upload Banner</span>
                      </BaseButton>
                    </div>
                  </BaseInputFileHeadless>
                </div>
                <BaseParagraph size="xs" class="text-muted-400">
                  Upload a banner image (recommended size: 2560x1440px)
                </BaseParagraph>
              </div>
              
              <div class="col-span-12 sm:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="branding.color">
                  <BaseInput
                    type="color"
                    label="Brand Color"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
      
      <!-- Social Media -->
      <div class="grid gap-8 md:grid-cols-12">
        <div class="md:col-span-4">
          <BaseHeading
            as="h3"
            size="md"
            weight="medium"
            class="text-muted-800 dark:text-muted-100 mb-1"
          >
            Social Media
          </BaseHeading>
          <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
            Connect your social media accounts to publish content.
          </BaseParagraph>
        </div>
        
        <div class="md:col-span-8">
          <BaseCard class="divide-muted-200 dark:divide-muted-700 divide-y">
            <!-- YouTube -->
            <div class="p-6 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <Icon name="logos:youtube-icon" class="size-8" />
                <div>
                  <BaseHeading
                    as="h4"
                    size="sm"
                    weight="medium"
                    class="text-muted-800 dark:text-muted-100"
                  >
                    YouTube
                  </BaseHeading>
                  <BaseText
                    size="xs"
                    class="text-muted-400"
                  >
                    {{ oauthStatus.youtube ? values.social.youtube || 'Connected' : 'Not connected' }}
                  </BaseText>
                </div>
              </div>
              
              <BaseButton
                v-if="!oauthStatus.youtube"
                color="default"
                @click="connectOAuth('youtube')"
              >
                <Icon name="ph:link-duotone" class="me-2 size-4" />
                Connect
              </BaseButton>
              <BaseButton
                v-else
                color="danger"
                @click="disconnectOAuth('youtube')"
              >
                <Icon name="ph:link-break-duotone" class="me-2 size-4" />
                Disconnect
              </BaseButton>
            </div>
            
            <!-- TikTok -->
            <div class="p-6 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <Icon name="logos:tiktok-icon" class="size-8" />
                <div>
                  <BaseHeading
                    as="h4"
                    size="sm"
                    weight="medium"
                    class="text-muted-800 dark:text-muted-100"
                  >
                    TikTok
                  </BaseHeading>
                  <BaseText
                    size="xs"
                    class="text-muted-400"
                  >
                    {{ oauthStatus.tiktok ? values.social.tiktok || 'Connected' : 'Not connected' }}
                  </BaseText>
                </div>
              </div>
              
              <BaseButton
                v-if="!oauthStatus.tiktok"
                color="default"
                @click="connectOAuth('tiktok')"
              >
                <Icon name="ph:link-duotone" class="me-2 size-4" />
                Connect
              </BaseButton>
              <BaseButton
                v-else
                color="danger"
                @click="disconnectOAuth('tiktok')"
              >
                <Icon name="ph:link-break-duotone" class="me-2 size-4" />
                Disconnect
              </BaseButton>
            </div>
            
            <!-- Instagram -->
            <div class="p-6 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <Icon name="mdi:instagram" class="size-8" />
                <div>
                  <BaseHeading
                    as="h4"
                    size="sm"
                    weight="medium"
                    class="text-muted-800 dark:text-muted-100"
                  >
                    Instagram
                  </BaseHeading>
                  <BaseText
                    size="xs"
                    class="text-muted-400"
                  >
                    {{ oauthStatus.instagram ? values.social.instagram || 'Connected' : 'Not connected' }}
                  </BaseText>
                </div>
              </div>
              
              <BaseButton
                v-if="!oauthStatus.instagram"
                color="default"
                @click="connectOAuth('instagram')"
              >
                <Icon name="ph:link-duotone" class="me-2 size-4" />
                Connect
              </BaseButton>
              <BaseButton
                v-else
                color="danger"
                @click="disconnectOAuth('instagram')"
              >
                <Icon name="ph:link-break-duotone" class="me-2 size-4" />
                Disconnect
              </BaseButton>
            </div>
            
            <!-- Twitter -->
            <div class="p-6 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <Icon name="mdi:twitter" class="size-8" />
                <div>
                  <BaseHeading
                    as="h4"
                    size="sm"
                    weight="medium"
                    class="text-muted-800 dark:text-muted-100"
                  >
                    Twitter
                  </BaseHeading>
                  <BaseText
                    size="xs"
                    class="text-muted-400"
                  >
                    {{ oauthStatus.twitter ? values.social.twitter || 'Connected' : 'Not connected' }}
                  </BaseText>
                </div>
              </div>
              
              <BaseButton
                v-if="!oauthStatus.twitter"
                color="default"
                @click="connectOAuth('twitter')"
              >
                <Icon name="ph:link-duotone" class="me-2 size-4" />
                Connect
              </BaseButton>
              <BaseButton
                v-else
                color="danger"
                @click="disconnectOAuth('twitter')"
              >
                <Icon name="ph:link-break-duotone" class="me-2 size-4" />
                Disconnect
              </BaseButton>
            </div>
          </BaseCard>
        </div>
      </div>
      
      <!-- Team Management -->
      <div class="grid gap-8 md:grid-cols-12">
        <div class="md:col-span-4">
          <BaseHeading
            as="h3"
            size="md"
            weight="medium"
            class="text-muted-800 dark:text-muted-100 mb-1"
          >
            Team Management
          </BaseHeading>
          <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
            Invite team members and manage their permissions.
          </BaseParagraph>
        </div>
        
        <div class="md:col-span-8">
          <BaseCard class="p-6">
            <div class="mb-6 flex flex-col gap-4">
              <div class="flex items-end gap-4">
                <div class="grow">
                  <BaseInput
                    v-model="newTeamMember.email"
                    label="Email Address"
                    placeholder="team@example.com"
                  />
                </div>
                <div class="w-32">
                  <BaseSelect
                    v-model="newTeamMember.role"
                    label="Role"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </BaseSelect>
                </div>
                <BaseButton
                  color="primary"
                  @click="addTeamMember"
                >
                  <Icon name="ph:plus-duotone" class="me-1 size-4" />
                  Invite
                </BaseButton>
              </div>
              
              <BaseParagraph size="xs" class="text-muted-400">
                <strong>Admin:</strong> Full access to manage channel settings and content.<br>
                <strong>Editor:</strong> Can create and edit content, but cannot change channel settings.<br>
                <strong>Viewer:</strong> Can view content and analytics, but cannot make changes.
              </BaseParagraph>
            </div>
            
            <div class="divide-muted-200 dark:divide-muted-700 divide-y">
              <div
                v-for="(member, index) in teamMembers"
                :key="`team-${index}`"
                class="flex items-center justify-between py-3"
              >
                <div class="flex items-center gap-3">
                  <BaseAvatar
                    size="sm"
                    :text="member.email.charAt(0).toUpperCase()"
                  />
                  <div>
                    <BaseHeading
                      as="h4"
                      size="sm"
                      weight="medium"
                      class="text-muted-800 dark:text-muted-100"
                    >
                      {{ member.email }}
                    </BaseHeading>
                    <BaseTag
                      :color="member.role === 'admin' ? 'primary' : member.role === 'editor' ? 'info' : 'default'"
                      size="sm"
                      rounded="md"
                    >
                      {{ member.role.charAt(0).toUpperCase() + member.role.slice(1) }}
                    </BaseTag>
                  </div>
                </div>
                
                <BaseButtonIcon
                  color="danger"
                  size="sm"
                  @click="removeTeamMember(index)"
                >
                  <Icon name="ph:trash-duotone" class="size-4" />
                </BaseButtonIcon>
              </div>
              
              <div v-if="!teamMembers.length" class="py-8 text-center">
                <Icon name="ph:users-duotone" class="mx-auto mb-2 size-12 text-muted-400" />
                <BaseText size="sm" class="text-muted-400">
                  No team members yet. Invite someone to collaborate!
                </BaseText>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
      
      <!-- Channel Settings -->
      <div class="grid gap-8 md:grid-cols-12">
        <div class="md:col-span-4">
          <BaseHeading
            as="h3"
            size="md"
            weight="medium"
            class="text-muted-800 dark:text-muted-100 mb-1"
          >
            Channel Settings
          </BaseHeading>
          <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
            Configure your channel's behavior and preferences.
          </BaseParagraph>
        </div>
        
        <div class="md:col-span-8">
          <BaseCard class="p-6">
            <div class="space-y-6">
              <Field v-slot="{ field, handleChange }" name="settings.autoPublish">
                <FormSwitchBall
                  :model-value="field.value"
                  color="primary"
                  label="Auto-publish content"
                  sublabel="Automatically publish content when it's ready"
                  @update:model-value="handleChange"
                />
              </Field>
              
              <Field v-slot="{ field, handleChange }" name="settings.notifications">
                <FormSwitchBall
                  :model-value="field.value"
                  color="primary"
                  label="Email notifications"
                  sublabel="Receive email notifications for important events"
                  @update:model-value="handleChange"
                />
              </Field>
              
              <Field v-slot="{ field, handleChange }" name="settings.commentApproval">
                <FormSwitchBall
                  :model-value="field.value"
                  color="primary"
                  label="Comment approval"
                  sublabel="Review comments before they appear on your videos"
                  @update:model-value="handleChange"
                />
              </Field>
            </div>
          </BaseCard>
        </div>
      </div>
      
      <!-- Save buttons -->
      <div class="flex justify-end gap-3">
        <BaseButton>
          Cancel
        </BaseButton>
        <BaseButton
          type="submit"
          color="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          <Icon name="ph:check-duotone" class="me-1 size-4" />
          Save Settings
        </BaseButton>
      </div>
    </form>
  </div>
</template>
