import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// مساعدات للتعامل مع قاعدة البيانات
export const db = {
  // الفئات
  categories: {
    getAll: () => supabase.from('categories').select('*').order('name'),
    getById: (id) => supabase.from('categories').select('*').eq('id', id).single(),
    create: (data) => supabase.from('categories').insert(data).select().single(),
    update: (id, data) => supabase.from('categories').update(data).eq('id', id).select().single(),
    delete: (id) => supabase.from('categories').delete().eq('id', id)
  },

  // المصادر
  resources: {
    getAll: (filters = {}) => {
      let query = supabase
        .from('resources')
        .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      if (filters.difficulty_level) {
        query = query.eq('difficulty_level', filters.difficulty_level)
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,author.ilike.%${filters.search}%`)
      }
      if (filters.featured) {
        query = query.eq('is_featured', true)
      }

      return query
    },
    getById: (id) => supabase
      .from('resources')
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('id', id)
      .single(),
    create: (data) => supabase.from('resources').insert(data).select().single(),
    update: (id, data) => supabase.from('resources').update(data).eq('id', id).select().single(),
    delete: (id) => supabase.from('resources').delete().eq('id', id),
    incrementViews: (id) => supabase.rpc('increment_views', { resource_id: id }),
    incrementDownloads: (id) => supabase.rpc('increment_downloads', { resource_id: id })
  },

  // المفضلة
  favorites: {
    getUserFavorites: (userId) => supabase
      .from('user_favorites')
      .select(`
        *,
        resources (
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    add: (userId, resourceId) => supabase
      .from('user_favorites')
      .insert({ user_id: userId, resource_id: resourceId })
      .select()
      .single(),
    remove: (userId, resourceId) => supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('resource_id', resourceId),
    check: (userId, resourceId) => supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .single()
  },

  // تقدم المستخدمين
  progress: {
    getUserProgress: (userId) => supabase
      .from('user_progress')
      .select(`
        *,
        resources (
          id,
          title,
          type
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
    updateProgress: (userId, resourceId, percentage) => supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        resource_id: resourceId,
        progress_percentage: percentage,
        completed_at: percentage === 100 ? new Date().toISOString() : null
      })
      .select()
      .single(),
    getResourceProgress: (userId, resourceId) => supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .single()
  }
}

// مساعدات للمصادقة
export const auth = {
  signUp: (email, password) => supabase.auth.signUp({ email, password }),
  signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
  signOut: () => supabase.auth.signOut(),
  getUser: () => supabase.auth.getUser(),
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback)
}