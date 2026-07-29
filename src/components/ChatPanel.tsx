import { useEffect, useRef, useState } from 'react'
import { MEMBERS, memberOf } from '../members'
import type { ChatMessage } from '../types'

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatDivider(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  return sameDay ? 'Today' : d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function ChatPanel({
  messages,
  onSend,
  onDelete,
  activeSender,
  onSwitchSender,
}: {
  messages: ChatMessage[]
  onSend: (text: string) => void
  onDelete: (id: string) => void
  activeSender: string
  onSwitchSender: (id: string) => void
}) {
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  const sender = memberOf(activeSender)

  return (
    <section className="chat-panel">
      <header className="chat-header">
        <div className="chat-header-avatars">
          {MEMBERS.map((m) => (
            <span key={m.id} className="chat-header-avatar" style={{ background: m.color }}>
              {m.emoji}
            </span>
          ))}
        </div>
        <div className="chat-header-info">
          <div className="chat-header-name">The Girls</div>
          <div className="chat-header-sub">{MEMBERS.map((m) => m.name).join(', ')}</div>
        </div>
      </header>

      <div className="messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="messages-empty">
            <p>No messages yet.</p>
            <p className="messages-empty-sub">Pick who you're texting as below and say hi ♡</p>
          </div>
        )}
        {messages.map((m, i) => {
          const s = memberOf(m.senderId)
          const mine = m.senderId === activeSender
          const prev = messages[i - 1]
          const showDivider = !prev || new Date(prev.time).toDateString() !== new Date(m.time).toDateString()
          const showName = !mine && (!prev || prev.senderId !== m.senderId || showDivider)
          return (
            <div key={m.id}>
              {showDivider && <div className="day-divider">{formatDivider(m.time)}</div>}
              <div className={`message-row ${mine ? 'mine' : ''}`}>
                {!mine && (
                  <span className="message-avatar" style={{ background: s.color }} title={s.name}>
                    {s.emoji}
                  </span>
                )}
                <div className="message-col">
                  {showName && <div className="message-sender">{s.name}</div>}
                  <div className="message-bubble-wrap">
                    <div className="message-bubble" style={mine ? { background: s.color } : undefined}>
                      {m.text}
                    </div>
                    <button className="message-delete" onClick={() => onDelete(m.id)} aria-label="Delete message">
                      ×
                    </button>
                  </div>
                  <div className="message-time">{formatTime(m.time)}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="composer">
        <div className="sender-switcher">
          <span className="sender-switcher-label">Texting as</span>
          {MEMBERS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`sender-pill ${activeSender === m.id ? 'active' : ''}`}
              style={activeSender === m.id ? { background: m.color, borderColor: m.color } : undefined}
              onClick={() => onSwitchSender(m.id)}
            >
              <span>{m.emoji}</span> {m.name}
            </button>
          ))}
        </div>
        <div className="composer-input-row">
          <input
            type="text"
            value={text}
            placeholder={`Message as ${sender.name}...`}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="send-btn" onClick={handleSend} type="button" disabled={!text.trim()}>
            Send
          </button>
        </div>
      </div>
    </section>
  )
}
