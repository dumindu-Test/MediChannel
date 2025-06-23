'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { UserPlus, Loader2, ArrowLeft, Stethoscope } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SignupFormProps {
  onBackToLogin: () => void
}

export function SignupForm({ onBackToLogin }: SignupFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient' as 'patient' | 'doctor' | 'admin',
    // Doctor specific
    specialization: '',
    hospital: '',
    consultation_fee: '',
    experience: '',
    // Patient specific
    phone: '',
    date_of_birth: '',
    address: ''
  })
  
  const { signup, isLoading } = useAuth()
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSignup = async () => {
    console.log('Signup attempt:', { email: formData.email, role: formData.role })
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      })
      return
    }

    // Role-specific validation
    if (formData.role === 'doctor') {
      if (!formData.specialization || !formData.hospital) {
        toast({
          title: 'Error',
          description: 'Please fill in specialization and hospital for doctor account',
          variant: 'destructive'
        })
        return
      }
    }

    if (formData.role === 'patient') {
      if (!formData.phone) {
        toast({
          title: 'Error',
          description: 'Please provide a phone number for patient account',
          variant: 'destructive'
        })
        return
      }
    }

    // Prepare user data
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      ...(formData.role === 'doctor' && {
        specialization: formData.specialization,
        hospital: formData.hospital,
        consultation_fee: formData.consultation_fee ? parseInt(formData.consultation_fee) : undefined,
        experience: formData.experience ? parseInt(formData.experience) : undefined
      }),
      ...(formData.role === 'patient' && {
        phone: formData.phone,
        date_of_birth: formData.date_of_birth || undefined,
        address: formData.address || undefined
      })
    }

    const result = await signup(userData)
    
    if (result.success) {
      toast({
        title: 'Success!',
        description: 'Your account has been created successfully. Welcome to MediChannel!'
      })
    } else {
      toast({
        title: 'Error',
        description: result.message || 'Failed to create account. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const specializations = [
    'Cardiology', 'Neurology', 'Dermatology', 'Orthopedics', 
    'Pediatrics', 'Gastroenterology', 'Ophthalmology', 'ENT', 
    'Gynecology', 'Psychiatry', 'General Medicine', 'Surgery'
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBackToLogin}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            Join MediChannel and start managing your healthcare journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={formData.role} onValueChange={(value) => handleInputChange('role', value)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            
            {/* Common Fields */}
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Role-specific Fields */}
            <TabsContent value="patient" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+94 77 123 4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="doctor" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Select value={formData.specialization} onValueChange={(value) => handleInputChange('specialization', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital/Clinic *</Label>
                  <Input
                    id="hospital"
                    placeholder="Enter your hospital or clinic name"
                    value={formData.hospital}
                    onChange={(e) => handleInputChange('hospital', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consultation_fee">Consultation Fee (LKR)</Label>
                  <Input
                    id="consultation_fee"
                    type="number"
                    placeholder="2500"
                    value={formData.consultation_fee}
                    onChange={(e) => handleInputChange('consultation_fee', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="10"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4 mt-6">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Admin accounts have full system access. Please contact your system administrator 
                  if you need admin privileges.
                </p>
              </div>
            </TabsContent>

            <div className="pt-6">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}