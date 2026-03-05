import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Snowflake, Palette } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const themeOptions = [
  { value: 'default', label: 'Default', color: 'from-red-500 to-red-600', desc: 'Clean red & white' },
  { value: 'cyber-pink', label: 'Cyber Pink', color: 'from-blue-500 via-pink-500 to-purple-500', desc: 'Black, Blue, Pink' },
  { value: 'spring', label: 'Spring', color: 'from-green-400 to-emerald-500', desc: 'Fresh greens & florals' },
  { value: 'summer', label: 'Summer', color: 'from-yellow-400 to-orange-500', desc: 'Warm sunshine vibes' },
  { value: 'autumn', label: 'Autumn', color: 'from-orange-500 to-amber-700', desc: 'Warm fall colors' },
  { value: 'winter', label: 'Winter', color: 'from-blue-300 to-cyan-500', desc: 'Cool icy blues' },
  { value: 'diwali', label: 'Diwali', color: 'from-yellow-500 via-orange-500 to-red-600', desc: 'Festival of lights' },
  { value: 'holi', label: 'Holi', color: 'from-pink-500 via-purple-500 to-blue-500', desc: 'Festival of colors' },
  { value: 'christmas', label: 'Christmas', color: 'from-red-600 to-green-600', desc: 'Holiday spirit' },
  { value: 'newyear', label: 'New Year', color: 'from-yellow-400 via-gold to-amber-500', desc: 'Golden celebration' },
  { value: 'valentine', label: 'Valentine', color: 'from-pink-400 to-rose-600', desc: 'Love & romance' },
  { value: 'independence', label: 'Independence Day', color: 'from-orange-500 via-white to-green-600', desc: 'Tiranga theme' },
  { value: 'ocean', label: 'Ocean', color: 'from-blue-400 to-teal-600', desc: 'Deep sea blues' },
  { value: 'sunset', label: 'Sunset', color: 'from-orange-400 via-rose-500 to-purple-600', desc: 'Evening sky' },
  { value: 'midnight', label: 'Midnight', color: 'from-indigo-800 to-purple-900', desc: 'Dark & mysterious' },
];

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
      await setDoc(doc(db, 'settings', 'theme'), { winterThemeEnabled: checked }, { merge: true });
      toast.success(checked ? 'Winter effects enabled!' : 'Winter effects disabled!');
    } catch (error) {
      toast.error('Failed to update theme');
      setWinterThemeEnabled(!checked);
    }
  };

  const handleColorThemeChange = async (theme: string) => {
    try {
      setColorTheme(theme);
      await setDoc(doc(db, 'settings', 'theme'), { colorTheme: theme }, { merge: true });
      const found = themeOptions.find(t => t.value === theme);
      toast.success(`${found?.label || theme} theme activated!`);
    } catch (error) {
      toast.error('Failed to update theme');
    }
  };

  if (loading) return <div>Loading...</div>;

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
            <span className="text-sm text-muted-foreground">Choose seasonal, festival or custom theme</span>
          </Label>
          <Select value={colorTheme} onValueChange={handleColorThemeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {themeOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${opt.color}`} />
                    <span>{opt.label}</span>
                    <span className="text-muted-foreground text-xs">- {opt.desc}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Theme Preview Grid */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Quick Select</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {themeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleColorThemeChange(opt.value)}
                className={`p-2 rounded-xl border transition-all text-center ${
                  colorTheme === opt.value ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`w-full h-6 rounded-lg bg-gradient-to-r ${opt.color} mb-1`} />
                <span className="text-[10px] font-medium text-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="winter-theme" className="flex flex-col space-y-1">
            <span className="text-base font-semibold flex items-center gap-2">
              <Snowflake className="h-4 w-4" />
              Snow Effect
            </span>
            <span className="text-sm text-muted-foreground">Enable falling snow overlay</span>
          </Label>
          <Switch id="winter-theme" checked={winterThemeEnabled} onCheckedChange={handleToggleWinterTheme} />
        </div>
      </CardContent>
    </Card>
  );
}
