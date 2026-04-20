import { STATUS_LABELS } from '../utils/roles'

const CONFIG = {
  wait_dept_head: { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  wait_asst_dir:  { bg: '#f5f3ff', color: '#5b21b6', dot: '#8b5cf6' },
  wait_dept:      { bg: '#ecfeff', color: '#155e75', dot: '#06b6d4' },
  completed:      { bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  returned:       { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
}

export default function StatusBadge({ status }) {
  const c = CONFIG[status] || { bg: 'var(--bg)', color: 'var(--text-muted)', dot: '#94a3b8' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: c.bg, color: c.color,
      padding: '3px 10px', borderRadius: '100px',
      fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {STATUS_LABELS[status] || status}
    </span>
  )
}
