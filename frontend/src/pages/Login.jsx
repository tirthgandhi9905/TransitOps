import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { toast } from '../hooks/useToast'
import useAuth from '../hooks/useAuth'

function TransitOpsLogoFull() {
  return (
    <div className="flex items-center gap-3">
      {/* Logo mark */}
      <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="13" stroke="#7C2D84" strokeWidth="3"/>
        <circle cx="16" cy="16" r="4.5" fill="#7C2D84"/>
        <rect x="11.5" y="28" width="9" height="2.5" rx="1.25" fill="#7C2D84" opacity="0.35"/>
      </svg>
      {/* Wordmark */}
      <span
        className="font-bold text-gray-900 select-none"
        style={{ fontSize: '22px', letterSpacing: '-0.015em' }}
      >
        transit<span className="text-brand-600">Ops</span>
      </span>
    </div>
  )
}

const DEMO_ACCOUNTS = [
  { role: 'Admin',             email: 'admin@transitops.com'    },
  { role: 'Fleet Manager',     email: 'fleet@transitops.com'    },
  { role: 'Dispatcher',        email: 'dispatch@transitops.com' },
  { role: 'Safety Officer',    email: 'safety@transitops.com'   },
  { role: 'Financial Analyst', email: 'finance@transitops.com'  },
]

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const { loginUser }           = useAuth()
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
      if (res.success) {
        loginUser(res.data.user, res.data.token)
        navigate('/dashboard')
      } else {
        setError(res.error?.message || 'Login failed')
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail)
    setPassword('password123')
    setError('')
  }

  return (
    <div className="min-h-screen bg-surface-page flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-brand-600 p-12 flex-shrink-0">
        <div>
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,0.9)" strokeWidth="3"/>
            <circle cx="16" cy="16" r="4.5" fill="white"/>
            <rect x="11.5" y="28" width="9" height="2.5" rx="1.25" fill="rgba(255,255,255,0.4)"/>
          </svg>
          <span className="block mt-3 text-white font-bold text-2xl tracking-tight">transitOps</span>
          <p className="mt-2 text-brand-200 text-sm">Smart Transport Operations Platform</p>
        </div>

        <div className="space-y-6">
          {[
            { title: 'Real-time Fleet Visibility', body: 'Track vehicle status, active trips, and driver availability across your entire fleet.' },
            { title: 'Automated Status Transitions', body: 'Dispatch, complete, or cancel trips — vehicle and driver statuses update automatically.' },
            { title: 'Actionable Analytics', body: 'Monitor fuel efficiency, ROI, and maintenance costs with built-in reports and exports.' },
          ].map(f => (
            <div key={f.title} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-300 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold">{f.title}</p>
                <p className="text-brand-200 text-xs mt-0.5 leading-relaxed">{f.body}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-brand-300 text-xs">© 2024 TransitOps. Built for hackathon.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <TransitOpsLogoFull />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Sign in</h2>
          <p className="text-gray-500 text-sm mt-1 mb-7">Enter your credentials to access the platform</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@transitops.com"
                className="w-full bg-white border border-surface-border rounded-xl px-4 py-3 text-sm
                  text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                  transition-shadow shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full bg-white border border-surface-border rounded-xl px-4 py-3 text-sm
                  text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                  transition-shadow shadow-sm"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800
                disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm
                transition-colors shadow-sm mt-1"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 pt-6 border-t border-surface-border">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Demo accounts</p>
            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map(d => (
                <button
                  key={d.email}
                  onClick={() => fillDemo(d.email)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-brand-50 transition-colors
                    group flex items-center justify-between"
                >
                  <span className="text-xs font-medium text-gray-700 group-hover:text-brand-700">
                    {d.role}
                  </span>
                  <span className="text-xs text-gray-400 font-mono group-hover:text-brand-500">
                    {d.email.split('@')[0]}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">All accounts use password: <span className="font-mono">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}