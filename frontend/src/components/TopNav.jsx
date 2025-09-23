import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

export default function TopNav({ apiUp, loggedIn, onLogout }) {
  const navigate = useNavigate()
  return (
    <div className="topnav">
      <div className="brand">
        <div className="brand-badge">SA</div>
        <span>Sports Assess</span>
      </div>
      <div className="nav-actions">
        <NavLink className={({isActive}) => `tabbtn ${isActive?'active':''}`} to="/">Dashboard</NavLink>
        <NavLink className={({isActive}) => `tabbtn ${isActive?'active':''}`} to="/analyze">Sports Analyse</NavLink>
        <NavLink className={({isActive}) => `tabbtn ${isActive?'active':''}`} to="/network">Make & Create Network</NavLink>
        <NavLink className={({isActive}) => `tabbtn ${isActive?'active':''}`} to="/rewards">Rewards</NavLink>
        <NavLink className={({isActive}) => `tabbtn ${isActive?'active':''}`} to="/instructions">Instructions</NavLink>
        <span className="badge" style={{alignSelf:'center'}}>{apiUp ? 'API connected' : 'API offline'}</span>
        {!loggedIn ? (
          <button className="tabbtn" onClick={()=>navigate('/login')}>Login</button>
        ) : (
          <button className="tabbtn" onClick={onLogout}>Logout</button>
        )}
      </div>
    </div>
  )
}
