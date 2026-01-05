import { prisma } from '@/lib/prisma'
import { ArrowLeft, FileText, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NewInspectionButton } from '@/components/NewInspectionButton'

export default async function BalloonDetailPage({
  params
}: {
  params: { serialNumber: string }
}) {
  const balloon = await prisma.balloon.findUnique({
    where: { serialNumber: params.serialNumber },
    include: {
      inspections: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!balloon) {
    notFound()
  }

  const activeInspection = balloon.inspections.find(i => i.status !== 'CLOSED')

  return (
    <div className="container fade-in">
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--muted-foreground)' }}>
        <ArrowLeft size={16} />
        Back to Fleet
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{balloon.registration}</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--muted-foreground)' }}>
            {balloon.manufacturer} {balloon.model} — SN: {balloon.serialNumber}
          </p>
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', alignSelf: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Current Operator</span>
            <span style={{ fontWeight: 600 }}>{balloon.operator}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Status</span>
            <span className="badge" style={{ backgroundColor: 'var(--success)', color: 'white' }}>{balloon.status}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Annual Inspections</h2>
        {!activeInspection && (
          <NewInspectionButton balloonSerialNumber={balloon.serialNumber} />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {balloon.inspections.length > 0 ? (
          balloon.inspections.map((inspection) => (
            <div key={inspection.id} className="card" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: '2rem' }}>
              <div className="glass" style={{ padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--primary)' }}>
                <FileText size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                  Annual Inspection {inspection.inspectionDate ? new Date(inspection.inspectionDate).getFullYear() : ''}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} />
                    {inspection.inspectionDate ? new Date(inspection.inspectionDate).toLocaleDateString() : 'Date TBD'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} />
                    Created {new Date(inspection.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                <span className={`badge ${inspection.status === 'CLOSED' ? '' : 'fade-in'}`} style={{ 
                  backgroundColor: inspection.status === 'CLOSED' ? 'var(--muted)' : 'var(--warning)',
                  color: inspection.status === 'CLOSED' ? 'var(--muted-foreground)' : 'white'
                }}>
                  {inspection.status.replace('_', ' ')}
                </span>
              </div>
              <Link href={`/inspections/${inspection.id}`} className="btn" style={{ border: '1px solid var(--border)' }}>
                View Details
              </Link>
            </div>
          ))
        ) : (
          <div className="glass" style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)', borderRadius: 'var(--radius)' }}>
            <p>No inspection history found for this balloon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
