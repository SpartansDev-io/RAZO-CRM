'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Grid,
  GridItem,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  Spinner,
  Center,
  Divider,
  Tooltip,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import {
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Building2,
  Users,
  BarChart3,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { AuthLayout } from '@/components/layout/auth-layout';
import DashboardLayout from '@/components/crm/layout/DashboardLayout';
import ViewMonthlyReportModal from '@/components/crm/companies/ViewMonthlyReportModal';

interface MonthlyReport {
  id: string;
  contractId: string;
  contractName: string;
  companyId: string;
  companyName: string;
  reportMonth: number;
  reportYear: number;
  totalSessions: number;
  totalPatients: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid';
  generatedAt: Date;
  paidAt?: Date;
  paidBy?: string;
  paymentReference?: string;
  paymentMethod?: 'transfer' | 'cash' | 'check';
}

// Mock data - replace with actual API call
const getMockReports = (): MonthlyReport[] => {
  return [
    {
      id: '1',
      contractId: 'c1',
      contractName: 'Contrato Anual 2024',
      companyId: 'comp1',
      companyName: 'TechCorp Solutions',
      reportMonth: 12,
      reportYear: 2024,
      totalSessions: 5,
      totalPatients: 3,
      totalAmount: 7500,
      paymentStatus: 'paid',
      generatedAt: new Date('2025-01-05'),
      paidAt: new Date('2025-01-10'),
      paidBy: 'Admin User',
      paymentReference: 'TRANS-20250110-001',
      paymentMethod: 'transfer',
    },
    {
      id: '2',
      contractId: 'c1',
      contractName: 'Contrato Anual 2024',
      companyId: 'comp1',
      companyName: 'TechCorp Solutions',
      reportMonth: 11,
      reportYear: 2024,
      totalSessions: 8,
      totalPatients: 4,
      totalAmount: 12000,
      paymentStatus: 'paid',
      generatedAt: new Date('2024-12-05'),
      paidAt: new Date('2024-12-15'),
      paidBy: 'Admin User',
      paymentReference: 'TRANS-20241215-002',
      paymentMethod: 'transfer',
    },
    {
      id: '3',
      contractId: 'c2',
      contractName: 'Contrato Bienestar 2024',
      companyId: 'comp2',
      companyName: 'Innovate Industries',
      reportMonth: 12,
      reportYear: 2024,
      totalSessions: 6,
      totalPatients: 3,
      totalAmount: 9000,
      paymentStatus: 'pending',
      generatedAt: new Date('2025-01-05'),
    },
    {
      id: '4',
      contractId: 'c3',
      contractName: 'Programa de Salud Mental',
      companyId: 'comp3',
      companyName: 'Global Enterprises',
      reportMonth: 12,
      reportYear: 2024,
      totalSessions: 10,
      totalPatients: 5,
      totalAmount: 15000,
      paymentStatus: 'pending',
      generatedAt: new Date('2025-01-06'),
    },
    {
      id: '5',
      contractId: 'c2',
      contractName: 'Contrato Bienestar 2024',
      companyId: 'comp2',
      companyName: 'Innovate Industries',
      reportMonth: 11,
      reportYear: 2024,
      totalSessions: 7,
      totalPatients: 4,
      totalAmount: 10500,
      paymentStatus: 'paid',
      generatedAt: new Date('2024-12-05'),
      paidAt: new Date('2024-12-20'),
      paidBy: 'Admin User',
      paymentReference: 'TRANS-20241220-003',
      paymentMethod: 'transfer',
    },
    {
      id: '6',
      contractId: 'c4',
      contractName: 'Contrato Trimestral Q4',
      companyId: 'comp4',
      companyName: 'StartUp Dynamics',
      reportMonth: 10,
      reportYear: 2024,
      totalSessions: 4,
      totalPatients: 2,
      totalAmount: 6000,
      paymentStatus: 'paid',
      generatedAt: new Date('2024-11-05'),
      paidAt: new Date('2024-11-08'),
      paidBy: 'Admin User',
      paymentReference: 'TRANS-20241108-004',
      paymentMethod: 'cash',
    },
  ];
};

export default function ReportsPage() {
  const [reports, setReports] = useState<MonthlyReport[]>(getMockReports());
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.contractName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || report.paymentStatus === statusFilter;
      const matchesCompany = companyFilter === 'all' || report.companyId === companyFilter;
      const matchesMonth = monthFilter === 'all' || report.reportMonth === parseInt(monthFilter);
      const matchesYear = yearFilter === 'all' || report.reportYear === parseInt(yearFilter);

      return matchesSearch && matchesStatus && matchesCompany && matchesMonth && matchesYear;
    });
  }, [reports, searchTerm, statusFilter, companyFilter, monthFilter, yearFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const paidReports = filteredReports.filter((r) => r.paymentStatus === 'paid');
    const pendingReports = filteredReports.filter((r) => r.paymentStatus === 'pending');

    const totalPaid = paidReports.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalPending = pendingReports.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalSessions = filteredReports.reduce((sum, r) => sum + r.totalSessions, 0);
    const totalPatients = new Set(filteredReports.flatMap(() => [])).size; // Would need patient IDs

    // Compare with previous period
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const currentPeriodReports = reports.filter(
      (r) => r.reportMonth === currentMonth && r.reportYear === currentYear
    );
    const previousPeriodReports = reports.filter(
      (r) => r.reportMonth === currentMonth - 1 && r.reportYear === currentYear
    );

    const currentTotal = currentPeriodReports.reduce((sum, r) => sum + r.totalAmount, 0);
    const previousTotal = previousPeriodReports.reduce((sum, r) => sum + r.totalAmount, 0);
    const percentageChange =
      previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    return {
      totalReports: filteredReports.length,
      paidReports: paidReports.length,
      pendingReports: pendingReports.length,
      totalPaid,
      totalPending,
      totalRevenue: totalPaid + totalPending,
      totalSessions,
      percentageChange,
    };
  }, [filteredReports, reports]);

  // Get unique values for filters
  const companies = Array.from(new Set(reports.map((r) => ({ id: r.companyId, name: r.companyName }))));
  const uniqueCompanies = Array.from(new Map(companies.map((c) => [c.id, c])).values());
  const months = Array.from(new Set(reports.map((r) => r.reportMonth))).sort((a, b) => a - b);
  const years = Array.from(new Set(reports.map((r) => r.reportYear))).sort((a, b) => b - a);

  const getStatusColor = (status: string) => {
    return status === 'paid' ? 'green' : 'orange';
  };

  const getStatusText = (status: string) => {
    return status === 'paid' ? 'Pagado' : 'Pendiente';
  };

  const getMonthName = (month: number) => {
    const date = new Date(2024, month - 1, 1);
    return format(date, 'MMMM', { locale: es });
  };

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'transfer':
        return 'Transferencia';
      case 'cash':
        return 'Efectivo';
      case 'check':
        return 'Cheque';
      default:
        return '-';
    }
  };

  const handleViewReport = (report: MonthlyReport) => {
    setSelectedReport(report);
    onOpen();
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setReports(getMockReports());
    setIsLoading(false);
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Box>
              <HStack spacing={3} mb={2}>
                <BarChart3 size={24} color="#3182CE" />
                <Heading size="lg" color="gray.800">
                  Reportes Mensuales
                </Heading>
              </HStack>
              <Text color="gray.600">
                Vista consolidada de todos los reportes mensuales generados
              </Text>
            </Box>
            <Button
              leftIcon={<RefreshCw size={16} />}
              variant="outline"
              onClick={handleRefresh}
              isLoading={isLoading}
            >
              Actualizar
            </Button>
          </Flex>

          {/* Metrics Cards */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
            <Card bg="blue.50" borderWidth="1px" borderColor="blue.200">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="xs" color="gray.600">
                    Ingresos Totales
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="blue.700">
                    ${metrics.totalRevenue.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type={metrics.percentageChange >= 0 ? 'increase' : 'decrease'} />
                    {Math.abs(metrics.percentageChange).toFixed(1)}% vs mes anterior
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="green.50" borderWidth="1px" borderColor="green.200">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="xs" color="gray.600">
                    Total Pagado
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="green.700">
                    ${metrics.totalPaid.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>{metrics.paidReports} reportes pagados</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="orange.50" borderWidth="1px" borderColor="orange.200">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="xs" color="gray.600">
                    Total Pendiente
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="orange.700">
                    ${metrics.totalPending.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>{metrics.pendingReports} reportes pendientes</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="purple.50" borderWidth="1px" borderColor="purple.200">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="xs" color="gray.600">
                    Total Sesiones
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="purple.700">
                    {metrics.totalSessions}
                  </StatNumber>
                  <StatHelpText>{metrics.totalReports} reportes generados</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </Grid>

          {/* Filters */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={2}>
                  <Filter size={16} color="#718096" />
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Filtros
                  </Text>
                </HStack>

                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }} gap={4}>
                  {/* Search */}
                  <GridItem colSpan={{ base: 1, lg: 2 }}>
                    <InputGroup>
                      <InputLeftElement>
                        <Search size={16} color="#718096" />
                      </InputLeftElement>
                      <Input
                        placeholder="Buscar empresa, contrato, referencia..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </GridItem>

                  {/* Status Filter */}
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">Todos los estados</option>
                    <option value="paid">Pagados</option>
                    <option value="pending">Pendientes</option>
                  </Select>

                  {/* Company Filter */}
                  <Select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}>
                    <option value="all">Todas las empresas</option>
                    {uniqueCompanies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </Select>

                  {/* Month Filter */}
                  <Select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                    <option value="all">Todos los meses</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {getMonthName(month)}
                      </option>
                    ))}
                  </Select>
                </Grid>

                <Text fontSize="xs" color="gray.600">
                  Mostrando {filteredReports.length} de {reports.length} reportes
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardBody p={0}>
              {isLoading ? (
                <Center py={10}>
                  <Spinner size="lg" color="blue.500" />
                </Center>
              ) : filteredReports.length === 0 ? (
                <Center py={10}>
                  <VStack spacing={3}>
                    <FileText size={48} color="#CBD5E0" />
                    <Text color="gray.500" fontSize="lg">
                      No se encontraron reportes
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
                        <Th>Empresa</Th>
                        <Th>Contrato</Th>
                        <Th>Período</Th>
                        <Th>Sesiones</Th>
                        <Th>Pacientes</Th>
                        <Th isNumeric>Monto</Th>
                        <Th>Estado</Th>
                        <Th>Generado</Th>
                        <Th>Pago</Th>
                        <Th>Acciones</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredReports.map((report) => (
                        <Tr key={report.id} _hover={{ bg: 'gray.50' }}>
                          <Td>
                            <VStack spacing={0} align="start">
                              <HStack spacing={1}>
                                <Building2 size={14} color="#718096" />
                                <Text fontSize="sm" fontWeight="medium">
                                  {report.companyName}
                                </Text>
                              </HStack>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.700">
                              {report.contractName}
                            </Text>
                          </Td>
                          <Td>
                            <VStack spacing={0} align="start">
                              <Text fontSize="sm" fontWeight="medium">
                                {getMonthName(report.reportMonth)} {report.reportYear}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {report.reportMonth}/{report.reportYear}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              <FileText size={14} color="#718096" />
                              <Text fontSize="sm" fontWeight="medium">
                                {report.totalSessions}
                              </Text>
                            </HStack>
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              <Users size={14} color="#718096" />
                              <Text fontSize="sm" fontWeight="medium">
                                {report.totalPatients}
                              </Text>
                            </HStack>
                          </Td>
                          <Td isNumeric>
                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              color={report.paymentStatus === 'paid' ? 'green.600' : 'orange.600'}
                            >
                              ${report.totalAmount.toLocaleString()}
                            </Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getStatusColor(report.paymentStatus)}
                              variant="subtle"
                              fontSize="xs"
                            >
                              {getStatusText(report.paymentStatus)}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="xs" color="gray.600">
                              {format(report.generatedAt, 'dd/MM/yyyy', { locale: es })}
                            </Text>
                          </Td>
                          <Td>
                            {report.paymentStatus === 'paid' && report.paidAt ? (
                              <VStack spacing={0} align="start">
                                <Text fontSize="xs" color="gray.700" fontWeight="medium">
                                  {format(report.paidAt, 'dd/MM/yyyy', { locale: es })}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {getPaymentMethodText(report.paymentMethod)}
                                </Text>
                              </VStack>
                            ) : (
                              <Text fontSize="xs" color="gray.400">
                                Pendiente
                              </Text>
                            )}
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Tooltip label="Ver detalles">
                                <IconButton
                                  aria-label="Ver detalles"
                                  icon={<Eye size={14} />}
                                  size="sm"
                                  variant="outline"
                                  colorScheme="blue"
                                  onClick={() => handleViewReport(report)}
                                />
                              </Tooltip>

                              <Tooltip label="Descargar PDF">
                                <IconButton
                                  aria-label="Descargar PDF"
                                  icon={<Download size={14} />}
                                  size="sm"
                                  variant="outline"
                                  colorScheme="gray"
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>
        </VStack>

        {/* View Report Modal */}
        {selectedReport && (
          <ViewMonthlyReportModal
            isOpen={isOpen}
            onClose={onClose}
            report={selectedReport}
            companyName={selectedReport.companyName}
            contractName={selectedReport.contractName}
          />
        )}
      </DashboardLayout>
    </AuthLayout>
  );
}
