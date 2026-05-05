import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Home, PlusSquare, Mail, User } from 'lucide-react'
import { auth, db } from '../firebase/config'
import { collection, onSnapshot, query, where } from 'firebase/firestore'

function BottomNav() {
  const [hasInboxNotification, setHasInboxNotification] = useState(false)

  useEffect(() => {
    const user = auth.currentUser

    if (!user) return

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('users', 'array-contains', user.uid)
    )

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      setHasInboxNotification(!snapshot.empty)
    })

    return () => unsubscribe()
  }, [])

  return (
    <nav className="bottom-nav">
      <Link to="/home" className="nav-item">
        <Home size={20} />
        <span>Home</span>
      </Link>

      <Link to="/add-post" className="nav-item add-btn">
        <PlusSquare size={28} />
      </Link>

      <Link to="/inbox" className="nav-item inbox-nav-item">
        <div className="inbox-icon-wrapper">
          <Mail size={20} />
          {hasInboxNotification && <span className="notification-dot"></span>}
        </div>

        <span>Inbox</span>
      </Link>

      <Link to="/profile" className="nav-item">
        <User size={20} />
        <span>Profile</span>
      </Link>
    </nav>
  )
}

export default BottomNav