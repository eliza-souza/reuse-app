// Importa navegação
import { useNavigate } from "react-router-dom"

// Lista de categorias
const categories = [
  "Women",
  "Men",
  "Kids",
  "Home",
  "Electronics",
  "Entertainment",
  "Hobbies & collectibles",
  "Sports",
]

// Componente de seleção de categoria
function Category() {
  const navigate = useNavigate()

  // Quando clicar em uma categoria
  const handleSelect = (category: string) => {
    // Salva temporariamente (localStorage)
    localStorage.setItem("selectedCategory", category)

    // Volta para Add Post
    navigate("/add-post")
  }

  return (
    <main className="category-page">

      {/* Header */}
      <div className="category-header">
        <button onClick={() => navigate(-1)}>←</button>
        <h1>Category</h1>
        <div></div>
      </div>

      {/* Busca (visual apenas por enquanto) */}
      <input
        type="text"
        placeholder="Find a category"
        className="category-search"
      />

      {/* Lista */}
      <div className="category-list">
        {categories.map((cat) => (
          <div
            key={cat}
            className="category-item"
            onClick={() => handleSelect(cat)}
          >
            <span>{cat}</span>
            <span>›</span>
          </div>
        ))}
      </div>

    </main>
  )
}

export default Category