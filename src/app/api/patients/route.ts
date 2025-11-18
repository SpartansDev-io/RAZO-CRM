import { prisma } from '@/modules/shared/infrastructure/database/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface CreatePatientRequest {
  // Basic Information
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'M' | 'F' | 'Other';

  // Personal Information
  occupation: string;
  company?: string;
  address?: string;

  // Sociodemographic Information
  maritalStatus?: string;
  educationLevel?: string;
  nationality?: string;
  religion?: string;
  livingSituation?: string;
  hasChildren?: string;
  childrenCount?: number;

  // Contact Information
  emergencyContact: string;
  emergencyPhone: string;

  // Therapy Information
  therapyType: string;
  referredBy?: string;

  // Clinical Information
  reasonForTherapy: string;
  expectations?: string;
  previousTherapy?: string;
  previousTherapyDetails?: string;
  currentMedications?: string;
  medicalConditions?: string;
  familyHistory?: string;

  // Additional Notes
  notes?: string;

  // Support Network (array for future front implementation)
  supportNetwork?: Array<{
    fullName: string;
    relationship: string;
    phone?: string;
    email?: string;
    legalRepresentative?: boolean;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePatientRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.birthDate || !body.gender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!body.emergencyContact || !body.emergencyPhone) {
      return NextResponse.json(
        { error: 'Emergency contact information is required' },
        { status: 400 }
      );
    }

    if (!body.reasonForTherapy || !body.therapyType) {
      return NextResponse.json(
        { error: 'Therapy information is required' },
        { status: 400 }
      );
    }

    // Check if patient with this email already exists
    const existingPatient = await prisma.patient.findUnique({
      where: { email: body.email },
    });

    if (existingPatient) {
      return NextResponse.json(
        { error: 'A patient with this email already exists' },
        { status: 409 }
      );
    }

    // Parse birth date
    const birthDate = new Date(body.birthDate);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid birth date format' },
        { status: 400 }
      );
    }

    // Parse support network data
    const supportNetworkData = body.supportNetwork || [];

    // Create patient with support network in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the patient
      const patient = await tx.patient.create({
        data: {
          name: body.name,
          email: body.email,
          phone: body.phone,
          birthDate: birthDate,
          gender: body.gender,
          occupation: body.occupation,
          companyName: body.company,
          address: body.address,
          maritalStatus: body.maritalStatus,
          educationLevel: body.educationLevel,
          nationality: body.nationality,
          religion: body.religion,
          livingSituation: body.livingSituation,
          hasChildren: body.hasChildren === 'yes',
          childrenCount: body.childrenCount || 0,
          emergencyContactName: body.emergencyContact,
          emergencyContactPhone: body.emergencyPhone,
          therapyType: body.therapyType,
          referredBy: body.referredBy,
          reasonForTherapy: body.reasonForTherapy,
          expectations: body.expectations,
          previousTherapy: body.previousTherapy === 'yes',
          previousTherapyDetails: body.previousTherapyDetails,
          currentMedications: body.currentMedications,
          medicalConditions: body.medicalConditions,
          familyPsychiatricHistory: body.familyHistory,
          notes: body.notes,
          status: 'active',
          preferredLanguage: 'es',
        },
      });

      // Create support network entries if provided
      if (supportNetworkData.length > 0) {
        await tx.support_network.createMany({
          data: supportNetworkData.map((supporter) => ({
            patient_id: patient.id,
            full_name: supporter.fullName,
            relationship: supporter.relationship,
            phone: supporter.phone,
            email: supporter.email,
            legal_representative: supporter.legalRepresentative || false,
          })),
        });
      }

      return patient;
    });

    return NextResponse.json(
      {
        success: true,
        message: `Patient ${result.name} created successfully`,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating patient:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error while creating patient' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '10');

    let where: any = {};

    if (email) {
      where.email = {
        contains: email,
        mode: 'insensitive',
      };
    }

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    const patients = await prisma.patient.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        gender: true,
        occupation: true,
        companyName: true,
        therapyType: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.patient.count({ where });

    return NextResponse.json(
      {
        success: true,
        data: patients,
        pagination: {
          skip,
          take,
          total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching patients:', error);

    return NextResponse.json(
      { error: 'Internal server error while fetching patients' },
      { status: 500 }
    );
  }
}
