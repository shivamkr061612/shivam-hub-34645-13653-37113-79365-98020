import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Copy, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/Layout/Header';

export default function VerificationSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const userId = searchParams.get('userId');

  useEffect(() => {
    const fetchCode = async () => {
      if (!userId) {
        toast.error('Invalid verification link');
        setLoading(false);
        return;
      }

      try {
        const codeDoc = await getDoc(doc(db, 'verification_codes', userId));
        
        if (codeDoc.exists()) {
          const data = codeDoc.data();
          if (!data.used) {
            setVerificationCode(data.code);
          } else {
            toast.error('This code has already been used');
          }
        } else {
          toast.error('Verification code not found');
        }
      } catch (error) {
        console.error('Error fetching code:', error);
        toast.error('Failed to load verification code');
      } finally {
        setLoading(false);
      }
    };

    fetchCode();
  }, [userId]);

  const copyCode = () => {
    if (verificationCode) {
      navigator.clipboard.writeText(verificationCode);
      toast.success('Code copied to clipboard!');
    }
  };

  const returnWithCode = () => {
    // Store code in sessionStorage for auto-fill
    if (verificationCode) {
      sessionStorage.setItem('verificationCode', verificationCode);
    }
    
    // Navigate back to the page where user initiated download
    const returnPath = sessionStorage.getItem('downloadReturnPath') || '/mods';
    sessionStorage.removeItem('downloadReturnPath');
    navigate(returnPath);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-16">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading verification code...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-primary/10 p-4 rounded-full">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-primary">
                🎉 Verification Complete!
              </CardTitle>
              <CardDescription className="text-base">
                Congratulations! Your verification is successful. Use the code below to activate your download key.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {verificationCode ? (
                <>
                  <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/50 rounded-xl p-8 text-center space-y-4">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Your Verification Code
                    </p>
                    <div className="bg-background/80 backdrop-blur rounded-lg p-6 border border-border">
                      <p className="text-4xl md:text-5xl font-bold font-mono tracking-widest text-primary">
                        {verificationCode}
                      </p>
                    </div>
                    <Button 
                      onClick={copyCode}
                      variant="outline"
                      size="lg"
                      className="w-full max-w-xs mx-auto"
                    >
                      <Copy className="h-5 w-5 mr-2" />
                      Copy Code
                    </Button>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-500">
                      ✅ अगला कदम:
                    </p>
                    <ul className="text-sm text-green-600 dark:text-green-400 space-y-1 list-disc list-inside">
                      <li>नीचे दिए गए बटन पर क्लिक करें</li>
                      <li>Code automatically verify हो जाएगा</li>
                      <li>2 घंटे तक Free Download कर सकते हैं</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={returnWithCode}
                      size="lg"
                      className="w-full font-semibold"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      वापस जाएं और Auto-Verify करें
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      Code automatically fill हो जाएगा और verify हो जाएगा
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Unable to load verification code. Please try generating a new one.
                  </p>
                  <Button 
                    onClick={() => navigate('/mods')}
                    variant="outline"
                    className="mt-4"
                  >
                    Go to Home
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
