export type Role = 'student' | 'admin';

export interface AuthSession {
  token: string;
  role: Role;
  userId: string;
}

export interface StudentResult {
  id: number;
  student_name: string;
  roll_number: string;
  created_date: string;
}

export interface ApiErrorShape {
  detail?: string;
}
