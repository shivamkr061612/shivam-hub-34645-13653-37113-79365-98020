import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminUpload } from '@/components/Admin/AdminUpload';
import { AdminEdit } from '@/components/Admin/AdminEdit';
import { AdminUsers } from '@/components/Admin/AdminUsers';
import { AdminLeaderboard } from '@/components/Admin/AdminLeaderboard';
import { AdminNotifications } from '@/components/Admin/AdminNotifications';
import { AdminMaintenance } from '@/components/Admin/AdminMaintenance';
import { AdminMessages } from '@/components/Admin/AdminMessages';
import { AdminVerification } from '@/components/Admin/AdminVerification';
import { AdminWebsiteSettings } from '@/components/Admin/AdminWebsiteSettings';
import { Shield } from 'lucide-react';

const Admin = () => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-9">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <AdminUpload />
          </TabsContent>

          <TabsContent value="edit">
            <AdminEdit />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="settings">
            <AdminWebsiteSettings />
          </TabsContent>

          <TabsContent value="leaderboard">
            <AdminLeaderboard />
          </TabsContent>

          <TabsContent value="notifications">
            <AdminNotifications />
          </TabsContent>

          <TabsContent value="maintenance">
            <AdminMaintenance />
          </TabsContent>

          <TabsContent value="messages">
            <AdminMessages />
          </TabsContent>

          <TabsContent value="verification">
            <AdminVerification />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
