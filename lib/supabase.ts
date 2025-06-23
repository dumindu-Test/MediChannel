import { createClient } from '@supabase/supabase-js'

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Flag to check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

console.log('Supabase configuration status:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isConfigured: isSupabaseConfigured
})

// Create Supabase client only if properly configured
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : null

// Database types matching the healthcare system
export interface User {
  id: string
  name: string
  email: string
  password_hash?: string // Only used server-side for authentication
  role: 'patient' | 'doctor' | 'admin'
  specialization?: string
  hospital?: string
  consultation_fee?: number
  experience?: number
  rating?: number
  phone?: string
  date_of_birth?: string
  address?: string
  created_at: string
  updated_at?: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: 'patient' | 'doctor' | 'admin'
  specialization?: string
  hospital?: string
  consultation_fee?: number
  experience?: number
  phone?: string
  date_of_birth?: string
  address?: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  symptoms?: string
  diagnosis?: string
  prescription?: string
  consultation_fee: number
  created_at: string
  updated_at?: string
  patient?: User
  doctor?: User
}

export interface DoctorSchedule {
  id: string
  doctor_id: string
  schedule_date: string
  time_slots: {
    time: string
    is_available: boolean
    is_booked: boolean
    patient_id?: string
  }[]
  created_at: string
  updated_at?: string
}

// Mock data for development when Supabase is not configured
// Note: In mock mode, password is always "password"
const mockUsers: User[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Dr. Samantha Perera',
    email: 'dr.perera@hospital.lk',
    password_hash: '$2a$10$K8BQC7X8gHtQ3V.sRdYnf.rKQrj4K9Y8mY7F5A5s9D4rO8V7X2mR6', // "password"
    role: 'doctor',
    specialization: 'Cardiology',
    hospital: 'National Hospital of Sri Lanka',
    consultation_fee: 2500,
    experience: 15,
    rating: 4.8,
    created_at: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Dr. Rohith Fernando',
    email: 'dr.fernando@hospital.lk',
    password_hash: '$2a$10$K8BQC7X8gHtQ3V.sRdYnf.rKQrj4K9Y8mY7F5A5s9D4rO8V7X2mR6', // "password"
    role: 'doctor',
    specialization: 'Neurology',
    hospital: 'Colombo General Hospital',
    consultation_fee: 3000,
    experience: 20,
    rating: 4.9,
    created_at: new Date().toISOString()
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'John Silva',
    email: 'john@email.com',
    password_hash: '$2a$10$K8BQC7X8gHtQ3V.sRdYnf.rKQrj4K9Y8mY7F5A5s9D4rO8V7X2mR6', // "password"
    role: 'patient',
    phone: '+94771234567',
    date_of_birth: '1990-05-15',
    address: 'Colombo 03, Sri Lanka',
    created_at: new Date().toISOString()
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Admin User',
    email: 'admin@hospital.lk',
    password_hash: '$2a$10$K8BQC7X8gHtQ3V.sRdYnf.rKQrj4K9Y8mY7F5A5s9D4rO8V7X2mR6', // "password"
    role: 'admin',
    hospital: 'National Hospital of Sri Lanka',
    created_at: new Date().toISOString()
  }
]

// Helper functions for database operations
export const supabaseHelpers = {
  // User operations
  async getUserById(id: string) {
    console.log('Fetching user by ID:', id)
    
    if (!isSupabaseConfigured || !supabase) {
      console.log('Using mock data - Supabase not configured')
      const user = mockUsers.find(u => u.id === id)
      return user || null
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching user:', error)
      throw error
    }
    
    console.log('User fetched successfully:', data)
    return data
  },

  async getUserByEmail(email: string) {
    console.log('Fetching user by email:', email)
    
    if (!isSupabaseConfigured || !supabase) {
      console.log('Using mock data - Supabase not configured')
      const user = mockUsers.find(u => u.email === email)
      return user || null
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by email:', error)
      throw error
    }
    
    console.log('User fetched by email successfully:', data?.email)
    return data
  },

  async createUser(userData: CreateUserData) {
    console.log('Creating new user:', userData.email)
    
    if (!isSupabaseConfigured || !supabase) {
      console.log('Mock user creation - Supabase not configured')
      const { hashPassword } = await import('./auth-utils')
      const hashedPassword = await hashPassword(userData.password)
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: userData.name,
        email: userData.email,
        password_hash: hashedPassword,
        role: userData.role,
        specialization: userData.specialization,
        hospital: userData.hospital,
        consultation_fee: userData.consultation_fee,
        experience: userData.experience,
        phone: userData.phone,
        date_of_birth: userData.date_of_birth,
        address: userData.address,
        created_at: new Date().toISOString()
      }
      
      // Add to mock users for current session
      mockUsers.push(newUser)
      
      // Remove password_hash from return data
      const { password_hash, ...userWithoutPassword } = newUser
      return userWithoutPassword
    }

    const { hashPassword } = await import('./auth-utils')
    const hashedPassword = await hashPassword(userData.password)

    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: userData.name,
        email: userData.email,
        password_hash: hashedPassword,
        role: userData.role,
        specialization: userData.specialization,
        hospital: userData.hospital,
        consultation_fee: userData.consultation_fee,
        experience: userData.experience,
        phone: userData.phone,
        date_of_birth: userData.date_of_birth,
        address: userData.address
      }])
      .select('id, name, email, role, specialization, hospital, consultation_fee, experience, rating, phone, date_of_birth, address, created_at')
      .single()
    
    if (error) {
      console.error('Error creating user:', error)
      throw error
    }
    
    console.log('User created successfully:', data.email)
    return data
  },

  async authenticateUser(email: string, password: string) {
    console.log('Authenticating user:', email)
    
    if (!isSupabaseConfigured || !supabase) {
      console.log('Using mock authentication - Supabase not configured')
      const user = mockUsers.find(u => u.email === email)
      if (!user?.password_hash) return null
      
      const { verifyPassword } = await import('./auth-utils')
      const isValid = await verifyPassword(password, user.password_hash)
      
      if (isValid) {
        const { password_hash, ...userWithoutPassword } = user
        return userWithoutPassword
      }
      return null
    }

    // Get user with password hash
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error || !user?.password_hash) {
      console.log('User not found or no password hash')
      return null
    }
    
    const { verifyPassword } = await import('./auth-utils')
    const isValid = await verifyPassword(password, user.password_hash)
    
    if (isValid) {
      // Return user without password hash
      const { password_hash, ...userWithoutPassword } = user
      console.log('Authentication successful for:', email)
      return userWithoutPassword
    }
    
    console.log('Authentication failed for:', email)
    return null
  },

  async getDoctors() {
    console.log('Fetching all doctors')
    
    if (!isSupabaseConfigured || !supabase) {
      console.log('Using mock data - Supabase not configured')
      return mockUsers.filter(u => u.role === 'doctor')
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'doctor')
      .order('rating', { ascending: false })
    
    if (error) {
      console.error('Error fetching doctors:', error)
      throw error
    }
    
    console.log('Doctors fetched successfully:', data?.length, 'doctors found')
    return data
  },

  async getAppointmentsByPatient(patientId: string) {
    console.log('Fetching appointments for patient:', patientId)
    
    if (!isSupabaseConfigured || !supabase) {
      console.log('Using mock data - Supabase not configured')
      return [] // Return empty array for mock data
    }

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:users!appointments_doctor_id_fkey (*)
      `)
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching patient appointments:', error)
      throw error
    }
    
    console.log('Patient appointments fetched successfully:', data?.length, 'appointments found')
    return data
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) {
    console.log('Creating new appointment:', appointment)
    
    if (!isSupabaseConfigured || !supabase) {
      console.log('Mock appointment creation - Supabase not configured')
      const mockAppointment = {
        ...appointment,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      }
      return mockAppointment
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating appointment:', error)
      throw error
    }
    
    console.log('Appointment created successfully:', data)
    return data
  },

  async getDoctorSchedule(doctorId: string, date: string) {
    console.log('Fetching doctor schedule:', { doctorId, date })
    
    if (!isSupabaseConfigured || !supabase) {
      console.log('Using mock schedule - Supabase not configured')
      return {
        id: '1',
        doctor_id: doctorId,
        schedule_date: date,
        time_slots: [
          { time: '09:00', is_available: true, is_booked: false },
          { time: '09:30', is_available: true, is_booked: false },
          { time: '10:00', is_available: true, is_booked: false },
          { time: '14:00', is_available: true, is_booked: false },
          { time: '14:30', is_available: true, is_booked: false },
          { time: '15:00', is_available: true, is_booked: false }
        ],
        created_at: new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from('doctor_schedules')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('schedule_date', date)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching doctor schedule:', error)
      throw error
    }
    
    console.log('Doctor schedule fetched:', data ? 'found' : 'not found')
    return data
  }
}