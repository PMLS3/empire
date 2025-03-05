<script setup lang="ts">
import { useResearch } from '../../../composables/useResearch';

definePageMeta({
  title: 'Research Projects',
});
useHead({
  title: 'Research Projects',
});

// Get research projects using composable
const { 
  researchProjects, 
  loading, 
  error, 
  filters, 
  fetchResearchProjects 
} = useResearch();

// Search functionality
const searchQuery = ref('');
const viewMode = ref('grid'); // grid or list

const filteredProjects = computed(() => {
  if (!searchQuery.value) return researchProjects.value;
  
  const query = searchQuery.value.toLowerCase();
  return researchProjects.value.filter(project => 
    project.main_category.toLowerCase().includes(query) || 
    project.sub_category.toLowerCase().includes(query) ||
    (project.sub_category_description && project.sub_category_description.toLowerCase().includes(query))
  );
});

// Category options
const categoryOptions = [
  { value: null, label: 'All Categories' },
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'self-help', label: 'Self-Help' },
  { value: 'business', label: 'Business' },
  { value: 'technical', label: 'Technical' },
];

// Status options
const statusOptions = [
  { value: null, label: 'All Status' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

// Scope options
const scopeOptions = [
  { value: 'all', label: 'All Projects' },
  { value: 'owned', label: 'My Projects' },
  { value: 'shared', label: 'Shared With Me' },
];
</script>

<template>
 <ProjectDetails />
</template>
