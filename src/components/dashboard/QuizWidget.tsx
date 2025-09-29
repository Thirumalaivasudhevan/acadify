import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Brain, Trophy, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
}

interface QuizResponse {
  quiz_date: string;
  points_earned: number;
  questions_answered: any;
}

const QuizWidget: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [todayResponse, setTodayResponse] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      loadTodayQuiz();
    }
  }, [user]);

  const loadTodayQuiz = async () => {
    try {
      setLoading(true);

      // Check if user already completed today's quiz
      const { data: existingResponse } = await supabase
        .from('student_quiz_responses')
        .select('*')
        .eq('student_id', user?.id)
        .eq('quiz_date', today)
        .single();

      if (existingResponse) {
        setTodayResponse(existingResponse);
        setIsSubmitted(true);
        setLoading(false);
        return;
      }

      // Get user's department from student profile
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('department')
        .eq('user_id', user?.id)
        .single();

      if (!studentProfile?.department) {
        toast({
          title: "Profile incomplete",
          description: "Please complete your student profile to access quizzes.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Get random questions for user's department
      const { data: allQuestions } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('department_id', getDepartmentId(studentProfile.department));

      if (allQuestions && allQuestions.length > 0) {
        // Select 3 random questions and properly type them
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, Math.min(3, shuffled.length)).map(q => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
          correct_answer: q.correct_answer
        }));
        setQuestions(selectedQuestions);
        setUserAnswers(new Array(selectedQuestions.length).fill(''));
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast({
        title: "Error",
        description: "Failed to load today's quiz. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentId = (department: string): string => {
    const deptMap: { [key: string]: string } = {
      'Computer Science': '1',
      'Electronics': '2',
      'Mechanical': '3',
      'Civil': '4',
      'BBA': '5'
    };
    return deptMap[department] || '1';
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!user || userAnswers.some(answer => !answer)) {
      toast({
        title: "Incomplete answers",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      // Calculate points
      let points = 0;
      const answeredQuestions = questions.map((question, index) => {
        const isCorrect = userAnswers[index] === question.correct_answer;
        if (isCorrect) points += 10;
        return {
          question_id: question.id,
          user_answer: userAnswers[index],
          correct_answer: question.correct_answer,
          is_correct: isCorrect
        };
      });

      // Save response
      const { error } = await supabase
        .from('student_quiz_responses')
        .insert({
          student_id: user.id,
          quiz_date: today,
          questions_answered: answeredQuestions,
          points_earned: points
        });

      if (error) throw error;

      setTodayResponse({
        quiz_date: today,
        points_earned: points,
        questions_answered: answeredQuestions
      });
      setIsSubmitted(true);

      toast({
        title: "Quiz submitted!",
        description: `You earned ${points} points today. Come back tomorrow for new questions!`,
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="card-luxury hover-lift">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Daily Quiz</CardTitle>
              <CardDescription>Challenge yourself daily</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSubmitted && todayResponse) {
    return (
      <Card className="card-luxury hover-lift">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-accent" />
            <div>
              <CardTitle className="text-lg">Quiz Complete!</CardTitle>
              <CardDescription>Great job today</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-6 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="text-3xl font-bold text-primary mb-2">
              {todayResponse.points_earned}
            </div>
            <div className="text-sm text-muted-foreground">Points Earned Today</div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Come back tomorrow for new questions!</span>
          </div>
          
          <Badge variant="outline" className="bg-success/10 border-success text-success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Quiz Complete
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="card-luxury">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Daily Quiz</CardTitle>
              <CardDescription>No questions available</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            No quiz questions available for your department today.
          </div>
          <Button onClick={loadTodayQuiz} variant="outline">
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card className="card-luxury hover-lift">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Daily Quiz</CardTitle>
            <CardDescription>
              Question {currentQuestionIndex + 1} of {questions.length}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="font-medium mb-4">{currentQuestion.question}</div>
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === option ? "default" : "outline"}
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => handleAnswerSelect(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <div className="flex space-x-1">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentQuestionIndex
                    ? 'bg-primary'
                    : userAnswers[index]
                    ? 'bg-accent'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || !selectedAnswer}
              className="btn-luxury"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!selectedAnswer}>
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizWidget;