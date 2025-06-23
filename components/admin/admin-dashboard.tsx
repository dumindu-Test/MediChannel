'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  MapPin
} from 'lucide-react'



export function AdminDashboard() {
  const [stats, setStats] = useState([
    {
      title: 'Total Doctors',
      value: '0',
      change: 'Loading...',
      icon: Stethoscope,
      color: 'text-blue-400'
    },
    {
      title: 'Total Patients',
      value: '0',
      change: 'Loading...',
      icon: Users,
      color: 'text-green-400'
    },
    {
      title: 'Today\'s Appointments',
      value: '0',
      change: 'Loading...',
      icon: Calendar,
      color: 'text-purple-400'
    },
    {
      title: 'Revenue',
      value: 'LKR 0',
      change: 'Loading...',
      icon: TrendingUp,
      color: 'text-yellow-400'
    }
  ])
  const [recentAppointments, setRecentAppointments] = useState<any[]>([])
  const [topDoctors, setTopDoctors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  console.log('Admin dashboard component rendered')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    console.log('Loading admin dashboard data from Supabase')
    setIsLoading(true)
    
    try {
      // Load doctors count
      const doctorsData = await supabase
        .from('users')
        .select('*')
        .eq('role', 'doctor')
        .data

      // Load patients count
      const patientsData = await supabase
        .from('users')
        .select('*')
        .eq('role', 'patient')
        .data

      // Load today's appointments
      const today = new Date().toISOString().split('T')[0]
      const todayAppointmentsData = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', today)
        .data

      // Load recent appointments with doctor/patient info
      const recentAppointmentsData = await supabase
        .from('appointments')
        .select('*')
        .data

      // Calculate revenue
      const totalRevenue = recentAppointmentsData.reduce((sum: number, apt: any) => sum + (apt.consultation_fee || 0), 0)

      // Update stats
      setStats([
        {
          title: 'Total Doctors',
          value: doctorsData.length.toString(),
          change: 'Active healthcare providers',
          icon: Stethoscope,
          color: 'text-blue-400'
        },
        {
          title: 'Total Patients',
          value: patientsData.length.toString(),
          change: 'Registered users',
          icon: Users,
          color: 'text-green-400'
        },
        {
          title: 'Today\'s Appointments',
          value: todayAppointmentsData.length.toString(),
          change: `${todayAppointmentsData.filter((apt: any) => apt.status === 'pending').length} pending`,
          icon: Calendar,
          color: 'text-purple-400'
        },
        {
          title: 'Revenue',
          value: `LKR ${totalRevenue.toLocaleString()}`,
          change: 'Total earnings',
          icon: TrendingUp,
          color: 'text-yellow-400'
        }
      ])

      // Set recent appointments
      const appointmentsWithInfo = recentAppointmentsData.slice(0, 4).map((apt: any) => {
        const doctor = doctorsData.find(d => d.id === apt.doctor_id)
        const patient = patientsData.find(p => p.id === apt.patient_id)
        return {
          id: apt.id,
          patientName: patient?.name || 'Unknown Patient',
          doctorName: doctor?.name || 'Unknown Doctor',
          time: apt.appointment_time || 'Time TBD',
          status: apt.status,
          specialization: doctor?.specialization || 'General Medicine'
        }
      })
      setRecentAppointments(appointmentsWithInfo)

      // Set top doctors (by number of appointments)
      const doctorAppointmentCounts = doctorsData.map(doctor => {
        const appointmentCount = recentAppointmentsData.filter(apt => apt.doctor_id === doctor.id).length
        return {
          name: doctor.name,
          specialization: doctor.specialization || 'General Medicine',
          bookings: appointmentCount,
          rating: doctor.rating || 4.5,
          hospital: doctor.hospital || 'Hospital'
        }
      }).sort((a, b) => b.bookings - a.bookings).slice(0, 3)

      setTopDoctors(doctorAppointmentCounts)

      console.log('Dashboard data loaded successfully')
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{appointment.patientName}</p>
                    <p className="text-sm text-muted-foreground">
                      with {appointment.doctorName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.specialization} • {appointment.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusIcon(appointment.status)}
                    <span className="ml-1 capitalize">{appointment.status}</span>
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performing Doctors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Doctors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topDoctors.map((doctor, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{doctor.name}</p>
                      <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        {doctor.hospital}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{doctor.bookings} bookings</p>
                      <p className="text-sm text-yellow-400">★ {doctor.rating}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-green-400 mb-2">98.5%</div>
              <div className="text-sm text-muted-foreground">System Uptime</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-blue-400 mb-2">156</div>
              <div className="text-sm text-muted-foreground">Appointments Today</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support Available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}