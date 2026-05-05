// Importa hooks do React
import { useRef, useState } from 'react'

// Importa navegação
import { useNavigate } from 'react-router-dom'

// Importa ícone de lixeira
import { Trash2 } from 'lucide-react'

// Importa funções do Firebase Storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// Importa funções do Firestore
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'

// Importa serviços configurados
import { auth, db, storage } from '../firebase/config'

// Lista de categorias disponíveis
const categories = [
  'Women',
  'Bag',
  'Men',
  'Kids',
  'Home',
  'Electronics',
  'Sports',
]

// Componente da página de adicionar post
function AddPost() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [showCategories, setShowCategories] = useState(false)

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedImage(file)

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
  }

  //  NOVO: remover imagem
  const handleRemoveImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    setSelectedImage(null)
    setPreviewUrl('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    setError('')
    const user = auth.currentUser

    if (!user) {
      setError('You need to be logged in to upload a post.')
      return
    }

    if (!selectedImage || !title || !description || !category || !price) {
      setError('Please complete all fields and add a photo.')
      return
    }

    try {
      setLoading(true)

      const userDocRef = doc(db, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)

      let username = 'Unknown user'
      let userPhoto = ''

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data()
        username = userData.username || 'Unknown user'
        userPhoto = userData.photoURL || ''
      }

      const fileName = `${Date.now()}-${selectedImage.name}`
      const imageRef = ref(storage, `posts/${user.uid}/${fileName}`)

      await uploadBytes(imageRef, selectedImage)
      const imageUrl = await getDownloadURL(imageRef)

      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userEmail: user.email || '',
        username,
        userPhoto,
        title,
        description,
        category,
        price: Number(price),
        imageUrl,
        isSold: false,
        createdAt: serverTimestamp(),
      })

      alert('Post uploaded successfully!')
      navigate('/home')
    } catch (err: unknown) {
      console.error('Upload error:', err)

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong during upload.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="add-post-page">
      <section className="add-post-header">
        <button className="close-btn" onClick={() => navigate(-1)}>
          ✕
        </button>

        <h1 className="add-post-title">Sell an item</h1>

        <div className="header-space"></div>
      </section>

      <section className="upload-section">
        <label htmlFor="postImage" className="sr-only">
          Upload post image
        </label>

        <input
          id="postImage"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden-file-input"
          onChange={handleImageChange}
        />

        {/* EDITADO COM LIXEIRA */}
        <div className="upload-card" onClick={handleOpenFilePicker}>
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Preview"
                className="preview-image"
              />

              <button
                type="button"
                className="remove-image-btn"
                onClick={handleRemoveImage}
                aria-label="Remove image"
              >
                <Trash2 size={20} />
              </button>
            </>
          ) : (
            <>
              <span className="upload-plus">+</span>
              <p>Upload photos</p>
            </>
          )}
        </div>
      </section>

      <section className="add-post-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            placeholder="Tell buyers what you're selling"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Tell buyers more about it"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Category</label>

          <button
            type="button"
            className="category-select-btn"
            onClick={() => setShowCategories(!showCategories)}
          >
            <span>{category || 'Select category'}</span>
            <span className="category-arrow">›</span>
          </button>

          {showCategories && (
            <div className="category-dropdown">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="category-option"
                  onClick={() => {
                    setCategory(item)
                    setShowCategories(false)
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            id="price"
            type="number"
            placeholder="Enter price in EUR"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button
          type="button"
          className="publish-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </section>
    </main>
  )
}

export default AddPost