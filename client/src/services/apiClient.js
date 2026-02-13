import axios from 'axios'

let API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : window.location.origin
)

// Ensure URL has protocol
if (API_BASE_URL && !API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  API_BASE_URL = 'https://' + API_BASE_URL
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

export default apiClient
