// Importa hook para controlar estados
import { useState } from 'react'

// Importa Link e navegação
import { Link, useNavigate } from 'react-router-dom'

// Importa função para criar usuário no Firebase Auth
import { createUserWithEmailAndPassword } from 'firebase/auth'

// Importa funções do Firestore
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore'

// Importa funções do Storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// Importa serviços configurados do Firebase
import { auth, db, storage } from '../firebase/config'

// Componente da página de cadastro
function Signup() {
  // Hook para redirecionar o usuário
  const navigate = useNavigate()

  // Estados dos campos do formulário
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)

  // Estado de erro
  const [error, setError] = useState('')

  // Estado de loading
  const [loading, setLoading] = useState(false)

  // Função para guardar a imagem escolhida
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0])
    }
  }

  // Função chamada quando o formulário é enviado
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Remove espaços extras
    const cleanUsername = username.trim().toLowerCase()
    const cleanBio = bio.trim()
    const cleanEmail = email.trim()

    // Verifica se os campos obrigatórios foram preenchidos
    if (!cleanUsername || !cleanEmail || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    // Validação do username
    if (cleanUsername.length < 3) {
      setError('Username must have at least 3 characters.')
      return
    }

    // Validação da senha
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      // Verifica se já existe outro usuário com o mesmo username
      const usersRef = collection(db, 'users')
      const usernameQuery = query(usersRef, where('username', '==', cleanUsername))
      const usernameSnapshot = await getDocs(usernameQuery)

      if (!usernameSnapshot.empty) {
        setError('This username is already taken.')
        return
      }

      // Cria usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password)
      const user = userCredential.user

      // Variável para guardar a URL da foto de perfil
      let photoURL = ''

      // Se o usuário escolheu uma imagem, faz upload para o Storage
      if (profileImage) {
        const imageRef = ref(storage, `profilePhotos/${user.uid}/${profileImage.name}`)
        const snapshot = await uploadBytes(imageRef, profileImage)
        photoURL = await getDownloadURL(snapshot.ref)
      }

      // Salva os dados do perfil no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: cleanUsername,
        bio: cleanBio,
        email: cleanEmail,
        photoURL,
        createdAt: new Date(),
      })

      // Redireciona para a home
      navigate('/home')
    } catch (err: unknown) {
      console.error('Signup error:', err)

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error creating account.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="signup-page">
      <section className="signup-wrapper">
        {/* Título */}
        <h1 className="signup-title">
          Create your
          <br />
          account
        </h1>

        {/* Subtítulo */}
        <p className="signup-subtitle">
          Join ReUse and start exploring sustainable
          <br />
          fashion in your community.
        </p>

        {/* Formulário */}
        <form className="signup-form" onSubmit={handleSignup}>
          {/* Campo username */}
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Campo bio */}
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            placeholder="Tell something about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          {/* Campo email */}
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Campo senha */}
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Campo confirmar senha */}
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* Campo foto de perfil */}
          <label htmlFor="profileImage">Profile photo</label>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {/* Mensagem de erro */}
          {error && <p className="auth-error">{error}</p>}

          {/* Botão principal */}
          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Link para login */}
        <p className="signup-login-text">
          Already have an account?
          <br />
          <Link to="/">Log in</Link>
        </p>
      </section>
    </main>
  )
}

// Exporta o componente
export default Signup