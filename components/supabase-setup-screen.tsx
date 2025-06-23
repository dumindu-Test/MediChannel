'use client'

import { AlertTriangle, Database, ExternalLink, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState } from 'react'

export function SupabaseSetupScreen() {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedEnv, setCopiedEnv] = useState(false)

  const copyToClipboard = (text: string, type: 'url' | 'env') => {
    navigator.clipboard.writeText(text)
    if (type === 'url') {
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } else {
      setCopiedEnv(true)
      setTimeout(() => setCopiedEnv(false), 2000)
    }
  }

  const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            🏥 Healthcare Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome! To get started, you need to configure your Supabase database connection.
          </p>
        </div>

        {/* Alert */}
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Supabase Configuration Required:</strong> Environment variables are missing. 
            The app is currently running with limited mock data for demonstration purposes.
          </AlertDescription>
        </Alert>

        {/* Setup Steps */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Step 1 */}
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                Create Supabase Project
              </CardTitle>
              <CardDescription>
                Set up your database on Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Go to Supabase and create a new project for your healthcare system.
              </p>
              <Button 
                onClick={() => copyToClipboard('https://supabase.com', 'url')}
                variant="outline" 
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {copiedUrl ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  'Visit Supabase.com'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                Run Database Schema
              </CardTitle>
              <CardDescription>
                Execute the SQL schema in your Supabase project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Copy and run the SQL from <code className="bg-gray-100 px-2 py-1 rounded">supabase-schema.sql</code> in your Supabase SQL Editor.
              </p>
              <div className="bg-gray-100 p-3 rounded-lg text-xs font-mono">
                📁 supabase-schema.sql
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="border-2 hover:border-blue-200 transition-colors md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                Configure Environment Variables
              </CardTitle>
              <CardDescription>
                Add your Supabase credentials to .env.local
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Get your Project URL and API Key from Supabase Settings → API, then add them to your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file:
              </p>
              
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                <pre className="text-sm overflow-x-auto">{envTemplate}</pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(envTemplate, 'env')}
                >
                  {copiedEnv ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>After updating .env.local:</strong> Restart your development server (<code>npm run dev</code>) to apply the changes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Demo Mode Notice */}
        <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-gray-700">Currently Running in Demo Mode</h3>
              <p className="text-sm text-gray-600">
                You can explore the interface with limited functionality using mock data.
                Configure Supabase above to unlock full database features.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="flex justify-center space-x-4 text-sm">
          <Button variant="link" asChild>
            <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer">
              📚 Supabase Docs
            </a>
          </Button>
          <Button variant="link" asChild>
            <a href="/SUPABASE_SETUP.md" target="_blank" rel="noopener noreferrer">
              📋 Detailed Setup Guide
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}