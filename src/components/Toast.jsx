import { useEffect, useState } from 'react'

const ss = { fontFamily:"'Sarabun',sans-serif" }

const ICONS = {
  loading: '⏳',
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
}

const COLORS = {
  loading: { bg:'#1e293b', text:'#f1f5f9', border:'#334155' },
  success: { bg:'#166534', text:'#f0fdf4', border:'#22c55e' },
  error:   { bg:'#991b1b', text:'#fef2f2', border:'#ef4444' },
  info:    { bg:'#1e40af', text:'#eff6ff', border:'#3b82f6' },
}

// Global toast state
let _setToasts = null
export const setToastFn = (fn) => { _setToasts = fn }

export function showToast(message, type = 'info', duration = 3000) {
  if (!_setToasts) return
  const id = Date.now()
  _setToasts(t => [...t, { id, message, type }])
  if (type !== 'loading' && duration > 0) {
    setTimeout(() => {
      _setToasts(t => t.filter(x => x.id !== id))
    }, duration)
  }
  return id
}

export function updateToast(id, message, type, duration = 3000) {
  if (!_setToasts) return
  _setToasts(t => t.map(x => x.id === id ? { ...x, message, type } : x))
  if (type !== 'loading' && duration > 0) {
    setTimeout(() => {
      _setToasts(t => t.filter(x => x.id !== id))
    }, duration)
  }
}

export function hideToast(id) {
  if (!_setToasts) return
  _setToasts(t => t.filter(x => x.id !== id))
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])
  useEffect(() => { setToastFn(setToasts) }, [])

  return (
    <div style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:9999,
      display:'flex', flexDirection:'column', gap:'8px', pointerEvents:'none' }}>
      {toasts.map(t => {
        const c = COLORS[t.type] || COLORS.info
        return (
          <div key={t.id} style={{
            background: c.bg, color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius:'12px', padding:'12px 18px',
            fontSize:'14px', fontWeight:'500',
            display:'flex', alignItems:'center', gap:'10px',
            boxShadow:'0 4px 20px rgba(0,0,0,0.3)',
            minWidth:'240px', maxWidth:'340px',
            animation:'slideIn 0.2s ease',
            pointerEvents:'all', ...ss,
          }}>
            <span style={{ fontSize:'18px', flexShrink:0 }}>
              {t.type === 'loading'
                ? <span style={{ display:'inline-block', animation:'spin 1s linear infinite' }}>⏳</span>
                : ICONS[t.type]}
            </span>
            <span>{t.message}</span>
          </div>
        )
      })}
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
        @keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
      `}</style>
    </div>
  )
}
