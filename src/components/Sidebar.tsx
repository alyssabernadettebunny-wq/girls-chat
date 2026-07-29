import { MEMBERS } from '../members'
import type { ChatMessage } from '../types'

function formatPreviewTime(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  return sameDay
    ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function Sidebar({ messages }: { messages: ChatMessage[] }) {
  const last = messages[messages.length - 1]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>The Girls</h1>
      </div>
      <div className="thread-list">
        <button className="thread-item active" type="button">
          <div className="thread-avatars">
            {MEMBERS.map((m) => (
              <span key={m.id} className="thread-avatar" style={{ background: m.color }}>
                {m.emoji}
              </span>
            ))}
          </div>
          <div className="thread-info">
            <div className="thread-row-top">
              <span className="thread-name">The Girls</span>
              {last && <span className="thread-time">{formatPreviewTime(last.time)}</span>}
            </div>
            <div className="thread-preview">{last ? last.text : 'Say hi to start the chat ♡'}</div>
          </div>
        </button>
      </div>
    </aside>
  )
}
