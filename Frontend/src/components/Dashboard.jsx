import React, { useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { FaCar, FaParking, FaRupeeSign, FaSignOutAlt, FaClock, FaExclamationTriangle, FaRedo, FaTimes } from 'react-icons/fa'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllVehicles } from '../api/vehicleApi'
import { getAllSlots } from '../api/slotApi'
import { getAllPayments } from '../api/paymentApi'
import { getActiveVehicles } from '../api/aggregateApi'
import { vehicleExit } from '../api/bookingApi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Dashboard = ({ setActiveTab }) => {
  const queryClient = useQueryClient()
  const [exitModal, setExitModal] = useState({ open: false, bookingId: null })
  const [exitResult, setExitResult] = useState(null)
  const [chartDays, setChartDays] = useState(7) // ✅ Chart Filter State

  // ✅ TanStack Queries
  const { data: vRes, isLoading: lv, isError: ev, error: erv } = useQuery({ queryKey: ['vehicles'], queryFn: getAllVehicles })
  const { data: sRes, isLoading: ls, isError: es, error: ers } = useQuery({ queryKey: ['slots'], queryFn: getAllSlots })
  const { data: pRes, isLoading: lp, isError: ep, error: erp } = useQuery({ queryKey: ['payments'], queryFn: getAllPayments })
  const { data: aRes, isLoading: la, isError: ea, error: era } = useQuery({ queryKey: ['active-bookings'], queryFn: getActiveVehicles })

  const vehicles = vRes?.data?.data || []
  const slots = sRes?.data?.data || []
  const payments = pRes?.data?.data || []
  const activeBookings = aRes?.data?.data || []

  const isLoadingData = lv || ls || lp || la
  const hasError = ev || es || ep || ea
  const errorMessage = erv?.message || ers?.message || erp?.message || era?.message || 'Network Error - Server Unreachable'

  const exitMutation = useMutation({
    mutationFn: vehicleExit,
    onSuccess: (res) => {
      if (res.data.success) {
        setExitResult({ totalHours: res.data.totalHours, amount: res.data.amount })
        toast.success(`Vehicle exited successfully! ₹${res.data.amount}`)
        setTimeout(() => setExitResult(null), 6000)
        queryClient.invalidateQueries({ queryKey: ['active-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['payments'] })
        queryClient.invalidateQueries({ queryKey: ['slots'] })
      } else toast.error(res.data.message)
    },
    onError: (err) => toast.error(err.message),
  })

  const handleExitClick = (bookingId) => setExitModal({ open: true, bookingId })
  const confirmExit = () => { exitMutation.mutate(exitModal.bookingId); setExitModal({ open: false, bookingId: null }) }
  const cancelExit = () => setExitModal({ open: false, bookingId: null })

  const formatTime = (date) => { if (!date) return 'N/A'; return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) }
  const formatDate = (date) => { if (!date) return ''; return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }

  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    queryClient.invalidateQueries({ queryKey: ['slots'] })
    queryClient.invalidateQueries({ queryKey: ['payments'] })
    queryClient.invalidateQueries({ queryKey: ['active-bookings'] })
  }

  // ✅ CHART DATA PROCESSING
  const chartData = useMemo(() => {
    const now = new Date()
    const startDate = new Date()
    startDate.setDate(now.getDate() - chartDays)

    const filtered = payments.filter((p) => {
      const payDate = new Date(p.paymentDate || p.paidAt || p.createdAt)
      return payDate >= startDate && payDate <= now
    })

    const grouped = filtered.reduce((acc, p) => {
      const dateStr = new Date(p.paymentDate || p.paidAt || p.createdAt).toISOString().split('T')[0]
      acc[dateStr] = (acc[dateStr] || 0) + (p.amount || 0)
      return acc
    }, {})

    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [payments, chartDays])

  // ✅ CUSTOM TOOLTIP COMPONENT
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
          <p className="font-bold mb-1">{new Date(label).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</p>
          <p className="text-indigo-300">Revenue: ₹{payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  // ─── LOADING STATE ──────────────────────────
  if (isLoadingData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-3 border border-gray-100 z-10">
          <div className="relative w-14 h-14"><div className="absolute inset-0 rounded-full border-4 border-red-100"></div><div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin"></div><FaCar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 text-lg" /></div>
          <h3 className="text-lg font-bold text-gray-800">Loading Dashboard...</h3>
          <div className="flex items-center gap-1.5 mt-1"><div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div><div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div><div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div></div>
        </div>
      </div>
    )
  }

  // ─── ERROR STATE ────────────────────────────
  if (hasError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 relative overflow-hidden">
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-3 border border-red-100 z-10 max-w-sm w-full mx-4">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center"><FaExclamationTriangle className="text-red-500 text-xl" /></div>
          <div className="text-center"><h3 className="text-lg font-bold text-gray-800">Connection Failed</h3><p className="text-xs text-gray-500 mt-0.5">Unable to reach server.</p></div>
          <div className="w-full bg-red-50 border border-red-100 rounded-lg p-2.5"><p className="text-[11px] font-mono break-words text-red-700">{errorMessage}</p></div>
          <button onClick={refetchAll} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"><FaRedo /> Try Again</button>
        </div>
      </div>
    )
  }

  // ─── MAIN CONTENT ───────────────────────────
  return (
    <div className="space-y-6">
      {/* Exit Result Banner */}
      {exitResult && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4">
          <div><h3 className="text-lg font-semibold text-emerald-800">🚗 Vehicle Exited Successfully!</h3><p className="text-sm text-emerald-600 mt-1">The parking slot has been freed up</p></div>
          <div className="flex gap-8">
            <div className="text-center"><p className="text-xs text-emerald-500">Total Hours</p><p className="text-2xl font-bold text-emerald-800">{exitResult.totalHours} hrs</p></div>
            <div className="text-center"><p className="text-xs text-emerald-500">Amount</p><p className="text-2xl font-bold text-emerald-800">₹{exitResult.amount}</p></div>
          </div>
        </div>
      )}

      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Welcome back to Smart Parking Management System</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500 hover:shadow-md transition cursor-pointer" onClick={() => setActiveTab?.('vehicles')}>
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Total Vehicles</p><p className="text-3xl font-bold text-gray-800 mt-2">{vehicles.length}</p></div>
            <div className="bg-blue-100 p-3 rounded-xl"><FaCar className="text-blue-600 text-xl" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500 hover:shadow-md transition cursor-pointer" onClick={() => setActiveTab?.('slots')}>
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Total Slots</p><p className="text-3xl font-bold text-gray-800 mt-2">{slots.length}</p></div>
            <div className="bg-purple-100 p-3 rounded-xl"><FaParking className="text-purple-600 text-xl" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-emerald-500 hover:shadow-md transition cursor-pointer" onClick={() => setActiveTab?.('payments')}>
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Total Payments</p><p className="text-3xl font-bold text-gray-800 mt-2">{payments.length}</p></div>
            <div className="bg-emerald-100 p-3 rounded-xl"><FaRupeeSign className="text-emerald-600 text-xl" /></div>
          </div>
        </div>
      </div>

      {/* Main Layout: Table Left, Chart Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Active Bookings Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FaClock className="text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-800">Active Bookings</h3>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{activeBookings.length}</span>
              </div>
              <button onClick={() => setActiveTab?.('bookings')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
            </div>

            {activeBookings.length === 0 ? (
              <div className="text-center py-16">
                <FaCar className="text-4xl text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No active bookings right now</p>
                <p className="text-gray-300 text-sm mt-1">Vehicles currently parked will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle Number</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slot Number</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entry Time</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activeBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4"><span className="font-mono font-semibold text-sm bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md">{b.vehicleId?.vehicleNumber || '—'}</span></td>
                        <td className="px-6 py-4"><span className="text-sm text-gray-700 font-medium">{b.slotId?.slotNumber || '—'}</span></td>
                        <td className="px-6 py-4"><div><span className="text-sm font-semibold text-gray-800">{formatTime(b.entryTime)}</span><p className="text-[10px] text-gray-400">{formatDate(b.entryTime)}</p></div></td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleExitClick(b._id)} disabled={exitMutation.isPending} className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition font-medium shadow-sm disabled:opacity-50">
                            <FaSignOutAlt className="text-xs" /> Exit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ✅ RIGHT: Revenue Bar Chart */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Revenue Overview</h3>
              <select 
                value={chartDays} 
                onChange={(e) => setChartDays(Number(e.target.value))} 
                className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer bg-white"
              >
                <option value={7}>Last 7 days</option>
                <option value={15}>Last 15 days</option>
                <option value={30}>Last 1 month</option>
              </select>
            </div>

            {chartData.length === 0 ? (
              <div className="text-center py-12">
                <FaRupeeSign className="text-3xl text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No revenue data available</p>
              </div>
            ) : (
              // ✅ Increased height slightly to accommodate angled X-axis labels
              <div className="h-72"> 
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 9, fill: '#94a3b8' }} 
                      axisLine={{ stroke: '#e2e8f0' }} 
                      tickLine={false}
                      angle={-35}
                      textAnchor="end"
                      // ✅ Updated Formatter to show Day, Date, Month, Year
                      tickFormatter={(str) => {
                        const date = new Date(str);
                        const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
                        const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                        return `${dayName}, ${dateStr}`;
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#94a3b8' }} 
                      axisLine={{ stroke: '#e2e8f0' }} 
                      tickLine={false} 
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                    <Bar 
                      dataKey="amount" 
                      fill="#818cf8" 
                      radius={[4, 4, 0, 0]} 
                      isAnimationActive={true} 
                      animationDuration={800} 
                      animationEasing="ease-out" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ─── CUSTOM EXIT CONFIRMATION MODAL ────────────────────────── */}
      {exitModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><FaSignOutAlt className="text-white text-lg" /></div>
                <h3 className="text-lg font-bold text-white">Confirm Exit</h3>
              </div>
              <button onClick={cancelExit} className="text-white/70 hover:text-white transition p-1"><FaTimes className="text-lg" /></button>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4"><FaExclamationTriangle className="text-red-500 text-3xl" /></div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Do you want to exit this booking?</h4>
                <p className="text-sm text-gray-500 leading-relaxed">This action will mark the vehicle as exited, free up the parking slot, and generate the final payment receipt.</p>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={cancelExit} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition border border-gray-200">No</button>
              <button onClick={confirmExit} disabled={exitMutation.isPending} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {exitMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Exiting...
                  </>
                ) : (
                  <>
                    <FaSignOutAlt /> Yes, Exit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard