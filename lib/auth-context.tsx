'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { supabase, User } from './supabase'

type UserRole = 'patient' | 'doctor' | 'admin'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: UserRole) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    console.log('Attempting login with Supabase:', { email, role })
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Query Supabase for user
      const userData = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', role)
        .single()
      
      if (userData) {
        setUser(userData)
        console.log('Login successful with Supabase:', userData)
        return true
      }
      
      console.log('Login failed: User not found in database')
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log('User logged out')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}