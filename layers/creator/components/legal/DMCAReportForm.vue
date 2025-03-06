<script setup lang="ts">
import { ref } from 'vue';
import { useLegalCompliance } from '../../composables/useLegalCompliance';
import { useToaster } from '../../../shared/composables/toaster';

const props = defineProps<{
  contentId: string;
  contentType: string;
}>();

const emit = defineEmits(['submitted', 'cancelled']);

const { submitDMCATakedown } = useLegalCompliance();
const toaster = useToaster();

const submitting = ref(false);
const formData = ref({
  originalWorkDescription: '',
  copyrightProof: '',
  requestedAction: 'remove' as 'remove' | 'attribute',
  declaration: false,
});

const validationErrors = ref<Record<string, string>>({});

// Form validation
const validate = () => {
  const errors: Record<string, string> = {};
  
  if (!formData.value.originalWorkDescription.trim()) {
    errors.originalWorkDescription = 'Please describe the original work';
  }
  
  if (!formData.value.copyrightProof.trim()) {
    errors.copyrightProof = 'Please provide proof of copyright ownership';
  }
  
  if (!formData.value.declaration) {
    errors.declaration = 'You must declare that the information is accurate';
  }
  
  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// Submit takedown request
const submitReport = async () => {
  if (!validate()) {
    toaster.show({
      title: 'Validation Error',
      message: 'Please fill out all required fields',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  submitting.value = true;
  
  try {
    const result = await submitDMCATakedown({
      contentId: props.contentId,
      contentType: props.contentType,
      originalWorkDescription: formData.value.originalWorkDescription,
      copyrightProof: formData.value.copyrightProof,
      requestedAction: formData.value.requestedAction,
    });
    
    if (result.success) {
      toaster.show({
        title: 'Report Submitted',
        message: 'Your DMCA takedown request has been submitted',
        color: 'success',
        icon: 'ph:check-circle-duotone',
      });
      
      emit('submitted', { caseId: result.caseId });
    } else {
      throw new Error('Failed to submit DMCA request');
    }
  } catch (err) {
    console.error('DMCA submission error:', err);
    toaster.show({
      title: 'Submission Error',
      message: 'Failed to submit DMCA takedown request',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    submitting.value = false;
  }
};

// Cancel the report
const cancelReport = () => {
  emit('cancelled');
};
</script>

<template>
  <div class="p-4">
    <BaseHeading as="h3" size="md" weight="medium" class="mb-4">
      DMCA Takedown Request
    </BaseHeading>
    
    <BaseText class="mb-4">
      Use this form to report content that infringes on your copyright. All takedown requests must comply with the Digital Millennium Copyright Act (DMCA).
    </BaseText>
    
    <form @submit.prevent="submitReport" class="space-y-4">
      <!-- Original Work Description -->
      <div>
        <label class="nui-label pb-2 text-[0.825rem]">
          Description of Original Work
          <span class="text-danger-500">*</span>
        </label>
        <BaseTextarea
          v-model="formData.originalWorkDescription"
          placeholder="Describe the copyrighted work that has been infringed"
          rows="4"
          :class="{ 'border-danger-500': validationErrors.originalWorkDescription }"
        />
        <BaseText v-if="validationErrors.originalWorkDescription" size="xs" class="text-danger-500 mt-1">
          {{ validationErrors.originalWorkDescription }}
        </BaseText>
      </div>
      
      <!-- Copyright Proof -->
      <div>
        <label class="nui-label pb-2 text-[0.825rem]">
          Proof of Copyright
          <span class="text-danger-500">*</span>
        </label>
        <BaseTextarea
          v-model="formData.copyrightProof"
          placeholder="Provide evidence that you own the copyright or are authorized to act on behalf of the owner"
          rows="4"
          :class="{ 'border-danger-500': validationErrors.copyrightProof }"
        />
        <BaseText v-if="validationErrors.copyrightProof" size="xs" class="text-danger-500 mt-1">
          {{ validationErrors.copyrightProof }}
        </BaseText>
      </div>
      
      <!-- Requested Action -->
      <div>
        <label class="nui-label pb-2 text-[0.825rem]">
          Requested Action
        </label>
        <div class="space-y-2">
          <BaseRadio
            v-model="formData.requestedAction"
            name="requestedAction"
            value="remove"
            label="Remove the infringing content"
          />
          <BaseRadio
            v-model="formData.requestedAction"
            name="requestedAction"
            value="attribute"
            label="Attribute the content to me as the original creator"
          />
        </div>
      </div>
      
      <!-- Declaration -->
      <div class="pt-2">
        <BaseCheckbox
          v-model="formData.declaration"
          name="declaration"
          :class="{ 'text-danger-500': validationErrors.declaration }"
        >
          <span>
            I declare under penalty of perjury that the information in this notification is accurate, and I am the copyright owner or authorized to act on behalf of the owner.
            <span class="text-danger-500">*</span>
          </span>
        </BaseCheckbox>
        <BaseText v-if="validationErrors.declaration" size="xs" class="text-danger-500 mt-1">
          {{ validationErrors.declaration }}
        </BaseText>
      </div>
      
      <!-- Actions -->
      <div class="pt-4 flex justify-end gap-3">
        <BaseButton type="button" color="default" @click="cancelReport">
          Cancel
        </BaseButton>
        <BaseButton type="submit" color="primary" :loading="submitting" :disabled="submitting">
          Submit Takedown Request
        </BaseButton>
      </div>
    </form>
  </div>
</template>
