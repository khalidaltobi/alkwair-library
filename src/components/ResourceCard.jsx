import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Eye, Download, Heart, Clock, User } from 'lucide-react'

export function ResourceCard({ resource, onView, onFavorite, isFavorite = false }) {
  const getDifficultyColor = (level) => {
    switch (level) {
      case 'مبتدئ': return 'bg-green-100 text-green-800'
      case 'متوسط': return 'bg-yellow-100 text-yellow-800'
      case 'متقدم': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'كتاب': return '📚'
      case 'فيديو': return '🎥'
      case 'مقال': return '📄'
      case 'دورة': return '🎓'
      case 'دليل': return '📋'
      case 'مرجع': return '📖'
      default: return '📄'
    }
  }

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getTypeIcon(resource.type)}</span>
            <Badge 
              variant="secondary" 
              style={{ 
                backgroundColor: resource.categories?.color + '20',
                color: resource.categories?.color 
              }}
            >
              {resource.categories?.name}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFavorite?.(resource.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart 
              className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
            />
          </Button>
        </div>
        
        <CardTitle className="text-lg leading-tight line-clamp-2">
          {resource.title}
        </CardTitle>
        
        <CardDescription className="line-clamp-2">
          {resource.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* المؤلف */}
          {resource.author && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{resource.author}</span>
            </div>
          )}

          {/* العلامات */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {resource.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {resource.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{resource.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* مستوى الصعوبة */}
          <div className="flex items-center justify-between">
            <Badge className={getDifficultyColor(resource.difficulty_level)}>
              {resource.difficulty_level}
            </Badge>
            
            {resource.is_featured && (
              <Badge variant="default" className="bg-yellow-500">
                مميز
              </Badge>
            )}
          </div>

          {/* الإحصائيات */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{resource.views_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>{resource.downloads_count || 0}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{new Date(resource.created_at).toLocaleDateString('ar-SA')}</span>
            </div>
          </div>

          {/* زر العرض */}
          <Button 
            onClick={() => onView?.(resource)}
            className="w-full mt-4"
            variant="outline"
          >
            عرض المصدر
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}