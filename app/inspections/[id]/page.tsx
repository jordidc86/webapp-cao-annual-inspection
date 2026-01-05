import { prisma } from '@/lib/prisma'
import { ArrowLeft, FileCheck, FileWarning, Upload, Download, Lock, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GenerateDocsButton } from '@/components/GenerateDocsButton'
import { markAsSigned, finalizeInspection, generateSupportingDocuments, uploadWorkOrder } from '@/lib/actions'
import { UploadSignedButton } from '@/components/UploadSignedButton'

export const dynamic = 'force-dynamic'

export default async function InspectionDetailPage({
  params
}: {
  params: { id: string }
}) {
  let inspection: any = null
  try {
    inspection = await prisma.annualInspection.findUnique({
      where: { id: params.id },
      include: {
        balloon: true,
        documents: {
          orderBy: { documentType: 'asc' }
        }
      }
    })
  } catch (e) {
    console.error('Database connection failed:', e)
  }

  if (!inspection) {
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
       return <div className="container">Database not connected.</div>
    }
    notFound()
  }

  const isClosed = inspection.status === 'CLOSED'
  const supportingTypes = ['TR', 'DR', 'DDL', 'ML']
  const canIssueCRS = supportingTypes.every((type: any) => 
    inspection.documents.find((d: any) => d.documentType === type && d.status === 'SIGNED')
  )

  const handleMarkSigned = async (type: string) => {
    'use server'
    await markAsSigned(params.id, type as any)
  }

  const handleFinalize = async () => {
    'use server'
    await finalizeInspection(params.id)
  }

  const handleMockUploadWO = async () => {
    'use server'
    await uploadWorkOrder(params.id, '/uploads/work-order-signed.pdf')
  }

  return (
    <div className="container fade-in">
      <Link href={`/balloons/${inspection.balloonSerialNumber}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--muted-foreground)' }}>
        <ArrowLeft size={16} />
        Back to Balloon
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Annual Inspection Workflow</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className="badge" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>{inspection.status.replace('_', ' ')}</span>
            <span style={{ color: 'var(--muted-foreground)' }}>Balloon: {inspection.balloon.registration} ({inspection.balloon.serialNumber})</span>
          </div>
        </div>
        {isClosed && (
          <div className="glass" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius)', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} />
            Inspection Closed & Archived
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Step 1: Work Order */}
          <section className="card" style={{ opacity: isClosed ? 0.7 : 1 }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge" style={{ backgroundColor: inspection.workOrderFile ? 'var(--success)' : 'var(--primary)', color: 'white', width: '24px', height: '24px', padding: 0, justifyContent: 'center' }}>1</span>
              Work Order (WO)
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: 'var(--muted-foreground)' }}>
                {inspection.workOrderFile ? 'Work Order uploaded and verified.' : 'Please upload the signed Work Order to proceed.'}
              </p>
              {inspection.workOrderFile ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href={inspection.workOrderFile} download className="btn" style={{ border: '1px solid var(--border)' }}><Download size={18} /></a>
                </div>
              ) : (
                <form action={handleMockUploadWO}>
                  <button className="btn btn-primary" disabled={isClosed}>
                    <Upload size={18} />
                    Upload WO (Mock)
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Step 2: Supporting Documents */}
          <section className="card" style={{ opacity: isClosed ? 0.7 : 1 }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge" style={{ backgroundColor: inspection.status !== 'DRAFT' ? 'var(--success)' : 'var(--primary)', color: 'white', width: '24px', height: '24px', padding: 0, justifyContent: 'center' }}>2</span>
              Technical Documents
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {supportingTypes.map(type => {
                const doc = inspection.documents.find(d => d.documentType === type)
                return (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--muted)', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {doc?.status === 'SIGNED' ? <FileCheck color="var(--success)" /> : <FileWarning color="var(--warning)" />}
                      <div>
                        <div style={{ fontWeight: 600 }}>{type} - {type === 'TR' ? 'Task Report' : type === 'DR' ? 'Defects Report' : type === 'DDL' ? 'Deferred Defects' : 'Modifications List'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                          {doc ? `Status: ${doc.status}` : 'Not generated'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {doc ? (
                        <>
                          <a href={doc.filePath || '#'} download className="btn" style={{ background: 'white', border: '1px solid var(--border)', padding: '0.5rem' }} title="Download"><Download size={16} /></a>
                          {doc.status !== 'SIGNED' && !isClosed && (
                            <UploadSignedButton inspectionId={params.id} documentType={type} onUpload={handleMarkSigned} />
                          )}
                        </>
                      ) : (
                        null
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {inspection.status === 'DRAFT' && inspection.workOrderFile && (
              <GenerateDocsButton inspectionId={inspection.id} />
            )}
          </section>

          {/* Step 3: CRS */}
          <section className="card" style={{ border: canIssueCRS ? '2px solid var(--primary)' : '1px solid var(--border)', opacity: isClosed ? 0.7 : 1 }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge" style={{ backgroundColor: inspection.status === 'CRS_ISSUED' || isClosed ? 'var(--success)' : 'var(--primary)', color: 'white', width: '24px', height: '24px', padding: 0, justifyContent: 'center' }}>3</span>
              Certificate of Release to Service (CRS)
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: 'var(--muted-foreground)' }}>
                {canIssueCRS ? 'All supporting documents signed. Ready to issue CRS.' : 'Sign all supporting documents to enable CRS issuance.'}
              </p>
              {inspection.status === 'SIGNED' && canIssueCRS ? (
                <button className="btn btn-primary">Generate CRS</button>
              ) : (inspection.status === 'CRS_ISSUED' || isClosed) ? (
                <button className="btn" style={{ border: '1px solid var(--border)' }}><Download size={18} /> View CRS</button>
              ) : (
                <button className="btn btn-primary" disabled>Generate CRS</button>
              )}
            </div>
          </section>
        </div>

        <aside>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', position: 'sticky', top: '100px' }}>
            <h4 style={{ marginBottom: '1rem' }}>Inspection Log</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '1rem' }}>
                <div style={{ fontWeight: 600 }}>Inspection Created</div>
                <div style={{ color: 'var(--muted-foreground)' }}>{new Date(inspection.createdAt).toLocaleString()}</div>
              </div>
              {inspection.documents.map(doc => (
                <div key={doc.id} style={{ borderLeft: `2px solid ${doc.status === 'SIGNED' ? 'var(--success)' : 'var(--border)'}`, paddingLeft: '1rem' }}>
                  <div style={{ fontWeight: 600 }}>{doc.documentType} {doc.status.toLowerCase()}</div>
                  <div style={{ color: 'var(--muted-foreground)' }}>{new Date(doc.generatedAt).toLocaleString()}</div>
                </div>
              ))}
              {isClosed && (
                <div style={{ borderLeft: '2px solid var(--foreground)', paddingLeft: '1rem' }}>
                  <div style={{ fontWeight: 600 }}>Work Order Closed</div>
                  <div style={{ color: 'var(--muted-foreground)' }}>{inspection.closedAt ? new Date(inspection.closedAt).toLocaleString() : ''}</div>
                </div>
              )}
            </div>
            
            {!isClosed && inspection.status === 'CRS_ISSUED' && (
              <form action={handleFinalize}>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', backgroundColor: 'var(--foreground)' }}>
                  Finalize & Close Inspection
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
