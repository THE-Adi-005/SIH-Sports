import React from 'react'

export default function BadgeBar({ items = [] }) {
  if (!items.length) return null
  return (
    <div className="badgebar">
      {items.map((x,i)=>(<span key={i} className="badge">{x}</span>))}
    </div>
  )
}