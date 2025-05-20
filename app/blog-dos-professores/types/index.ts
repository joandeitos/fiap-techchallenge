
export interface Author {
  id: string;
  name: string;
  email?: string;
  profilePicture?: string;
}

export interface Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'professor' | 'aluno';
  discipline?: string;
  isActive: boolean;
  lastLogin?: Date;
}

export interface AuthUser {
  id: string;
  _id?: string; 
  name: string;
  email: string;
  role: 'admin' | 'professor' | 'aluno';
  discipline?: string;
  profilePicture?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  token: string | null;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'professor' | 'aluno';
  discipline?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  discipline?: string;
  role?: 'admin' | 'professor' | 'aluno';
  password?: string;
  confirmPassword?: string;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<any>;
  register: (userData: RegisterRequest) => Promise<any>;
  logout: () => void;
  updateProfile: (userData: UpdateProfileRequest) => Promise<any>;
  clearError: () => void;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  summary?: string;
  author: Author;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  imageUrl?: string;
  likes?: number;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}

export type ColorSchemeType = 'light' | 'dark';

export interface ColorSchemeContextType {
  colorScheme: ColorSchemeType;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ColorSchemeType) => void;
  systemColorScheme?: ColorSchemeType;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PostItemProps {
  post: Post;
  onPress: () => void;
  isDarkMode: boolean;
}

export interface PostDetailProps {
  post: Post;
  onClose: () => void;
  canEdit: boolean;
  canDelete: boolean;
  isDarkMode: boolean;
}

export interface ModalProps {
  onClose: () => void;
  isDarkMode: boolean;
}

export interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onLoginPress: () => void;
  onOptionsPress: () => void;
  onAboutPress: () => void;
  isAuthenticated: boolean;
  isDarkMode: boolean;
}

export interface AdminPanelProps extends ModalProps {}
export interface LoginModalProps extends ModalProps {}
export interface OptionsModalProps extends ModalProps {}
export interface AboutModalProps extends ModalProps {}

export interface AdminUserEditProps {
  visible: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: (AuthUser & { _id?: string }) | null;
  isDarkMode: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}