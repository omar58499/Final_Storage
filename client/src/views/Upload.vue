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
          <input v-model="displayName" @input="checkDisplayNameUniqueness" type="text" class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" :class="{ 'border-red-500': displayNameError }" placeholder="Enter new name" />
          <p v-if="displayNameError" class="text-red-500 text-sm mt-1">{{ displayNameError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Select Date</label>
          <input v-model="selectedDate" type="date" class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div class="flex space-x-4 pt-4">
          <button @click="uploadFile" :disabled="!selectedFile" class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition">
            Upload
          </button>
          <button @click="resetSelection" class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition">
            Cancel
          </button>
        </div>
      </div>

      <div v-if="message" :class="`mt-4 text-center ${isError ? 'text-red-500' : 'text-green-500'}`">
        {{ message }}
        <div v-if="isError && !isAdmin" class="mt-4">
          <button @click="promoteToAdmin" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
            {{ isPromoting ? 'Promoting...' : 'Promote Me to Admin' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../services/apiClient'
import { useRouter } from 'vue-router'

const fileInput = ref(null)
const selectedFile = ref(null)
const displayName = ref('')
const selectedDate = ref('')
const message = ref('')
const isError = ref(false)
const router = useRouter()
const displayNameError = ref('')
const isAdmin = ref(false)
const isPromoting = ref(false)

onMounted(() => {
  // Check if user is admin
  const token = localStorage.getItem('token')
  if (token) {
    apiClient.get('/api/auth/verify')
    .then(res => {
      isAdmin.value = res.data.user.role === 'admin'
      if (!isAdmin.value) {
        message.value = 'Only admins can upload files.'
        isError.value = true
      }
    })
    .catch(err => {
      console.error('Failed to verify admin status:', err)
      router.push('/login')
    })
  }
})

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
    displayNameError.value = ''
  }
}

const resetSelection = () => {
  selectedFile.value = null
  displayName.value = ''
  selectedDate.value = ''
  message.value = ''
  displayNameError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const promoteToAdmin = async () => {
  isPromoting.value = true
  try {
    const response = await apiClient.post('/api/auth/make-admin')
    console.log('Promote response:', response.data)
    isAdmin.value = true
    message.value = 'You are now an admin! You can now upload files.'
    isError.value = false
  } catch (err) {
    console.error('Failed to promote to admin:', err)
    message.value = err.response?.data?.msg || 'Failed to promote to admin.'
    isError.value = true
  } finally {
    isPromoting.value = false
  }
}

const checkDisplayNameUniqueness = async () => {
  const value = displayName.value.trim()
  
  if (!value) {
    displayNameError.value = ''
    return
  }

  try {
    const { data } = await apiClient.get('/api/files', {
      params: { search: value }
    })

    // Check if any file has the same display_name (case-insensitive)
    const duplicate = data.some(file => 
      file.display_name && file.display_name.toLowerCase() === value.toLowerCase()
    )

    if (duplicate) {
      displayNameError.value = 'This name is already in use by another existing file'
    } else {
      displayNameError.value = ''
    }
  } catch (err) {
    console.error('Failed to check display name:', err)
    // Don't block upload on validation check error
    displayNameError.value = ''
  }
}

const uploadFile = async () => {
  if (!selectedFile.value) return
  
  if (!isAdmin.value) {
    message.value = 'Only admins can upload files.'
    isError.value = true
    return
  }

  if (displayNameError.value) {
    message.value = 'Please resolve validation errors before uploading.'
    isError.value = true
    return
  }

  const token = localStorage.getItem('token')
  if (!token) {
    message.value = 'Please login first.'
    isError.value = true
    router.push('/login')
    return
  }

  try {
    await apiClient.get('/api/auth/verify')
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
    const response = await apiClient.post('/api/files/upload', formData)
    console.log('Upload response:', response.data)
    message.value = 'File uploaded successfully!'
    isError.value = false
    setTimeout(() => {
      resetSelection()
    }, 1500)
  } catch (err) {
    console.error('Upload error:', err)
    const errorMsg = err.response?.data?.msg || err.response?.data?.error || err.message || 'Upload failed.'
    message.value = errorMsg
    isError.value = true
  }
}
</script>
