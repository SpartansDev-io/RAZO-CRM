import { NextRequest, NextResponse } from 'next/server';

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

export async function GET() {
  try {
    return NextResponse.json(
      {
        success: true,
        data: [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
