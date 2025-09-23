import React from 'react'

export default function ResultCard({ title, data, loading }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <pre className="out">{loading ? 'Processing...' : (data ? JSON.stringify(data, null, 2) : 'Upload a clip and hit Analyze')}</pre>
    </section>
  )
}