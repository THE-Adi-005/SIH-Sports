import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './styles.css'
import TopNav from './components/TopNav.jsx'
import Dashboard from './components/Dashboard.jsx'
import Analyze from './components/Analyze.jsx'
import Instructions from './components/Instructions.jsx'
import Login from './components/Login.jsx'
import Rewards from './components/Rewards.jsx'
import Network from './components/Network.jsx'
import { health } from './api.js'

export default function App(){
  const [apiUp, setApiUp] = useState(false)
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('sessionToken'))
  const nav = useNavigate()

  useEffect(()=>{ (async()=> setApiUp(await health()))() }, [])

  function onLogout(){
    localStorage.removeItem('sessionToken')
    localStorage.removeItem('username')
    setLoggedIn(false)
    nav('/')
  }

  return (
    <>
      <TopNav apiUp={apiUp} loggedIn={loggedIn} onLogout={onLogout} />
      <Routes>
        <Route path="/" element={<Dashboard apiUp={apiUp} />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/network" element={<Network />} />
      </Routes>
    </>
  )
}
