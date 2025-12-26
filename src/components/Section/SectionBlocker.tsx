import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { useVerification } from '@/hooks/useVerification';

interface SectionBlockerProps {
  sectionName: string;
  isLocked: boolean;
  isPremium: boolean;
}

export function SectionBlocker({ sectionName, isLocked, isPremium }: SectionBlockerProps) {
  const navigate = useNavigate();
  const { isVerified } = useVerification();

  if (isLocked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/50 bg-destructive/5">
          <CardHeader className="text-center">
            <Lock className="h-16 w-16 mx-auto text-destructive mb-4" />
            <CardTitle className="text-2xl">Section Locked</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              The {sectionName} section is currently locked by the administrator.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go Back Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPremium && !isVerified) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="text-center">
            <Crown className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <CardTitle className="text-2xl">Premium Content</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              The {sectionName} section is available only for verified (Blue Tick) members.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/blue-tick-purchase')} className="w-full">
                Get Blue Tick
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Go Back Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
