'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import Modal from '@/components/Modal'
import { ClipboardIllustration } from '@/components/Illustrations'

interface Medication {
  id: string
  name: string
  dosage: string | null
  frequency: string | null
  start_date: string | null
  end_date: string | null
}

interface Vaccine {
  id: string
  name: string
  date_given: string | null
  next_due_date: string | null
}

interface VetRecord {
  id: string
  type: 'visit' | 'vaccine' | 'medication' | 'note'
  date: string
  vet_name: string | null
  notes: string | null
  created_at: string
  medications: Medication[]
  vaccines: Vaccine[]
}

const RECORD_TYPES = ['visit', 'vaccine', 'medication', 'note'] as const
type RecordType = (typeof RECORD_TYPES)[number]

const typeConfig: Record<RecordType, { bg: string; dot: string }> = {
  visit: { bg: 'bg-teal/10 text-teal border-teal/20', dot: 'bg-teal' },
  vaccine: { bg: 'bg-island-green/10 text-island-green border-island-green/20', dot: 'bg-island-green' },
  medication: { bg: 'bg-warm-yellow/10 text-yellow-700 border-warm-yellow/30', dot: 'bg-warm-yellow' },
  note: { bg: 'bg-warm-gray text-text-secondary border-warm-border/30', dot: 'bg-text-secondary' },
}

const PIN_HASH = '3170'
const STORAGE_KEY = 'tuna-records-unlocked'

export default function VetRecords() {
  const [unlocked, setUnlocked] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [records, setRecords] = useState<VetRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<RecordType | 'documents' | null>(null)
  const [documents, setDocuments] = useState<{ name: string; url: string; created_at: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const docInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true') {
      setUnlocked(true)
    }
  }, [])

  function handlePinSubmit() {
    if (pinInput === PIN_HASH) {
      setUnlocked(true)
      localStorage.setItem(STORAGE_KEY, 'true')
      setPinError(false)
    } else {
      setPinError(true)
      setPinInput('')
    }
  }

  const [formType, setFormType] = useState<RecordType>('visit')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formVetName, setFormVetName] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formMedName, setFormMedName] = useState('')
  const [formMedDosage, setFormMedDosage] = useState('')
  const [formMedFrequency, setFormMedFrequency] = useState('')
  const [formMedStartDate, setFormMedStartDate] = useState('')
  const [formMedEndDate, setFormMedEndDate] = useState('')
  const [formVacName, setFormVacName] = useState('')
  const [formVacNextDue, setFormVacNextDue] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [scanning, setScanning] = useState(false)
  const scanInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchRecords()
    fetchDocuments()
  }, [])

  async function fetchRecords() {
    const { data } = await supabase
      .from('vet_records')
      .select(`*, medications (*), vaccines (*)`)
      .order('date', { ascending: false })
    if (data) setRecords(data as VetRecord[])
    setLoading(false)
  }

  async function fetchDocuments() {
    const { data } = await supabase.storage.from('cat-profile').list('documents', { sortBy: { column: 'created_at', order: 'desc' } })
    if (data) {
      setDocuments(data.filter(f => f.name !== '.emptyFolderPlaceholder').map(f => ({
        name: f.name,
        url: supabase.storage.from('cat-profile').getPublicUrl(`documents/${f.name}`).data.publicUrl,
        created_at: f.created_at || '',
      })))
    }
  }

  async function uploadDocument(file: File) {
    setUploading(true)
    try {
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const { error } = await supabase.storage.from('cat-profile').upload(`documents/${safeName}`, file)
      if (error) throw error
      await fetchDocuments()
    } catch {
      // silent fail
    } finally {
      setUploading(false)
    }
  }

  async function deleteDocument(name: string) {
    await supabase.storage.from('cat-profile').remove([`documents/${name}`])
    setDocuments(prev => prev.filter(d => d.name !== name))
  }

  function resetForm() {
    setFormType('visit')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormVetName('')
    setFormNotes('')
    setFormMedName('')
    setFormMedDosage('')
    setFormMedFrequency('')
    setFormMedStartDate('')
    setFormMedEndDate('')
    setFormVacName('')
    setFormVacNextDue('')
    setFormError('')
  }

  function prefillForm(record: Record<string, unknown>) {
    if (record.type && RECORD_TYPES.includes(record.type as RecordType)) setFormType(record.type as RecordType)
    if (record.date) setFormDate(record.date as string)
    if (record.vet_name) setFormVetName(record.vet_name as string)
    if (record.notes) setFormNotes(record.notes as string)
    const med = record.medication as Record<string, string> | undefined
    if (med) {
      if (med.name) setFormMedName(med.name)
      if (med.dosage) setFormMedDosage(med.dosage)
      if (med.frequency) setFormMedFrequency(med.frequency)
      if (med.start_date) setFormMedStartDate(med.start_date)
      if (med.end_date) setFormMedEndDate(med.end_date)
    }
    const vac = record.vaccine as Record<string, string> | undefined
    if (vac) {
      if (vac.name) setFormVacName(vac.name)
      if (vac.next_due_date) setFormVacNextDue(vac.next_due_date)
    }
  }

  async function saveRecord(record: Record<string, unknown>) {
    const recType = (record.type as RecordType) || 'note'
    const { data: saved, error } = await supabase
      .from('vet_records')
      .insert({ type: recType, date: record.date || new Date().toISOString().split('T')[0], vet_name: (record.vet_name as string) || null, notes: (record.notes as string) || null })
      .select().single()
    if (error || !saved) return

    const med = record.medication as Record<string, string> | undefined
    if (recType === 'medication' && med?.name) {
      await supabase.from('medications').insert({
        name: med.name, dosage: med.dosage || null, frequency: med.frequency || null,
        start_date: med.start_date || null, end_date: med.end_date || null, vet_record_id: saved.id,
      })
    }
    const vac = record.vaccine as Record<string, string> | undefined
    if (recType === 'vaccine' && vac?.name) {
      await supabase.from('vaccines').insert({
        name: vac.name, date_given: (record.date as string) || null, next_due_date: vac.next_due_date || null, vet_record_id: saved.id,
      })
    }
  }

  async function scanDocument(file: File) {
    setScanning(true)
    setFormError('')
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
      const res = await fetch('/api/scan-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64, fileType: isPdf ? 'pdf' : 'image' }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setFormError(data.error || 'Could not read document'); return }

      const records = data.records as Record<string, unknown>[]

      if (records.length === 1) {
        // Single record: pre-fill the form and open modal
        prefillForm(records[0])
        setShowModal(true)
      } else {
        // Multiple records: save them all directly
        for (const record of records) {
          await saveRecord(record)
        }
        await fetchRecords()
      }
    } catch {
      setFormError('Failed to scan document. Please try again.')
    } finally {
      setScanning(false)
    }
  }

  async function handleSave() {
    if (!formDate) { setFormError('Please select a date'); return }
    if (formType === 'medication' && !formMedName.trim()) { setFormError('Please enter the medication name'); return }
    if (formType === 'vaccine' && !formVacName.trim()) { setFormError('Please enter the vaccine name'); return }

    setSaving(true)
    setFormError('')

    try {
      const { data: record, error: recordError } = await supabase
        .from('vet_records')
        .insert({ type: formType, date: formDate, vet_name: formVetName || null, notes: formNotes || null })
        .select()
        .single()

      if (recordError) throw recordError

      if (formType === 'medication' && formMedName) {
        await supabase.from('medications').insert({
          name: formMedName, dosage: formMedDosage || null, frequency: formMedFrequency || null,
          start_date: formMedStartDate || null, end_date: formMedEndDate || null, vet_record_id: record.id,
        })
      }

      if (formType === 'vaccine' && formVacName) {
        await supabase.from('vaccines').insert({
          name: formVacName, date_given: formDate, next_due_date: formVacNextDue || null, vet_record_id: record.id,
        })
      }

      await fetchRecords()
      resetForm()
      setShowModal(false)
    } catch {
      setFormError('Failed to save record. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const shortDate = (d: string) => {
    const [y, m, day] = d.split('-')
    return `${parseInt(m)}/${parseInt(day)}/${y.slice(2)}`
  }

  const lastVisit = records.find((r) => r.type === 'visit')
  const now = new Date()
  const nextDue = records
    .flatMap((r) => r.vaccines)
    .filter((v) => v.next_due_date && new Date(v.next_due_date) >= now)
    .sort((a, b) => new Date(a.next_due_date!).getTime() - new Date(b.next_due_date!).getTime())[0]
  const activeMeds = records
    .flatMap((r) => r.medications)
    .filter((m) => !m.end_date || new Date(m.end_date) >= now)

  if (!unlocked) {
    return (
      <div className="space-y-4 py-4">
        <div className="text-center py-10">
          <div className="w-16 h-16 rounded-2xl bg-island-green/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A5A3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h2 className="font-display text-lg font-extrabold text-island-green">Records Locked</h2>
          <p className="text-sm text-text-secondary mt-1">Enter your PIN to access vet records</p>
          <div className="mt-6 max-w-[200px] mx-auto space-y-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="----"
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '')); setPinError(false) }}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePinSubmit() }}
              className={`w-full text-center text-2xl tracking-[0.3em] bg-white rounded-card px-4 py-3 outline-none focus:ring-2 focus:ring-teal/30 border placeholder:tracking-[0.3em] placeholder:text-text-secondary/30 ${pinError ? 'border-coral-red' : 'border-warm-border/40'}`}
            />
            {pinError && <p className="text-xs text-coral-red">Incorrect PIN</p>}
            <button onClick={handlePinSubmit}
              className="w-full bg-teal text-white font-display font-bold py-3 rounded-card hover:bg-teal/90 transition-colors shadow-warm">
              Unlock
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-extrabold text-island-green">Vet Records</h2>
          <p className="text-sm text-text-secondary mt-1">Track Tuna&apos;s health history</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scanInputRef.current?.click()}
            disabled={scanning}
            className="border-2 border-teal text-teal font-bold px-3 py-2 rounded-card text-sm hover:bg-teal-light transition-colors disabled:opacity-50"
          >
            {scanning ? '...' : 'Scan'}
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true) }}
            className="bg-teal text-white font-bold px-4 py-2 rounded-card text-sm hover:bg-teal/90 transition-colors shadow-warm"
          >
            Add Record
          </button>
        </div>
        <input
          ref={scanInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) { resetForm(); scanDocument(f); } e.target.value = '' }}
          className="hidden"
        />
      </div>

      {scanning && (
        <div className="card-warm text-center !p-4">
          <div className="inline-block w-5 h-5 border-2 border-teal border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-teal font-medium">Reading document...</p>
          <p className="text-xs text-text-secondary mt-1">Extracting vet record details</p>
        </div>
      )}

      {/* Summary Widgets */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { color: 'bg-teal', label: 'Last Visit', value: lastVisit ? shortDate(lastVisit.date) : '—' },
          { color: 'bg-island-green', label: 'Next Due', value: nextDue ? shortDate(nextDue.next_due_date!) : '—' },
          { color: 'bg-warm-yellow', label: 'Active Meds', value: String(activeMeds.length) },
        ].map((w) => (
          <div key={w.label} className="card-warm text-center !p-3">
            <div className={`w-2.5 h-2.5 rounded-full ${w.color} mx-auto mb-1.5`} />
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">{w.label}</p>
            <p className="font-display font-extrabold text-xs mt-0.5">{w.value}</p>
          </div>
        ))}
      </div>

      {/* Record Folders */}
      {loading ? (
        <div className="text-center py-8 text-text-secondary text-sm">Loading records...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-6 text-text-secondary">
          <ClipboardIllustration size={90} className="mx-auto mb-3 animate-float" />
          <p className="text-sm font-medium">No records yet</p>
          <p className="text-xs mt-1 text-text-secondary/70">Add Tuna&apos;s first vet visit or vaccine</p>
        </div>
      ) : !selectedFolder ? (
        <div className="grid grid-cols-2 gap-3">
          {RECORD_TYPES.map((type) => {
            const count = records.filter((r) => r.type === type).length
            if (count === 0) return null
            const config = typeConfig[type]
            return (
              <button key={type} onClick={() => { setSelectedFolder(type); setExpandedId(null) }}
                className="card-warm !p-4 text-left hover:shadow-warm-lg transition-shadow">
                <div className={`w-8 h-8 rounded-xl ${config.bg.split(' ')[0]} flex items-center justify-center mb-2`}>
                  <span className={`w-3 h-3 rounded-full ${config.dot}`} />
                </div>
                <p className="font-display font-extrabold text-sm capitalize">{type}s</p>
                <p className="text-xs text-text-secondary mt-0.5">{count} record{count !== 1 ? 's' : ''}</p>
              </button>
            )
          })}
          <button onClick={() => setSelectedFolder('documents')}
            className="card-warm !p-4 text-left hover:shadow-warm-lg transition-shadow col-span-2 flex items-center gap-4">
            <ClipboardIllustration size={48} />
            <div>
              <p className="font-display font-extrabold text-sm">Documents</p>
              <p className="text-xs text-text-secondary mt-0.5">{documents.length} file{documents.length !== 1 ? 's' : ''}</p>
            </div>
          </button>
        </div>
      ) : selectedFolder === 'documents' ? (
        <div className="space-y-3">
          <button onClick={() => setSelectedFolder(null)} className="flex items-center gap-1.5 text-teal text-sm font-semibold mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            All Records
          </button>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-sm">Documents</h3>
            <button
              onClick={() => docInputRef.current?.click()}
              disabled={uploading}
              className="bg-teal text-white font-bold px-3 py-1.5 rounded-card text-xs hover:bg-teal/90 transition-colors shadow-warm disabled:opacity-50"
            >
              {uploading ? '...' : 'Upload'}
            </button>
            <input
              ref={docInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDocument(f); e.target.value = '' }}
              className="hidden"
            />
          </div>
          {documents.length === 0 ? (
            <div className="text-center py-6 text-text-secondary">
              <p className="text-sm font-medium">No documents yet</p>
              <p className="text-xs mt-1 text-text-secondary/70">Upload PDFs or photos of vet records</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => {
                const isPdf = doc.name.toLowerCase().endsWith('.pdf')
                return (
                  <div key={doc.name} className="card-warm !p-3 flex items-center justify-between gap-2">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isPdf ? 'bg-coral-red/10' : 'bg-teal/10'}`}>
                        {isPdf ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF6461" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name.replace(/^\d+-/, '')}</p>
                        <p className="text-[10px] text-text-secondary">{isPdf ? 'PDF' : 'Image'}</p>
                      </div>
                    </a>
                    <button onClick={() => deleteDocument(doc.name)}
                      className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-text-secondary/50 hover:bg-coral-red/10 hover:text-coral-red transition-colors">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="1" y1="1" x2="13" y2="13" /><line x1="13" y1="1" x2="1" y2="13" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <button onClick={() => setSelectedFolder(null)} className="flex items-center gap-1.5 text-teal text-sm font-semibold mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            All Records
          </button>
          <h3 className="font-display font-extrabold text-sm capitalize">{selectedFolder}s</h3>
          {records.filter((r) => r.type === selectedFolder).map((record) => (
            <div key={record.id} className="card-warm overflow-hidden !p-0">
              <button
                onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{formatDate(record.date)}</span>
                  <svg className={`w-4 h-4 text-text-secondary transition-transform ${expandedId === record.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {record.vet_name && <p className="text-xs text-text-secondary mt-1">{record.vet_name}</p>}
                {record.notes && <p className="text-sm text-text-secondary mt-1 line-clamp-1">{record.notes}</p>}
              </button>

              {expandedId === record.id && (
                <div className="px-4 pb-4 border-t border-warm-border/30 pt-3 space-y-3">
                  {record.notes && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Notes</p>
                      <p className="text-sm mt-1">{record.notes}</p>
                    </div>
                  )}
                  {record.medications.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Medications</p>
                      {record.medications.map((med) => (
                        <div key={med.id} className="text-sm mt-1.5 bg-cream/60 rounded-xl p-2">
                          <p className="font-semibold">{med.name}</p>
                          {med.dosage && <p className="text-text-secondary text-xs">Dosage: {med.dosage}</p>}
                          {med.frequency && <p className="text-text-secondary text-xs">Frequency: {med.frequency}</p>}
                          {med.start_date && <p className="text-text-secondary text-xs">Started: {formatDate(med.start_date)}</p>}
                          {med.end_date && <p className="text-text-secondary text-xs">Ended: {formatDate(med.end_date)}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  {record.vaccines.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Vaccines</p>
                      {record.vaccines.map((vac) => (
                        <div key={vac.id} className="text-sm mt-1.5 bg-cream/60 rounded-xl p-2">
                          <p className="font-semibold">{vac.name}</p>
                          {vac.next_due_date && <p className="text-text-secondary text-xs">Next due: {formatDate(vac.next_due_date)}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Record Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Record">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Type</label>
            <div className="flex gap-2 mt-2">
              {RECORD_TYPES.map((type) => (
                <button key={type} onClick={() => setFormType(type)}
                  className={`flex-1 text-xs font-bold py-2.5 rounded-card capitalize transition-colors ${
                    formType === type ? 'bg-teal text-white shadow-warm' : 'bg-surface text-text-secondary hover:bg-teal-light'
                  }`}
                >{type}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Date</label>
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
              className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 mt-1 border border-warm-border/40" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Vet / Clinic (optional)</label>
            <input type="text" placeholder="Vet clinic name" value={formVetName} onChange={(e) => setFormVetName(e.target.value)}
              className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 mt-1 border border-warm-border/40" />
          </div>

          {formType === 'medication' && (
            <div className="space-y-3 border-t border-warm-border/30 pt-3">
              <input type="text" placeholder="Medication name *" value={formMedName} onChange={(e) => setFormMedName(e.target.value)}
                className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 border border-warm-border/40" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Dosage" value={formMedDosage} onChange={(e) => setFormMedDosage(e.target.value)}
                  className="bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 border border-warm-border/40" />
                <input type="text" placeholder="Frequency" value={formMedFrequency} onChange={(e) => setFormMedFrequency(e.target.value)}
                  className="bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 border border-warm-border/40" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-text-secondary">Start date</label>
                  <input type="date" value={formMedStartDate} onChange={(e) => setFormMedStartDate(e.target.value)}
                    className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 border border-warm-border/40" />
                </div>
                <div>
                  <label className="text-xs text-text-secondary">End date</label>
                  <input type="date" value={formMedEndDate} onChange={(e) => setFormMedEndDate(e.target.value)}
                    className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 border border-warm-border/40" />
                </div>
              </div>
            </div>
          )}

          {formType === 'vaccine' && (
            <div className="space-y-3 border-t border-warm-border/30 pt-3">
              <input type="text" placeholder="Vaccine name *" value={formVacName} onChange={(e) => setFormVacName(e.target.value)}
                className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 border border-warm-border/40" />
              <div>
                <label className="text-xs text-text-secondary">Next due date</label>
                <input type="date" value={formVacNextDue} onChange={(e) => setFormVacNextDue(e.target.value)}
                  className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 border border-warm-border/40" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Notes</label>
            <textarea placeholder="Any notes..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={3}
              className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 mt-1 resize-none border border-warm-border/40" />
          </div>

          {formError && <p className="text-sm text-coral-red text-center">{formError}</p>}

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-teal text-white font-display font-bold py-3.5 rounded-card hover:bg-teal/90 transition-colors disabled:opacity-50 shadow-warm">
            {saving ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
