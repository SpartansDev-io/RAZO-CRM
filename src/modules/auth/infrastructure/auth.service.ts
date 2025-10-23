import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/modules/shared/infrastructure/database/prisma';
import { ILoginRequest, IUser } from '@/modules/shared/domain/types/auth.types';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;

  /**
   * Authenticate user credentials
   */
  async authenticateUser(
    credentials: ILoginRequest,
  ): Promise<{ user: IUser; token: string } | null> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: {
          email: credentials.email,
          isActive: true,
        },
        include: {
          role: true,
        },
      });

      if (!user) {
        return null;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        credentials.password,
        user.passwordHash,
      );
      if (!isValidPassword) {
        return null;
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword as IUser,
        token,
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: any): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roleId: user.roleId,
      },
      this.JWT_SECRET,
      { expiresIn: '24h' },
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
