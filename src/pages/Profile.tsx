import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth, db, storage } from '../firebase/config'
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import BottomNav from '../components/BottomNav'

type UserData = {
  username?: string
  email?: string
  photoURL?: string
  bio?: string
}

type UserPost = {
  id: string
  imageUrl: string
  title?: string
  description?: string
  category: string
  price: number
  isSold?: boolean
}

function Profile() {
  const navigate = useNavigate()

  const [userData, setUserData] = useState<UserData | null>(null)
  const [posts, setPosts] = useState<UserPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPhotoOptions, setShowPhotoOptions] = useState(false)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError('')

        const user = auth.currentUser

        if (!user) {
          setError('No user is logged in.')
          return
        }

        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserData)
        }

        const postsRef = collection(db, 'posts')
        const q = query(postsRef, where('userId', '==', user.uid))
        const postsSnap = await getDocs(q)

        const userPosts = postsSnap.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        })) as UserPost[]

        setPosts(userPosts)
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Error loading profile.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleRemovePhoto = async () => {
    const user = auth.currentUser
    if (!user) return

    try {
      const userRef = doc(db, 'users', user.uid)

      await updateDoc(userRef, {
        photoURL: '',
      })

      const imageRef = ref(storage, `profilePhotos/${user.uid}`)
      await deleteObject(imageRef).catch(() => {})

      setUserData((prev) => (prev ? { ...prev, photoURL: '' } : prev))
      setShowPhotoOptions(false)
    } catch (error) {
      console.error('Error removing profile photo:', error)
    }
  }

  const handleToggleSold = async (postId: string, currentStatus?: boolean) => {
    try {
      const postRef = doc(db, 'posts', postId)

      await updateDoc(postRef, {
        isSold: !currentStatus,
      })

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, isSold: !currentStatus } : post
        )
      )
    } catch (error) {
      console.error('Error updating sold status:', error)
      alert('Error updating item status.')
    }
  }

  const displayName = userData?.username || 'user'
  const displayEmail = userData?.email || auth.currentUser?.email || ''
  const displayPhoto = userData?.photoURL || ''
  const displayBio = userData?.bio || 'No bio yet.'

  return (
    <>
      <main className="profile-page">
        <section className="profile-header">
          <h1 className="profile-title">My Profile</h1>
        </section>

        {loading ? (
          <p className="profile-message">Loading profile...</p>
        ) : error ? (
          <p className="profile-message">{error}</p>
        ) : (
          <>
            <section className="profile-card">
              <div
                className="profile-avatar-wrapper"
                onClick={() => setShowPhotoOptions(!showPhotoOptions)}
              >
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt={`${displayName} profile`}
                    className="profile-avatar"
                  />
                ) : (
                  <div className="profile-avatar-fallback">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {showPhotoOptions && displayPhoto && (
                  <div className="photo-options">
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={handleRemovePhoto}
                    >
                      Remove photo
                    </button>
                  </div>
                )}
              </div>

              <h2 className="profile-username">@{displayName}</h2>
              <p className="profile-email">{displayEmail}</p>
              <p className="profile-bio">{displayBio}</p>

              <div className="profile-stats">
                <div className="profile-stat">
                  <strong>{posts.length}</strong>
                  <span>Posts</span>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  type="button"
                  className="profile-secondary-btn"
                  onClick={() => navigate('/saved')}
                >
                  Saved Posts
                </button>

                <button
                  type="button"
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </section>

            <section className="profile-posts-section">
              <h3 className="profile-posts-title">My Listings</h3>

              {posts.length === 0 ? (
                <p className="profile-message">
                  You have not posted anything yet.
                </p>
              ) : (
                <div className="profile-posts-grid">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className={`profile-post-card ${
                        post.isSold ? 'profile-post-sold' : ''
                      }`}
                    >
                      <div className="profile-post-image-wrapper">
                        <img
                          src={post.imageUrl}
                          alt={post.title || 'Post image'}
                          className="profile-post-image"
                        />

                        {post.isSold && (
                          <span className="sold-badge">SOLD</span>
                        )}
                      </div>

                      <div className="profile-post-content">
                        <h4 className="profile-post-title">
                          {post.title || 'Untitled item'}
                        </h4>

                        <p className="profile-post-description">
                          {post.description || 'No description available.'}
                        </p>

                        <div className="profile-post-details">
                          <span className="profile-post-category">
                            {post.category}
                          </span>
                          <span className="profile-post-price">
                            €{post.price}
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`mark-sold-btn ${
                            post.isSold ? 'sold-active' : ''
                          }`}
                          onClick={() =>
                            handleToggleSold(post.id, post.isSold)
                          }
                        >
                          {post.isSold ? 'Mark as available' : 'Mark as sold'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <BottomNav />
    </>
  )
}

export default Profile