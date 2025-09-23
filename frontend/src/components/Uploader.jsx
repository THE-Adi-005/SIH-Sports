import React, { useRef } from 'react'

export default function Uploader({ onSubmit, extraFields }) {
  const ref = useRef(null)
  return (
    <form onSubmit={(e)=>{ e.preventDefault(); const fd = new FormData(e.target); onSubmit(fd); }}>
      <input type="file" name="file" accept="video/*" required />
      {extraFields}
      <div className="row">
        <button type="submit">Analyze</button>
        <button type="button" onClick={()=>ref.current && (ref.current.value = '')} style={{opacity:.8}}>Reset</button>
      </div>
    </form>
  )
}