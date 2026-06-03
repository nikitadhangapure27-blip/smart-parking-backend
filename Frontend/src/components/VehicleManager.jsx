import React, { useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import {
  FaCar, FaMotorcycle, FaTruck, FaPlus, FaSearch, FaEdit, FaTimes,
  FaUser, FaPhone, FaHashtag, FaExclamationTriangle, FaRedo
} from 'react-icons/fa'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addVehicle, getAllVehicles, updateVehicle } from '../api/vehicleApi'
import Pagination from './Pagination'

const VehicleManager = () => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({ vehicleNumber: '', ownerName: '', mobileNo: '', vehicleType: 'CAR' })
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getAllVehicles,
    retry: 2,
  })

  const vehicles = data?.data?.data || []

  const addMutation = useMutation({
    mutationFn: addVehicle,
    onSuccess: (res) => {
      if (res.data.success) { toast.success('Vehicle added!'); setFormData({ vehicleNumber: '', ownerName: '', mobileNo: '', vehicleType: 'CAR' }); queryClient.invalidateQueries({ queryKey: ['vehicles'] }) }
      else toast.error(res.data.message)
    },
    onError: (err) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateVehicle(id, data),
    onSuccess: (res) => {
      if (res.data.success) { toast.success('Vehicle updated!'); setEditingId(null); setFormData({ vehicleNumber: '', ownerName: '', mobileNo: '', vehicleType: 'CAR' }); queryClient.invalidateQueries({ queryKey: ['vehicles'] }) }
      else toast.error(res.data.message)
    },
    onError: (err) => toast.error(err.message),
  })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.vehicleNumber || !formData.ownerName || !formData.mobileNo) { toast.error('All fields required'); return }
    if (editingId) updateMutation.mutate({ id: editingId, data: formData })
    else addMutation.mutate(formData)
  }

  const handleEdit = (vehicle) => {
    setEditingId(vehicle._id)
    setFormData({ vehicleNumber: vehicle.vehicleNumber, ownerName: vehicle.ownerName, mobileNo: vehicle.mobileNo, vehicleType: vehicle.vehicleType })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => { setEditingId(null); setFormData({ vehicleNumber: '', ownerName: '', mobileNo: '', vehicleType: 'CAR' }) }

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles
    const term = searchTerm.toLowerCase()
    return vehicles.filter(v => v.vehicleNumber.toLowerCase().includes(term) || v.ownerName.toLowerCase().includes(term) || v.mobileNo.includes(term) || v.vehicleType.toLowerCase().includes(term))
  }, [vehicles, searchTerm])

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
  const currentVehicles = filteredVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getVehicleIcon = (type) => { switch (type) { case 'BIKE': return <FaMotorcycle className="text-green-500" />; case 'CAR': return <FaCar className="text-blue-500" />; case 'TRUCK': return <FaTruck className="text-orange-500" />; default: return <FaCar /> } }
  const getTypeBadge = (type) => { switch (type) { case 'BIKE': return 'bg-green-100 text-green-700'; case 'CAR': return 'bg-blue-100 text-blue-700'; case 'TRUCK': return 'bg-orange-100 text-orange-700'; default: return 'bg-gray-100 text-gray-700' } }
  const isMutating = addMutation.isPending || updateMutation.isPending

  // ─── CONDENSED LOADING STATE ──────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-3 border border-gray-100 z-10">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-red-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin"></div>
            <FaCar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 text-lg" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Fetching vehicles...</h3>
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
          {/* Icon */}
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
            <FaExclamationTriangle className="text-red-500 text-xl" />
          </div>

          {/* Text */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800">Connection Failed</h3>
            <p className="text-xs text-gray-500 mt-0.5">Unable to reach server. Backend may be offline.</p>
          </div>

          {/* Error Detail */}
          <div className="w-full bg-red-50 border border-red-100 rounded-lg p-2.5">
            <p className="text-[11px] font-mono break-words text-red-700">{error?.message || 'Network Error - Server Unreachable'}</p>
          </div>

          {/* Troubleshooting - Compact */}
          <div className="w-full bg-gray-50 rounded-lg p-2.5">
            <ul className="space-y-1">
              <li className="flex items-start gap-1.5 text-[11px] text-gray-500"><span className="text-red-400 mt-0.5">●</span> Check if backend is running on port 2705</li>
              <li className="flex items-start gap-1.5 text-[11px] text-gray-500"><span className="text-orange-400 mt-0.5">●</span> Verify database connection is active</li>
              <li className="flex items-start gap-1.5 text-[11px] text-gray-500"><span className="text-amber-400 mt-0.5">●</span> Check CORS settings on backend</li>
            </ul>
          </div>

          {/* Retry Button */}
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
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Manage Vehicles</h2>
            <p className="text-gray-500 text-sm mt-1">Add, view, and update vehicle records</p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden md:flex items-center gap-2">
              {['CAR', 'BIKE', 'TRUCK'].map((type) => {
                const count = vehicles.filter(v => v.vehicleType === type).length
                return <div key={type} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${getTypeBadge(type)}`}>{getVehicleIcon(type)}<span>{count}</span></div>
              })}
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-200">
              <FaCar className="text-sm" /><span className="font-bold text-sm">{vehicles.length}</span><span className="text-xs text-blue-500 hidden sm:inline">Total</span>
            </div>
            {isRefetching && <div className="flex items-center gap-1 text-xs text-gray-400"><FaRedo className="animate-spin text-xs" /><span>Sync...</span></div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT FORM */}
        <div className="lg:col-span-1">
          <div className={`bg-white rounded-xl shadow-sm p-6 sticky top-6 border-2 transition-colors ${editingId ? 'border-blue-300' : 'border-transparent'}`}>
            {editingId && (
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-100">
                <div className="flex items-center gap-2 text-blue-600"><FaEdit /><span className="font-bold text-sm">Editing Vehicle</span></div>
                <button onClick={handleCancelEdit} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600"><FaTimes className="text-sm" /></button>
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-800 mb-5">{editingId ? 'Update Details' : 'Add New Vehicle'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Vehicle Number</label>
                <div className="relative">
                  <FaHashtag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })} placeholder="e.g., MH25AS9986" className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium text-gray-700" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Owner Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="e.g., John Doe" className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium text-gray-700" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Mobile No</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" name="mobileNo" value={formData.mobileNo} onChange={handleChange} placeholder="e.g., 9876543210" className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium text-gray-700" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Vehicle Type</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">{getVehicleIcon(formData.vehicleType)}</div>
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-4 py-2.5 focus:ring-4 focus:ring-pink-100 focus:border-pink-400 outline-none transition text-sm font-medium text-gray-700 appearance-none cursor-pointer">
                    <option value="BIKE">BIKE</option><option value="CAR">CAR</option><option value="TRUCK">TRUCK</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isMutating} className={`flex-1 py-3 rounded-xl text-white font-extrabold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${editingId ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-pink-500 to-rose-500'}`}>
                  {isMutating ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{editingId ? 'Updating...' : 'Adding...'}</>) : (<>{editingId ? <FaEdit /> : <FaPlus />}{editingId ? 'Update Vehicle' : 'Add Vehicle'}</>)}
                </button>
                {editingId && <button type="button" onClick={handleCancelEdit} className="py-3 px-5 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2 border border-gray-200"><FaTimes /> Cancel</button>}
              </div>
            </form>
            
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-3">VEHICLE BREAKDOWN</p>
              <div className="space-y-2">
                {['CAR', 'BIKE', 'TRUCK'].map((type) => {
                  const count = vehicles.filter(v => v.vehicleType === type).length
                  const percentage = vehicles.length ? (count / vehicles.length) * 100 : 0
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 flex items-center gap-1.5">{getVehicleIcon(type)} {type}</span>
                        <span className="font-semibold text-gray-700">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all duration-500 ${type === 'CAR' ? 'bg-blue-400' : type === 'BIKE' ? 'bg-green-400' : 'bg-orange-400'}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT TABLE */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm min-h-[500px] overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700">All Vehicles</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filteredVehicles.length}</span>
              </div>
              <div className="relative">
                <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
                <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} placeholder="Search number, name, phone..." className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-56" />
              </div>
            </div>

            {currentVehicles.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><FaCar className="text-3xl text-gray-300" /></div>
                <p className="text-gray-400 text-lg font-medium">No vehicles found</p>
                <p className="text-gray-300 text-sm mt-1">{searchTerm ? 'Try a different search term' : 'Add your first vehicle using the form'}</p>
                {searchTerm && <button onClick={() => setSearchTerm('')} className="mt-4 text-sm text-blue-500 hover:text-blue-700 font-medium">Clear search</button>}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/80">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle No</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {currentVehicles.map((v) => (
                        <tr key={v._id} className={`hover:bg-gray-50/50 transition ${editingId === v._id ? 'bg-blue-50/50 ring-1 ring-blue-200' : ''}`}>
                          <td className="px-6 py-4"><span className="font-mono font-semibold text-sm bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md">{v.vehicleNumber}</span></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">{v.ownerName?.charAt(0)?.toUpperCase() || '?'}</div>
                              <span className="text-sm text-gray-700 font-medium">{v.ownerName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className="text-sm text-gray-600 font-mono">{v.mobileNo}</span></td>
                          <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTypeBadge(v.vehicleType)}`}>{getVehicleIcon(v.vehicleType)} {v.vehicleType}</span></td>
                          <td className="px-6 py-4">
                            <button onClick={() => handleEdit(v)} disabled={isMutating} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-100 transition font-medium disabled:opacity-50"><FaEdit className="text-xs" /> Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredVehicles.length)} of {filteredVehicles.length}</p>
                  {searchTerm && <button onClick={() => { setSearchTerm(''); setCurrentPage(1) }} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"><FaTimes /> Clear</button>}
                </div>
                <div className="px-6"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehicleManager