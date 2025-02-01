'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Information */}
        <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-medium text-primary">
                {session?.user?.name?.[0] || session?.user?.email?.[0] || '?'}
              </div>
              <div>
                <h3 className="font-medium">{session?.user?.name || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Display Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  defaultValue={session?.user?.name || ''}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  defaultValue={session?.user?.email || ''}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all disabled:opacity-50"
                />
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-2xl font-bold mb-6">Preferences</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-2xl font-bold mb-6">Security</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>
                <button
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Connected Accounts */}
        <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-2xl font-bold mb-6">Connected Accounts</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#4285F4] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Google</h3>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
              <button className="text-sm text-destructive hover:text-destructive-foreground hover:bg-destructive/10 px-3 py-1 rounded-lg transition-colors">
                Disconnect
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-card rounded-lg p-6 shadow-sm border border-destructive/20">
          <h2 className="text-2xl font-bold mb-6 text-destructive">Danger Zone</h2>
          <div className="space-y-4">
            <button
              className="w-full px-4 py-2 text-sm text-destructive hover:text-destructive-foreground hover:bg-destructive rounded-lg transition-colors"
            >
              Delete Account
            </button>
          </div>
        </section>
      </div>
    </div>
  )
} 