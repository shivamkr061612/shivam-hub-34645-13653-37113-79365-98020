import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Wrench, Save } from 'lucide-react';

export function AdminMaintenance() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [updateVersion, setUpdateVersion] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    fetchMaintenanceStatus();
  }, []);

  const fetchMaintenanceStatus = async () => {
    try {
      const docRef = doc(db, 'settings', 'maintenance');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMaintenanceMode(data.enabled || false);
        setDescription(data.description || '');
        setUpdateVersion(data.updateVersion || '');
        setEndTime(data.endTime || '');
      }
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
    }
  };

  const toggleMaintenance = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'maintenance'), {
        enabled: !maintenanceMode,
        description,
        updateVersion,
        endTime,
        updatedAt: new Date().toISOString()
      });
      setMaintenanceMode(!maintenanceMode);
      toast.success(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update maintenance mode');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'maintenance'), {
        enabled: maintenanceMode,
        description,
        updateVersion,
        endTime,
        updatedAt: new Date().toISOString()
      });
      toast.success('Maintenance settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Mode</CardTitle>
        <CardDescription>Enable or disable site-wide maintenance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-4">
              <Wrench className="h-8 w-8 text-primary" />
              <div>
                <Label htmlFor="maintenance" className="text-lg font-semibold">
                  Maintenance Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  {maintenanceMode 
                    ? 'Site is currently in maintenance mode' 
                    : 'Site is running normally'}
                </p>
              </div>
            </div>
            <Switch
              id="maintenance"
              checked={maintenanceMode}
              onCheckedChange={toggleMaintenance}
              disabled={loading}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="description">Maintenance Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="We're updating the site with new features..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="updateVersion">Update Version</Label>
                <Input
                  id="updateVersion"
                  value={updateVersion}
                  onChange={(e) => setUpdateVersion(e.target.value)}
                  placeholder="v2.0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Expected End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={saveSettings} disabled={loading} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>

          {maintenanceMode && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ Users will see a maintenance popup when trying to access the site.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
