'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Stethoscope, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuth()
  const { toast } = useToast()

  const handleLogin = async (role: 'patient' | 'doctor' | 'admin') => {
    console.log('Login attempt:', { email, role })
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      })
      return
    }

    const success = await login(email, password, role)
    
    if (success) {
      toast({
        title: 'Success',
        description: 'Login successful!'
      })
    } else {
      toast({
        title: 'Error',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const demoCredentials = {
    patient: { email: 'john@email.com', password: 'password' },
    doctor: { email: 'dr.perera@hospital.lk', password: 'password' },
    admin: { email: 'admin@hospital.lk', password: 'password' }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to MediChannel</CardTitle>
          <CardDescription>
            Select your role and sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="patient" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            
            {(['patient', 'doctor', 'admin'] as const).map((role) => (
              <TabsContent key={role} value={role} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor={`email-${role}`}>Email</Label>
                  <Input
                    id={`email-${role}`}
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`password-${role}`}>Password</Label>
                  <Input
                    id={`password-${role}`}
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleLogin(role)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`
                  )}
                </Button>
                
                {/* Demo credentials */}
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">Demo Credentials:</p>
                  <p className="text-muted-foreground">
                    Email: {demoCredentials[role].email}<br />
                    Password: {demoCredentials[role].password}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => {
                      setEmail(demoCredentials[role].email)
                      setPassword(demoCredentials[role].password)
                    }}
                  >
                    Use Demo Credentials
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}