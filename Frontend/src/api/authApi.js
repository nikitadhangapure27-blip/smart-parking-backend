import api from '../axiosConfig'

export const registerAdmin = (data) => api.post('/auth/register', data)
export const loginAdmin = (data) => api.post('/auth/login', data)
export const getProfile = () => api.get('/auth/profile')