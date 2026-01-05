'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock authentication for single user
    if (password === 'cao2026') {
      document.cookie = 'cao_session=internal_user; path=/; max-age=86400'
      window.location.href = '/'
    } else {
      alert('Invalid credentials')
    }
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--background)'
    }}>
      <div className="glass fade-in" style={{ padding: '3rem', borderRadius: 'var(--radius)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary)' }}>CAO APP Access</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Internal Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: 'var(--radius)', 
                border: '1px solid var(--border)',
                background: 'var(--background)'
              }}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
        </form>
        <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>
          Aviation Maintenance Compliance Portal
        </p>
      </div>
    </div>
  )
}
