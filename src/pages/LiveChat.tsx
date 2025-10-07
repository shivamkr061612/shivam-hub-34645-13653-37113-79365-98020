import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import blueTick from '@/assets/blue-tick.png';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: number;
}

// Removed online presence for reliability


export default function LiveChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [verifiedUsers, setVerifiedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      toast.error('Please login to access live chat');
      navigate('/');
      return;
    }

    // Listen to messages from Firestore
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messageList: Message[] = snapshot.docs.map((doc) => {
        const data: any = doc.data();
        return {
          id: doc.id,
          text: data.text,
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail || '',
          timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : data.timestamp || Date.now(),
        };
      });
      setMessages(messageList);

      // Check verification status for all unique users
      const uniqueEmails = [...new Set(messageList.map(m => m.userEmail).filter(Boolean))];
      const verified = new Set<string>();
      
      await Promise.all(
        uniqueEmails.map(async (email) => {
          try {
            const verificationDoc = await getDoc(doc(db, 'verified_users', email));
            if (verificationDoc.exists() && verificationDoc.data()?.verified === true) {
              verified.add(email);
            }
          } catch (error) {
            console.error('Error checking verification:', error);
          }
        })
      );
      
      setVerifiedUsers(verified);
    }, (error) => {
      console.error('Error listening to messages:', error);
      toast.error('Failed to load messages.');
    });

    return () => {
      unsubscribe();
    };
  }, [user, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        userEmail: user.email || '',
        timestamp: serverTimestamp(),
      });

      setNewMessage('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please check your connection.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl h-screen flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Live Chat
              <span className="text-red-600">✅</span>
            </h1>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pr-4 mb-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => {
              const isOwn = message.userId === user?.uid;
              const isVerified = verifiedUsers.has(message.userEmail);
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col ${isOwn ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.userName}
                      </span>
                      {isVerified && (
                        <img src={blueTick} alt="Verified" className="h-4 w-4 object-contain" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-md ${
                        isVerified
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20'
                          : isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.text}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                 </div>
                );
              })
            )}
           </div>
         </div>

        {/* Input */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
