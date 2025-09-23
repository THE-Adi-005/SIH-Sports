import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard({ apiUp }) {
  const nav = useNavigate()
  return (
    <div className="container page">
      <div className="hero-3">
        <div className="tile">
          <div>
            <div className="title">Sports Analyse</div>
            <div className="sub">Upload a clip for Sit-ups, High Jump, or Standing Long Jump. Real-time keypoints & feedback.</div>
          </div>
          <div>
            <button className="btn" onClick={()=>nav('/analyze')}>Open Analyzer</button>
            <div className="badgebar" style={{marginTop:10}}>
              <span className="badge">{apiUp ? 'API connected' : 'API offline'}</span>
              <span className="badge">On-device Pose</span>
              <span className="badge">No Cloud</span>
            </div>
          </div>
        </div>

        <div className="tile">
          <div>
            <div className="title">Make & Create Network</div>
            <div className="sub">Create public/private groups. Private groups have a join key. Share photos & chat.</div>
          </div>
          <button className="btn" onClick={()=>nav('/network')}>Open Network</button>
        </div>

        <div className="tile">
          <div>
            <div className="title">Rewards</div>
            <div className="sub">Login to earn points for uploads and verified attempts. See the leaderboard.</div>
          </div>
          <button className="btn" onClick={()=>nav('/rewards')}>View Rewards</button>
        </div>
      </div>
    </div>
  )
}
