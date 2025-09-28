-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  faculty_id UUID NOT NULL,
  date DATE NOT NULL,
  period INTEGER NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, date, period, subject)
);

-- Enable Row Level Security
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for attendance
CREATE POLICY "Faculty can view attendance for their department students" 
ON public.attendance 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.faculty_profiles fp1, public.student_profiles sp1 
    WHERE fp1.user_id = auth.uid() 
    AND sp1.user_id = attendance.student_id 
    AND fp1.department = sp1.department
  )
);

CREATE POLICY "Faculty can insert attendance for their department students" 
ON public.attendance 
FOR INSERT 
WITH CHECK (
  auth.uid() = faculty_id AND
  EXISTS (
    SELECT 1 FROM public.faculty_profiles fp1, public.student_profiles sp1 
    WHERE fp1.user_id = auth.uid() 
    AND sp1.user_id = attendance.student_id 
    AND fp1.department = sp1.department
  )
);

CREATE POLICY "Faculty can update attendance for their department students" 
ON public.attendance 
FOR UPDATE 
USING (
  auth.uid() = faculty_id AND
  EXISTS (
    SELECT 1 FROM public.faculty_profiles fp1, public.student_profiles sp1 
    WHERE fp1.user_id = auth.uid() 
    AND sp1.user_id = attendance.student_id 
    AND fp1.department = sp1.department
  )
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX idx_attendance_faculty_date ON public.attendance(faculty_id, date);
CREATE INDEX idx_attendance_date_period ON public.attendance(date, period);