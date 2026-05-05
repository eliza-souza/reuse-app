import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import { auth, db, storage } from '../firebase/config'
import PostCard from '../components/PostCard.tsx'
import BottomNav from '../components/BottomNav'
import { Search } from 'lucide-react'

type Post = {
  id: string
  userId?: string
  username?: string
  userPhoto?: string
  imageUrl: string
  title?: string
  description?: string
  price: number
  category: string
}

function Home() {
  const navigate = useNavigate()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRef = collection(db, 'posts')
        const q = query(postsRef, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)

        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[]

        setPosts(postsData)
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleDeletePost = async (postId: string, imageUrl: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this post?'
    )

    if (!confirmDelete) return

    try {
      await deleteDoc(doc(db, 'posts', postId))

      if (imageUrl) {
        const imageRef = ref(storage, imageUrl)
        await deleteObject(imageRef)
      }

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId)
      )
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post. Please try again.')
    }
  }

  return (
    <>
      <main className="home-page">
        <section className="home-header">
          <div className="top-bar">
            <div className="top-bar-spacer"></div>

            <h1 className="home-logo">ReUse</h1>

            <div className="home-icons">
              <button
                type="button"
                className="icon-btn"
                aria-label="Search"
                onClick={() => navigate('/search')}
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="home-text">
            <h2 className="home-title">Find your next favorite look</h2>
            <p className="home-subtitle">
              Discover and shop second-hand looks from your community.
            </p>
          </div>
        </section>

        <section className="posts-grid">
          {loading ? (
            <p>Loading posts...</p>
          ) : posts.length === 0 ? (
            <p>No posts found.</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                postId={post.id}
                userId={post.userId}
                username={post.username || 'user'}
                userPhoto={post.userPhoto}
                imageUrl={post.imageUrl}
                caption={post.description || post.title || ''}
                price={post.price}
                category={post.category}
                canDelete={post.userId === auth.currentUser?.uid}
                onDelete={() => handleDeletePost(post.id, post.imageUrl)}
              />
            ))
          )}
        </section>
      </main>

      <BottomNav />
    </>
  )
}

export default Home