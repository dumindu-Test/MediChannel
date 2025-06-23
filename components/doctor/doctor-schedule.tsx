'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Clock, Plus, Edit, Trash2 } from 'lucide-react'

interface TimeSlot {
  id: string
  time: string
  isAvailable: boolean
  isBooked: boolean
  patientName?: string
}

// This will be loaded from Supabase
const mockSchedule: { [key: string]: TimeSlot[] } = {}

export function DoctorSchedule() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [schedule, setSchedule] = useState<{ [key: string]: TimeSlot[] }>({})
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  
  console.log('Doctor schedule component rendered')

  useEffect(() => {
    if (user && selectedDate) {
      loadSchedule()
    }
  }, [user, selectedDate])

  const loadSchedule = async () => {
    if (!user || !selectedDate) return
    
    console.log('Loading schedule from Supabase for doctor:', user.id)
    setIsLoading(true)
    
    try {
      const dateKey = selectedDate.toISOString().split('T')[0]
      
      // Load doctor's schedule for the selected date
      const scheduleData = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_id', user.id)
        .eq('schedule_date', dateKey)
        .single()

      if (scheduleData && scheduleData.time_slots) {
        // Load appointments for this date to check booking status
        const appointmentsData = await supabase
          .from('appointments')
          .select('*, patient:patient_id(*)')
          .eq('doctor_id', user.id)
          .eq('appointment_date', dateKey)
          .data

        // Map schedule with appointment data
        const timeSlots: TimeSlot[] = scheduleData.time_slots.map((slot: any, index: number) => {
          const appointment = appointmentsData.find((apt: any) => 
            apt.appointment_time === slot.time
          )
          
          return {
            id: `${index + 1}`,
            time: slot.time,
            isAvailable: slot.is_available,
            isBooked: !!appointment,
            patientName: appointment?.patient?.name
          }
        })

        setSchedule({ [dateKey]: timeSlots })
        console.log('Loaded schedule:', { [dateKey]: timeSlots })
      } else {
        // No schedule found, create default schedule
        const defaultTimeSlots = [
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
        ].map((time, index) => ({
          id: `${index + 1}`,
          time: time,
          isAvailable: true,
          isBooked: false
        }))
        
        setSchedule({ [dateKey]: defaultTimeSlots })
        console.log('Created default schedule for', dateKey)
      }
    } catch (error) {
      console.error('Error loading schedule:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedDateKey = selectedDate?.toISOString().split('T')[0] || ''
  const daySchedule = schedule[selectedDateKey] || []

  const toggleSlotAvailability = async (slotId: string) => {
    if (!user || !selectedDate) return
    
    console.log('Toggling availability for slot:', slotId)
    const selectedDateKey = selectedDate.toISOString().split('T')[0]
    
    // Update local state first
    const updatedSchedule = {
      ...schedule,
      [selectedDateKey]: schedule[selectedDateKey]?.map(slot =>
        slot.id === slotId 
          ? { ...slot, isAvailable: !slot.isAvailable }
          : slot
      ) || []
    }
    
    setSchedule(updatedSchedule)
    
    try {
      // Update Supabase
      const timeSlots = updatedSchedule[selectedDateKey].map(slot => ({
        time: slot.time,
        is_available: slot.isAvailable,
        is_booked: slot.isBooked,
        patient_id: slot.patientName ? 'mock-patient-id' : null
      }))

      await supabase
        .from('doctor_schedules')
        .update({
          time_slots: timeSlots
        })
        .eq('doctor_id', user.id)
        .eq('schedule_date', selectedDateKey)

      console.log('Schedule updated successfully')
    } catch (error) {
      console.error('Error updating schedule:', error)
      // Revert local change if database update fails
      loadSchedule()
    }
  }

  const getSlotStatus = (slot: TimeSlot) => {
    if (slot.isBooked) return { text: 'Booked', color: 'bg-red-500/10 text-red-400 border-red-500/20' }
    if (slot.isAvailable) return { text: 'Available', color: 'bg-green-500/10 text-green-400 border-green-500/20' }
    return { text: 'Unavailable', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
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
                date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              }
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Schedule Management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Schedule for {selectedDate?.toLocaleDateString()}
            </h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Time Slot
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-4 bg-muted rounded w-16"></div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-4 bg-muted rounded w-20"></div>
                        <div className="flex gap-1">
                          <div className="h-8 w-8 bg-muted rounded"></div>
                          <div className="h-8 w-8 bg-muted rounded"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : daySchedule.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No schedule set for this date. Add time slots to start accepting appointments.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {daySchedule.map((slot) => {
                const status = getSlotStatus(slot)
                return (
                  <Card key={slot.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{slot.time}</span>
                          </div>
                          <Badge className={status.color}>
                            {status.text}
                          </Badge>
                          {slot.patientName && (
                            <span className="text-sm text-muted-foreground">
                              Patient: {slot.patientName}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {!slot.isBooked && (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={slot.isAvailable}
                                onCheckedChange={() => toggleSlotAvailability(slot.id)}
                              />
                              <Label className="text-sm">Available</Label>
                            </div>
                          )}
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!slot.isBooked && (
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {daySchedule.filter(s => s.isAvailable && !s.isBooked).length}
              </div>
              <div className="text-sm text-muted-foreground">Available Slots</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {daySchedule.filter(s => s.isBooked).length}
              </div>
              <div className="text-sm text-muted-foreground">Booked Slots</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">
                {daySchedule.filter(s => !s.isAvailable && !s.isBooked).length}
              </div>
              <div className="text-sm text-muted-foreground">Unavailable</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {daySchedule.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Slots</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}