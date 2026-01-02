import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ArrowLeft, Crown, Lock, Sparkles, RefreshCw, CheckCircle } from 'lucide-react';
import { DownloadDialog } from '@/components/Content/DownloadDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useVerification } from '@/hooks/useVerification';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';
import { motion } from 'framer-motion';

export default function ItemDetails() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isVerified } = useVerification();
  const { settings } = useWebsiteSettings();
  const [showDownload, setShowDownload] = useState(false);

  // Get item from location state
  const item = location.state?.item;

  useEffect(() => {
    if (!item) {
      navigate('/');
    }
  }, [item, navigate]);

  if (!item) {
    return null;
  }

  const isPremium = item.isPremium === true;
  const canAccess = !isPremium || (user && isVerified);

  const isNew = item.createdAt && 
    (Date.now() - new Date(item.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

  const isUpdated = item.updatedAt && 
    (Date.now() - new Date(item.updatedAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

  const handleDownloadClick = () => {
    if (isPremium && !isVerified) {
      navigate('/buy-bluetick');
      return;
    }
    setShowDownload(true);
  };

  const offerItems = settings.whatWeOffer?.split('|') || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Item Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden border-2">
            {item.thumbnail && (
              <div className="relative w-full bg-muted">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-64 md:h-80 object-contain"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                  {isPremium && (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg">
                      <Crown className="h-3 w-3 mr-1" />
                      PREMIUM
                    </Badge>
                  )}
                  {isNew && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-lg">
                      <Sparkles className="h-3 w-3 mr-1" />
                      NEW
                    </Badge>
                  )}
                  {isUpdated && !isNew && (
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      UPDATED
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">{item.title || 'Untitled'}</CardTitle>
              <CardDescription className="text-base mt-2">
                {item.description || 'No description available'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Item Info */}
              <div className="grid grid-cols-2 gap-4">
                {item.size && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-medium">{item.size}</p>
                  </div>
                )}
                {item.version && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-medium">{item.version}</p>
                  </div>
                )}
                {item.downloads && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Downloads</p>
                    <p className="font-medium">{item.downloads}</p>
                  </div>
                )}
                {item.category && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{item.category}</p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <Button 
                onClick={handleDownloadClick} 
                className="w-full py-6 text-lg"
                size="lg"
                variant={isPremium && !canAccess ? 'outline' : 'default'}
              >
                {isPremium && !canAccess ? (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Unlock Premium Content
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Download Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* About Us & What We Offer Section */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* About Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">About Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {settings.aboutUs}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* What We Offer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">What We Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {offerItems.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      {item.trim()}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <DownloadDialog
        open={showDownload}
        onOpenChange={setShowDownload}
        item={item}
        type={type || 'item'}
      />
    </div>
  );
}