'use client'

import { useState, useEffect } from 'react'
import LoadingDots from '@/components/LoadingDots'
import { ShieldIllustration, Sparkle } from '@/components/Illustrations'

interface SafetyResult {
  status: 'safe' | 'caution' | 'toxic'
  explanation: string
  exposure_note: string | null
}

const HISTORY_KEY = 'tuna-safety-history'

const statusConfig = {
  safe: { badge: 'badge-safe', label: 'Safe for Tuna', symbol: '\u2713', tilt: '-2deg' },
  caution: { badge: 'badge-caution', label: 'Use Caution', symbol: '!', tilt: '1.5deg' },
  toxic: { badge: 'badge-toxic', label: 'Toxic \u2014 Keep Away', symbol: '\u2717', tilt: '-1deg' },
}

export default function SafetyChecker() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SafetyResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY)
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch {}
    }
  }, [])

  function addToHistory(item: string) {
    const updated = [item, ...history.filter((h) => h !== item)].slice(0, 6)
    setHistory(updated)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  }

  async function check(item: string) {
    if (!item.trim()) {
      setError('Please enter something to check')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Check failed')
        return
      }

      setResult(data)
      addToHistory(item)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 py-4">
      <div>
        <h2 className="font-display text-lg font-extrabold text-island-green">Safety Checker</h2>
        <p className="text-sm text-text-secondary mt-1">
          Check if something is safe for Tuna
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder='e.g. "pothos plant", "tuna in oil"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && check(query)}
          className="flex-1 bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 transition-shadow border border-warm-border/40"
        />
        <button
          onClick={() => check(query)}
          disabled={loading}
          className="bg-teal text-white font-bold px-6 rounded-card hover:bg-teal/90 transition-colors disabled:opacity-50 shrink-0 shadow-warm"
        >
          {loading ? <LoadingDots /> : 'Check'}
        </button>
      </div>

      {error && <p className="text-sm text-coral-red text-center">{error}</p>}

      {result && (
        <div className="card-warm space-y-4">
          <div className="text-center">
            <span
              className={`badge badge-sticker ${statusConfig[result.status].badge} text-sm px-5 py-2`}
              style={{ transform: `rotate(${statusConfig[result.status].tilt})` }}
            >
              {statusConfig[result.status].symbol}&nbsp;&nbsp;{statusConfig[result.status].label}
            </span>
          </div>
          <p className="text-sm text-center leading-relaxed">
            {result.explanation}
          </p>
          {result.status === 'toxic' && (
            <div className="bg-red-50 rounded-card p-3 text-center border border-coral-red/10">
              <p className="text-xs text-coral-red font-semibold">
                If Tuna has been exposed, contact your vet or the ASPCA Poison
                Control hotline: (888) 426-4435
              </p>
            </div>
          )}
          {result.status === 'caution' && result.exposure_note && (
            <div className="bg-cream-dark rounded-card p-3 text-center border border-warm-yellow/30">
              <p className="text-xs text-yellow-700 font-medium">
                {result.exposure_note}
              </p>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            Recent Checks
          </h4>
          <div className="flex flex-wrap gap-2">
            {history.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(item)
                  check(item)
                }}
                className="bg-white text-text-secondary text-xs px-3 py-1.5 rounded-full hover:bg-teal-light hover:text-teal transition-colors border border-warm-border/30 shadow-sm"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {!result && !loading && history.length === 0 && (
        <div className="text-center py-6 text-text-secondary">
          <ShieldIllustration size={90} className="mx-auto mb-3 animate-float" />
          <p className="text-sm font-medium">Not sure if something is safe?</p>
          <p className="text-xs mt-1 text-text-secondary/70">
            Check plants, foods, cleaning products, and more
          </p>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/cat-sitting.svg" alt="" className="w-[280px] mx-auto !mt-2" style={{ transform: 'scaleX(-1)' }} />
    </div>
  )
}
