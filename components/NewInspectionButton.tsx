'use client'

import { Plus } from 'lucide-react'
import { createInspection } from '@/lib/actions'
import { useState } from 'react'

export function NewInspectionButton({ balloonSerialNumber }: { balloonSerialNumber: string }) {
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!confirm('Balloon data verified – no changes?')) return
    
    setLoading(true)
    try {
      await createInspection(balloonSerialNumber)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create inspection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleCreate} 
      className="btn btn-primary" 
      disabled={loading}
    >
      <Plus size={20} />
      {loading ? 'Starting...' : 'Start New Inspection'}
    </button>
  )
}
