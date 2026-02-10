import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Image, 
  Code, 
  Search, 
  GraduationCap, 
  FileQuestion,
  Send,
  Trash2,
  Download,
  Copy,
  Sparkles,
  Bot,
  User,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useAIChat, AIType } from '@/hooks/useAIChat';
import { PageTransition } from '@/components/ui/PageTransition';
import { DotLoader } from '@/components/ui/DotLoader';
import { useNavigate } from 'react-router-dom';

const AI_TOOLS = [
  { id: 'chat', name: 'Chat AI', icon: MessageSquare, description: 'General conversation & help', color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/30' },
  { id: 'image', name: 'Image Gen', icon: Image, description: 'Generate images from text', color: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/30' },
  { id: 'code', name: 'Code Gen', icon: Code, description: 'Generate apps & games', color: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/30' },
  { id: 'research', name: 'Research', icon: Search, description: 'Deep research & analysis', color: 'from-orange-500 to-red-500', glow: 'shadow-orange-500/30' },
  { id: 'academic', name: 'Academic', icon: GraduationCap, description: 'Academic writing & essays', color: 'from-indigo-500 to-purple-500', glow: 'shadow-indigo-500/30' },
  { id: 'test', name: 'Test Maker', icon: FileQuestion, description: 'Create quizzes & tests', color: 'from-teal-500 to-cyan-500', glow: 'shadow-teal-500/30' },
];

// Floating orb animation component
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-20 blur-3xl"
          style={{
            width: `${100 + i * 40}px`,
            height: `${100 + i * 40}px`,
            background: `linear-gradient(135deg, ${
              ['#3b82f6', '#a855f7', '#ec4899', '#f97316', '#10b981', '#06b6d4'][i]
            }, transparent)`,
            left: `${10 + i * 15}%`,
            top: `${5 + (i % 3) * 30}%`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function TechAI() {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const { messages, isLoading, sendMessage, clearMessages } = useAIChat({
    type: (selectedTool as AIType) || 'chat',
    onError: (error) => toast.error(error),
  });

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || imageLoading) return;
    setImageLoading(true);
    setGeneratedImage(null);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (!resp.ok) {
        const error = await resp.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await resp.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success('Image generated successfully!');
      } else {
        throw new Error('No image received');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setImageLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const downloadCode = (code: string, filename: string = 'code.txt') => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded!');
  };

  const currentTool = AI_TOOLS.find(t => t.id === selectedTool);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative">
        <FloatingOrbs />
        
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8"
          >
            {selectedTool ? (
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <Button variant="ghost" size="icon" onClick={() => setSelectedTool(null)} className="shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${currentTool?.color} flex items-center justify-center shadow-lg ${currentTool?.glow} shrink-0`}>
                  {currentTool && <currentTool.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                </div>
                <div className="text-left min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold truncate">{currentTool?.name}</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{currentTool?.description}</p>
                </div>
              </div>
            ) : (
              <>
                {/* 3D Floating Icon */}
                <motion.div 
                  className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 relative"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-full h-full rounded-3xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-primary/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 rounded-3xl" />
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-3xl" />
                    <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-white relative z-10 drop-shadow-lg" />
                  </div>
                  {/* Glow ring */}
                  <div className="absolute -inset-2 rounded-[28px] bg-gradient-to-br from-primary via-purple-500 to-pink-500 opacity-30 blur-xl -z-10" />
                </motion.div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Tech AI
                </h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">Powered by advanced AI models</p>
              </>
            )}
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {!selectedTool ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Tool Grid with Glass Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {AI_TOOLS.map((tool, index) => (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={{ scale: 1.04, y: -6 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <div 
                        className={`cursor-pointer rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/20 dark:border-white/10 
                        bg-white/60 dark:bg-white/5 backdrop-blur-xl 
                        hover:bg-white/80 dark:hover:bg-white/10 
                        transition-all duration-300 overflow-hidden group 
                        shadow-lg hover:shadow-xl ${tool.glow}`}
                        onClick={() => setSelectedTool(tool.id)}
                      >
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <tool.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                        </div>
                        <h3 className="font-bold text-sm sm:text-base mb-0.5">{tool.name}</h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{tool.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={selectedTool}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Glass Card for active tool */}
                <div className="rounded-2xl sm:rounded-3xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-2xl p-3 sm:p-5">
                  {selectedTool === 'image' ? (
                    /* Image Generator */
                    <div className="space-y-4">
                      <Textarea
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Describe the image you want to generate..."
                        className="min-h-[80px] sm:min-h-[100px] bg-white/50 dark:bg-white/5 backdrop-blur border-white/30 dark:border-white/10 rounded-xl"
                      />
                      <Button 
                        onClick={handleGenerateImage} 
                        disabled={imageLoading || !imagePrompt.trim()}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl h-11 sm:h-12 text-sm sm:text-base shadow-lg shadow-purple-500/30"
                      >
                        {imageLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Image
                          </>
                        )}
                      </Button>

                      {imageLoading && (
                        <div className="flex justify-center py-8">
                          <DotLoader />
                        </div>
                      )}

                      {generatedImage && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-3"
                        >
                          <img 
                            src={generatedImage} 
                            alt="Generated" 
                            className="w-full rounded-xl border border-white/20"
                          />
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1 rounded-xl bg-white/50 dark:bg-white/5 border-white/30 text-xs sm:text-sm"
                              onClick={() => {
                                navigator.clipboard.writeText(generatedImage);
                                toast.success('Image URL copied!');
                              }}
                            >
                              <Copy className="h-3.5 w-3.5 mr-1.5" />
                              Copy URL
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1 rounded-xl bg-white/50 dark:bg-white/5 border-white/30 text-xs sm:text-sm"
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = generatedImage;
                                a.download = 'generated-image.png';
                                a.target = '_blank';
                                a.click();
                              }}
                            >
                              <Download className="h-3.5 w-3.5 mr-1.5" />
                              Download
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    /* Chat Interface */
                    <div className="flex flex-col h-[calc(100vh-240px)] sm:h-[calc(100vh-280px)] md:h-[600px]">
                      <ScrollArea className="flex-1 pr-2 sm:pr-4">
                        <div className="space-y-3 sm:space-y-4 pb-4">
                          {messages.length === 0 && (
                            <div className="text-center py-10 sm:py-12 text-muted-foreground">
                              <motion.div
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                              >
                                <Bot className="h-14 w-14 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                              </motion.div>
                              <p className="text-base sm:text-lg font-medium">Start a conversation</p>
                              <p className="text-xs sm:text-sm">Ask me anything!</p>
                            </div>
                          )}
                          <AnimatePresence>
                            {messages.map((msg, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                {msg.role === 'assistant' && (
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
                                  </div>
                                )}
                                <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${
                                  msg.role === 'user' 
                                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20' 
                                    : 'bg-white/70 dark:bg-white/10 backdrop-blur border border-white/20 dark:border-white/10'
                                }`}>
                                  {selectedTool === 'code' && msg.role === 'assistant' ? (
                                    <div className="space-y-2">
                                      <pre className="whitespace-pre-wrap text-xs sm:text-sm overflow-x-auto">{msg.content}</pre>
                                      <div className="flex gap-2 pt-2 border-t border-border/30">
                                        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => copyCode(msg.content)}>
                                          <Copy className="h-3 w-3 mr-1" />
                                          Copy
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => downloadCode(msg.content)}>
                                          <Download className="h-3 w-3 mr-1" />
                                          Download
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="whitespace-pre-wrap text-xs sm:text-sm">{msg.content}</p>
                                  )}
                                </div>
                                {msg.role === 'user' && (
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          {isLoading && (
                            <div className="flex gap-2 sm:gap-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                                <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
                              </div>
                              <div className="bg-white/70 dark:bg-white/10 backdrop-blur rounded-2xl px-4 py-3 border border-white/20 dark:border-white/10">
                                <DotLoader />
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      <div className="border-t border-white/20 dark:border-white/10 pt-3 sm:pt-4 mt-3 sm:mt-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={clearMessages}
                            disabled={messages.length === 0}
                            className="shrink-0 rounded-xl bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10 h-10 w-10 sm:h-11 sm:w-11"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={selectedTool === 'code' ? "Describe the app or game..." : "Type your message..."}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            disabled={isLoading}
                            className="bg-white/50 dark:bg-white/5 backdrop-blur border-white/30 dark:border-white/10 rounded-xl h-10 sm:h-11 text-sm"
                          />
                          <Button 
                            onClick={handleSend} 
                            disabled={isLoading || !input.trim()}
                            className="bg-gradient-to-r from-primary to-primary/80 rounded-xl shrink-0 h-10 w-10 sm:h-11 sm:w-11 shadow-lg shadow-primary/30"
                            size="icon"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
