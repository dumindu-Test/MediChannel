'use client'

import { useState, useEffect } from 'react'
import { supabaseHelpers } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CreditCard, ArrowLeft, Clock, MapPin } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Doctor {
  id: string
  name: string
  specialization: string
  hospital: string
  consultationFee: number
}

// This will be loaded from Supabase
let mockDoctor: Doctor | null = null

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
]

interface AppointmentBookingProps {
  doctorId: string
  onBack: () => void
  onBookingComplete: () => void
}

export function AppointmentBooking({ doctorId, onBack, onBookingComplete }: AppointmentBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [symptoms, setSymptoms] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  console.log('Appointment booking for doctor:', doctorId)

  useEffect(() => {
    loadDoctor()
  }, [doctorId])

  const loadDoctor = async () => {
    console.log('Loading doctor data from Supabase')
    setIsLoading(true)
    
    try {
      const doctorData = await supabaseHelpers.getUserById(doctorId)

      if (doctorData) {
        const doctorInfo: Doctor = {
          id: doctorData.id,
          name: doctorData.name,
          specialization: doctorData.specialization || 'General Medicine',
          hospital: doctorData.hospital || 'Hospital',
          consultationFee: doctorData.consultation_fee || 2500
        }
        setDoctor(doctorInfo)
        console.log('Loaded doctor:', doctorInfo)
      }
    } catch (error) {
      console.error('Error loading doctor:', error)
      toast({
        title: 'Error',
        description: 'Failed to load doctor information',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !user || !doctor) {
      toast({
        title: 'Error',
        description: 'Please select date and time',
        variant: 'destructive'
      })
      return
    }

    console.log('Booking appointment:', {
      doctorId,
      patientId: user.id,
      date: selectedDate,
      time: selectedTime,
      symptoms
    })

    setIsBooking(true)
    
    try {
      // Save appointment to Supabase
      const appointmentData = await supabaseHelpers.createAppointment({
        patient_id: user.id,
        doctor_id: doctorId,
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedTime.replace(' ', '').toLowerCase(),
        status: 'pending',
        symptoms: symptoms || undefined,
        consultation_fee: doctor.consultationFee
      })

      console.log('Appointment booked successfully:', appointmentData)
      
      toast({
        title: 'Success!',
        description: 'Your appointment has been booked successfully. You will receive a confirmation shortly.'
      })
      
      onBookingComplete()
    } catch (error) {
      console.error('Booking failed:', error)
      toast({
        title: 'Error',
        description: 'Failed to book appointment. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsBooking(false)
    }
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
          <h2 className="text-2xl font-semibold">Book Appointment</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
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
    )
  }

  if (!doctor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
          <h2 className="text-2xl font-semibold">Book Appointment</h2>
        </div>
        
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Doctor not found. Please go back and try again.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>
        <h2 className="text-2xl font-semibold">Book Appointment</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{doctor.name}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  {doctor.specialization}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {doctor.hospital}
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Consultation Fee</span>
              <span className="font-semibold">LKR {doctor.consultationFee.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => 
                date < new Date() || 
                isWeekend(date) ||
                date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              }
              className="rounded-md border"
            />
            <p className="text-xs text-muted-foreground mt-2">
              * Weekends are not available
            </p>
          </CardContent>
        </Card>

        {/* Time Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    console.log('Time selected:', time)
                    setSelectedTime(time)
                  }}
                  className="flex items-center gap-2"
                >
                  <Clock className="w-3 h-3" />
                  {time}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="symptoms">Describe your symptoms (Optional)</Label>
            <Textarea
              id="symptoms"
              placeholder="Please describe your symptoms or reason for consultation..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Booking Summary */}
      {selectedDate && selectedTime && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Doctor:</span>
                <p className="font-medium">{doctor.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Specialization:</span>
                <p className="font-medium">{doctor.specialization}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-medium">{selectedDate.toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Time:</span>
                <p className="font-medium">{selectedTime}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-lg font-semibold">LKR {doctor.consultationFee.toLocaleString()}</span>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleBooking}
              disabled={isBooking}
            >
              {isBooking ? (
                'Processing...'
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Book & Pay Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}