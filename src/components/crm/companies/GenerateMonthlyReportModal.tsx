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
  FormControl,
  FormLabel,
  Select,
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FileText, Calendar, DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface GenerateMonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  companyId: string;
  companyName: string;
  contractName: string;
}

interface ReportFormData {
  month: number;
  year: number;
}

interface SessionData {
  id: string;
  patientId: string;
  patientName: string;
  sessionDate: Date;
  sessionType: string;
  sessionCost: number;
}

interface ReportPreview {
  totalSessions: number;
  totalPatients: number;
  totalAmount: number;
  sessions: SessionData[];
}

// Mock data - replace with actual API call
const getMockSessionsForPeriod = (contractId: string, month: number, year: number): SessionData[] => {
  return [
    {
      id: '1',
      patientId: 'p1',
      patientName: 'María González',
      sessionDate: new Date(year, month - 1, 5, 10, 0),
      sessionType: 'Terapia Individual',
      sessionCost: 1500,
    },
    {
      id: '2',
      patientId: 'p1',
      patientName: 'María González',
      sessionDate: new Date(year, month - 1, 12, 10, 0),
      sessionType: 'Terapia Individual',
      sessionCost: 1500,
    },
    {
      id: '3',
      patientId: 'p2',
      patientName: 'Carlos Rodríguez',
      sessionDate: new Date(year, month - 1, 8, 14, 0),
      sessionType: 'Terapia Individual',
      sessionCost: 1500,
    },
    {
      id: '4',
      patientId: 'p3',
      patientName: 'Ana López',
      sessionDate: new Date(year, month - 1, 15, 16, 0),
      sessionType: 'Evaluación de Seguimiento',
      sessionCost: 1500,
    },
    {
      id: '5',
      patientId: 'p2',
      patientName: 'Carlos Rodríguez',
      sessionDate: new Date(year, month - 1, 22, 14, 0),
      sessionType: 'Terapia Individual',
      sessionCost: 1500,
    },
  ];
};

export default function GenerateMonthlyReportModal({
  isOpen,
  onClose,
  contractId,
  companyId,
  companyName,
  contractName,
}: GenerateMonthlyReportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [reportPreview, setReportPreview] = useState<ReportPreview | null>(null);
  const toast = useToast();

  const currentDate = new Date();
  const suggestedDate = subMonths(currentDate, 1);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReportFormData>({
    defaultValues: {
      month: suggestedDate.getMonth() + 1,
      year: suggestedDate.getFullYear(),
    },
  });

  const watchedMonth = watch('month');
  const watchedYear = watch('year');

  useEffect(() => {
    if (isOpen && watchedMonth && watchedYear) {
      loadReportPreview(watchedMonth, watchedYear);
    }
  }, [isOpen, watchedMonth, watchedYear]);

  const loadReportPreview = async (month: number, year: number) => {
    setIsLoadingPreview(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const sessions = getMockSessionsForPeriod(contractId, month, year);
      const uniquePatients = new Set(sessions.map(s => s.patientId)).size;
      const totalAmount = sessions.reduce((sum, s) => sum + s.sessionCost, 0);

      setReportPreview({
        totalSessions: sessions.length,
        totalPatients: uniquePatients,
        totalAmount,
        sessions,
      });
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    if (!reportPreview || reportPreview.totalSessions === 0) {
      toast({
        title: 'No hay sesiones',
        description: 'No se encontraron sesiones para generar el reporte en el período seleccionado.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to generate report
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Reporte generado exitosamente',
        description: `Se ha generado el reporte de ${format(new Date(data.year, data.month - 1), 'MMMM yyyy', { locale: es })} para ${companyName}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      handleClose();
    } catch (error) {
      toast({
        title: 'Error al generar el reporte',
        description: 'Hubo un problema al generar el reporte. Intente nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setReportPreview(null);
    onClose();
  };

  const getMonthName = (month: number) => {
    const date = new Date(2024, month - 1, 1);
    return format(date, 'MMMM', { locale: es });
  };

  const generateYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2020; i--) {
      years.push(i);
    }
    return years;
  };

  const generateMonths = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: getMonthName(i + 1),
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxH="90vh" overflowY="auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            <HStack spacing={2}>
              <FileText size={24} color="#3182CE" />
              <Text>Generar Reporte Mensual</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Contract Info */}
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
                </VStack>
              </Box>

              {/* Period Selection */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                  <HStack spacing={2}>
                    <Calendar size={20} />
                    <Text>Seleccionar Período</Text>
                  </HStack>
                </Text>

                <HStack spacing={4}>
                  <FormControl isRequired flex="1">
                    <FormLabel>Mes</FormLabel>
                    <Select {...register('month', { required: true, valueAsNumber: true })}>
                      {generateMonths().map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired flex="1">
                    <FormLabel>Año</FormLabel>
                    <Select {...register('year', { required: true, valueAsNumber: true })}>
                      {generateYears().map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>

                <Alert status="info" mt={4} borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">Sugerencia</AlertTitle>
                    <AlertDescription fontSize="xs">
                      El período sugerido es{' '}
                      <strong>
                        {format(suggestedDate, 'MMMM yyyy', { locale: es })}
                      </strong>{' '}
                      (mes anterior al actual)
                    </AlertDescription>
                  </Box>
                </Alert>
              </Box>

              <Divider />

              {/* Report Preview */}
              {isLoadingPreview ? (
                <Box py={10}>
                  <VStack spacing={4}>
                    <Spinner size="lg" color="blue.500" />
                    <Text color="gray.600">Cargando vista previa del reporte...</Text>
                  </VStack>
                </Box>
              ) : reportPreview ? (
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                    Vista Previa del Reporte
                  </Text>

                  {reportPreview.totalSessions === 0 ? (
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle fontSize="sm">Sin sesiones</AlertTitle>
                        <AlertDescription fontSize="xs">
                          No se encontraron sesiones bajo este contrato para el período seleccionado.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  ) : (
                    <>
                      {/* Summary Cards */}
                      <HStack spacing={4} mb={6}>
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
                                {reportPreview.totalSessions}
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
                                {reportPreview.totalPatients}
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
                                ${reportPreview.totalAmount.toLocaleString()}
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      </HStack>

                      {/* Sessions Table */}
                      <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                        <Table size="sm" variant="simple">
                          <Thead bg="gray.50">
                            <Tr>
                              <Th>Paciente</Th>
                              <Th>Fecha</Th>
                              <Th>Tipo de Sesión</Th>
                              <Th isNumeric>Costo</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {reportPreview.sessions.map((session, index) => (
                              <Tr key={index} _hover={{ bg: 'gray.50' }}>
                                <Td>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {session.patientName}
                                  </Text>
                                </Td>
                                <Td>
                                  <Text fontSize="sm">
                                    {format(session.sessionDate, 'dd MMM yyyy', { locale: es })}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {format(session.sessionDate, 'HH:mm')}
                                  </Text>
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

                      {/* Total Footer */}
                      <Box mt={4} p={4} bg="gray.50" borderRadius="md" borderWidth="1px">
                        <HStack justify="space-between">
                          <Text fontSize="md" fontWeight="semibold" color="gray.700">
                            Total a Cobrar:
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color="green.600">
                            ${reportPreview.totalAmount.toLocaleString()} MXN
                          </Text>
                        </HStack>
                      </Box>
                    </>
                  )}
                </Box>
              ) : null}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
                loadingText="Generando reporte..."
                spinner={<Spinner size="sm" />}
                isDisabled={!reportPreview || reportPreview.totalSessions === 0}
              >
                Generar Reporte
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
