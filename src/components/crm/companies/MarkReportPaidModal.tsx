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
  Input,
  Select,
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
  Box,
  Divider,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { CheckCircle, DollarSign, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MarkPaidFormData {
  paymentDate: string;
  paymentTime: string;
  paymentMethod: 'transfer' | 'cash' | 'check';
  paymentReference: string;
  notes?: string;
}

interface MonthlyReport {
  id: string;
  reportMonth: number;
  reportYear: number;
  totalSessions: number;
  totalPatients: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid';
}

interface MarkReportPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: MonthlyReport;
  companyName: string;
  onSuccess: () => void;
}

export default function MarkReportPaidModal({
  isOpen,
  onClose,
  report,
  companyName,
  onSuccess,
}: MarkReportPaidModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MarkPaidFormData>({
    defaultValues: {
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      paymentTime: format(new Date(), 'HH:mm'),
      paymentMethod: 'transfer',
      paymentReference: '',
      notes: '',
    },
  });

  const onSubmit = async (data: MarkPaidFormData) => {
    setIsLoading(true);

    try {
      // Simulate API call to mark as paid
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: 'Reporte marcado como pagado',
        description: `El reporte ha sido marcado como pagado. Todas las sesiones incluidas se actualizaron automáticamente.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onSuccess();
      handleClose();
    } catch (error) {
      toast({
        title: 'Error al marcar como pagado',
        description:
          'Hubo un problema al procesar el pago. Intente nuevamente.',
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
    onClose();
  };

  const getMonthName = (month: number) => {
    const date = new Date(2024, month - 1, 1);
    return format(date, 'MMMM', { locale: es });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxH="90vh">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            <HStack spacing={2}>
              <CheckCircle size={24} color="#38A169" />
              <Text>Marcar Reporte como Pagado</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody overflowY="auto" maxH="calc(90vh - 140px)">
            <VStack spacing={6} align="stretch">
              {/* Report Info */}
              <Box
                p={4}
                bg="blue.50"
                borderRadius="md"
                borderWidth="1px"
                borderColor="blue.200"
              >
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
                      Período:
                    </Text>
                    <Text fontSize="md" fontWeight="medium" color="blue.600">
                      {getMonthName(report.reportMonth)} {report.reportYear}
                    </Text>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.700">
                      Sesiones:
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {report.totalSessions}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.700">
                      Pacientes:
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {report.totalPatients}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                      Monto Total:
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      ${report.totalAmount.toLocaleString()} MXN
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Important Alert */}
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Importante</AlertTitle>
                  <AlertDescription fontSize="xs">
                    Al marcar este reporte como pagado, todas las{' '}
                    {report.totalSessions} sesiones incluidas se actualizarán
                    automáticamente a estado "pagado".
                  </AlertDescription>
                </Box>
              </Alert>

              <Divider />

              {/* Payment Details */}
              <VStack spacing={4} align="stretch">
                <Text fontSize="md" fontWeight="semibold" color="gray.800">
                  Detalles del Pago
                </Text>

                {/* Payment Date and Time */}
                <HStack spacing={4}>
                  <FormControl isRequired flex="2">
                    <FormLabel>
                      <HStack spacing={1}>
                        <Calendar size={14} />
                        <Text>Fecha de Pago</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="date"
                      max={format(new Date(), 'yyyy-MM-dd')}
                      {...register('paymentDate', {
                        required: 'La fecha es requerida',
                      })}
                    />
                    {errors.paymentDate && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.paymentDate.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isRequired flex="1">
                    <FormLabel>Hora</FormLabel>
                    <Input
                      type="time"
                      {...register('paymentTime', {
                        required: 'La hora es requerida',
                      })}
                    />
                  </FormControl>
                </HStack>

                {/* Payment Method */}
                <FormControl isRequired>
                  <FormLabel>
                    <HStack spacing={1}>
                      <DollarSign size={14} />
                      <Text>Método de Pago</Text>
                    </HStack>
                  </FormLabel>
                  <Select {...register('paymentMethod', { required: true })}>
                    <option value="transfer">Transferencia Bancaria</option>
                    <option value="cash">Efectivo</option>
                    <option value="check">Cheque</option>
                  </Select>
                </FormControl>

                {/* Payment Reference */}
                <FormControl isRequired isInvalid={!!errors.paymentReference}>
                  <FormLabel>Referencia de Pago</FormLabel>
                  <Input
                    placeholder="Ej: TRANS-20250113-001, Recibo #1234"
                    {...register('paymentReference', {
                      required: 'La referencia de pago es requerida',
                    })}
                  />
                  {errors.paymentReference && (
                    <Text fontSize="sm" color="red.500" mt={1}>
                      {errors.paymentReference.message}
                    </Text>
                  )}
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Número de transferencia, recibo, o identificador del pago
                  </Text>
                </FormControl>

                {/* Notes */}
                <FormControl>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <Textarea
                    placeholder="Información adicional sobre el pago (opcional)"
                    rows={3}
                    {...register('notes')}
                  />
                </FormControl>
              </VStack>

              {/* Confirmation Summary */}
              <Box
                p={4}
                bg="green.50"
                borderRadius="md"
                borderWidth="1px"
                borderColor="green.200"
              >
                <VStack spacing={2} align="stretch">
                  <Text fontSize="sm" fontWeight="semibold" color="green.800">
                    Resumen de Confirmación
                  </Text>
                  <Divider borderColor="green.200" />
                  <Text fontSize="xs" color="gray.700">
                    ✓ Se marcará el reporte como <strong>PAGADO</strong>
                  </Text>
                  <Text fontSize="xs" color="gray.700">
                    ✓ Se actualizarán{' '}
                    <strong>{report.totalSessions} sesiones</strong> a estado
                    pagado
                  </Text>
                  <Text fontSize="xs" color="gray.700">
                    ✓ El monto de{' '}
                    <strong>${report.totalAmount.toLocaleString()} MXN</strong>{' '}
                    se registrará como cobrado
                  </Text>
                  <Text fontSize="xs" color="gray.700">
                    ✓ Esta acción quedará registrada en el historial
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="green"
                isLoading={isLoading}
                loadingText="Marcando como pagado..."
                spinner={<Spinner size="sm" />}
              >
                Confirmar Pago
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
