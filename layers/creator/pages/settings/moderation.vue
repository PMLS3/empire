<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useContentModeration } from '../../composables/useContentModeration';
import { useLegalCompliance } from '../../composables/useLegalCompliance';
import { useToaster } from '../../../shared/composables/toaster';

const { getModerationSettings, updateModerationSettings } = useContentModeration();
const { getLegalSettings, updateLegalSettings } = useLegalCompliance();
const toaster = useToaster();

const loading = ref(true);
const saving = ref(false);

// Content moderation settings
const moderationSettings = ref({
  autoModeration: {
    enabled: true,
    level: 'medium', // low, medium, high
    categories: {
      hate: true,
      harassment: true,
      sexualContent: true,
      violence: true,
      selfHarm: true,
      copyright: true,
    },
    action: 'flag', // flag, block, delete
  },
  contentReview: {
    enableReviewQueue: true,
    notifyOnFlagged: true,
    requireApproval: false,
  },
  copyrightProtection: {
    enableContentIdMatching: true,
    matchThreshold: 80, // percentage match required to flag
    allowFairUse: true,
    autoProcessClaims: false,
  },
  ageRestriction: {
    detectSensitiveContent: true,
    restrictAgeInappropriateContent: true,
    markAdultContent: true,
  },
});

// Legal compliance settings
const legalSettings = ref({
  termsAndConditions: {
    requireAcceptance: true,
    lastUpdated: '2023-10-15',
    requireReacceptanceOnUpdate: true,
  },
  privacyPolicy: {
    displayConsent: true,
    cookieSettings: {
      necessary: true,
      functional: true,
      analytics: true,
      advertising: false,
      thirdParty: false,
    },
    dataRetention: 90, // days
  },
  rightToErasure: {
    enableDataDeletion: true,
    dataRetentionAfterDeletion: 30, // days
    anonymizeDeletedUserData: true,
  },
  contentDisclaimer: {
    showDisclaimer: true,
    disclaimerText: 'This content is AI-generated and may not reflect real individuals or events. It is provided for entertainment purposes only.',
  },
});

// Violation history/logs (mock data)
const violationLogs = ref([
  {
    id: 'vio1',
    timestamp: '2023-11-07T10:15:22',
    content: 'Project: Marketing Video 3',
    category: 'copyright',
    severity: 'high',
    action: 'blocked',
    resolved: false,
  },
  {
    id: 'vio2',
    timestamp: '2023-11-05T14:33:45',
    content: 'Project: Product Demo',
    category: 'inappropriate language',
    severity: 'medium',
    action: 'flagged',
    resolved: true,
  },
  {
    id: 'vio3',
    timestamp: '2023-10-29T09:12:11',
    content: 'Project: Tutorial Series',
    category: 'copyright',
    severity: 'low',
    action: 'flagged',
    resolved: true,
  }
]);

// Load settings
onMounted(async () => {
  loading.value = true;
  
  try {
    const [moderationData, legalData] = await Promise.all([
      getModerationSettings(),
      getLegalSettings(),
    ]);
    
    // In a real app, we'd use the actual data
    // For now using our initialized values as mock data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
  } catch (error) {
    console.error('Error loading settings:', error);
    toaster.show({
      title: 'Error',
      message: 'Failed to load moderation settings',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    loading.value = false;
  }
});

// Save settings
const saveSettings = async () => {
  saving.value = true;
  
  try {
    await Promise.all([
      updateModerationSettings(moderationSettings.value),
      updateLegalSettings(legalSettings.value),
    ]);
    
    toaster.show({
      title: 'Settings Saved',
      message: 'Your moderation settings have been updated',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    toaster.show({
      title: 'Error',
      message: 'Failed to save moderation settings',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

// Get color for violation severity
const getSeverityColor = (severity) => {
  switch (severity) {
    case 'high': return 'danger';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'muted';
  }
};

// Reset settings to defaults
const resetSettings = () => {
  if (confirm('Are you sure you want to reset all moderation settings to defaults?')) {
    moderationSettings.value = {
      autoModeration: {
        enabled: true,
        level: 'medium',
        categories: {
          hate: true,
          harassment: true,
          sexualContent: true,
          violence: true,
          selfHarm: true,
          copyright: true,
        },
        action: 'flag',
      },
      contentReview: {
        enableReviewQueue: true,
        notifyOnFlagged: true,
        requireApproval: false,
      },
      copyrightProtection: {
        enableContentIdMatching: true,
        matchThreshold: 80,
        allowFairUse: true,
        autoProcessClaims: false,
      },
      ageRestriction: {
        detectSensitiveContent: true,
        restrictAgeInappropriateContent: true,
        markAdultContent: true,
      },
    };
    
    legalSettings.value = {
      termsAndConditions: {
        requireAcceptance: true,
        lastUpdated: '2023-10-15',
        requireReacceptanceOnUpdate: true,
      },
      privacyPolicy: {
        displayConsent: true,
        cookieSettings: {
          necessary: true,
          functional: true,
          analytics: true,
          advertising: false,
          thirdParty: false,
        },
        dataRetention: 90,
      },
      rightToErasure: {
        enableDataDeletion: true,
        dataRetentionAfterDeletion: 30,
        anonymizeDeletedUserData: true,
      },
      contentDisclaimer: {
        showDisclaimer: true,
        disclaimerText: 'This content is AI-generated and may not reflect real individuals or events. It is provided for entertainment purposes only.',
      },
    };
    
    toaster.show({
      title: 'Settings Reset',
      message: 'Moderation settings have been reset to defaults',
      color: 'info',
      icon: 'ph:arrows-clockwise-duotone',
    });
  }
};
</script>

<template>
  <div>
    <BasePageTitle title="Content Moderation" subtitle="Configure moderation settings and compliance options" />
    
    <BasePlaceholderPage
      v-if="loading"
      title="Loading moderation settings"
      subtitle="Please wait while we load your content moderation settings"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <div v-else class="space-y-6">
      <!-- Auto-moderation Settings -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Automatic Content Moderation</BaseHeading>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <BaseHeading size="xs" weight="medium" class="mb-1">Enable Auto-Moderation</BaseHeading>
              <BaseText size="sm" class="text-muted-500">Automatically scan and flag inappropriate content</BaseText>
            </div>
            <BaseSwitch v-model="moderationSettings.autoModeration.enabled" />
          </div>
          
          <div v-if="moderationSettings.autoModeration.enabled">
            <label class="nui-label pb-1 text-[0.825rem]">Moderation Strictness</label>
            <div class="grid grid-cols-3 gap-2 mt-1">
              <button
                type="button"
                class="px-3 py-2 border rounded-lg flex flex-col items-center gap-1 transition"
                :class="moderationSettings.autoModeration.level === 'low' ? 
                  'bg-primary-50 dark:bg-primary-500/10 border-primary-500' : 
                  'border-muted-300 dark:border-muted-700 hover:border-muted-400 dark:hover:border-muted-600'"
                @click="moderationSettings.autoModeration.level = 'low'"
              >
                <Icon name="ph:shield-duotone" class="size-5 text-success-500" />
                <span>Low</span>
                <span class="text-xs text-muted-500">Basic filtering</span>
              </button>
              
              <button
                type="button"
                class="px-3 py-2 border rounded-lg flex flex-col items-center gap-1 transition"
                :class="moderationSettings.autoModeration.level === 'medium' ? 
                  'bg-primary-50 dark:bg-primary-500/10 border-primary-500' : 
                  'border-muted-300 dark:border-muted-700 hover:border-muted-400 dark:hover:border-muted-600'"
                @click="moderationSettings.autoModeration.level = 'medium'"
              >
                <Icon name="ph:shield-check-duotone" class="size-5 text-warning-500" />
                <span>Medium</span>
                <span class="text-xs text-muted-500">Balanced protection</span>
              </button>
              
              <button
                type="button"
                class="px-3 py-2 border rounded-lg flex flex-col items-center gap-1 transition"
                :class="moderationSettings.autoModeration.level === 'high' ? 
                  'bg-primary-50 dark:bg-primary-500/10 border-primary-500' : 
                  'border-muted-300 dark:border-muted-700 hover:border-muted-400 dark:hover:border-muted-600'"
                @click="moderationSettings.autoModeration.level = 'high'"
              >
                <Icon name="ph:shield-checkered-duotone" class="size-5 text-danger-500" />
                <span>High</span>
                <span class="text-xs text-muted-500">Strict filtering</span>
              </button>
            </div>
          </div>
          
          <div v-if="moderationSettings.autoModeration.enabled">
            <BaseHeading size="xs" weight="medium" class="mb-2">Content Categories to Moderate</BaseHeading>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <BaseCheckbox
                v-model="moderationSettings.autoModeration.categories.hate"
                label="Hate speech"
                name="hate"
              />
              
              <BaseCheckbox
                v-model="moderationSettings.autoModeration.categories.harassment"
                label="Harassment and bullying"
                name="harassment"
              />
              
              <BaseCheckbox
                v-model="moderationSettings.autoModeration.categories.sexualContent"
                label="Sexually explicit content"
                name="sexualContent"
              />
              
              <BaseCheckbox
                v-model="moderationSettings.autoModeration.categories.violence"
                label="Graphic violence"
                name="violence"
              />
              
              <BaseCheckbox
                v-model="moderationSettings.autoModeration.categories.selfHarm"
                label="Self-harm and suicide"
                name="selfHarm"
              />
              
              <BaseCheckbox
                v-model="moderationSettings.autoModeration.categories.copyright"
                label="Copyright infringement"
                name="copyright"
              />
            </div>
          </div>
          
          <div v-if="moderationSettings.autoModeration.enabled">
            <BaseHeading size="xs" weight="medium" class="mb-2">Default Action for Violations</BaseHeading>
            
            <div class="grid grid-cols-3 gap-2">
              <BaseCheckbox
                v-model="moderationSettings.autoModeration.action"
                value="flag"
                label="Flag for Review"
                name="action"
                type="radio"
              />
              
              <BaseCheckbox
                v-model="moderationSettings.autoModeration.action"
                value="block"
                label="Block Publishing"
                name="action"
                type="radio"
              />
              
              <BaseCheckbox
                v-model="moderationSettings.autoModeration.action"
                value="delete"
                label="Auto-Delete"
                name="action"
                type="radio"
              />
            </div>
          </div>
          
          <BaseMessage v-if="!moderationSettings.autoModeration.enabled" type="warning">
            Turning off auto-moderation may allow inappropriate or illegal content to be published through your platform, potentially leading to legal issues or policy violations.
          </BaseMessage>
        </div>
      </BaseCard>
      
      <!-- Copyright Protection -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Copyright Protection</BaseHeading>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <BaseHeading size="xs" weight="medium" class="mb-1">Content ID Matching</BaseHeading>
              <BaseText size="sm" class="text-muted-500">
                Automatically check uploads against copyright databases
              </BaseText>
            </div>
            <BaseSwitch v-model="moderationSettings.copyrightProtection.enableContentIdMatching" />
          </div>
          
          <div v-if="moderationSettings.copyrightProtection.enableContentIdMatching">
            <div class="flex items-center justify-between mb-1">
              <label class="nui-label pb-0 text-[0.825rem]">Match Threshold</label>
              <span class="text-xs text-muted-500">{{ moderationSettings.copyrightProtection.matchThreshold }}%</span>
            </div>
            <input 
              type="range" 
              v-model.number="moderationSettings.copyrightProtection.matchThreshold" 
              min="50" 
              max="95" 
              step="5"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-muted-500 mt-1">
              <span>Less sensitive</span>
              <span>More sensitive</span>
            </div>
          </div>
          
          <div class="space-y-2">
            <BaseCheckbox
              v-model="moderationSettings.copyrightProtection.allowFairUse"
              label="Allow content with potential fair use exemptions"
              name="allowFairUse"
            />
            
            <BaseCheckbox
              v-model="moderationSettings.copyrightProtection.autoProcessClaims"
              label="Automatically process copyright claims"
              name="autoProcessClaims"
            />
          </div>
        </div>
      </BaseCard>
      
      <!-- Content Review Settings -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Content Review</BaseHeading>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <BaseCheckbox
              v-model="moderationSettings.contentReview.enableReviewQueue"
              label="Enable content review queue for flagged content"
              name="enableReviewQueue"
            />
            
            <BaseCheckbox
              v-model="moderationSettings.contentReview.notifyOnFlagged"
              label="Notify administrators when content is flagged"
              name="notifyOnFlagged"
            />
            
            <BaseCheckbox
              v-model="moderationSettings.contentReview.requireApproval"
              label="Require approval for all content before publishing"
              name="requireApproval"
            />
          </div>
        </div>
      </BaseCard>
      
      <!-- Age Restrictions -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Age Restrictions</BaseHeading>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <BaseCheckbox
              v-model="moderationSettings.ageRestriction.detectSensitiveContent"
              label="Automatically detect age-sensitive content"
              name="detectSensitiveContent"
            />
            
            <BaseCheckbox
              v-model="moderationSettings.ageRestriction.restrictAgeInappropriateContent"
              label="Apply age restrictions to potentially sensitive content"
              name="restrictAgeInappropriateContent"
            />
            
            <BaseCheckbox
              v-model="moderationSettings.ageRestriction.markAdultContent"
              label="Mark adult content with explicit warnings"
              name="markAdultContent"
            />
          </div>
        </div>
      </BaseCard>
      
      <!-- Legal Compliance Settings -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Legal Compliance</BaseHeading>
        
        <div class="space-y-6">
          <!-- Terms and Conditions -->
          <div>
            <BaseHeading size="xs" weight="medium" class="mb-2">Terms and Conditions</BaseHeading>
            <div class="space-y-2">
              <BaseCheckbox
                v-model="legalSettings.termsAndConditions.requireAcceptance"
                label="Require users to accept terms and conditions"
                name="requireAcceptance"
              />
              
              <BaseCheckbox
                v-model="legalSettings.termsAndConditions.requireReacceptanceOnUpdate"
                label="Require re-acceptance when terms are updated"
                name="requireReacceptanceOnUpdate"
              />
            </div>
            
            <div class="mt-2 text-xs text-muted-500">
              <span>Last updated: </span>
              <span>{{ formatDate(legalSettings.termsAndConditions.lastUpdated) }}</span>
            </div>
          </div>
          
          <!-- Privacy Policy -->
          <div>
            <BaseHeading size="xs" weight="medium" class="mb-2">Privacy Settings</BaseHeading>
            <div class="space-y-2">
              <BaseCheckbox
                v-model="legalSettings.privacyPolicy.displayConsent"
                label="Display cookie consent banner to users"
                name="displayConsent"
              />
              
              <div class="ps-6 mt-2 space-y-2">
                <BaseCheckbox
                  v-model="legalSettings.privacyPolicy.cookieSettings.necessary"
                  label="Necessary cookies (required)"
                  name="necessaryCookies"
                  disabled
                />
                
                <BaseCheckbox
                  v-model="legalSettings.privacyPolicy.cookieSettings.functional"
                  label="Functional cookies"
                  name="functionalCookies"
                />
                
                <BaseCheckbox
                  v-model="legalSettings.privacyPolicy.cookieSettings.analytics"
                  label="Analytics cookies"
                  name="analyticsCookies"
                />
                
                <BaseCheckbox
                  v-model="legalSettings.privacyPolicy.cookieSettings.advertising"
                  label="Advertising cookies"
                  name="advertisingCookies"
                />
                
                <BaseCheckbox
                  v-model="legalSettings.privacyPolicy.cookieSettings.thirdParty"
                  label="Third-party cookies"
                  name="thirdPartyCookies"
                />
              </div>
            </div>
            
            <div class="mt-4">
              <BaseInput
                v-model.number="legalSettings.privacyPolicy.dataRetention"
                label="Data Retention Period (days)"
                type="number"
                min="30"
                max="1095"
              />
            </div>
          </div>
          
          <!-- Right to Erasure -->
          <div>
            <BaseHeading size="xs" weight="medium" class="mb-2">Right to Erasure (GDPR)</BaseHeading>
            <div class="space-y-2">
              <BaseCheckbox
                v-model="legalSettings.rightToErasure.enableDataDeletion"
                label="Allow users to request account deletion"
                name="enableDataDeletion"
              />
              
              <BaseCheckbox
                v-model="legalSettings.rightToErasure.anonymizeDeletedUserData"
                label="Anonymize user data after deletion instead of complete removal"
                name="anonymizeDeletedUserData"
              />
            </div>
            
            <div class="mt-4">
              <BaseInput
                v-model.number="legalSettings.rightToErasure.dataRetentionAfterDeletion"
                label="Data Retention After Deletion Request (days)"
                type="number"
                min="0"
                max="90"
              />
            </div>
          </div>
          
          <!-- Content Disclaimer -->
          <div>
            <BaseHeading size="xs" weight="medium" class="mb-2">Content Disclaimer</BaseHeading>
            <div class="space-y-2">
              <BaseCheckbox
                v-model="legalSettings.contentDisclaimer.showDisclaimer"
                label="Show AI-generated content disclaimer"
                name="showDisclaimer"
              />
              
              <div v-if="legalSettings.contentDisclaimer.showDisclaimer" class="mt-2">
                <BaseTextarea
                  v-model="legalSettings.contentDisclaimer.disclaimerText"
                  label="Disclaimer Text"
                  :rows="3"
                />
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
      
      <!-- Violation History -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Recent Violations</BaseHeading>
        
        <div class="overflow-x-auto">
          <table v-if="violationLogs.length > 0" class="w-full">
            <thead>
              <tr class="border-b border-muted-200 dark:border-muted-700">
                <th class="text-left py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Content</th>
                <th class="text-left py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Category</th>
                <th class="text-left py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Severity</th>
                <th class="text-left py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Action</th>
                <th class="text-left py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Date</th>
                <th class="text-left py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="violation in violationLogs" :key="violation.id" class="border-b border-muted-200 dark:border-muted-700">
                <td class="py-3 px-4 text-muted-800 dark:text-muted-100">{{ violation.content }}</td>
                <td class="py-3 px-4 text-muted-500">{{ violation.category }}</td>
                <td class="py-3 px-4">
                  <BaseTag :color="getSeverityColor(violation.severity)" size="sm" :label="violation.severity" />
                </td>
                <td class="py-3 px-4 text-muted-500">{{ violation.action }}</td>
                <td class="py-3 px-4 text-muted-500">{{ formatDate(violation.timestamp) }}</td>
                <td class="py-3 px-4">
                  <BaseTag 
                    :color="violation.resolved ? 'success' : 'warning'" 
                    size="sm" 
                    :label="violation.resolved ? 'Resolved' : 'Pending'" 
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="text-center py-6 text-muted-500">
            No violations have been recorded
          </div>
        </div>
      </BaseCard>
      
      <!-- Action Buttons -->
      <div class="flex justify-between">
        <BaseButton color="danger" @click="resetSettings">
          <Icon name="ph:arrows-clockwise-duotone" class="me-2" />
          Reset to Defaults
        </BaseButton>
        
        <BaseButton color="primary" :loading="saving" @click="saveSettings">
          <Icon name="ph:check-circle-duotone" class="me-2" />
          Save Settings
        </BaseButton>
      </div>
    </div>
  </div>
</template>
