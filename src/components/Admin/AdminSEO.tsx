import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Save, Globe, Search } from 'lucide-react';

export function AdminSEO() {
  const [seo, setSeo] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    googleVerification: '',
    bingVerification: '',
    robotsTxt: '',
    sitemapUrl: '',
    canonicalUrl: '',
    googleAnalyticsId: '',
    headScripts: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSEO();
  }, []);

  const loadSEO = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'seo'));
      if (docSnap.exists()) {
        setSeo(prev => ({ ...prev, ...docSnap.data() }));
      }
    } catch (error) {
      console.error('Failed to load SEO settings', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'seo'), seo, { merge: true });
      toast.success('SEO settings saved!');
      // Apply meta tags dynamically
      applyMetaTags(seo);
    } catch (error) {
      toast.error('Failed to save SEO settings');
    } finally {
      setLoading(false);
    }
  };

  const applyMetaTags = (data: typeof seo) => {
    if (data.metaTitle) document.title = data.metaTitle;
    updateMeta('description', data.metaDescription);
    updateMeta('keywords', data.metaKeywords);
    updateMeta('og:title', data.ogTitle || data.metaTitle, 'property');
    updateMeta('og:description', data.ogDescription || data.metaDescription, 'property');
    updateMeta('og:image', data.ogImage, 'property');
    if (data.googleVerification) updateMeta('google-site-verification', data.googleVerification);
    if (data.bingVerification) updateMeta('msvalidate.01', data.bingVerification);
  };

  const updateMeta = (name: string, content: string, attr: string = 'name') => {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          SEO Optimization
        </CardTitle>
        <CardDescription>Optimize your website for search engines</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Meta Title</Label>
            <Input value={seo.metaTitle} onChange={e => setSeo({...seo, metaTitle: e.target.value})} placeholder="Your Site Title" />
            <p className="text-[10px] text-muted-foreground">{seo.metaTitle.length}/60 characters</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Canonical URL</Label>
            <Input value={seo.canonicalUrl} onChange={e => setSeo({...seo, canonicalUrl: e.target.value})} placeholder="https://yoursite.com" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Meta Description</Label>
          <Textarea value={seo.metaDescription} onChange={e => setSeo({...seo, metaDescription: e.target.value})} placeholder="Brief description of your site..." rows={2} />
          <p className="text-[10px] text-muted-foreground">{seo.metaDescription.length}/160 characters</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Meta Keywords</Label>
          <Input value={seo.metaKeywords} onChange={e => setSeo({...seo, metaKeywords: e.target.value})} placeholder="mods, games, courses, download" />
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" /> Open Graph (Social Sharing)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">OG Title</Label>
              <Input value={seo.ogTitle} onChange={e => setSeo({...seo, ogTitle: e.target.value})} placeholder="Social share title" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">OG Image URL</Label>
              <Input value={seo.ogImage} onChange={e => setSeo({...seo, ogImage: e.target.value})} placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-1.5 mt-3">
            <Label className="text-xs font-semibold">OG Description</Label>
            <Textarea value={seo.ogDescription} onChange={e => setSeo({...seo, ogDescription: e.target.value})} placeholder="Social share description" rows={2} />
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Verification & Analytics</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Google Verification</Label>
              <Input value={seo.googleVerification} onChange={e => setSeo({...seo, googleVerification: e.target.value})} placeholder="Verification code" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Bing Verification</Label>
              <Input value={seo.bingVerification} onChange={e => setSeo({...seo, bingVerification: e.target.value})} placeholder="Verification code" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Google Analytics ID</Label>
              <Input value={seo.googleAnalyticsId} onChange={e => setSeo({...seo, googleAnalyticsId: e.target.value})} placeholder="G-XXXXXXXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Sitemap URL</Label>
              <Input value={seo.sitemapUrl} onChange={e => setSeo({...seo, sitemapUrl: e.target.value})} placeholder="https://yoursite.com/sitemap.xml" />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-1.5">
          <Label className="text-xs font-semibold">Custom Head Scripts</Label>
          <Textarea value={seo.headScripts} onChange={e => setSeo({...seo, headScripts: e.target.value})} placeholder="Custom scripts to inject in <head>" rows={3} className="font-mono text-xs" />
          <p className="text-[10px] text-muted-foreground">Add Google Analytics, custom tracking codes, etc.</p>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save SEO Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}
