// Importa hook para controlar estados
import { useState } from 'react'

// Importa navegação
import { Link, useNavigate } from 'react-router-dom'

// Firebase Auth (login)
import { signInWithEmailAndPassword } from 'firebase/auth'

// Firestore (para buscar dados do usuário)
import { doc, getDoc } from 'firebase/firestore'

// Importa config do Firebase
import { auth, db } from '../firebase/config'

// Ícones
import gmailIcon from '../assets/gmail.png'
import facebookIcon from '../assets/facebook.png'

// Componente da página de Login
function Login() {
  // Hook para redirecionar
  const navigate = useNavigate()

  // Estados dos inputs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Estado de erro
  const [error, setError] = useState('')

  // Estado de loading (evita clicar várias vezes)
  const [loading, setLoading] = useState(false)

  // Função de login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validação simples
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    try {
      setLoading(true)

      //  Login no Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      const user = userCredential.user

      console.log('User logged in:', user)

      //  Buscar dados adicionais no Firestore (username + foto)
      const userDoc = await getDoc(doc(db, 'users', user.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data()

        console.log('User data from Firestore:', userData)

        // 👉 (opcional) salvar no localStorage para usar depois
        localStorage.setItem('user', JSON.stringify(userData))
      }

      // Redireciona para Home
      navigate('/home')

    } catch (err: unknown) {
      console.error('Login error:', err)

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-wrapper">

        {/* Título */}
        <h1 className="login-title">
          Welcome to
          <br />
          ReUse
        </h1>

        {/* Subtítulo */}
        <p className="login-subtitle">
          Buy and sell preloved items sustainably
          <br />
          right in your community.
        </p>

        {/* Formulário */}
        <form className="login-form" onSubmit={handleLogin}>

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Senha */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Erro */}
          {error && <p className="auth-error">{error}</p>}

          {/* Botão */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Link signup */}
        <p className="login-signup-text">
          Don’t have an account?
          <br />
          <Link to="/signup">Create an account</Link>
        </p>

        {/* Social (placeholder por enquanto) */}
        <div className="social-buttons">
          <button type="button" className="social-btn">
            <img src={gmailIcon} alt="gmail" />
            Gmail
          </button>

          <button type="button" className="social-btn">
            <img src={facebookIcon} alt="facebook" />
            Facebook
          </button>
        </div>

      </section>
    </main>
  )
}

export default Login