import { useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ContactUs = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Message sent successfully! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-4">
              <MessageCircle className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Contact Us</h1>
            <p className="text-muted-foreground">Have questions? We'd love to hear from you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <ContactCard 
                icon={<Mail className="h-5 w-5" />}
                title="Email"
                value="support@example.com"
                color="primary"
              />
              <ContactCard 
                icon={<Phone className="h-5 w-5" />}
                title="Phone"
                value="+91 XXXXX XXXXX"
                color="secondary"
              />
              <ContactCard 
                icon={<MapPin className="h-5 w-5" />}
                title="Location"
                value="India"
                color="accent"
              />
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="bg-card rounded-2xl border p-6 shadow-sm space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                    <Input 
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                    <Input 
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
                  <Input 
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                  <Textarea 
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="rounded-xl resize-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full py-6 rounded-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

const ContactCard = ({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string; color: string }) => (
  <div className="bg-card rounded-2xl border p-4 shadow-sm">
    <div className={`inline-flex p-2 rounded-lg mb-3 ${
      color === 'primary' ? 'bg-primary/10 text-primary' : 
      color === 'secondary' ? 'bg-secondary/20 text-secondary' : 
      'bg-accent/20 text-accent'
    }`}>
      {icon}
    </div>
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="font-semibold text-foreground">{value}</p>
  </div>
);

export default ContactUs;
