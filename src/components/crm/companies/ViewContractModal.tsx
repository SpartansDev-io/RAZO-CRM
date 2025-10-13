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
  Grid,
  Card,
  CardBody,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FileText,
  Calendar,
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  History,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import GenerateMonthlyReportModal from './GenerateMonthlyReportModal';
import MonthlyReportsHistory from './MonthlyReportsHistory';

interface Contract {
  id?: string;
  contractName: string;
  startDate: Date;
  endDate: Date;
  costPerSession: number;
  monthlyLimit?: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'annual';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  notes?: string;
}

interface ViewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  companyId: string;
  companyName: string;
}

export default function ViewContractModal({
  isOpen,
  onClose,
  contract,
  companyId,
  companyName,
}: ViewContractModalProps) {
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const {
    isOpen: isGenerateOpen,
    onOpen: onGenerateOpen,
    onClose: onGenerateClose
  } = useDisclosure();

  if (!contract) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'expired': return 'red';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'pending': return 'Pendiente';
      case 'expired': return 'Vencido';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPaymentFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'Mensual';
      case 'quarterly': return 'Trimestral';
      case 'annual': return 'Anual';
      default: return frequency;
    }
  };

  const daysUntilExpiration = differenceInDays(contract.endDate, new Date());
  const isExpiringSoon = daysUntilExpiration >= 0 && daysUntilExpiration <= 30;
  const totalDays = differenceInDays(contract.endDate, contract.startDate);
  const elapsedDays = differenceInDays(new Date(), contract.startDate);
  const progressPercentage = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent maxH="90vh">
          <ModalHeader>
            <HStack spacing={3}>
              <FileText size={24} color="#3182CE" />
              <VStack spacing={0} align="start">
                <Text>Detalles del Contrato</Text>
                <Text fontSize="sm" fontWeight="normal" color="gray.600">
                  {contract.contractName}
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody overflowY="auto" maxH="calc(90vh - 140px)">
            <Tabs colorScheme="blue">
              <TabList>
                <Tab>
                  <HStack spacing={2}>
                    <FileText size={16} />
                    <Text>Información del Contrato</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <TrendingUp size={16} />
                    <Text>Generar Reporte</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <History size={16} />
                    <Text>Historial de Reportes</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Tab 1: Contract Information */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
            <Card bg={cardBg}>
              <CardBody>
                <HStack spacing={4} justify="space-between" align="center">
                  <VStack spacing={1} align="start">
                    <Text fontSize="xs" color="gray.600">Estado del Contrato</Text>
                    <Badge
                      colorScheme={getStatusColor(contract.status)}
                      variant="solid"
                      px={3}
                      py={1}
                      fontSize="md"
                    >
                      {getStatusText(contract.status)}
                    </Badge>
                  </VStack>
                  {contract.status === 'active' && isExpiringSoon && (
                    <Badge colorScheme="orange" px={3} py={1}>
                      <HStack spacing={1}>
                        <AlertCircle size={14} />
                        <Text>Vence en {daysUntilExpiration} días</Text>
                      </HStack>
                    </Badge>
                  )}
                  {contract.status === 'active' && !isExpiringSoon && daysUntilExpiration > 0 && (
                    <Badge colorScheme="green" px={3} py={1}>
                      <HStack spacing={1}>
                        <CheckCircle size={14} />
                        <Text>{daysUntilExpiration} días restantes</Text>
                      </HStack>
                    </Badge>
                  )}
                </HStack>
              </CardBody>
            </Card>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              <Box>
                <HStack spacing={2} mb={3}>
                  <Calendar size={18} color="#3182CE" />
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Período de Vigencia
                  </Text>
                </HStack>
                <VStack spacing={3} align="stretch" pl={6}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Inicio:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {format(contract.startDate, 'dd MMMM yyyy', { locale: es })}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Fin:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {format(contract.endDate, 'dd MMMM yyyy', { locale: es })}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Duración:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {totalDays} días
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              <Box>
                <HStack spacing={2} mb={3}>
                  <DollarSign size={18} color="#38A169" />
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Términos Financieros
                  </Text>
                </HStack>
                <VStack spacing={3} align="stretch" pl={6}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Costo por Sesión:</Text>
                    <Text fontSize="sm" fontWeight="medium" color="green.600">
                      ${contract.costPerSession.toLocaleString()} MXN
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Límite Mensual:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {contract.monthlyLimit
                        ? `$${contract.monthlyLimit.toLocaleString()} MXN`
                        : 'Sin límite'}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Frecuencia de Pago:</Text>
                    <Badge colorScheme="blue" fontSize="xs">
                      {getPaymentFrequencyText(contract.paymentFrequency)}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>
            </Grid>

            {contract.status === 'active' && (
              <>
                <Divider />
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.700">
                    Progreso del Contrato
                  </Text>
                  <Box
                    w="full"
                    h="8px"
                    bg="gray.200"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      h="full"
                      w={`${progressPercentage}%`}
                      bg={isExpiringSoon ? 'orange.400' : 'blue.400'}
                      transition="width 0.3s"
                    />
                  </Box>
                  <HStack justify="space-between" mt={2}>
                    <Text fontSize="xs" color="gray.500">
                      {Math.round(progressPercentage)}% completado
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {elapsedDays} de {totalDays} días
                    </Text>
                  </HStack>
                </Box>
              </>
            )}

            {contract.notes && (
              <>
                <Divider />
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.700">
                    Notas Adicionales
                  </Text>
                  <Card bg={cardBg}>
                    <CardBody>
                      <Text fontSize="sm" lineHeight="1.8" color="gray.700">
                        {contract.notes}
                      </Text>
                    </CardBody>
                  </Card>
                </Box>
              </>
            )}

            <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                    Resumen de Costos
                  </Text>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <VStack spacing={1} align="start">
                      <Text fontSize="xs" color="gray.600">Costo por Sesión</Text>
                      <Text fontSize="lg" fontWeight="bold" color="blue.700">
                        ${contract.costPerSession.toLocaleString()}
                      </Text>
                    </VStack>
                    {contract.monthlyLimit && (
                      <VStack spacing={1} align="start">
                        <Text fontSize="xs" color="gray.600">Límite Mensual</Text>
                        <Text fontSize="lg" fontWeight="bold" color="orange.600">
                          ${contract.monthlyLimit.toLocaleString()}
                        </Text>
                      </VStack>
                    )}
                  </Grid>
                </VStack>
              </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* Tab 2: Generate Report */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Box>
                      <Text fontSize="lg" fontWeight="semibold" mb={2} color="gray.800">
                        Generar Reporte Mensual
                      </Text>
                      <Text fontSize="sm" color="gray.600" mb={4}>
                        Genera un reporte de las sesiones del mes para facturar a la empresa
                      </Text>
                      <Button
                        leftIcon={<TrendingUp size={20} />}
                        colorScheme="blue"
                        size="lg"
                        onClick={onGenerateOpen}
                      >
                        Generar Nuevo Reporte
                      </Button>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Tab 3: Reports History */}
                <TabPanel>
                  {contract.id && (
                    <MonthlyReportsHistory
                      contractId={contract.id}
                      companyName={companyName}
                      contractName={contract.contractName}
                    />
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Generate Monthly Report Modal */}
      {contract.id && (
        <GenerateMonthlyReportModal
          isOpen={isGenerateOpen}
          onClose={onGenerateClose}
          contractId={contract.id}
          companyId={companyId}
          companyName={companyName}
          contractName={contract.contractName}
        />
      )}
    </>
  );
}
