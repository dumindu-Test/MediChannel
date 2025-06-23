import { createClient } from '@supabase/supabase-js'

// Demo Supabase credentials for development
const supabaseUrl = 'https://demo.supabase.co'
const supabaseKey = 'demo-key'

// For demo purposes, we'll use a mock client that simulates Supabase behavior
class MockSupabaseClient {
  private mockUsers = [
    {
      id: '1',
      name: 'Dr. Samantha Perera',
      email: 'dr.perera@hospital.lk',
      role: 'doctor',
      specialization: 'Cardiology',
      hospital: 'National Hospital of Sri Lanka',
      consultation_fee: 2500,
      experience: 15,
      rating: 4.8,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'John Silva',
      email: 'john@email.com',
      role: 'patient',
      phone: '+94771234567',
      date_of_birth: '1990-05-15',
      address: 'Colombo 03, Sri Lanka',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Admin User',
      email: 'admin@hospital.lk',
      role: 'admin',
      hospital: 'National Hospital of Sri Lanka',
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Dr. Rohith Fernando',
      email: 'dr.fernando@hospital.lk',
      role: 'doctor',
      specialization: 'Neurology',
      hospital: 'Colombo General Hospital',
      consultation_fee: 3000,
      experience: 20,
      rating: 4.9,
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Mary Perera',
      email: 'mary@email.com',
      role: 'patient',
      phone: '+94772345678',
      date_of_birth: '1985-08-22',
      address: 'Kandy, Sri Lanka',
      created_at: new Date().toISOString()
    }
  ]

  private mockAppointments = [
    {
      id: '1',
      patient_id: '2',
      doctor_id: '1',
      appointment_date: '2024-01-15',
      appointment_time: '14:30',
      status: 'confirmed',
      symptoms: 'Chest pain and shortness of breath',
      consultation_fee: 2500,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      patient_id: '5',
      doctor_id: '4',
      appointment_date: '2024-01-10',
      appointment_time: '10:00',
      status: 'completed',
      symptoms: 'Frequent headaches',
      diagnosis: 'Tension headache',
      prescription: 'Paracetamol 500mg twice daily',
      consultation_fee: 3000,
      created_at: new Date().toISOString()
    }
  ]

  private mockSchedules = [
    {
      id: '1',
      doctor_id: '1',
      schedule_date: '2024-01-15',
      time_slots: [
        { time: '09:00', is_available: true, is_booked: false },
        { time: '09:30', is_available: true, is_booked: true, patient_id: '2' },
        { time: '10:00', is_available: true, is_booked: false },
        { time: '14:30', is_available: true, is_booked: true, patient_id: '5' },
        { time: '15:00', is_available: false, is_booked: false },
        { time: '16:00', is_available: true, is_booked: false }
      ]
    }
  ]

  from(table: string) {
    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          single: () => this.mockSelect(table, columns, column, value, true),
          data: this.mockSelect(table, columns, column, value, false)
        }),
        data: this.mockSelectAll(table, columns)
      }),
      insert: (data: any) => ({
        select: () => ({ data: this.mockInsert(table, data) })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({ data: this.mockUpdate(table, data, column, value) })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          data: this.mockDelete(table, column, value)
        })
      })
    }
  }

  private mockSelectAll(table: string, columns: string) {
    console.log(`Supabase: SELECT ${columns} FROM ${table}`)
    switch (table) {
      case 'users':
        return this.mockUsers
      case 'appointments':
        return this.mockAppointments.map(apt => {
          const patient = this.mockUsers.find(u => u.id === apt.patient_id)
          const doctor = this.mockUsers.find(u => u.id === apt.doctor_id)
          return { ...apt, patient, doctor }
        })
      case 'doctor_schedules':
        return this.mockSchedules
      default:
        return []
    }
  }

  private mockSelect(table: string, columns: string, column: string, value: any, single: boolean) {
    console.log(`Supabase: SELECT ${columns} FROM ${table} WHERE ${column} = ${value}`)
    const data = this.mockSelectAll(table, columns)
    const filtered = data.filter((item: any) => item[column] === value)
    return single ? filtered[0] || null : filtered
  }

  private mockInsert(table: string, data: any) {
    console.log(`Supabase: INSERT INTO ${table}`, data)
    const id = Math.random().toString(36).substr(2, 9)
    const newRecord = { ...data, id, created_at: new Date().toISOString() }
    
    switch (table) {
      case 'appointments':
        this.mockAppointments.push(newRecord)
        break
      case 'doctor_schedules':
        this.mockSchedules.push(newRecord)
        break
    }
    
    return [newRecord]
  }

  private mockUpdate(table: string, data: any, column: string, value: any) {
    console.log(`Supabase: UPDATE ${table} SET`, data, `WHERE ${column} = ${value}`)
    
    switch (table) {
      case 'appointments':
        const aptIndex = this.mockAppointments.findIndex((item: any) => item[column] === value)
        if (aptIndex !== -1) {
          this.mockAppointments[aptIndex] = { ...this.mockAppointments[aptIndex], ...data }
          return [this.mockAppointments[aptIndex]]
        }
        break
      case 'doctor_schedules':
        const schedIndex = this.mockSchedules.findIndex((item: any) => item[column] === value)
        if (schedIndex !== -1) {
          this.mockSchedules[schedIndex] = { ...this.mockSchedules[schedIndex], ...data }
          return [this.mockSchedules[schedIndex]]
        }
        break
    }
    
    return []
  }

  private mockDelete(table: string, column: string, value: any) {
    console.log(`Supabase: DELETE FROM ${table} WHERE ${column} = ${value}`)
    return { success: true }
  }
}

// Export the mock client for demo purposes
export const supabase = new MockSupabaseClient() as any

// Database types
export interface User {
  id: string
  name: string
  email: string
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
}