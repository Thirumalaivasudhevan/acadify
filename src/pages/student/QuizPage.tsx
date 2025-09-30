import React from 'react';
import QuizWidget from '../../components/dashboard/QuizWidget';
import { Brain } from 'lucide-react';

const QuizPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-lg bg-primary/20">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Daily Quiz</h1>
          <p className="text-muted-foreground">Challenge yourself with department-specific questions</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <QuizWidget />
      </div>
    </div>
  );
};

export default QuizPage;
