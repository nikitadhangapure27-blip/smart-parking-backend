import React, { useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { FaCar, FaSignOutAlt, FaSearch, FaClock, FaCheckCircle, FaParking, FaMotorcycle, FaTruck, FaUser, FaPhone, FaHashtag, FaExclamationTriangle, FaRedo, FaTimes, FaQrcode, FaPrint } from 'react-icons/fa'
import { QRCodeSVG } from 'qrcode.react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createBooking, vehicleExit } from '../api/bookingApi'
import { getAllVehicles } from '../api/vehicleApi'
import { getActiveVehicles } from '../api/aggregateApi'
import { getAllSlots } from '../api/slotApi'
import { getAllPayments } from '../api/paymentApi'
import Pagination from './Pagination'

const BookingManager = () => {
  const queryClient = useQueryClient()
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [vehicleInput, setVehicleInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('ACTIVE')
  const [currentPage, setCurrentPage] = useState(1)
  const [exitResult, setExitResult] = useState(null)
  const [exitModal, setExitModal] = useState({ open: false, bookingId: null })
  const [ticketModal, setTicketModal] = useState({ open: false, url: '', vehicleNumber: '', ownerName: '', slotNumber: '', entryTime: '', bookingId: '' })
  const itemsPerPage = 10

  const { data: vRes, isLoading: lv, isError: ev, error: erv } = useQuery({ queryKey: ['vehicles'], queryFn: getAllVehicles })
  const { data: sRes, isLoading: ls, isError: es, error: ers } = useQuery({ queryKey: ['slots'], queryFn: getAllSlots })
  const { data: aRes, isLoading: la, isError: ea, error: era } = useQuery({ queryKey: ['active-bookings'], queryFn: getActiveVehicles })
  const { data: pRes, isLoading: lp, isError: ep, error: erp } = useQuery({ queryKey: ['payments'], queryFn: getAllPayments })

  const vehicles = vRes?.data?.data || []
  const activeBookings = aRes?.data?.data || []
  const completedBookings = pRes?.data?.data || []
  const isLoadingData = lv || ls || la || lp
  const hasError = ev || es || ep || ea
  const errorMessage = erv?.message || ers?.message || era?.message || erp?.message || 'Network Error'

  const entryMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (res) => {
      if (res.data.success) {
        const newBooking = res.data.data
        toast.success('Vehicle parked successfully!')
        setTicketModal({
          open: true,
          url: `${window.location.origin}?ticket=${newBooking._id}`,
          bookingId: newBooking._id,
          vehicleNumber: selectedVehicleData?.vehicleNumber || 'N/A',
          ownerName: selectedVehicleData?.ownerName || 'N/A',
          slotNumber: newBooking.slotId?.slotNumber || 'Auto-assigned',
          entryTime: newBooking.entryTime || new Date()
        })
        setSelectedVehicle(''); setVehicleInput('')
        queryClient.invalidateQueries({ queryKey: ['active-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['slots'] })
      } else toast.error(res.data.message)
    },
    onError: (err) => toast.error(err.message),
  })

  const exitMutation = useMutation({
    mutationFn: vehicleExit,
    onSuccess: (res) => {
      if (res.data.success) {
        setExitResult({ totalHours: res.data.totalHours, amount: res.data.amount })
        toast.success(`Exited! ₹${res.data.amount}`)
        setTimeout(() => setExitResult(null), 6000)
        queryClient.invalidateQueries({ queryKey: ['active-bookings'] }); queryClient.invalidateQueries({ queryKey: ['payments'] }); queryClient.invalidateQueries({ queryKey: ['slots'] })
      } else toast.error(res.data.message)
    },
    onError: (err) => toast.error(err.message),
  })

  const handleVehicleEntry = (e) => { e.preventDefault(); if (!selectedVehicle) { toast.error('Select a vehicle'); return } entryMutation.mutate(selectedVehicle) }
  const handleExitClick = (bookingId) => setExitModal({ open: true, bookingId })
  const confirmExit = () => { exitMutation.mutate(exitModal.bookingId); setExitModal({ open: false, bookingId: null }) }
  const cancelExit = () => setExitModal({ open: false, bookingId: null })

  const selectedVehicleData = useMemo(() => vehicles.find(v => v._id === selectedVehicle) || null, [vehicles, selectedVehicle])
  const formatTime = (date) => { if (!date) return 'N/A'; return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) }
  const formatDate = (date) => { if (!date) return ''; return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
  const getSlotIcon = (type) => { switch (type) { case 'BIKE': return <FaMotorcycle className="text-green-500" />; case 'CAR': return <FaCar className="text-blue-500" />; case 'TRUCK': return <FaTruck className="text-orange-500" />; default: return <FaParking /> } }

  const displayActive = useMemo(() => activeBookings.map(b => ({ _id: b._id, vehicleNumber: b.vehicleId?.vehicleNumber || '—', slotNumber: b.slotId?.slotNumber || '—', floor: b.slotId?.floor || '?', entryTime: b.entryTime, bookingStatus: 'ACTIVE' })), [activeBookings])
  const displayCompleted = useMemo(() => completedBookings.map(p => ({ _id: p._id, vehicleNumber: p.bookingId?.vehicleId?.vehicleNumber || '—', slotNumber: p.bookingId?.slotId?.slotNumber || '—', amount: p.amount, paymentMethod: p.paymentMethod || p.method || 'UPI', entryTime: p.bookingId?.entryTime, bookingStatus: 'COMPLETED' })), [completedBookings])
  const displayedBookings = useMemo(() => { let result = activeFilter === 'ACTIVE' ? displayActive : displayCompleted; if (searchTerm) { const t = searchTerm.toLowerCase(); result = result.filter(b => (b.vehicleNumber || '').toLowerCase().includes(t) || (b.slotNumber || '').toLowerCase().includes(t)) } return result }, [displayActive, displayCompleted, activeFilter, searchTerm])
  const totalPages = useMemo(() => Math.ceil(displayedBookings.length / itemsPerPage), [displayedBookings])
  const currentBookings = useMemo(() => { const iL = currentPage * itemsPerPage; const iF = iL - itemsPerPage; return displayedBookings.slice(iF, iL) }, [displayedBookings, currentPage])

  if (isLoadingData) { return (<div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"><div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-3 border border-gray-100 z-10"><div className="relative w-14 h-14"><div className="absolute inset-0 rounded-full border-4 border-red-100"></div><div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin"></div><FaParking className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 text-lg" /></div><h3 className="text-lg font-bold text-gray-800">Fetching bookings...</h3></div></div>) }
  if (hasError) { return (<div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-orange-50"><div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-3 border border-red-100 z-10 max-w-sm w-full mx-4"><div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center"><FaExclamationTriangle className="text-red-500 text-xl" /></div><div className="text-center"><h3 className="text-lg font-bold text-gray-800">Connection Failed</h3></div><div className="w-full bg-red-50 border border-red-100 rounded-lg p-2.5"><p className="text-[11px] font-mono break-words text-red-700">{errorMessage}</p></div><button onClick={() => { queryClient.invalidateQueries({ queryKey: ['active-bookings'] }) }} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"><FaRedo /> Try Again</button></div></div>) }

  return (
    <div>
      <div className="mb-6"><div className="flex items-center gap-4 flex-wrap"><div><h2 className="text-2xl font-bold text-gray-800">Manage Parking Bookings</h2><p className="text-gray-500 text-sm mt-1">Create and manage vehicle entry and exit</p></div><div className="flex items-center gap-3 ml-auto"><div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-200"><FaClock className="text-sm" /><span className="font-bold text-sm">{activeBookings.length}</span></div><div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200"><FaCheckCircle className="text-sm" /><span className="font-bold text-sm">{completedBookings.length}</span></div></div></div></div>
      {exitResult && (<div className="mb-6 bg-emerald-50 border border-emerald-300 rounded-xl p-5"><div className="flex items-center justify-between flex-wrap gap-4"><div><h3 className="text-lg font-semibold text-emerald-800">🚗 Vehicle Exited Successfully!</h3><p className="text-sm text-emerald-600 mt-1">The parking slot has been freed up</p></div><div className="flex gap-8"><div className="text-center"><p className="text-xs text-emerald-500">Total Hours</p><p className="text-2xl font-bold text-emerald-800">{exitResult.totalHours} hrs</p></div><div className="text-center"><p className="text-xs text-emerald-500">Amount</p><p className="text-2xl font-bold text-emerald-800">₹{exitResult.amount}</p></div></div></div></div>)}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1"><div className="bg-white rounded-xl shadow-sm p-6 sticky top-6"><h3 className="text-lg font-semibold text-gray-800 mb-5">Create Booking</h3><form onSubmit={handleVehicleEntry} className="space-y-4"><div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Vehicle Number</label><div className="relative"><FaHashtag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" /><input type="text" list="vehicleList" value={selectedVehicle ? (selectedVehicleData?.vehicleNumber || vehicleInput) : vehicleInput} onChange={(e) => { const val = e.target.value.toUpperCase(); setVehicleInput(val); const found = vehicles.find(v => v.vehicleNumber === val); if (found) { setSelectedVehicle(found._id) } else { setSelectedVehicle('') } }} placeholder="e.g., MH25AS9986" className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium text-gray-700" /><datalist id="vehicleList">{vehicles.map(v => (<option key={v._id} value={v.vehicleNumber} />))}</datalist></div></div><div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Owner Name</label><div className="relative"><FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" /><input type="text" value={selectedVehicleData?.ownerName || ''} readOnly placeholder="Select a vehicle first" className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-medium text-gray-600 cursor-not-allowed" /></div></div><div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Mobile No</label><div className="relative"><FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" /><input type="text" value={selectedVehicleData?.mobileNo || ''} readOnly placeholder="Auto-filled" className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-medium text-gray-600 cursor-not-allowed" /></div></div><div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Vehicle Type</label><div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2">{selectedVehicleData ? getSlotIcon(selectedVehicleData.vehicleType) : <FaCar className="text-gray-400" />}</div><input type="text" value={selectedVehicleData?.vehicleType || ''} readOnly placeholder="Auto-filled" className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-medium text-gray-600 cursor-not-allowed" /></div></div><div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Slot No (Predicted)</label><div className="relative"><FaParking className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-purple-400" /><input type="text" value={selectedVehicleData ? (activeBookings.find(b => b.vehicleId?._id === selectedVehicle || b.vehicleId === selectedVehicle) ? 'Already Parked' : 'Auto-assigned on create') : ''} readOnly placeholder="Select vehicle first" className={`w-full pl-9 pr-4 py-2.5 rounded-xl border-2 text-sm font-bold outline-none cursor-not-allowed ${selectedVehicleData ? activeBookings.find(b => b.vehicleId?._id === selectedVehicle || b.vehicleId === selectedVehicle) ? 'border-red-300 bg-red-50 text-red-500' : 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-400'}`} /></div></div><button type="submit" disabled={entryMutation.isPending || !selectedVehicle} className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"><FaParking /> {entryMutation.isPending ? 'Creating...' : 'Create Booking'}</button></form></div></div>
        
        <div className="lg:col-span-2"><div className="bg-white rounded-xl shadow-sm min-h-[500px] overflow-hidden border border-gray-100"><div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3"><div className="flex items-center gap-2"><button onClick={() => { setActiveFilter('ACTIVE'); setCurrentPage(1) }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeFilter === 'ACTIVE' ? 'bg-amber-100 text-amber-700' : 'text-gray-500 hover:bg-gray-50'}`}>Active ({activeBookings.length})</button><button onClick={() => { setActiveFilter('COMPLETED'); setCurrentPage(1) }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeFilter === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}>Completed ({completedBookings.length})</button></div><div className="relative"><FaSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" /><input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} placeholder="Search..." className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-40" /></div></div>
          
          {currentBookings.length === 0 ? (<div className="text-center py-20"><FaCar className="text-5xl text-gray-200 mx-auto mb-4" /><p className="text-gray-400 text-lg">No bookings found.</p></div>) : (
            <div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-gray-50/50"><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slot</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entry Time</th>{activeFilter === 'COMPLETED' && (<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>)}<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th></tr></thead><tbody className="divide-y divide-gray-50">{currentBookings.map((b) => (<tr key={b._id} className="hover:bg-gray-50/50 transition"><td className="px-6 py-4"><span className="font-mono font-semibold text-sm bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md">{b.vehicleNumber}</span></td><td className="px-6 py-4"><span className="text-sm text-gray-700 font-medium">{activeFilter === 'ACTIVE' ? `F-${b.floor} (${b.slotNumber})` : b.slotNumber}</span></td><td className="px-6 py-4"><div><span className="text-sm font-semibold text-gray-800">{formatTime(b.entryTime)}</span><p className="text-[10px] text-gray-400">{formatDate(b.entryTime)}</p></div></td>{activeFilter === 'COMPLETED' && (<td className="px-6 py-4"><span className="text-sm font-bold text-emerald-600">₹{b.amount}</span><p className="text-[10px] text-gray-400">{b.paymentMethod}</p></td>)}<td className="px-6 py-4"><div className="flex items-center gap-2">{b.bookingStatus === 'ACTIVE' ? (<button onClick={() => handleExitClick(b._id)} disabled={exitMutation.isPending} className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition font-medium shadow-sm disabled:opacity-50"><FaSignOutAlt className="text-xs" /> Exit</button>) : (<span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Completed</span>)}</div></td></tr>))}</tbody></table></div>
          )}
        </div></div>
      </div>

      {/* EXIT MODAL */}
      {exitModal.open && (<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"><div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-5 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><FaSignOutAlt className="text-white text-lg" /></div><h3 className="text-lg font-bold text-white">Confirm Exit</h3></div><button onClick={cancelExit} className="text-white/70 hover:text-white transition p-1"><FaTimes className="text-lg" /></button></div><div className="p-6"><div className="flex flex-col items-center text-center"><div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4"><FaExclamationTriangle className="text-red-500 text-3xl" /></div><h4 className="text-xl font-bold text-gray-800 mb-2">Do you want to exit this booking?</h4><p className="text-sm text-gray-500 leading-relaxed">This will free up the parking slot and generate the payment receipt.</p></div></div><div className="px-6 pb-6 flex gap-3"><button onClick={cancelExit} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition border border-gray-200">No</button><button onClick={confirmExit} disabled={exitMutation.isPending} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">{exitMutation.isPending ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Exiting...</>) : (<><FaSignOutAlt /> Yes, Exit</>)}</button></div></div></div>)}

      {/* ─── ✅ COMPACT TICKET MODAL WITH QR ────────────────────────── */}
      {ticketModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50 p-4 print:p-0 print:bg-white">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs overflow-hidden print:shadow-none print:rounded-none">
            
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-center text-white print:bg-indigo-600">
              <FaParking className="text-xl mx-auto mb-1 opacity-80" />
              <h1 className="text-lg font-extrabold tracking-wider">PARKING TICKET</h1>
              <p className="text-[10px] opacity-80 mt-0.5 font-medium">Smart Parking System</p>
            </div>

            {/* Compact Body */}
            <div className="p-4 space-y-3">
              <p className="text-center text-[10px] text-gray-500 leading-relaxed">
                Thank you for parking with us! Please keep this ticket safe and show it at the exit gate.
              </p>

              {/* Compact Details Grid */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-semibold uppercase">Booking ID</span>
                  <span className="font-mono font-bold text-gray-800">#{ticketModal.bookingId.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-semibold uppercase">Owner Name</span>
                  <span className="font-bold text-gray-800">{ticketModal.ownerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-semibold uppercase">Vehicle No</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">{ticketModal.vehicleNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-semibold uppercase">Slot No</span>
                  <span className="font-bold text-gray-800">{ticketModal.slotNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-semibold uppercase">Entry Time</span>
                  <span className="font-bold text-gray-800 text-[11px]">{formatDate(ticketModal.entryTime)}, {formatTime(ticketModal.entryTime)}</span>
                </div>
              </div>

              {/* Compact QR Code */}
              <div className="flex flex-col items-center gap-1 pt-1">
                <QRCodeSVG value={ticketModal.url} size={110} bgColor={"#ffffff"} fgColor={"#1e1b4b"} level={"H"} />
                <p className="text-[9px] text-gray-400">Scan to verify ticket</p>
              </div>
            </div>

            {/* Compact Footer Buttons */}
            <div className="px-4 pb-4 flex gap-2 print:hidden">
              <button onClick={() => setTicketModal({ open: false })} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition border border-gray-200 flex items-center justify-center gap-1.5">
                <FaTimes className="text-[10px]" /> Close
              </button>
              <button onClick={() => window.print()} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5">
                <FaPrint className="text-[10px]" /> Print Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingManager