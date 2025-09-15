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
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layout/auth-layout';
import DashboardLayout from '@/components/crm/layout/DashboardLayout';
import AppointmentModal from '@/components/crm/calendar/AppointmentModal';
import NewSessionModal from '@/components/crm/patients/NewSessionModal';
import PatientAppointments from '@/components/crm/patients/PatientAppointments';
import PatientMedicalHistory from '@/components/crm/patients/PatientMedicalHistory';

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
      notes: 'Paciente muy colaborativa, responde bien al tratamiento cognitivo-conductual.',
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
    },
  ];

  return patients.find(p => p.id === id) || null;
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
    onClose: onAppointmentClose 
  } = useDisclosure();
  
  const { 
    isOpen: isSessionOpen, 
    onOpen: onSessionOpen, 
    onClose: onSessionClose 
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
            <Button leftIcon={<ArrowLeft size={16} />} onClick={() => router.back()}>
              Volver
            </Button>
          </VStack>
        </DashboardLayout>
      </AuthLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'M': return 'Masculino';
      case 'F': return 'Femenino';
      case 'Other': return 'Otro';
      default: return 'No especificado';
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
                    <Avatar
                      size="2xl"
                      name={patient.name}
                      bg="blue.500"
                    />
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
                        Paciente desde {format(patient.registrationDate, 'MMMM yyyy', { locale: es })}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Action Buttons - Top Right */}
                  <HStack spacing={3} flexWrap="wrap" justify={{ base: 'center', md: 'flex-end' }}>
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
                <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
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
                            ? format(patient.lastSession, 'dd/MM/yyyy', { locale: es })
                            : 'Sin sesiones'
                          }
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
              <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
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
                </TabList>

                <TabPanels>
                  {/* General Information Tab */}
                  <TabPanel p={6}>
                    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
                      {/* Personal Information */}
                      <VStack spacing={6} align="stretch">
                        <Box>
                          <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                            Información Personal
                          </Text>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <Text color="gray.600" fontSize="sm">Fecha de Nacimiento:</Text>
                              <Text fontWeight="medium">
                                {format(patient.birthDate, 'dd MMMM yyyy', { locale: es })}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.600" fontSize="sm">Ocupación:</Text>
                              <Text fontWeight="medium">{patient.occupation}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.600" fontSize="sm">Empresa:</Text>
                              <HStack spacing={1}>
                                <Building size={14} color="#718096" />
                                <Text fontWeight="medium">{patient.company}</Text>
                              </HStack>
                            </HStack>
                            {patient.address && (
                              <VStack align="stretch" spacing={1}>
                                <Text color="gray.600" fontSize="sm">Dirección:</Text>
                                <Text fontWeight="medium" fontSize="sm">
                                  {patient.address}
                                </Text>
                              </VStack>
                            )}
                          </VStack>
                        </Box>

                        <Divider />

                        {/* Contact Information */}
                        <Box>
                          <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                            Información de Contacto
                          </Text>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Mail size={14} color="#718096" />
                                <Text color="gray.600" fontSize="sm">Email:</Text>
                              </HStack>
                              <Text fontWeight="medium">{patient.email}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Phone size={14} color="#718096" />
                                <Text color="gray.600" fontSize="sm">Teléfono:</Text>
                              </HStack>
                              <Text fontWeight="medium">{patient.phone}</Text>
                            </HStack>
                          </VStack>
                        </Box>
                      </VStack>

                      {/* Emergency Contact & Additional Info */}
                      <VStack spacing={6} align="stretch">
                        <Box>
                          <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                            Contacto de Emergencia
                          </Text>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <AlertCircle size={14} color="#E53E3E" />
                                <Text color="gray.600" fontSize="sm">Nombre:</Text>
                              </HStack>
                              <Text fontWeight="medium">{patient.emergencyContact}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Phone size={14} color="#E53E3E" />
                                <Text color="gray.600" fontSize="sm">Teléfono:</Text>
                              </HStack>
                              <Text fontWeight="medium">{patient.emergencyPhone}</Text>
                            </HStack>
                          </VStack>
                        </Box>

                        <Divider />

                        {/* Additional Information */}
                        <Box>
                          <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                            Información Adicional
                          </Text>
                          <VStack spacing={4} align="stretch">
                            {patient.referredBy && (
                              <HStack justify="space-between">
                                <Text color="gray.600" fontSize="sm">Referido por:</Text>
                                <Text fontWeight="medium">{patient.referredBy}</Text>
                              </HStack>
                            )}
                            <HStack justify="space-between">
                              <Text color="gray.600" fontSize="sm">Fecha de Registro:</Text>
                              <Text fontWeight="medium">
                                {format(patient.registrationDate, 'dd MMMM yyyy', { locale: es })}
                              </Text>
                            </HStack>
                          </VStack>
                        </Box>

                        {/* Notes */}
                        {patient.notes && (
                          <>
                            <Divider />
                            <Box>
                              <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                                Notas
                              </Text>
                              <Card bg={cardBg}>
                                <CardBody>
                                  <Text fontSize="sm" lineHeight="1.6" color="gray.700">
                                    {patient.notes}
                                  </Text>
                                </CardBody>
                              </Card>
                            </Box>
                          </>
                        )}
                      </VStack>
                    </Grid>
                  </TabPanel>

                  {/* Appointments Tab */}
                  <TabPanel p={6}>
                    <PatientAppointments patientId={patient.id} />
                  </TabPanel>

                  {/* Medical History Tab */}
                  <TabPanel p={6}>
                    <PatientMedicalHistory patientId={patient.id} />
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
      </DashboardLayout>
    </AuthLayout>
  );
}