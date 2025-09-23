import React, { useEffect, useState } from 'react'
import { apiLeaderboard } from '../api'

export default function Rewards(){
  const [lb, setLb] = useState([])
  const username = localStorage.getItem('username')

  useEffect(()=>{ (async()=> {
    const r = await apiLeaderboard()
    if(r.ok) setLb(r.leaders || [])
  })() }, [])

  return (
    <div className="container page">
      <section className="card">
        <h2>Rewards</h2>
        {username ? <p className="muted">Logged in as <b>{username}</b>. Upload/analyze to earn points.</p>
                  : <p className="muted">Login to earn points for your uploads.</p>}
        <h3>Leaderboard</h3>
        <ol>
          {lb.map((x,i)=>(<li key={i}><b>{x.username}</b> — {x.points} pts</li>))}
        </ol>
      </section>
    </div>
  )
}
