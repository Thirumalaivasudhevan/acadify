import React from 'react';
import AIChatWidget from '../../components/dashboard/AIChatWidget';
import { Bot } from 'lucide-react';

const AIChatPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-lg bg-primary/20">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Acadify</h1>
          <p className="text-muted-foreground">Your AI learning companion</p>
        </div>
      </div>

      <div className="flex-1">
        <AIChatWidget />
      </div>
    </div>
  );
};

export default AIChatPage;
