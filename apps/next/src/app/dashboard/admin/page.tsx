'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { isUserAdmin } from '@/lib/user-helpers';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, UserDetails } from '@/types/admin';
import { UsersTab } from '@/components/admin/UsersTab';
import { TrendsTab } from '@/components/admin/TrendsTab';
import { AppearanceTab } from '@/components/admin/AppearanceTab';
import { ColorTrendsTab } from '@/components/admin/ColorTrendsTab';
import { CategoriesTab } from '@/components/admin/CategoriesTab';
import { BulkImportTab } from '@/components/admin/BulkImportTab';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAdmin, setHasCheckedAdmin] = useState(false);
  const router = useRouter();
  const [customMonths, setCustomMonths] = useState<{ [key: string]: string }>({});
  const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({});
  const [expandedUsers, setExpandedUsers] = useState<{ [key: string]: boolean }>({});
  const [userDetails, setUserDetails] = useState<{ [key: string]: UserDetails }>({});
  const [loadingDetails, setLoadingDetails] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Only run this effect when session status changes from loading to authenticated
    if (status === 'loading' || hasCheckedAdmin) return;

    const checkAdminAndFetchUsers = async () => {
      setHasCheckedAdmin(true);

      // Redirect non-admin users
      if (status === 'authenticated' && !isUserAdmin(session.user)) {
        toast.error('You do not have permission to access this page');
        router.replace('/dashboard');
        return;
      }

      // Only fetch users if user is admin
      if (status === 'authenticated' && isUserAdmin(session.user)) {
        try {
          const response = await fetch('/api/admin/users');
          if (!response.ok) {
            if (response.status === 403) {
              toast.error('Access denied');
              router.replace('/dashboard');
              return;
            }
            throw new Error('Failed to fetch users');
          }
          const data = await response.json();
          setUsers(data);
        } catch (error) {
          toast.error('Failed to fetch users');
          console.error('Error fetching users:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAdminAndFetchUsers();
  }, [session, status, router, hasCheckedAdmin]);

  const handleSubscription = async (userId: string, months: number) => {
    setIsUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months }),
      });
      if (!response.ok) throw new Error('Failed to update subscription');
      const updatedUser = await response.json();
      setUsers((prev) => prev.map((user) => (user.id === userId ? updatedUser : user)));
      toast.success('Subscription updated successfully');
    } catch (error) {
      toast.error('Failed to update subscription');
      console.error('Error updating subscription:', error);
    } finally {
      setIsUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleCustomSubscription = (userId: string, e: React.FormEvent) => {
    e.preventDefault();
    const months = parseInt(customMonths[userId]);
    if (isNaN(months) || months < 1) {
      toast.error('Please enter a valid number of months');
      return;
    }
    handleSubscription(userId, months);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
      console.error('Error deleting user:', error);
    }
  };

  const handleRemoveSubscription = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this subscription?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove subscription');
      const updatedUser = await response.json();
      setUsers((prev) => prev.map((user) => (user.id === userId ? updatedUser : user)));
      toast.success('Subscription removed successfully');
    } catch (error) {
      toast.error('Failed to remove subscription');
      console.error('Error removing subscription:', error);
    }
  };

  const toggleUserExpanded = async (userId: string) => {
    const newExpandedState = !expandedUsers[userId];
    setExpandedUsers({ ...expandedUsers, [userId]: newExpandedState });

    if (newExpandedState && !userDetails[userId]) {
      setLoadingDetails({ ...loadingDetails, [userId]: true });
      try {
        const response = await fetch(`/api/admin/users/${userId}/sessions`);
        if (!response.ok) throw new Error('Failed to fetch user details');
        const data = await response.json();
        setUserDetails({ ...userDetails, [userId]: data });
      } catch {
        toast.error('Failed to load user details');
      } finally {
        setLoadingDetails({ ...loadingDetails, [userId]: false });
      }
    }
  };

  // Check if current user is admin
  if (!isUserAdmin(session?.user)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users, trends, and system settings</p>
      </div>

      <Tabs defaultValue="users" className="relative space-y-6">
        <div className="sticky top-0 z-10 bg-[color:var(--background)] border-b border-[color:var(--border)] pb-4">
          <TabsList className="w-full grid grid-cols-6 bg-[color:var(--muted)] rounded-lg p-1">
            <TabsTrigger 
              value="users"
              className="rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out-expo
                data-[state=active]:bg-[color:var(--background)] data-[state=active]:text-[color:var(--foreground)]
                data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]
                hover:text-[color:var(--foreground)]/90"
            >
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="trends"
              className="rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out-expo
                data-[state=active]:bg-[color:var(--background)] data-[state=active]:text-[color:var(--foreground)]
                data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]
                hover:text-[color:var(--foreground)]/90"
            >
              Trends
            </TabsTrigger>
            <TabsTrigger 
              value="colors"
              className="rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out-expo
                data-[state=active]:bg-[color:var(--background)] data-[state=active]:text-[color:var(--foreground)]
                data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]
                hover:text-[color:var(--foreground)]/90"
            >
              Colors
            </TabsTrigger>
            <TabsTrigger 
              value="categories"
              className="rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out-expo
                data-[state=active]:bg-[color:var(--background)] data-[state=active]:text-[color:var(--foreground)]
                data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]
                hover:text-[color:var(--foreground)]/90"
            >
              Categories
            </TabsTrigger>
            <TabsTrigger 
              value="bulk-import"
              className="rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out-expo
                data-[state=active]:bg-[color:var(--background)] data-[state=active]:text-[color:var(--foreground)]
                data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]
                hover:text-[color:var(--foreground)]/90"
            >
              Bulk Import
            </TabsTrigger>
            <TabsTrigger 
              value="appearance"
              className="rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out-expo
                data-[state=active]:bg-[color:var(--background)] data-[state=active]:text-[color:var(--foreground)]
                data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]
                hover:text-[color:var(--foreground)]/90"
            >
              Appearance
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="space-y-6 focus-visible:outline-none">
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

        <TabsContent value="colors">
          <ColorTrendsTab />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="bulk-import">
          <BulkImportTab />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
