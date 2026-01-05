'use client'

import { RefreshCw } from 'lucide-react'
import { generateSupportingDocuments } from '@/lib/actions'
import { useState } from 'react'

export function GenerateDocsButton({ inspectionId }: { inspectionId: string }) {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      await generateSupportingDocuments(inspectionId)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate documents')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleGenerate} 
      className="btn btn-primary" 
      style={{ marginTop: '2rem', width: '100%' }}
      disabled={loading}
    >
      <RefreshCw size={20} className={loading ? 'spin' : ''} />
      {loading ? 'Generating...' : 'Generate All Supporting Documents'}
    </button>
  )
}
