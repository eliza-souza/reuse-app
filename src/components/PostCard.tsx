import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Bookmark, Trash2 } from 'lucide-react'

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from 'firebase/firestore'

import { auth, db } from '../firebase/config'

type PostCardProps = {
  postId: string
  userId?: string
  username: string
  userPhoto?: string
  imageUrl: string
  caption: string
  price: number
  category: string
  canDelete?: boolean
  onDelete?: () => void
}

type CommentItem = {
  id: string
  text: string
  username?: string
}

function PostCard({
  postId,
  userId,
  username,
  userPhoto,
  imageUrl,
  caption,
  price,
  category,
  canDelete = false,
  onDelete,
}: PostCardProps) {
  const navigate = useNavigate()
  const displayName = username || 'user'

  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<CommentItem[]>([])
  const [likesCount, setLikesCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)

  useEffect(() => {
    const loadPostData = async () => {
      try {
        const user = auth.currentUser
        const postRef = doc(db, 'posts', postId)
        const postSnap = await getDoc(postRef)

        if (postSnap.exists()) {
          const postData = postSnap.data()
          const likedBy = postData.likedBy || []

          setLikesCount(likedBy.length)

          if (user) {
            setLiked(likedBy.includes(user.uid))
          }
        }

        const commentsRef = collection(db, 'posts', postId, 'comments')
        const commentsSnap = await getDocs(commentsRef)

        const commentsData = commentsSnap.docs.map((commentDoc) => ({
          id: commentDoc.id,
          ...commentDoc.data(),
        })) as CommentItem[]

        setComments(commentsData)
        setCommentsCount(commentsData.length)

        if (user) {
          const savedRef = doc(db, 'users', user.uid, 'savedPosts', postId)
          const savedSnap = await getDoc(savedRef)
          setSaved(savedSnap.exists())
        }
      } catch (error) {
        console.error('Error loading post data:', error)
      }
    }

    loadPostData()
  }, [postId])

  const handleOpenUserProfile = () => {
    if (!userId) {
      alert('User profile not available.')
      return
    }

    navigate(`/user/${userId}`)
  }

  const handleToggleLike = async () => {
    const user = auth.currentUser

    if (!user) {
      alert('You need to be logged in to like a post.')
      return
    }

    try {
      const postRef = doc(db, 'posts', postId)

      if (liked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(user.uid),
        })
        setLiked(false)
        setLikesCount((prev) => prev - 1)
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(user.uid),
        })
        setLiked(true)
        setLikesCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error('Error updating like:', error)
    }
  }

  const handleToggleSave = async () => {
    const user = auth.currentUser

    if (!user) {
      alert('You need to be logged in to save a post.')
      return
    }

    try {
      const savedRef = doc(db, 'users', user.uid, 'savedPosts', postId)

      if (saved) {
        await deleteDoc(savedRef)
        setSaved(false)
      } else {
        await setDoc(savedRef, {
          postId,
          savedAt: serverTimestamp(),
        })
        setSaved(true)
      }
    } catch (error) {
      console.error('Error saving post:', error)
    }
  }

  const handleAddComment = async () => {
    const user = auth.currentUser

    if (!user) {
      alert('You need to be logged in to comment.')
      return
    }

    if (!comment.trim()) return

    try {
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      let currentUsername = 'user'

      if (userSnap.exists()) {
        const userData = userSnap.data()
        currentUsername = userData.username || 'user'
      }

      const commentsRef = collection(db, 'posts', postId, 'comments')

      const newCommentRef = await addDoc(commentsRef, {
        text: comment,
        userId: user.uid,
        username: currentUsername,
        createdAt: serverTimestamp(),
      })

      const newComment: CommentItem = {
        id: newCommentRef.id,
        text: comment,
        username: currentUsername,
      }

      setComments((prev) => [...prev, newComment])
      setCommentsCount((prev) => prev + 1)
      setComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete()
    }
  }

  return (
    <article className="post-card">
      <div className="post-header">
        <div
          className="post-user-info clickable-user"
          onClick={handleOpenUserProfile}
        >
          {userPhoto ? (
            <img
              src={userPhoto}
              alt={`${displayName} profile`}
              className="post-avatar"
            />
          ) : (
            <div className="post-avatar-fallback">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <p className="post-username">@{displayName}</p>
        </div>
      </div>

      <div className="post-image-wrapper">
        <img
          src={imageUrl}
          alt={`Post by ${displayName}`}
          className="post-image"
        />

        {canDelete && (
          <button
            type="button"
            className="delete-post-btn"
            onClick={handleDeleteClick}
            aria-label="Delete post"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="post-content">
        <div className="post-actions">
          <button
            type="button"
            className={`action-btn ${liked ? 'liked' : ''}`}
            aria-label="Like post"
            onClick={handleToggleLike}
          >
            <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          </button>

          <button
            type="button"
            className="action-btn"
            aria-label="Comment on post"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={20} />
          </button>

          <button
            type="button"
            className={`action-btn ${saved ? 'saved' : ''}`}
            aria-label="Save post"
            onClick={handleToggleSave}
          >
            <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="post-meta">
          <span>{likesCount} likes</span>
          <span>{commentsCount} comments</span>
        </div>

        {showComments && (
          <div className="comments-wrapper">
            <div className="comments-box">
              <input
                type="text"
                placeholder="Write a comment..."
                className="comment-input"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <button
                type="button"
                className="comment-btn"
                onClick={handleAddComment}
              >
                Post
              </button>
            </div>

            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet.</p>
              ) : (
                comments.map((item) => (
                  <div key={item.id} className="comment-item">
                    <strong>@{item.username || 'user'}</strong> {item.text}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <p className="post-caption">{caption}</p>

        <div className="post-details">
          <span className="post-category">{category}</span>
          <span className="post-price">€{price}</span>
        </div>

        <button
          type="button"
          className="shop-btn"
          onClick={() => navigate(`/product/${postId}`)}
        >
          View Item
        </button>
      </div>
    </article>
  )
}

export default PostCard