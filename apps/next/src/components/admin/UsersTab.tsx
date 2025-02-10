import { Fragment } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { User, UserDetails } from '@/types/admin';
import { ActivityStats } from './ActivityStats';
import { MostVisitedPaths } from './MostVisitedPaths';
import { ActivityTimeline } from './ActivityTimeline';

interface UsersTabProps {
  users: User[];
  isLoading: boolean;
  handleSubscription: (userId: string, months: number) => Promise<void>;
  handleCustomSubscription: (userId: string, e: React.FormEvent) => void;
  handleDeleteUser: (userId: string) => Promise<void>;
  handleRemoveSubscription: (userId: string) => Promise<void>;
  toggleUserExpanded: (userId: string) => Promise<void>;
  expandedUsers: { [key: string]: boolean };
  userDetails: { [key: string]: UserDetails };
  loadingDetails: { [key: string]: boolean };
  customMonths: { [key: string]: string };
  isUpdating: { [key: string]: boolean };
  setCustomMonths: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

export function UsersTab({
  users,
  isLoading,
  handleSubscription,
  handleCustomSubscription,
  handleDeleteUser,
  handleRemoveSubscription,
  toggleUserExpanded,
  expandedUsers,
  userDetails,
  loadingDetails,
  customMonths,
  isUpdating,
  setCustomMonths,
}: UsersTabProps) {
  const handleClearActivities = async (userId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to clear all activities for this user? This action cannot be undone.',
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/activities`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear activities');

      // Refresh user details
      await toggleUserExpanded(userId);
      await toggleUserExpanded(userId);

      toast.success('Activities cleared successfully');
    } catch {
      toast.error('Failed to clear activities');
    }
  };

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
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.subscribedUntil && new Date(user.subscribedUntil) > new Date()
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}
                            >
                              {user.subscribedUntil
                                ? new Date(user.subscribedUntil) > new Date()
                                  ? `Until ${new Date(user.subscribedUntil).toLocaleDateString()}`
                                  : 'Expired'
                                : 'No subscription'}
                            </span>
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
                              {user.subscribedUntil &&
                                new Date(user.subscribedUntil) > new Date() && (
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
                                onChange={(e) =>
                                  setCustomMonths({ ...customMonths, [user.id]: e.target.value })
                                }
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
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  <div className="bg-card p-4 rounded-lg border">
                                    <div className="text-sm text-muted-foreground">Last Active</div>
                                    <div className="text-lg font-medium">
                                      {userDetails[user.id].user.lastActive
                                        ? new Date(
                                            userDetails[user.id].user.lastActive as string,
                                          ).toLocaleString()
                                        : 'Never'}
                                    </div>
                                  </div>
                                  <div className="bg-card p-4 rounded-lg border">
                                    <div className="text-sm text-muted-foreground">
                                      Account Created
                                    </div>
                                    <div className="text-lg font-medium">
                                      {new Date(
                                        userDetails[user.id].user.createdAt,
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="bg-card p-4 rounded-lg border">
                                    <div className="text-sm text-muted-foreground">Status</div>
                                    <div
                                      className={`text-lg font-medium ${
                                        {
                                          online: 'text-green-500',
                                          away: 'text-yellow-500',
                                          inactive: 'text-orange-500',
                                          offline: 'text-gray-500',
                                        }[userDetails[user.id].user.status]
                                      }`}
                                    >
                                      {userDetails[user.id].user.status.charAt(0).toUpperCase() +
                                        userDetails[user.id].user.status.slice(1)}
                                    </div>
                                  </div>
                                </div>

                                <ActivityStats stats={userDetails[user.id].activities.stats} />

                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <MostVisitedPaths
                                      paths={userDetails[user.id].activities.stats.mostVisitedPaths}
                                    />
                                  </div>
                                  <div>
                                    <div className="flex justify-between items-center mb-4">
                                      <h3 className="text-lg font-semibold">Recent Activities</h3>
                                      <button
                                        onClick={() => handleClearActivities(user.id)}
                                        className="flex items-center space-x-1 px-2 py-1 text-xs text-destructive hover:text-destructive-foreground hover:bg-destructive/10 rounded transition-colors"
                                        title="Clear all activities"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        <span>Clear All</span>
                                      </button>
                                    </div>
                                    <ActivityTimeline
                                      activities={userDetails[user.id].activities.recent}
                                    />
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
  );
}
