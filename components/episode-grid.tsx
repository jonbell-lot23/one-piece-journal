'use client'

import { useEffect, useState } from 'react'

interface ProgressData {
  watched: number[]
  summaries: { start: number; end: number }[]
  read: { start: number; end: number }[]
}

const TOTAL_EPISODES = 1136 // Current total One Piece episodes as of 2025

export default function EpisodeGrid() {
  const [progress, setProgress] = useState<ProgressData | null>(null)

  useEffect(() => {
    fetch('/api/progress')
      .then(res => res.json())
      .then(data => setProgress(data))
  }, [])

  if (!progress) return null

  const getEpisodeStatus = (episodeNumber: number) => {
    // Check if watched (highest priority)
    if (progress.watched.includes(episodeNumber)) {
      return 'watched'
    }
    
    // Check if read
    for (const range of progress.read) {
      if (episodeNumber >= range.start && episodeNumber <= range.end) {
        return 'read'
      }
    }
    
    // Check if summarized
    for (const range of progress.summaries) {
      if (episodeNumber >= range.start && episodeNumber <= range.end) {
        return 'summary'
      }
    }
    
    return 'unwatched'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watched': return 'bg-blue-500'
      case 'read': return 'bg-green-500'
      case 'summary': return 'bg-yellow-500'
      default: return 'bg-gray-300'
    }
  }

  const EPISODES_PER_ROW = 40 // 40 episodes per row
  const GRID_ROWS = Math.ceil(TOTAL_EPISODES / EPISODES_PER_ROW) // ~29 rows

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4">One Piece Progress</h3>
      
      <div className="grid gap-0.5 mb-4" style={{ gridTemplateColumns: `repeat(${EPISODES_PER_ROW}, 1fr)` }}>
        {Array.from({ length: TOTAL_EPISODES }, (_, i) => {
          const episodeNumber = i + 1
          const status = getEpisodeStatus(episodeNumber)
          
          return (
            <div
              key={episodeNumber}
              className={`w-2 h-2 rounded-sm ${getStatusColor(status)}`}
              title={`Episode ${episodeNumber} - ${status}`}
            />
          )
        })}
      </div>
      
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <span>Watched</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span>Read</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
          <span>Summary</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
          <span>Unwatched</span>
        </div>
      </div>
    </div>
  )
}