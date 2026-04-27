import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Shield, Trash2, UserPlus, ShieldCheck } from 'lucide-react';

type Permission = 'upload' | 'edit' | 'messages' | 'feedback';

interface SubAdmin {
  email: string;
  permissions: Permission[];
  active: boolean;
  createdAt?: string;
}

const ALL_PERMISSIONS: { key: Permission; label: string; desc: string }[] = [
  { key: 'upload', label: 'Upload Content', desc: 'Add new mods, games, courses, etc.' },
  { key: 'edit', label: 'Edit Content', desc: 'Edit existing items & manage My Apps' },
  { key: 'messages', label: 'Messages', desc: 'View and reply to user messages' },
  { key: 'feedback', label: 'Feedback', desc: 'View user feedback' },
];

export function AdminSubAdmins() {
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPerms, setNewPerms] = useState<Permission[]>(['upload', 'edit']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubAdmins();
  }, []);

  const loadSubAdmins = async () => {
    try {
      const snap = await getDocs(collection(db, 'sub_admins'));
      const list = snap.docs.map(d => ({ email: d.id, ...(d.data() as any) })) as SubAdmin[];
      setSubAdmins(list);
    } catch (e) {
      console.error('Failed to load sub-admins', e);
    }
  };

  const togglePerm = (list: Permission[], setList: (v: Permission[]) => void, perm: Permission) => {
    if (list.includes(perm)) setList(list.filter(p => p !== perm));
    else setList([...list, perm]);
  };

  const addSubAdmin = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    if (newPerms.length === 0) {
      toast.error('Select at least one permission');
      return;
    }
    setLoading(true);
    try {
      await setDoc(doc(db, 'sub_admins', email), {
        email,
        permissions: newPerms,
        active: true,
        createdAt: new Date().toISOString(),
      });
      toast.success(`${email} added as sub-admin`);
      setNewEmail('');
      setNewPerms(['upload', 'edit']);
      loadSubAdmins();
    } catch (e) {
      toast.error('Failed to add sub-admin');
    } finally {
      setLoading(false);
    }
  };

  const updateSubAdmin = async (sa: SubAdmin, updates: Partial<SubAdmin>) => {
    try {
      await setDoc(doc(db, 'sub_admins', sa.email), { ...sa, ...updates }, { merge: true });
      toast.success('Updated');
      loadSubAdmins();
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const removeSubAdmin = async (email: string) => {
    if (!confirm(`Remove ${email} as sub-admin?`)) return;
    try {
      await deleteDoc(doc(db, 'sub_admins', email));
      toast.success('Removed');
      loadSubAdmins();
    } catch (e) {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Sub-Admin
          </CardTitle>
          <CardDescription>
            Grant limited admin access to other users by email. They must sign in with this exact email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Email Address</Label>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Permissions</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_PERMISSIONS.map(p => (
                <label
                  key={p.key}
                  className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                    newPerms.includes(p.key) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={newPerms.includes(p.key)}
                    onChange={() => togglePerm(newPerms, setNewPerms, p.key)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{p.label}</p>
                    <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <Button onClick={addSubAdmin} disabled={loading} className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            {loading ? 'Adding...' : 'Add Sub-Admin'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Existing Sub-Admins ({subAdmins.length})
          </CardTitle>
          <CardDescription>Manage permissions or remove sub-admins.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {subAdmins.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No sub-admins yet.</p>
          )}
          {subAdmins.map(sa => (
            <div key={sa.email} className="p-3 rounded-xl border bg-muted/30 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold truncate">{sa.email}</span>
                  <Badge variant={sa.active ? 'default' : 'secondary'} className="text-[10px]">
                    {sa.active ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch
                    checked={sa.active}
                    onCheckedChange={(checked) => updateSubAdmin(sa, { active: checked })}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeSubAdmin(sa.email)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ALL_PERMISSIONS.map(p => {
                  const enabled = sa.permissions?.includes(p.key);
                  return (
                    <button
                      key={p.key}
                      onClick={() => {
                        const newPerms = enabled
                          ? sa.permissions.filter(x => x !== p.key)
                          : [...(sa.permissions || []), p.key];
                        updateSubAdmin(sa, { permissions: newPerms });
                      }}
                      className={`text-[10px] px-2 py-1 rounded-md font-semibold transition-colors ${
                        enabled
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/70'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
