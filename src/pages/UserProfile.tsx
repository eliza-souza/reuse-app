import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../firebase/config'
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import BottomNav from '../components/BottomNav'

type UserData = {
  username?: string
  photoURL?: string
  bio?: string
}

type Post = {
  id: string
  imageUrl: string
  title?: string
  price?: number
  category?: string
  isSold?: boolean
}

function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState<UserData | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          setLoading(false)
          return
        }

        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          setUser(userSnap.data() as UserData)
        }

        const postsRef = collection(db, 'posts')
        const q = query(postsRef, where('userId', '==', userId))
        const postsSnap = await getDocs(q)

        const postsData = postsSnap.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        })) as Post[]

        setPosts(postsData)
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (loading) {
    return <p className="profile-message">Loading profile...</p>
  }

  return (
    <>
      <main className="profile-page">
        <section className="profile-header">
          <button className="close-btn" onClick={() => navigate(-1)}>
            ✕
          </button>

          <h1 className="profile-title">Seller Profile</h1>

          <div className="header-space"></div>
        </section>

        <section className="profile-card">
          <div className="profile-avatar-wrapper">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Seller profile"
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-fallback">
                {(user?.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2 className="profile-username">@{user?.username || 'user'}</h2>
          <p className="profile-bio">{user?.bio || 'No bio yet.'}</p>

          <div className="profile-stats">
            <div className="profile-stat">
              <strong>{posts.length}</strong>
              <span>Posts</span>
            </div>
          </div>
        </section>

        <section className="profile-posts-section">
          <h3 className="profile-posts-title">Listings</h3>

          {posts.length === 0 ? (
            <p className="profile-message">No posts yet.</p>
          ) : (
            <div className="profile-posts-grid">
              {posts.map((post) => (
                <article key={post.id} className="profile-post-card">
                  <div className="profile-post-image-wrapper">
                    <img
                      src={post.imageUrl}
                      alt={post.title || 'Post image'}
                      className="profile-post-image"
                    />

                    {post.isSold && <span className="sold-badge">SOLD</span>}
                  </div>

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

export default UserProfile