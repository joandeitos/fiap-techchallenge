import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - discipline
 *       properties:
 *         _id:
 *           type: string
 *           description: ID auto-gerado do usuário
 *         name:
 *           type: string
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         discipline:
 *           type: string
 *           description: Disciplina lecionada pelo professor
 *         role:
 *           type: string
 *           enum: [professor, admin, aluno]
 *           description: Função do usuário no sistema
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do usuário
 *       example:
 *         name: Maria Silva
 *         email: maria@escola.edu
 *         discipline: Matemática
 *         role: professor
 */

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'professor' | 'aluno';
  discipline?: string;
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter pelo menos 3 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: 'Email inválido'
    }
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'professor', 'aluno'],
    default: 'aluno'
  },
  discipline: {
    type: String,
    required: function(this: any) {
      return this.role === 'professor';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para atualizar último login
userSchema.methods.updateLastLogin = async function(): Promise<void> {
  this.lastLogin = new Date();
  await this.save();
};

export const User = mongoose.model<IUser>('User', userSchema); 