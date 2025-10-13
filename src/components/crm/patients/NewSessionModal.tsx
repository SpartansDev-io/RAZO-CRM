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
  Textarea,
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
  Grid,
  GridItem,
  Box,
  Badge,
  Divider,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { FileText, Calendar, Clock, User, Target, Zap, DollarSign, CreditCard, Banknote } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SessionFormData {
  patientId?: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  duration: number;
  patientMood: string;
  sessionNotes: string;
  objectives: string;
  techniques: string;
  homework: string;
  nextSessionPlan: string;
  progress: string;
  paymentType: string;
  customAmount?: number;
  paymentStatus: string;
  paymentMethod?: 'transfer' | 'cash' | 'none';
  paidAmount?: number;
  paymentNotes?: string;
}

interface Patient {
  id: string;
  name: string;
  company?: string;
  lastSession?: Date | null;
}

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  showPatientSelector?: boolean;
}

// Session types
const sessionTypes = [
  { value: 'individual', label: 'Terapia Individual' },
  { value: 'couple', label: 'Terapia de Pareja' },
  { value: 'family', label: 'Terapia Familiar' },
  { value: 'group', label: 'Terapia Grupal' },
  { value: 'evaluation', label: 'Evaluación Psicológica' },
  { value: 'followup', label: 'Seguimiento' },
  { value: 'crisis', label: 'Intervención en Crisis' },
];

// Duration options
const durationOptions = [
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 hora 30 minutos' },
  { value: 120, label: '2 horas' },
];

// Patient mood options
const moodOptions = [
  { value: 'excellent', label: 'Excelente', color: 'green' },
  { value: 'good', label: 'Bueno', color: 'blue' },
  { value: 'neutral', label: 'Neutral', color: 'yellow' },
  { value: 'poor', label: 'Malo', color: 'orange' },
  { value: 'very_poor', label: 'Muy Malo', color: 'red' },
];

// Progress options
const progressOptions = [
  { value: 'significant', label: 'Significativo', color: 'green' },
  { value: 'moderate', label: 'Moderado', color: 'blue' },
  { value: 'minimal', label: 'Mínimo', color: 'yellow' },
  { value: 'none', label: 'Sin cambios', color: 'gray' },
  { value: 'regression', label: 'Retroceso', color: 'red' },
];

const mockPatients: Patient[] = [
  { id: '1', name: 'María González', company: 'Tech Solutions SA', lastSession: new Date('2024-01-15') },
  { id: '2', name: 'Carlos Rodríguez', company: 'Innovate Industries', lastSession: new Date('2024-01-14') },
  { id: '3', name: 'Ana López', company: 'Tech Solutions SA', lastSession: new Date('2024-01-16') },
  { id: '4', name: 'Pedro Martínez', company: 'Tech Solutions SA', lastSession: new Date('2024-01-10') },
  { id: '5', name: 'Laura Sánchez', company: 'Innovate Industries' },
];

interface Contract {
  id: string;
  contractName: string;
  costPerSession: number;
  companyId: string;
  companyName: string;
}

const mockContracts: Contract[] = [
  { id: '1', contractName: 'Contrato Premium - Tech Solutions', costPerSession: 1500, companyId: 'tech-solutions', companyName: 'Tech Solutions SA' },
  { id: '2', contractName: 'Contrato Básico - Tech Solutions', costPerSession: 1000, companyId: 'tech-solutions', companyName: 'Tech Solutions SA' },
  { id: '3', contractName: 'Contrato Ejecutivo - Innovate', costPerSession: 2000, companyId: 'innovate', companyName: 'Innovate Industries' },
  { id: '4', contractName: 'Contrato Estándar - Innovate', costPerSession: 1200, companyId: 'innovate', companyName: 'Innovate Industries' },
];

export default function NewSessionModal({
  isOpen,
  onClose,
  patient,
  showPatientSelector = false,
}: NewSessionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient || null);
  const [availableContracts, setAvailableContracts] = useState<Contract[]>([]);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<SessionFormData>({
    defaultValues: {
      patientId: patient?.id,
      sessionDate: format(new Date(), 'yyyy-MM-dd'),
      sessionTime: format(new Date(), 'HH:mm'),
      sessionType: 'individual',
      duration: 60,
      patientMood: 'good',
      progress: 'moderate',
      paymentType: '',
      paymentStatus: 'pending',
      paymentMethod: 'none',
      paidAmount: 0,
    },
  });

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const foundPatient = mockPatients.find(p => p.id === patientId);
    setSelectedPatient(foundPatient || null);
    setValue('patientId', patientId);

    if (foundPatient?.company) {
      const companyContracts = mockContracts.filter(
        c => c.companyName === foundPatient.company
      );
      setAvailableContracts(companyContracts);
      setValue('paymentType', '');
    } else {
      setAvailableContracts([]);
      setValue('paymentType', '');
    }
    setShowCustomAmount(false);
  };

  const handlePaymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setShowCustomAmount(value === 'other');
    setValue('paymentType', value);
  };

  const watchedMood = watch('patientMood');
  const watchedProgress = watch('progress');
  const watchedPaymentType = watch('paymentType');
  const watchedPaymentStatus = watch('paymentStatus');
  const watchedPaymentMethod = watch('paymentMethod');
  const watchedPaidAmount = watch('paidAmount');
  const watchedCustomAmount = watch('customAmount');

  const getSelectedContractAmount = () => {
    if (watchedPaymentType === 'other' || !watchedPaymentType) return null;
    const contract = mockContracts.find(c => c.id === watchedPaymentType);
    return contract?.costPerSession || null;
  };

  const onSubmit = async (data: SessionFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Registro de sesión creado',
        description: `El registro de la sesión del ${format(new Date(data.sessionDate), 'dd/MM/yyyy', { locale: es })} ha sido guardado exitosamente.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      handleClose();
    } catch (error) {
      toast({
        title: 'Error al guardar el registro',
        description: 'Hubo un problema al guardar el registro de la sesión. Intente nuevamente.',
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
    setSelectedPatient(patient || null);
    setAvailableContracts([]);
    setShowCustomAmount(false);
    onClose();
  };

  const getMoodColor = (mood: string) => {
    const option = moodOptions.find(opt => opt.value === mood);
    return option?.color || 'gray';
  };

  const getProgressColor = (progress: string) => {
    const option = progressOptions.find(opt => opt.value === progress);
    return option?.color || 'gray';
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          <HStack spacing={3}>
            <FileText size={24} color="#3182CE" />
            <Box>
              <Text>Nuevo Registro de Sesión</Text>
              {!showPatientSelector && selectedPatient && (
                <Text fontSize="sm" color="gray.600" fontWeight="normal">
                  Paciente: {selectedPatient.name}
                </Text>
              )}
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Patient Selector (if enabled) */}
              {showPatientSelector && (
                <Box>
                  <FormControl isRequired>
                    <FormLabel>
                      <HStack spacing={2}>
                        <User size={16} />
                        <Text>Paciente</Text>
                      </HStack>
                    </FormLabel>
                    <Select
                      placeholder="Selecciona un paciente"
                      {...register('patientId', { required: showPatientSelector ? 'Seleccione un paciente' : false })}
                      onChange={handlePatientChange}
                      defaultValue={patient?.id}
                    >
                      {mockPatients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.company && `- ${p.company}`}
                        </option>
                      ))}
                    </Select>
                    {errors.patientId && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.patientId.message}
                      </Text>
                    )}
                  </FormControl>

                  {selectedPatient && (
                    <Box mt={3} p={3} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
                      <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                        {selectedPatient.company && (
                          <Box>
                            <Text fontSize="xs" color="gray.600">Empresa</Text>
                            <Text fontSize="sm" fontWeight="medium" color="blue.700">
                              {selectedPatient.company}
                            </Text>
                          </Box>
                        )}
                        {selectedPatient.lastSession && (
                          <Box>
                            <Text fontSize="xs" color="gray.600">Última Sesión</Text>
                            <Text fontSize="sm" fontWeight="medium" color="blue.700">
                              {format(selectedPatient.lastSession, "dd 'de' MMMM, yyyy", { locale: es })}
                            </Text>
                          </Box>
                        )}
                      </Grid>
                    </Box>
                  )}

                  <Divider mt={4} />
                </Box>
              )}

              {/* Session Basic Info */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                  Información Básica de la Sesión
                </Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
                  <FormControl isRequired isInvalid={!!errors.sessionDate}>
                      <HStack spacing={2}>
                        <Calendar size={16} />
                        <FormLabel>Fecha</FormLabel>
                      </HStack>
                    <Input
                      type="date"
                      {...register('sessionDate', { required: 'Seleccione una fecha' })}
                    />
                    {errors.sessionDate && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.sessionDate.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.sessionTime}>
                      <HStack spacing={2}>
                        <Clock size={16} />
                        <FormLabel>Hora</FormLabel>
                      </HStack>
                    <Input
                      type="time"
                      {...register('sessionTime', { required: 'Seleccione una hora' })}
                    />
                    {errors.sessionTime && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.sessionTime.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Duración</FormLabel>
                    <Select {...register('duration', { valueAsNumber: true })}>
                      {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mt={4}>
                  <FormControl isRequired isInvalid={!!errors.sessionType}>
                    <FormLabel>Tipo de Sesión</FormLabel>
                    <Select
                      placeholder="Seleccionar tipo de sesión"
                      {...register('sessionType', { required: 'Seleccione el tipo de sesión' })}
                    >
                      {sessionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                    {errors.sessionType && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.sessionType.message}
                      </Text>
                    )}
                  </FormControl>

                  <Box>
                    <FormLabel>Estado del Paciente</FormLabel>
                    <HStack spacing={4}>
                      <Select {...register('patientMood')}>
                        {moodOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                      <Badge
                        colorScheme={getMoodColor(watchedMood)}
                        variant="solid"
                        px={3}
                        py={1}
                        minW="80px"
                        textAlign="center"
                      >
                        {moodOptions.find(opt => opt.value === watchedMood)?.label}
                      </Badge>
                    </HStack>
                  </Box>
                </Grid>
              </Box>

              <Divider />

              {/* Session Content */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                  Contenido de la Sesión
                </Text>
                
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired isInvalid={!!errors.sessionNotes}>
                    <FormLabel>
                      <HStack spacing={2}>
                        <FileText size={16} />
                        <Text>Notas de la Sesión</Text>
                      </HStack>
                    </FormLabel>
                    <Textarea
                      placeholder="Describe lo que ocurrió durante la sesión, observaciones importantes, respuesta del paciente, etc."
                      rows={4}
                      {...register('sessionNotes', { required: 'Las notas de la sesión son requeridas' })}
                    />
                    {errors.sessionNotes && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.sessionNotes.message}
                      </Text>
                    )}
                  </FormControl>

                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <FormControl>
                      <FormLabel>
                        <HStack spacing={2}>
                          <Target size={16} />
                          <Text>Objetivos Trabajados</Text>
                        </HStack>
                      </FormLabel>
                      <Textarea
                        placeholder="Lista los objetivos terapéuticos que se trabajaron en esta sesión (uno por línea)"
                        rows={3}
                        {...register('objectives')}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>
                        <HStack spacing={2}>
                          <Zap size={16} />
                          <Text>Técnicas Utilizadas</Text>
                        </HStack>
                      </FormLabel>
                      <Textarea
                        placeholder="Enumera las técnicas terapéuticas aplicadas (una por línea)"
                        rows={3}
                        {...register('techniques')}
                      />
                    </FormControl>
                  </Grid>
                </VStack>
              </Box>

              <Divider />

              {/* Follow-up and Progress */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                  Seguimiento y Progreso
                </Text>
                
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Tareas para Casa</FormLabel>
                    <Textarea
                      placeholder="Describe las tareas o ejercicios que el paciente debe realizar antes de la próxima sesión"
                      rows={3}
                      {...register('homework')}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Plan para Próxima Sesión</FormLabel>
                    <Textarea
                      placeholder="Describe lo que planeas trabajar en la siguiente sesión"
                      rows={3}
                      {...register('nextSessionPlan')}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Evaluación del Progreso</FormLabel>
                    <HStack spacing={4}>
                      <Select {...register('progress')}>
                        {progressOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                      <Badge
                        colorScheme={getProgressColor(watchedProgress)}
                        variant="solid"
                        px={3}
                        py={1}
                        minW="100px"
                        textAlign="center"
                      >
                        {progressOptions.find(opt => opt.value === watchedProgress)?.label}
                      </Badge>
                    </HStack>
                  </FormControl>
                </VStack>
              </Box>

              <Divider />

              {/* Payment Section */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                  <HStack spacing={2}>
                    <DollarSign size={20} />
                    <Text>Información de Cobro</Text>
                  </HStack>
                </Text>

                <VStack spacing={4} align="stretch">
                  <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={4}>
                    <FormControl isRequired isInvalid={!!errors.paymentType}>
                      <FormLabel>Tipo de Cobro</FormLabel>
                      <Select
                        placeholder="Selecciona el tipo de cobro"
                        {...register('paymentType', { required: 'Seleccione el tipo de cobro' })}
                        onChange={handlePaymentTypeChange}
                      >
                        {availableContracts.length > 0 && (
                          <optgroup label="Contratos de la Empresa">
                            {availableContracts.map((contract) => (
                              <option key={contract.id} value={contract.id}>
                                {contract.contractName} - ${contract.costPerSession.toLocaleString()} MXN
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <option value="other">Otro (Monto Manual)</option>
                      </Select>
                      {errors.paymentType && (
                        <Text fontSize="sm" color="red.500" mt={1}>
                          {errors.paymentType.message}
                        </Text>
                      )}
                      {!selectedPatient?.company && (
                        <Text fontSize="xs" color="orange.600" mt={1}>
                          Selecciona un paciente para ver los contratos disponibles
                        </Text>
                      )}
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>
                        <HStack spacing={2}>
                          <CreditCard size={16} />
                          <Text>Método de Pago</Text>
                        </HStack>
                      </FormLabel>
                      <Select
                        {...register('paymentMethod')}
                        onChange={(e) => {
                          const method = e.target.value as 'transfer' | 'cash' | 'none';
                          setValue('paymentMethod', method);
                          if (method === 'none') {
                            setValue('paymentStatus', 'pending');
                            setValue('paidAmount', 0);
                          } else {
                            const sessionCost = getSelectedContractAmount() || watchedCustomAmount || 0;
                            setValue('paidAmount', sessionCost);
                          }
                        }}
                      >
                        <option value="none">Pendiente de pago</option>
                        <option value="transfer">Transferencia</option>
                        <option value="cash">Efectivo</option>
                      </Select>
                    </FormControl>
                  </Grid>

                  {showCustomAmount && (
                    <FormControl isRequired={showCustomAmount} isInvalid={!!errors.customAmount}>
                      <FormLabel>Monto Personalizado (Costo de Sesión)</FormLabel>
                      <HStack>
                        <Text fontSize="lg" color="gray.600">$</Text>
                        <Input
                          type="number"
                          placeholder="Ingresa el monto"
                          {...register('customAmount', {
                            required: showCustomAmount ? 'Ingrese el monto' : false,
                            min: { value: 0, message: 'El monto debe ser mayor a 0' },
                            valueAsNumber: true,
                          })}
                        />
                        <Text fontSize="lg" color="gray.600">MXN</Text>
                      </HStack>
                      {errors.customAmount && (
                        <Text fontSize="sm" color="red.500" mt={1}>
                          {errors.customAmount.message}
                        </Text>
                      )}
                    </FormControl>
                  )}

                  {/* Payment Amount - Only show if payment method is selected */}
                  {watchedPaymentMethod !== 'none' && (getSelectedContractAmount() || watchedCustomAmount) && (
                    <FormControl isRequired isInvalid={!!errors.paidAmount}>
                      <FormLabel>
                        <HStack spacing={2}>
                          <Banknote size={16} />
                          <Text>Monto Pagado</Text>
                        </HStack>
                      </FormLabel>
                      <HStack>
                        <Text fontSize="lg" color="gray.600">$</Text>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...register('paidAmount', {
                            required: 'El monto pagado es requerido',
                            min: { value: 0.01, message: 'El monto debe ser mayor a 0' },
                            max: {
                              value: getSelectedContractAmount() || watchedCustomAmount || 0,
                              message: 'El monto no puede exceder el costo de la sesión'
                            },
                            valueAsNumber: true,
                          })}
                        />
                        <Text fontSize="lg" color="gray.600">MXN</Text>
                      </HStack>
                      {errors.paidAmount && (
                        <Text fontSize="sm" color="red.500" mt={1}>
                          {errors.paidAmount.message}
                        </Text>
                      )}
                      {(getSelectedContractAmount() || watchedCustomAmount) && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Costo de sesión: ${(getSelectedContractAmount() || watchedCustomAmount || 0).toLocaleString()} MXN
                        </Text>
                      )}
                      {watchedPaidAmount && watchedPaidAmount > 0 && watchedPaidAmount < (getSelectedContractAmount() || watchedCustomAmount || 0) && (
                        <Badge colorScheme="orange" mt={2} fontSize="xs">
                          Pago Parcial - Adeudo: ${((getSelectedContractAmount() || watchedCustomAmount || 0) - watchedPaidAmount).toLocaleString()} MXN
                        </Badge>
                      )}
                      {watchedPaidAmount && watchedPaidAmount === (getSelectedContractAmount() || watchedCustomAmount) && (
                        <Badge colorScheme="green" mt={2} fontSize="xs">
                          Pago Completo
                        </Badge>
                      )}
                    </FormControl>
                  )}

                  {/* Payment Notes */}
                  {watchedPaymentMethod !== 'none' && (
                    <FormControl>
                      <FormLabel>Notas de Pago (opcional)</FormLabel>
                      <Input
                        placeholder="Ej: Referencia de transferencia, número de recibo, etc."
                        {...register('paymentNotes')}
                      />
                    </FormControl>
                  )}

                  {/* Payment Summary */}
                  {(getSelectedContractAmount() || watchedCustomAmount) && (
                    <Card
                      bg={watchedPaymentMethod === 'none' ? 'orange.50' : 'green.50'}
                      borderWidth="1px"
                      borderColor={watchedPaymentMethod === 'none' ? 'orange.200' : 'green.200'}
                    >
                      <CardBody>
                        <VStack spacing={2} align="stretch">
                          <HStack justify="space-between">
                            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                              {watchedPaymentMethod === 'none' ? 'Estado: Pendiente de Pago' : 'Estado: Pago Registrado'}
                            </Text>
                            <Badge
                              colorScheme={watchedPaymentMethod === 'none' ? 'orange' : 'green'}
                              variant="solid"
                              px={3}
                              py={1}
                            >
                              {watchedPaymentMethod === 'none'
                                ? 'Pendiente'
                                : watchedPaymentMethod === 'transfer'
                                ? 'Transferencia'
                                : 'Efectivo'}
                            </Badge>
                          </HStack>
                          <Divider />
                          <HStack justify="space-between" fontSize="sm">
                            <Text color="gray.600">Costo de sesión:</Text>
                            <Text fontWeight="bold">
                              ${(getSelectedContractAmount() || watchedCustomAmount || 0).toLocaleString()} MXN
                            </Text>
                          </HStack>
                          {watchedPaymentMethod !== 'none' && watchedPaidAmount !== undefined && (
                            <>
                              <HStack justify="space-between" fontSize="sm">
                                <Text color="gray.600">Monto pagado:</Text>
                                <Text fontWeight="bold" color="green.600">
                                  ${(watchedPaidAmount || 0).toLocaleString()} MXN
                                </Text>
                              </HStack>
                              {watchedPaidAmount < (getSelectedContractAmount() || watchedCustomAmount || 0) && (
                                <HStack justify="space-between" fontSize="sm">
                                  <Text color="orange.600">Adeudo restante:</Text>
                                  <Text fontWeight="bold" color="orange.600">
                                    ${((getSelectedContractAmount() || watchedCustomAmount || 0) - watchedPaidAmount).toLocaleString()} MXN
                                  </Text>
                                </HStack>
                              )}
                            </>
                          )}
                          {watchedPaymentMethod === 'none' && (
                            <HStack justify="space-between" fontSize="sm">
                              <Text color="orange.600">Adeudo total:</Text>
                              <Text fontWeight="bold" color="orange.600">
                                ${(getSelectedContractAmount() || watchedCustomAmount || 0).toLocaleString()} MXN
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              </Box>

              {/* Confidentiality Note */}
              <Box bg="blue.50" p={4} borderRadius="md" borderWidth="1px" borderColor="blue.200">
                <Text fontSize="xs" color="blue.700" lineHeight="1.6">
                  <strong>Nota de Confidencialidad:</strong> Esta información es confidencial y forma parte del expediente clínico del paciente.
                  Asegúrate de que todos los datos sean precisos y completos. El acceso a esta información está protegido por las leyes de privacidad médica.
                </Text>
              </Box>
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
                loadingText="Guardando registro..."
                spinner={<Spinner size="sm" />}
                disabled={!isValid}
              >
                Guardar Registro
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}