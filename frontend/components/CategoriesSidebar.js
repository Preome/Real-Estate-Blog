import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function CategoriesSidebar({ selectedCategory, onSelectCategory }) {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/categories/stats`)
      setCategories(response.data.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fallback categories
      setCategories([
        { name: 'For Buyers', count: 0, icon: '🏠' },
        { name: 'For Sellers', count: 0, icon: '💰' },
        { name: 'Infographics', count: 0, icon: '📊' },
        { name: 'Home Prices', count: 0, icon: '💵' },
        { name: 'Mortgage Rates', count: 0, icon: '🏦' },
        { name: 'Inventory', count: 0, icon: '📦' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (categoryName) => {
    if (selectedCategory === categoryName) {
      onSelectCategory(null) // Clear filter
      router.push('/')
    } else {
      onSelectCategory(categoryName)
      router.push(`/?category=${encodeURIComponent(categoryName)}`)
    }
  }

  return (
    <div className="categories-sidebar">
      <div className="categories-header">
        <h3>📂 Categories</h3>
      </div>
      
      {loading ? (
        <div className="categories-loading">Loading categories...</div>
      ) : (
        <ul className="categories-list">
          <li 
            className={`category-item ${!selectedCategory ? 'active' : ''}`}
            onClick={() => handleCategoryClick(null)}
          >
            <span className="category-icon">📋</span>
            <span className="category-name">All Posts</span>
            <span className="category-count">{categories.reduce((sum, c) => sum + c.count, 0)}</span>
          </li>
          
          {categories.map((category) => (
            <li 
              key={category.name}
              className={`category-item ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.name)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <span className="category-count">{category.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}