'use client'

import { Anchor, Calendar, ArrowUp, ArrowDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import Masonry from '@/components/masonry'
import EpisodeGrid from '@/components/episode-grid'

interface JourneyEntry {
  type: 'Episode' | 'Summary' | 'Manga' | 'Game' | 'Note'
  title: string
  description: string
  date: string
}

interface GapEntry {
  type: 'Gap'
  description: string
  fromDate: string
  toDate: string
}

const palette = {
  Episode: '#0EA5E9',
  Summary: '#FACC15',
  Manga: '#F472B6',
  Game: '#34D399',
  Note: '#A78BFA'
}

function JourneyCard({ entry, index }: { entry: JourneyEntry; index: number }) {
  return (
    <article 
      className="rounded-xl shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md bg-white ring-1 ring-neutral-200"
      style={{
        opacity: 0,
        transform: 'translateY(8px)',
        animation: `fadeInUp 0.5s ease-out ${index * 70}ms forwards`
      }}
    >
      <div className="p-6 flex flex-col gap-4">
        <span 
          className="text-sm font-medium px-3 py-1 rounded-full text-white w-fit"
          style={{ backgroundColor: palette[entry.type] ?? '#6b7280' }}
        >
          {entry.type}
        </span>
        
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
          {entry.title}
        </h2>
        
        {entry.description && (
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {entry.description}
          </p>
        )}
        
        {entry.date && (
          <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500">
            <Calendar className="w-4 h-4" />
            <time dateTime={entry.date}>
              {new Date(entry.date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short', 
                day: 'numeric'
              })}
            </time>
          </div>
        )}
      </div>
    </article>
  )
}

function GapCard({ gap, index }: { gap: GapEntry; index: number }) {
  const fromDate = new Date(gap.fromDate)
  const toDate = new Date(gap.toDate)
  const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
  
  return (
    <div 
      className="rounded-lg bg-neutral-100 border border-neutral-200 p-6 text-center flex flex-col justify-center min-h-[120px]"
      style={{
        opacity: 0,
        transform: 'translateY(8px)',
        animation: `fadeInUp 0.5s ease-out ${index * 70}ms forwards`
      }}
    >
      <div className="text-xs text-neutral-500 mb-2">
        {daysDiff} days later
      </div>
      <div className="text-sm text-neutral-600 italic">
        {gap.description}
      </div>
    </div>
  )
}

export default function Home() {
  const [entries, setEntries] = useState<(JourneyEntry | GapEntry)[]>([])
  const [columns, setColumns] = useState(3)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetch('/api/journey')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a: JourneyEntry, b: JourneyEntry) => 
          sortDirection === 'asc' 
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        
        // Insert gap cards between entries
        const withGaps: (JourneyEntry | GapEntry)[] = []
        for (let i = 0; i < sorted.length; i++) {
          withGaps.push(sorted[i])
          
          if (i < sorted.length - 1) {
            const currentDate = new Date(sorted[i].date)
            const nextDate = new Date(sorted[i + 1].date)
            const daysDiff = Math.ceil((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
            
            if (daysDiff > 30) { // Only show gaps longer than 30 days
              let gapDescription = ''
              if (daysDiff > 365) {
                gapDescription = `${Math.floor(daysDiff / 365)} year${Math.floor(daysDiff / 365) > 1 ? 's' : ''} of no One Piece activity`
              } else if (daysDiff > 30) {
                gapDescription = `${Math.floor(daysDiff / 30)} month${Math.floor(daysDiff / 30) > 1 ? 's' : ''} of no One Piece activity`
              }
              
              withGaps.push({
                type: 'Gap',
                description: gapDescription,
                fromDate: sorted[i].date,
                toDate: sorted[i + 1].date
              })
            }
          }
        }
        
        setEntries(withGaps)
      })
  }, [sortDirection])

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) setColumns(1)
      else if (window.innerWidth < 1024) setColumns(2)
      else setColumns(3)
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-['Inter','Helvetica_Neue',sans-serif]">
      <header className="sticky top-0 z-30 bg-neutral-50/90 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Anchor className="w-5 h-5" />
            One Piece Journey
          </h1>
          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md hover:bg-neutral-100 transition-colors"
          >
            {sortDirection === 'asc' ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
            {sortDirection === 'asc' ? 'Oldest first' : 'Newest first'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl w-full p-4 space-y-8">
        <EpisodeGrid />
        
        <div className="flex flex-col gap-4">
          {entries.map((entry, index) => (
            entry.type === 'Gap' ? (
              <GapCard key={index} gap={entry} index={index} />
            ) : (
              <div key={index} className="w-full">
                <JourneyCard entry={entry} index={index} />
              </div>
            )
          ))}
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}