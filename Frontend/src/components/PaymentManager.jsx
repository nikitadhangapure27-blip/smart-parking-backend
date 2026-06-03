import React, { useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import {
  FaRupeeSign, FaSearch, FaSync, FaMoneyBillWave, FaCreditCard, FaMobileAlt,
  FaEye, FaTimes, FaCalendarAlt, FaChartBar, FaArrowUp, FaArrowDown, FaMinus,
  FaExclamationTriangle, FaRedo, FaClock, FaCar
} from 'react-icons/fa'
import { useQuery } from '@tanstack/react-query'
import { getAllPayments } from '../api/paymentApi'
import Pagination from './Pagination'

const PaymentManager = () => {
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('ALL')
  const [entryDate, setEntryDate] = useState('')
  const [exitDate, setExitDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [detailModal, setDetailModal] = useState(null)
  const [sortField, setSortField] = useState('paymentDate')
  const [sortOrder, setSortOrder] = useState('desc')
  const itemsPerPage = 8

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['payments'],
    queryFn: getAllPayments,
  })

  const payments = data?.data?.data || []

  const calculateRevenue = (data) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1)
    const todayP = data.filter((p) => new Date(p.paymentDate || p.paidAt || p.createdAt) >= today)
    const weekP = data.filter((p) => new Date(p.paymentDate || p.paidAt || p.createdAt) >= weekAgo)
    const monthP = data.filter((p) => new Date(p.paymentDate || p.paidAt || p.createdAt) >= monthAgo)
    return {
      today: todayP.reduce((s, p) => s + (p.amount || 0), 0), todayCount: todayP.length,
      thisWeek: weekP.reduce((s, p) => s + (p.amount || 0), 0), weekCount: weekP.length,
      thisMonth: monthP.reduce((s, p) => s + (p.amount || 0), 0), monthCount: monthP.length,
      total: data.reduce((s, p) => s + (p.amount || 0), 0), totalCount: data.length,
    }
  }

  const revenueData = useMemo(() => calculateRevenue(payments), [payments])

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortOrder('desc') }
  }

  const getMethodIcon = (method) => {
    switch (method) { case 'UPI': return <FaMobileAlt className="text-purple-500" />; case 'CARD': return <FaCreditCard className="text-blue-500" />; case 'CASH': return <FaMoneyBillWave className="text-green-500" />; default: return <FaRupeeSign /> }
  }
  const getMethodBadge = (method) => {
    const styles = { UPI: 'bg-purple-100 text-purple-700', CARD: 'bg-blue-100 text-blue-700', CASH: 'bg-green-100 text-green-700' }
    return styles[method] || 'bg-gray-100 text-gray-700'
  }

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Method Filter
      if (methodFilter !== 'ALL' && (p.paymentMethod || p.method) !== methodFilter) return false
      
      // Vehicle Search
      if (vehicleSearch) {
        const term = vehicleSearch.toLowerCase()
        const vn = (p.bookingId?.vehicleId?.vehicleNumber || '').toLowerCase()
        if (!vn.includes(term)) return false
      }
      
      // Date Filters
      const bEntryTime = p.bookingId?.entryTime ? new Date(p.bookingId.entryTime).toISOString().split('T')[0] : null
      const bExitTime = p.bookingId?.exitTime ? new Date(p.bookingId.exitTime).toISOString().split('T')[0] : null
      
      if (entryDate) {
        if (!bEntryTime || bEntryTime < entryDate) return false
      }
      if (exitDate) {
        if (!bExitTime || bExitTime > exitDate) return false
      }

      return true
    }).sort((a, b) => {
      let valA, valB
      if (sortField === 'amount') { valA = a.amount || 0; valB = b.amount || 0 }
      else if (sortField === 'paymentDate') { valA = new Date(a.paymentDate || a.paidAt || a.createdAt); valB = new Date(b.paymentDate || b.paidAt || b.createdAt) }
      else if (sortField === 'method') { valA = (a.paymentMethod || a.method || '').toLowerCase(); valB = (b.paymentMethod || b.method || '').toLowerCase() }
      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
    })
  }, [payments, methodFilter, vehicleSearch, entryDate, exitDate, sortField, sortOrder])

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentPayments = filteredPayments.slice(indexOfFirst, indexOfLast)

  const chartData = useMemo(() => {
    const days = []; const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now); date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' })
      const dayTotal = payments.filter((p) => new Date(p.paymentDate || p.paidAt || p.createdAt).toISOString().split('T')[0] === dateStr).reduce((s, p) => s + (p.amount || 0), 0)
      days.push({ label: dayLabel, amount: dayTotal })
    }
    return days
  }, [payments])
  const maxRevenue = Math.max(...chartData.map((d) => d.amount), 1)

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <FaMinus className="text-gray-300 text-xs ml-1" />
    return sortOrder === 'asc' ? <FaArrowUp className="text-blue-500 text-xs ml-1" /> : <FaArrowDown className="text-blue-500 text-xs ml-1" />
  }

  const clearFilters = () => {
    setMethodFilter('ALL'); setEntryDate(''); setExitDate(''); setVehicleSearch(''); setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-3 border border-gray-100 z-10">
          <div className="relative w-14 h-14"><div className="absolute inset-0 rounded-full border-4 border-red-100"></div><div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin"></div><FaRupeeSign className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 text-lg" /></div>
          <h3 className="text-lg font-bold text-gray-800">Fetching payments...</h3>
          <div className="flex items-center gap-1.5 mt-1"><div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div><div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div><div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div></div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 relative overflow-hidden">
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-3 border border-red-100 z-10 max-w-sm w-full mx-4">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center"><FaExclamationTriangle className="text-red-500 text-xl" /></div>
          <div className="text-center"><h3 className="text-lg font-bold text-gray-800">Connection Failed</h3><p className="text-xs text-gray-500 mt-0.5">Unable to reach server.</p></div>
          <div className="w-full bg-red-50 border border-red-100 rounded-lg p-2.5"><p className="text-[11px] font-mono break-words text-red-700">{error?.message}</p></div>
          <button onClick={() => refetch()} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"><FaRedo /> Try Again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-800">Payments</h2><p className="text-gray-500">Track all parking payments and revenue</p></div>
        <button onClick={() => refetch()} disabled={isRefetching} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition font-medium"><FaSync className={isRefetching ? 'animate-spin' : ''} /> Refresh</button>
      </div>

      {/* ✅ Top Filter Bar: Date Left, Vehicle Middle, Method Right */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex items-end justify-between flex-wrap gap-4">
          
          {/* Left Side: Date Filters */}
          <div className="flex items-end gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5">Entry Date</label>
              <input 
                type="date" 
                value={entryDate} 
                onChange={(e) => { setEntryDate(e.target.value); setCurrentPage(1) }} 
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5">Exit Date</label>
              <input 
                type="date" 
                value={exitDate} 
                onChange={(e) => { setExitDate(e.target.value); setCurrentPage(1) }} 
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" 
              />
            </div>
          </div>

          {/* Middle: Vehicle Number Search */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5">Vehicle No</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
              <input 
                type="text" 
                value={vehicleSearch} 
                onChange={(e) => { setVehicleSearch(e.target.value); setCurrentPage(1) }} 
                placeholder="e.g., MH25AS9986" 
                className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-52" 
              />
            </div>
          </div>

          {/* Right Side: Payment Method Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5">Payment Method</label>
            <select 
              value={methodFilter} 
              onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1) }} 
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer bg-white w-40"
            >
              <option value="ALL">All Methods</option>
              <option value="CASH">CASH</option>
              <option value="UPI">UPI</option>
              <option value="CARD">CARD</option>
            </select>
          </div>
        </div>
        
        {/* Active Filters Badges */}
        {(methodFilter !== 'ALL' || entryDate || exitDate || vehicleSearch) && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 flex-wrap">
            <span className="text-xs text-gray-500">Active filters:</span>
            {methodFilter !== 'ALL' && (<span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Method: {methodFilter}<button onClick={() => { setMethodFilter('ALL'); setCurrentPage(1) }} className="hover:text-blue-900"><FaTimes className="text-xs" /></button></span>)}
            {entryDate && (<span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Entry: {entryDate}<button onClick={() => { setEntryDate(''); setCurrentPage(1) }} className="hover:text-purple-900"><FaTimes className="text-xs" /></button></span>)}
            {exitDate && (<span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Exit: {exitDate}<button onClick={() => { setExitDate(''); setCurrentPage(1) }} className="hover:text-orange-900"><FaTimes className="text-xs" /></button></span>)}
            {vehicleSearch && (<span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Vehicle: "{vehicleSearch}"<button onClick={() => { setVehicleSearch(''); setCurrentPage(1) }} className="hover:text-amber-900"><FaTimes className="text-xs" /></button></span>)}
            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium ml-2">Clear All</button>
          </div>
        )}
      </div>

      {/* Main Layout: List on Left, Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Payment List Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm min-h-[600px] overflow-hidden border border-gray-100">
            
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Payment Records <span className="text-xs text-gray-400">({filteredPayments.length})</span></h3>
            </div>

            {/* Table */}
            {currentPayments.length === 0 ? (
              <div className="text-center py-20"><FaRupeeSign className="text-4xl text-gray-300 mx-auto mb-4" /><p className="text-gray-500 text-lg">No payments found</p></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Vehicle Number</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total Hours</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-blue-600 select-none" onClick={() => handleSort('amount')}><span className="inline-flex items-center">Amount <SortIcon field="amount" /></span></th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-blue-600 select-none" onClick={() => handleSort('paymentDate')}><span className="inline-flex items-center">Date & Time <SortIcon field="paymentDate" /></span></th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-blue-600 select-none" onClick={() => handleSort('method')}><span className="inline-flex items-center">Method <SortIcon field="method" /></span></th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentPayments.map((payment) => {
                        const method = payment.paymentMethod || payment.method || 'UPI'
                        const payDate = new Date(payment.paymentDate || payment.paidAt || payment.createdAt)
                        const vehicleNumber = payment.bookingId?.vehicleId?.vehicleNumber || '—'
                        const totalHours = payment.bookingId?.totalHours || '—'
                        return (
                          <tr key={payment._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3"><span className="font-mono font-semibold text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-md">{vehicleNumber}</span></td>
                            <td className="px-4 py-3"><div className="flex items-center gap-1 text-sm text-gray-700"><FaClock className="text-gray-400 text-xs" />{totalHours} hrs</div></td>
                            <td className="px-4 py-3"><span className="text-lg font-bold text-gray-800">₹{payment.amount}</span></td>
                            <td className="px-4 py-3"><div><p className="font-medium text-gray-700 text-sm">{payDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p><p className="text-xs text-gray-400">{payDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p></div></td>
                            <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getMethodBadge(method)}`}>{getMethodIcon(method)}{method}</span></td>
                            <td className="px-4 py-3"><button onClick={() => setDetailModal(payment)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"><FaEye /> View</button></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-500">Showing {indexOfFirst + 1}-{Math.min(indexOfLast, filteredPayments.length)} of {filteredPayments.length}</p>
                  <p className="text-sm font-semibold text-gray-700">Total: ₹{filteredPayments.reduce((s, p) => s + (p.amount || 0), 0)}</p>
                </div>
                <div className="px-6"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Details & Charts */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Revenue Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-emerald-500"><p className="text-xs text-gray-500 font-medium">Today</p><p className="text-xl font-bold text-gray-800 mt-1">₹{revenueData.today}</p><p className="text-[10px] text-gray-400 mt-0.5">{revenueData.todayCount} payment{revenueData.todayCount !== 1 ? 's' : ''}</p></div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500"><p className="text-xs text-gray-500 font-medium">This Week</p><p className="text-xl font-bold text-gray-800 mt-1">₹{revenueData.thisWeek}</p><p className="text-[10px] text-gray-400 mt-0.5">{revenueData.weekCount} payment{revenueData.weekCount !== 1 ? 's' : ''}</p></div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500"><p className="text-xs text-gray-500 font-medium">This Month</p><p className="text-xl font-bold text-gray-800 mt-1">₹{revenueData.thisMonth}</p><p className="text-[10px] text-gray-400 mt-0.5">{revenueData.monthCount} payment{revenueData.monthCount !== 1 ? 's' : ''}</p></div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-500"><p className="text-xs text-gray-500 font-medium">Total</p><p className="text-xl font-bold text-gray-800 mt-1">₹{revenueData.total}</p><p className="text-[10px] text-gray-400 mt-0.5">{revenueData.totalCount} payment{revenueData.totalCount !== 1 ? 's' : ''}</p></div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaChartBar className="text-blue-500" /> Last 7 Days</h3>
            <div className="flex items-end gap-2 h-32">
              {chartData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-[9px] font-semibold text-gray-700 mb-1">{day.amount > 0 ? `₹${day.amount}` : ''}</span>
                  <div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-500 min-h-[3px]" style={{ height: `${Math.max((day.amount / maxRevenue) * 100, 3)}px` }}></div>
                  <span className="text-[9px] text-gray-500 mt-1 font-medium">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Payment Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center justify-between"><div><h3 className="text-xl font-bold">Payment Details</h3><p className="text-blue-200 text-sm mt-1">Transaction #{detailModal._id?.slice(-8).toUpperCase()}</p></div><button onClick={() => setDetailModal(null)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"><FaTimes /></button></div>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center py-4 bg-blue-50 rounded-xl"><p className="text-sm text-blue-600 font-medium">Amount Paid</p><p className="text-4xl font-bold text-blue-800 mt-1">₹{detailModal.amount}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Payment Method</p><p className="font-semibold text-gray-800 flex items-center gap-2 mt-1">{getMethodIcon(detailModal.paymentMethod || detailModal.method)}{detailModal.paymentMethod || detailModal.method || 'N/A'}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Status</p><p className="font-semibold mt-1"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">{detailModal.status || 'COMPLETED'}</span></p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Payment Date</p><p className="font-semibold text-gray-800 text-sm mt-1">{new Date(detailModal.paymentDate || detailModal.paidAt || detailModal.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Booking ID</p><p className="font-mono text-xs text-gray-800 mt-1 break-all">{detailModal.bookingId?._id || detailModal.bookingId || 'N/A'}</p></div>
              </div>
              {detailModal.bookingId && typeof detailModal.bookingId === 'object' && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Booking Info</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {detailModal.bookingId.vehicleId && (<div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Vehicle</p><p className="font-semibold text-gray-800 text-sm mt-1">{typeof detailModal.bookingId.vehicleId === 'object' ? detailModal.bookingId.vehicleId.vehicleNumber : detailModal.bookingId.vehicleId}</p></div>)}
                    {detailModal.bookingId.slotId && (<div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Slot</p><p className="font-semibold text-gray-800 text-sm mt-1">{typeof detailModal.bookingId.slotId === 'object' ? detailModal.bookingId.slotId.slotNumber : detailModal.bookingId.slotId}</p></div>)}
                    {detailModal.bookingId.entryTime && (<div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Entry Time</p><p className="font-semibold text-gray-800 text-sm mt-1">{new Date(detailModal.bookingId.entryTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p></div>)}
                    {detailModal.bookingId.exitTime && (<div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Exit Time</p><p className="font-semibold text-gray-800 text-sm mt-1">{new Date(detailModal.bookingId.exitTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p></div>)}
                    {detailModal.bookingId.totalHours && (<div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Total Hours</p><p className="font-semibold text-gray-800 text-sm mt-1">{detailModal.bookingId.totalHours} hrs</p></div>)}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200"><button onClick={() => setDetailModal(null)} className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">Close</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentManager