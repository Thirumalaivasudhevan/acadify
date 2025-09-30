-- Remove the public read policy for quiz_questions
DROP POLICY IF EXISTS "Quiz questions are viewable by everyone" ON public.quiz_questions;

-- Create a secure function to get quiz questions WITHOUT answers for students
CREATE OR REPLACE FUNCTION public.get_quiz_questions_for_student(dept_id text, question_limit integer DEFAULT 3)
RETURNS TABLE (
  id uuid,
  question text,
  options jsonb,
  department_id text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    q.id,
    q.question,
    q.options,
    q.department_id
  FROM quiz_questions q
  WHERE q.department_id = dept_id
  ORDER BY random()
  LIMIT question_limit;
$$;

-- Create a secure function to validate quiz answers (server-side only)
CREATE OR REPLACE FUNCTION public.validate_quiz_answers(question_ids uuid[], user_answers text[])
RETURNS TABLE (
  question_id uuid,
  is_correct boolean,
  correct_answer text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id as question_id,
    (q.correct_answer = user_answers[array_position(question_ids, q.id)]) as is_correct,
    q.correct_answer
  FROM quiz_questions q
  WHERE q.id = ANY(question_ids);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_quiz_questions_for_student(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_quiz_answers(uuid[], text[]) TO authenticated;