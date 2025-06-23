'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Star, Calendar, Loader2 } from 'lucide-react'

interface Doctor {
  id: string
  name: string
  specialization: string
  hospital: string
  rating: number
  experience: number
  available: boolean
  nextSlot?: string
  consultation_fee?: number
}

const specializations = [
  'All Specializations',
  'Cardiology',
  'Neurology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Gastroenterology',
  'Ophthalmology',
  'ENT',
  'Gynecology'
]

interface DoctorSearchProps {
  onBookAppointment: (doctorId: string) => void
}

export function DoctorSearch({ onBookAppointment }: DoctorSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations')
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  console.log('Doctor search component rendered')

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    console.log('Loading doctors from Supabase')
    setIsLoading(true)
    
    try {
      const doctorsData = await supabase
        .from('users')
        .select('*')
        .eq('role', 'doctor')
        .data

      const doctors: Doctor[] = doctorsData.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        specialization: doc.specialization || 'General Medicine',
        hospital: doc.hospital || 'Hospital',
        rating: doc.rating || 4.5,
        experience: doc.experience || 10,
        available: true,
        nextSlot: 'Today 2:30 PM',
        consultation_fee: doc.consultation_fee || 2500
      }))

      console.log('Loaded doctors:', doctors)
      setAllDoctors(doctors)
      setFilteredDoctors(doctors)
    } catch (error) {
      console.error('Error loading doctors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    console.log('Search initiated:', { searchTerm, selectedSpecialization })
    
    let filtered = allDoctors.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSpecialization = selectedSpecialization === 'All Specializations' ||
                                   doctor.specialization === selectedSpecialization
      return matchesSearch && matchesSpecialization
    })

    console.log('Filtered doctors:', filtered)
    setFilteredDoctors(filtered)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="h-10 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="w-full sm:w-64">
            <div className="h-10 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="w-24">
            <div className="h-10 bg-muted rounded animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by doctor name or hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          Search
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
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
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{doctor.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  {doctor.experience} years exp.
                </span>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Fee: </span>
                <span className="font-medium">LKR {doctor.consultation_fee?.toLocaleString()}</span>
              </div>

              {doctor.available ? (
                <div className="space-y-2">
                  {doctor.nextSlot && (
                    <div className="flex items-center gap-2 text-sm text-accent">
                      <Calendar className="w-4 h-4" />
                      Next: {doctor.nextSlot}
                    </div>
                  )}
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      console.log('Book appointment clicked for doctor:', doctor.id)
                      onBookAppointment(doctor.id)
                    }}
                  >
                    Book Appointment
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" disabled className="w-full">
                  Currently Unavailable
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No doctors found matching your search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}