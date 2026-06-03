import api from '../axiosConfig'

export const createBooking = (vehicleId) => api.post('/booking', { vehicleId })
export const vehicleExit = (bookingId) => api.put(`/booking/exit/${bookingId}`)
export const getBookingById = (id) => api.get(`/booking/${id}`) // ✅ NEW