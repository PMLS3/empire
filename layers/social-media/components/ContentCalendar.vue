<template>
  <div class="content-calendar">
    <div class="calendar-header">
      <div class="calendar-nav">
        <button @click="previousMonth">
          <i class="ph-caret-left"></i>
        </button>
        <h2>{{ currentMonthYear }}</h2>
        <button @click="nextMonth">
          <i class="ph-caret-right"></i>
        </button>
      </div>
      <div class="view-options">
        <button 
          v-for="view in viewOptions" 
          :key="view"
          :class="['view-btn', { active: currentView === view }]"
          @click="currentView = view"
        >
          {{ view }}
        </button>
      </div>
    </div>

    <div class="calendar-body" :class="currentView.toLowerCase()">
      <!-- Month View -->
      <template v-if="currentView === 'Month'">
        <div class="weekdays">
          <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
        </div>
        <div class="days">
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            :class="['day', { 
              'other-month': day.otherMonth,
              'today': isToday(day.date)
            }]"
            @dragover.prevent
            @drop="handleDrop($event, day.date)"
          >
            <div class="day-header">
              <span class="day-number">{{ day.dayNumber }}</span>
              <button 
                v-if="!day.otherMonth"
                class="add-post"
                @click="createPost(day.date)"
              >
                +
              </button>
            </div>
            <div class="day-content">
              <div 
                v-for="post in getPostsForDay(day.date)"
                :key="post.id"
                class="post-item"
                draggable="true"
                @dragstart="handleDragStart($event, post)"
                @click="editPost(post)"
              >
                <div 
                  class="platform-indicator"
                  :class="post.platforms[0].toLowerCase()"
                ></div>
                <span class="post-time">{{ formatTime(post.scheduledTime) }}</span>
                <span class="post-title">{{ truncate(post.text, 30) }}</span>
                <span v-if="post.recurrence" class="recurrence-indicator">
                  <i class="ph-repeat"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Week View -->
      <template v-else-if="currentView === 'Week'">
        <div class="week-timeline">
          <div class="time-slots">
            <div 
              v-for="hour in 24" 
              :key="hour-1"
              class="time-slot"
            >
              {{ formatHour(hour-1) }}
            </div>
          </div>
          <div class="week-days">
            <div 
              v-for="day in currentWeekDays" 
              :key="day.date"
              class="week-day"
              :class="{ today: isToday(day.date) }"
            >
              <div class="week-day-header">
                <div class="day-name">{{ formatWeekDay(day.date) }}</div>
                <div class="day-date">{{ formatDate(day.date) }}</div>
              </div>
              <div 
                class="day-timeline"
                @dragover.prevent
                @drop="handleDrop($event, day.date)"
              >
                <div 
                  v-for="post in getPostsForDay(day.date)"
                  :key="post.id"
                  class="week-post-item"
                  :style="getPostPosition(post)"
                  draggable="true"
                  @dragstart="handleDragStart($event, post)"
                  @click="editPost(post)"
                >
                  <div class="post-content">
                    <div 
                      class="platform-indicator"
                      :class="post.platforms[0].toLowerCase()"
                    ></div>
                    <span class="post-time">{{ formatTime(post.scheduledTime) }}</span>
                    <span class="post-title">{{ truncate(post.text, 20) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Advanced Scheduling Dialog -->
    <div v-if="showSchedulingDialog" class="scheduling-dialog-overlay">
      <div class="scheduling-dialog">
        <div class="dialog-header">
          <h3>Advanced Scheduling</h3>
          <button class="close-btn" @click="closeSchedulingDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>Date & Time</label>
            <div class="datetime-inputs">
              <input 
                type="date" 
                v-model="schedulingOptions.date" 
                class="date-input"
              />
              <input 
                type="time" 
                v-model="schedulingOptions.time" 
                class="time-input"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label>Timezone</label>
            <select v-model="schedulingOptions.timezone" class="timezone-select">
              <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                {{ tz.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="schedulingOptions.enableRecurrence" />
              Enable Recurrence
            </label>
          </div>
          
          <div v-if="schedulingOptions.enableRecurrence" class="recurrence-options">
            <div class="form-group">
              <label>Repeat</label>
              <select v-model="schedulingOptions.recurrence.frequency" class="frequency-select">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div v-if="schedulingOptions.recurrence.frequency === 'weekly'" class="form-group">
              <label>On Days</label>
              <div class="weekday-selector">
                <label v-for="(day, index) in weekDaysFull" :key="day" class="day-checkbox">
                  <input 
                    type="checkbox" 
                    v-model="schedulingOptions.recurrence.weekdays" 
                    :value="index" 
                  />
                  {{ day.substring(0, 3) }}
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label>End After</label>
              <div class="end-options">
                <input 
                  type="number" 
                  v-model="schedulingOptions.recurrence.occurrences" 
                  min="1" 
                  max="52"
                  class="occurrences-input"
                />
                <span>occurrences</span>
              </div>
            </div>
            
            <div class="form-group">
              <label>Or End On</label>
              <input 
                type="date" 
                v-model="schedulingOptions.recurrence.endDate" 
                class="date-input"
              />
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="closeSchedulingDialog">Cancel</button>
          <button class="save-btn" @click="saveScheduling">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSocialContent } from '../composables/useSocialContent'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday as _isToday, parseISO, addMinutes, parse } from 'date-fns'

const { contentList, fetchContentList, updateContent } = useSocialContent()

// State
const currentDate = ref(new Date())
const currentView = ref('Month')
const draggingPost = ref(null)
const showSchedulingDialog = ref(false)
const currentPost = ref(null)
const schedulingOptions = ref({
  date: '',
  time: '',
  timezone: 'UTC',
  enableRecurrence: false,
  recurrence: {
    frequency: 'weekly',
    weekdays: [],
    occurrences: 4,
    endDate: ''
  }
})

// Constants
const viewOptions = ['Month', 'Week']
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const weekDaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' }
]

// Navigation
const nextMonth = () => {
  currentDate.value = addMonths(currentDate.value, 1)
}

const previousMonth = () => {
  currentDate.value = subMonths(currentDate.value, 1)
}

// Computed
const currentMonthYear = computed(() => {
  return format(currentDate.value, 'MMMM yyyy')
})

const calendarDays = computed(() => {
  const start = startOfWeek(startOfMonth(currentDate.value))
  const end = endOfWeek(endOfMonth(currentDate.value))
  
  return eachDayOfInterval({ start, end }).map(date => ({
    date,
    dayNumber: format(date, 'd'),
    otherMonth: format(date, 'M') !== format(currentDate.value, 'M')
  }))
})

const currentWeekDays = computed(() => {
  const start = startOfWeek(currentDate.value)
  const end = endOfWeek(currentDate.value)
  
  return eachDayOfInterval({ start, end }).map(date => ({
    date,
    dayNumber: format(date, 'd')
  }))
})

// Methods
const isToday = (date: Date) => {
  return _isToday(date)
}

const formatTime = (time: string) => {
  return format(parseISO(time), 'h:mm a')
}

const formatWeekDay = (date: Date) => {
  return format(date, 'EEE')
}

const formatDate = (date: Date) => {
  return format(date, 'MMM d')
}

const formatHour = (hour: number) => {
  return format(new Date().setHours(hour, 0), 'h a')
}

const truncate = (text: string, length: number) => {
  return text.length > length ? text.slice(0, length) + '...' : text
}

const getPostsForDay = (date: Date) => {
  return contentList.value.filter(post => {
    const postDate = parseISO(post.scheduledTime)
    return format(postDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  })
}

const getPostPosition = (post: any) => {
  const time = parseISO(post.scheduledTime)
  const hours = time.getHours()
  const minutes = time.getMinutes()
  const top = (hours * 60 + minutes) * (100 / 1440) // Convert to percentage of day
  
  return {
    top: `${top}%`,
    height: '60px' // Fixed height for now
  }
}

const handleDragStart = (event: DragEvent, post: any) => {
  draggingPost.value = post
  event.dataTransfer?.setData('text/plain', '') // Required for Firefox
}

const handleDrop = async (event: DragEvent, date: Date) => {
  if (!draggingPost.value) return

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const y = event.clientY - rect.top
  const totalMinutes = (y / rect.height) * 1440 // Convert to minutes
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)

  const newDate = new Date(date)
  newDate.setHours(hours, minutes)

  await updateContent(draggingPost.value.id, {
    scheduledTime: newDate.toISOString()
  })

  await fetchContentList()
  draggingPost.value = null
}

const openSchedulingDialog = (post = null, date = null) => {
  currentPost.value = post
  
  if (date) {
    schedulingOptions.value.date = format(date, 'yyyy-MM-dd')
    schedulingOptions.value.time = format(new Date().setHours(9, 0), 'HH:mm')
  } else if (post) {
    const postDate = parseISO(post.scheduledTime)
    schedulingOptions.value.date = format(postDate, 'yyyy-MM-dd')
    schedulingOptions.value.time = format(postDate, 'HH:mm')
    schedulingOptions.value.timezone = post.timezone || 'UTC'
    
    if (post.recurrence) {
      schedulingOptions.value.enableRecurrence = true
      schedulingOptions.value.recurrence = {
        ...schedulingOptions.value.recurrence,
        ...post.recurrence
      }
    } else {
      schedulingOptions.value.enableRecurrence = false
    }
  }
  
  showSchedulingDialog.value = true
}

const closeSchedulingDialog = () => {
  showSchedulingDialog.value = false
  currentPost.value = null
}

const saveScheduling = async () => {
  const scheduledDateTime = parse(
    `${schedulingOptions.value.date} ${schedulingOptions.value.time}`,
    'yyyy-MM-dd HH:mm',
    new Date()
  )
  
  const scheduleData = {
    scheduledTime: scheduledDateTime.toISOString(),
    timezone: schedulingOptions.value.timezone,
    status: 'scheduled'
  }
  
  if (schedulingOptions.value.enableRecurrence) {
    scheduleData.recurrence = {
      frequency: schedulingOptions.value.recurrence.frequency,
      weekdays: schedulingOptions.value.recurrence.weekdays,
      occurrences: schedulingOptions.value.recurrence.occurrences,
      endDate: schedulingOptions.value.recurrence.endDate
    }
  } else {
    scheduleData.recurrence = null
  }
  
  if (currentPost.value) {
    // Update existing post
    await updateContent(currentPost.value.id, scheduleData)
  } else {
    // Create new post with scheduled time
    emit('create-post', scheduledDateTime, scheduleData)
  }
  
  await fetchContentList()
  closeSchedulingDialog()
}

const createPost = (date: Date) => {
  openSchedulingDialog(null, date)
}

const editPost = (post: any) => {
  openSchedulingDialog(post)
}

// Event emits
const emit = defineEmits<{
  (e: 'create-post', date: Date, scheduleData?: any): void
  (e: 'edit-post', post: any): void
}>()

// Initial load
onMounted(async () => {
  await fetchContentList({
    status: 'scheduled'
  })
})
</script>

<style scoped>
.content-calendar {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.calendar-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-options {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.view-btn.active {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

/* Month View */
.calendar-body.month {
  padding: 1rem;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day {
  min-height: 120px;
  padding: 0.5rem;
  border: 1px solid #eee;
  border-radius: 4px;
}

.day.other-month {
  background: #f9f9f9;
  color: #999;
}

.day.today {
  background: #f0f9ff;
  border-color: #007bff;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.add-post {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: #eee;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.day-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.post-item {
  padding: 0.25rem;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Week View */
.calendar-body.week {
  height: 600px;
  overflow-y: auto;
}

.week-timeline {
  display: grid;
  grid-template-columns: 60px 1fr;
}

.time-slots {
  border-right: 1px solid #eee;
}

.time-slot {
  height: 60px;
  padding: 0.25rem;
  font-size: 12px;
  color: #666;
  border-bottom: 1px solid #eee;
}

.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.week-day {
  border-right: 1px solid #eee;
  position: relative;
}

.week-day-header {
  padding: 0.5rem;
  text-align: center;
  border-bottom: 1px solid #eee;
  background: white;
  position: sticky;
  top: 0;
  z-index: 1;
}

.day-timeline {
  height: 1440px; /* 24 hours * 60px */
  position: relative;
}

.week-post-item {
  position: absolute;
  left: 0;
  right: 0;
  padding: 0.25rem;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin: 0 0.25rem;
}

/* Platform indicators */
.platform-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.platform-indicator.twitter {
  background: #1da1f2;
}

.platform-indicator.facebook {
  background: #4267B2;
}

.platform-indicator.instagram {
  background: #E1306C;
}

.platform-indicator.linkedin {
  background: #0077B5;
}

/* Scheduling Dialog Styles */
.scheduling-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.scheduling-dialog {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-body {
  padding: 1.5rem;
}

.dialog-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.datetime-inputs {
  display: flex;
  gap: 0.5rem;
}

.date-input, .time-input, .timezone-select, .frequency-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.date-input {
  flex: 2;
}

.time-input {
  flex: 1;
}

.timezone-select, .frequency-select {
  width: 100%;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.recurrence-options {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.weekday-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.day-checkbox {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.end-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.occurrences-input {
  width: 60px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.cancel-btn, .save-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn {
  background: #f1f1f1;
  border: 1px solid #ddd;
}

.save-btn {
  background: #4a6cf7;
  border: 1px solid #4a6cf7;
  color: white;
}

.recurrence-indicator {
  margin-left: 0.25rem;
  color: #4a6cf7;
}
</style> 