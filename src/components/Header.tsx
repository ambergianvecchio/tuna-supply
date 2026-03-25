'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { calculateAge } from '@/lib/utils'
import { LeafSprig, Sparkle, IconCake } from './Illustrations'

const TUNA_BIRTHDAY = new Date('2023-01-17')

export default function Header() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadPhoto() }, [])

  async function loadPhoto() {
    const { data } = await supabase.from('cat_profile').select('photo_url').limit(1).single()
    if (data?.photo_url) setPhotoUrl(data.photo_url)
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `tuna-profile.${ext}`

    const { error: uploadError } = await supabase.storage.from('cat-profile').upload(path, file, { upsert: true })
    if (uploadError) { console.error('Upload error:', uploadError); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('cat-profile').getPublicUrl(path)

    const { data: existing } = await supabase.from('cat_profile').select('id').limit(1).single()
    if (existing) {
      await supabase.from('cat_profile').update({ photo_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await supabase.from('cat_profile').insert({ photo_url: publicUrl })
    }
    setPhotoUrl(publicUrl + '?t=' + Date.now())
    setUploading(false)
  }

  return (
    <header className="bg-white">
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-4">
          {/* Profile photo */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative shrink-0 w-[110px] h-[110px] rounded-2xl overflow-hidden bg-[#FFF8F0] transition-transform active:scale-95 shadow-warm"
          >
            {photoUrl ? (
              <img src={photoUrl} alt="Tuna" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#6B7F5E]">
                T
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-teal border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-2xl font-extrabold text-island-green">Tuna</h1>
              <Sparkle size={14} />
            </div>
            <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
              <LeafSprig size={14} />
              {calculateAge(TUNA_BIRTHDAY)}
            </p>
            <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
              <IconCake size={14} /> Jan 17, 2023
            </p>
          </div>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-[#E8D5B5] to-transparent" />
    </header>
  )
}
