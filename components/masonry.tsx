'use client'

import { ReactNode, useEffect, useState } from 'react'

interface MasonryProps {
  columns?: number
  gap?: number
  children: ReactNode[]
}

export default function Masonry({ columns = 3, gap = 16, children }: MasonryProps) {
  const [columnHeights, setColumnHeights] = useState<number[]>([])

  useEffect(() => {
    setColumnHeights(new Array(columns).fill(0))
  }, [columns])

  const getColumns = () => {
    const cols: ReactNode[][] = Array.from({ length: columns }, () => [])
    
    children.forEach((child, index) => {
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
      cols[shortestColumnIndex].push(child)
      
      // Estimate height for balancing (rough approximation)
      const estimatedHeight = 200 + Math.random() * 100
      columnHeights[shortestColumnIndex] += estimatedHeight
    })

    return cols
  }

  if (columnHeights.length === 0) return null

  return (
    <div 
      className="flex"
      style={{ gap: `${gap}px` }}
    >
      {getColumns().map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex-1 flex flex-col"
          style={{ gap: `${gap}px` }}
        >
          {column}
        </div>
      ))}
    </div>
  )
}