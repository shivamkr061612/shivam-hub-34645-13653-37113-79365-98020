import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Lock, Crown, Loader2, Save } from 'lucide-react';

const SECTIONS = [
  { id: 'mods', name: 'Mods' },
  { id: 'games', name: 'Games' },
  { id: 'assets', name: 'Assets' },
  { id: 'movies', name: 'Movies' },
  { id: 'courses', name: 'Courses' },
  { id: 'bundles', name: 'Bundles' },
];

interface SectionSettings {
  [key: string]: {
    locked: boolean;
    premium: boolean;
  };
}

export function AdminSectionSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState<SectionSettings>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'sections');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as SectionSettings);
      } else {
        // Initialize default settings
        const defaultSettings: SectionSettings = {};
        SECTIONS.forEach(section => {
          defaultSettings[section.id] = { locked: false, premium: false };
        });
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleToggle = (sectionId: string, field: 'locked' | 'premium', value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'sections'), {
        ...settings,
        updatedAt: new Date().toISOString()
      });
      toast.success('Section settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Section Lock & Premium Settings
        </CardTitle>
        <CardDescription>
          Lock sections or make them premium (requires blue tick)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {SECTIONS.map(section => (
            <div
              key={section.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-card/50"
            >
              <div className="font-medium">{section.name}</div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`${section.id}-locked`}
                    checked={settings[section.id]?.locked || false}
                    onCheckedChange={(checked) => handleToggle(section.id, 'locked', checked)}
                  />
                  <Label htmlFor={`${section.id}-locked`} className="flex items-center gap-1 text-sm">
                    <Lock className="h-4 w-4 text-red-500" />
                    Locked
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`${section.id}-premium`}
                    checked={settings[section.id]?.premium || false}
                    onCheckedChange={(checked) => handleToggle(section.id, 'premium', checked)}
                  />
                  <Label htmlFor={`${section.id}-premium`} className="flex items-center gap-1 text-sm">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    Premium
                  </Label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p><strong>Locked:</strong> Section will be completely inaccessible to users</p>
          <p><strong>Premium:</strong> Section requires blue tick verification to access</p>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}
