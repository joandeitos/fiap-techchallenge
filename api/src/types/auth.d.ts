export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'professor' | 'aluno';
  discipline?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
} 