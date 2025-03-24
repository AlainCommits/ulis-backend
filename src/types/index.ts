import { Document } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
  
export type CourseCategory = 'Programmierung' | 'Design' | 'Business' | 'Sprachen' | 'Sonstiges';
export type CourseStatus = 'aktiv' | 'abgeschlossen' | 'abgesagt';

export interface CourseDocument extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  category: CourseCategory;
  status: CourseStatus;
  maxParticipants: number;
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
}
