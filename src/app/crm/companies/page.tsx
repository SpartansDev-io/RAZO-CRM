'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  Grid,
  HStack,
  Button,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Building2,
  Plus,
  Search,
  Mail,
  Users as UsersIcon,
  FileText,
} from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import DashboardLayout from '@/components/crm/layout/DashboardLayout';
import CompanyCard from '@/components/crm/companies/CompanyCard';
import QuickActionButton from '@/components/crm/companies/QuickActionButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CompaniesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const inputBg = useColorModeValue('white', 'gray.800');

  const mockCompanies = [
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
    },
    {
      id: '2',
      name: 'Consultoría Empresarial',
      email: 'info@consultoria.com',
      phone: '+52 55 8765 4321',
      address: 'Polanco 456, CDMX',
      website: 'www.consultoria.com',
      industry: 'Consultoría',
      employeeCount: 8,
      isActive: true,
    },
    {
      id: '3',
      name: 'Desarrollo Web MX',
      email: 'hola@desarrolloweb.mx',
      phone: '+52 55 9876 5432',
      address: 'Santa Fe 789, CDMX',
      website: 'www.desarrolloweb.mx',
      industry: 'Desarrollo de Software',
      employeeCount: 22,
      isActive: true,
    },
    {
      id: '4',
      name: 'Marketing Digital Pro',
      email: 'ventas@marketingpro.com',
      phone: '+52 55 5555 1234',
      address: 'Condesa 321, CDMX',
      website: 'www.marketingpro.com',
      industry: 'Marketing',
      employeeCount: 12,
      isActive: false,
    },
    {
      id: '5',
      name: 'Recursos Humanos Plus',
      email: 'contacto@rhplus.com',
      phone: '+52 55 4444 9876',
      address: 'Roma Norte 654, CDMX',
      website: 'www.rhplus.com',
      industry: 'Recursos Humanos',
      employeeCount: 5,
      isActive: true,
    },
    {
      id: '6',
      name: 'Finanzas Corporativas',
      email: 'info@finanzascorp.com',
      phone: '+52 55 3333 7777',
      address: 'Insurgentes 987, CDMX',
      website: 'www.finanzascorp.com',
      industry: 'Finanzas',
      employeeCount: 18,
      isActive: true,
    },
  ];

  const filteredCompanies = mockCompanies.filter((company) => {
    const matchesSearch = company.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && company.isActive) ||
      (filterStatus === 'inactive' && !company.isActive);
    return matchesSearch && matchesStatus;
  });

  const totalEmployees = mockCompanies.reduce(
    (sum, company) => sum + company.employeeCount,
    0
  );
  const activeCompanies = mockCompanies.filter((c) => c.isActive).length;

  return (
    <AuthLayout>
      <DashboardLayout>
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="lg" color="gray.800" mb={2}>
              Empresas
            </Heading>
            <Text color="gray.600">
              Gestiona las empresas asociadas al CRM
            </Text>
          </Box>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
            <QuickActionButton
              icon={Plus}
              label="Nueva Empresa"
              color="blue"
              onClick={() => router.push('/crm/companies/new')}
            />
            <QuickActionButton
              icon={Mail}
              label="Enviar Comunicado"
              color="green"
              onClick={() => console.log('Enviar comunicado')}
            />
            <QuickActionButton
              icon={FileText}
              label="Generar Reporte"
              color="orange"
              onClick={() => console.log('Generar reporte')}
            />
          </Grid>

          <Box
            p={6}
            bg={inputBg}
            borderRadius="lg"
            shadow="sm"
            border="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
          >
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
              gap={4}
              mb={4}
            >
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                  Total de Empresas
                </Text>
                <HStack>
                  <Building2 size={20} color="#2196F3" />
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {mockCompanies.length}
                  </Text>
                </HStack>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                  Empresas Activas
                </Text>
                <HStack>
                  <Building2 size={20} color="#4CAF50" />
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {activeCompanies}
                  </Text>
                </HStack>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                  Total Empleados
                </Text>
                <HStack>
                  <UsersIcon size={20} color="#FF9800" />
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {totalEmployees}
                  </Text>
                </HStack>
              </Box>
            </Grid>
          </Box>

          <HStack spacing={4}>
            <InputGroup flex="1">
              <InputLeftElement pointerEvents="none">
                <Search size={18} color="gray" />
              </InputLeftElement>
              <Input
                placeholder="Buscar empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={inputBg}
              />
            </InputGroup>
            <Select
              w="200px"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              bg={inputBg}
            >
              <option value="all">Todas</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </Select>
            <Button
              leftIcon={<Plus size={18} />}
              colorScheme="blue"
              onClick={() => router.push('/crm/companies/new')}
            >
              Nueva Empresa
            </Button>
          </HStack>

          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={6}
          >
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                id={company.id}
                name={company.name}
                email={company.email}
                phone={company.phone}
                address={company.address}
                website={company.website}
                industry={company.industry}
                employeeCount={company.employeeCount}
                isActive={company.isActive}
                onViewDetails={(id) => console.log('Ver detalles:', id)}
                onEdit={(id) => console.log('Editar empresa:', id)}
                onDelete={(id) => console.log('Eliminar empresa:', id)}
                onAddEmployee={(id) => console.log('Agregar empleado a:', id)}
                onViewEmployees={(id) => console.log('Ver empleados de:', id)}
                onGenerateReport={(id) => console.log('Generar reporte de:', id)}
              />
            ))}
          </Grid>

          {filteredCompanies.length === 0 && (
            <Box textAlign="center" py={10}>
              <Building2 size={48} color="gray" style={{ margin: '0 auto' }} />
              <Text fontSize="lg" color="gray.500" mt={4}>
                No se encontraron empresas
              </Text>
              <Text fontSize="sm" color="gray.400">
                Intenta con otros términos de búsqueda o filtros
              </Text>
            </Box>
          )}
        </VStack>
      </DashboardLayout>
    </AuthLayout>
  );
}
