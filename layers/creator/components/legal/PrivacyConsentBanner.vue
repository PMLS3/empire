<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLegalCompliance } from '../../composables/useLegalCompliance';
import { useAuth } from '../../../auth/composables/auth';

const { hasUserConsent, recordConsent } = useLegalCompliance();
const { user } = useAuth();

const consented = ref(false);
const loading = ref(true);
const showBanner = ref(false);

// Check if user has already given consent
onMounted(async () => {
  if (user.value) {
    loading.value = true;
    try {
      // Check both gdpr and privacy consent
      const [gdprConsent, privacyConsent] = await Promise.all([
        hasUserConsent('gdpr'),
        hasUserConsent('privacy')
      ]);
      
      consented.value = gdprConsent && privacyConsent;
      showBanner.value = !consented.value;
    } catch (err) {
      console.error('Error checking consent:', err);
      // Default to showing the banner if there's an error
      showBanner.value = true;
    } finally {
      loading.value = false;
    }
  }
});

// Record user's consent
const acceptConsent = async () => {
  if (!user.value) return;
  
  loading.value = true;
  
  try {
    // Record both gdpr and privacy consent
    await Promise.all([
      recordConsent('gdpr', true, {
        source: 'privacy_banner',
        version: '1.0',
      }),
      recordConsent('privacy', true, {
        source: 'privacy_banner',
        version: '1.0',
      })
    ]);
    
    consented.value = true;
    showBanner.value = false;
  } catch (err) {
    console.error('Error recording consent:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="showBanner && !loading" class="fixed bottom-0 left-0 right-0 bg-muted-800 text-white p-4 z-50">
    <div class="container mx-auto">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex-grow">
          <BaseText class="mb-2">
            We use cookies and similar technologies to enhance your experience and analyze site usage.
            By continuing to use our service, you agree to our
            <NuxtLink to="/privacy-policy" class="text-primary-400 hover:underline">Privacy Policy</NuxtLink>
            and
            <NuxtLink to="/terms" class="text-primary-400 hover:underline">Terms of Service</NuxtLink>.
          </BaseText>
        </div>
        <div class="flex gap-3">
          <BaseButton color="default" variant="outline" as="a" href="/privacy-policy">
            Learn More
          </BaseButton>
          <BaseButton color="primary" :loading="loading" @click="acceptConsent">
            Accept All
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
