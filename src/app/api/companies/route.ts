import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/modules/shared/infrastructure/database/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      website,
      industry,
      employee_count,
      is_active,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Company created successfully',
        data: {
          id: crypto.randomUUID(),
          name,
          email,
          phone,
          address,
          website,
          industry,
          employee_count,
          is_active,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc'; // asc | desc

    // 1️⃣ Obtener compañías activas (sin soft-delete)
    const companies = await prisma.company.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    });

    // 2️⃣ Formateo de respuesta
    const formatted = companies.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      website: c.website,
      industry: c.industry,
      taxId: c.taxId,
      billingContact: {
        name: c.billingContactName,
        email: c.billingContactEmail,
        phone: c.billingContactPhone,
      },
      employeeCount: c.employeeCount,
      activeContractsCount: c.activeContractsCount,
      isActive: c.isActive,
      notes: c.notes,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        companies: formatted,
        total: formatted.length,
      },
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener compañías',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
