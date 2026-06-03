import api from '../axiosConfig'

export const createSlot = (data) => api.post('/slot', data)
export const getAllSlots = () => api.get('/slot')
export const getAvailableSlots = (slotType) => api.get('/slot/available', { params: { slotType } })
export const updateSlotStatus = (id, data) => api.put(`/slot/${id}`, data)