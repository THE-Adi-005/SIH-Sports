import React, { useState } from 'react'
import { apiLogin, apiRegister } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [username, setU] = useState('')
  const [password, setP] = useState('')
  const [msg, setMsg] = useState(null)
  const nav = useNavigate()

  async function doLogin(){
    const r = await apiLogin(username, password)
    if(!r.ok){ setMsg('Invalid credentials'); return }
    localStorage.setItem('sessionToken', r.token)
    localStorage.setItem('username', username)
    setMsg('Logged in')
    nav('/rewards')
  }
  async function doRegister(){
    const r = await apiRegister(username, password)
    if(!r.ok){ setMsg('User exists?'); return }
    setMsg('Registered. Now login.')
  }

  return (
    <div className="container page">
      <section className="card" style={{maxWidth:480, margin:'0 auto'}}>
        <h2>Login</h2>
        <div className="row" style={{flexDirection:'column', alignItems:'stretch', gap:8}}>
          <input placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} />
          <div className="row" style={{justifyContent:'space-between'}}>
            <button className="btn" onClick={doLogin}>Login</button>
            <button className="btn secondary" onClick={doRegister}>Register</button>
          </div>
          {msg && <div className="feedback">{msg}</div>}
        </div>
      </section>
    </div>
  )
}
