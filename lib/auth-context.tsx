'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { supabase, User, supabaseHelpers, isSupabaseConfigured, CreateUserData } from './supabase'

type UserRole = 'patient' | 'doctor' | 'admin'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: UserRole) => Promise<boolean>
  signup: (userData: CreateUserData) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    console.log('Attempting login:', { email, role, isSupabaseConfigured })
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Use authentication helper that verifies password
      const userData = await supabaseHelpers.authenticateUser(email, password)
      
      if (userData && userData.role === role) {
        setUser(userData)
        console.log('Login successful:', userData.email)
        return true
      }
      
      console.log('Login failed: Invalid credentials or role mismatch')
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (userData: CreateUserData): Promise<{ success: boolean; message?: string }> => {
    console.log('Attempting signup:', { email: userData.email, role: userData.role })
    setIsLoading(true)
    
    try {
      // Validate input
      const { validateEmail, validatePassword, validateName } = await import('./auth-utils')
      
      if (!validateEmail(userData.email)) {
        return { success: false, message: 'Please enter a valid email address' }
      }
      
      if (!validateName(userData.name)) {
        return { success: false, message: 'Please enter a valid name (at least 2 characters, letters only)' }
      }
      
      const passwordValidation = validatePassword(userData.password)
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.message }
      }
      
      // Check if user already exists
      const existingUser = await supabaseHelpers.getUserByEmail(userData.email)
      if (existingUser) {
        return { success: false, message: 'An account with this email already exists' }
      }
      
      // Create user
      const newUser = await supabaseHelpers.createUser(userData)
      setUser(newUser)
      
      console.log('Signup successful:', newUser.email)
      return { success: true }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, message: 'Failed to create account. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log('User logged out')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
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