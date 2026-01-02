import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import blueTick from '@/assets/blue-tick.png';
import { getAvatarById } from './avatars';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  timestamp: number;
}

interface SocialChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SocialChat({ isOpen, onClose }: SocialChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [verifiedUsers, setVerifiedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Listen to social chat messages
    const q = query(
      collection(db, 'social_chat'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail || '',
          userAvatar: data.userAvatar,
          timestamp: data.timestamp?.toMillis?.() || Date.now()
        };
      }).reverse();

      setMessages(msgs);

      // Fetch verification status
      const uniqueEmails = [...new Set(msgs.map(m => m.userEmail).filter(Boolean))];
      const verified = new Set<string>();

      await Promise.all(
        uniqueEmails.map(async (email) => {
          try {
            const verDoc = await getDoc(doc(db, 'verified_users', email));
            if (verDoc.exists() && verDoc.data()?.verified) {
              verified.add(email);
            }
          } catch (e) {}
        })
      );

      setVerifiedUsers(verified);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const profileDoc = await getDoc(doc(db, 'user_profiles', user.uid));
      const userAvatar = profileDoc.exists() ? profileDoc.data()?.avatar : '';

      await addDoc(collection(db, 'social_chat'), {
        text: newMessage.trim(),
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        userEmail: user.email || '',
        userAvatar,
        timestamp: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold gradient-text">Social Chat</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const isOwn = message.userId === user?.uid;
                const isVerified = verifiedUsers.has(message.userEmail);
                const avatarData = message.userAvatar ? getAvatarById(message.userAvatar) : null;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className={`h-8 w-8 flex-shrink-0 ring-2 ${isVerified ? 'ring-blue-500' : 'ring-border'}`}>
                      {avatarData ? (
                        <AvatarImage src={avatarData.url} />
                      ) : (
                        <AvatarFallback className={isVerified ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs' : 'text-xs'}>
                          {message.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className={`flex flex-col ${isOwn ? 'items-end' : ''}`}>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs font-semibold">{message.userName}</span>
                        {isVerified && <img src={blueTick} alt="Verified" className="h-3 w-3" />}
                      </div>
                      <Card className={`px-3 py-2 max-w-[70vw] ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-sm break-words">{message.text}</p>
                      </Card>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
