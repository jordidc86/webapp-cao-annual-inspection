import { prisma } from '@/lib/prisma'
import { Plus, Search, Plane } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BalloonListPage() {
  let balloons: any[] = []
  try {
    balloons = await prisma.balloon.findMany({
      orderBy: { registration: 'asc' }
    })
  } catch (e) {
    console.error('Database connection failed during build or runtime:', e)
  }

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Fleet Management</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Select a balloon to start or manage an annual inspection.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={20} />
          Register New Balloon
        </button>
      </div>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
          <input 
            type="text" 
            placeholder="Search by registration, manufacturer, or serial number..." 
            style={{ 
              width: '100%', 
              padding: '0.75rem 1rem 0.75rem 3rem', 
              borderRadius: 'var(--radius)', 
              border: '1px solid var(--border)',
              background: 'var(--background)'
            }} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {balloons.map((balloon) => (
          <div key={balloon.serialNumber} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div className="glass" style={{ padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--primary)' }}>
                <Plane size={24} />
              </div>
              <span className="badge" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                {balloon.status}
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{balloon.registration}</h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
              SN: {balloon.serialNumber}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Manufacturer</span>
                <span style={{ fontWeight: 600 }}>{balloon.manufacturer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Model</span>
                <span style={{ fontWeight: 600 }}>{balloon.model}</span>
              </div>
              <a href={`/balloons/${balloon.serialNumber}`} className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
                View Inspections
              </a>
            </div>
          </div>
        ))}

        {balloons.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>
            <p>No balloons found. Please register your first balloon OR run the seed script.</p>
          </div>
        )}
      </div>
    </div>
  )
}
