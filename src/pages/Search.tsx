import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { Search as SearchIcon, X } from 'lucide-react'
import { db } from '../firebase/config'
import BottomNav from '../components/BottomNav'

type Post = {
  id: string
  imageUrl: string
  title?: string
  description?: string
  category?: string
  price?: number
}

function Search() {
  const navigate = useNavigate()

  const [posts, setPosts] = useState<Post[]>([])
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRef = collection(db, 'posts')
        const q = query(postsRef, orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)

        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[]

        setPosts(postsData)
      } catch (error) {
        console.error('Error loading search posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts = posts.filter((post) => {
    const text = searchText.toLowerCase()

    return (
      post.title?.toLowerCase().includes(text) ||
      post.description?.toLowerCase().includes(text) ||
      post.category?.toLowerCase().includes(text)
    )
  })

  return (
    <>
      <main className="search-page">
        <section className="search-header">
          <button
            type="button"
            className="close-btn"
            onClick={() => navigate(-1)}
          >
            ✕
          </button>

          <h1 className="search-title">Search</h1>

          <div className="header-space"></div>
        </section>

        <section className="search-box-wrapper">
          <div className="search-box">
            <SearchIcon size={18} />

            <input
              type="text"
              placeholder="Search items..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              autoFocus
            />

            {searchText && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchText('')}
                aria-label="Clear search"
                title="Clear search"
>
               <X size={16} />
               </button>
            )}
          </div>
        </section>

        <section className="search-results">
          {loading ? (
            <p className="profile-message">Loading items...</p>
          ) : filteredPosts.length === 0 ? (
            <p className="profile-message">No items found.</p>
          ) : (
            <div className="profile-posts-grid">
              {filteredPosts.map((post) => (
                <article key={post.id} className="profile-post-card">
                  <img
                    src={post.imageUrl}
                    alt={post.title || 'Item'}
                    className="profile-post-image"
                  />

                  <div className="profile-post-content">
                    <h4 className="profile-post-title">
                      {post.title || 'Untitled item'}
                    </h4>

                    <div className="profile-post-details">
                      <span className="profile-post-category">
                        {post.category || 'Item'}
                      </span>

                      <span className="profile-post-price">
                        €{post.price || 0}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="shop-btn"
                      onClick={() => navigate(`/product/${post.id}`)}
                    >
                      View Item
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </>
  )
}

export default Search