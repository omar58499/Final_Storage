<template>
  <div class="p-8">
    <button @click="$router.push('/dashboard')" class="text-gray-400 hover:text-white mb-8">← Back to Dashboard</button>
    
    <div class="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-6">Upload File</h2>

      <div v-if="!selectedFile" class="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-blue-500 transition cursor-pointer" @click="triggerFileInput">
        <div class="text-4xl mb-4">📄</div>
        <p>Click to select a file</p>
        <input ref="fileInput" type="file" class="hidden" @change="onFileSelected" />
      </div>

      <div v-else class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Original Name</label>
          <div class="text-white bg-gray-700 px-4 py-2 rounded">{{ selectedFile.name }}</div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Rename File (Optional)</label>
          <input v-model="displayName" @input="checkDisplayNameExists" type="text" class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" :class="{ 'border-red-500 focus:ring-red-500': displayNameError }" placeholder="Enter new name" />
          <p v-if="displayNameError" class="text-red-500 text-sm mt-2">{{ displayNameError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Select Date</label>
          <input v-model="selectedDate" type="date" class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div class="flex space-x-4 pt-4">
          <button @click="uploadFile" :disabled="displayNameError" class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition">
            Upload
          </button>
          <button @click="resetSelection" class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition">
            Cancel
          </button>
        </div>
      </div>

      <div v-if="message" :class="`mt-4 text-center ${isError ? 'text-red-500' : 'text-green-500'}`">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import apiClient from '../services/apiClient'
import { useRouter } from 'vue-router'

const fileInput = ref(null)
const selectedFile = ref(null)
const displayName = ref('')
const selectedDate = ref('')
const message = ref('')
const isError = ref(false)
const displayNameError = ref('')
const router = useRouter()

const triggerFileInput = () => {
  fileInput.value.click()
}

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    displayName.value = file.name
    // Default date to today
    const today = new Date().toISOString().split('T')[0]
    selectedDate.value = today
  }
}
checkDisplayNameExists = async () => {
  if (!displayName.value.trim()) {
    displayNameError.value = ''
    return
  }

  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const response = await apiClient.get('/api/files', {
      params: { search: displayName.value },
      headers: { 'x-auth-token': token }
    })
    
    if (response.data.some(file => file.displayName === displayName.value)) {
      displayNameError.value = 'Please select a different name. This name is already in use.'
    } else {
      displayNameError.value = ''
    }
  } catch (err) {
    console.error('Error checking display name:', err)
  }
}

const resetSelection = () => {
  selectedFile.value = null
  displayName.value = ''
  selectedDate.value = ''
  message.value = ''
  displayNameErrordDate.value = ''
  message.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const uploadFile = async () => {
  if (!selectedFile.value) return

  const token = localStorage.getItem('token')
  if (!token) {
    message.value = 'Please login first.'
    isError.value = true
    router.push('/login')
    return
  }

  try {
    await apiClient.get('/api/auth/verify', {
      headers: { 'x-auth-token': token }
    })
  } catch (err) {
    localStorage.removeItem('token')
    message.value = 'Session expired. Please login again.'
    isError.value = true
    router.push('/login')
    return
  }

  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('displayName', displayName.value)
  formData.append('date', selectedDate.value)

  try {
    await apiClient.post('/api/files/upload', formData, {
      headers: {
        'x-auth-token': token
      }
    })
    message.value = 'File uploaded successfully!'
    isError.value = false
    setTimeout(() => {
      resetSelection()
    }, 1500)
  } catch (err) {
    console.error(err)
    message.value = err.response?.data?.msg || 'Upload failed.'
    isError.value = true
  }
}
</script>
