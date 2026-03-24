'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Modal from '@/components/Modal'
import LoadingDots from '@/components/LoadingDots'
import { FoodBowlIllustration } from '@/components/Illustrations'

interface CalorieData {
  calories_per_day: number
  per_serving: number
  servings_per_day: number
  confidence: 'high' | 'medium' | 'low'
  notes: string
}

interface DietItem {
  id: string
  type: string
  brand: string | null
  amount: string | null
  ingredients: string | null
  analysis: string | null
  updated_at: string
}

const FOOD_TYPES = ['wet', 'dry', 'raw', 'freeze-dried', 'topper'] as const

const typeConfig: Record<string, { bg: string; icon: string }> = {
  wet: { bg: 'bg-teal/10 text-teal border-teal/20', icon: '/skewer.png' },
  dry: { bg: 'bg-warm-yellow/10 text-yellow-700 border-warm-yellow/30', icon: '/tempura.png' },
  raw: { bg: 'bg-island-green/10 text-island-green border-island-green/20', icon: '/skewer.png' },
  'freeze-dried': { bg: 'bg-coral-red/10 text-coral-red border-coral-red/20', icon: '/tempura.png' },
  topper: { bg: 'bg-purple-100 text-purple-700 border-purple-200', icon: '/skewer.png' },
}

function parseAnalysis(analysis: string | null): CalorieData | null {
  if (!analysis) return null
  try {
    return JSON.parse(analysis) as CalorieData
  } catch {
    return null
  }
}

export default function CurrentDiet() {
  const [items, setItems] = useState<DietItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [researchingIds, setResearchingIds] = useState<Set<string>>(new Set())

  // Form state
  const [formBrand, setFormBrand] = useState('')
  const [formIngredients, setFormIngredients] = useState('')
  const [formType, setFormType] = useState<string>('wet')
  const [formAmount, setFormAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  async function researchCalories(item: DietItem) {
    setResearchingIds((prev) => new Set(prev).add(item.id))
    try {
      const res = await fetch('/api/calories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: item.brand,
          ingredients: item.ingredients,
          type: item.type,
          amount: item.amount,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) return

      const analysisJson = JSON.stringify(data)
      const { error } = await supabase.from('current_diet').update({ analysis: analysisJson }).eq('id', item.id)
      if (!error) {
        setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, analysis: analysisJson } : i))
      }
    } catch {
      // silent fail for background research
    } finally {
      setResearchingIds((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }

  async function fetchDiet() {
    const { data } = await supabase
      .from('current_diet')
      .select('*')
      .order('updated_at', { ascending: false })
    if (data) setItems(data as DietItem[])
    setLoading(false)
    return data as DietItem[] | null
  }

  useEffect(() => { fetchDiet() }, [])

  function resetForm() {
    setFormBrand('')
    setFormIngredients('')
    setFormType('wet')
    setFormAmount('')
    setFormError('')
  }

  async function handleSave() {
    if (!formBrand.trim() && !formIngredients.trim()) {
      setFormError('Please enter a brand or product name')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const { data: newItem, error } = await supabase.from('current_diet').insert({
        type: formType,
        brand: formBrand || null,
        amount: formAmount || null,
        ingredients: formIngredients || null,
      }).select().single()
      if (error) throw error

      setItems((prev) => [newItem as DietItem, ...prev])
      resetForm()
      setShowModal(false)

      // Research calories in background
      researchCalories(newItem as DietItem)
    } catch {
      setFormError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await supabase.from('current_diet').delete().eq('id', id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch {
      // silent fail, item stays in list
    } finally {
      setDeleting(null)
    }
  }

  // Calculate daily calorie total
  const dailyCalories = items.reduce((sum, item) => {
    const cal = parseAnalysis(item.analysis)
    return sum + (cal?.calories_per_day || 0)
  }, 0)
  const hasAnyCalories = items.some((i) => parseAnalysis(i.analysis))
  const isResearching = researchingIds.size > 0

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-extrabold text-island-green">Tuna&apos;s Diet</h2>
          <p className="text-sm text-text-secondary mt-1">What Tuna is currently eating</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="bg-teal text-white font-bold px-4 py-2 rounded-card text-sm hover:bg-teal/90 transition-colors shadow-warm"
        >
          Add Food
        </button>
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="card-warm text-center !p-3">
            <div className="w-2.5 h-2.5 rounded-full bg-teal mx-auto mb-1.5" />
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Total Foods</p>
            <p className="font-body font-bold text-sm mt-0.5">{items.length}</p>
          </div>
          <div className="card-warm text-center !p-3">
            <div className="w-2.5 h-2.5 rounded-full bg-warm-yellow mx-auto mb-1.5" />
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Daily Calories</p>
            <p className="font-body font-bold text-sm mt-0.5">
              {isResearching ? (
                <LoadingDots />
              ) : hasAnyCalories ? (
                <>~{dailyCalories} kcal</>
              ) : (
                '—'
              )}
            </p>
          </div>
        </div>
      )}

      {/* Diet List */}
      {loading ? (
        <div className="text-center py-8 text-text-secondary text-sm">Loading diet...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-6 text-text-secondary">
          <FoodBowlIllustration size={90} className="mx-auto mb-3 animate-float" />
          <p className="text-sm font-medium">No foods added yet</p>
          <p className="text-xs mt-1 text-text-secondary/70">Add what Tuna is currently eating</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const config = typeConfig[item.type] || typeConfig.wet
            const cal = parseAnalysis(item.analysis)
            const itemResearching = researchingIds.has(item.id)
            return (
              <div key={item.id} className="card-warm !p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <img src={config.icon} alt="" className="w-4 h-4" />
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${config.bg}`}>
                        {item.type}
                      </span>
                      {item.amount && (
                        <span className="text-[10px] text-text-secondary font-medium">{item.amount}</span>
                      )}
                    </div>
                    {item.ingredients && (
                      <p className="font-semibold text-sm">{item.ingredients}</p>
                    )}
                    {item.brand && (
                      <p className="text-xs text-text-secondary mt-0.5">{item.brand}</p>
                    )}
                    {/* Calorie info */}
                    {itemResearching ? (
                      <p className="text-xs text-teal mt-1.5 flex items-center gap-1">
                        <span className="inline-block w-3 h-3 border-2 border-teal border-t-transparent rounded-full animate-spin" />
                        Estimating calories...
                      </p>
                    ) : cal ? (
                      <p className="text-xs text-island-green font-semibold mt-1.5">
                        ~{cal.calories_per_day} kcal/day
                        <span className="text-text-secondary font-normal ml-1">
                          ({cal.per_serving} per serving)
                        </span>
                      </p>
                    ) : null}
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-text-secondary/50 hover:bg-coral-red/10 hover:text-coral-red transition-colors disabled:opacity-50"
                    title="Remove from diet"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="1" y1="1" x2="13" y2="13" />
                      <line x1="13" y1="1" x2="1" y2="13" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Food Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Food">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Brand</label>
            <input type="text" placeholder="e.g. Fancy Feast" value={formBrand} onChange={(e) => setFormBrand(e.target.value)}
              className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 mt-1 border border-warm-border/40" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Product / Flavor</label>
            <input type="text" placeholder="e.g. Chicken Pate" value={formIngredients} onChange={(e) => setFormIngredients(e.target.value)}
              className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 mt-1 border border-warm-border/40" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Type</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {FOOD_TYPES.map((type) => (
                <button key={type} onClick={() => setFormType(type)}
                  className={`text-xs px-3 py-2 rounded-full font-semibold transition-colors border capitalize ${
                    formType === type
                      ? 'bg-teal text-white border-teal shadow-warm'
                      : 'bg-white text-text-secondary border-warm-border/40 hover:bg-teal-light hover:border-teal/30'
                  }`}
                >{type}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Amount / Serving</label>
            <input type="text" placeholder="e.g. 1/3 cup daily" value={formAmount} onChange={(e) => setFormAmount(e.target.value)}
              className="w-full bg-white rounded-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal/30 mt-1 border border-warm-border/40" />
          </div>

          {formError && <p className="text-sm text-coral-red text-center">{formError}</p>}

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-teal text-white font-display font-bold py-3.5 rounded-card hover:bg-teal/90 transition-colors disabled:opacity-50 shadow-warm">
            {saving ? 'Saving...' : 'Add to Diet'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
