"use client";

import { ReactNode, useEffect, useState, useRef } from "react";

interface MasonryProps {
  columns?: number;
  gap?: number;
  children: ReactNode[];
  className?: string;
}

export default function Masonry({
  columns = 3,
  gap = 16,
  children,
  className = "",
}: MasonryProps) {
  const [columnHeights, setColumnHeights] = useState<number[]>([]);
  const [responsiveColumns, setResponsiveColumns] = useState(columns);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.offsetWidth;
      let cols = columns;

      if (width < 640) cols = 1;
      else if (width < 1024) cols = Math.min(2, columns);
      else cols = columns;

      setResponsiveColumns(cols);
      setColumnHeights(new Array(cols).fill(0));
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [columns]);

  const getColumns = () => {
    const cols: ReactNode[][] = Array.from(
      { length: responsiveColumns },
      () => []
    );

    children.forEach((child, index) => {
      const shortestColumnIndex = columnHeights.indexOf(
        Math.min(...columnHeights)
      );
      cols[shortestColumnIndex].push(child);

      // Estimate height for balancing (rough approximation)
      const estimatedHeight = 200 + Math.random() * 100;
      columnHeights[shortestColumnIndex] += estimatedHeight;
    });

    return cols;
  };

  if (columnHeights.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`flex ${className}`}
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
  );
}
