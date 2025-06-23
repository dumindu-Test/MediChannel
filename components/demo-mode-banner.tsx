'use client'

import { AlertTriangle, Database } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { isSupabaseConfigured } from '@/lib/supabase'

export function DemoModeBanner() {
  if (isSupabaseConfigured) {
    return null
  }

  return (
    <Alert className="bg-amber-50 border-amber-200 mb-6">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 flex items-center justify-between">
        <span>
          <strong>Demo Mode:</strong> You're currently using mock data. 
          Configure Supabase to unlock full database functionality.
        </span>
        <Button 
          size="sm" 
          variant="outline" 
          className="ml-4 border-amber-300 hover:bg-amber-100"
          onClick={() => window.location.reload()}
        >
          <Database className="w-4 h-4 mr-2" />
          Setup Database
        </Button>
      </AlertDescription>
    </Alert>
  )
}