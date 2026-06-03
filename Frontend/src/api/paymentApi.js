import api from '../axiosConfig'

export const createPayment = (data) => api.post('/payment', data)
export const getAllPayments = () => api.get('/payment')
export const getPaymentById = (id) => api.get(`/payment/${id}`)