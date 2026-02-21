import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : window.location.origin
)

const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

// Add request interceptor to include token in all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['x-auth-token'] = token
    }
    // Don't set Content-Type for FormData - let axios handle it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default apiClient
