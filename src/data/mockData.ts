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
  { id: '5', name: 'BBA' },
];

export const faculties: Faculty[] = [
  { id: '2', name: 'Dr. John Smith', email: 'faculty@example.com', department: 'Computer Science' },
  { id: '4', name: 'Prof. Sarah Wilson', email: 'sarah@college.edu', department: 'Electronics' },
  { id: '5', name: 'Dr. Michael Brown', email: 'michael@college.edu', department: 'Mechanical' },
  { id: '6', name: 'Dr. Rajesh Kumar', email: 'rajesh@college.edu', department: 'BBA' },
];

export const students: Student[] = [
  // Computer Science Students
  { id: '3', name: 'Alice Johnson', rollNo: 'CS001', deptId: '1', email: 'student@example.com' },
  { id: '7', name: 'Bob Davis', rollNo: 'CS002', deptId: '1', email: 'bob@college.edu' },
  
  // Electronics Students  
  { id: '8', name: 'Carol White', rollNo: 'EC001', deptId: '2', email: 'carol@college.edu' },
  
  // Mechanical Students
  { id: '9', name: 'David Lee', rollNo: 'ME001', deptId: '3', email: 'david@college.edu' },
  
  // BBA Students (from Excel data)
  { id: '10', name: 'AMEERA SIDDIKA K', rollNo: '2325F0474', deptId: '5', email: '2325F0474.ameera_siddika_k@nandhaarts.org' },
  { id: '11', name: 'ANAND T', rollNo: '2325F0475', deptId: '5', email: '2325F0475.anand_t@nandhaarts.org' },
  { id: '12', name: 'ARPIT KUMAR MISHRA A', rollNo: '2325F0476', deptId: '5', email: '2325F0476.arpit_kumar_mishra_a@nandhaarts.org' },
  { id: '13', name: 'ARUN K', rollNo: '2325F0477', deptId: '5', email: '2325F0477.arun_k@nandhaarts.org' },
  { id: '14', name: 'ARUNESHWAR T', rollNo: '2325F0478', deptId: '5', email: '2325F0478.aruneshwar_t@nandhaarts.org' },
  { id: '15', name: 'BALAKUMAR G', rollNo: '2325F0479', deptId: '5', email: '2325F0479.balakumar_g@nandhaarts.org' },
  { id: '16', name: 'BARATH D', rollNo: '2325F0480', deptId: '5', email: '2325F0480.barath_d@nandhaarts.org' },
  { id: '17', name: 'BARATH K', rollNo: '2325F0481', deptId: '5', email: '2325F0481.barath_k@nandhaarts.org' },
  { id: '18', name: 'DEEPAK MANIKANDAN K', rollNo: '2325F0482', deptId: '5', email: '2325F0482.deepak_manikandan_k@nandhaarts.org' },
  { id: '19', name: 'DHANANJAYAN B', rollNo: '2325F0483', deptId: '5', email: '2325F0483.dhananjayan_b@nandhaarts.org' },
  { id: '20', name: 'DHANUSH N', rollNo: '2325F0484', deptId: '5', email: '2325F0484.dhanush_n@nandhaarts.org' },
  { id: '21', name: 'DHARANEESH C', rollNo: '2325F0485', deptId: '5', email: '2325F0485.dharaneesh_c@nandhaarts.org' },
  { id: '22', name: 'DHAYANANTHAN S', rollNo: '2325F0486', deptId: '5', email: '2325F0486.dhayananthan_s@nandhaarts.org' },
  { id: '23', name: 'DIVIYADHARSINI S M', rollNo: '2325F0487', deptId: '5', email: '2325F0487.diviyadharsini_s_m@nandhaarts.org' },
  { id: '24', name: 'ELAYABHARATHI K', rollNo: '2325F0488', deptId: '5', email: '2325F0488.elayabharathi_k@nandhaarts.org' },
  { id: '25', name: 'GOPALKRISHNAN R', rollNo: '2325F0489', deptId: '5', email: '2325F0489.gopalkrishnan_r@nandhaarts.org' },
  { id: '26', name: 'GOBINATH M', rollNo: '2325F0490', deptId: '5', email: '2325F0490.gobinath_m@nandhaarts.org' },
  { id: '27', name: 'HARIHARAN G', rollNo: '2325F0491', deptId: '5', email: '2325F0491.hariharan_g@nandhaarts.org' },
  { id: '28', name: 'HARINI V', rollNo: '2325F0492', deptId: '5', email: '2325F0492.harini_v@nandhaarts.org' },
  { id: '29', name: 'IMRAN KHAN M', rollNo: '2325F0493', deptId: '5', email: '2325F0493.imran_khan_m@nandhaarts.org' },
  { id: '30', name: 'JAGANATHAN V', rollNo: '2325F0494', deptId: '5', email: '2325F0494.jaganathan_v@nandhaarts.org' },
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