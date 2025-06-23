'use client'

import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { LoginForm } from '@/components/login-form'
import { Sidebar } from '@/components/sidebar'
import { DoctorSearch } from '@/components/patient/doctor-search'
import { AppointmentBooking } from '@/components/patient/appointment-booking'
import { AppointmentHistory } from '@/components/patient/appointment-history'
import { DoctorSchedule } from '@/components/doctor/doctor-schedule'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(() => {
    if (user?.role === 'patient') return 'search'
    if (user?.role === 'doctor') return 'schedule'
    if (user?.role === 'admin') return 'dashboard'
    return 'search'
  })
  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null)

  console.log('Dashboard rendered for user:', user, 'Active tab:', activeTab)

  if (!user) return null

  const renderContent = () => {
    if (bookingDoctorId) {
      return (
        <AppointmentBooking
          doctorId={bookingDoctorId}
          onBack={() => {
            console.log('Back to search from booking')
            setBookingDoctorId(null)
            setActiveTab('search')
          }}
          onBookingComplete={() => {
            console.log('Booking completed, redirecting to appointments')
            setBookingDoctorId(null)
            setActiveTab('appointments')
          }}
        />
      )
    }

    // Patient content
    if (user.role === 'patient') {
      switch (activeTab) {
        case 'search':
          return (
            <div>
              <h1 className="text-3xl font-bold mb-6">Find Doctors</h1>
              <DoctorSearch onBookAppointment={(doctorId) => {
                console.log('Booking appointment for doctor:', doctorId)
                setBookingDoctorId(doctorId)
              }} />
            </div>
          )
        case 'appointments':
          return (
            <div>
              <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
              <AppointmentHistory />
            </div>
          )
        case 'history':
          return (
            <div>
              <h1 className="text-3xl font-bold mb-6">Medical History</h1>
              <div className="bg-muted p-8 rounded-lg text-center">
                <p className="text-muted-foreground">Medical history feature coming soon...</p>
              </div>
            </div>
          )
        case 'profile':
          return (
            <div>
              <h1 className="text-3xl font-bold mb-6">Profile</h1>
              <div className="bg-muted p-8 rounded-lg text-center">
                <p className="text-muted-foreground">Profile management coming soon...</p>
              </div>
            </div>
          )
        default:
          return <div>Content not found</div>
      }
    }

    // Doctor content
    if (user.role === 'doctor') {
      switch (activeTab) {
        case 'schedule':
          return (
            <div>
              <h1 className="text-3xl font-bold mb-6">My Schedule</h1>
              <DoctorSchedule />
            </div>
          )
        case 'appointments':
          return (
            <div>
              <h1 className="text-3xl font-bold mb-6">Patient Appointments</h1>
              <div className="bg-muted p-8 rounded-lg text-center">
                <p className="text-muted-foreground">Patient appointments view coming soon...</p>
              </div>
            </div>
          )
        case 'patients':
          return (
            <div>
              <h1 className="text-3xl font-bold mb-6">My Patients</h1>
              <div className="bg-muted p-8 rounded-lg text-center">
                <p className="text-muted-foreground">Patient management coming soon...</p>
              </div>
            </div>
          )
        case 'profile':
          return (
            <div>
              <h1 className="text-3xl font-bold mb-6">Doctor Profile</h1>
              <div className="bg-muted p-8 rounded-lg text-center">
                <p className="text-muted-foreground">Profile management coming soon...</p>
              </div>
            </div>
          )
        default:
          return <div>Content not found</div>
      }
    }

    // Admin content
    if (user.role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <div>
              <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
              <AdminDashboard />
            </div>
          )
        case 'doctors':
          return (
            <div>
              <h1 className="text-3xl font-bold mb-6">Manage Doctors</h1>
              <div className="bg-muted p-8 rounded-lg text-center">
                <p className="text-muted-foreground">Doctor management coming soon...</p>
              </div>
            </div>
          )
        case 'appointments':
          return (
            <div>
              <h1 className="text-3xl font-bold mb-6">All Appointments</h1>
              <div className="bg-muted p-8 rounded-lg text-center">
                <p className="text-muted-foreground">Appointment management coming soon...</p>
              </div>
            </div>
          )
        case 'reports':
          return (
            <div>
              <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>
              <div className="bg-muted p-8 rounded-lg text-center">
                <p className="text-muted-foreground">Reports and analytics coming soon...</p>
              </div>
            </div>
          )
        default:
          return <div>Content not found</div>
      }
    }

    return <div>Unknown role</div>
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto p-6">
        {renderContent()}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function AppContent() {
  const { user } = useAuth()

  console.log('App content rendered, user:', user)

  if (!user) {
    return <LoginForm />
  }

  return <Dashboard />
}
