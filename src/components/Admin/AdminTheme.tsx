import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Snowflake, Palette } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AdminTheme() {
  const [winterThemeEnabled, setWinterThemeEnabled] = useState(false);
  const [colorTheme, setColorTheme] = useState('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'theme');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setWinterThemeEnabled(docSnap.data()?.winterThemeEnabled || false);
          setColorTheme(docSnap.data()?.colorTheme || 'default');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching theme settings:', error);
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggleWinterTheme = async (checked: boolean) => {
    try {
      setWinterThemeEnabled(checked);
      const docRef = doc(db, 'settings', 'theme');
      await setDoc(docRef, { winterThemeEnabled: checked }, { merge: true });
      toast.success(checked ? '❄️ Winter theme enabled!' : '🌸 Winter theme disabled!');
    } catch (error) {
      console.error('Error updating winter theme:', error);
      toast.error('Failed to update theme settings');
      setWinterThemeEnabled(!checked);
    }
  };

  const handleColorThemeChange = async (theme: string) => {
    try {
      setColorTheme(theme);
      const docRef = doc(db, 'settings', 'theme');
      await setDoc(docRef, { colorTheme: theme }, { merge: true });
      toast.success(`🎨 ${theme === 'cyber-pink' ? 'Cyber Pink' : 'Default'} theme activated!`);
    } catch (error) {
      console.error('Error updating color theme:', error);
      toast.error('Failed to update theme settings');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="flex flex-col space-y-1">
            <span className="text-base font-semibold">Color Theme</span>
            <span className="text-sm text-muted-foreground">
              Choose the color scheme for the website
            </span>
          </Label>
          <Select value={colorTheme} onValueChange={handleColorThemeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-red-600" />
                  Default (Red)
                </div>
              </SelectItem>
              <SelectItem value="cyber-pink">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500" />
                  Cyber Pink (Black, Blue, Pink, White)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="winter-theme" className="flex flex-col space-y-1">
            <span className="text-base font-semibold flex items-center gap-2">
              <Snowflake className="h-4 w-4" />
              Winter Theme
            </span>
            <span className="text-sm text-muted-foreground">
              Enable falling snow effect across the website
            </span>
          </Label>
          <Switch
            id="winter-theme"
            checked={winterThemeEnabled}
            onCheckedChange={handleToggleWinterTheme}
          />
        </div>

        {winterThemeEnabled && (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">
              ❄️ Winter theme is now active! Users will see falling snow across the website.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
