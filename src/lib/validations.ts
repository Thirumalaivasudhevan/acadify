import { z } from 'zod';

// Authentication validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100, { message: "Password must be less than 100 characters" })
});

export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100, { message: "Password must be less than 100 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" 
    }),
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Full name is required" })
    .max(100, { message: "Full name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Full name can only contain letters and spaces" }),
  role: z.enum(['Faculty', 'Student'], { 
    errorMap: () => ({ message: "Please select a valid role" }) 
  })
});

// Attendance validation schemas
export const attendanceSchema = z.object({
  studentId: z.string().uuid({ message: "Invalid student ID" }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format" }),
  period: z.number().int().min(1).max(8, { message: "Period must be between 1 and 8" }),
  subject: z
    .string()
    .trim()
    .min(1, { message: "Subject is required" })
    .max(100, { message: "Subject must be less than 100 characters" }),
  status: z.enum(['Present', 'Absent', 'Late'], {
    errorMap: () => ({ message: "Invalid attendance status" })
  }),
  remarks: z
    .string()
    .trim()
    .max(500, { message: "Remarks must be less than 500 characters" })
    .optional()
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type AttendanceFormData = z.infer<typeof attendanceSchema>;