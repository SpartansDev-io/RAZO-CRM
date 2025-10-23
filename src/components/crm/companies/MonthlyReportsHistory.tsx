'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  IconButton,
  useDisclosure,
  Spinner,
  Center,
  Divider,
  useToast,
  Tooltip,
} from '@chakra-ui/react';
import {
  FileText,
  Eye,
  Download,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ViewMonthlyReportModal from './ViewMonthlyReportModal';
import MarkReportPaidModal from './MarkReportPaidModal';

interface MonthlyReport {
  id: string;
  contractId: string;
  companyId: string;
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

interface MonthlyReportsHistoryProps {
  contractId: string;
  companyName: string;
  contractName: string;
}

// Mock data - replace with actual API call
const getMockReports = (contractId: string): MonthlyReport[] => {
  return [
    {
      id: '1',
      contractId,
      companyId: 'company-1',
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
      contractId,
      companyId: 'company-1',
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
      contractId,
      companyId: 'company-1',
      reportMonth: 10,
      reportYear: 2024,
      totalSessions: 6,
      totalPatients: 3,
      totalAmount: 9000,
      paymentStatus: 'pending',
      generatedAt: new Date('2024-11-05'),
    },
  ];
};

export default function MonthlyReportsHistory({
  contractId,
  companyName,
  contractName,
}: MonthlyReportsHistoryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<MonthlyReport[]>(
    getMockReports(contractId),
  );
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(
    null,
  );

  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();
  const {
    isOpen: isPaidOpen,
    onOpen: onPaidOpen,
    onClose: onPaidClose,
  } = useDisclosure();

  const toast = useToast();

  const handleViewReport = (report: MonthlyReport) => {
    setSelectedReport(report);
    onViewOpen();
  };

  const handleMarkPaid = (report: MonthlyReport) => {
    setSelectedReport(report);
    onPaidOpen();
  };

  const handleDownloadPDF = async (report: MonthlyReport) => {
    toast({
      title: 'Generando PDF',
      description: 'El reporte se está generando...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });

    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: 'PDF descargado',
      description: 'El reporte se ha descargado exitosamente',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

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

  const calculateTotals = () => {
    const paidReports = reports.filter((r) => r.paymentStatus === 'paid');
    const pendingReports = reports.filter((r) => r.paymentStatus === 'pending');

    return {
      totalPaid: paidReports.reduce((sum, r) => sum + r.totalAmount, 0),
      totalPending: pendingReports.reduce((sum, r) => sum + r.totalAmount, 0),
      totalReports: reports.length,
      paidReports: paidReports.length,
      pendingReports: pendingReports.length,
    };
  };

  const totals = calculateTotals();

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <HStack spacing={2} mb={2}>
          <FileText size={20} color="#3182CE" />
          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
            Historial de Reportes Mensuales
          </Text>
        </HStack>
        <Text fontSize="sm" color="gray.600">
          Consulta y gestiona los reportes generados para este contrato
        </Text>
      </Box>

      {/* Summary Cards */}
      <HStack spacing={4}>
        <Card flex="1" bg="blue.50" borderWidth="1px" borderColor="blue.200">
          <CardBody>
            <VStack spacing={2} align="stretch">
              <HStack spacing={2}>
                <FileText size={16} color="#3182CE" />
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  Total Reportes
                </Text>
              </HStack>
              <Text fontSize="xl" fontWeight="bold" color="blue.700">
                {totals.totalReports}
              </Text>
              <HStack spacing={4} fontSize="xs" color="gray.600">
                <HStack spacing={1}>
                  <CheckCircle size={12} color="#38A169" />
                  <Text>{totals.paidReports} pagados</Text>
                </HStack>
                <HStack spacing={1}>
                  <Clock size={12} color="#DD6B20" />
                  <Text>{totals.pendingReports} pendientes</Text>
                </HStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card flex="1" bg="green.50" borderWidth="1px" borderColor="green.200">
          <CardBody>
            <VStack spacing={2} align="stretch">
              <HStack spacing={2}>
                <CheckCircle size={16} color="#38A169" />
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  Total Pagado
                </Text>
              </HStack>
              <Text fontSize="xl" fontWeight="bold" color="green.700">
                ${totals.totalPaid.toLocaleString()}
              </Text>
              <Text fontSize="xs" color="gray.600">
                MXN
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card
          flex="1"
          bg="orange.50"
          borderWidth="1px"
          borderColor="orange.200"
        >
          <CardBody>
            <VStack spacing={2} align="stretch">
              <HStack spacing={2}>
                <Clock size={16} color="#DD6B20" />
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  Total Pendiente
                </Text>
              </HStack>
              <Text fontSize="xl" fontWeight="bold" color="orange.700">
                ${totals.totalPending.toLocaleString()}
              </Text>
              <Text fontSize="xs" color="gray.600">
                MXN
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </HStack>

      <Divider />

      {/* Reports Table */}
      <Card>
        <CardBody p={0}>
          {isLoading ? (
            <Center py={10}>
              <Spinner size="lg" color="blue.500" />
            </Center>
          ) : reports.length === 0 ? (
            <Center py={10}>
              <VStack spacing={3}>
                <FileText size={48} color="#CBD5E0" />
                <Text color="gray.500" fontSize="lg">
                  No hay reportes generados
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Genera tu primer reporte mensual para este contrato
                </Text>
              </VStack>
            </Center>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Período</Th>
                    <Th>Sesiones</Th>
                    <Th>Pacientes</Th>
                    <Th isNumeric>Monto Total</Th>
                    <Th>Estado</Th>
                    <Th>Generado</Th>
                    <Th>Pago</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {reports.map((report) => (
                    <Tr key={report.id} _hover={{ bg: 'gray.50' }}>
                      <Td>
                        <VStack spacing={0} align="start">
                          <Text fontSize="sm" fontWeight="medium">
                            {getMonthName(report.reportMonth)}{' '}
                            {report.reportYear}
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
                          color={
                            report.paymentStatus === 'paid'
                              ? 'green.600'
                              : 'orange.600'
                          }
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
                          {format(report.generatedAt, 'dd/MM/yyyy', {
                            locale: es,
                          })}
                        </Text>
                      </Td>
                      <Td>
                        {report.paymentStatus === 'paid' && report.paidAt ? (
                          <VStack spacing={0} align="start">
                            <Text
                              fontSize="xs"
                              color="gray.700"
                              fontWeight="medium"
                            >
                              {format(report.paidAt, 'dd/MM/yyyy', {
                                locale: es,
                              })}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {getPaymentMethodText(report.paymentMethod)}
                            </Text>
                            {report.paymentReference && (
                              <Text fontSize="xs" color="gray.500">
                                {report.paymentReference}
                              </Text>
                            )}
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
                              onClick={() => handleDownloadPDF(report)}
                            />
                          </Tooltip>

                          {report.paymentStatus === 'pending' && (
                            <Tooltip label="Marcar como pagado">
                              <IconButton
                                aria-label="Marcar como pagado"
                                icon={<CheckCircle size={14} />}
                                size="sm"
                                variant="solid"
                                colorScheme="green"
                                onClick={() => handleMarkPaid(report)}
                              />
                            </Tooltip>
                          )}
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

      {/* View Report Modal */}
      {selectedReport && (
        <ViewMonthlyReportModal
          isOpen={isViewOpen}
          onClose={onViewClose}
          report={selectedReport}
          companyName={companyName}
          contractName={contractName}
        />
      )}

      {/* Mark Paid Modal */}
      {selectedReport && (
        <MarkReportPaidModal
          isOpen={isPaidOpen}
          onClose={onPaidClose}
          report={selectedReport}
          companyName={companyName}
          onSuccess={() => {
            // Refresh reports list
            setReports(getMockReports(contractId));
          }}
        />
      )}
    </VStack>
  );
}
