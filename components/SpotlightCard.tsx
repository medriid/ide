"use client"
import React, { useRef, useState } from "react"

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
}

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(255, 255, 255, 0.15)"
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleFocus = () => {
    setOpacity(0.6)
  }

  const handleBlur = () => {
    setOpacity(0)
  }

  const handleMouseEnter = () => {
    setOpacity(0.6)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl border border-white/10 bg-black/80 backdrop-blur-sm overflow-hidden ${className}`}
    >
      {/* Animated border beam */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(30,30,30,0.85), #000 80%)`
        }}
      />
      
      {/* Glowing border effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          opacity: opacity * 0.5,
          boxShadow: `0 0 40px 2px ${spotlightColor}, inset 0 0 20px 1px ${spotlightColor}`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
