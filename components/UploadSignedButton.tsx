'use client'

import { Upload } from 'lucide-react'
import { useState } from 'react'

export function UploadSignedButton({ 
  inspectionId, 
  documentType, 
  onUpload 
}: { 
  inspectionId: string, 
  documentType: string,
  onUpload: (type: string) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    // Simple mock: we'll just trigger the server action
    // In a real app, we'd take a file from an <input>
    setLoading(true)
    try {
      await onUpload(documentType)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleUpload} 
      className="btn" 
      style={{ background: 'white', border: '1px solid var(--border)', padding: '0.5rem' }} 
      title="Upload Signed"
      disabled={loading}
    >
      <Upload size={16} className={loading ? 'spin' : ''} />
    </button>
  )
}
