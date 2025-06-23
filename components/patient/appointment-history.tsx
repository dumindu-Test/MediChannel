'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Clock, MapPin, FileText, Phone } from 'lucide-react'

interface Appointment {
  id: string
  doctorName: string
  specialization: string
  hospital: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  consultationFee: number
  symptoms?: string
  diagnosis?: string
  prescription?: string
}

// This will be loaded from Supabase
let mockAppointments: Appointment[] = []

export function AppointmentHistory() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  console.log('Appointment history component rendered')

  useEffect(() => {
    if (user) {
      loadAppointments()
    }
  }, [user])

  const loadAppointments = async () => {
    if (!user) return
    
    console.log('Loading appointments from Supabase for user:', user.id)
    setIsLoading(true)
    
    try {
      const appointmentsData = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user.id)
        .data

      const appointmentsWithDoctors = appointmentsData.map((apt: any) => ({
        id: apt.id,
        doctorName: apt.doctor?.name || 'Unknown Doctor',
        specialization: apt.doctor?.specialization || 'General Medicine',
        hospital: apt.doctor?.hospital || 'Hospital',
        date: apt.appointment_date,
        time: apt.appointment_time,
        status: apt.status,
        consultationFee: apt.consultation_fee,
        symptoms: apt.symptoms,
        diagnosis: apt.diagnosis,
        prescription: apt.prescription
      }))

      console.log('Loaded appointments:', appointmentsWithDoctors)
      setAppointments(appointmentsWithDoctors)
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const upcomingAppointments = appointments.filter(apt => apt.status === 'pending' || apt.status === 'confirmed')
  const pastAppointments = appointments.filter(apt => apt.status === 'completed' || apt.status === 'cancelled')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Loading appointments...</h3>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {appointment.doctorName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{appointment.doctorName}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {appointment.specialization}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{appointment.hospital}</span>
                    </div>
                  </div>
                  
                  {appointment.symptoms && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Symptoms:</p>
                      <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="font-medium">LKR {appointment.consultationFee.toLocaleString()}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                      <Button variant="destructive" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Past Appointments</h3>
        <div className="space-y-4">
          {pastAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-muted">
                        {appointment.doctorName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{appointment.doctorName}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {appointment.specialization}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(appointment.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{appointment.hospital}</span>
                  </div>
                </div>

                {appointment.symptoms && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Symptoms:</p>
                    <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
                  </div>
                )}

                {appointment.status === 'completed' && appointment.diagnosis && (
                  <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                    <p className="text-sm font-medium mb-1">Diagnosis:</p>
                    <p className="text-sm text-muted-foreground mb-2">{appointment.diagnosis}</p>
                    {appointment.prescription && (
                      <>
                        <p className="text-sm font-medium mb-1">Prescription:</p>
                        <p className="text-sm text-muted-foreground">{appointment.prescription}</p>
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="font-medium">LKR {appointment.consultationFee.toLocaleString()}</span>
                  {appointment.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {appointments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No appointments found. Book your first appointment to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}