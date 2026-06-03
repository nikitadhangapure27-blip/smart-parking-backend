import React from 'react'
import { FaThLarge, FaParking, FaCar, FaBookOpen, FaRupeeSign, FaSignOutAlt } from 'react-icons/fa'

const Sidebar = ({ activeTab, setActiveTab, admin, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaThLarge },
    { id: 'slots', label: 'Slots', icon: FaParking },
    { id: 'vehicles', label: 'Vehicles', icon: FaCar },
    { id: 'bookings', label: 'Bookings', icon: FaBookOpen },
    { id: 'payments', label: 'Payments', icon: FaRupeeSign },
  ]

  return (
    <div className="w-64 bg-gradient-to-b from-violet-800 to-purple-900 text-white flex flex-col shrink-0 h-screen">
      {/* Logo */}
      {/* Logo */}
<div className="p-6 border-b border-violet-700/50">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/30">
      <FaParking className="text-violet-700 text-xl" />
    </div>
    <div>
      <h1 className="text-2xl font-bold tracking-wide">SPMS</h1>
      <p className="text-xs text-violet-300 mt-0.5">Smart Parking</p>
    </div>
  </div>
</div> 

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-white/20 text-white shadow-lg shadow-purple-900/30'
                  : 'text-violet-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="text-lg" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-violet-700/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-200 transition text-sm font-medium"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar