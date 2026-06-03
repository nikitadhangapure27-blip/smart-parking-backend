// src/components/Login.jsx
import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useMutation } from '@tanstack/react-query'
import { loginAdmin, registerAdmin } from '../api/authApi'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSetup, setIsSetup] = useState(false)
  const [setupName, setSetupName] = useState('')
  const [setupUsername, setSetupUsername] = useState('')

  const mutation = useMutation({
    mutationFn: (values) => (isSetup ? registerAdmin(values) : loginAdmin(values)),
    onSuccess: (res) => {
      if (res.data.success) {
        toast.success(isSetup ? 'Account created!' : 'Login successful!')
        onLogin(res.data.data)
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSetup) {
      mutation.mutate({ name: setupName, username: setupUsername, email, password })
    } else {
      mutation.mutate({ email, password })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-violet-100">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-24 flex items-center justify-center">
              <svg viewBox="0 0 24 36" className="w-full h-full text-violet-500 drop-shadow-md">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0zm0 18c-3.313 0-6-2.687-6-6s2.687-6 6-6 6 2.687 6 6-2.687 6-6 6z" fill="currentColor"/>
              </svg>
              <div className="absolute top-5 w-8 h-8 flex items-center justify-center text-xl">🚗</div>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-1">
            {isSetup ? 'Admin Setup !!' : 'Admin Login !!'}
          </h2>
          <p className="text-gray-500 text-sm text-center mb-6">
            {isSetup ? 'Create your admin account' : 'Enter your credentials to login.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSetup && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Full Name</label>
                  <input type="text" value={setupName} onChange={(e) => setSetupName(e.target.value)} placeholder="Admin Manager" required className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Username</label>
                  <input type="text" value={setupUsername} onChange={(e) => setSetupUsername(e.target.value)} placeholder="admin" required className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm" />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@spms.com" required className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-4 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={mutation.isPending} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-extrabold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 cursor-pointer">
              {mutation.isPending ? 'Please wait...' : isSetup ? 'Create Account' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsSetup(!isSetup)} className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              {isSetup ? 'Already have an account? Login' : "Don't have an account? Setup"}
            </button>
          </div>
        </div>
        {!isSetup && <p className="text-center text-xs text-gray-400 mt-6">Default: admin@spms.com / default123</p>}
      </div>
    </div>
  )
}