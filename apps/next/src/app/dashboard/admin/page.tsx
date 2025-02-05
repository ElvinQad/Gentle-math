'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, Fragment } from 'react'
import { isUserAdmin } from '@/lib/user-helpers'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface UserSession {
  id: string
  expires: string
  lastUsed: string
}

interface UserAccount {
  provider: string
  type: string
  providerAccountId: string
  expiresAt: string | null
}

interface UserActivity {
  id: string
  type: string
  timestamp: string
  metadata: {
    path?: string
    userAgent?: string
    forwardedFor?: string
  }
}

interface UserDetails {
  activities: UserActivity[]
  accounts: UserAccount[]
  stats: {
    totalActivities: number
    recentActivities: number
    connectedProviders: number
  }
}

interface User {
  id: string
  name: string | null
  email: string | null
  isAdmin: boolean
  createdAt: string
  subscribedUntil: string | null
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [customMonths, setCustomMonths] = useState<{ [key: string]: string }>({})
  const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({})
  const [expandedUsers, setExpandedUsers] = useState<{ [key: string]: boolean }>({})
  const [userDetails, setUserDetails] = useState<{ [key: string]: UserDetails }>({})
  const [loadingDetails, setLoadingDetails] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    // Redirect non-admin users
    if (status === 'authenticated' && !isUserAdmin(session.user)) {
      toast.error('You do not have permission to access this page')
      router.replace('/dashboard')
      return
    }

    // Only fetch users if user is admin
    if (status === 'authenticated' && isUserAdmin(session.user)) {
      const fetchUsers = async () => {
        try {
          const response = await fetch('/api/admin/users')
          if (!response.ok) {
            if (response.status === 403) {
              toast.error('Access denied')
              router.replace('/dashboard')
              return
            }
            throw new Error('Failed to fetch users')
          }
          const data = await response.json()
          setUsers(data)
        } catch (error) {
          toast.error('Failed to load users')
        } finally {
          setIsLoading(false)
        }
      }

      fetchUsers()
    }
  }, [session, status, router])

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }


  const handleSubscription = async (userId: string, months: number) => {
    if (isUpdating[userId]) return
    
    setIsUpdating({ ...isUpdating, [userId]: true })
    try {
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months }),
      })

      if (!response.ok) throw new Error('Failed to update subscription')

      const updatedUser = await response.json()
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ))
      
      // Clear custom months input after successful update
      setCustomMonths({ ...customMonths, [userId]: '' })
      toast.success('Subscription updated successfully')
    } catch (error) {
      toast.error('Failed to update subscription')
    } finally {
      setIsUpdating({ ...isUpdating, [userId]: false })
    }
  }

  const handleCustomSubscription = (userId: string, e: React.FormEvent) => {
    e.preventDefault()
    const months = parseInt(customMonths[userId])
    if (isNaN(months) || months < 1) {
      toast.error('Please enter a valid number of months')
      return
    }
    handleSubscription(userId, months)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete user')

      setUsers(users.filter(user => user.id !== userId))
      toast.success('User deleted successfully')
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const handleRemoveSubscription = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this user\'s subscription?')) {
      return
    }

    if (isUpdating[userId]) return
    
    setIsUpdating({ ...isUpdating, [userId]: true })
    try {
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove subscription')

      const updatedUser = await response.json()
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ))
      
      toast.success('Subscription removed successfully')
    } catch (error) {
      toast.error('Failed to remove subscription')
    } finally {
      setIsUpdating({ ...isUpdating, [userId]: false })
    }
  }

  const toggleUserExpanded = async (userId: string) => {
    const newExpandedState = !expandedUsers[userId]
    setExpandedUsers({ ...expandedUsers, [userId]: newExpandedState })

    if (newExpandedState && !userDetails[userId]) {
      setLoadingDetails({ ...loadingDetails, [userId]: true })
      try {
        const response = await fetch(`/api/admin/users/${userId}/sessions`)
        if (!response.ok) throw new Error('Failed to fetch user details')
        const data = await response.json()
        setUserDetails({ ...userDetails, [userId]: data })
      } catch (error) {
        toast.error('Failed to load user details')
      } finally {
        setLoadingDetails({ ...loadingDetails, [userId]: false })
      }
    }
  }

  // Check if current user is admin
  if (!isUserAdmin(session?.user)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage users and system settings
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">User Management</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Created At</th>
                    <th className="text-left py-3 px-4">Subscription</th>
                    <th className="text-left py-3 px-4">Admin</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <Fragment key={user.id}>
                      <tr className="border-b border-border hover:bg-accent/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleUserExpanded(user.id)}
                              className="p-1 hover:bg-accent rounded"
                            >
                              {expandedUsers[user.id] ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            <span>{user.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.subscribedUntil && new Date(user.subscribedUntil) > new Date()
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {user.subscribedUntil
                                ? new Date(user.subscribedUntil) > new Date()
                                  ? `Until ${new Date(user.subscribedUntil).toLocaleDateString()}`
                                  : 'Expired'
                                : 'No subscription'
                              }
                            </span>
                            <div className="flex items-center space-x-1">
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleSubscription(user.id, 1)}
                                  disabled={isUpdating[user.id]}
                                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
                                  title="Add 1 month"
                                >
                                  +1m
                                </button>
                                <button
                                  onClick={() => handleSubscription(user.id, 3)}
                                  disabled={isUpdating[user.id]}
                                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
                                  title="Add 3 months"
                                >
                                  +3m
                                </button>
                                <button
                                  onClick={() => handleSubscription(user.id, 6)}
                                  disabled={isUpdating[user.id]}
                                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
                                  title="Add 6 months"
                                >
                                  +6m
                                </button>
                                <button
                                  onClick={() => handleSubscription(user.id, 12)}
                                  disabled={isUpdating[user.id]}
                                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
                                  title="Add 1 year"
                                >
                                  +1y
                                </button>
                                {user.subscribedUntil && new Date(user.subscribedUntil) > new Date() && (
                                  <button
                                    onClick={() => handleRemoveSubscription(user.id)}
                                    disabled={isUpdating[user.id]}
                                    className="px-2 py-1 text-xs bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors disabled:opacity-50"
                                    title="Remove subscription"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                              <form 
                                onSubmit={(e) => handleCustomSubscription(user.id, e)}
                                className="flex items-center space-x-1"
                              >
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="# months"
                                  value={customMonths[user.id] || ''}
                                  onChange={(e) => setCustomMonths({ ...customMonths, [user.id]: e.target.value })}
                                  className="w-20 px-2 py-1 text-xs rounded border border-border bg-background"
                                />
                                <button
                                  type="submit"
                                  disabled={isUpdating[user.id]}
                                  className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                  Add
                                </button>
                              </form>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.isAdmin
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {user.isAdmin ? 'Admin' : 'User'}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10 px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      {expandedUsers[user.id] && (
                        <tr>
                          <td colSpan={6} className="bg-accent/5 p-4">
                            {loadingDetails[user.id] ? (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                              </div>
                            ) : userDetails[user.id] ? (
                              <div className="space-y-6">
                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="bg-card p-4 rounded-lg border border-border">
                                    <div className="text-sm text-muted-foreground">Total Activities</div>
                                    <div className="text-2xl font-bold">{userDetails[user.id].stats.totalActivities}</div>
                                  </div>
                                  <div className="bg-card p-4 rounded-lg border border-border">
                                    <div className="text-sm text-muted-foreground">Recent Activities</div>
                                    <div className="text-2xl font-bold">{userDetails[user.id].stats.recentActivities}</div>
                                  </div>
                                  <div className="bg-card p-4 rounded-lg border border-border">
                                    <div className="text-sm text-muted-foreground">Connected Providers</div>
                                    <div className="text-2xl font-bold">{userDetails[user.id].stats.connectedProviders}</div>
                                  </div>
                                </div>

                                {/* Activities */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-2">Recent Activities</h3>
                                  <div className="bg-card rounded-lg border border-border overflow-hidden">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="border-b border-border">
                                          <th className="text-left py-2 px-4">Type</th>
                                          <th className="text-left py-2 px-4">Path</th>
                                          <th className="text-left py-2 px-4">Time</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {userDetails[user.id].activities.map(activity => (
                                          <tr key={activity.id} className="border-b border-border">
                                            <td className="py-2 px-4 capitalize">{activity.type}</td>
                                            <td className="py-2 px-4">{activity.metadata?.path || 'N/A'}</td>
                                            <td className="py-2 px-4">
                                              {new Date(activity.timestamp).toLocaleString()}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {/* Connected Accounts */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-2">Connected Accounts</h3>
                                  <div className="bg-card rounded-lg border border-border overflow-hidden">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="border-b border-border">
                                          <th className="text-left py-2 px-4">Provider</th>
                                          <th className="text-left py-2 px-4">Type</th>
                                          <th className="text-left py-2 px-4">Provider ID</th>
                                          <th className="text-left py-2 px-4">Expires</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {userDetails[user.id].accounts.map(account => (
                                          <tr key={account.providerAccountId} className="border-b border-border">
                                            <td className="py-2 px-4 capitalize">{account.provider}</td>
                                            <td className="py-2 px-4 capitalize">{account.type}</td>
                                            <td className="py-2 px-4">{account.providerAccountId}</td>
                                            <td className="py-2 px-4">
                                              {account.expiresAt
                                                ? new Date(account.expiresAt).toLocaleString()
                                                : 'Never'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                Failed to load user details
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 