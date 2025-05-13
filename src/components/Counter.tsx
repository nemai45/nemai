"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"

interface CounterProps {
    count: number
    onIncrease: () => void
    onDecrease: () => void
}

export default function Counter({ count, onIncrease, onDecrease }: CounterProps) {

  return (
    <div className="flex items-center justify-center gap-4 p-8">
      <button
        onClick={onDecrease}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        aria-label="Decrease count"
      >
        <Minus className="h-2 w-2" />
      </button>

      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-xl font-bold text-gray-800 shadow-sm">
        {count}
      </div>

      <button
        onClick={onIncrease}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        aria-label="Increase count"
      >
        <Plus className="h-2 w-2" />
      </button>
    </div>
  )
}