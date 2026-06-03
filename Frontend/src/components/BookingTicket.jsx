import React, { useState, useEffect } from 'react'
import { FaCar, FaParking, FaClock, FaTimesCircle } from 'react-icons/fa'
import { getBookingById } from '../api/bookingApi'

const BookingTicket = ({ ticketId }) => {
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await getBookingById(ticketId)
        if (res.data.success) setBooking(res.data.data)
        else setError('Booking not found')
      } catch (err) { setError('Failed to fetch booking details') } 
      finally { setLoading(false) }
    }
    fetchTicket()
  }, [ticketId])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div></div>
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4"><div className="bg-white p-8 rounded-xl shadow-lg text-center"><FaTimesCircle className="text-red-500 text-4xl mx-auto mb-4" /><h2 className="text-xl font-bold text-gray-800">Error</h2><p className="text-gray-500 mt-2">{error}</p></div></div>
  if (!booking) return null

  const formatTime = (date) => new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs overflow-hidden border border-gray-100">
        
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-center text-white">
          <FaParking className="text-xl mx-auto mb-1 opacity-80" />
          <h1 className="text-lg font-extrabold tracking-wider">PARKING TICKET</h1>
          <p className="text-[10px] opacity-80 mt-0.5 font-medium">Smart Parking System</p>
        </div>

        {/* Compact Body */}
        <div className="p-4 space-y-3">
          <p className="text-center text-[10px] text-gray-500 leading-relaxed">
            Thank you for parking with us! Please keep this ticket safe and show it at the exit gate.
          </p>

          <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-semibold uppercase">Booking ID</span>
              <span className="font-mono font-bold text-gray-800">#{booking._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-semibold uppercase">Owner Name</span>
              <span className="font-bold text-gray-800">{booking.vehicleId?.ownerName || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-semibold uppercase">Vehicle No</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">{booking.vehicleId?.vehicleNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-semibold uppercase">Slot No</span>
              <span className="font-bold text-gray-800">{booking.slotId?.slotNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-semibold uppercase">Entry Time</span>
              <span className="font-bold text-gray-800 text-[11px]">{formatDate(booking.entryTime)}, {formatTime(booking.entryTime)}</span>
            </div>
          </div>

          {booking.status === 'COMPLETED' && booking.exitTime && (
             <div className="bg-emerald-50 p-3 rounded-lg text-center border border-emerald-100">
               <p className="text-[10px] text-emerald-600 font-bold uppercase">Exited At</p>
               <p className="text-xs font-extrabold text-emerald-700 mt-0.5">{formatDate(booking.exitTime)}, {formatTime(booking.exitTime)}</p>
             </div>
          )}
        </div>

        <div className="bg-gray-50 px-4 py-3 text-center border-t border-dashed border-gray-200">
          <p className="text-[9px] text-gray-400">Smart Parking Management System</p>
        </div>
      </div>
    </div>
  )
}

export default BookingTicket