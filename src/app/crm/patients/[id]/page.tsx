'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Avatar,
  Badge,
  Button,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Divider,
  IconButton,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import {
  User,
  Calendar,
  FileText,
  Phone,
  Mail,
  ArrowLeft,
  Plus,
  Clock,
  Activity,
  AlertCircle,
  Edit,
  Building,
  Paperclip,
  Home,
  Cake,
  Briefcase,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layout/auth-layout';
import DashboardLayout from '@/components/crm/layout/DashboardLayout';
import AppointmentModal from '@/components/crm/calendar/AppointmentModal';
import NewSessionModal from '@/components/crm/patients/NewSessionModal';
import RegisterPaymentModal from '@/components/crm/patients/RegisterPaymentModal';
import PatientAppointments from '@/components/crm/patients/PatientAppointments';
import PatientMedicalHistory from '@/components/crm/patients/PatientMedicalHistory';
import PatientAttachments from '@/components/crm/patients/PatientAttachments';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  status: 'active' | 'inactive' | 'pending';
  lastSession: Date | null;
  totalSessions: number;
  registrationDate: Date;
  therapyType: string;
  company: string;
  emergencyContact: string;
  emergencyPhone: string;
  address?: string;
  birthDate: Date;
  occupation: string;
  referredBy?: string;
  notes?: string;
  maritalStatus?: string;
  educationLevel?: string;
  nationality?: string;
  religion?: string;
  livingSituation?: string;
  hasChildren?: boolean;
  childrenCount?: number;
  reasonForTherapy?: string;
  previousTherapy?: boolean;
  previousTherapyDetails?: string;
  currentMedications?: string;
  medicalConditions?: string;
  familyHistory?: string;
  expectations?: string;
  totalDebt?: number;
}

// Mock patient data - In real app, this would come from API
const getMockPatient = (id: string): Patient | null => {
  const patients: Patient[] = [
    {
      id: '1',
      name: 'María González',
      email: 'maria.gonzalez@email.com',
      phone: '+34 666 123 456',
      age: 28,
      gender: 'F',
      status: 'active',
      lastSession: new Date('2024-01-15'),
      totalSessions: 12,
      registrationDate: new Date('2023-08-15'),
      therapyType: 'Terapia Individual',
      company: 'TechCorp Solutions',
      emergencyContact: 'Carlos González',
      emergencyPhone: '+34 666 123 457',
      address: 'Calle Mayor 123, Madrid, España',
      birthDate: new Date('1995-03-15'),
      occupation: 'Desarrolladora de Software',
      referredBy: 'Dr. Pérez',
      notes:
        'Paciente muy colaborativa, responde bien al tratamiento cognitivo-conductual.',
      maritalStatus: 'Soltera',
      educationLevel: 'Licenciatura',
      nationality: 'Española',
      religion: 'Católica',
      livingSituation: 'Vive sola',
      hasChildren: false,
      childrenCount: 0,
      reasonForTherapy:
        'Ansiedad relacionada con el trabajo y dificultades para manejar el estrés. Ha experimentado ataques de pánico ocasionales en el último año, especialmente durante períodos de alta carga laboral. También menciona dificultad para establecer límites en el trabajo.',
      previousTherapy: true,
      previousTherapyDetails:
        'Asistió a terapia hace 3 años durante 6 meses para trabajar temas de autoestima',
      currentMedications: 'Ninguna',
      medicalConditions: 'Migraña ocasional',
      familyHistory:
        'Madre con historial de trastorno de ansiedad. Padre sin antecedentes psiquiátricos.',
      expectations:
        'Aprender técnicas para manejar la ansiedad, mejorar la gestión del estrés laboral, y desarrollar habilidades de comunicación asertiva.',
      totalDebt: 2500,
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+34 677 234 567',
      age: 35,
      gender: 'M',
      status: 'active',
      lastSession: new Date('2024-01-14'),
      totalSessions: 8,
      registrationDate: new Date('2023-11-20'),
      therapyType: 'Terapia de Pareja',
      company: 'Innovate Industries',
      emergencyContact: 'Ana Rodríguez',
      emergencyPhone: '+34 677 234 568',
      address: 'Avenida de la Paz 456, Barcelona, España',
      birthDate: new Date('1988-07-22'),
      occupation: 'Gerente de Proyectos',
      referredBy: 'Programa de Bienestar Empresarial',
      notes: 'Trabaja en terapia de pareja junto con su esposa Ana.',
      maritalStatus: 'Casado',
      educationLevel: 'Maestría',
      nationality: 'Española',
      religion: 'Agnóstico',
      livingSituation: 'Vive con su esposa',
      hasChildren: true,
      childrenCount: 2,
      reasonForTherapy:
        'Problemas de comunicación en la relación de pareja. Discusiones frecuentes sobre la crianza de los hijos y distribución de responsabilidades domésticas. Busca mejorar la conexión emocional con su pareja.',
      previousTherapy: false,
      previousTherapyDetails: '',
      currentMedications: 'Ninguna',
      medicalConditions: 'Ninguna',
      familyHistory: 'Sin antecedentes psiquiátricos familiares conocidos',
      expectations:
        'Mejorar la comunicación con su pareja, aprender a resolver conflictos de manera constructiva, y fortalecer la relación.',
      totalDebt: 0,
    },
  ];

  return patients.find((p) => p.id === id) || null;
};

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const patient = getMockPatient(patientId);

  const [activeTab, setActiveTab] = useState(0);

  const {
    isOpen: isAppointmentOpen,
    onOpen: onAppointmentOpen,
    onClose: onAppointmentClose,
  } = useDisclosure();

  const {
    isOpen: isSessionOpen,
    onOpen: onSessionOpen,
    onClose: onSessionClose,
  } = useDisclosure();

  const {
    isOpen: isPaymentOpen,
    onOpen: onPaymentOpen,
    onClose: onPaymentClose,
  } = useDisclosure();

  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (!patient) {
    return (
      <AuthLayout>
        <DashboardLayout>
          <VStack spacing={6} align="center" justify="center" minH="400px">
            <User size={64} color="#CBD5E0" />
            <Text fontSize="xl" color="gray.500">
              Paciente no encontrado
            </Text>
            <Button
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => router.back()}
            >
              Volver
            </Button>
          </VStack>
        </DashboardLayout>
      </AuthLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'gray';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'M':
        return 'Masculino';
      case 'F':
        return 'Femenino';
      case 'Other':
        return 'Otro';
      default:
        return 'No especificado';
    }
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        <VStack spacing={6} align="stretch">
          {/* Header with Back Button */}
          <HStack spacing={4}>
            <IconButton
              aria-label="Volver"
              icon={<ArrowLeft size={20} />}
              variant="ghost"
              onClick={() => router.back()}
            />
            <Box>
              <Heading size="lg" color="gray.800">
                Perfil del Paciente
              </Heading>
              <Text color="gray.600">
                Información completa y historial clínico
              </Text>
            </Box>
          </HStack>

          {/* Debt Alert */}
          {patient.totalDebt && patient.totalDebt > 0 && (
            <Card
              bg="orange.50"
              borderWidth="2px"
              borderColor="orange.400"
              shadow="md"
            >
              <CardBody>
                <HStack spacing={4} align="center">
                  <Box bg="orange.500" p={3} borderRadius="full">
                    <AlertTriangle size={24} color="white" />
                  </Box>
                  <VStack spacing={1} align="start" flex="1">
                    <Text fontSize="lg" fontWeight="bold" color="orange.800">
                      Adeudo Pendiente
                    </Text>
                    <Text fontSize="sm" color="orange.700">
                      Este paciente tiene un saldo pendiente de pago
                    </Text>
                  </VStack>
                  <VStack spacing={0} align="end">
                    <Text fontSize="xs" color="orange.700">
                      Total adeudo:
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="orange.800">
                      ${patient.totalDebt.toLocaleString()} MXN
                    </Text>
                  </VStack>
                  <Button
                    leftIcon={<DollarSign size={16} />}
                    colorScheme="orange"
                    size="md"
                    onClick={onPaymentOpen}
                  >
                    Registrar Pago
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* Patient Header Card */}
          <Card bg={bg} shadow="md">
            <CardBody p={6}>
              <VStack spacing={6} align="stretch">
                {/* Top Row - Avatar and Basic Info */}
                <Flex
                  direction={{ base: 'column', md: 'row' }}
                  align={{ base: 'center', md: 'flex-start' }}
                  gap={6}
                >
                  <HStack spacing={6} flex="1">
                    <Avatar size="2xl" name={patient.name} bg="blue.500" />
                    <VStack spacing={2} align="start">
                      <HStack spacing={3}>
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                          {patient.name}
                        </Text>
                        <Badge
                          colorScheme={getStatusColor(patient.status)}
                          variant="solid"
                          px={3}
                          py={1}
                          fontSize="sm"
                        >
                          {getStatusText(patient.status)}
                        </Badge>
                      </HStack>
                      <Text color="gray.600" fontSize="lg">
                        {patient.age} años • {getGenderText(patient.gender)}
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        Paciente desde{' '}
                        {format(patient.registrationDate, 'MMMM yyyy', {
                          locale: es,
                        })}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Action Buttons - Top Right */}
                  <HStack
                    spacing={3}
                    flexWrap="wrap"
                    justify={{ base: 'center', md: 'flex-end' }}
                  >
                    <Button
                      leftIcon={<Calendar size={16} />}
                      colorScheme="blue"
                      size="md"
                      onClick={onAppointmentOpen}
                    >
                      Nueva Cita
                    </Button>
                    <Button
                      leftIcon={<Plus size={16} />}
                      colorScheme="green"
                      variant="outline"
                      size="md"
                      onClick={onSessionOpen}
                    >
                      Nueva Sesión
                    </Button>
                    <Button
                      leftIcon={<Edit size={16} />}
                      variant="outline"
                      size="md"
                    >
                      Editar Perfil
                    </Button>
                  </HStack>
                </Flex>

                {/* Bottom Row - Statistics Cards */}
                <Grid
                  templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                  gap={4}
                >
                  <Card bg={cardBg}>
                    <CardBody>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">
                          <HStack spacing={1}>
                            <Activity size={14} />
                            <Text>Total Sesiones</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="2xl" color="blue.600">
                          {patient.totalSessions}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg}>
                    <CardBody>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">
                          <HStack spacing={1}>
                            <Clock size={14} />
                            <Text>Última Sesión</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="lg" color="green.600">
                          {patient.lastSession
                            ? format(patient.lastSession, 'dd/MM/yyyy', {
                                locale: es,
                              })
                            : 'Sin sesiones'}
                        </StatNumber>
                        {patient.lastSession && (
                          <StatHelpText fontSize="xs">
                            {format(patient.lastSession, 'HH:mm')}
                          </StatHelpText>
                        )}
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg}>
                    <CardBody>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">
                          <HStack spacing={1}>
                            <FileText size={14} />
                            <Text>Tipo de Terapia</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="md" color="purple.600">
                          {patient.therapyType}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                </Grid>
              </VStack>
            </CardBody>
          </Card>

          {/* Tabs Section */}
          <Card bg={bg} shadow="md">
            <CardBody p={0}>
              <Tabs
                index={activeTab}
                onChange={setActiveTab}
                variant="enclosed"
              >
                <TabList>
                  <Tab>
                    <HStack spacing={2}>
                      <User size={16} />
                      <Text>Información General</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <Calendar size={16} />
                      <Text>Citas</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <FileText size={16} />
                      <Text>Historial Clínico</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <Paperclip size={16} />
                      <Text>Archivos Adjuntos</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* General Information Tab */}
                  <TabPanel p={6}>
                    <Grid
                      templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
                      gap={8}
                    >
                      {/* Personal Information */}
                      <VStack spacing={6} align="stretch">
                        <Box>
                          <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            mb={4}
                            color="gray.800"
                          >
                            Información Personal
                          </Text>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <Text color="gray.600" fontSize="sm">
                                Fecha de Nacimiento:
                              </Text>
                              <HStack spacing={1}>
                                <Cake size={14} color="#718096" />
                                <Text fontWeight="medium">
                                  {format(patient.birthDate, 'dd MMMM yyyy', {
                                    locale: es,
                                  })}
                                </Text>
                              </HStack>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.600" fontSize="sm">
                                Ocupación:
                              </Text>
                              <HStack spacing={1}>
                                <Briefcase size={14} color="#718096" />
                                <Text fontWeight="medium">
                                  {patient.occupation}
                                </Text>
                              </HStack>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.600" fontSize="sm">
                                Empresa:
                              </Text>
                              <HStack spacing={1}>
                                <Building size={14} color="#718096" />
                                <Text fontWeight="medium">
                                  {patient.company}
                                </Text>
                              </HStack>
                            </HStack>
                            {patient.address && (
                              <HStack justify="space-between">
                                <Text color="gray.600" fontSize="sm">
                                  Dirección:
                                </Text>
                                <HStack spacing={1}>
                                  <Home size={14} color="#718096" />
                                  <Text fontWeight="medium" fontSize="sm">
                                    {patient.address}
                                  </Text>
                                </HStack>
                              </HStack>
                            )}
                          </VStack>
                        </Box>

                        <Divider />

                        {/* Sociodemographic Information */}
                        <Box>
                          <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            mb={4}
                            color="gray.800"
                          >
                            Datos Sociodemográficos
                          </Text>
                          <VStack spacing={4} align="stretch">
                            {patient.maritalStatus && (
                              <HStack justify="space-between">
                                <Text color="gray.600" fontSize="sm">
                                  Estado Civil:
                                </Text>
                                <Text fontWeight="medium">
                                  {patient.maritalStatus}
                                </Text>
                              </HStack>
                            )}
                            {patient.educationLevel && (
                              <HStack justify="space-between">
                                <Text color="gray.600" fontSize="sm">
                                  Nivel Educativo:
                                </Text>
                                <Text fontWeight="medium">
                                  {patient.educationLevel}
                                </Text>
                              </HStack>
                            )}
                            {patient.nationality && (
                              <HStack justify="space-between">
                                <Text color="gray.600" fontSize="sm">
                                  Nacionalidad:
                                </Text>
                                <Text fontWeight="medium">
                                  {patient.nationality}
                                </Text>
                              </HStack>
                            )}
                            {patient.religion && (
                              <HStack justify="space-between">
                                <Text color="gray.600" fontSize="sm">
                                  Religión:
                                </Text>
                                <Text fontWeight="medium">
                                  {patient.religion}
                                </Text>
                              </HStack>
                            )}
                            {patient.livingSituation && (
                              <HStack justify="space-between">
                                <Text color="gray.600" fontSize="sm">
                                  Situación de Vivienda:
                                </Text>
                                <Text fontWeight="medium">
                                  {patient.livingSituation}
                                </Text>
                              </HStack>
                            )}
                            {patient.hasChildren !== undefined && (
                              <HStack justify="space-between">
                                <Text color="gray.600" fontSize="sm">
                                  Hijos:
                                </Text>
                                <Text fontWeight="medium">
                                  {patient.hasChildren
                                    ? `Sí (${patient.childrenCount})`
                                    : 'No'}
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                        </Box>

                        <Divider />

                        {/* Contact Information */}
                        <Box>
                          <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            mb={4}
                            color="gray.800"
                          >
                            Información de Contacto
                          </Text>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Mail size={14} color="#718096" />
                                <Text color="gray.600" fontSize="sm">
                                  Email:
                                </Text>
                              </HStack>
                              <Text fontWeight="medium">{patient.email}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Phone size={14} color="#718096" />
                                <Text color="gray.600" fontSize="sm">
                                  Teléfono:
                                </Text>
                              </HStack>
                              <Text fontWeight="medium">{patient.phone}</Text>
                            </HStack>
                          </VStack>
                        </Box>
                      </VStack>

                      {/* Emergency Contact & Additional Info */}
                      <VStack spacing={6} align="stretch">
                        <Box>
                          <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            mb={4}
                            color="gray.800"
                          >
                            Contacto de Emergencia
                          </Text>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <AlertCircle size={14} color="#E53E3E" />
                                <Text color="gray.600" fontSize="sm">
                                  Nombre:
                                </Text>
                              </HStack>
                              <Text fontWeight="medium">
                                {patient.emergencyContact}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Phone size={14} color="#E53E3E" />
                                <Text color="gray.600" fontSize="sm">
                                  Teléfono:
                                </Text>
                              </HStack>
                              <Text fontWeight="medium">
                                {patient.emergencyPhone}
                              </Text>
                            </HStack>
                          </VStack>
                        </Box>

                        <Divider />

                        {/* Additional Information */}
                        <Box>
                          <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            mb={4}
                            color="gray.800"
                          >
                            Información Adicional
                          </Text>
                          <VStack spacing={4} align="stretch">
                            {patient.referredBy && (
                              <HStack justify="space-between">
                                <Text color="gray.600" fontSize="sm">
                                  Referido por:
                                </Text>
                                <Text fontWeight="medium">
                                  {patient.referredBy}
                                </Text>
                              </HStack>
                            )}
                            <HStack justify="space-between">
                              <Text color="gray.600" fontSize="sm">
                                Fecha de Registro:
                              </Text>
                              <Text fontWeight="medium">
                                {format(
                                  patient.registrationDate,
                                  'dd MMMM yyyy',
                                  { locale: es },
                                )}
                              </Text>
                            </HStack>
                          </VStack>
                        </Box>

                        {/* Notes */}
                        {patient.notes && (
                          <>
                            <Divider />
                            <Box>
                              <Text
                                fontSize="lg"
                                fontWeight="semibold"
                                mb={4}
                                color="gray.800"
                              >
                                Notas
                              </Text>
                              <Card bg={cardBg}>
                                <CardBody>
                                  <Text
                                    fontSize="sm"
                                    lineHeight="1.6"
                                    color="gray.700"
                                  >
                                    {patient.notes}
                                  </Text>
                                </CardBody>
                              </Card>
                            </Box>
                          </>
                        )}
                      </VStack>
                    </Grid>

                    <Divider my={8} />

                    {/* Therapy Intake Section */}
                    <VStack spacing={6} align="stretch">
                      <Box>
                        <Text
                          fontSize="xl"
                          fontWeight="bold"
                          mb={2}
                          color="gray.800"
                        >
                          Evaluación Inicial de Terapia
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Información recopilada durante la primera consulta
                        </Text>
                      </Box>

                      <Grid
                        templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
                        gap={8}
                      >
                        {/* Reason for Therapy */}
                        <Box>
                          <Card
                            bg={cardBg}
                            borderLeft="4px"
                            borderLeftColor="blue.500"
                          >
                            <CardBody>
                              <Text
                                fontSize="md"
                                fontWeight="semibold"
                                mb={3}
                                color="gray.800"
                              >
                                Motivo de Consulta
                              </Text>
                              {patient.reasonForTherapy ? (
                                <Text
                                  fontSize="sm"
                                  lineHeight="1.8"
                                  color="gray.700"
                                >
                                  {patient.reasonForTherapy}
                                </Text>
                              ) : (
                                <Text
                                  fontSize="sm"
                                  color="gray.500"
                                  fontStyle="italic"
                                >
                                  No especificado
                                </Text>
                              )}
                            </CardBody>
                          </Card>
                        </Box>

                        {/* Expectations */}
                        <Box>
                          <Card
                            bg={cardBg}
                            borderLeft="4px"
                            borderLeftColor="green.500"
                          >
                            <CardBody>
                              <Text
                                fontSize="md"
                                fontWeight="semibold"
                                mb={3}
                                color="gray.800"
                              >
                                Expectativas del Tratamiento
                              </Text>
                              {patient.expectations ? (
                                <Text
                                  fontSize="sm"
                                  lineHeight="1.8"
                                  color="gray.700"
                                >
                                  {patient.expectations}
                                </Text>
                              ) : (
                                <Text
                                  fontSize="sm"
                                  color="gray.500"
                                  fontStyle="italic"
                                >
                                  No especificado
                                </Text>
                              )}
                            </CardBody>
                          </Card>
                        </Box>
                      </Grid>

                      {/* Previous Therapy History */}
                      {patient.previousTherapy !== undefined && (
                        <Card bg={cardBg}>
                          <CardBody>
                            <VStack spacing={3} align="stretch">
                              <HStack justify="space-between">
                                <Text
                                  fontSize="md"
                                  fontWeight="semibold"
                                  color="gray.800"
                                >
                                  Historial de Terapia Previa
                                </Text>
                              </HStack>
                              {patient.previousTherapy &&
                              patient.previousTherapyDetails ? (
                                <Text
                                  fontSize="sm"
                                  lineHeight="1.6"
                                  color="gray.700"
                                >
                                  {patient.previousTherapyDetails}
                                </Text>
                              ) : (
                                <Text
                                  fontSize="sm"
                                  lineHeight="1.6"
                                  color="gray.500"
                                  fontStyle="italic"
                                >
                                  No tiene historial de terapia previa
                                </Text>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      )}

                      {/* Medical Information */}
                      <Grid
                        templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
                        gap={6}
                      >
                        {/* Current Medications */}
                        {patient.currentMedications && (
                          <Card bg={cardBg}>
                            <CardBody>
                              <Text
                                fontSize="md"
                                fontWeight="semibold"
                                mb={3}
                                color="gray.800"
                              >
                                Medicación Actual
                              </Text>
                              <Text
                                fontSize="sm"
                                lineHeight="1.6"
                                color="gray.700"
                              >
                                {patient.currentMedications}
                              </Text>
                            </CardBody>
                          </Card>
                        )}

                        {/* Medical Conditions */}
                        {patient.medicalConditions && (
                          <Card bg={cardBg}>
                            <CardBody>
                              <Text
                                fontSize="md"
                                fontWeight="semibold"
                                mb={3}
                                color="gray.800"
                              >
                                Condiciones Médicas
                              </Text>
                              <Text
                                fontSize="sm"
                                lineHeight="1.6"
                                color="gray.700"
                              >
                                {patient.medicalConditions}
                              </Text>
                            </CardBody>
                          </Card>
                        )}
                      </Grid>

                      {/* Family History */}
                      {patient.familyHistory && (
                        <Card
                          bg={cardBg}
                          borderLeft="4px"
                          borderLeftColor="orange.500"
                        >
                          <CardBody>
                            <Text
                              fontSize="md"
                              fontWeight="semibold"
                              mb={3}
                              color="gray.800"
                            >
                              Historial Familiar Psiquiátrico
                            </Text>
                            <Text
                              fontSize="sm"
                              lineHeight="1.6"
                              color="gray.700"
                            >
                              {patient.familyHistory}
                            </Text>
                          </CardBody>
                        </Card>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Appointments Tab */}
                  <TabPanel p={6}>
                    <PatientAppointments patientId={patient.id} />
                  </TabPanel>

                  {/* Medical History Tab */}
                  <TabPanel p={6}>
                    <PatientMedicalHistory patientId={patient.id} />
                  </TabPanel>

                  {/* Attachments Tab */}
                  <TabPanel p={6}>
                    <PatientAttachments patientId={patient.id} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>

        {/* Modals */}
        <AppointmentModal
          isOpen={isAppointmentOpen}
          onClose={onAppointmentClose}
        />

        <NewSessionModal
          isOpen={isSessionOpen}
          onClose={onSessionClose}
          patient={patient}
        />

        <RegisterPaymentModal
          isOpen={isPaymentOpen}
          onClose={onPaymentClose}
          patientId={patient.id}
          patientName={patient.name}
          totalDebt={patient.totalDebt || 0}
        />
      </DashboardLayout>
    </AuthLayout>
  );
}
