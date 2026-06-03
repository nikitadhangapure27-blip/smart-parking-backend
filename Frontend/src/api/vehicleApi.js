import api from '../axiosConfig'

export const addVehicle = (data) => api.post('/vehicle/add', data)
export const getAllVehicles = () => api.get('/vehicle/all')
export const getVehicleById = (id) => api.get(`/vehicle/${id}`)
export const updateVehicle = (id, data) => api.put(`/vehicle/update/${id}`, data)