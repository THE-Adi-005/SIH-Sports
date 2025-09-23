import React, { useEffect, useState } from 'react'
import { netCreate, netList, netJoin, netPost, netFeed } from '../api'

export default function Network(){
  const [name, setName] = useState('')
  const [visibility, setVis] = useState('public')
  const [nets, setNets] = useState([])
  const [joinId, setJoinId] = useState('')
  const [joinKey, setJoinKey] = useState('')
  const [active, setActive] = useState(null)
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [posts, setPosts] = useState([])

  async function refresh(){ const r = await netList(); setNets(r.nets || []) }
  useEffect(()=>{ refresh() }, [])

  async function create(){
    const r = await netCreate(name, visibility)
    await refresh()
    alert(`Created ${r.id}${r.key ? " (key: "+r.key+")" : ""}`)
    setName('')
  }

  async function join(){
    const r = await netJoin(joinId, joinKey || undefined)
    if(!r.ok){ alert('Join failed'); return }
    setActive(joinId); loadFeed(joinId)
  }

  async function loadFeed(nid){
    const r = await netFeed(nid)
    if(r.ok) setPosts(r.posts || [])
  }

  async function post(){
    if(!active) return
    const r = await netPost(active, text, file)
    setText(''); setFile(null)
    loadFeed(active)
  }

  return (
    <div className="container page">
      <div className="cols-3">
        <section className="card">
          <h3>Create Network</h3>
          <input placeholder="Network name" value={name} onChange={e=>setName(e.target.value)} />
          <div className="row" style={{marginTop:8}}>
            <label>Visibility:&nbsp;
              <select value={visibility} onChange={e=>setVis(e.target.value)}>
                <option value="public">Public</option>
                <option value="private">Private (key)</option>
              </select>
            </label>
          </div>
          <button className="btn" style={{marginTop:10}} onClick={create}>Create</button>
          <p className="muted" style={{marginTop:10}}>Private networks generate a join key. Share it to allow access.</p>
        </section>

        <section className="card">
          <h3>Available Networks</h3>
          <ul>
            {nets.map(n=>(<li key={n.id}><b>{n.name}</b> — {n.visibility} (id: {n.id})</li>))}
          </ul>
        </section>

        <section className="card">
          <h3>Join Network</h3>
          <input placeholder="Network ID" value={joinId} onChange={e=>setJoinId(e.target.value)} />
          <input placeholder="Key (if private)" value={joinKey} onChange={e=>setJoinKey(e.target.value)} />
          <button className="btn" style={{marginTop:10}} onClick={join}>Join</button>
        </section>
      </div>

      {active && (
        <section className="card" style={{marginTop:16}}>
          <h3>Room: {active}</h3>
          <div className="row" style={{gap:8, marginBottom:8}}>
            <input placeholder="Say something..." value={text} onChange={e=>setText(e.target.value)} />
            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
            <button className="btn" onClick={post}>Post</button>
          </div>
          <div>
            {(posts||[]).slice().reverse().map(p=>(
              <div key={p.id} className="card" style={{marginTop:8}}>
                {p.text && <div>{p.text}</div>}
                {p.media && <img src={p.media} alt="" style={{maxWidth:'100%', borderRadius:12, marginTop:6}} />}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
