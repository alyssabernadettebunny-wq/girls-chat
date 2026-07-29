import { memberOf } from '../members'
import type { ChatMessage, Thread } from '../types'

function formatPreviewTime(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  return sameDay
    ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function previewText(m: ChatMessage) {
  if (m.imageDataUrl && !m.text) return '📷 Photo'
  if (m.imageDataUrl) return `📷 ${m.text}`
  return m.text
}

export default function Sidebar({
  threads,
  messages,
  activeThreadId,
  onSwitchThread,
}: {
  threads: Thread[]
  messages: ChatMessage[]
  activeThreadId: string
  onSwitchThread: (id: string) => void
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>The Girls</h1>
      </div>
      <div className="thread-list">
        {threads.map((thread) => {
          const threadMessages = messages.filter((m) => m.threadId === thread.id)
          const last = threadMessages[threadMessages.length - 1]
          const members = thread.memberIds.map(memberOf)
          return (
            <button
              key={thread.id}
              className={`thread-item ${activeThreadId === thread.id ? 'active' : ''}`}
              type="button"
              onClick={() => onSwitchThread(thread.id)}
            >
              <div className="thread-avatars" style={{ gridTemplateColumns: `repeat(${members.length > 1 ? 2 : 1}, 1fr)` }}>
                {members.map((m) => (
                  <span key={m.id} className="thread-avatar" style={{ background: m.color }}>
                    {m.emoji}
                  </span>
                ))}
              </div>
              <div className="thread-info">
                <div className="thread-row-top">
                  <span className="thread-name">{thread.name}</span>
                  {last && <span className="thread-time">{formatPreviewTime(last.time)}</span>}
                </div>
                <div className="thread-preview">{last ? previewText(last) : 'Say hi to start the chat ♡'}</div>
              </div>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
