import { useLocalStorage } from './hooks/useLocalStorage'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import type { ChatMessage } from './types'
import './App.css'

function App() {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('girlschat.messages', [])
  const [activeSender, setActiveSender] = useLocalStorage('girlschat.activeSender', 'mom')

  function sendMessage(text: string) {
    setMessages([...messages, { id: crypto.randomUUID(), senderId: activeSender, text, time: Date.now() }])
  }

  function deleteMessage(id: string) {
    setMessages(messages.filter((m) => m.id !== id))
  }

  return (
    <div className="app-shell">
      <Sidebar messages={messages} />
      <ChatPanel
        messages={messages}
        onSend={sendMessage}
        onDelete={deleteMessage}
        activeSender={activeSender}
        onSwitchSender={setActiveSender}
      />
    </div>
  )
}

export default App
