import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import SlotManager from './components/SlotManager'
import VehicleManager from './components/VehicleManager'
import BookingManager from './components/BookingManager'
import PaymentManager from './components/PaymentManager'
import BookingTicket from './components/BookingTicket' // ✅ IMPORT
import { useQuery } from '@tanstack/react-query'
import { getAllPayments } from './api/paymentApi'
import { FaRupeeSign } from 'react-icons/fa'

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [admin, setAdmin] = useState(null)

  // ✅ CHECK FOR QR CODE TICKET PARAMETER IN URL
  const query = new URLSearchParams(window.location.search)
  const ticketId = query.get('ticket')

  useEffect(() => {
    const storedAdmin = localStorage.getItem('spms_admin')
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin))
      setIsLoggedIn(true)
    }
  }, [])

  const { data: paymentsRes } = useQuery({
    queryKey: ['payments'],
    queryFn: getAllPayments,
    enabled: isLoggedIn,
  })

  const todayRevenue = (paymentsRes?.data?.data || []).filter(p => new Date(p.paymentDate || p.paidAt || p.createdAt).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]).reduce((s, p) => s + (p.amount || 0), 0)

  const handleLogin = (adminData) => {
    localStorage.setItem('spms_admin', JSON.stringify(adminData))
    if (adminData.token) localStorage.setItem('spms_token', adminData.token)
    setAdmin(adminData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('spms_admin')
    localStorage.removeItem('spms_token')
    setAdmin(null)
    setIsLoggedIn(false)
    setActiveTab('dashboard')
  }

  // ✅ IF URL HAS ?ticket=ID, SHOW TICKET PAGE DIRECTLY (NO ADMIN PANEL)
  if (ticketId) {
    return <BookingTicket ticketId={ticketId} />
  }

  if (!isLoggedIn) return <Login onLogin={handleLogin} />

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />
      case 'slots': return <SlotManager />
      case 'vehicles': return <VehicleManager />
      case 'bookings': return <BookingManager />
      case 'payments': return <PaymentManager />
      default: return <Dashboard setActiveTab={setActiveTab} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} admin={admin} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-40">
          <h2 className="text-lg font-bold text-gray-800 capitalize">{activeTab}</h2>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">{admin?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
              <span className="font-medium text-gray-700 text-sm hidden sm:block">{admin?.name || 'Admin Manager'}</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full border border-emerald-200">
              <FaRupeeSign className="text-xs" />
              <span className="font-bold text-sm">₹{todayRevenue}.00</span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">{renderContent()}</div>
      </div>
    </div>
  )
}

export default App