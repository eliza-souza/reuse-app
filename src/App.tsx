// Importa os componentes de rota do React Router
import { Routes, Route } from 'react-router-dom'

// Importa páginas do app
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AddPost from './pages/AddPost'
import Profile from './pages/Profile'
import SavedPosts from './pages/SavedPosts'
import ProductDetails from './pages/ProductDetails'
import Inbox from './pages/Inbox'
import UserProfile from './pages/UserProfile'
import Search from './pages/Search'

// Importa o CSS global
import './App.css'

// Componente principal da aplicação
function App() {
  return (
    <Routes>
      {/* Página inicial = login */}
      <Route path="/" element={<Login />} />

      {/* Cadastro */}
      <Route path="/signup" element={<Signup />} />

      {/* Home/feed */}
      <Route path="/home" element={<Home />} />

      {/* Criar novo post */}
      <Route path="/add-post" element={<AddPost />} />

      {/* Perfil */}
      <Route path="/profile" element={<Profile />} />

      {/* Posts salvos */}
      <Route path="/saved" element={<SavedPosts />} />

      {/* Detalhes do produto */}
      <Route path="/product/:id" element={<ProductDetails />} />

      {/* Inbox geral */}
      <Route path="/inbox" element={<Inbox />} />

      {/* Conversa específica */}
      <Route path="/inbox/:id" element={<Inbox />} />
       
       {/* */}
      <Route path="/user/:userId" element={<UserProfile />} />

      <Route path="/search" element={<Search />} />
    </Routes>
  )
}

// Exporta o componente
export default App