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
  Radio,
  RadioGroup,
  Stack,
  Checkbox,
} from '@chakra-ui/react';
import { DollarSign, CreditCard, Banknote, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PendingSession {
  id: string;
  sessionDate: Date;
  amount: number;
  contractName?: string;
  sessionType: string;
}

interface PaymentFormData {
  paymentDate: string;
  paymentMethod: 'transfer' | 'cash';
  amount: number;
  notes?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingSessions: PendingSession[];
  patientName: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  pendingSessions,
  patientName,
}: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<PaymentFormData>({
    defaultValues: {
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'transfer',
      amount: 0,
    },
  });

  const watchedAmount = watch('amount');
  const watchedPaymentMethod = watch('paymentMethod');

  const totalDebt = pendingSessions.reduce((sum, session) => sum + session.amount, 0);
  const selectedTotal = Array.from(selectedSessions).reduce((sum, sessionId) => {
    const session = pendingSessions.find(s => s.id === sessionId);
    return sum + (session?.amount || 0);
  }, 0);

  const handleSessionToggle = (sessionId: string) => {
    const newSelected = new Set(selectedSessions);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedSessions(newSelected);

    const newTotal = Array.from(newSelected).reduce((sum, id) => {
      const session = pendingSessions.find(s => s.id === id);
      return sum + (session?.amount || 0);
    }, 0);
    setValue('amount', newTotal);
  };

  const handleSelectAll = () => {
    if (selectedSessions.size === pendingSessions.length) {
      setSelectedSessions(new Set());
      setValue('amount', 0);
    } else {
      const allIds = new Set(pendingSessions.map(s => s.id));
      setSelectedSessions(allIds);
      setValue('amount', totalDebt);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (selectedSessions.size === 0 && data.amount === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona al menos una sesión o ingresa un monto',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const paymentDetails = {
        patientName,
        selectedSessions: Array.from(selectedSessions),
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        notes: data.notes,
        isPartialPayment: data.amount < selectedTotal,
        selectedTotal,
        totalDebt,
      };

      console.log('Registrando pago:', paymentDetails);

      toast({
        title: 'Pago Registrado',
        description: `Se registró un pago de $${data.amount.toLocaleString()} MXN por ${data.paymentMethod === 'transfer' ? 'transferencia' : 'efectivo'}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo registrar el pago. Intenta nuevamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedSessions(new Set());
    onClose();
  };

  const getPaymentMethodLabel = (method: string) => {
    return method === 'transfer' ? 'Transferencia Bancaria' : 'Efectivo';
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            <HStack spacing={2}>
              <DollarSign size={24} color="#3182CE" />
              <Text>Registrar Pago</Text>
            </HStack>
            <Text fontSize="sm" fontWeight="normal" color="gray.600" mt={2}>
              {patientName}
            </Text>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Debt Summary */}
              <Card bg="orange.50" borderWidth="1px" borderColor="orange.200">
                <CardBody>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        Adeudo Total:
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="orange.700">
                        ${totalDebt.toLocaleString()} MXN
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.600">
                      {pendingSessions.length} sesión(es) pendiente(s)
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              {/* Pending Sessions Selection */}
              <Box>
                <HStack justify="space-between" mb={3}>
                  <FormLabel mb={0}>Sesiones a Pagar</FormLabel>
                  <Button size="xs" variant="link" colorScheme="blue" onClick={handleSelectAll}>
                    {selectedSessions.size === pendingSessions.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                  </Button>
                </HStack>
                <VStack spacing={2} align="stretch">
                  {pendingSessions.map((session) => (
                    <Card
                      key={session.id}
                      borderWidth="2px"
                      borderColor={selectedSessions.has(session.id) ? 'blue.400' : 'gray.200'}
                      bg={selectedSessions.has(session.id) ? 'blue.50' : 'white'}
                      cursor="pointer"
                      onClick={() => handleSessionToggle(session.id)}
                      _hover={{ borderColor: 'blue.300' }}
                      transition="all 0.2s"
                    >
                      <CardBody p={3}>
                        <HStack spacing={3} align="center">
                          <Checkbox
                            isChecked={selectedSessions.has(session.id)}
                            onChange={() => handleSessionToggle(session.id)}
                            colorScheme="blue"
                          />
                          <VStack spacing={0} align="start" flex="1">
                            <Text fontSize="sm" fontWeight="medium">
                              {format(session.sessionDate, 'dd MMMM yyyy', { locale: es })}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {session.sessionType}
                            </Text>
                            {session.contractName && (
                              <Text fontSize="xs" color="gray.500">
                                {session.contractName}
                              </Text>
                            )}
                          </VStack>
                          <Text fontSize="md" fontWeight="bold" color="blue.700">
                            ${session.amount.toLocaleString()}
                          </Text>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </Box>

              <Divider />

              {/* Payment Details */}
              <Box>
                <Text fontSize="md" fontWeight="semibold" mb={4}>
                  Detalles del Pago
                </Text>

                <VStack spacing={4} align="stretch">
                  {/* Payment Date */}
                  <FormControl isRequired isInvalid={!!errors.paymentDate}>
                    <FormLabel>Fecha de Pago</FormLabel>
                    <Input
                      type="date"
                      {...register('paymentDate', { required: 'La fecha es requerida' })}
                    />
                    {errors.paymentDate && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.paymentDate.message}
                      </Text>
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
                    <RadioGroup
                      value={watchedPaymentMethod}
                      onChange={(value) => setValue('paymentMethod', value as 'transfer' | 'cash')}
                    >
                      <Stack direction="row" spacing={6}>
                        <Radio value="transfer" colorScheme="blue">
                          <HStack spacing={2}>
                            <CreditCard size={16} />
                            <Text>Transferencia</Text>
                          </HStack>
                        </Radio>
                        <Radio value="cash" colorScheme="green">
                          <HStack spacing={2}>
                            <Banknote size={16} />
                            <Text>Efectivo</Text>
                          </HStack>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  {/* Payment Amount */}
                  <FormControl isRequired isInvalid={!!errors.amount}>
                    <FormLabel>Monto a Pagar</FormLabel>
                    <HStack>
                      <Text fontSize="lg" color="gray.600">$</Text>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...register('amount', {
                          required: 'El monto es requerido',
                          min: { value: 0.01, message: 'El monto debe ser mayor a 0' },
                          max: { value: selectedTotal || totalDebt, message: 'El monto excede el total seleccionado' },
                        })}
                      />
                      <Text fontSize="lg" color="gray.600">MXN</Text>
                    </HStack>
                    {errors.amount && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.amount.message}
                      </Text>
                    )}
                    {selectedTotal > 0 && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Total seleccionado: ${selectedTotal.toLocaleString()} MXN
                      </Text>
                    )}
                    {watchedAmount > 0 && watchedAmount < selectedTotal && (
                      <Badge colorScheme="orange" mt={2} fontSize="xs">
                        Pago Parcial - Restante: ${(selectedTotal - watchedAmount).toLocaleString()} MXN
                      </Badge>
                    )}
                  </FormControl>

                  {/* Payment Notes */}
                  <FormControl>
                    <FormLabel>Notas (opcional)</FormLabel>
                    <Input
                      placeholder="Ej: Referencia de transferencia, número de recibo, etc."
                      {...register('notes')}
                    />
                  </FormControl>
                </VStack>
              </Box>

              {/* Payment Summary */}
              {watchedAmount > 0 && (
                <Card bg="green.50" borderWidth="1px" borderColor="green.200">
                  <CardBody>
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                          Resumen del Pago
                        </Text>
                        <Badge colorScheme="green" variant="solid">
                          {getPaymentMethodLabel(watchedPaymentMethod)}
                        </Badge>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Monto a registrar:</Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.700">
                          ${watchedAmount.toLocaleString()} MXN
                        </Text>
                      </HStack>
                      {selectedSessions.size > 0 && (
                        <Text fontSize="xs" color="gray.600">
                          Aplicado a {selectedSessions.size} sesión(es)
                        </Text>
                      )}
                      {watchedAmount < totalDebt && (
                        <HStack justify="space-between">
                          <Text fontSize="xs" color="orange.600">Adeudo restante:</Text>
                          <Text fontSize="sm" fontWeight="semibold" color="orange.700">
                            ${(totalDebt - watchedAmount).toLocaleString()} MXN
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="green"
                isLoading={isLoading}
                loadingText="Registrando pago..."
                spinner={<Spinner size="sm" />}
                leftIcon={<CheckCircle size={16} />}
                disabled={!isValid || watchedAmount === 0}
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
