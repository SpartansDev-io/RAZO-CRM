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
  Badge,
  Divider,
  Card,
  CardBody,
  Textarea,
} from '@chakra-ui/react';
import {
  DollarSign,
  CreditCard,
  Banknote,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PaymentFormData {
  sessionId: string;
  paymentAmount: number;
  paymentMethod: 'transfer' | 'cash';
  paymentDate: string;
  paymentTime: string;
  paymentNotes: string;
}

interface PendingSession {
  id: string;
  sessionDate: Date;
  sessionType: string;
  sessionCost: number;
  paidAmount: number;
  remainingDebt: number;
}

interface RegisterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  totalDebt: number;
}

const getMockPendingSessions = (patientId: string): PendingSession[] => {
  return [
    {
      id: '3',
      sessionDate: new Date('2023-12-20T16:00:00'),
      sessionType: 'Terapia Individual',
      sessionCost: 1500,
      paidAmount: 0,
      remainingDebt: 1500,
    },
    {
      id: '2',
      sessionDate: new Date('2024-01-08T10:30:00'),
      sessionType: 'Evaluación de Seguimiento',
      sessionCost: 1500,
      paidAmount: 800,
      remainingDebt: 700,
    },
  ];
};

export default function RegisterPaymentModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  totalDebt,
}: RegisterPaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingSessions, setPendingSessions] = useState<PendingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<PendingSession | null>(
    null,
  );
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    defaultValues: {
      sessionId: '',
      paymentAmount: 0,
      paymentMethod: 'transfer',
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      paymentTime: format(new Date(), 'HH:mm'),
      paymentNotes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      const sessions = getMockPendingSessions(patientId);
      setPendingSessions(sessions);
    }
  }, [isOpen, patientId]);

  const watchedSessionId = watch('sessionId');
  const watchedPaymentAmount = watch('paymentAmount');

  useEffect(() => {
    if (watchedSessionId) {
      const session = pendingSessions.find((s) => s.id === watchedSessionId);
      setSelectedSession(session || null);
      if (session) {
        setValue('paymentAmount', session.remainingDebt);
      }
    } else {
      setSelectedSession(null);
    }
  }, [watchedSessionId, pendingSessions, setValue]);

  const onSubmit = async (data: PaymentFormData) => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: 'Pago registrado exitosamente',
        description: `Se ha registrado el pago de $${data.paymentAmount.toLocaleString()} MXN para ${patientName}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      handleClose();
    } catch (error) {
      toast({
        title: 'Error al registrar el pago',
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
    setSelectedSession(null);
    onClose();
  };

  const getRemainingDebtAfterPayment = () => {
    if (!selectedSession || !watchedPaymentAmount)
      return selectedSession?.remainingDebt || 0;
    return selectedSession.remainingDebt - watchedPaymentAmount;
  };

  const isFullPayment = () => {
    if (!selectedSession || !watchedPaymentAmount) return false;
    return watchedPaymentAmount === selectedSession.remainingDebt;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            <HStack spacing={2}>
              <DollarSign size={24} color="#38A169" />
              <Text>Registrar Pago</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Patient Info */}
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
                      Paciente:
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color="blue.700">
                      {patientName}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                      Adeudo Total:
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="orange.600">
                      ${totalDebt.toLocaleString()} MXN
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Session Selection */}
              <FormControl isRequired isInvalid={!!errors.sessionId}>
                <FormLabel>Seleccionar Sesión</FormLabel>
                <Select
                  placeholder="Selecciona la sesión a pagar"
                  {...register('sessionId', {
                    required: 'Seleccione una sesión',
                  })}
                >
                  {pendingSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {format(session.sessionDate, 'dd/MM/yyyy', {
                        locale: es,
                      })}{' '}
                      - {session.sessionType} - Adeudo: $
                      {session.remainingDebt.toLocaleString()} MXN
                    </option>
                  ))}
                </Select>
                {errors.sessionId && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {errors.sessionId.message}
                  </Text>
                )}
              </FormControl>

              {/* Session Details */}
              {selectedSession && (
                <Card bg="gray.50" borderWidth="1px" borderColor="gray.200">
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.700"
                      >
                        Detalles de la Sesión
                      </Text>
                      <Divider />
                      <HStack justify="space-between" fontSize="sm">
                        <Text color="gray.600">Fecha de sesión:</Text>
                        <Text fontWeight="medium">
                          {format(selectedSession.sessionDate, 'dd MMMM yyyy', {
                            locale: es,
                          })}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" fontSize="sm">
                        <Text color="gray.600">Costo total:</Text>
                        <Text fontWeight="medium">
                          ${selectedSession.sessionCost.toLocaleString()} MXN
                        </Text>
                      </HStack>
                      <HStack justify="space-between" fontSize="sm">
                        <Text color="gray.600">Pagado anteriormente:</Text>
                        <Text
                          fontWeight="medium"
                          color={
                            selectedSession.paidAmount > 0
                              ? 'green.600'
                              : 'gray.600'
                          }
                        >
                          ${selectedSession.paidAmount.toLocaleString()} MXN
                        </Text>
                      </HStack>
                      <HStack justify="space-between" fontSize="sm">
                        <Text color="gray.600">Adeudo restante:</Text>
                        <Text fontWeight="bold" color="orange.600">
                          ${selectedSession.remainingDebt.toLocaleString()} MXN
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              <Divider />

              {/* Payment Details */}
              <VStack spacing={4} align="stretch">
                <Text fontSize="md" fontWeight="semibold" color="gray.800">
                  Detalles del Pago
                </Text>

                {/* Payment Amount */}
                <FormControl isRequired isInvalid={!!errors.paymentAmount}>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Banknote size={16} />
                      <Text>Monto a Pagar</Text>
                    </HStack>
                  </FormLabel>
                  <HStack>
                    <Text fontSize="lg" color="gray.600">
                      $
                    </Text>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...register('paymentAmount', {
                        required: 'El monto es requerido',
                        min: {
                          value: 0.01,
                          message: 'El monto debe ser mayor a 0',
                        },
                        max: {
                          value: selectedSession?.remainingDebt || 0,
                          message:
                            'El monto no puede exceder el adeudo restante',
                        },
                        valueAsNumber: true,
                      })}
                    />
                    <Text fontSize="lg" color="gray.600">
                      MXN
                    </Text>
                  </HStack>
                  {errors.paymentAmount && (
                    <Text fontSize="sm" color="red.500" mt={1}>
                      {errors.paymentAmount.message}
                    </Text>
                  )}
                  {selectedSession && watchedPaymentAmount > 0 && (
                    <>
                      {isFullPayment() ? (
                        <Badge colorScheme="green" mt={2} fontSize="xs">
                          <HStack spacing={1}>
                            <CheckCircle size={12} />
                            <Text>Pago Completo</Text>
                          </HStack>
                        </Badge>
                      ) : (
                        <Badge colorScheme="orange" mt={2} fontSize="xs">
                          <HStack spacing={1}>
                            <AlertCircle size={12} />
                            <Text>
                              Pago Parcial - Quedará adeudo de: $
                              {getRemainingDebtAfterPayment().toLocaleString()}{' '}
                              MXN
                            </Text>
                          </HStack>
                        </Badge>
                      )}
                    </>
                  )}
                </FormControl>

                {/* Payment Method */}
                <FormControl isRequired>
                  <FormLabel>
                    <HStack spacing={2}>
                      <CreditCard size={16} />
                      <Text>Método de Pago</Text>
                    </HStack>
                  </FormLabel>
                  <Select {...register('paymentMethod', { required: true })}>
                    <option value="transfer">Transferencia Bancaria</option>
                    <option value="cash">Efectivo</option>
                  </Select>
                </FormControl>

                {/* Payment Date and Time */}
                <HStack spacing={4}>
                  <FormControl isRequired flex="2">
                    <FormLabel>Fecha de Pago</FormLabel>
                    <Input
                      type="date"
                      {...register('paymentDate', { required: true })}
                    />
                  </FormControl>

                  <FormControl isRequired flex="1">
                    <FormLabel>Hora</FormLabel>
                    <Input
                      type="time"
                      {...register('paymentTime', { required: true })}
                    />
                  </FormControl>
                </HStack>

                {/* Payment Notes */}
                <FormControl>
                  <FormLabel>Notas de Pago (opcional)</FormLabel>
                  <Textarea
                    placeholder="Ej: Referencia de transferencia, número de recibo, etc."
                    rows={3}
                    {...register('paymentNotes')}
                  />
                </FormControl>
              </VStack>

              {/* Payment Summary */}
              {selectedSession && watchedPaymentAmount > 0 && (
                <>
                  <Divider />
                  <Card
                    bg={isFullPayment() ? 'green.50' : 'orange.50'}
                    borderWidth="1px"
                    borderColor={isFullPayment() ? 'green.200' : 'orange.200'}
                  >
                    <CardBody>
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="gray.700"
                          >
                            Resumen del Pago
                          </Text>
                          <Badge
                            colorScheme={isFullPayment() ? 'green' : 'orange'}
                            variant="solid"
                          >
                            {isFullPayment() ? 'Pago Completo' : 'Pago Parcial'}
                          </Badge>
                        </HStack>
                        <Divider />
                        <HStack justify="space-between" fontSize="sm">
                          <Text color="gray.600">Adeudo actual:</Text>
                          <Text fontWeight="bold">
                            ${selectedSession.remainingDebt.toLocaleString()}{' '}
                            MXN
                          </Text>
                        </HStack>
                        <HStack justify="space-between" fontSize="sm">
                          <Text color="gray.600">Monto a pagar:</Text>
                          <Text fontWeight="bold" color="green.600">
                            ${watchedPaymentAmount.toLocaleString()} MXN
                          </Text>
                        </HStack>
                        <HStack justify="space-between" fontSize="sm">
                          <Text color="gray.600" fontWeight="semibold">
                            {isFullPayment()
                              ? 'Sesión quedará:'
                              : 'Adeudo restante:'}
                          </Text>
                          <Text
                            fontWeight="bold"
                            color={isFullPayment() ? 'green.600' : 'orange.600'}
                          >
                            {isFullPayment()
                              ? 'PAGADA'
                              : `$${getRemainingDebtAfterPayment().toLocaleString()} MXN`}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </>
              )}
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
                loadingText="Registrando pago..."
                spinner={<Spinner size="sm" />}
                disabled={!selectedSession}
              >
                Registrar Pago
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
