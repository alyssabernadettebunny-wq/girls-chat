import { useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import { THREADS, threadOf } from './threads'
import type { ChatMessage } from './types'
import './App.css'

function App() {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('girlschat.messages', [])
  const [activeThreadId, setActiveThreadId] = useLocalStorage('girlschat.activeThread', 'group')
  const [activeSender, setActiveSender] = useLocalStorage('girlschat.activeSender', 'mom')

  const activeThread = threadOf(activeThreadId)

  // keep the active sender valid whenever the thread changes to one that doesn't include them
  useEffect(() => {
    if (!activeThread.memberIds.includes(activeSender)) {
      setActiveSender(activeThread.memberIds[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThreadId])

  function sendMessage(text: string, imageDataUrl?: string, replyToId?: string) {
    setMessages([
      ...messages,
      { id: crypto.randomUUID(), threadId: activeThreadId, senderId: activeSender, text, time: Date.now(), imageDataUrl, replyToId },
    ])
  }

  function deleteMessage(id: string) {
    setMessages(messages.filter((m) => m.id !== id))
  }

  function editMessage(id: string, text: string) {
    setMessages(messages.map((m) => (m.id === id ? { ...m, text, editedAt: Date.now() } : m)))
  }

  function toggleReaction(id: string, emoji: string) {
    setMessages(
      messages.map((m) => {
        if (m.id !== id) return m
        const reactions = { ...(m.reactions ?? {}) }
        const who = new Set(reactions[emoji] ?? [])
        if (who.has(activeSender)) who.delete(activeSender)
        else who.add(activeSender)
        if (who.size === 0) delete reactions[emoji]
        else reactions[emoji] = [...who]
        return { ...m, reactions }
      }),
    )
  }

  return (
    <div className="app-shell">
      <Sidebar threads={THREADS} messages={messages} activeThreadId={activeThreadId} onSwitchThread={setActiveThreadId} />
      <ChatPanel
        thread={activeThread}
        messages={messages.filter((m) => m.threadId === activeThreadId)}
        onSend={sendMessage}
        onDelete={deleteMessage}
        onEdit={editMessage}
        onToggleReaction={toggleReaction}
        activeSender={activeSender}
        onSwitchSender={setActiveSender}
      />
    </div>
  )
}

export default App
