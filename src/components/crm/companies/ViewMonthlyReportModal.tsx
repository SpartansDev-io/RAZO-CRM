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
  Box,
  Card,
  CardBody,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react';
import { FileText, Calendar, DollarSign, Users, CheckCircle, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SessionData {
  id: string;
  patientName: string;
  sessionDate: Date;
  sessionType: string;
  sessionCost: number;
}

interface MonthlyReport {
  id: string;
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
  paymentMethod?: string;
}

interface ViewMonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: MonthlyReport;
  companyName: string;
  contractName: string;
}

// Mock sessions data
const getMockSessionsForReport = (reportId: string): SessionData[] => {
  return [
    {
      id: '1',
      patientName: 'María González',
      sessionDate: new Date(2024, 11, 5, 10, 0),
      sessionType: 'Terapia Individual',
      sessionCost: 1500,
    },
    {
      id: '2',
      patientName: 'María González',
      sessionDate: new Date(2024, 11, 12, 10, 0),
      sessionType: 'Terapia Individual',
      sessionCost: 1500,
    },
    {
      id: '3',
      patientName: 'Carlos Rodríguez',
      sessionDate: new Date(2024, 11, 8, 14, 0),
      sessionType: 'Terapia Individual',
      sessionCost: 1500,
    },
    {
      id: '4',
      patientName: 'Ana López',
      sessionDate: new Date(2024, 11, 15, 16, 0),
      sessionType: 'Evaluación de Seguimiento',
      sessionCost: 1500,
    },
    {
      id: '5',
      patientName: 'Carlos Rodríguez',
      sessionDate: new Date(2024, 11, 22, 14, 0),
      sessionType: 'Terapia Individual',
      sessionCost: 1500,
    },
  ];
};

export default function ViewMonthlyReportModal({
  isOpen,
  onClose,
  report,
  companyName,
  contractName,
}: ViewMonthlyReportModalProps) {
  const sessions = getMockSessionsForReport(report.id);

  const getMonthName = (month: number) => {
    const date = new Date(2024, month - 1, 1);
    return format(date, 'MMMM', { locale: es });
  };

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'transfer':
        return 'Transferencia Bancaria';
      case 'cash':
        return 'Efectivo';
      case 'check':
        return 'Cheque';
      default:
        return '-';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <HStack spacing={2}>
            <FileText size={24} color="#3182CE" />
            <Text>Reporte Mensual - {getMonthName(report.reportMonth)} {report.reportYear}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Company and Contract Info */}
            <Box p={4} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Empresa:
                  </Text>
                  <Text fontSize="md" fontWeight="bold" color="blue.700">
                    {companyName}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Contrato:
                  </Text>
                  <Text fontSize="md" fontWeight="medium" color="blue.600">
                    {contractName}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Período:
                  </Text>
                  <Text fontSize="md" fontWeight="medium" color="blue.600">
                    {getMonthName(report.reportMonth)} {report.reportYear}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Status Badge */}
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">
                Generado el: {format(report.generatedAt, 'dd/MM/yyyy HH:mm', { locale: es })}
              </Text>
              <Badge
                colorScheme={report.paymentStatus === 'paid' ? 'green' : 'orange'}
                variant="solid"
                fontSize="sm"
                px={3}
                py={1}
              >
                {report.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
              </Badge>
            </HStack>

            <Divider />

            {/* Summary Cards */}
            <HStack spacing={4}>
              <Card flex="1" bg="green.50" borderWidth="1px" borderColor="green.200">
                <CardBody>
                  <VStack spacing={2}>
                    <HStack spacing={2}>
                      <FileText size={20} color="#38A169" />
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Sesiones
                      </Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="green.700">
                      {report.totalSessions}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card flex="1" bg="blue.50" borderWidth="1px" borderColor="blue.200">
                <CardBody>
                  <VStack spacing={2}>
                    <HStack spacing={2}>
                      <Users size={20} color="#3182CE" />
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Pacientes
                      </Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.700">
                      {report.totalPatients}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card flex="1" bg="orange.50" borderWidth="1px" borderColor="orange.200">
                <CardBody>
                  <VStack spacing={2}>
                    <HStack spacing={2}>
                      <DollarSign size={20} color="#DD6B20" />
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Total
                      </Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="orange.700">
                      ${report.totalAmount.toLocaleString()}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </HStack>

            {/* Payment Information (if paid) */}
            {report.paymentStatus === 'paid' && report.paidAt && (
              <>
                <Divider />
                <Box p={4} bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200">
                  <Text fontSize="md" fontWeight="semibold" mb={3} color="green.800">
                    <HStack spacing={2}>
                      <CheckCircle size={20} />
                      <Text>Información de Pago</Text>
                    </HStack>
                  </Text>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.700">
                        Fecha de pago:
                      </Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {format(report.paidAt, 'dd/MM/yyyy HH:mm', { locale: es })}
                      </Text>
                    </HStack>
                    {report.paymentMethod && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.700">
                          Método de pago:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {getPaymentMethodText(report.paymentMethod)}
                        </Text>
                      </HStack>
                    )}
                    {report.paymentReference && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.700">
                          Referencia:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {report.paymentReference}
                        </Text>
                      </HStack>
                    )}
                    {report.paidBy && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.700">
                          Registrado por:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {report.paidBy}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              </>
            )}

            <Divider />

            {/* Sessions Table */}
            <Box>
              <Text fontSize="md" fontWeight="semibold" mb={3} color="gray.800">
                Detalle de Sesiones
              </Text>
              <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                <Table size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Paciente</Th>
                      <Th>Fecha y Hora</Th>
                      <Th>Tipo de Sesión</Th>
                      <Th isNumeric>Costo</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sessions.map((session, index) => (
                      <Tr key={index} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <Text fontSize="sm" fontWeight="medium">
                            {session.patientName}
                          </Text>
                        </Td>
                        <Td>
                          <VStack spacing={0} align="start">
                            <Text fontSize="sm">
                              {format(session.sessionDate, 'dd MMM yyyy', { locale: es })}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {format(session.sessionDate, 'HH:mm')}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.700">
                            {session.sessionType}
                          </Text>
                        </Td>
                        <Td isNumeric>
                          <Text fontSize="sm" fontWeight="medium" color="green.600">
                            ${session.sessionCost.toLocaleString()}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>

            {/* Total Footer */}
            <Box p={4} bg="gray.50" borderRadius="md" borderWidth="1px">
              <HStack justify="space-between">
                <Text fontSize="md" fontWeight="semibold" color="gray.700">
                  Total {report.paymentStatus === 'paid' ? 'Pagado' : 'a Cobrar'}:
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color={report.paymentStatus === 'paid' ? 'green.600' : 'orange.600'}>
                  ${report.totalAmount.toLocaleString()} MXN
                </Text>
              </HStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              leftIcon={<Download size={16} />}
              variant="outline"
              colorScheme="blue"
            >
              Descargar PDF
            </Button>
            <Button onClick={onClose}>Cerrar</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
