import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/infrastructure/auth.service';
import { ILoginRequest, ResponseWrapper, ILoginResponse } from '@/modules/shared/domain/types/auth.types';

export async function POST(request: NextRequest) {
  try {
    const body: ILoginRequest = await request.json();

    // Validate input
    if (!body.email || !body.password) {
      const response: ResponseWrapper<null> = {
        success: false,
        message: 'Email y contraseña son requeridos',
        data: null
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Authenticate user
    const result = await authService.authenticateUser(body);

    if (!result) {
      const response: ResponseWrapper<null> = {
        success: false,
        message: 'Credenciales inválidas',
        data: null
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Success response
    const response: ResponseWrapper<ILoginResponse> = {
      success: true,
      message: 'Autenticación exitosa',
      data: result
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    
    const response: ResponseWrapper<null> = {
      success: false,
      message: 'Error interno del servidor',
      data: null
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}