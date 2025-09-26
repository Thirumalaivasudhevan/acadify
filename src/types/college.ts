export type WorkType = 'Assignment' | 'Imposition' | 'Weekly Test' | 'Daily Test';
export type RequestTarget = 'Faculty' | 'Admin' | 'Both';
export type AnnouncementTarget = 'Faculty' | 'Student' | 'Both';
export type RequestStatus = 'Pending' | 'Answered' | 'Closed';
export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface Department {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  deptId: string;
  email: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface TimetableSlot {
  id: string;
  facultyId: string;
  day: Day;
  period: number;
  subject: string;
  room: string;
}

export interface FacultyWork {
  id: string;
  deptId: string;
  facultyId: string;
  facultyName: string;
  type: WorkType;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  status: 'Active' | 'Completed';
  createdAt: string;
}

export interface StudentWorkStatus {
  id: string;
  workId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  completed: boolean;
  marks?: number;
  extras?: string;
}

export interface Announcement {
  id: string;
  target: AnnouncementTarget;
  message: string;
  filePath?: string;
  createdAt: string;
  createdBy: string;
}

export interface StudentRequest {
  id: string;
  studentId: string;
  studentName: string;
  target: RequestTarget;
  message: string;
  filePath?: string;
  status: RequestStatus;
  reply?: string;
  createdAt: string;
}