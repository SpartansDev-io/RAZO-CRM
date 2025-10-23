'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Divider,
  Avatar,
  Grid,
  GridItem,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  FileText,
  Users,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  maritalStatus?: string;
  educationLevel?: string;
  occupation?: string;
  reasonForTherapy?: string;
}

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export default function PatientProfileModal({
  isOpen,
  onClose,
  patient,
}: PatientProfileModalProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  if (!patient) return null;

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
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          <HStack spacing={3}>
            <User size={24} color="#3182CE" />
            <Text>Perfil del Paciente</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Patient Header */}
            <Card bg={cardBg}>
              <CardBody>
                <HStack spacing={4} align="center">
                  <Avatar size="lg" name={patient.name} bg="blue.500" />
                  <Box flex="1">
                    <HStack spacing={3} mb={2}>
                      <Text fontSize="xl" fontWeight="bold" color="gray.800">
                        {patient.name}
                      </Text>
                      <Badge
                        colorScheme={getStatusColor(patient.status)}
                        variant="solid"
                        px={3}
                        py={1}
                      >
                        {getStatusText(patient.status)}
                      </Badge>
                    </HStack>
                    <Text color="gray.600" fontSize="md">
                      {patient.age} años • {getGenderText(patient.gender)}
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      Paciente desde{' '}
                      {format(patient.registrationDate, 'MMMM yyyy', {
                        locale: es,
                      })}
                    </Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>

            {/* Statistics */}
            <Grid
              templateColumns="repeat(auto-fit, minmax(150px, 1fr))"
              gap={4}
            >
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel fontSize="xs" color="gray.600">
                      <HStack spacing={1}>
                        <Activity size={12} />
                        <Text>Total Sesiones</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber fontSize="2xl" color="blue.600">
                      {patient.totalSessions}
                    </StatNumber>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel fontSize="xs" color="gray.600">
                      <HStack spacing={1}>
                        <Clock size={12} />
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
            </Grid>

            {/* Contact Information */}
            <Box>
              <HStack spacing={3} mb={4}>
                <Mail size={20} color="#3182CE" />
                <Text fontSize="lg" fontWeight="semibold">
                  Información de Contacto
                </Text>
              </HStack>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Email
                  </Text>
                  <HStack spacing={2}>
                    <Mail size={16} color="#718096" />
                    <Text fontSize="sm" color="gray.800">
                      {patient.email}
                    </Text>
                  </HStack>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Teléfono
                  </Text>
                  <HStack spacing={2}>
                    <Phone size={16} color="#718096" />
                    <Text fontSize="sm" color="gray.800">
                      {patient.phone}
                    </Text>
                  </HStack>
                </Box>
              </Grid>
            </Box>

            <Divider />

            {/* Emergency Contact */}
            <Box>
              <HStack spacing={3} mb={4}>
                <AlertCircle size={20} color="#E53E3E" />
                <Text fontSize="lg" fontWeight="semibold">
                  Contacto de Emergencia
                </Text>
              </HStack>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Nombre
                  </Text>
                  <HStack spacing={2}>
                    <User size={16} color="#718096" />
                    <Text fontSize="sm" color="gray.800">
                      {patient.emergencyContact}
                    </Text>
                  </HStack>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Teléfono
                  </Text>
                  <HStack spacing={2}>
                    <Phone size={16} color="#718096" />
                    <Text fontSize="sm" color="gray.800">
                      {patient.emergencyPhone}
                    </Text>
                  </HStack>
                </Box>
              </Grid>
            </Box>

            <Divider />

            {/* Sociodemographic Information */}
            <Box>
              <HStack spacing={3} mb={4}>
                <Users size={20} color="#805AD5" />
                <Text fontSize="lg" fontWeight="semibold">
                  Datos Sociodemográficos
                </Text>
              </HStack>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                {patient.maritalStatus && (
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Estado Civil
                    </Text>
                    <Text fontSize="sm" color="gray.800" fontWeight="medium">
                      {patient.maritalStatus}
                    </Text>
                  </Box>
                )}
                {patient.educationLevel && (
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Nivel Educativo
                    </Text>
                    <Text fontSize="sm" color="gray.800" fontWeight="medium">
                      {patient.educationLevel}
                    </Text>
                  </Box>
                )}
                {patient.occupation && (
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Ocupación
                    </Text>
                    <Text fontSize="sm" color="gray.800" fontWeight="medium">
                      {patient.occupation}
                    </Text>
                  </Box>
                )}
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Empresa
                  </Text>
                  <Text fontSize="sm" color="gray.800" fontWeight="medium">
                    {patient.company}
                  </Text>
                </Box>
              </Grid>
            </Box>

            <Divider />

            {/* Therapy Information */}
            <Box>
              <HStack spacing={3} mb={4}>
                <FileText size={20} color="#38A169" />
                <Text fontSize="lg" fontWeight="semibold">
                  Información de Terapia
                </Text>
              </HStack>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Tipo de Terapia
                  </Text>
                  <Text fontSize="sm" color="gray.800" fontWeight="medium">
                    {patient.therapyType}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Fecha de Registro
                  </Text>
                  <HStack spacing={2}>
                    <Calendar size={16} color="#718096" />
                    <Text fontSize="sm" color="gray.800">
                      {format(patient.registrationDate, 'dd MMMM yyyy', {
                        locale: es,
                      })}
                    </Text>
                  </HStack>
                </Box>
              </Grid>
              {patient.reasonForTherapy && (
                <Box mt={4}>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Motivo de Consulta
                  </Text>
                  <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
                    <CardBody p={3}>
                      <Text fontSize="sm" lineHeight="1.6" color="gray.700">
                        {patient.reasonForTherapy}
                      </Text>
                    </CardBody>
                  </Card>
                </Box>
              )}
            </Box>

            {/* Quick Actions */}
            <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
              <CardBody>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="blue.700"
                  mb={3}
                >
                  Acciones Rápidas
                </Text>
                <Grid
                  templateColumns="repeat(auto-fit, minmax(150px, 1fr))"
                  gap={3}
                >
                  <Button
                    size="sm"
                    leftIcon={<Calendar size={14} />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => {
                      // Navigate to patient profile page
                      window.location.href = `/crm/patients/${patient.id}`;
                    }}
                  >
                    Ver Perfil Completo
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<FileText size={14} />}
                    colorScheme="green"
                    variant="outline"
                  >
                    Ver Historial
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<Phone size={14} />}
                    colorScheme="purple"
                    variant="outline"
                  >
                    Contactar
                  </Button>
                </Grid>
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button colorScheme="blue">Editar Paciente</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
