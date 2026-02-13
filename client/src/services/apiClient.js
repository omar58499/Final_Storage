import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : window.location.origin
)

const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

export default apiClient
