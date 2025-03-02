import { Fragment } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { User, UserDetails } from '@/types/admin';

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
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[color:var(--foreground)]">User Management</h2>
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--primary)] mx-auto"></div>
          <p className="mt-2 text-[color:var(--muted-foreground)]">Loading users...</p>
        </div>
      ) : (
        <div className="bg-[color:var(--card)] rounded-lg border border-[color:var(--border)] shadow-sm">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[color:var(--border)]">
                    <th className="text-left py-3 px-4 text-[color:var(--foreground)]">Name</th>
                    <th className="text-left py-3 px-4 text-[color:var(--foreground)]">Email</th>
                    <th className="text-left py-3 px-4 text-[color:var(--foreground)]">Created At</th>
                    <th className="text-left py-3 px-4 text-[color:var(--foreground)]">Subscription</th>
                    <th className="text-left py-3 px-4 text-[color:var(--foreground)]">Admin</th>
                    <th className="text-left py-3 px-4 text-[color:var(--foreground)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <Fragment key={user.id}>
                      <tr className="border-b border-[color:var(--border)] hover:bg-[color:var(--accent)]/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleUserExpanded(user.id)}
                              className="p-1 hover:bg-[color:var(--accent)] rounded"
                            >
                              {expandedUsers[user.id] ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            <span className="text-[color:var(--foreground)]">{user.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[color:var(--foreground)]">{user.email}</td>
                        <td className="py-3 px-4 text-[color:var(--foreground)]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.subscribedUntil && new Date(user.subscribedUntil) > new Date()
                                  ? 'bg-[color:var(--color-muted-green)]/10 text-[color:var(--color-muted-green)] dark:bg-[color:var(--color-muted-green)]/30 dark:text-[color:var(--color-muted-green)]'
                                  : 'bg-[color:var(--color-subtle-yellow)]/10 text-[color:var(--color-subtle-yellow)] dark:bg-[color:var(--color-subtle-yellow)]/30 dark:text-[color:var(--color-subtle-yellow)]'
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
                                className="px-2 py-1 text-xs bg-[color:var(--primary)]/10 text-[color:var(--primary)] rounded hover:bg-[color:var(--primary)]/20 transition-colors disabled:opacity-50"
                                title="Add 1 month"
                              >
                                +1m
                              </button>
                              <button
                                onClick={() => handleSubscription(user.id, 3)}
                                disabled={isUpdating[user.id]}
                                className="px-2 py-1 text-xs bg-[color:var(--primary)]/10 text-[color:var(--primary)] rounded hover:bg-[color:var(--primary)]/20 transition-colors disabled:opacity-50"
                                title="Add 3 months"
                              >
                                +3m
                              </button>
                              <button
                                onClick={() => handleSubscription(user.id, 6)}
                                disabled={isUpdating[user.id]}
                                className="px-2 py-1 text-xs bg-[color:var(--primary)]/10 text-[color:var(--primary)] rounded hover:bg-[color:var(--primary)]/20 transition-colors disabled:opacity-50"
                                title="Add 6 months"
                              >
                                +6m
                              </button>
                              <button
                                onClick={() => handleSubscription(user.id, 12)}
                                disabled={isUpdating[user.id]}
                                className="px-2 py-1 text-xs bg-[color:var(--primary)]/10 text-[color:var(--primary)] rounded hover:bg-[color:var(--primary)]/20 transition-colors disabled:opacity-50"
                                title="Add 1 year"
                              >
                                +1y
                              </button>
                              {user.subscribedUntil &&
                                new Date(user.subscribedUntil) > new Date() && (
                                  <button
                                    onClick={() => handleRemoveSubscription(user.id)}
                                    disabled={isUpdating[user.id]}
                                    className="px-2 py-1 text-xs bg-[color:var(--destructive)]/10 text-[color:var(--destructive)] rounded hover:bg-[color:var(--destructive)]/20 transition-colors disabled:opacity-50"
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
                                className="w-20 px-2 py-1 text-xs rounded border border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--foreground)]"
                              />
                              <button
                                type="submit"
                                disabled={isUpdating[user.id]}
                                className="px-2 py-1 text-xs bg-[color:var(--primary)] text-[color:var(--primary-foreground)] rounded hover:bg-[color:var(--primary)]/90 transition-colors disabled:opacity-50"
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
                                ? 'bg-[color:var(--primary)]/10 text-[color:var(--primary)]'
                                : 'bg-[color:var(--muted)] text-[color:var(--muted-foreground)]'
                            }`}
                          >
                            {user.isAdmin ? 'Admin' : 'User'}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-[color:var(--destructive)] hover:text-[color:var(--destructive-foreground)] hover:bg-[color:var(--destructive)]/10 px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      {expandedUsers[user.id] && (
                        <tr>
                          <td colSpan={6} className="bg-[color:var(--accent)]/5 p-4">
                            {loadingDetails[user.id] ? (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[color:var(--primary)]"></div>
                              </div>
                            ) : userDetails[user.id] ? (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  <div className="bg-[color:var(--card)] p-4 rounded-lg border border-[color:var(--border)]">
                                    <div className="text-sm text-[color:var(--muted-foreground)]">Last Active</div>
                                    <div className="text-lg font-medium text-[color:var(--foreground)]">
                                      {userDetails[user.id].user.lastActive
                                        ? new Date(
                                            userDetails[user.id].user.lastActive as string,
                                          ).toLocaleString()
                                        : 'Never'}
                                    </div>
                                  </div>
                                  <div className="bg-[color:var(--card)] p-4 rounded-lg border border-[color:var(--border)]">
                                    <div className="text-sm text-[color:var(--muted-foreground)]">
                                      Account Created
                                    </div>
                                    <div className="text-lg font-medium text-[color:var(--foreground)]">
                                      {new Date(
                                        userDetails[user.id].user.createdAt,
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="bg-[color:var(--card)] p-4 rounded-lg border border-[color:var(--border)]">
                                    <div className="text-sm text-[color:var(--muted-foreground)]">Status</div>
                                    <div
                                      className={`text-lg font-medium ${
                                        {
                                          online: 'text-[color:var(--color-muted-green)]',
                                          away: 'text-[color:var(--color-subtle-yellow)]',
                                          inactive: 'text-[color:var(--color-subtle-orange)]',
                                          offline: 'text-[color:var(--muted-foreground)]',
                                        }[userDetails[user.id].user.status]
                                      }`}
                                    >
                                      {userDetails[user.id].user.status.charAt(0).toUpperCase() +
                                        userDetails[user.id].user.status.slice(1)}
                                    </div>
                                  </div>
                                </div>

                              </div>
                            ) : (
                              <div className="text-center py-4 text-[color:var(--muted-foreground)]">
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
