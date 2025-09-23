import React from 'react'

export default function Instructions(){
  return (
    <div className="container page">
      <section className="card">
        <h2>How to Record</h2>
        <ul>
          <li>Keep camera static (prop it), full body in frame, good lighting.</li>
          <li>Sit-ups: side view, knees bent.</li>
          <li>High Jump: 4–6s clip, standing jump.</li>
          <li>Long Jump: side view; enter athlete height for better scaling.</li>
        </ul>
      </section>
      <section className="card" style={{marginTop:16}}>
        <h2>What You Get</h2>
        <ul>
          <li>Real-time keypoints overlay.</li>
          <li>Live metrics: angles, counts, airtime, distance.</li>
          <li>Instant feedback to improve form; optional server verify.</li>
        </ul>
      </section>
      <section className="card" style={{marginTop:16}}>
        <h2>Lightweight by Design</h2>
        <p className="muted">Pretrained pose + physics/geometry. No custom training needed.</p>
      </section>
    </div>
  )
}
