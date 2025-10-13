'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import ContractsList from '@/components/crm/companies/ContractsList';
import ContractModal from '@/components/crm/companies/ContractModal';
import ViewContractModal from '@/components/crm/companies/ViewContractModal';
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import {
  Building2,
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  TrendingUp,
  Calendar,
  FileText,
  UserPlus,
  Activity,
  DollarSign,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AuthLayout } from '@/components/layout/auth-layout';
import DashboardLayout from '@/components/crm/layout/DashboardLayout';

interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  industry?: string;
  employeeCount: number;
  isActive: boolean;
  registrationDate: Date;
  contactPerson?: string;
  taxId?: string;
  notes?: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  startDate: Date;
  status: 'active' | 'inactive';
  totalSessions: number;
  lastSession?: Date;
}

const getMockCompany = (id: string): Company | null => {
  const companies: Company[] = [
    {
      id: '1',
      name: 'Tech Solutions SA',
      email: 'contacto@techsolutions.com',
      phone: '+52 55 1234 5678',
      address: 'Av. Reforma 123, CDMX',
      website: 'www.techsolutions.com',
      industry: 'Tecnología',
      employeeCount: 15,
      isActive: true,
      registrationDate: new Date('2023-01-15'),
      contactPerson: 'Juan Pérez',
      taxId: 'TES230115XXX',
      notes: 'Cliente corporativo prioritario. Renovación de contrato en diciembre.',
    },
    {
      id: '2',
      name: 'Innovate Industries',
      email: 'info@innovate.mx',
      phone: '+52 55 9876 5432',
      address: 'Insurgentes Sur 456, CDMX',
      website: 'www.innovate.mx',
      industry: 'Manufactura',
      employeeCount: 8,
      isActive: true,
      registrationDate: new Date('2023-03-20'),
      contactPerson: 'María García',
      taxId: 'INN230320YYY',
      notes: 'Empresa mediana enfocada en bienestar laboral.',
    },
  ];

  return companies.find(c => c.id === id) || null;
};

const getMockEmployees = (companyId: string): Employee[] => {
  return [
    {
      id: '1',
      name: 'María González',
      email: 'maria.gonzalez@email.com',
      position: 'Desarrolladora Senior',
      department: 'Tecnología',
      startDate: new Date('2023-02-10'),
      status: 'active',
      totalSessions: 12,
      lastSession: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      position: 'Gerente de Proyectos',
      department: 'Administración',
      startDate: new Date('2023-02-15'),
      status: 'active',
      totalSessions: 8,
      lastSession: new Date('2024-01-14'),
    },
    {
      id: '3',
      name: 'Ana López',
      email: 'ana.lopez@email.com',
      position: 'Diseñadora UX',
      department: 'Diseño',
      startDate: new Date('2023-03-01'),
      status: 'active',
      totalSessions: 15,
      lastSession: new Date('2024-01-16'),
    },
    {
      id: '4',
      name: 'Pedro Martínez',
      email: 'pedro.martinez@email.com',
      position: 'Analista de Datos',
      department: 'Tecnología',
      startDate: new Date('2023-04-10'),
      status: 'active',
      totalSessions: 6,
      lastSession: new Date('2024-01-10'),
    },
  ];
};

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const company = getMockCompany(companyId);
  const employees = getMockEmployees(companyId);

  const [activeTab, setActiveTab] = useState(0);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingContract, setViewingContract] = useState<any>(null);
  const toast = useToast();
  const cancelRef = useState<any>(null)[0];

  const handleNewContract = () => {
    setSelectedContract(null);
    setIsContractModalOpen(true);
  };

  const handleEditContract = (contract: any) => {
    setSelectedContract(contract);
    setIsContractModalOpen(true);
  };

  const handleDeleteContract = (contractId: string) => {
    setContractToDelete(contractId);
  };

  const confirmDeleteContract = async () => {
    if (!contractToDelete) return;

    try {
      console.log('Deleting contract:', contractToDelete);

      toast({
        title: 'Contrato eliminado',
        description: 'El contrato se ha eliminado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setContractToDelete(null);
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el contrato',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleViewContract = (contract: any) => {
    setViewingContract(contract);
    setIsViewModalOpen(true);
  };

  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (!company) {
    return (
      <AuthLayout>
        <DashboardLayout>
          <VStack spacing={6} align="center" justify="center" minH="400px">
            <Building2 size={64} color="#CBD5E0" />
            <Text fontSize="xl" color="gray.500">
              Empresa no encontrada
            </Text>
            <Button leftIcon={<ArrowLeft size={16} />} onClick={() => router.back()}>
              Volver
            </Button>
          </VStack>
        </DashboardLayout>
      </AuthLayout>
    );
  }

  const mockStats = {
    totalSessions: 145,
    activeCases: 8,
    completedCases: 23,
    averageSatisfaction: 4.7,
    monthlyInvestment: 45000,
    utilizationRate: 78,
  };

  const recentActivity = [
    {
      id: '1',
      type: 'session',
      description: 'Nueva sesión registrada - María González',
      date: new Date('2024-01-15'),
    },
    {
      id: '2',
      type: 'employee',
      description: 'Nuevo empleado agregado - Pedro Martínez',
      date: new Date('2024-01-14'),
    },
    {
      id: '3',
      type: 'case',
      description: 'Caso completado - Carlos Rodríguez',
      date: new Date('2024-01-13'),
    },
  ];

  return (
    <AuthLayout>
      <DashboardLayout>
        <VStack spacing={6} align="stretch">
          <HStack spacing={4}>
            <IconButton
              aria-label="Volver"
              icon={<ArrowLeft size={20} />}
              variant="ghost"
              onClick={() => router.back()}
            />
            <Box>
              <Heading size="lg" color="gray.800">
                Perfil de Empresa
              </Heading>
              <Text color="gray.600">
                Información completa y estadísticas
              </Text>
            </Box>
          </HStack>

          <Card bg={bg} shadow="md">
            <CardBody p={6}>
              <VStack spacing={6} align="stretch">
                <Flex
                  direction={{ base: 'column', md: 'row' }}
                  align={{ base: 'center', md: 'flex-start' }}
                  gap={6}
                >
                  <HStack spacing={6} flex="1">
                    <Avatar
                      size="2xl"
                      name={company.name}
                      bg="blue.500"
                      icon={<Building2 size={40} />}
                    />
                    <VStack spacing={2} align="start">
                      <HStack spacing={3}>
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                          {company.name}
                        </Text>
                        <Badge
                          colorScheme={company.isActive ? 'green' : 'red'}
                          variant="solid"
                          px={3}
                          py={1}
                          fontSize="sm"
                        >
                          {company.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </HStack>
                      <HStack spacing={4}>
                        {company.industry && (
                          <Badge colorScheme="blue" fontSize="sm">
                            {company.industry}
                          </Badge>
                        )}
                        <HStack spacing={1}>
                          <Users size={14} color="#718096" />
                          <Text fontSize="sm" color="gray.600">
                            {company.employeeCount} empleados
                          </Text>
                        </HStack>
                      </HStack>
                      <Text color="gray.500" fontSize="sm">
                        Cliente desde {format(company.registrationDate, 'MMMM yyyy', { locale: es })}
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={3} flexWrap="wrap" justify={{ base: 'center', md: 'flex-end' }}>
                    <Button
                      leftIcon={<UserPlus size={16} />}
                      colorScheme="blue"
                      size="md"
                    >
                      Agregar Empleado
                    </Button>
                    <Button
                      leftIcon={<Edit size={16} />}
                      variant="outline"
                      size="md"
                    >
                      Editar Empresa
                    </Button>
                  </HStack>
                </Flex>

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
                          {mockStats.totalSessions}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          +12% vs mes anterior
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg}>
                    <CardBody>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">
                          <HStack spacing={1}>
                            <FileText size={14} />
                            <Text>Casos Activos</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="2xl" color="orange.600">
                          {mockStats.activeCases}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          {mockStats.completedCases} completados
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg}>
                    <CardBody>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">
                          <HStack spacing={1}>
                            <TrendingUp size={14} />
                            <Text>Satisfacción</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="2xl" color="green.600">
                          {mockStats.averageSatisfaction}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          / 5.0 estrellas
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg}>
                    <CardBody>
                      <Stat>
                        <StatLabel fontSize="sm" color="gray.600">
                          <HStack spacing={1}>
                            <DollarSign size={14} />
                            <Text>Inversión Mensual</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="2xl" color="purple.600">
                          ${mockStats.monthlyInvestment.toLocaleString()}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          MXN / mes
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </Grid>

                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                          Tasa de Utilización del Servicio
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="blue.600">
                          {mockStats.utilizationRate}%
                        </Text>
                      </HStack>
                      <Progress
                        value={mockStats.utilizationRate}
                        colorScheme="blue"
                        size="lg"
                        borderRadius="full"
                      />
                      <Text fontSize="xs" color="gray.500">
                        {Math.round((mockStats.utilizationRate / 100) * company.employeeCount)} de {company.employeeCount} empleados han usado el servicio
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={bg} shadow="md">
            <CardBody p={0}>
              <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
                <TabList>
                  <Tab>
                    <HStack spacing={2}>
                      <Building2 size={16} />
                      <Text>Información General</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <FileText size={16} />
                      <Text>Contratos</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <Users size={16} />
                      <Text>Empleados ({employees.length})</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <Activity size={16} />
                      <Text>Actividad Reciente</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  <TabPanel p={6}>
                    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
                      <VStack spacing={6} align="stretch">
                        <Box>
                          <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                            Datos de Contacto
                          </Text>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Mail size={14} color="#718096" />
                                <Text color="gray.600" fontSize="sm">Email:</Text>
                              </HStack>
                              <Text fontWeight="medium">{company.email}</Text>
                            </HStack>
                            {company.phone && (
                              <HStack justify="space-between">
                                <HStack spacing={2}>
                                  <Phone size={14} color="#718096" />
                                  <Text color="gray.600" fontSize="sm">Teléfono:</Text>
                                </HStack>
                                <Text fontWeight="medium">{company.phone}</Text>
                              </HStack>
                            )}
                            {company.website && (
                              <HStack justify="space-between">
                                <HStack spacing={2}>
                                  <Globe size={14} color="#718096" />
                                  <Text color="gray.600" fontSize="sm">Sitio Web:</Text>
                                </HStack>
                                <Text fontWeight="medium" color="blue.600">    
                                  {company.website}
                                </Text>
                              </HStack>
                            )}
                            {company.address && (
                              <HStack justify="space-between">
                                <HStack spacing={2}>
                                  <MapPin size={14} color="#718096" />
                                  <Text color="gray.600" fontSize="sm">Dirección:</Text>
                                </HStack>
                                <Text fontWeight="medium">
                                  {company.address}
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                        </Box>

                        <Divider />

                        <Box>
                          <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                            Información Corporativa
                          </Text>
                          <VStack spacing={4} align="stretch">
                            {company.contactPerson && (
                              <HStack justify="space-between">
                                <Text color="gray.600" fontSize="sm">Persona de Contacto:</Text>
                                <Text fontWeight="medium">{company.contactPerson}</Text>
                              </HStack>
                            )}
                            {company.taxId && (
                              <HStack justify="space-between">
                                <Text color="gray.600" fontSize="sm">RFC:</Text>
                                <Text fontWeight="medium">{company.taxId}</Text>
                              </HStack>
                            )}
                            <HStack justify="space-between">
                              <Text color="gray.600" fontSize="sm">Fecha de Registro:</Text>
                              <Text fontWeight="medium">
                                {format(company.registrationDate, 'dd MMMM yyyy', { locale: es })}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.600" fontSize="sm">Empleados Registrados:</Text>
                              <Text fontWeight="medium">{company.employeeCount}</Text>
                            </HStack>
                          </VStack>
                        </Box>
                      </VStack>

                      <VStack spacing={6} align="stretch">
                        {company.notes && (
                          <Box>
                            <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                              Notas
                            </Text>
                            <Card bg={cardBg}>
                              <CardBody>
                                <Text fontSize="sm" lineHeight="1.6" color="gray.700">
                                  {company.notes}
                                </Text>
                              </CardBody>
                            </Card>
                          </Box>
                        )}

                        <Box>
                          <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                            Acciones Rápidas
                          </Text>
                          <VStack spacing={3} align="stretch">
                            <Button
                              leftIcon={<FileText size={16} />}
                              colorScheme="blue"
                              variant="outline"
                              justifyContent="flex-start"
                            >
                              Generar Reporte Mensual
                            </Button>
                            <Button
                              leftIcon={<Calendar size={16} />}
                              colorScheme="green"
                              variant="outline"
                              justifyContent="flex-start"
                            >
                              Agendar Reunión de Seguimiento
                            </Button>
                            <Button
                              leftIcon={<Mail size={16} />}
                              colorScheme="purple"
                              variant="outline"
                              justifyContent="flex-start"
                            >
                              Enviar Encuesta de Satisfacción
                            </Button>
                            <Button
                              leftIcon={<DollarSign size={16} />}
                              colorScheme="orange"
                              variant="outline"
                              justifyContent="flex-start"
                            >
                              Ver Facturación
                            </Button>
                          </VStack>
                        </Box>
                      </VStack>
                    </Grid>
                  </TabPanel>

                  <TabPanel p={6}>
                    <ContractsList
                      companyId={company.id}
                      onNewContract={handleNewContract}
                      onEditContract={handleEditContract}
                      onDeleteContract={handleDeleteContract}
                      onViewContract={handleViewContract}
                    />
                  </TabPanel>

                  <TabPanel p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                          Lista de Empleados
                        </Text>
                        <Button
                          size="sm"
                          leftIcon={<UserPlus size={16} />}
                          colorScheme="blue"
                        >
                          Agregar Empleado
                        </Button>
                      </HStack>

                      <Box overflowX="auto">
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Empleado</Th>
                              <Th>Puesto</Th>
                              <Th>Departamento</Th>
                              <Th>Sesiones</Th>
                              <Th>Última Sesión</Th>
                              <Th>Estado</Th>
                              <Th>Acciones</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {employees.map((employee) => (
                              <Tr key={employee.id}>
                                <Td>
                                  <HStack spacing={3}>
                                    <Avatar size="sm" name={employee.name} />
                                    <Box>
                                      <Text fontSize="sm" fontWeight="medium" color="gray.800">
                                        {employee.name}
                                      </Text>
                                      <Text fontSize="xs" color="gray.500">
                                        {employee.email}
                                      </Text>
                                    </Box>
                                  </HStack>
                                </Td>
                                <Td>
                                  <Text fontSize="sm" color="gray.700">
                                    {employee.position}
                                  </Text>
                                </Td>
                                <Td>
                                  <Text fontSize="sm" color="gray.700">
                                    {employee.department}
                                  </Text>
                                </Td>
                                <Td>
                                  <Badge colorScheme="blue" fontSize="xs">
                                    {employee.totalSessions}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Text fontSize="sm" color="gray.700">
                                    {employee.lastSession
                                      ? format(employee.lastSession, 'dd/MM/yyyy', { locale: es })
                                      : 'Sin sesiones'}
                                  </Text>
                                </Td>
                                <Td>
                                  <Badge
                                    colorScheme={employee.status === 'active' ? 'green' : 'red'}
                                    fontSize="xs"
                                  >
                                    {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => router.push(`/crm/patients/${employee.id}`)}
                                  >
                                    Ver Perfil
                                  </Button>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </VStack>
                  </TabPanel>

                  <TabPanel p={6}>
                    <VStack spacing={4} align="stretch">
                      <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                        Actividad Reciente
                      </Text>

                      <VStack spacing={3} align="stretch">
                        {recentActivity.map((activity) => (
                          <Card key={activity.id} bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                            <CardBody>
                              <HStack spacing={4} align="start">
                                <Box
                                  p={2}
                                  borderRadius="full"
                                  bg={
                                    activity.type === 'session'
                                      ? 'blue.100'
                                      : activity.type === 'employee'
                                      ? 'green.100'
                                      : 'purple.100'
                                  }
                                >
                                  {activity.type === 'session' ? (
                                    <Activity size={16} color="#3182CE" />
                                  ) : activity.type === 'employee' ? (
                                    <UserPlus size={16} color="#38A169" />
                                  ) : (
                                    <FileText size={16} color="#805AD5" />
                                  )}
                                </Box>
                                <Box flex="1">
                                  <Text fontSize="sm" fontWeight="medium" color="gray.800">
                                    {activity.description}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500" mt={1}>
                                    {format(activity.date, "dd MMMM yyyy 'a las' HH:mm", { locale: es })}
                                  </Text>
                                </Box>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>

        <ContractModal
          isOpen={isContractModalOpen}
          onClose={() => setIsContractModalOpen(false)}
          contract={selectedContract}
          companyId={company.id}
        />

        <ViewContractModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          contract={viewingContract}
        />

        <AlertDialog
          isOpen={!!contractToDelete}
          leastDestructiveRef={cancelRef}
          onClose={() => setContractToDelete(null)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Eliminar Contrato
              </AlertDialogHeader>

              <AlertDialogBody>
                ¿Estás seguro de que deseas eliminar este contrato? Esta acción no se puede deshacer.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setContractToDelete(null)}>
                  Cancelar
                </Button>
                <Button colorScheme="red" onClick={confirmDeleteContract} ml={3}>
                  Eliminar
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </DashboardLayout>
    </AuthLayout>
  );
}
