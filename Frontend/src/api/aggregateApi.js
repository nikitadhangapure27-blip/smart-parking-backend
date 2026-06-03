import api from '../axiosConfig'

export const getActiveVehicles = () => api.get('/aggregate/active-vehicles')
export const getParkingDuration = () => api.get('/aggregate/parking-duration')
export const getDailyRevenue = () => api.get('/aggregate/daily-revenue')