'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, Fragment } from 'react'
import { isUserAdmin } from '@/lib/user-helpers'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

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
  user: {
    id: string
    email: string | null
    name: string | null
    createdAt: string
    lastActive: string | null
    isActive: boolean
    status: 'online' | 'away' | 'inactive' | 'offline'
  }
  activities: {
    recent: UserActivity[]
    byDate: Record<string, UserActivity[]>
    stats: {
      last24Hours: number
      lastWeek: number
      lastMonth: number
      total: number
      mostVisitedPaths: [string, number][]
      browsers: [string, number][]
      activityByHour: Array<{ hour: number; count: number }>
    }
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

interface Trend {
  id: string
  title: string
  description: string
  type: string
  imageUrls: string[]
  createdAt: string
  updatedAt: string
  analytics: {
    dates: string[]
    values: number[]
  }[]
}

function ActivityStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-card p-4 rounded-lg border">
        <div className="text-sm text-muted-foreground">Last 24 Hours</div>
        <div className="text-2xl font-bold">{stats.last24Hours}</div>
      </div>
      <div className="bg-card p-4 rounded-lg border">
        <div className="text-sm text-muted-foreground">Last Week</div>
        <div className="text-2xl font-bold">{stats.lastWeek}</div>
      </div>
      <div className="bg-card p-4 rounded-lg border">
        <div className="text-sm text-muted-foreground">Last Month</div>
        <div className="text-2xl font-bold">{stats.lastMonth}</div>
      </div>
      <div className="bg-card p-4 rounded-lg border">
        <div className="text-sm text-muted-foreground">Total Activities</div>
        <div className="text-2xl font-bold">{stats.total}</div>
      </div>
    </div>
  )
}

function MostVisitedPaths({ paths }: { paths: [string, number][] }) {
  function formatPath(path: string): string {
    if (!path || path === 'unknown') return 'Unknown Path'
    if (path === 'home') return 'Home Page'
    return path.split('/').map(segment => 
      segment.charAt(0).toUpperCase() + segment.slice(1)
    ).join(' / ')
  }

  return (
    <div className="bg-card p-4 rounded-lg border mb-6">
      <h4 className="text-sm font-semibold mb-3">Most Visited Paths</h4>
      <div className="space-y-2">
        {paths.map(([path, count]) => (
          <div key={path} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{formatPath(path)}</span>
            <span className="text-sm font-medium">{count} visits</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityTimeline({ activities }: { activities: any[] }) {
  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div key={activity.id} className="bg-card p-4 rounded-lg border">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">{activity.type}</div>
              <div className="text-sm text-muted-foreground">
                {activity.metadata?.path}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(activity.timestamp).toLocaleString()}
            </div>
          </div>
          {activity.metadata?.userAgent && (
            <div className="mt-2 text-sm text-muted-foreground">
              Browser: {activity.metadata.userAgent}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function TrendsTab() {
  const [trends, setTrends] = useState<Trend[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch('/api/admin/trends')
        if (!response.ok) throw new Error('Failed to fetch trends')
        const data = await response.json()
        setTrends(data)
      } catch (error) {
        toast.error('Failed to load trends')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrends()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Trends Management</h2>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Add New Trend
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading trends...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trends.map(trend => (
            <Card key={trend.id} className="p-4">
              <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                {trend.imageUrls[0] && (
                  <img 
                    src={trend.imageUrls[0]} 
                    alt={trend.title}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">{trend.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{trend.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {new Date(trend.createdAt).toLocaleDateString()}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                  {trend.type}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function UsersTab({ users, isLoading, ...props }: { 
  users: User[]
  isLoading: boolean
  [key: string]: any 
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading users...</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border shadow-sm">
          <div className="p-6">
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
                              onClick={() => props.toggleUserExpanded(user.id)}
                              className="p-1 hover:bg-accent rounded"
                            >
                              {props.expandedUsers[user.id] ? (
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
                                  onClick={(e) => props.handleSubscription(user.id, 1, e)}
                                  disabled={props.isUpdating[user.id]}
                                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
                                  title="Add 1 month"
                                >
                                  +1m
                                </button>
                                <button
                                  onClick={(e) => props.handleSubscription(user.id, 3, e)}
                                  disabled={props.isUpdating[user.id]}
                                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
                                  title="Add 3 months"
                                >
                                  +3m
                                </button>
                                <button
                                  onClick={(e) => props.handleSubscription(user.id, 6, e)}
                                  disabled={props.isUpdating[user.id]}
                                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
                                  title="Add 6 months"
                                >
                                  +6m
                                </button>
                                <button
                                  onClick={(e) => props.handleSubscription(user.id, 12, e)}
                                  disabled={props.isUpdating[user.id]}
                                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
                                  title="Add 1 year"
                                >
                                  +1y
                                </button>
                                {user.subscribedUntil && new Date(user.subscribedUntil) > new Date() && (
                                  <button
                                    onClick={(e) => props.handleRemoveSubscription(user.id, e)}
                                    disabled={props.isUpdating[user.id]}
                                    className="px-2 py-1 text-xs bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors disabled:opacity-50"
                                    title="Remove subscription"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                              <form 
                                onSubmit={(e) => props.handleCustomSubscription(user.id, e)}
                                className="flex items-center space-x-1"
                              >
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="# months"
                                  value={props.customMonths[user.id] || ''}
                                  onChange={(e) => props.setCustomMonths({ ...props.customMonths, [user.id]: e.target.value })}
                                  className="w-20 px-2 py-1 text-xs rounded border border-border bg-background"
                                />
                                <button
                                  type="submit"
                                  disabled={props.isUpdating[user.id]}
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
                            onClick={(e) => props.handleDeleteUser(user.id, e)}
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10 px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      {props.expandedUsers[user.id] && (
                        <tr>
                          <td colSpan={6} className="bg-accent/5 p-4">
                            {props.loadingDetails[user.id] ? (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                              </div>
                            ) : props.userDetails[user.id] ? (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  <div className="bg-card p-4 rounded-lg border">
                                    <div className="text-sm text-muted-foreground">Last Active</div>
                                    <div className="text-lg font-medium">
                                      {props.userDetails[user.id].user.lastActive 
                                        ? new Date(props.userDetails[user.id].user.lastActive as string).toLocaleString()
                                        : 'Never'}
                                    </div>
                                  </div>
                                  <div className="bg-card p-4 rounded-lg border">
                                    <div className="text-sm text-muted-foreground">Account Created</div>
                                    <div className="text-lg font-medium">
                                      {new Date(props.userDetails[user.id].user.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="bg-card p-4 rounded-lg border">
                                    <div className="text-sm text-muted-foreground">Status</div>
                                    <div className={`text-lg font-medium ${
                                      {
                                        'online': 'text-green-500',
                                        'away': 'text-yellow-500',
                                        'inactive': 'text-orange-500',
                                        'offline': 'text-gray-500'
                                      }[props.userDetails[user.id].user.status as 'online' | 'away' | 'inactive' | 'offline']
                                    }`}>
                                      {props.userDetails[user.id].user.status.charAt(0).toUpperCase() + 
                                       props.userDetails[user.id].user.status.slice(1)}
                                    </div>
                                  </div>
                                </div>

                                <ActivityStats stats={props.userDetails[user.id].activities.stats} />
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <MostVisitedPaths paths={props.userDetails[user.id].activities.stats.mostVisitedPaths} />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                                    <ActivityTimeline activities={props.userDetails[user.id].activities.recent} />
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
          </div>
        </div>
      )}
    </div>
  )
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
          Manage users, trends, and system settings
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UsersTab 
            users={users}
            isLoading={isLoading}
            handleSubscription={handleSubscription}
            handleCustomSubscription={handleCustomSubscription}
            handleDeleteUser={handleDeleteUser}
            handleRemoveSubscription={handleRemoveSubscription}
            toggleUserExpanded={toggleUserExpanded}
            expandedUsers={expandedUsers}
            userDetails={userDetails}
            loadingDetails={loadingDetails}
            customMonths={customMonths}
            isUpdating={isUpdating}
            setCustomMonths={setCustomMonths}
          />
        </TabsContent>

        <TabsContent value="trends">
          <TrendsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
} 