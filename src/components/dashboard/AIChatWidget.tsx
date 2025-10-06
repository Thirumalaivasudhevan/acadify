import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { MessageCircle, Send, Bot, User, Image as ImageIcon, Paperclip, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  image?: string;
  document?: {
    name: string;
    type: string;
    url: string;
  };
}

const AIChatWidget: React.FC = () => {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm your educational AI assistant. I can help you with academic questions, study tips, homework explanations, and learning strategies. What would you like to know?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedDocument(file);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage && !selectedDocument) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      image: selectedImage || undefined,
      document: selectedDocument ? {
        name: selectedDocument.name,
        type: selectedDocument.type,
        url: URL.createObjectURL(selectedDocument)
      } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    setSelectedDocument(null);
    setIsTyping(true);

    try {
      const conversationHistory = [...messages, userMessage].map(msg => {
        if (msg.image) {
          return {
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: [
              { type: 'text', text: msg.content || 'What can you tell me about this image?' },
              { type: 'image_url', image_url: { url: msg.image } }
            ]
          };
        }
        return {
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        };
      });

      const { data, error } = await supabase.functions.invoke('education-chat', {
        body: { 
          messages: conversationHistory,
          hasImage: !!currentImage
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      const aiResponse = data?.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request.";
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="card-luxury hover-lift h-[500px] flex flex-col">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2 shrink-0">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <CardDescription>Get help with your studies</CardDescription>
          </div>
        </div>
        <Badge variant="outline" className="ml-auto text-xs">
          Beta
        </Badge>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 p-4 space-y-4">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4" ref={scrollRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="Uploaded" 
                      className="rounded-md mb-2 max-w-full h-auto max-h-48 object-cover"
                    />
                  )}
                  {message.document && (
                    <div className="flex items-center space-x-2 mb-2 p-2 bg-background/20 rounded">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-xs truncate">{message.document.name}</span>
                    </div>
                  )}
                  {message.content && <div className="break-words">{message.content}</div>}
                  <div
                    className={`text-xs mt-1 opacity-70 ${
                      message.sender === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                
                {message.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <User className="h-3 w-3 text-accent" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" />
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* File Previews */}
        {(selectedImage || selectedDocument) && (
          <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg shrink-0">
            {selectedImage && (
              <div className="relative">
                <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded" />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {selectedDocument && (
              <div className="relative flex items-center space-x-2 bg-background p-2 rounded">
                <Paperclip className="h-4 w-4" />
                <span className="text-xs">{selectedDocument.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0"
                  onClick={() => setSelectedDocument(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="flex space-x-2 shrink-0">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <input
            ref={documentInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleDocumentSelect}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => imageInputRef.current?.click()}
            disabled={isTyping}
            className="px-3"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => documentInputRef.current?.click()}
            disabled={isTyping}
            className="px-3"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your studies..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={(!inputMessage.trim() && !selectedImage && !selectedDocument) || isTyping}
            size="sm"
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Info notice */}
        <div className="text-xs text-muted-foreground text-center">
          Powered by Lovable AI • For educational purposes only
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChatWidget;