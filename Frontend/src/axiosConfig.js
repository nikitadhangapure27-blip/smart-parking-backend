import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:2705/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spms_token')
  if (token) { config.headers.Authorization = `Bearer ${token}` }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default api