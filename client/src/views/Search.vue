<template>
  <div class="p-8">
    <button @click="$router.push('/dashboard')" class="text-gray-400 hover:text-white mb-8">← Back to Dashboard</button>
    
    <div class="space-y-6">
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">Find Files</h2>
        <div class="flex flex-col md:flex-row gap-4">
          <input 
            v-model="searchQuery" 
            @keyup.enter="fetchFiles"
            type="text" 
            placeholder="Search by name or GR number..." 
            class="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            v-model="filterDate" 
            @change="fetchFiles"
            type="date" 
            class="bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button @click="fetchFiles" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold">Search</button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div v-for="file in files" :key="file.id" class="bg-gray-800 p-4 rounded-lg flex items-center justify-between hover:bg-gray-750 transition border border-gray-700">
          <div class="flex items-center space-x-4 cursor-pointer flex-1" @click="openPreview(file)">
            <div class="text-3xl">📄</div>
            <div>
              <div class="font-bold text-lg">{{ file.display_name }}</div>
              <div class="text-sm text-gray-400">
                <span class="mr-3">GR: {{ file.gr_number }}</span>
                <span class="mr-3">Size: {{ (file.size / 1024).toFixed(2) }} KB</span>
                <span>Date: {{ formatSelectedDate(file.user_selected_date) }}</span>
              </div>
            </div>
          </div>
          <div class="flex space-x-2">
            <button @click.stop="downloadFile(file)" class="p-2 text-blue-400 hover:text-blue-300" title="Download">⬇️</button>
            <button v-if="isAdmin" @click.stop="deleteFile(file.id)" class="p-2 text-red-400 hover:text-red-300" title="Delete">🗑️</button>
          </div>
        </div>
        
        <div v-if="files.length === 0 && !loading" class="text-center text-gray-500 mt-8">
          No files found.
        </div>
      </div>
    </div>

    <!-- Full Page Preview Overlay -->
    <div v-if="previewFile" class="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col p-4">
      <div class="flex justify-between items-center mb-4 text-white">
        <h2 class="text-xl font-bold">{{ previewFile.display_name }} ({{ previewFile.gr_number }})</h2>
        <button @click="closePreview" class="text-gray-300 hover:text-white text-2xl">✕</button>
      </div>
      <div class="flex-1 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center relative">
        <iframe 
          v-if="isPreviewable(previewFile)"
          :src="getFileUrl(previewFile)" 
          class="w-full h-full border-none"
        ></iframe>
        <div v-else class="text-center">
            <div class="text-6xl mb-4">📦</div>
            <p class="text-xl">Preview not available for this file type.</p>
            <button @click="downloadFile(previewFile)" class="mt-4 bg-blue-600 px-4 py-2 rounded">Download to View</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../services/apiClient'

const files = ref([])
const searchQuery = ref('')
const filterDate = ref('')
const loading = ref(false)
const previewFile = ref(null)
const isAdmin = ref(false)

const fetchFiles = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (filterDate.value) params.date = filterDate.value
    
    const res = await apiClient.get('/api/files', {
      params
    })
    files.value = res.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const openPreview = (file) => {
  previewFile.value = file
}

const closePreview = () => {
  previewFile.value = null
}

const formatSelectedDate = (value) => {
  if (!value) return 'N/A'
  const datePart = String(value).slice(0, 10)
  const localDate = new Date(`${datePart}T00:00:00`)
  if (Number.isNaN(localDate.getTime())) return 'N/A'
  return localDate.toLocaleDateString()
}

const isPreviewable = (file) => {
    // Simple check for common web-viewable types
    const types = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
    return types.includes(file.mimetype)
}

const getFileUrl = (file) => {
    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin)
    return `${baseUrl}/api/files/${file.id}/content?token=${token}`
}

const downloadFile = async (file) => {
  try {
    const response = await apiClient.get(`/api/files/${file.id}/content`, {
        responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', file.display_name || file.original_name || file.filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    console.error('Download failed', err)
  }
}

const deleteFile = async (id) => {
  if (!confirm('Are you sure you want to delete this file?')) return

  try {
    await apiClient.delete(`/api/files/${id}`)
    fetchFiles() // Refresh list
  } catch (err) {
    console.error('Delete failed', err)
    alert('Failed to delete file')
  }
}

onMounted(() => {
  // Check if user is admin
  const token = localStorage.getItem('token')
  if (token) {
    apiClient.get('/api/auth/verify')
      .then(res => {
        isAdmin.value = res.data.user.role === 'admin'
      })
      .catch(err => {
        console.error('Failed to verify admin status:', err)
      })
  }
  fetchFiles()
})
</script>
