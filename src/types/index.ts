export type Role = "user" | "model";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  pictures?: string[]; // <-- This is the crucial change!
}

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string | Date;
  messages: Message[];
}

export interface User {
  id: number;
  email: string;
  role: 'student' | 'admin';
  username?: string;
}

export interface ToastMsg {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Knowledge {
  id: number;
  keyword: string;
  response: string;
  picture_url: string | null;
  created_at: string;
}

export interface Unanswered {
  id: number;
  question: string;
  created_at: string;
}

export interface BugReport {
  id: number;
  user_info: string;
  description: string;
  created_at: string;
}