-- Add RLS policies for quiz_questions table
-- Only faculty can directly access quiz questions (for management purposes)
CREATE POLICY "Faculty can view all quiz questions"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role = 'Faculty'
  )
);

CREATE POLICY "Faculty can insert quiz questions"
ON public.quiz_questions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role = 'Faculty'
  )
);

CREATE POLICY "Faculty can update quiz questions"
ON public.quiz_questions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role = 'Faculty'
  )
);

CREATE POLICY "Faculty can delete quiz questions"
ON public.quiz_questions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role = 'Faculty'
  )
);