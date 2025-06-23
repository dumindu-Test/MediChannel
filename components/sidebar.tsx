'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Search, 
  History, 
  User, 
  Settings, 
  LogOut, 
  Stethoscope,
  Users,
  BarChart3,
  Clock
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, logout } = useAuth()
  
  if (!user) return null

  console.log('Rendering sidebar for user:', user)

  const getMenuItems = () => {
    switch (user.role) {
      case 'patient':
        return [
          { id: 'search', label: 'Find Doctors', icon: Search },
          { id: 'appointments', label: 'My Appointments', icon: Calendar },
          { id: 'history', label: 'Medical History', icon: History },
          { id: 'profile', label: 'Profile', icon: User },
        ]
      case 'doctor':
        return [
          { id: 'schedule', label: 'My Schedule', icon: Clock },
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'patients', label: 'Patients', icon: Users },
          { id: 'profile', label: 'Profile', icon: User },
        ]
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'doctors', label: 'Manage Doctors', icon: Stethoscope },
          { id: 'appointments', label: 'All Appointments', icon: Calendar },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">MediChannel</span>
        </div>
        
        {/* User Info */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  console.log('Tab changed to:', item.id)
                  onTabChange(item.id)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 space-y-1">
        <Separator className="mb-3" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          size="sm"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          size="sm"
          onClick={() => {
            console.log('Logout clicked')
            logout()
          }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}