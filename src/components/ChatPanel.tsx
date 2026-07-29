import { useEffect, useRef, useState } from 'react'
import { memberOf } from '../members'
import type { ChatMessage, Thread } from '../types'

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥']

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatDivider(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  return sameDay ? 'Today' : d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ChatPanel({
  thread,
  messages,
  onSend,
  onDelete,
  onEdit,
  onToggleReaction,
  activeSender,
  onSwitchSender,
}: {
  thread: Thread
  messages: ChatMessage[]
  onSend: (text: string, imageDataUrl?: string, replyToId?: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string) => void
  onToggleReaction: (id: string, emoji: string) => void
  activeSender: string
  onSwitchSender: (id: string) => void
}) {
  const [text, setText] = useState('')
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [reactionPickerId, setReactionPickerId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const threadMembers = thread.memberIds.map(memberOf)

  useEffect(() => {
    setReplyTo(null)
    setReactionPickerId(null)
    setEditingId(null)
  }, [thread.id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed && !pendingImage) return
    onSend(trimmed, pendingImage ?? undefined, replyTo?.id)
    setText('')
    setPendingImage(null)
    setReplyTo(null)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingImage(await readAsDataUrl(file))
    e.target.value = ''
  }

  function saveEdit() {
    const trimmed = editingText.trim()
    if (editingId && trimmed) onEdit(editingId, trimmed)
    setEditingId(null)
  }

  const sender = memberOf(activeSender)

  return (
    <section className="chat-panel">
      <header className="chat-header">
        <div className="chat-header-avatars">
          {threadMembers.map((m) => (
            <span key={m.id} className="chat-header-avatar" style={{ background: m.color }}>
              {m.emoji}
            </span>
          ))}
        </div>
        <div className="chat-header-info">
          <div className="chat-header-name">{thread.name}</div>
          <div className="chat-header-sub">{threadMembers.map((m) => m.name).join(', ')}</div>
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
          const repliedMsg = m.replyToId ? messages.find((x) => x.id === m.replyToId) : undefined
          const isEditing = editingId === m.id
          const reactionEntries = Object.entries(m.reactions ?? {}).filter(([, who]) => who.length > 0)

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

                  {repliedMsg && (
                    <div className="reply-quote">
                      <span className="reply-quote-name">{memberOf(repliedMsg.senderId).name}</span>
                      <span className="reply-quote-text">{repliedMsg.text || '📷 Photo'}</span>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="edit-row">
                      <input
                        className="edit-input"
                        value={editingText}
                        autoFocus
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit()
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                      />
                      <button className="edit-save" onClick={saveEdit} type="button">
                        Save
                      </button>
                      <button className="edit-cancel" onClick={() => setEditingId(null)} type="button">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="message-bubble-wrap">
                        <div className="message-bubble" style={mine ? { background: s.color } : undefined}>
                          {m.imageDataUrl && <img className="message-image" src={m.imageDataUrl} alt="attachment" />}
                          {m.text && <div className="message-text">{m.text}</div>}
                          {m.editedAt && <span className="message-edited">(edited)</span>}
                        </div>
                        <div className="message-actions">
                          <button
                            className="message-action"
                            onClick={() => setReactionPickerId(reactionPickerId === m.id ? null : m.id)}
                            aria-label="React"
                          >
                            😊
                          </button>
                          <button className="message-action" onClick={() => setReplyTo(m)} aria-label="Reply">
                            ↩
                          </button>
                          {mine && (
                            <button
                              className="message-action"
                              onClick={() => {
                                setEditingId(m.id)
                                setEditingText(m.text)
                              }}
                              aria-label="Edit"
                            >
                              ✎
                            </button>
                          )}
                          <button className="message-action" onClick={() => onDelete(m.id)} aria-label="Delete">
                            ×
                          </button>
                        </div>
                      </div>

                      {reactionPickerId === m.id && (
                        <div className="reaction-picker">
                          {REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              className="reaction-picker-btn"
                              onClick={() => {
                                onToggleReaction(m.id, emoji)
                                setReactionPickerId(null)
                              }}
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {reactionEntries.length > 0 && (
                        <div className="reaction-row">
                          {reactionEntries.map(([emoji, who]) => (
                            <button
                              key={emoji}
                              className={`reaction-chip ${who.includes(activeSender) ? 'mine' : ''}`}
                              onClick={() => onToggleReaction(m.id, emoji)}
                              type="button"
                              title={who.map((id) => memberOf(id).name).join(', ')}
                            >
                              {emoji} {who.length}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

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
          {threadMembers.map((m) => (
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

        {replyTo && (
          <div className="reply-preview">
            <span className="reply-preview-name">Replying to {memberOf(replyTo.senderId).name}</span>
            <span className="reply-preview-text">{replyTo.text || '📷 Photo'}</span>
            <button className="reply-preview-cancel" onClick={() => setReplyTo(null)} type="button" aria-label="Cancel reply">
              ×
            </button>
          </div>
        )}

        {pendingImage && (
          <div className="pending-image">
            <img src={pendingImage} alt="" />
            <button onClick={() => setPendingImage(null)} type="button" aria-label="Remove photo">
              ×
            </button>
          </div>
        )}

        <div className="composer-input-row">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
          <button className="attach-btn" type="button" onClick={() => fileInputRef.current?.click()} aria-label="Attach photo">
            📎
          </button>
          <input
            type="text"
            value={text}
            placeholder={`Message as ${sender.name}...`}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="send-btn" onClick={handleSend} type="button" disabled={!text.trim() && !pendingImage}>
            Send
          </button>
        </div>
      </div>
    </section>
  )
}
