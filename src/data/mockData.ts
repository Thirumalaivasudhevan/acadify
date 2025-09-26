import { 
  Faculty, 
  Department, 
  Student, 
  TimetableSlot, 
  FacultyWork, 
  StudentWorkStatus, 
  Announcement, 
  StudentRequest,
  Day 
} from '../types/college';

export const departments: Department[] = [
  { id: '1', name: 'Computer Science' },
  { id: '2', name: 'Electronics' },
  { id: '3', name: 'Mechanical' },
  { id: '4', name: 'Civil' },
];

export const faculties: Faculty[] = [
  { id: '2', name: 'Dr. John Smith', email: 'faculty@example.com', department: 'Computer Science' },
  { id: '4', name: 'Prof. Sarah Wilson', email: 'sarah@college.edu', department: 'Electronics' },
  { id: '5', name: 'Dr. Michael Brown', email: 'michael@college.edu', department: 'Mechanical' },
];

export const students: Student[] = [
  { id: '3', name: 'Alice Johnson', rollNo: 'CS001', deptId: '1', email: 'student@example.com' },
  { id: '6', name: 'Bob Davis', rollNo: 'CS002', deptId: '1', email: 'bob@college.edu' },
  { id: '7', name: 'Carol White', rollNo: 'EC001', deptId: '2', email: 'carol@college.edu' },
  { id: '8', name: 'David Lee', rollNo: 'ME001', deptId: '3', email: 'david@college.edu' },
];

const days: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const periods = [1, 2, 3, 4, 5];

export const timetableSlots: TimetableSlot[] = [
  // Dr. John Smith - Computer Science
  { id: '1', facultyId: '2', day: 'Monday', period: 1, subject: 'Data Structures', room: 'CS-101' },
  { id: '2', facultyId: '2', day: 'Monday', period: 3, subject: 'Algorithms', room: 'CS-102' },
  { id: '3', facultyId: '2', day: 'Tuesday', period: 2, subject: 'Database Systems', room: 'CS-101' },
  { id: '4', facultyId: '2', day: 'Wednesday', period: 1, subject: 'Data Structures', room: 'CS-101' },
  { id: '5', facultyId: '2', day: 'Thursday', period: 4, subject: 'Software Engineering', room: 'CS-103' },
  { id: '6', facultyId: '2', day: 'Friday', period: 2, subject: 'Algorithms', room: 'CS-102' },
  
  // Prof. Sarah Wilson - Electronics
  { id: '7', facultyId: '4', day: 'Monday', period: 2, subject: 'Digital Electronics', room: 'EC-201' },
  { id: '8', facultyId: '4', day: 'Tuesday', period: 1, subject: 'Microprocessors', room: 'EC-202' },
  { id: '9', facultyId: '4', day: 'Wednesday', period: 3, subject: 'Signal Processing', room: 'EC-203' },
  { id: '10', facultyId: '4', day: 'Thursday', period: 2, subject: 'Digital Electronics', room: 'EC-201' },
  { id: '11', facultyId: '4', day: 'Friday', period: 4, subject: 'Communication Systems', room: 'EC-204' },
];

export const facultyWorks: FacultyWork[] = [
  {
    id: '1',
    deptId: '1',
    facultyId: '2',
    facultyName: 'Dr. John Smith',
    type: 'Assignment',
    title: 'Binary Search Tree Implementation',
    description: 'Implement a complete BST with insert, delete, and search operations in your preferred programming language.',
    dueDate: '2024-10-15',
    maxMarks: 50,
    status: 'Active',
    createdAt: '2024-09-25',
  },
  {
    id: '2',
    deptId: '1',
    facultyId: '2',
    facultyName: 'Dr. John Smith',
    type: 'Weekly Test',
    title: 'Database Normalization Quiz',
    description: 'Test covering 1NF, 2NF, 3NF, and BCNF with practical examples.',
    dueDate: '2024-10-08',
    maxMarks: 25,
    status: 'Active',
    createdAt: '2024-09-28',
  },
  {
    id: '3',
    deptId: '2',
    facultyId: '4',
    facultyName: 'Prof. Sarah Wilson',
    type: 'Assignment',
    title: 'Digital Circuit Design',
    description: 'Design a 4-bit ALU using logic gates and create a detailed circuit diagram.',
    dueDate: '2024-10-20',
    maxMarks: 60,
    status: 'Active',
    createdAt: '2024-09-30',
  },
];

export const studentWorkStatuses: StudentWorkStatus[] = [
  {
    id: '1',
    workId: '1',
    studentId: '3',
    studentName: 'Alice Johnson',
    rollNo: 'CS001',
    completed: false,
    marks: undefined,
    extras: undefined,
  },
  {
    id: '2',
    workId: '1',
    studentId: '6',
    studentName: 'Bob Davis',
    rollNo: 'CS002',
    completed: true,
    marks: 45,
    extras: 'Excellent implementation with proper documentation',
  },
  {
    id: '3',
    workId: '2',
    studentId: '3',
    studentName: 'Alice Johnson',
    rollNo: 'CS001',
    completed: true,
    marks: 22,
    extras: 'Good understanding of normalization concepts',
  },
];

export const announcements: Announcement[] = [
  {
    id: '1',
    target: 'Both',
    message: 'Important: Mid-semester examinations will be conducted from October 15-25, 2024. Please check your individual timetables for specific dates and timings.',
    createdAt: '2024-09-20',
    createdBy: 'Admin User',
  },
  {
    id: '2',
    target: 'Student',
    message: 'Library will remain open 24/7 during examination period. Students can access study halls and reference materials round the clock.',
    createdAt: '2024-09-22',
    createdBy: 'Admin User',
  },
  {
    id: '3',
    target: 'Faculty',
    message: 'Faculty meeting scheduled for October 5th at 2:00 PM in Conference Hall A. Please confirm your attendance with the admin office.',
    createdAt: '2024-09-25',
    createdBy: 'Admin User',
  },
];

export const studentRequests: StudentRequest[] = [
  {
    id: '1',
    studentId: '3',
    studentName: 'Alice Johnson',
    target: 'Faculty',
    message: 'I would like to request an extension for the BST assignment due to medical reasons. I have attached the medical certificate for your reference.',
    status: 'Pending',
    createdAt: '2024-09-28',
  },
  {
    id: '2',
    studentId: '6',
    studentName: 'Bob Davis',
    target: 'Admin',
    message: 'I need to apply for a transcript for my internship application. Please let me know the required documents and processing time.',
    status: 'Answered',
    reply: 'Please submit the transcript application form along with fee payment receipt at the admin office. Processing time is 3-5 working days.',
    createdAt: '2024-09-26',
  },
];