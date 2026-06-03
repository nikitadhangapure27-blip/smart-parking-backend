import React, { useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { FaPlus, FaParking, FaCar, FaTruck, FaMotorcycle, FaExclamationTriangle, FaRedo } from 'react-icons/fa'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createSlot, getAllSlots, updateSlotStatus } from '../api/slotApi'
import Pagination from './Pagination'

const SlotManager = () => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({ slotNumber: '', floor: '', slotType: 'CAR' })
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState('ALL')
  const itemsPerPage = 24

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({ queryKey: ['slots'], queryFn: getAllSlots })
  const slots = data?.data?.data || []

  const createMutation = useMutation({
    mutationFn: createSlot,
    onSuccess: (res) => {
      if (res.data.success) { toast.success('Slot created!'); setFormData({ slotNumber: '', floor: '', slotType: 'CAR' }); queryClient.invalidateQueries({ queryKey: ['slots'] }) }
      else toast.error(res.data.message)
    },
    onError: (err) => toast.error(err.message),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) => updateSlotStatus(id, { status }),
    onSuccess: (res) => {
      if (res.data.success) { toast.success('Status updated!'); queryClient.invalidateQueries({ queryKey: ['slots'] }) }
    },
    onError: (err) => toast.error(err.message),
  })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const availableCount = useMemo(() => slots.filter(s => s.status === 'AVAILABLE').length, [slots])
  const occupiedCount = useMemo(() => slots.filter(s => s.status === 'OCCUPIED').length, [slots])
  const filteredSlots = useMemo(() => filter === 'ALL' ? slots : slots.filter(s => s.slotType === filter), [slots, filter])
  const totalPages = useMemo(() => Math.ceil(filteredSlots.length / itemsPerPage), [filteredSlots])
  const currentSlots = useMemo(() => filteredSlots.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredSlots, currentPage])

  const getSlotIcon = (type) => { switch (type) { case 'BIKE': return <FaMotorcycle />; case 'CAR': return <FaCar />; case 'TRUCK': return <FaTruck />; default: return <FaParking /> } }

  // ─── CONDENSED LOADING STATE ──────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-3 border border-gray-100 z-10">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-red-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin"></div>
            <FaParking className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 text-lg" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Fetching parking slots...</h3>
          <p className="text-xs text-gray-400">Please wait</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    )
  }

  // ─── CONDENSED ERROR STATE ────────────────────────────
  if (isError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 relative overflow-hidden">
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-3 border border-red-100 z-10 max-w-sm w-full mx-4">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center"><FaExclamationTriangle className="text-red-500 text-xl" /></div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800">Connection Failed</h3>
            <p className="text-xs text-gray-500 mt-0.5">Unable to reach server. Backend may be offline.</p>
          </div>
          <div className="w-full bg-red-50 border border-red-100 rounded-lg p-2.5">
            <p className="text-[11px] font-mono break-words text-red-700">{error?.message || 'Network Error - Server Unreachable'}</p>
          </div>
          <div className="w-full bg-gray-50 rounded-lg p-2.5">
            <ul className="space-y-1">
              <li className="flex items-start gap-1.5 text-[11px] text-gray-500"><span className="text-red-400 mt-0.5">●</span> Check if backend is running on port 2705</li>
              <li className="flex items-start gap-1.5 text-[11px] text-gray-500"><span className="text-orange-400 mt-0.5">●</span> Verify database connection is active</li>
              <li className="flex items-start gap-1.5 text-[11px] text-gray-500"><span className="text-amber-400 mt-0.5">●</span> Check CORS settings on backend</li>
            </ul>
          </div>
          <button onClick={() => refetch()} disabled={isRefetching} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            <FaRedo className={isRefetching ? 'animate-spin' : ''} /> {isRefetching ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    )
  }

  // ─── MAIN CONTENT ─────────────────────────────────────
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div><h2 className="text-2xl font-bold text-gray-800">Manage Your Parking Slots</h2><p className="text-gray-500 text-sm mt-1">Add, view, and manage all parking slots</p></div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-200"><FaCar className="text-sm" /><span className="font-bold text-sm">{slots.length}</span><span className="text-xs text-blue-500 hidden sm:inline">Total</span></div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200"><FaParking className="text-sm" /><span className="font-bold text-sm">{availableCount}</span><span className="text-xs text-emerald-500 hidden sm:inline">Available</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Add Slot Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-5">Add Your Parking Slot</h3>
            <form onSubmit={(e) => { e.preventDefault(); if (!formData.slotNumber || !formData.floor || !formData.slotType) { toast.error('All fields required'); return } createMutation.mutate(formData) }} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Slot Number</label><input type="text" name="slotNumber" value={formData.slotNumber} onChange={handleChange} placeholder="e.g., A01" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Floor</label><input type="text" name="floor" value={formData.floor} onChange={handleChange} placeholder="e.g., 1" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Slot Type</label><select name="slotType" value={formData.slotType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"><option value="BIKE">BIKE</option><option value="CAR">CAR</option><option value="TRUCK">TRUCK</option></select></div>
              <button type="submit" disabled={createMutation.isPending} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg hover:from-pink-600 hover:to-rose-600 transition font-medium shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"><FaPlus /> {createMutation.isPending ? 'Creating...' : 'Create Slot'}</button>
            </form>
            <div className="mt-6 pt-5 border-t border-gray-100"><p className="text-xs text-gray-500 font-medium mb-3">LEGEND</p><div className="space-y-2"><div className="flex items-center gap-2"><div className="w-5 h-5 bg-white border-2 border-gray-200 rounded"></div><span className="text-xs text-gray-600">Available</span></div><div className="flex items-center gap-2"><div className="w-5 h-5 bg-amber-400 rounded"></div><span className="text-xs text-gray-600">Occupied</span></div></div></div>
          </div>
        </div>

        {/* RIGHT: Slots Grid */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-blue-800 rounded-2xl shadow-lg min-h-[500px] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3"><h3 className="text-base font-semibold text-white">Your Slots</h3><span className="text-xs text-blue-200 bg-white/10 px-2.5 py-1 rounded-full">{filteredSlots.length}</span></div>
              <select value={filter} onChange={(e) => { setFilter(e.target.value); setCurrentPage(1) }} className="bg-white/15 text-white border border-white/20 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none cursor-pointer"><option value="ALL" className="text-gray-800">All Types</option><option value="BIKE" className="text-gray-800">Bike</option><option value="CAR" className="text-gray-800">Car</option><option value="TRUCK" className="text-gray-800">Truck</option></select>
            </div>
            <div className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-blue-200">Showing {filteredSlots.length} slot{filteredSlots.length !== 1 ? 's' : ''}</span>
              <div className="flex items-center gap-3"><span className="text-xs text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full">{availableCount} Free</span><span className="text-xs text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full">{occupiedCount} Busy</span></div>
            </div>
            
            <div className="px-6 pb-6">
              {currentSlots.length === 0 ? (
                <div className="text-center py-16"><FaParking className="text-5xl text-blue-300 mx-auto mb-4" /><p className="text-blue-200 text-lg">No slots found</p></div>
              ) : (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {currentSlots.map(slot => (
                      <div key={slot._id} className={`rounded-xl p-3 cursor-pointer transition-all hover:scale-105 hover:shadow-lg text-center ${slot.status === 'AVAILABLE' ? 'bg-white shadow-md' : 'bg-amber-400 shadow-md'}`} onClick={() => toggleMutation.mutate({ id: slot._id, status: slot.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE' })} title="Click to toggle status">
                        <div className={`text-lg mb-1 ${slot.status === 'AVAILABLE' ? 'text-indigo-600' : 'text-amber-900'}`}>{getSlotIcon(slot.slotType)}</div>
                        <p className={`font-bold text-sm ${slot.status === 'AVAILABLE' ? 'text-gray-800' : 'text-amber-900'}`}>{slot.slotNumber}</p>
                        <p className={`text-[10px] ${slot.status === 'AVAILABLE' ? 'text-gray-400' : 'text-amber-800'}`}>F{slot.floor} • {slot.slotType}</p>
                        <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${slot.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-700 text-amber-100'}`}>{slot.status === 'AVAILABLE' ? 'FREE' : 'BUSY'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SlotManager