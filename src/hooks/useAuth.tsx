import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For demo purposes, auto-login with a mock user that matches UserContext
    setTimeout(() => {
      setUser({
        id: '1',
        email: 'alex@example.com',
        name: 'Alex'
      })
      setLoading(false)
    }, 1000)
  }, [])

  const signIn = async (email: string, _password: string) => {
    // Mock sign in
    setUser({
      id: '1',
      email: email,
      name: email.split('@')[0] // Extract name from email
    })
  }

  const signUp = async (email: string, _password: string) => {
    // Mock sign up
    setUser({
      id: '1',
      email: email,
      name: email.split('@')[0] // Extract name from email
    })
  }

  const signOut = () => {
    setUser(null)
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
}
