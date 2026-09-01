const STAMP_CLASS = {
  Pending: 'stamp-pending',
  InProgress: 'stamp-inprogress',
  Resolved: 'stamp-resolved',
  Rejected: 'stamp-rejected',
}

const STAMP_LABEL = {
  Pending: 'Filed — Pending',
  InProgress: 'Under Review',
  Resolved: 'Resolved',
  Rejected: 'Not Upheld',
}

export function StatusStamp({ status }) {
  return (
    <div className={`stamp ${STAMP_CLASS[status] || ''}`}>
      {STAMP_LABEL[status] || status}
    </div>
  )
}

const BADGE_CLASS = {
  Pending: 'badge-pending',
  InProgress: 'badge-inprogress',
  Resolved: 'badge-resolved',
  Rejected: 'badge-rejected',
}

export function StatusBadge({ status }) {
  return <span className={`badge ${BADGE_CLASS[status] || ''}`}>{status}</span>
}
