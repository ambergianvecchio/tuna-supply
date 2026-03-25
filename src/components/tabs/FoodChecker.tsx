'use client'

import { useState, useRef } from 'react'
import LoadingDots from '@/components/LoadingDots'
import { FoodBowlIllustration, LeafSprig, Sparkle } from '@/components/Illustrations'
import CurrentDiet from './CurrentDiet'

interface AnalysisResult {
  rating: 'excellent' | 'good' | 'fair' | 'avoid'
  protein_sources: { name: string; quality: string }[]
  red_flags: { ingredient: string; concern: string }[]
  highlights: string[]
  summary: string
}

const ratingConfig = {
  excellent: { badge: 'badge-excellent', label: 'Excellent' },
  good: { badge: 'badge-good', label: 'Good' },
  fair: { badge: 'badge-fair', label: 'Fair' },
  avoid: { badge: 'badge-avoid', label: 'Avoid' },
}

function ResultCard({ data, name }: { data: AnalysisResult; name?: string }) {
  const config = ratingConfig[data.rating] || ratingConfig.fair
  return (
    <div className="card-warm space-y-4">
      <div className="flex items-center justify-between">
        {name && <p className="font-display font-bold text-sm">{name}</p>}
        <span className={`badge badge-sticker ${config.badge}`}>{config.label}</span>
      </div>

      {data.protein_sources.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1">
            <LeafSprig size={14} /> Protein Sources
          </h4>
          <div className="space-y-1.5">
            {data.protein_sources.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.quality === 'high' ? 'bg-island-green' : p.quality === 'medium' ? 'bg-warm-yellow' : 'bg-coral-red'}`} />
                <span className="font-medium">{p.name}</span>
                <span className="text-text-secondary text-xs">({p.quality})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.red_flags.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-coral-red mb-2">Red Flags</h4>
          <div className="space-y-2">
            {data.red_flags.map((f, i) => (
              <div key={i} className="bg-red-50 rounded-card p-3 border border-coral-red/10">
                <p className="text-sm font-semibold text-coral-red">{f.ingredient}</p>
                <p className="text-xs text-text-secondary mt-0.5">{f.concern}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.highlights.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-island-green mb-2">Highlights</h4>
          <div className="space-y-1.5">
            {data.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Sparkle size={14} className="shrink-0 mt-0.5" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-warm-border/40 pt-3">
        <p className="text-sm text-text-secondary leading-relaxed italic">{data.summary}</p>
      </div>
    </div>
  )
}

type FoodView = 'diet' | 'checker'

export default function FoodChecker() {
  const [view, setView] = useState<FoodView>('diet')
  const [ingredients, setIngredients] = useState('')
  const [productName, setProductName] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [comparing, setComparing] = useState(false)
  const [ingredients2, setIngredients2] = useState('')
  const [productName2, setProductName2] = useState('')
  const [result2, setResult2] = useState<AnalysisResult | null>(null)
  const [loading2, setLoading2] = useState(false)
  const [scanning, setScanning] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  async function scanLabel(file: File) {
    setScanning(true)
    setError('')
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const res = await fetch('/api/scan-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error || 'Could not read label'); return }
      setIngredients(data.ingredients)
    } catch { setError('Failed to scan label. Please try again.') }
    finally { setScanning(false) }
  }

  async function analyze(ingredientList: string, setResultFn: (r: AnalysisResult) => void, setLoadingFn: (b: boolean) => void) {
    setLoadingFn(true)
    setError('')
    try {
      const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ingredients: ingredientList }) })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error || 'Analysis failed'); return }
      setResultFn(data)
    } catch { setError('Something went wrong. Please try again.') }
    finally { setLoadingFn(false) }
  }

  return (
    <div>
      {/* Sub-tab toggle */}
      <div className="flex gap-1 bg-surface rounded-card p-1 mt-4">
        {([['diet', 'Current Diet'], ['checker', 'Label Checker']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex-1 text-xs font-bold py-2.5 rounded-[12px] transition-colors ${
              view === key
                ? 'bg-white text-island-green shadow-warm'
                : 'text-text-secondary hover:text-island-green'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'diet' ? (
        <CurrentDiet />
      ) : (
        <div className="space-y-4 py-4">
          <div className="text-center">
            <h2 className="font-display text-lg font-extrabold text-island-green">Food Label Checker</h2>
            <p className="text-sm text-text-secondary mt-1">We&apos;ll check what&apos;s good (and not so good)<br />for Tuna</p>
            <FoodBowlIllustration size={180} className="mx-auto mt-6 mb-2 animate-float" />
          </div>

          <div className="space-y-3">
            <input type="text" placeholder="Product name (optional)" value={productName} onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 transition-shadow border border-warm-border/40" />
            <textarea placeholder="Paste ingredients here..." value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={3}
              className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 transition-shadow resize-none border border-warm-border/40" />
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={scanning}
              className="w-full border-2 border-dashed border-teal/40 text-teal font-semibold py-3 rounded-card hover:bg-teal-light/30 transition-colors text-sm disabled:opacity-50"
            >
              {scanning ? <LoadingDots /> : 'Scan Label Photo'}
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) scanLabel(f); e.target.value = '' }}
              className="hidden"
            />
            <button onClick={() => { if (!ingredients.trim()) { setError('Please paste an ingredient list first'); return }; analyze(ingredients, setResult, setLoading) }} disabled={loading}
              className="w-full bg-teal text-white font-display font-bold py-3.5 rounded-card hover:bg-teal/90 transition-colors disabled:opacity-50 shadow-warm">
              {loading ? <LoadingDots /> : 'Analyze'}
            </button>
          </div>

          {error && <p className="text-sm text-coral-red text-center">{error}</p>}
          {result && <ResultCard data={result} name={productName || undefined} />}

          {result && !comparing && (
            <button onClick={() => setComparing(true)}
              className="w-full border-2 border-dashed border-teal/30 text-teal font-semibold py-3 rounded-card hover:border-teal/60 hover:bg-teal-light/30 transition-colors text-sm">
              Compare Another Food
            </button>
          )}

          {comparing && (
            <div className="space-y-3 border-t border-warm-border/40 pt-4">
              <h3 className="font-display font-bold text-sm">Compare With</h3>
              <input type="text" placeholder="Product name (optional)" value={productName2} onChange={(e) => setProductName2(e.target.value)}
                className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 transition-shadow border border-warm-border/40" />
              <textarea placeholder="Paste second ingredient list here..." value={ingredients2} onChange={(e) => setIngredients2(e.target.value)} rows={5}
                className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 transition-shadow resize-none border border-warm-border/40" />
              <button onClick={() => { if (!ingredients2.trim()) { setError('Please paste ingredients for the second food'); return }; analyze(ingredients2, setResult2, setLoading2) }} disabled={loading2}
                className="w-full bg-teal text-white font-display font-bold py-3.5 rounded-card hover:bg-teal/90 transition-colors disabled:opacity-50 shadow-warm">
                {loading2 ? <LoadingDots /> : 'Analyze'}
              </button>
              {result2 && <ResultCard data={result2} name={productName2 || 'Food #2'} />}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
