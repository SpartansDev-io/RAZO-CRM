import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/modules/shared/infrastructure/database/prisma';
import { ILoginRequest, IUser } from '@/modules/shared/domain/types/auth.types';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;

  /**
   * Authenticate user credentials
   */
  async authenticateUser(credentials: ILoginRequest): Promise<{ user: IUser; token: string } | null> {
    try {
      // Find user by email
      const userProfile = await prisma.userProfile.findUnique({
        where: {
          email: credentials.email,
        }
      });

      if (!userProfile || !userProfile.isActive) {
        return null;
      }

      // Generate JWT token
      const token = this.generateToken(userProfile);

      // Return user data
      return {
        user: {
          id: userProfile.id,
          email: userProfile.email,
          fullName: userProfile.fullName,
          phone: userProfile.phone,
          roleId: '',
          role: userProfile.role as any,
          isActive: userProfile.isActive,
          createdAt: userProfile.createdAt,
          updatedAt: userProfile.updatedAt,
        } as IUser,
        token
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(userProfile: any): string {
    return jwt.sign(
      {
        userId: userProfile.id,
        email: userProfile.email,
        role: userProfile.role
      },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}

export const authService = new AuthService();