-- Create tables for student dashboard widgets

-- Quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of options
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student quiz responses and daily points
CREATE TABLE public.student_quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  quiz_date DATE NOT NULL DEFAULT CURRENT_DATE,
  questions_answered JSONB NOT NULL, -- Array of question IDs and answers
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, quiz_date)
);

-- Department news/articles
CREATE TABLE public.department_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT,
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_news ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz questions - everyone can read
CREATE POLICY "Quiz questions are viewable by everyone" 
ON public.quiz_questions 
FOR SELECT 
USING (true);

-- RLS Policies for student quiz responses
CREATE POLICY "Students can view their own quiz responses" 
ON public.student_quiz_responses 
FOR SELECT 
USING (auth.uid()::text = student_id);

CREATE POLICY "Students can insert their own quiz responses" 
ON public.student_quiz_responses 
FOR INSERT 
WITH CHECK (auth.uid()::text = student_id);

CREATE POLICY "Students can update their own quiz responses" 
ON public.student_quiz_responses 
FOR UPDATE 
USING (auth.uid()::text = student_id);

-- RLS Policies for department news - everyone can read
CREATE POLICY "Department news is viewable by everyone" 
ON public.department_news 
FOR SELECT 
USING (true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_quiz_questions_updated_at
BEFORE UPDATE ON public.quiz_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_department_news_updated_at
BEFORE UPDATE ON public.department_news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample quiz questions for different departments
INSERT INTO public.quiz_questions (department_id, question, options, correct_answer) VALUES
('1', 'What is the time complexity of binary search?', '["O(n)", "O(log n)", "O(n²)", "O(1)"]', 'O(log n)'),
('1', 'Which data structure uses LIFO principle?', '["Queue", "Stack", "Array", "Linked List"]', 'Stack'),
('1', 'What does SQL stand for?', '["Structured Query Language", "Simple Query Language", "System Query Language", "Standard Query Language"]', 'Structured Query Language'),
('2', 'What is the unit of electrical resistance?', '["Volt", "Ampere", "Ohm", "Watt"]', 'Ohm'),
('2', 'Which component stores electrical energy?', '["Resistor", "Capacitor", "Inductor", "Diode"]', 'Capacitor'),
('3', 'What is the SI unit of force?', '["Joule", "Newton", "Pascal", "Watt"]', 'Newton'),
('3', 'Which law states F = ma?', '["Newton''s First Law", "Newton''s Second Law", "Newton''s Third Law", "Hooke''s Law"]', 'Newton''s Second Law'),
('5', 'What does ROI stand for in business?', '["Return on Investment", "Rate of Interest", "Return on Income", "Revenue on Investment"]', 'Return on Investment'),
('5', 'Which financial statement shows company profitability?', '["Balance Sheet", "Income Statement", "Cash Flow Statement", "Statement of Equity"]', 'Income Statement');

-- Insert sample department news
INSERT INTO public.department_news (department_id, title, description, url) VALUES
('1', 'New AI Research Lab Opens', 'The Computer Science department inaugurated a state-of-the-art AI research facility equipped with latest GPUs and computing resources.', 'https://example.com/ai-lab'),
('1', 'Student Wins Coding Competition', 'CS student Alice Johnson secured first place in the national programming contest, bringing glory to our institution.', 'https://example.com/coding-win'),
('1', 'Industry Partnership Announced', 'Our department has partnered with leading tech companies to provide internship opportunities for students.', 'https://example.com/partnership'),
('2', 'Electronics Lab Upgrade', 'The electronics department has upgraded its lab with latest oscilloscopes and signal generators for better learning experience.', 'https://example.com/lab-upgrade'),
('2', 'Research Paper Published', 'Faculty and students collaborated on a breakthrough research paper on renewable energy systems.', 'https://example.com/research'),
('5', 'Business Incubation Center Launch', 'BBA department launches entrepreneurship incubation center to support student startup initiatives.', 'https://example.com/incubation'),
('5', 'Industry Expert Lecture Series', 'Monthly lecture series featuring industry leaders sharing insights on modern business practices.', 'https://example.com/lectures');