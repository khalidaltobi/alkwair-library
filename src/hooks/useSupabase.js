import { useState, useEffect } from 'react'
import { db } from '../lib/supabase'

// خطاف للحصول على الفئات
export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const { data, error } = await db.categories.getAll()
        if (error) throw error
        setCategories(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error, refetch: () => fetchCategories() }
}

// خطاف للحصول على المصادر
export function useResources(filters = {}) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true)
        const { data, error } = await db.resources.getAll(filters)
        if (error) throw error
        setResources(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [JSON.stringify(filters)])

  return { resources, loading, error, refetch: () => fetchResources() }
}

// خطاف للحصول على مصدر واحد
export function useResource(id) {
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    async function fetchResource() {
      try {
        setLoading(true)
        const { data, error } = await db.resources.getById(id)
        if (error) throw error
        setResource(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchResource()
  }, [id])

  return { resource, loading, error, refetch: () => fetchResource() }
}

// خطاف للمفضلة
export function useFavorites(userId) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return

    async function fetchFavorites() {
      try {
        setLoading(true)
        const { data, error } = await db.favorites.getUserFavorites(userId)
        if (error) throw error
        setFavorites(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [userId])

  const addToFavorites = async (resourceId) => {
    try {
      const { error } = await db.favorites.add(userId, resourceId)
      if (error) throw error
      // إعادة تحميل المفضلة
      const { data } = await db.favorites.getUserFavorites(userId)
      setFavorites(data || [])
    } catch (err) {
      setError(err.message)
    }
  }

  const removeFromFavorites = async (resourceId) => {
    try {
      const { error } = await db.favorites.remove(userId, resourceId)
      if (error) throw error
      // إعادة تحميل المفضلة
      const { data } = await db.favorites.getUserFavorites(userId)
      setFavorites(data || [])
    } catch (err) {
      setError(err.message)
    }
  }

  return { 
    favorites, 
    loading, 
    error, 
    addToFavorites, 
    removeFromFavorites,
    refetch: () => fetchFavorites()
  }
}