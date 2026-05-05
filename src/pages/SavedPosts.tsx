// Importa hooks do React
import { useEffect, useState } from 'react'

// Importa auth e db do Firebase
import { auth, db } from '../firebase/config'

// Importa funções do Firestore
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'

// Importa navegação
import { useNavigate } from 'react-router-dom'

// Importa a navbar inferior
import BottomNav from '../components/BottomNav'

// Tipo dos posts salvos
type SavedPost = {
  id: string
  username?: string
  userPhoto?: string
  imageUrl: string
  title?: string
  description?: string
  price: number
  category: string
}

// Componente da página de posts salvos
function SavedPosts() {
  // Hook de navegação
  const navigate = useNavigate()

  // Estado que guarda os posts salvos
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])

  // Estado de carregamento
  const [loading, setLoading] = useState(true)

  // Estado para mensagem de erro
  const [error, setError] = useState('')

  // useEffect executa quando a página carrega
  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        // Ativa loading e limpa erro
        setLoading(true)
        setError('')

        // Pega o usuário logado
        const user = auth.currentUser

        // Se não houver usuário logado, mostra erro
        if (!user) {
          setError('No user is logged in.')
          return
        }

        // Busca os posts salvos em users/{uid}/savedPosts
        const savedRef = collection(db, 'users', user.uid, 'savedPosts')
        const savedSnapshot = await getDocs(savedRef)

        // Guarda apenas os IDs dos posts salvos
        const savedIds = savedSnapshot.docs.map((docItem) => docItem.id)

        // Se não houver posts salvos, finaliza
        if (savedIds.length === 0) {
          setSavedPosts([])
          return
        }

        // Array para guardar os dados completos dos posts
        const postsData: SavedPost[] = []

        // Para cada ID salvo, busca o post real na collection "posts"
        for (const postId of savedIds) {
          const postRef = doc(db, 'posts', postId)
          const postSnap = await getDoc(postRef)

          // Se o post existir, adiciona no array
          if (postSnap.exists()) {
            postsData.push({
              id: postSnap.id,
              ...postSnap.data(),
            } as SavedPost)
          }
        }

        // Atualiza o estado com os posts encontrados
        setSavedPosts(postsData)
      } catch (err) {
        // Mostra erro no console e na tela
        console.error('Error loading saved posts:', err)
        setError('Error loading saved posts.')
      } finally {
        // Desliga loading no final
        setLoading(false)
      }
    }

    // Chama a função
    fetchSavedPosts()
  }, [])

  return (
    <>
      {/* Conteúdo principal da página */}
      <main className="saved-page">
        {/* Cabeçalho */}
        <section className="saved-header">
          {/* Botão de voltar */}
          <button
            type="button"
            className="saved-back-btn"
            onClick={() => navigate(-1)}
          >
            ←
          </button>

          {/* Título */}
          <h1 className="saved-title">Saved Posts</h1>

          {/* Espaço auxiliar para equilibrar o layout */}
          <div className="saved-header-space"></div>
        </section>

        {/* Estado de loading */}
        {loading ? (
          <p className="saved-message">Loading saved posts...</p>
        ) : error ? (
          // Estado de erro
          <p className="saved-message">{error}</p>
        ) : savedPosts.length === 0 ? (
          // Caso não tenha posts salvos
          <p className="saved-message">You have no saved posts yet.</p>
        ) : (
          // Lista de posts salvos
          <section className="saved-grid">
            {savedPosts.map((post) => (
              <article key={post.id} className="saved-card">
                {/* Imagem do post */}
                <img
                  src={post.imageUrl}
                  alt={post.title || 'Saved post image'}
                  className="saved-card-image"
                />

                {/* Conteúdo do card */}
                <div className="saved-card-content">
                  {/* Username */}
                  <p className="saved-card-username">
                    @{post.username || 'user'}
                  </p>

                  {/* Título */}
                  <h3 className="saved-card-title">
                    {post.title || 'Untitled item'}
                  </h3>

                  {/* Descrição */}
                  <p className="saved-card-description">
                    {post.description || 'No description available.'}
                  </p>

                  {/* Categoria e preço */}
                  <div className="saved-card-details">
                    <span className="saved-card-category">{post.category}</span>
                    <span className="saved-card-price">€{post.price}</span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {/* Navbar inferior */}
      <BottomNav />
    </>
  )
}

// Exporta o componente
export default SavedPosts