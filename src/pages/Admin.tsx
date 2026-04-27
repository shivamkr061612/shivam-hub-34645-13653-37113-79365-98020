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
import { AdminNotice } from '@/components/Admin/AdminNotice';
import { AdminBlueTickSettings } from '@/components/Admin/AdminBlueTickSettings';
import { AdminBlueTickRequests } from '@/components/Admin/AdminBlueTickRequests';
import { AdminSpecialOffers } from '@/components/Admin/AdminSpecialOffers';
import { AdminTheme } from '@/components/Admin/AdminTheme';
import { AdminPopup } from '@/components/Admin/AdminPopup';
import { AdminLiveChat } from '@/components/Admin/AdminLiveChat';
import { AdminFeedback } from '@/components/Admin/AdminFeedback';
import { AdminShayaris } from '@/components/Admin/AdminShayaris';
import { AdminSectionSettings } from '@/components/Admin/AdminSectionSettings';
import { AdminCoupons } from '@/components/Admin/AdminCoupons';
import { AdminMyApps } from '@/components/Admin/AdminMyApps';
import AdminPushNotifications from '@/components/Admin/AdminPushNotifications';
import { AdminAvatars } from '@/components/Admin/AdminAvatars';
import AdminKeyGeneration from '@/components/Admin/AdminKeyGeneration';
import { AdminPromotionalBanners } from '@/components/Admin/AdminPromotionalBanners';
import { AdminUserUploads } from '@/components/Admin/AdminUserUploads';
import { AdminPromotionSettings } from '@/components/Admin/AdminPromotionSettings';
import { AdminAds } from '@/components/Admin/AdminAds';
import { AdminTrending } from '@/components/Admin/AdminTrending';
import { AdminCacheControl } from '@/components/Admin/AdminCacheControl';
import { AdminSEO } from '@/components/Admin/AdminSEO';
import { AdminSubAdmins } from '@/components/Admin/AdminSubAdmins';
import { Shield, ShieldCheck } from 'lucide-react';

const Admin = () => {
  const { isAdmin, isSubAdmin, isAnyAdmin, subAdminPermissions, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAnyAdmin) {
    return <Navigate to="/" replace />;
  }

  // Build tab list based on role
  type Tab = { value: string; label: string; component: JSX.Element };
  const allTabs: Tab[] = [
    { value: 'upload', label: 'Upload', component: <AdminUpload /> },
    { value: 'myapps', label: 'My Apps', component: <AdminMyApps /> },
    { value: 'edit', label: 'Edit', component: <AdminEdit /> },
    { value: 'users', label: 'Users', component: <AdminUsers /> },
    { value: 'subadmins', label: 'Sub-Admins', component: <AdminSubAdmins /> },
    { value: 'settings', label: 'Settings', component: <AdminWebsiteSettings /> },
    { value: 'theme', label: 'Theme', component: <AdminTheme /> },
    { value: 'notice', label: 'Notice', component: <AdminNotice /> },
    { value: 'leaderboard', label: 'Leaderboard', component: <AdminLeaderboard /> },
    { value: 'notifications', label: 'Notifications', component: <AdminNotifications /> },
    { value: 'maintenance', label: 'Maintenance', component: <AdminMaintenance /> },
    { value: 'messages', label: 'Messages', component: <AdminMessages /> },
    { value: 'verification', label: 'Verification', component: <AdminVerification /> },
    { value: 'bluetick-settings', label: 'Blue Tick Settings', component: <AdminBlueTickSettings /> },
    { value: 'bluetick-requests', label: 'Blue Tick Requests', component: <AdminBlueTickRequests /> },
    { value: 'special-offers', label: 'Special Offers', component: <AdminSpecialOffers /> },
    { value: 'popup', label: 'Popup', component: <AdminPopup /> },
    { value: 'sections', label: 'Sections', component: <AdminSectionSettings /> },
    { value: 'coupons', label: 'Coupons', component: <AdminCoupons /> },
    { value: 'livechat', label: 'Live Chat', component: <AdminLiveChat /> },
    { value: 'feedback', label: 'Feedback', component: <AdminFeedback /> },
    { value: 'shayaris', label: 'Shayaris', component: <AdminShayaris /> },
    { value: 'push-notifications', label: 'Push Notifications', component: <AdminPushNotifications /> },
    { value: 'avatars', label: 'Avatars', component: <AdminAvatars /> },
    { value: 'key-generation', label: 'Generate Keys', component: <AdminKeyGeneration /> },
    { value: 'promotional-banners', label: 'Promo Banners', component: <AdminPromotionalBanners /> },
    { value: 'user-uploads', label: 'User Uploads', component: <AdminUserUploads /> },
    { value: 'promotion-settings', label: 'Promotions', component: <AdminPromotionSettings /> },
    { value: 'trending', label: 'Trending', component: <AdminTrending /> },
    { value: 'ads', label: 'Ads', component: <AdminAds /> },
    { value: 'seo', label: 'SEO', component: <AdminSEO /> },
    { value: 'cache', label: 'Cache', component: <AdminCacheControl /> },
  ];

  // Map permissions -> allowed tabs for sub-admins
  const permTabMap: Record<string, string[]> = {
    upload: ['upload', 'myapps'],
    edit: ['edit', 'myapps'],
    messages: ['messages'],
    feedback: ['feedback'],
  };

  let visibleTabs: Tab[];
  if (isAdmin) {
    visibleTabs = allTabs;
  } else {
    const allowed = new Set<string>();
    subAdminPermissions.forEach(p => {
      (permTabMap[p] || []).forEach(t => allowed.add(t));
    });
    visibleTabs = allTabs.filter(t => allowed.has(t.value));
  }

  if (visibleTabs.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-12 text-center">
          <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h2 className="text-xl font-bold">No permissions assigned</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Ask the super admin to grant you permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          {isAdmin ? (
            <Shield className="h-8 w-8 text-primary" />
          ) : (
            <ShieldCheck className="h-8 w-8 text-primary" />
          )}
          <div>
            <h1 className="text-3xl font-bold">{isAdmin ? 'Admin Panel' : 'Sub-Admin Panel'}</h1>
            {isSubAdmin && (
              <p className="text-xs text-muted-foreground">
                Limited access • {subAdminPermissions.length} permission(s) granted
              </p>
            )}
          </div>
        </div>

        <Tabs defaultValue={visibleTabs[0].value} className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 overflow-x-auto h-auto">
            {visibleTabs.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="whitespace-nowrap text-sm">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {visibleTabs.map(t => (
            <TabsContent key={t.value} value={t.value}>
              {t.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
