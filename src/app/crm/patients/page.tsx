'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Badge,
  Button,
  HStack,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  Flex,
  IconButton,
  useDisclosure,
  Spinner,
  Center,
} from '@chakra-ui/react';
import {
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AuthLayout } from '@/components/layout/auth-layout';
import DashboardLayout from '@/components/crm/layout/DashboardLayout';
import PatientProfileModal from '@/components/crm/patients/PatientProfileModal';
import NewPatientModal from '@/components/crm/patients/NewPatientModal';

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
}

// Mock patients data
const mockPatients: Patient[] = [
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
  },
  {
    id: '3',
    name: 'Ana López',
    email: 'ana.lopez@email.com',
    phone: '+34 688 345 678',
    age: 42,
    gender: 'F',
    status: 'inactive',
    lastSession: new Date('2023-12-20'),
    totalSessions: 15,
    registrationDate: new Date('2023-06-10'),
    therapyType: 'Terapia Familiar',
    company: 'Global Enterprises',
    emergencyContact: 'Pedro López',
    emergencyPhone: '+34 688 345 679',
  },
  {
    id: '4',
    name: 'Pedro Martínez',
    email: 'pedro.martinez@email.com',
    phone: '+34 699 456 789',
    age: 31,
    gender: 'M',
    status: 'pending',
    lastSession: null,
    totalSessions: 0,
    registrationDate: new Date('2024-01-10'),
    therapyType: 'Evaluación Inicial',
    company: 'StartUp Dynamics',
    emergencyContact: 'Laura Martínez',
    emergencyPhone: '+34 699 456 790',
  },
  {
    id: '5',
    name: 'Laura Fernández',
    email: 'laura.fernandez@email.com',
    phone: '+34 611 567 890',
    age: 26,
    gender: 'F',
    status: 'active',
    lastSession: new Date('2024-01-12'),
    totalSessions: 6,
    registrationDate: new Date('2023-10-05'),
    therapyType: 'Terapia Individual',
    company: 'TechCorp Solutions',
    emergencyContact: 'Miguel Fernández',
    emergencyPhone: '+34 611 567 891',
  },
  {
    id: '6',
    name: 'Miguel Santos',
    email: 'miguel.santos@email.com',
    phone: '+34 622 678 901',
    age: 39,
    gender: 'M',
    status: 'active',
    lastSession: new Date('2024-01-13'),
    totalSessions: 20,
    registrationDate: new Date('2023-04-15'),
    therapyType: 'Terapia Individual',
    company: 'Innovate Industries',
    emergencyContact: 'Carmen Santos',
    emergencyPhone: '+34 622 678 902',
  },
  {
    id: '7',
    name: 'Carmen Ruiz',
    email: 'carmen.ruiz@email.com',
    phone: '+34 633 789 012',
    age: 45,
    gender: 'F',
    status: 'inactive',
    lastSession: new Date('2023-11-30'),
    totalSessions: 10,
    registrationDate: new Date('2023-07-20'),
    therapyType: 'Terapia de Pareja',
    company: 'Global Enterprises',
    emergencyContact: 'José Ruiz',
    emergencyPhone: '+34 633 789 013',
  },
  {
    id: '8',
    name: 'David Torres',
    email: 'david.torres@email.com',
    phone: '+34 644 890 123',
    age: 33,
    gender: 'M',
    status: 'active',
    lastSession: new Date('2024-01-11'),
    totalSessions: 4,
    registrationDate: new Date('2023-12-01'),
    therapyType: 'Terapia Grupal',
    company: 'StartUp Dynamics',
    emergencyContact: 'Elena Torres',
    emergencyPhone: '+34 644 890 124',
  },
];

const ITEMS_PER_PAGE = 5;

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [therapyFilter, setTherapyFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isNewPatientOpen,
    onOpen: onNewPatientOpen,
    onClose: onNewPatientClose,
  } = useDisclosure();

  // Filter and search logic
  const filteredPatients = useMemo(() => {
    return mockPatients.filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm);

      const matchesStatus =
        statusFilter === 'all' || patient.status === statusFilter;
      const matchesTherapy =
        therapyFilter === 'all' || patient.therapyType === therapyFilter;
      const matchesCompany =
        companyFilter === 'all' || patient.company === companyFilter;

      return matchesSearch && matchesStatus && matchesTherapy && matchesCompany;
    });
  }, [searchTerm, statusFilter, therapyFilter, companyFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPatients = filteredPatients.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Get unique therapy types for filter
  const therapyTypes = Array.from(
    new Set(mockPatients.map((p) => p.therapyType)),
  );
  const companies = Array.from(new Set(mockPatients.map((p) => p.company)));

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

  const handleViewProfile = (patient: Patient) => {
    setSelectedPatient(patient);
    onOpen();
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Box>
              <HStack spacing={3} mb={2}>
                <Users size={24} color="#3182CE" />
                <Heading size="lg" color="gray.800">
                  Gestión de Pacientes
                </Heading>
              </HStack>
              <Text color="gray.600">
                Administra la información de tus pacientes
              </Text>
            </Box>
            <Button
              leftIcon={<UserPlus size={20} />}
              colorScheme="blue"
              size="lg"
              onClick={onNewPatientOpen}
            >
              Nuevo Paciente
            </Button>
          </Flex>

          {/* Filters */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex
                  direction={{ base: 'column', md: 'row' }}
                  gap={4}
                  align={{ base: 'stretch', md: 'center' }}
                >
                  {/* Search */}
                  <InputGroup flex="1" maxW={{ base: 'full', md: '400px' }}>
                    <InputLeftElement>
                      <Search size={16} color="#718096" />
                    </InputLeftElement>
                    <Input
                      placeholder="Buscar por nombre, email o teléfono..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleFilterChange();
                      }}
                    />
                  </InputGroup>

                  <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                    {/* Status Filter */}
                    <Select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        handleFilterChange();
                      }}
                      maxW={{ base: 'full', md: '150px' }}
                    >
                      <option value="all">Todos los estados</option>
                      <option value="active">Activos</option>
                      <option value="inactive">Inactivos</option>
                      <option value="pending">Pendientes</option>
                    </Select>

                    {/* Company Filter */}
                    <Select
                      value={companyFilter}
                      onChange={(e) => {
                        setCompanyFilter(e.target.value);
                        handleFilterChange();
                      }}
                      maxW={{ base: 'full', md: '180px' }}
                    >
                      <option value="all">Todas las empresas</option>
                      {companies.map((company) => (
                        <option key={company} value={company}>
                          {company}
                        </option>
                      ))}
                    </Select>

                    {/* Therapy Type Filter */}
                    <Select
                      value={therapyFilter}
                      onChange={(e) => {
                        setTherapyFilter(e.target.value);
                        handleFilterChange();
                      }}
                      maxW={{ base: 'full', md: '180px' }}
                    >
                      <option value="all">Todos los tipos</option>
                      {therapyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Select>
                  </Flex>
                </Flex>

                {/* Results count */}
                <Text fontSize="sm" color="gray.600">
                  Mostrando {paginatedPatients.length} de{' '}
                  {filteredPatients.length} pacientes
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Patients Table */}
          <Card>
            <CardBody p={0}>
              {isLoading ? (
                <Center py={10}>
                  <Spinner size="lg" color="blue.500" />
                </Center>
              ) : paginatedPatients.length === 0 ? (
                <Center py={10}>
                  <VStack spacing={3}>
                    <Users size={48} color="#CBD5E0" />
                    <Text color="gray.500" fontSize="lg">
                      No se encontraron pacientes
                    </Text>
                    <Text color="gray.400" fontSize="sm">
                      Intenta ajustar los filtros de búsqueda
                    </Text>
                  </VStack>
                </Center>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Paciente</Th>
                        <Th>Empresa</Th>
                        <Th>Contacto</Th>
                        <Th>Estado</Th>
                        <Th>Tipo de Terapia</Th>
                        <Th>Última Sesión</Th>
                        <Th>Total Sesiones</Th>
                        <Th>Acciones</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {paginatedPatients.map((patient) => (
                        <Tr key={patient.id} _hover={{ bg: 'gray.50' }}>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar
                                size="sm"
                                name={patient.name}
                                bg="blue.500"
                              />
                              <Box>
                                <Text fontWeight="medium" fontSize="sm">
                                  {patient.name}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {patient.age} años •{' '}
                                  {patient.gender === 'M'
                                    ? 'Masculino'
                                    : patient.gender === 'F'
                                      ? 'Femenino'
                                      : 'Otro'}
                                </Text>
                              </Box>
                            </HStack>
                          </Td>
                          <Td>
                            <Text
                              fontSize="sm"
                              color="gray.700"
                              fontWeight="medium"
                            >
                              {patient.company}
                            </Text>
                          </Td>
                          <Td>
                            <VStack spacing={1} align="start">
                              <HStack spacing={1}>
                                <Mail size={12} color="#718096" />
                                <Text fontSize="xs" color="gray.600">
                                  {patient.email}
                                </Text>
                              </HStack>
                              <HStack spacing={1}>
                                <Phone size={12} color="#718096" />
                                <Text fontSize="xs" color="gray.600">
                                  {patient.phone}
                                </Text>
                              </HStack>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getStatusColor(patient.status)}
                              variant="subtle"
                              fontSize="xs"
                            >
                              {getStatusText(patient.status)}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.700">
                              {patient.therapyType}
                            </Text>
                          </Td>
                          <Td>
                            {patient.lastSession ? (
                              <VStack spacing={0} align="start">
                                <Text fontSize="sm" color="gray.700">
                                  {format(patient.lastSession, 'dd/MM/yyyy', {
                                    locale: es,
                                  })}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {format(patient.lastSession, 'HH:mm')}
                                </Text>
                              </VStack>
                            ) : (
                              <Text fontSize="sm" color="gray.400">
                                Sin sesiones
                              </Text>
                            )}
                          </Td>
                          <Td>
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              color="blue.600"
                            >
                              {patient.totalSessions}
                            </Text>
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              leftIcon={<Eye size={14} />}
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => handleViewProfile(patient)}
                            >
                              Ver Perfil
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <CardBody>
                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" color="gray.600">
                    Página {currentPage} de {totalPages}
                  </Text>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Página anterior"
                      icon={<ChevronLeft size={16} />}
                      size="sm"
                      variant="outline"
                      isDisabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    />

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum =
                        Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                        i;
                      if (pageNum > totalPages) return null;

                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={
                            currentPage === pageNum ? 'solid' : 'outline'
                          }
                          colorScheme={
                            currentPage === pageNum ? 'blue' : 'gray'
                          }
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <IconButton
                      aria-label="Página siguiente"
                      icon={<ChevronRight size={16} />}
                      size="sm"
                      variant="outline"
                      isDisabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    />
                  </HStack>
                </Flex>
              </CardBody>
            </Card>
          )}
        </VStack>

        {/* Patient Profile Modal */}
        <PatientProfileModal
          isOpen={isOpen}
          onClose={onClose}
          patient={selectedPatient}
        />

        {/* New Patient Modal */}
        <NewPatientModal
          isOpen={isNewPatientOpen}
          onClose={onNewPatientClose}
        />
      </DashboardLayout>
    </AuthLayout>
  );
}
