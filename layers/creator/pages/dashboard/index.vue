<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCreatorData } from '../../composables/useCreatorData';

const { getDataList } = useCreatorData();

const recentProjects = ref([]);
const popularVideos = ref([]);
const uploadStats = ref({ total: 0, thisMonth: 0, thisWeek: 0 });
const loading = ref(true);

onMounted(async () => {
  try {
    // Fetch recent projects
    const projects = await getDataList('projects', {
      orderBy: 'updated_at',
      orderDirection: 'desc',
      limit: 5
    });
    recentProjects.value = projects;
    
    // Fetch popular videos (most viewed)
    const videos = await getDataList('videos', {
      orderBy: 'views',
      orderDirection: 'desc',
      limit: 5
    });
    popularVideos.value = videos;
    
    // Fetch upload statistics
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    
    const [totalUploads, monthlyUploads, weeklyUploads] = await Promise.all([
      getDataList('uploads', {}),
      getDataList('uploads', { 
        filters: { created_at: { $gte: thisMonth.toISOString() } }
      }),
      getDataList('uploads', { 
        filters: { created_at: { $gte: thisWeek.toISOString() } }
      }),
    ]);
    
    uploadStats.value = {
      total: totalUploads.length,
      thisMonth: monthlyUploads.length,
      thisWeek: weeklyUploads.length
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <BasePageTitle title="Video Dashboard" subtitle="Overview of your video projects and analytics" />
    
    <BasePlaceholderPage
      v-if="loading"
      title="Loading dashboard"
      subtitle="Please wait while we load your dashboard data"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <BaseCard class="p-4">
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-8 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <Icon name="ph:film-slate-duotone" class="size-4 text-primary-500" />
              </div>
              <BaseText size="xs" class="text-muted-500">Total Projects</BaseText>
            </div>
            <BaseHeading size="xl" weight="medium" class="mb-1">{{ recentProjects.length || 0 }}</BaseHeading>
            <BaseText size="xs" class="text-success-500">
              <Icon name="ph:trend-up-duotone" class="size-3 me-1 inline" />
              Active projects
            </BaseText>
          </div>
        </BaseCard>
        
        <BaseCard class="p-4">
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-8 rounded-full bg-success-100 dark:bg-success-500/20 flex items-center justify-center">
                <Icon name="ph:upload-simple-duotone" class="size-4 text-success-500" />
              </div>
              <BaseText size="xs" class="text-muted-500">Uploads This Week</BaseText>
            </div>
            <BaseHeading size="xl" weight="medium" class="mb-1">{{ uploadStats.thisWeek }}</BaseHeading>
            <BaseText size="xs" class="text-success-500">
              <Icon name="ph:trend-up-duotone" class="size-3 me-1 inline" />
              {{ uploadStats.thisMonth }} this month
            </BaseText>
          </div>
        </BaseCard>
        
        <BaseCard class="p-4">
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-8 rounded-full bg-info-100 dark:bg-info-500/20 flex items-center justify-center">
                <Icon name="ph:eye-duotone" class="size-4 text-info-500" />
              </div>
              <BaseText size="xs" class="text-muted-500">Total Views</BaseText>
            </div>
            <BaseHeading size="xl" weight="medium" class="mb-1">{{ popularVideos.reduce((sum, video) => sum + (video.views || 0), 0).toLocaleString() }}</BaseHeading>
            <BaseText size="xs" class="text-success-500">
              <Icon name="ph:trend-up-duotone" class="size-3 me-1 inline" />
              Across all videos
            </BaseText>
          </div>
        </BaseCard>
      </div>
      
      <!-- Main Content -->
      <div class="grid grid-cols-12 gap-6">
        <!-- Recent Projects -->
        <BaseCard class="p-6 col-span-12 lg:col-span-8">
          <div class="flex justify-between items-center mb-4">
            <BaseHeading as="h3" size="sm" weight="medium">Recent Projects</BaseHeading>
            <NuxtLink to="/creator/projects" class="text-primary-500 hover:text-primary-600 text-sm flex items-center gap-1">
              View All
              <Icon name="ph:arrow-right" class="size-3" />
            </NuxtLink>
          </div>
          
          <div class="overflow-x-auto">
            <table v-if="recentProjects.length > 0" class="w-full">
              <thead class="border-b border-muted-200 dark:border-muted-700">
                <tr>
                  <th class="text-left py-2 px-2 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Project</th>
                  <th class="text-left py-2 px-2 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Status</th>
                  <th class="text-left py-2 px-2 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="project in recentProjects" :key="project.id" class="border-b border-muted-200 dark:border-muted-700 hover:bg-muted-50 dark:hover:bg-muted-800/40">
                  <td class="py-2 px-2">
                    <NuxtLink :to="`/creator/projects/${project.id}`" class="flex items-center gap-3">
                      <div class="size-10 rounded overflow-hidden bg-muted-200 dark:bg-muted-700">
                        <img v-if="project.thumbnail" :src="project.thumbnail" class="w-full h-full object-cover" alt="" />
                        <div v-else class="flex items-center justify-center h-full text-muted-500">
                          <Icon name="ph:image-duotone" class="size-6" />
                        </div>
                      </div>
                      <div>
                        <div class="font-medium text-muted-800 dark:text-muted-100">{{ project.title }}</div>
                        <div class="text-xs text-muted-400">{{ project.duration ? `${Math.floor(project.duration / 60)}:${(project.duration % 60).toString().padStart(2, '0')}` : 'N/A' }}</div>
                      </div>
                    </NuxtLink>
                  </td>
                  <td class="py-2 px-2">
                    <BaseTag
                      :color="project.status === 'completed' ? 'success' : project.status === 'in_progress' ? 'info' : 'warning'"
                      size="sm"
                      :label="project.status === 'completed' ? 'Completed' : project.status === 'in_progress' ? 'In Progress' : 'Draft'"
                    />
                  </td>
                  <td class="py-2 px-2 text-sm text-muted-500">
                    {{ project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A' }}
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-else class="py-8 text-center">
              <div class="mb-3">
                <Icon name="ph:folder-simple-dotted-duotone" class="size-12 mx-auto text-muted-400" />
              </div>
              <BaseText>No projects yet</BaseText>
              <div class="mt-3">
                <NuxtLink to="/creator/projects/new" class="text-primary-500 hover:text-primary-600 text-sm flex items-center gap-1 justify-center">
                  <Icon name="ph:plus-circle-duotone" class="size-4" />
                  Create New Project
                </NuxtLink>
              </div>
            </div>
          </div>
        </BaseCard>
        
        <!-- Popular Videos -->
        <BaseCard class="p-6 col-span-12 lg:col-span-4">
          <div class="flex justify-between items-center mb-4">
            <BaseHeading as="h3" size="sm" weight="medium">Popular Videos</BaseHeading>
            <NuxtLink to="/creator/analytics" class="text-primary-500 hover:text-primary-600 text-sm flex items-center gap-1">
              Analytics
              <Icon name="ph:arrow-right" class="size-3" />
            </NuxtLink>
          </div>
          
          <div v-if="popularVideos.length > 0" class="space-y-4">
            <div v-for="video in popularVideos" :key="video.id" class="flex gap-3">
              <div class="size-12 rounded overflow-hidden bg-muted-200 dark:bg-muted-700 flex-shrink-0">
                <img v-if="video.thumbnail" :src="video.thumbnail" class="w-full h-full object-cover" alt="" />
                <div v-else class="flex items-center justify-center h-full text-muted-500">
                  <Icon name="ph:image-duotone" class="size-6" />
                </div>
              </div>
              <div class="flex-grow min-w-0">
                <div class="font-medium text-sm text-muted-800 dark:text-muted-100 truncate">{{ video.title }}</div>
                <div class="text-xs text-muted-400 flex items-center gap-2">
                  <span>{{ video.views?.toLocaleString() || 0 }} views</span>
                  <span class="size-1 rounded-full bg-muted-300 dark:bg-muted-700"></span>
                  <span>{{ video.likes?.toLocaleString() || 0 }} likes</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="py-8 text-center">
            <div class="mb-3">
              <Icon name="ph:video-duotone" class="size-12 mx-auto text-muted-400" />
            </div>
            <BaseText>No videos published yet</BaseText>
            <div class="mt-3">
              <NuxtLink to="/creator/projects" class="text-primary-500 hover:text-primary-600 text-sm flex items-center gap-1 justify-center">
                <Icon name="ph:export-duotone" class="size-4" />
                Publish a Video
              </NuxtLink>
            </div>
          </div>
        </BaseCard>
      </div>
    </template>
  </div>
</template>
