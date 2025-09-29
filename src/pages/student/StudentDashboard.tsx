import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import QuizWidget from '../../components/dashboard/QuizWidget';
import NewsWidget from '../../components/dashboard/NewsWidget';
import AIChatWidget from '../../components/dashboard/AIChatWidget';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome to Your Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with daily quizzes, department news, and AI assistance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuizWidget />
        </div>
        
        <div className="lg:col-span-1">
          <NewsWidget />
        </div>
        
        <div className="lg:col-span-1">
          <AIChatWidget />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;