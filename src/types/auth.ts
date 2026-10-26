export type UserRole = 'examAuthor' | 'questionReviewer';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
}

export interface AuthTokenResponse {
  token: string;
  tokenType: string; // 'Bearer'
  expiresIn: number; // in seconds
  issuedAt: string;
  user: User;
}

export interface AuthTestResult {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  testedAt: string;
  user: User;
  statusCode: number;
  outcome: 'ALLOWED' | 'FORBIDDEN' | 'UNAUTHORIZED' | 'ERROR';
  responseMessage: string;
  simulated?: boolean;
}
