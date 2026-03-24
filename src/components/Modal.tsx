'use client'

import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
      onClick={(e) => e.target === backdropRef.current && onClose()}
    >
      <div className="w-full max-w-[430px] bg-white rounded-t-[24px] max-h-[85vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-display font-bold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface text-text-secondary hover:bg-gray-200 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </div>
        <div className="px-4 py-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
