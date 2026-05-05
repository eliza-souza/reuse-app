import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import BottomNav from '../components/BottomNav'
import { FaPaypal } from 'react-icons/fa'

type ProductData = {
  userId?: string
  username?: string
  imageUrl: string
  title?: string
  description?: string
  price: number
  category: string
}

function ProductDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError('')

        if (!id) {
          setError('Product not found.')
          return
        }

        const productRef = doc(db, 'posts', id)
        const productSnap = await getDoc(productRef)

        if (!productSnap.exists()) {
          setError('Product not found.')
          return
        }

        setProduct(productSnap.data() as ProductData)
      } catch (err) {
        console.error('Error loading product:', err)
        setError('Error loading product.')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleContactSeller = async () => {
    const currentUser = auth.currentUser

    if (!currentUser) {
      alert('You need to be logged in to contact the seller.')
      return
    }

    if (!product?.userId) {
      alert('Seller information not available.')
      return
    }

    if (currentUser.uid === product.userId) {
      alert('This is your own item.')
      return
    }

    try {
      const conversationId = [currentUser.uid, product.userId].sort().join('_')

      const conversationRef = doc(db, 'conversations', conversationId)
      const conversationSnap = await getDoc(conversationRef)

      if (!conversationSnap.exists()) {
        await setDoc(conversationRef, {
          users: [currentUser.uid, product.userId],
          productId: id || '',
          productTitle: product.title || 'Untitled item',
          productImage: product.imageUrl || '',
          createdAt: serverTimestamp(),
        })
      }

      navigate(`/inbox/${conversationId}`)
    } catch (err) {
      console.error('Error creating conversation:', err)
      alert('Could not open the conversation.')
    }
  }

  return (
    <>
      <main className="product-page">
        <section className="product-header">
          <button
            type="button"
            className="product-back-btn"
            onClick={() => navigate(-1)}
          >
            ←
          </button>

          <h1 className="product-title">Item Details</h1>

          <div className="product-header-space"></div>
        </section>

        {loading ? (
          <p className="product-message">Loading product...</p>
        ) : error ? (
          <p className="product-message">{error}</p>
        ) : product ? (
          <section className="product-card">
            <img
              src={product.imageUrl}
              alt={product.title || 'Product image'}
              className="product-image"
            />

            <div className="product-content">
              <p className="product-seller">
                Seller: @{product.username || 'user'}
              </p>

              <h2 className="product-item-title">
                {product.title || 'Untitled item'}
              </h2>

              <p className="product-description">
                {product.description || 'No description available.'}
              </p>

              <div className="product-details-row">
                <span className="product-category">{product.category}</span>
                <span className="product-price">€{product.price}</span>
              </div>

              <div className="product-actions">
                <button
                  type="button"
                  className="contact-seller-btn"
                  onClick={handleContactSeller}
                >
                  Contact Seller
                </button>

                <button
                  type="button"
                  className="paypal-btn"
                  onClick={() => window.open('https://www.paypal.com/', '_blank')}
                >
                  <FaPaypal />
                  Pay with PayPal
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <BottomNav />
    </>
  )
}

export default ProductDetails