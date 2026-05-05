// Importa hooks do React
import { useEffect, useState } from 'react'

// Importa navegação e leitura do parâmetro da rota
import { useNavigate, useParams } from 'react-router-dom'

// Importa auth e db configurados
import { auth, db } from '../firebase/config'

// Importa funções do Firestore
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

// Importa navbar inferior
import BottomNav from '../components/BottomNav'

// Tipo de uma conversa
type ConversationItem = {
  id: string
  users?: string[]
  productTitle?: string
  productImage?: string
  lastMessage?: string
  lastSenderId?: string
  readBy?: string[]
  otherUsername?: string
  otherPhoto?: string
}

// Tipo de uma mensagem
type MessageItem = {
  id: string
  text: string
  senderId: string
}

// Tipo dos dados do usuário
type UserData = {
  username?: string
  photoURL?: string
}

// Componente da página de inbox
function Inbox() {
  // Hook de navegação
  const navigate = useNavigate()

  // Pega o ID da conversa da URL
  const { id } = useParams()

  // Estado das conversas
  const [conversations, setConversations] = useState<ConversationItem[]>([])

  // Estado das mensagens
  const [messages, setMessages] = useState<MessageItem[]>([])

  // Estado do texto da nova mensagem
  const [messageText, setMessageText] = useState('')

  // Estado de loading
  const [loading, setLoading] = useState(false)

  // ID do usuário logado
  const currentUserId = auth.currentUser?.uid || ''

  // Carrega conversas em tempo real
  useEffect(() => {
    const user = auth.currentUser

    if (!user) return

    // Query para buscar conversas onde o usuário participa
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('users', 'array-contains', user.uid)
    )

    // onSnapshot escuta conversas em tempo real
    const unsubscribe = onSnapshot(
      conversationsQuery,
      async (snapshot) => {
        // Para cada conversa, buscamos também os dados da outra pessoa
        const data = await Promise.all(
          snapshot.docs.map(async (conversationDoc) => {
            const conversationData = conversationDoc.data()

            // Lista de usuários da conversa
            const users = conversationData.users || []

            // Descobre quem é a outra pessoa na conversa
            const otherUserId = users.find((uid: string) => uid !== user.uid)

            let otherUsername = 'user'
            let otherPhoto = ''

            // Busca os dados da outra pessoa em users/{uid}
            if (otherUserId) {
              const otherUserRef = doc(db, 'users', otherUserId)
              const otherUserSnap = await getDoc(otherUserRef)

              if (otherUserSnap.exists()) {
                const otherUserData = otherUserSnap.data() as UserData
                otherUsername = otherUserData.username || 'user'
                otherPhoto = otherUserData.photoURL || ''
              }
            }

            return {
              id: conversationDoc.id,
              ...conversationData,
              otherUsername,
              otherPhoto,
            } as ConversationItem
          })
        )

        setConversations(data)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading conversations:', error)
        setLoading(false)
      }
    )

    // Limpa o listener quando sair da página
    return () => unsubscribe()
  }, [])

  // Marca conversa como lida quando o usuário abre a conversa
  useEffect(() => {
    const markConversationAsRead = async () => {
      const user = auth.currentUser

      if (!user || !id) return

      try {
        const conversationRef = doc(db, 'conversations', id)

        // Adiciona o usuário atual no array readBy
        await updateDoc(conversationRef, {
          readBy: arrayUnion(user.uid),
        })
      } catch (error) {
        console.error('Error marking conversation as read:', error)
      }
    }

    markConversationAsRead()
  }, [id])

  // Carrega mensagens da conversa selecionada em tempo real
  useEffect(() => {
    if (!id) {
      setMessages([])
      return
    }

    // Referência da subcollection messages
    const messagesRef = collection(db, 'conversations', id, 'messages')

    // Query para ordenar mensagens pela data
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'))

    // Escuta mensagens em tempo real
    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const data = snapshot.docs.map((messageDoc) => ({
          id: messageDoc.id,
          ...messageDoc.data(),
        })) as MessageItem[]

        setMessages(data)
      },
      (error) => {
        console.error('Error loading messages:', error)
      }
    )

    // Limpa o listener ao trocar de conversa
    return () => unsubscribe()
  }, [id])

  // Função de enviar mensagem
  const handleSendMessage = async () => {
    const user = auth.currentUser

    if (!user || !id || !messageText.trim()) return

    try {
      const cleanMessage = messageText.trim()

      // Salva mensagem no Firestore
      await addDoc(collection(db, 'conversations', id, 'messages'), {
        text: cleanMessage,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      })

      // Atualiza a conversa com dados da última mensagem
      await updateDoc(doc(db, 'conversations', id), {
        lastMessage: cleanMessage,
        lastSenderId: user.uid,
        lastMessageAt: serverTimestamp(),
        readBy: [user.uid],
      })

      // Limpa input
      setMessageText('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <>
      <main className="inbox-page">
        {/* Cabeçalho */}
        <section className="inbox-header">
          <h1 className="inbox-title">Inbox</h1>
        </section>

        {/* Layout principal */}
        <section className="inbox-layout">
          {/* Lista de conversas */}
          <aside className="conversation-list">
            {loading ? (
              <p className="inbox-message">Loading conversations...</p>
            ) : conversations.length === 0 ? (
              <p className="inbox-message">No conversations yet.</p>
            ) : (
              conversations.map((conversation) => {
                // Verifica se a conversa tem mensagem não lida
                const isUnread =
                  conversation.lastSenderId !== currentUserId &&
                  !(conversation.readBy || []).includes(currentUserId)

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`conversation-item ${
                      id === conversation.id ? 'active-conversation' : ''
                    }`}
                    onClick={() => navigate(`/inbox/${conversation.id}`)}
                  >
                    {/* Foto da outra pessoa */}
                    {conversation.otherPhoto ? (
                      <img
                        src={conversation.otherPhoto}
                        alt={`${conversation.otherUsername} profile`}
                        className="conversation-user-photo"
                      />
                    ) : (
                      <div className="conversation-user-fallback">
                        {conversation.otherUsername?.charAt(0).toUpperCase() ||
                          'U'}
                      </div>
                    )}

                    {/* Informações da conversa */}
                    <div className="conversation-info">
                      <p className="conversation-title">
                        @{conversation.otherUsername || 'user'}
                      </p>

                      <p className="conversation-subtitle">
                        {conversation.lastMessage ||
                          conversation.productTitle ||
                          'Open chat'}
                      </p>
                    </div>

                    {/* Bolinha vermelha dentro da conversa */}
                    {isUnread && <span className="conversation-dot"></span>}
                  </button>
                )
              })
            )}
          </aside>

          {/* Área de mensagens */}
          <section className="chat-area">
            {!id ? (
              <p className="inbox-message">Select a conversation.</p>
            ) : (
              <>
                {/* Lista de mensagens */}
                <div className="messages-list">
                  {messages.length === 0 ? (
                    <p className="inbox-message">No messages yet.</p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message-bubble ${
                          message.senderId === currentUserId
                            ? 'my-message'
                            : 'other-message'
                        }`}
                      >
                        {message.text}
                      </div>
                    ))
                  )}
                </div>

                {/* Campo de envio */}
                <div className="message-input-area">
                  <input
                    type="text"
                    className="message-input"
                    placeholder="Write a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage()
                      }
                    }}
                  />

                  <button
                    type="button"
                    className="send-message-btn"
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </section>
        </section>
      </main>

      {/* Navbar inferior */}
      <BottomNav />
    </>
  )
}

// Exporta o componente
export default Inbox