import React from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useCategories } from '../hooks/useSupabase'

export function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const { categories, loading } = useCategories()

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-gray-200 rounded-md animate-pulse flex-shrink-0" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        onClick={() => onCategoryChange(null)}
        className="flex-shrink-0"
      >
        الكل
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onCategoryChange(category.id)}
          className="flex-shrink-0 flex items-center gap-2"
          style={{
            backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
            borderColor: category.color,
            color: selectedCategory === category.id ? 'white' : category.color
          }}
        >
          <span>{category.name}</span>
          <Badge variant="secondary" className="ml-1">
            {/* يمكن إضافة عدد المصادر هنا لاحقاً */}
          </Badge>
        </Button>
      ))}
    </div>
  )
}