'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import TabBar from '@/components/TabBar'
import FoodChecker from '@/components/tabs/FoodChecker'
import SafetyChecker from '@/components/tabs/SafetyChecker'
import VetRecords from '@/components/tabs/VetRecords'
import SymptomJournal from '@/components/tabs/SymptomJournal'

export default function Home() {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    <FoodChecker key="food" />,
    <SafetyChecker key="safety" />,
    <VetRecords key="records" />,
    <SymptomJournal key="journal" />,
  ]

  return (
    <div className="min-h-screen bg-cream flex justify-center p-2 sm:p-4">
      <div className="w-full max-w-[430px] min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-32px)] relative rounded-[24px] p-[6px] bg-teal">
        <div className="w-full h-full flex flex-col bg-white rounded-[18px] overflow-hidden">
          <Header />
          <main className="flex-1 px-4 pb-24 overflow-y-auto bg-cream/40">
            <div key={activeTab} className="tab-content">
              {tabs[activeTab]}
            </div>
          </main>
          <TabBar activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </div>
    </div>
  )
}
