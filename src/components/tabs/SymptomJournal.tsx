'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import Modal from '@/components/Modal'
import LoadingDots from '@/components/LoadingDots'
import { NotebookIllustration } from '@/components/Illustrations'

interface SymptomLog {
  id: string
  date: string
  tags: string[]
  notes: string | null
  photo_url: string | null
  triage_level: string | null
  triage_explanation: string | null
  triage_monitor_list: string[] | null
  created_at: string
}

interface TriageResult {
  urgency: string
  explanation: string
  monitor_list: string[]
}

const SYMPTOM_TAGS = [
  'Lethargy', 'Not Eating', 'Vomiting', 'Diarrhea', 'Sneezing',
  'Coughing', 'Hiding', 'Drinking More', 'Drinking Less', 'Limping',
  'Eye Discharge', 'Other',
]

const urgencyConfig: Record<string, { badge: string; label: string }> = {
  watch: { badge: 'badge-watch', label: 'Watch & Wait' },
  call_vet: { badge: 'badge-call-vet', label: 'Call Vet Soon' },
  go_now: { badge: 'badge-go-now', label: 'Go Now' },
}

export default function SymptomJournal() {
  const [logs, setLogs] = useState<SymptomLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formTags, setFormTags] = useState<string[]>([])
  const [formNotes, setFormNotes] = useState('')
  const [formPhoto, setFormPhoto] = useState<File | null>(null)
  const [formPhotoPreview, setFormPhotoPreview] = useState<string | null>(null)
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null)
  const [triageLoading, setTriageLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    const { data } = await supabase.from('symptom_logs').select('*').order('date', { ascending: false })
    if (data) setLogs(data as SymptomLog[])
    setLoading(false)
  }

  function toggleTag(tag: string) {
    setFormTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFormPhoto(file)
    const reader = new FileReader()
    reader.onload = () => setFormPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function removePhoto() {
    setFormPhoto(null)
    setFormPhotoPreview(null)
  }

  async function uploadPhoto(file: File): Promise<string | null> {
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const path = `symptom-photos/${safeName}`
    const { error } = await supabase.storage.from('cat-profile').upload(path, file)
    if (error) { console.error('Photo upload error:', error); return null }
    const { data: { publicUrl } } = supabase.storage.from('cat-profile').getPublicUrl(path)
    return publicUrl
  }

  async function getTriage() {
    if (formTags.length === 0 && !formNotes.trim()) {
      setFormError('Please select symptoms or add notes first')
      return
    }
    setTriageLoading(true)
    setFormError('')
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: formTags, notes: formNotes }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setFormError(data.error || 'Triage failed'); return }
      setTriageResult(data)
    } catch {
      setFormError('Failed to get triage advice. Please try again.')
    } finally {
      setTriageLoading(false)
    }
  }

  async function handleSave() {
    if (formTags.length === 0 && !formNotes.trim()) {
      setFormError('Please select symptoms or add notes')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      let photoUrl: string | null = null
      if (formPhoto) {
        photoUrl = await uploadPhoto(formPhoto)
      }

      const { error } = await supabase.from('symptom_logs').insert({
        date: formDate, tags: formTags, notes: formNotes || null,
        photo_url: photoUrl,
        triage_level: triageResult?.urgency || null,
        triage_explanation: triageResult?.explanation || null,
        triage_monitor_list: triageResult?.monitor_list || null,
      })
      if (error) throw error
      await fetchLogs()
      resetForm()
      setShowModal(false)
    } catch {
      setFormError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      const { error } = await supabase.from('symptom_logs').delete().eq('id', id)
      if (error) throw error
      setLogs((prev) => prev.filter((l) => l.id !== id))
      setExpandedId(null)
    } catch {
      // silent fail
    } finally {
      setDeleting(null)
    }
  }

  function resetForm() {
    setFormDate(new Date().toISOString().split('T')[0])
    setFormTags([])
    setFormNotes('')
    setFormPhoto(null)
    setFormPhotoPreview(null)
    setTriageResult(null)
    setFormError('')
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-extrabold text-island-green">Symptom Journal</h2>
          <p className="text-sm text-text-secondary mt-1">Track Tuna&apos;s health</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="bg-teal text-white font-bold px-4 py-2 rounded-card text-sm hover:bg-teal/90 transition-colors shadow-warm"
        >
          Log Symptom
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-text-secondary text-sm">Loading journal...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-6 text-text-secondary">
          <NotebookIllustration size={90} className="mx-auto mb-3 animate-float" />
          <p className="text-sm font-medium">No entries yet</p>
          <p className="text-xs mt-1 text-text-secondary/70">Log a symptom to start tracking Tuna&apos;s health</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="card-warm overflow-hidden !p-0">
              <button
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{formatDate(log.date)}</span>
                  {log.triage_level && urgencyConfig[log.triage_level] && (
                    <span className={`badge text-[10px] ${urgencyConfig[log.triage_level].badge}`}>
                      {urgencyConfig[log.triage_level].label}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {log.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-teal-light text-teal px-2.5 py-0.5 rounded-full font-medium border border-teal/10">
                      {tag}
                    </span>
                  ))}
                </div>
                {log.notes && <p className="text-sm text-text-secondary mt-2 line-clamp-1">{log.notes}</p>}
              </button>

              {expandedId === log.id && (
                <div className="px-4 pb-4 border-t border-warm-border/30 pt-3 space-y-3">
                  {log.photo_url && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Photo</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={log.photo_url} alt="Symptom photo" className="mt-1 w-full max-h-48 object-cover rounded-card border border-warm-border/40" />
                    </div>
                  )}
                  {log.notes && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Notes</p>
                      <p className="text-sm mt-1">{log.notes}</p>
                    </div>
                  )}
                  {log.triage_explanation && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Triage Assessment</p>
                      <p className="text-sm mt-1">{log.triage_explanation}</p>
                    </div>
                  )}
                  {log.triage_monitor_list && log.triage_monitor_list.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Things to Monitor</p>
                      <ul className="mt-1 space-y-1">
                        {log.triage_monitor_list.map((item, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-teal mt-0.5">&bull;</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-[10px] text-text-secondary italic">
                    This is not a substitute for professional veterinary advice.
                  </p>
                  <button
                    onClick={() => handleDelete(log.id)}
                    disabled={deleting === log.id}
                    className="text-xs text-coral-red/70 hover:text-coral-red transition-colors disabled:opacity-50 mt-2"
                  >
                    {deleting === log.id ? 'Deleting...' : 'Delete Entry'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Log Symptom Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Symptom">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Date</label>
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
              className="w-full max-w-full box-border bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 mt-1 border border-warm-border/40 appearance-none" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Symptoms</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SYMPTOM_TAGS.map((tag) => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-2 rounded-full font-semibold transition-colors border ${
                    formTags.includes(tag)
                      ? 'bg-teal text-white border-teal shadow-warm'
                      : 'bg-white text-text-secondary border-warm-border/40 hover:bg-teal-light hover:border-teal/30'
                  }`}
                >{tag}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Describe what you&apos;re observing</label>
            <textarea placeholder="What's going on with Tuna?" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={3}
              className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 mt-1 resize-none border border-warm-border/40" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Photo</label>
            {formPhotoPreview ? (
              <div className="relative mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formPhotoPreview} alt="Preview" className="w-full max-h-40 object-cover rounded-card border border-warm-border/40" />
                <button
                  onClick={removePhoto}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 text-text-secondary hover:bg-coral-red hover:text-white transition-colors shadow-warm"
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="1" y1="1" x2="13" y2="13" />
                    <line x1="13" y1="1" x2="1" y2="13" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => photoInputRef.current?.click()}
                className="w-full mt-1 border-2 border-dashed border-teal/40 text-teal font-semibold py-3 rounded-card hover:bg-teal-light/30 transition-colors text-sm"
              >
                Add Photo
              </button>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          <button onClick={getTriage} disabled={triageLoading}
            className="w-full border-2 border-teal text-teal font-bold py-3 rounded-card hover:bg-teal-light transition-colors disabled:opacity-50">
            {triageLoading ? <LoadingDots /> : 'Get Triage Advice'}
          </button>

          {triageResult && (
            <div className="card-warm space-y-3 !border-warm-border/50">
              <div className="text-center">
                <span className={`badge ${urgencyConfig[triageResult.urgency]?.badge || 'badge-watch'} text-sm px-4 py-2`}>
                  {urgencyConfig[triageResult.urgency]?.label || triageResult.urgency}
                </span>
              </div>
              <p className="text-sm text-center leading-relaxed">{triageResult.explanation}</p>
              {triageResult.monitor_list.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Things to Monitor</p>
                  <ul className="mt-1 space-y-1">
                    {triageResult.monitor_list.map((item, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-teal mt-0.5">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-[10px] text-text-secondary italic text-center">
                This is not a substitute for professional veterinary advice.
              </p>
            </div>
          )}

          {formError && <p className="text-sm text-coral-red text-center">{formError}</p>}

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-teal text-white font-display font-bold py-3.5 rounded-card hover:bg-teal/90 transition-colors disabled:opacity-50 shadow-warm">
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
